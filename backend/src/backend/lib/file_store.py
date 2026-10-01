import mimetypes
import os
from pathlib import Path
from typing import Protocol, cast
from uuid import UUID, uuid4

import aioboto3
from aiofiles import open as async_open
from quart import Quart, g


class FileStoreProtocol(Protocol):
    async def upload_to_r2(self, file_path: str) -> UUID: ...

    async def delete_from_r2(self, key: UUID) -> None: ...


class S3FileStore:
    def __init__(
        self,
        r2_endpoint_url: str,
        r2_access_key_id: str,
        r2_secret_access_key: str,
        bucket: str,
    ) -> None:
        self._r2_endpoint_url = r2_endpoint_url
        self._r2_access_key_id = r2_access_key_id
        self._r2_secret_access_key = r2_secret_access_key
        self._bucket = bucket

    async def upload_to_r2(self, file_path: str) -> UUID:
        session = aioboto3.Session()
        content_type, _ = mimetypes.guess_type(file_path)
        if content_type is None:
            content_type = "application/octet-stream"

        object_key = uuid4()

        async with session.client(
            "s3",
            endpoint_url=self._r2_endpoint_url,
            aws_access_key_id=self._r2_access_key_id,
            aws_secret_access_key=self._r2_secret_access_key,
            region_name="auto",
        ) as s3_client:
            with open(file_path, "rb") as f:
                await s3_client.put_object(
                    Bucket=self._bucket,
                    Key=str(object_key),
                    Body=f,
                    ContentType=content_type,
                    ACL="public-read",
                    CacheControl="public, max-age=31536000, immutable",
                )
        return object_key

    async def delete_from_r2(self, key: UUID) -> None:
        session = aioboto3.Session()
        async with session.client(
            "s3",
            endpoint_url=self._r2_endpoint_url,
            aws_access_key_id=self._r2_access_key_id,
            aws_secret_access_key=self._r2_secret_access_key,
            region_name="auto",
        ) as s3_client:
            try:
                await s3_client.delete_object(Bucket=self._bucket, Key=str(key))
            except s3_client.exceptions.NoSuchKey:
                pass


class LocalFileStore:
    def __init__(self, root_path: Path) -> None:
        self._root_path = root_path

    async def upload_to_r2(self, file_path: str) -> UUID:
        object_key = uuid4()

        async with async_open(self._root_path / str(object_key), "wb") as out_file:
            async with async_open(file_path, "rb") as in_file:
                await out_file.write(await in_file.read())

        return object_key

    async def delete_from_r2(self, key: UUID) -> None:
        os.remove(self._root_path / str(key))


class FileStoreExtension:
    def __init__(self, app: Quart | None = None) -> None:
        self._client: FileStoreProtocol | None = None
        if app is not None:
            self.init_app(app)

    def init_app(self, app: Quart) -> None:
        app.extensions.setdefault("FILE_STORE_CLIENT", []).append(self)
        app.before_request(self.before_request)
        app.teardown_request(self.teardown_request)
        if "R2_BUCKET_NAME" in app.config:
            self._r2_endpoint_url = app.config["R2_ENDPOINT_URL"]
            self._r2_access_key_id = app.config["R2_ACCESS_KEY_ID"]
            self._r2_secret_access_key = app.config["R2_SECRET_ACCESS_KEY"]
            self._bucket = app.config["R2_BUCKET_NAME"]
            self._root_path = None
        else:
            self._r2_endpoint_url = None
            self._r2_access_key_id = None
            self._r2_secret_access_key = None
            self._bucket = None
            self._root_path = Path(app.config["FILESTORE_PATH"])

    @property
    def client(self) -> FileStoreProtocol:
        if self._client is None:
            if self._bucket is not None:
                assert self._r2_endpoint_url is not None  # nosec
                assert self._r2_access_key_id is not None  # nosec
                assert self._r2_secret_access_key is not None  # nosec

                self._client = S3FileStore(
                    self._r2_endpoint_url,
                    self._r2_access_key_id,
                    self._r2_secret_access_key,
                    self._bucket,
                )
            else:
                assert self._root_path is not None  # nosec

                self._client = LocalFileStore(self._root_path)
        return cast(FileStoreProtocol, self._client)

    async def before_request(self) -> None:
        g.file_store_client = self.client

    async def teardown_request(self, _: BaseException | None) -> None:
        g.file_store_client = None
