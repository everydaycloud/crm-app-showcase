from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel
from quart_db import Connection
from sql_tstring import Absent, AbsentType, sql


class MandateStatus(Enum):
    ACTIVE = "ACTIVE"
    CANCELLED = "CANCELLED"
    PENDING = "PENDING"


class PaymentStatus(Enum):
    PAID = "PAID"
    UNPAID = "UNPAID"
    PAYS_CASH = "PAYS_CASH"  # used only as calculated value


class Mandate(BaseModel):
    id: UUID
    gc_id: str
    created: datetime
    member_id: UUID
    payment_status: PaymentStatus
    status: MandateStatus


async def select_mandates(
    connection: Connection,
    id: UUID | AbsentType = Absent,
    member_id: UUID | AbsentType = Absent,
) -> list[Mandate]:
    query, values = sql(
        """SELECT id, gc_id, created, member_id, status, payment_status
             FROM mandates
            WHERE id = {id}
                  AND member_id = {member_id}
        """,
        locals(),
    )
    return [Mandate(**row) async for row in connection.iterate(query, values)]


async def select_mandate(
    connection: Connection,
    *,
    id: UUID | AbsentType = Absent,
    gc_id: str | AbsentType = Absent,
) -> Mandate | None:
    query, values = sql(
        """SELECT id, gc_id, created, member_id, status, payment_status
             FROM mandates
            WHERE id = {id}
                  AND gc_id = {gc_id}
        """,
        locals(),
    )
    result = await connection.fetch_one(query, values)
    return Mandate(**result) if result is not None else None


async def insert_mandate(
    connection: Connection,
    *,
    gc_id: str,
    member_id: UUID,
    created: datetime,
    payment_status: PaymentStatus,
    status: MandateStatus,
) -> Mandate:
    query, values = sql(
        """INSERT INTO mandates (gc_id, created, member_id, payment_status, status)
                VALUES ({gc_id}, {created}, {member_id},
                       {payment_status}, {status})
             RETURNING id, gc_id, created, member_id, payment_status, status""",
        locals(),
    )
    result = await connection.fetch_one(query, values)
    if result is None:
        raise ValueError("Expected a result, but got None")
    return Mandate(**result)


async def update_mandate(
    connection: Connection,
    *,
    id: UUID | AbsentType = Absent,
    gc_id: str | AbsentType = Absent,
    payment_status: PaymentStatus | AbsentType = Absent,
    status: MandateStatus | AbsentType = Absent,
) -> Mandate:
    query, values = sql(
        """UPDATE mandates
            SET payment_status = {payment_status},
                status = {status}
          WHERE gc_id = {gc_id}
                AND id = {id}
      RETURNING id, gc_id, created, member_id, payment_status, status
        """,
        locals(),
    )
    result = await connection.fetch_one(query, values)
    if result is None:
        raise ValueError("Expected a result, but got None")
    return Mandate(**result)
