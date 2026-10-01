from quart_db import Connection


async def migrate(connection: Connection) -> None:

    await connection.execute(
        """ALTER TABLE members
           ADD COLUMN file_key UUID"""
    )

    await connection.execute(
        """ALTER TABLE members
           DROP COLUMN picture_url"""
    )
