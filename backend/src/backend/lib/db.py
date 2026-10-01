import json
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic.json import pydantic_encoder
from quart_db import QuartDB

from backend.models.mandate import MandateStatus, PaymentStatus

quart_db = QuartDB()


class UUIDJSONEncoder(json.JSONEncoder):
    def default(self, object_: Any) -> Any:
        if isinstance(object_, UUID):
            return str(object_)
        elif isinstance(object_, Decimal):
            return str(object_)
        else:
            return pydantic_encoder(object_)


def add_common_converters(quart_db: QuartDB) -> None:
    quart_db.set_converter(
        "json",
        lambda data: json.dumps(data, cls=UUIDJSONEncoder),
        json.loads,
        schema="pg_catalog",
    )
    quart_db.set_converter(
        "jsonb",
        lambda data: json.dumps(data, cls=UUIDJSONEncoder),
        json.loads,
        schema="pg_catalog",
    )


add_common_converters(quart_db)

quart_db.set_converter("mandate_status_t", lambda type_: type_.value, MandateStatus)
quart_db.set_converter("payment_status_t", lambda type_: type_.value, PaymentStatus)
