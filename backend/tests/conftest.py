from typing import AsyncGenerator

import pytest
from quart import Quart
from quart.typing import TestClientProtocol
from quart_db import Connection

from backend.run import create_app, quart_db
from tests.helpers import staff_authenticated

TestClientProtocol.__test__ = False  # type: ignore


@pytest.fixture(name="app", scope="function")
async def _app() -> AsyncGenerator[Quart, None]:
    app = create_app()
    async with app.test_app():
        yield app


@pytest.fixture(name="connection", autouse=True, scope="function")
async def _connection(app: Quart) -> AsyncGenerator[Connection, None]:
    async with quart_db.connection() as connection:
        async with connection.transaction(force_rollback=True):
            yield connection


@pytest.fixture(scope="function")
async def staff_authenticated_client(
    app: Quart, connection: Connection
) -> AsyncGenerator[TestClientProtocol, None]:
    async with app.test_client() as test_client:
        async with staff_authenticated(
            test_client, connection, app
        ) as authenticated_client:
            yield authenticated_client


@pytest.fixture(autouse=True)
def disable_rate_limiter(monkeypatch):
    monkeypatch.setattr(
        "backend.blueprints.staff.rate_limit", lambda *a, **k: lambda f: f
    )
