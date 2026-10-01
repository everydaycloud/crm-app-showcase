import tempfile
from datetime import datetime, timedelta
from uuid import UUID

from pydantic import BaseModel
from quart import Blueprint, ResponseReturnValue, g, request
from quart_auth import login_required
from quart_db import Connection
from quart_rate_limiter import rate_limit
from quart_schema import validate_querystring, validate_request, validate_response
from sql_tstring import Absent, AbsentType, sql

from backend.lib.api_error import APIError
from backend.models.mandate import PaymentStatus
from backend.models.member import (
    insert_member,
    select_member_by_email,
    select_member_by_id,
    update_member,
)

blueprint = Blueprint("members", __name__, url_prefix="/v1")


class Member(BaseModel):
    id: UUID
    gc_id: str | None
    first_name: str
    last_name: str
    email: str
    phone_number: str | None
    file_key: UUID | None
    payment_status: PaymentStatus
    created: datetime
    note: str | None


class ListMember(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    file_key: UUID | None
    payment_status: PaymentStatus


class Members(BaseModel):
    members: list[ListMember]


class MemberData(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone_number: str | None = None


class MemberFilter(BaseModel):
    payment_status: PaymentStatus | AbsentType = Absent
    search: str | AbsentType = Absent


class ResourceUUIDResponse(BaseModel):
    id: UUID


# paginate this later
# testing for params


@blueprint.get("/members/")
@rate_limit(10, timedelta(seconds=10))
@login_required
@validate_querystring(MemberFilter)
@validate_response(Members)
async def get_members(query_args: MemberFilter) -> Members:
    members = await _select_list_members(
        g.connection,
        payment_status=query_args.payment_status,
        search=query_args.search,
    )
    return Members(members=members)


async def _select_list_members(
    connection: Connection,
    search: str | AbsentType = Absent,
    payment_status: PaymentStatus | AbsentType = Absent,
) -> list[ListMember]:
    query, values = sql(
        """SELECT ms.id, ms.first_name, ms.last_name,
                  ms.file_key,
                  COALESCE(md.payment_status, 'PAYS_CASH')
                  AS payment_status
             FROM members ms
        LEFT JOIN mandates md ON md.member_id = ms.id
            WHERE COALESCE(md.payment_status, 'PAYS_CASH') = {payment_status}
                  AND (
                    ms.first_name ILIKE {search}
                    OR ms.last_name ILIKE {search}
                    OR ms.email ILIKE {search}
                  )
                  AND (
                  (md.status IS NULL AND ms.gc_id IS NULL)
                   OR (md.status = 'ACTIVE' AND ms.gc_id IS NOT NULL)
                  )
                  """,
        locals(),
    )
    return [ListMember(**row) async for row in connection.iterate(query, values)]


async def _select_member(connection: Connection, id: UUID) -> Member | None:
    query, values = sql(
        """SELECT ms.id, ms.gc_id, ms.first_name, ms.last_name, ms.email,
                  ms.phone_number, ms.file_key, ms.created,
                  COALESCE(md.payment_status, 'PAYS_CASH')
                  AS payment_status,
                  ms.note
             FROM members ms
        LEFT JOIN mandates md ON md.member_id = ms.id
            WHERE ms.id = {id}""",
        locals(),
    )
    result = await connection.fetch_one(query, values)
    return None if result is None else Member(**result)


@blueprint.get("/members/<uuid:member_id>/")
@rate_limit(10, timedelta(seconds=10))
@login_required
@validate_response(Member)
async def get_member(member_id: UUID) -> Member:
    member = await _select_member(g.connection, member_id)
    if member is None:
        raise APIError(404, "MEMBER_NOT_FOUND")
    return member


@blueprint.post("/members/")
@rate_limit(10, timedelta(seconds=10))
@login_required
@validate_request(MemberData)
@validate_response(ResourceUUIDResponse)
async def register(data: MemberData) -> ResourceUUIDResponse:
    """Create a new member.
    This allows a member to be created.
    """
    existing_member = await select_member_by_email(g.connection, email=data.email)
    if existing_member is not None:
        raise APIError(409, "MEMBER_ALREADY_EXISTS")
    member = await insert_member(
        g.connection,
        created=datetime.now(),
        gc_id=None,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone_number=data.phone_number,
    )
    return ResourceUUIDResponse(id=member.id)


@blueprint.put("/members/<uuid:member_id>/")
@rate_limit(10, timedelta(seconds=10))
@login_required
@validate_request(MemberData)
async def update_member_data(member_id: UUID, data: MemberData) -> ResponseReturnValue:
    member = await select_member_by_id(g.connection, id=member_id)
    if member is None:
        raise APIError(404, "MEMBER_NOT_FOUND")

    member = await update_member(
        g.connection,
        id=member_id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone_number=data.phone_number,
    )
    return {}


@blueprint.put("/members/<uuid:member_id>/photo/")
@rate_limit(10, timedelta(seconds=10))
@login_required
async def update_member_photo(member_id: UUID) -> ResponseReturnValue:
    member = await select_member_by_id(g.connection, id=member_id)
    if member is None:
        raise APIError(404, "MEMBER_NOT_FOUND")

    files = await request.files
    file_ = files.getlist("file")[0]

    with tempfile.NamedTemporaryFile(delete=False) as temp:
        filepath = temp.name
        await file_.save(filepath)

    new_file_key = await g.file_store_client.upload_to_r2(filepath)

    if member.file_key is not None:
        await g.file_store_client.delete_from_r2(key=member.file_key)

    member = await update_member(
        g.connection,
        id=member_id,
        file_key=new_file_key,
    )

    return {}


class MemberNoteData(BaseModel):
    note: str | None = None


@blueprint.put("/members/<uuid:member_id>/note/")
@rate_limit(10, timedelta(seconds=10))
@login_required
@validate_request(MemberNoteData)
async def add_member_note(member_id: UUID, data: MemberNoteData) -> ResponseReturnValue:
    member = await select_member_by_id(g.connection, id=member_id)
    if member is None:
        raise APIError(404, "MEMBER_NOT_FOUND")

    member = await update_member(g.connection, id=member_id, note=data.note)
    return {}
