from types import SimpleNamespace
from unittest import mock

from quart_db import Connection

from backend.lib.tasks import tasks
from backend.models.mandate import select_mandates
from backend.models.member import select_members


async def test_gc_migration_worker(
    connection: Connection,
) -> None:
    with (
        mock.patch(
            "backend.workers.gc_data_migration_worker.get_gocardless_client",
            new_callable=mock.Mock,
        ),
        mock.patch(
            "backend.workers.gc_data_migration_worker._list_all_customers",
            new_callable=mock.AsyncMock,
        ) as mock_list_gc_customers,
        mock.patch(
            "backend.workers.gc_data_migration_worker._list_customer_mandates",
            new_callable=mock.AsyncMock,
        ) as mock_customer_mandates,
    ):
        mock_customers = [
            SimpleNamespace(
                id="CU123",
                given_name="Alice",
                family_name="Smith",
                email="alice@example.com",
                created_at="2014-08-04T12:00:00.000Z",
            ),
            SimpleNamespace(
                id="CU124",
                given_name="Bob",
                family_name="Jones",
                email="bob@example.com",
                created_at="2014-09-03T12:00:00.000Z",
            ),
        ]
        mock_list_gc_customers.return_value = mock_customers
        mock_mandates = [
            SimpleNamespace(
                id="MD111", status="active", created_at="2014-08-04T12:00:00.000Z"
            ),
            SimpleNamespace(
                id="MD112", status="cancelled", created_at="2014-05-05T12:00:00.000Z"
            ),
        ]
        mock_customer_mandates.return_value = mock_mandates

        await tasks.test_run("migrate_customers_and_mandates_worker")

        new_members = await select_members(connection)
        assert len(new_members) >= 2
        assert any([member.gc_id == "CU123" for member in new_members])
        assert any([member.gc_id == "CU124" for member in new_members])
        db_mandates = await select_mandates(connection)
        assert len(db_mandates) >= 2
        assert any([mandate.gc_id == "MD111" for mandate in db_mandates])
        assert any([mandate.gc_id == "MD112" for mandate in db_mandates])
