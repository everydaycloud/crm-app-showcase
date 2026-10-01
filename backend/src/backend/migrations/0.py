from quart_db import Connection


async def migrate(connection: Connection) -> None:

    await connection.execute(
        """CREATE TABLE staff (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                created TIMESTAMP NOT NULL DEFAULT now(),
                email TEXT NOT NULL,
                email_verified TIMESTAMP,
                password_hash TEXT NOT NULL
                )"""
    )

    await connection.execute(
        """CREATE UNIQUE INDEX staff_unique_email_idx on staff (LOWER(email))"""
    )

    await connection.execute(
        """CREATE TYPE MEMBER_STATUS_T AS ENUM (
            'ACTIVE',
            'CANCELLED'
        )
        """
    )

    await connection.execute(
        """CREATE TABLE members (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            gc_id TEXT UNIQUE,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone_number TEXT,
            pays_cash BOOLEAN NOT NULL DEFAULT FALSE,
            picture_url TEXT,
            status MEMBER_STATUS_T,
            created TIMESTAMP NOT NULL DEFAULT now()
      )"""
    )
