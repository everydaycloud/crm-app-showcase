from datetime import datetime
from uuid import UUID

from pydantic import BaseModel
from quart_db import Connection
from sql_tstring import sql


class Staff(BaseModel):
    id: UUID
    email: str
    password_hash: str
    created: datetime
    email_verified: datetime | None


async def select_staff_by_email(connection: Connection, email: str) -> Staff | None:
    query, values = sql(
        """SELECT id, email, password_hash, created, email_verified
             FROM staff
            WHERE LOWER(email) = LOWER({email})""",
        locals(),
    )
    result = await connection.fetch_one(query, values)
    return None if result is None else Staff(**result)


async def select_all_staff(connection: Connection) -> list[Staff]:
    query = """SELECT id, email, password_hash, created, email_verified
             FROM staff"""
    return [Staff(**row) async for row in connection.iterate(query)]


async def select_staff_by_id(connection: Connection, id: UUID) -> Staff | None:
    query, values = sql(
        """SELECT id, email, password_hash, created, email_verified
             FROM staff
            WHERE id = {id}""",
        locals(),
    )
    result = await connection.fetch_one(query, values)
    return None if result is None else Staff(**result)


async def insert_staff(connection: Connection, email: str, password_hash: str) -> Staff:
    query, values = sql(
        """INSERT INTO staff (email, password_hash)
                VALUES ({email}, {password_hash})
             RETURNING id, email, password_hash, created,
                       email_verified""",
        locals(),
    )
    result = await connection.fetch_one(query, values)
    if result is None:
        raise ValueError("Expected a result, but got None")
    return Staff(**result)


async def update_staff_password(
    connection: Connection, id: UUID, password_hash: str
) -> None:
    query, values = sql(
        """UPDATE staff
              SET password_hash = {password_hash}
            WHERE id = {id}""",
        locals(),
    )
    await connection.execute(query, values)


async def update_staff_email_verified(connection: Connection, id: UUID) -> None:
    query, values = sql(
        "UPDATE staff SET email_verified = now() WHERE id = {id}",
        locals(),
    )
    await connection.execute(query, values)
