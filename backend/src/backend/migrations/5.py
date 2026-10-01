from quart_db import Connection


async def migrate(connection: Connection) -> None:
    await connection.execute(
        """CREATE TABLE scheduled_tasks(
               task_key TEXT PRIMARY KEY NOT NULL,
               last_ran TIMESTAMP WITH TIME ZONE NOT NULL
           )""",
    )
