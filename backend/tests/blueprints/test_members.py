import io

from quart.typing import TestClientProtocol
from werkzeug.datastructures import FileStorage


async def test_get_members(
    staff_authenticated_client: TestClientProtocol,
) -> None:
    response = await staff_authenticated_client.get("/v1/members/")
    payload = await response.get_json()
    assert response.status_code == 200, payload
    assert len(payload) == 1


async def test_get_member(
    staff_authenticated_client: TestClientProtocol,
) -> None:
    response = await staff_authenticated_client.get(
        "/v1/members/a5c63ea2-5f28-4ebf-912a-fe37bee73f65/"
    )
    payload = await response.get_json()
    assert response.status_code == 200, payload
    assert payload["id"] == "a5c63ea2-5f28-4ebf-912a-fe37bee73f65"


async def test_add_member(
    staff_authenticated_client: TestClientProtocol,
) -> None:
    response = await staff_authenticated_client.post(
        "/v1/members/",
        json={
            "first_name": "Testy",
            "last_name": "McTest",
            "email": "testy@example.com",
            "phone_number": "",
        },
    )
    payload = await response.get_json()
    assert response.status_code == 200, payload
    assert payload["id"] is not None


async def test_update_member(
    staff_authenticated_client: TestClientProtocol,
) -> None:
    response = await staff_authenticated_client.put(
        "/v1/members/a5c63ea2-5f28-4ebf-912a-fe37bee73f65/",
        json={
            "first_name": "NewFirstName",
            "last_name": "TestLastName",
            "email": "test@email.com",
            "phone_number": "07654536466",
        },
    )
    payload = await response.get_json()
    assert response.status_code == 200

    response = await staff_authenticated_client.get(
        "/v1/members/a5c63ea2-5f28-4ebf-912a-fe37bee73f65/"
    )
    payload = await response.get_json()
    assert response.status_code == 200, payload
    assert payload["firstName"] == "NewFirstName"


async def test_update_member_photo(
    staff_authenticated_client: TestClientProtocol,
) -> None:
    fake_file_content = b"this is fake image content"
    file_like = io.BytesIO(fake_file_content)

    file_storage = FileStorage(
        stream=file_like,
        filename="test-image.png",
        content_type="image/png",
    )
    response = await staff_authenticated_client.put(
        "/v1/members/a5c63ea2-5f28-4ebf-912a-fe37bee73f65/photo/",
        files={"file": file_storage},
    )
    await response.get_json()
    assert response.status_code == 200


async def test_update_member_note(
    staff_authenticated_client: TestClientProtocol,
) -> None:
    response = await staff_authenticated_client.put(
        "/v1/members/a5c63ea2-5f28-4ebf-912a-fe37bee73f65/note/",
        json={
            "note": "test note",
        },
    )
    payload = await response.get_json()
    assert response.status_code == 200

    response = await staff_authenticated_client.get(
        "/v1/members/a5c63ea2-5f28-4ebf-912a-fe37bee73f65/"
    )
    payload = await response.get_json()
    assert response.status_code == 200, payload
    assert payload["note"] == "test note"
