from quart_db import Connection


async def execute(connection: Connection) -> None:
    await connection.execute(
        """INSERT INTO staff (id, email, password_hash)
                VALUES ('3446a6ce-51e8-45e1-bbc3-8d69ef5fe715',
                        'test@crmapp.com',
                        '$2b$14$6yXjNza30kPCg3LhzZJfqeCWOLM.zyTiQFD4rdWlFHBTfYzzKJMJe')
         """
    )

    await connection.execute(
        """INSERT INTO members (id, gc_id, first_name, last_name, email,
                       phone_number)
                VALUES ('A5C63EA2-5F28-4EBF-912A-FE37BEE73F65', 'test_gc_id',
                       'TestFirstName', 'TestLastName',
                       'test@email.com', '07654536466'),
                       ('9D26F285-AB2C-4755-BF77-48B59EB01D9B',
                       'CU01K4VVZF39141RQAWF8ME4TVPG',
                       'Testy', 'McTestface',
                       'tastytest@email.com', '07654536476')
         """
    )

    await connection.execute(
        """INSERT INTO mandates (id, member_id, gc_id, payment_status, status)
                VALUES ('1F1436D6-7D11-4E4C-8AE9-EDFB7FB26105',
                       'A5C63EA2-5F28-4EBF-912A-FE37BEE73F65',
                       'MD01K4VVZF8R4894Z6GBR29CRK3R', 'PAID', 'ACTIVE')
         """
    )
