from quart_db import Connection


async def migrate(connection: Connection) -> None:

    await connection.execute(
        """CREATE TYPE PAYMENT_STATUS_T AS ENUM (
            'PAID',
            'UNPAID',
            'PAYS_CASH')
        """
    )
    await connection.execute(
        """ALTER TABLE members
           ADD COLUMN payment_status PAYMENT_STATUS_T"""
    )

    await connection.execute(
        """ALTER TABLE members
           DROP COLUMN pays_cash"""
    )
