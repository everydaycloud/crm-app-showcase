from quart_db import Connection


async def migrate(connection: Connection) -> None:

    await connection.execute(
        """ALTER TABLE members
           DROP COLUMN status
        """
    )
    await connection.execute(
        """DROP TYPE MEMBER_STATUS_T
        """
    )
