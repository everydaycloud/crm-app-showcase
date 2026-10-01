from uuid import UUID

import pytest
from freezegun import freeze_time
from itsdangerous import URLSafeTimedSerializer
from quart import Quart

from backend.blueprints.staff import EMAIL_VERIFICATION_SALT


async def test_register(app: Quart, caplog: pytest.LogCaptureFixture) -> None:
    test_client = app.test_client()
    data = {
        "email": "test2@oxfordbjj.com",
        "password": "testPassword2$",
    }
    await test_client.post("/v1/staff/", json=data)
    response = await test_client.post("/v1/sessions/", json=data)
    assert response.status_code == 200
    assert "Sending welcome.html to test2@oxfordbjj.com" in caplog.text


@pytest.mark.parametrize(
    "time, expected",
    [("2022-01-01", 403), (None, 200)],
)
async def test_verify_email(app: Quart, time: str | None, expected: int) -> None:
    with freeze_time(time):
        signer = URLSafeTimedSerializer(
            str(app.secret_key), salt=EMAIL_VERIFICATION_SALT
        )
        token = signer.dumps(str(UUID("3446a6ce-51e8-45e1-bbc3-8d69ef5fe715")))
    test_client = app.test_client()
    response = await test_client.put("/v1/staff/verify-email/", json={"token": token})
    assert response.status_code == expected


async def test_verify_email_invalid_token(app: Quart) -> None:
    test_client = app.test_client()
    response = await test_client.put(
        "/v1/staff/verify-email/", json={"token": "invalid"}
    )
    assert response.status_code == 400


# async def test_change_password(
#      app: Quart,
#      caplog: pytest.LogCaptureFixture,
#      staff_authenticated_client: TestClientProtocol,
#  ) -> None:
#      test_client = app.test_client()
#      data = {
#          "email": "test2@oxfordbjj.com",
#          "password": "testPassword2$",
#      }
#      response = await test_client.post("/v1/staff/", json=data)
#      payload = await response.get_json()
#     #  async with test_client.authenticated(payload["id"]):  # type: ignore
#      login_response = await staff_authenticated_client.post(
#         "/v1/sessions/",
#         json={"email": "test2@oxfordbjj.com", "password": "testPassword2$"},
#         )
#      assert login_response.status_code == 200

#     #  access_token = (await login_response.get_json())["access_token"]
#     #  test_client.headers.update({"Authorization": f"Bearer {access_token}"})

#      response = await staff_authenticated_client.put(
#              "/v1/staff/password/",
#              json={
#                  "currentPassword": data["password"],
#                  "newPassword": "testPassword3$",
#              }
#          )
#      assert response.status_code == 200
#      assert "Sending password_changed.html to test2@oxfordbjj.com" in caplog.text


async def test_forgotten_password(app: Quart, caplog: pytest.LogCaptureFixture) -> None:
    test_client = app.test_client()
    data = {"email": "test@oxfordbjj.com"}
    response = await test_client.put("/v1/staff/forgotten-password/", json=data)
    assert response.status_code == 200
    assert "Sending forgotten_password.html to test@oxfordbjj.com" in caplog.text
