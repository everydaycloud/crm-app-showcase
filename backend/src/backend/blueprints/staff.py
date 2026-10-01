import os
from datetime import timedelta
from uuid import UUID

import asyncpg  # type: ignore
import bcrypt
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from pydantic import BaseModel
from quart import Blueprint, ResponseReturnValue, current_app, g
from quart_auth import current_user, login_required
from quart_rate_limiter import rate_limit
from quart_schema import validate_request, validate_response
from zxcvbn import zxcvbn  # type: ignore

from backend.lib.api_error import APIError
from backend.lib.email import send_email
from backend.models.staff import (
    Staff,
    insert_staff,
    select_all_staff,
    select_staff_by_email,
    select_staff_by_id,
    update_staff_email_verified,
    update_staff_password,
)

blueprint = Blueprint("staff", __name__, url_prefix="/v1")


MINIMUM_STRENGTH = 3
EMAIL_VERIFICATION_SALT = "email verify"


class StaffData(BaseModel):
    email: str
    password: str


class AllStaff(BaseModel):
    staff: list[Staff]


@blueprint.get("/staff/")
@rate_limit(10, timedelta(seconds=10))
@login_required
@validate_response(AllStaff)
async def load_staff() -> AllStaff:
    all_staff = await select_all_staff(g.connection)
    return AllStaff(staff=all_staff)


@blueprint.post("/staff/")
@rate_limit(10, timedelta(seconds=10))
@validate_request(StaffData)
async def register(data: StaffData) -> ResponseReturnValue:
    """Create a new staff member.
    This allows a staff member to be created.
    """
    strength = zxcvbn(data.password)
    if strength["score"] < MINIMUM_STRENGTH:
        raise APIError(400, "WEAK_PASSWORD")

    hashed_password = bcrypt.hashpw(
        data.password.encode("utf-8"),
        bcrypt.gensalt(14),
    )
    allowed_emails = (os.environ["ALLOWED_EMAILS"]).split(",")
    if data.email not in allowed_emails:
        raise APIError(400, "REGISTRATION_NOT_ALLOWED")

    existing_staff_member = await select_staff_by_email(g.connection, email=data.email)
    if existing_staff_member is not None:
        raise APIError(400, "NOT_ALLOWED")

    try:
        staff = await insert_staff(
            g.connection,
            data.email,
            hashed_password.decode(),
        )
    except asyncpg.exceptions.UniqueViolationError:
        pass
    else:
        serializer = URLSafeTimedSerializer(
            str(current_app.secret_key),
            salt=EMAIL_VERIFICATION_SALT,
        )
        token = serializer.dumps(str(staff.id))
        await send_email(
            staff.email,
            "Welcome",
            "welcome.html",
            {"token": token},
        )
    return {"id": staff.id}, 201


ONE_MONTH = int(timedelta(days=30).total_seconds())


class TokenData(BaseModel):
    token: str


@blueprint.put("/staff/verify-email/")
@rate_limit(5, timedelta(minutes=1))
@validate_request(TokenData)
async def verify_staff_email(data: TokenData) -> ResponseReturnValue:
    """Call to verify a staff email.
    This requires the user to supply a valid token.
    """
    serializer = URLSafeTimedSerializer(
        str(current_app.secret_key), salt=EMAIL_VERIFICATION_SALT
    )
    try:
        staff_id = serializer.loads(data.token, max_age=ONE_MONTH)
    except SignatureExpired:
        raise APIError(403, "TOKEN_EXPIRED")
    except BadSignature:
        raise APIError(400, "TOKEN_INVALID")
    else:
        await update_staff_email_verified(g.connection, staff_id)
    return {}


class PasswordData(BaseModel):
    current_password: str
    new_password: str


@blueprint.put("/staff/password/")
@rate_limit(5, timedelta(minutes=1))
@login_required
@validate_request(PasswordData)
async def change_password(data: PasswordData) -> ResponseReturnValue:
    """Update the staff member's password.
    This allows the user to update their password.
    """
    strength = zxcvbn(data.new_password)
    if strength["score"] < MINIMUM_STRENGTH:
        raise APIError(400, "WEAK_PASSWORD")

    staff_id = UUID(current_user.auth_id)
    staff = await select_staff_by_id(g.connection, staff_id)
    assert staff is not None  # nosec
    passwords_match = bcrypt.checkpw(
        data.current_password.encode("utf-8"),
        staff.password_hash.encode("utf-8"),
    )
    if not passwords_match:
        raise APIError(401, "INVALID_PASSWORD")

    hashed_password = bcrypt.hashpw(
        data.new_password.encode("utf-8"),
        bcrypt.gensalt(14),
    )
    await update_staff_password(g.connection, staff_id, hashed_password.decode())
    await send_email(
        staff.email,
        "Password changed",
        "password_changed.html",
        {},
    )
    return {}


FORGOTTEN_PASSWORD_SALT = "forgotten password"  # nosec


class ForgottenPasswordData(BaseModel):
    email: str


@blueprint.put("/staff/forgotten-password/")
@rate_limit(5, timedelta(minutes=1))
@validate_request(ForgottenPasswordData)
async def forgotten_password(data: ForgottenPasswordData) -> ResponseReturnValue:
    """Call to trigger a forgotten password email.
    This requires a valid staff email.
    """
    staff = await select_staff_by_email(g.connection, data.email)
    if staff is not None:
        serializer = URLSafeTimedSerializer(
            str(current_app.secret_key),
            salt=FORGOTTEN_PASSWORD_SALT,
        )
        token = serializer.dumps(str(staff.id))
        await send_email(
            staff.email,
            "Forgotten password",
            "forgotten_password.html",
            {"token": token},
        )
    return {}


ONE_DAY = int(timedelta(hours=24).total_seconds())


class ResetPasswordData(BaseModel):
    password: str
    token: str


@blueprint.put("/staff/reset-password/")
@rate_limit(5, timedelta(minutes=1))
@validate_request(ResetPasswordData)
async def reset_password(data: ResetPasswordData) -> ResponseReturnValue:
    """Call to reset a password using a token.
    This requires the user to supply a valid token and a
    new password.
    """
    serializer = URLSafeTimedSerializer(
        str(current_app.secret_key), salt=FORGOTTEN_PASSWORD_SALT
    )
    try:
        staff_id = serializer.loads(data.token, max_age=ONE_DAY)
    except SignatureExpired:
        raise APIError(403, "TOKEN_EXPIRED")
    except BadSignature:
        raise APIError(400, "TOKEN_INVALID")
    else:
        strength = zxcvbn(data.password)
        if strength["score"] < MINIMUM_STRENGTH:
            raise APIError(400, "WEAK_PASSWORD")

        hashed_password = bcrypt.hashpw(
            data.password.encode("utf-8"),
            bcrypt.gensalt(14),
        )
        await update_staff_password(g.connection, staff_id, hashed_password.decode())
        staff = await select_staff_by_id(g.connection, UUID(current_user.auth_id))
        assert staff is not None  # nosec
        await send_email(
            staff.email,
            "Password changed",
            "password_changed.html",
            {},
        )
    return {}
