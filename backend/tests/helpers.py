from contextlib import asynccontextmanager
from typing import AsyncGenerator

import bcrypt
from quart import Quart
from quart.typing import TestClientProtocol
from quart_db import Connection

from backend.models.staff import insert_staff


@asynccontextmanager
async def staff_authenticated(
    test_client: TestClientProtocol,
    connection: Connection,
    app: Quart,
) -> AsyncGenerator[TestClientProtocol, None]:
    data = {
        "email": "staff@example.com",
        "password": "testPassword2$",
    }

    email = data["email"]
    password = data["password"]
    await connection.execute("DELETE FROM staff WHERE email = :email", {"email": email})

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(14),
    )
    await insert_staff(
        connection,
        email,
        hashed_password.decode(),
    )
    await test_client.post("/v1/sessions/", json=data)

    yield test_client
