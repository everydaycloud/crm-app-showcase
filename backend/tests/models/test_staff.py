import pytest
from asyncpg.exceptions import UniqueViolationError  # type: ignore
from quart_db import Connection

from backend.models.staff import insert_staff, select_staff_by_email


async def test_insert_staff(connection: Connection) -> None:
    await insert_staff(connection, "casing@oxfordbjj.com", "")
    with pytest.raises(UniqueViolationError):
        await insert_staff(connection, "Casing@oxfordbjj.com", "")


async def test_select_staff_by_email(connection: Connection) -> None:
    await insert_staff(connection, "casing@oxfordbjj.com", "")
    staff = await select_staff_by_email(connection, "Casing@oxfordbjj.com")
    assert staff is not None
