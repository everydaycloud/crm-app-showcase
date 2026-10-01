import logging
from datetime import datetime
from typing import cast
from uuid import UUID

import gocardless_pro
from gocardless_pro import Client, webhooks
from gocardless_pro.errors import InvalidSignatureError
from gocardless_pro.resources import Customer, Event, Mandate, Payment
from quart import Blueprint, ResponseReturnValue, current_app, g, request
from quart_db import Connection
from quart_schema import hide
from sql_tstring import Absent, AbsentType, sql

from backend.models.mandate import (
    MandateStatus,
    PaymentStatus,
    insert_mandate,
    select_mandate,
    update_mandate,
)
from backend.models.member import Member, insert_member, select_member_by_id

log = logging.getLogger(__name__)

blueprint = Blueprint("gc_webhook", __name__)


def get_gocardless_client() -> gocardless_pro.Client:
    access_token = current_app.config["GC_ACCESS_TOKEN"]
    env = current_app.config["GC_ENVIRONMENT"]
    return gocardless_pro.Client(access_token=access_token, environment=env)


async def run_gocardless(func, *args, **kwargs):
    return await current_app.ensure_async(func)(*args, **kwargs)


@blueprint.post("/gc-webhook/")
@hide
async def gc_webhook() -> ResponseReturnValue:
    client = get_gocardless_client()
    secret = cast(str, current_app.config["GC_WEBHOOK_SECRET"])
    sig_header = request.headers.get("Webhook-Signature")
    if not sig_header:
        return {"success": False}, 400

    try:
        body = (await request.get_data()).strip()
        events = webhooks.parse(body, secret, sig_header)
    except InvalidSignatureError:
        return {"success": False}, 498

    if not events:
        return {"success": False}, 400

    for event in events:
        if event.resource_type == "mandates" and event.action == "created":
            await _handle_mandate_created(g.connection, client, event)
        elif event.resource_type == "mandates" and event.action == "cancelled":
            await _handle_mandate_cancelled(g.connection, event)
        elif event.resource_type == "payments" and event.action == "confirmed":
            await _handle_payment_confirmed(g.connection, client, event)
        elif event.resource_type == "payments" and event.action == "failed":
            await _handle_payment_failed(g.connection, client, event)
        elif event.resource_type == "payments" and event.action == "cancelled":
            await _handle_payment_cancelled(g.connection, client, event)
        else:
            log.error("Unexpected goCardless event %r", event)

    return {"success": True}, 200


async def _handle_mandate_created(
    connection: Connection, client: Client, event: Event
) -> None:
    mandate: Mandate = await run_gocardless(client.mandates.get, event.links.mandate)
    if mandate is None:
        raise ValueError(f"Mandate not found for {event.links.mandate}")

    existing_mandate = await select_mandate(connection, gc_id=event.links.mandate)
    existing_member = await select_member_by_id(
        connection, gc_id=mandate.links.customer
    )

    async with connection.transaction():
        if existing_member is None:
            customer: Customer = await run_gocardless(
                client.customers.get, mandate.links.customer
            )
            assert customer is not None
            member_created_at = datetime.fromisoformat(
                (customer.created_at).replace("Z", "+00:00")
            )
            member = await insert_member(
                connection,
                gc_id=customer.id,
                first_name=customer.given_name,
                last_name=customer.family_name,
                email=customer.email,
                phone_number=None,
                created=member_created_at.replace(tzinfo=None),
            )
        if existing_mandate is None:
            mandate_created_at = datetime.fromisoformat(
                (mandate.created_at).replace("Z", "+00:00")
            )
            mandate = await insert_mandate(
                connection,
                gc_id=event.links.mandate,
                member_id=(
                    existing_member.id if existing_member is not None else member.id
                ),
                created=mandate_created_at.replace(tzinfo=None),
                payment_status=PaymentStatus.PAID,
                status=MandateStatus.ACTIVE,
            )


async def _handle_mandate_cancelled(connection: Connection, event: Event) -> None:
    member = await _get_member_by_mandate_id(
        connection, mandate_gc_id=event.links.mandate
    )
    if member is None:
        raise ValueError(f"Member not found for mandate {event.links.mandate}")

    await update_mandate(
        connection, gc_id=event.links.mandate, status=MandateStatus.CANCELLED
    )


async def _get_member_by_mandate_id(
    connection: Connection,
    *,
    mandate_id: UUID | AbsentType = Absent,
    mandate_gc_id: str | AbsentType = Absent,
) -> Member | None:
    query, values = sql(
        """SELECT ms.id, ms.gc_id, ms.first_name, ms.last_name, ms.email,
                  ms.phone_number, ms.file_key, ms.created, ms.note
             FROM members ms
        LEFT JOIN mandates md ON md.member_id = ms.id
            WHERE md.id = {mandate_id}
                  AND md.gc_id = {mandate_gc_id}
        """,
        locals(),
    )
    result = await connection.fetch_one(query, values)
    return None if result is None else Member(**result)


async def _handle_payment_confirmed(
    connection: Connection, client: Client, event: Event
) -> None:
    payment: Payment = await run_gocardless(client.payments.get, event.links.payment)
    if payment is None:
        raise ValueError(f"Payment not found {event.links.payment}")
    if payment.status != "confirmed":
        return

    mandate = await select_mandate(connection, gc_id=payment.links.mandate)
    if mandate is None:
        raise ValueError(f"Mandate not found {payment.links.mandate}")

    if mandate.payment_status == PaymentStatus.UNPAID:
        await update_mandate(
            connection, gc_id=payment.links.mandate, payment_status=PaymentStatus.PAID
        )


async def _handle_payment_failed(
    connection: Connection, client: Client, event: Event
) -> None:
    payment: Payment = await run_gocardless(client.payments.get, event.links.payment)
    if payment is None:
        raise ValueError(f"Payment not found {event.links.payment}")
    if payment.status != "failed":
        return

    mandate = await select_mandate(connection, gc_id=payment.links.mandate)
    if mandate is None:
        raise ValueError(f"Mandate not found {payment.links.mandate}")

    await update_mandate(
        connection, gc_id=payment.links.mandate, payment_status=PaymentStatus.UNPAID
    )


async def _handle_payment_cancelled(
    connection: Connection, client: Client, event: Event
) -> None:
    payment: Payment = await run_gocardless(client.payments.get, event.links.payment)
    assert payment is not None
    if payment.status != "cancelled":
        return

    mandate = await select_mandate(connection, gc_id=payment.links.mandate)
    if mandate is None:
        raise ValueError(f"Mandate not found {payment.links.mandate}")

    await update_mandate(
        connection, gc_id=payment.links.mandate, payment_status=PaymentStatus.UNPAID
    )
