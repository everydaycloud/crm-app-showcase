from datetime import datetime
from uuid import UUID

from pydantic import BaseModel
from quart_db import Connection
from sql_tstring import Absent, AbsentType, sql


class Member(BaseModel):
    id: UUID
    gc_id: str | None
    first_name: str
    last_name: str
    email: str
    note: str | None
    phone_number: str | None
    file_key: UUID | None
    created: datetime


async def select_member_by_email(
    connection: Connection,
    *,
    email: str,
) -> Member | None:
    query, values = sql(
        """SELECT id, gc_id, first_name, last_name, email,
                  phone_number, file_key, created, note
             FROM members
            WHERE LOWER(email) = LOWER({email})
        """,
        locals(),
    )
    result = await connection.fetch_one(query, values)
    return None if result is None else Member(**result)


async def select_member_by_id(
    connection: Connection,
    *,
    id: UUID | AbsentType = Absent,
    gc_id: str | AbsentType = Absent,
) -> Member | None:
    query, values = sql(
        """SELECT id, gc_id, first_name, last_name, email,
                  phone_number, file_key, created, note
             FROM members
            WHERE id = {id}
                  AND gc_id = {gc_id}
        """,
        locals(),
    )
    result = await connection.fetch_one(query, values)
    return None if result is None else Member(**result)


async def select_members(
    connection: Connection,
) -> list[Member]:
    query, values = sql(
        """SELECT id, gc_id, first_name, last_name, email,
                  phone_number, file_key, created, note
             FROM members""",
        locals(),
    )
    return [Member(**row) async for row in connection.iterate(query, values)]


async def insert_member(
    connection: Connection,
    *,
    gc_id: str | None = None,
    first_name: str,
    last_name: str,
    email: str,
    phone_number: str | None = None,
    created: datetime,
) -> Member:
    query, values = sql(
        """INSERT INTO members (gc_id, first_name, last_name, email, phone_number,
                       created)
                VALUES ({gc_id}, {first_name}, {last_name}, {email}, {phone_number},
                       {created})
             RETURNING id, gc_id, first_name, last_name, email, phone_number,
                       file_key, created, note""",
        locals(),
    )
    result = await connection.fetch_one(query, values)
    if result is None:
        raise ValueError("Expected a result, but got None")
    return Member(**result)


async def update_member(
    connection: Connection,
    *,
    id: UUID,
    first_name: str | AbsentType = Absent,
    last_name: str | AbsentType = Absent,
    email: str | AbsentType = Absent,
    phone_number: str | None | AbsentType = Absent,
    file_key: UUID | AbsentType = Absent,
    note: str | None | AbsentType = Absent,
) -> Member:
    query, values = sql(
        """UPDATE members
              SET first_name = {first_name},
                  last_name = {last_name},
                  email = {email},
                  phone_number = {phone_number},
                  file_key = {file_key},
                  note = {note}
            WHERE id = {id}
        RETURNING id, gc_id, first_name, last_name, email, phone_number,
                  file_key, created, note""",
        locals(),
    )
    result = await connection.fetch_one(query, values)
    if result is None:
        raise ValueError("Expected a result, but got None")
    return Member(**result)
