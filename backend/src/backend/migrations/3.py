from quart_db import Connection


async def migrate(connection: Connection) -> None:

    await connection.execute(
        """CREATE TYPE MANDATE_STATUS_T AS ENUM (
            'ACTIVE',
            'CANCELLED'
        )
        """
    )

    await connection.execute(
        """CREATE TABLE mandates (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                gc_id TEXT NOT NULL,
                created TIMESTAMP NOT NULL DEFAULT now(),
                member_id UUID REFERENCES members(id),
                payment_status PAYMENT_STATUS_T,
                status MANDATE_STATUS_T
                )
        """
    )

    await connection.execute(
        """ALTER TABLE members
           DROP COLUMN payment_status
        """
    )
