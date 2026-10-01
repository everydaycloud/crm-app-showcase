from datetime import datetime
from zoneinfo import ZoneInfo

from quart import current_app
from quart_tasks import QuartTasks, TaskStoreABC

from backend.lib.db import quart_db
from backend.models.scheduled_tasks import select_task_record, upsert_task_record


class DBStore(TaskStoreABC):
    def __init__(self) -> None:
        pass

    async def startup(self) -> None:
        pass

    async def get(self, key: str, default: datetime) -> datetime:
        async with quart_db.connection() as connection:
            record = await select_task_record(connection, key)
            return default if record is None else record.last_ran

    async def set(self, key: str, executed: datetime) -> None:
        async with quart_db.connection() as connection:
            await upsert_task_record(connection, key, executed)

    async def shutdown(self) -> None:
        pass


tasks = QuartTasks(store=DBStore(), tzinfo=ZoneInfo("Europe/London"))


@tasks.before_task
async def acquire_db() -> None:
    (db,) = current_app.extensions["QUART_DB"]
    await db.before_request()


@tasks.after_task
async def release_db() -> None:
    (db,) = current_app.extensions["QUART_DB"]
    await db.teardown_request(None)
