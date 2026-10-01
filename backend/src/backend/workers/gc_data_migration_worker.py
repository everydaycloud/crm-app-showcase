import logging
import os
from datetime import datetime
from uuid import UUID

import gocardless_pro
from gocardless_pro.resources import Customer
from gocardless_pro.resources import Mandate as GCMandate
from quart import current_app, g
from quart_db import Connection
from sql_tstring import sql

from backend.lib.tasks import tasks
from backend.models.mandate import Mandate, MandateStatus, PaymentStatus
from backend.models.member import Member

log = logging.getLogger(__name__)


def get_gocardless_client() -> gocardless_pro.Client:
    access_token = os.getenv("CRM_GC_ACCESS_TOKEN")
    env = os.getenv("CRM_GC_ENVIRONMENT", "live")
    return gocardless_pro.Client(access_token=access_token, environment=env)


async def _list_all_customers(client: gocardless_pro.Client) -> list[Customer]:
    customers: list[Customer] = []
    before: str | None = None

    while True:
        params = {"limit": 500}
        if before:
            params["before"] = before  # type:ignore

        response = client.customers.list(params=params)

        if not response.records:
            break

        customers.extend(response.records)

        # move the cursor further back in time
        before = response.records[-1].id

    return customers


async def _list_customer_mandates(
    client: gocardless_pro.Client, customer_id: str
) -> list[GCMandate]:
    mandates = []
    response = await current_app.ensure_async(client.mandates.list)(
        params={"customer": customer_id}
    )
    mandates.extend(response.records)

    while response.after:
        response = await current_app.ensure_async(client.mandates.list)(
            params={"customer": customer_id}, after=response.after
        )
        mandates.extend(response.records)

    return mandates


async def upsert_member(
    connection: Connection,
    *,
    gc_id: str,
    first_name: str,
    last_name: str,
    email: str,
    phone_number: str | None = None,
    created: datetime,
) -> Member | None:
    query, values = sql(
        """INSERT INTO members (gc_id, first_name, last_name, email, phone_number,
                       created)
                VALUES ({gc_id}, {first_name}, {last_name}, {email}, {phone_number},
                       {created})
           ON CONFLICT (gc_id)
            DO NOTHING
             RETURNING id, gc_id, first_name, last_name, email, phone_number,
                       file_key, created, note""",
        locals(),
    )
    result = await connection.fetch_one(query, values)
    if result is None:
        log.warning(f"There was a member insert conflict for gc_id {gc_id}")
    return Member(**result) if result is not None else None


async def upsert_mandate(
    connection: Connection,
    *,
    gc_id: str,
    member_id: UUID,
    created: datetime,
    payment_status: PaymentStatus,
    status: MandateStatus,
) -> Mandate | None:
    query, values = sql(
        """INSERT INTO mandates (gc_id, created, member_id, payment_status, status)
                VALUES ({gc_id}, {created}, {member_id},
                       {payment_status}, {status})
             RETURNING id, gc_id, created, member_id, payment_status, status""",
        locals(),
    )
    result = await connection.fetch_one(query, values)
    if result is None:
        log.warning(f"There was a mandate insert conflict for gc_id {gc_id}")
    return Mandate(**result) if result is not None else None


def _determine_payment_status(gc_mandate_status: str) -> PaymentStatus:
    if gc_mandate_status == "failed":
        return PaymentStatus.UNPAID
    else:
        return PaymentStatus.PAID


@tasks.cron("31 10 * * *")
async def migrate_customers_and_mandates_worker() -> None:
    client = get_gocardless_client()
    customers: list[Customer] = await _list_all_customers(client)

    async with g.connection.transaction():
        for customer in customers:
            member_created_at = datetime.fromisoformat(
                customer.created_at.replace("Z", "+00:00")
            )
            member = await upsert_member(
                g.connection,
                gc_id=customer.id,
                first_name=customer.given_name,
                last_name=customer.family_name,
                email=customer.email,
                phone_number=None,
                created=member_created_at.replace(tzinfo=None),
            )

            if member is None or member.gc_id is None:
                continue

            customer_mandates = await _list_customer_mandates(
                client, customer_id=member.gc_id
            )
            for mandate in customer_mandates:
                mandate_created_at = datetime.fromisoformat(
                    mandate.created_at.replace("Z", "+00:00")
                )
                payment_status = _determine_payment_status(mandate.status)
                await upsert_mandate(
                    g.connection,
                    gc_id=mandate.id,
                    member_id=member.id,
                    created=mandate_created_at.replace(tzinfo=None),
                    payment_status=payment_status,
                    status=(
                        MandateStatus.ACTIVE
                        if mandate.status == "active"
                        else MandateStatus.CANCELLED
                    ),
                )
