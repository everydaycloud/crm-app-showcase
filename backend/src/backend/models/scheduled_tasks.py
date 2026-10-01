from datetime import datetime

from pydantic import BaseModel
from quart_db import Connection
from sql_tstring import sql


class TaskRecord(BaseModel):
    task_key: str
    last_ran: datetime


async def select_task_record(
    connection: Connection, task_key: str
) -> TaskRecord | None:
    query, values = sql(
        """SELECT task_key, last_ran
             FROM scheduled_tasks
            WHERE task_key = {task_key}""",
        locals(),
    )
    result = await connection.fetch_one(query, values)
    return None if result is None else TaskRecord(**result)


async def upsert_task_record(
    connection: Connection,
    task_key: str,
    last_ran: datetime,
) -> TaskRecord:
    query, values = sql(
        """INSERT INTO scheduled_tasks(task_key, last_ran)
                VALUES ({task_key}, {last_ran})
           ON CONFLICT (task_key) DO UPDATE SET last_ran = {last_ran}
             RETURNING task_key, last_ran""",
        locals(),
    )
    result = await connection.fetch_one(query, values)
    assert result is not None
    return TaskRecord(**result)
