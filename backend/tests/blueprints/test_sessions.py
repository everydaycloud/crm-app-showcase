from quart import Quart


async def test_session_flow(app: Quart) -> None:
    test_client = app.test_client()
    await test_client.post(
        "/v1/sessions/",
        json={"email": "test@oxfordbjj.com", "password": "password"},
    )
    response = await test_client.get("/v1/sessions/")
    assert (await response.get_json())[
        "staffId"
    ] == "3446a6ce-51e8-45e1-bbc3-8d69ef5fe715"
    await test_client.delete("/v1/sessions/")
    response = await test_client.get("/v1/sessions/")
    assert response.status_code == 401


async def test_login_invalid_password(app: Quart) -> None:
    test_client = app.test_client()
    await test_client.post(
        "/v1/sessions/",
        json={"email": "test@oxfordbjj.com", "password": "incorrect"},
    )
    response = await test_client.get("/v1/sessions/")
    assert response.status_code == 401
