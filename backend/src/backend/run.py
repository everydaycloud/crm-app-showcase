import asyncio
import logging
import os
from subprocess import call  # nosec
from urllib.parse import urlparse

import sentry_sdk
from quart import Quart, ResponseReturnValue
from quart.cli import ScriptInfo
from quart_auth import QuartAuth
from quart_rate_limiter import RateLimiter, RateLimitExceeded
from quart_schema import QuartSchema, RequestSchemaValidationError
from sentry_sdk.integrations.quart import QuartIntegration
from sql_tstring import Context, set_context

import backend.workers  # noqa: F401
from backend.api import blueprint as api_blueprint
from backend.blueprints.control import blueprint as control_blueprint
from backend.blueprints.members import blueprint as members_blueprint
from backend.blueprints.serving import blueprint as serving_blueprint
from backend.blueprints.sessions import blueprint as sessions_blueprint
from backend.blueprints.staff import blueprint as staff_blueprint
from backend.lib.api_error import APIError
from backend.lib.db import quart_db
from backend.lib.file_store import FileStoreExtension
from backend.lib.tasks import tasks
from backend.scripts.gc_migration_script import migrate_customers_and_mandates

logging.basicConfig(level=logging.INFO)
set_context(Context(dialect="asyncpg"))

if "SENTRY_DSN" in os.environ:
    sentry_sdk.init(
        dsn=os.environ["SENTRY_DSN"],
        integrations=[QuartIntegration()],
        traces_sample_rate=0.2,
    )


def create_app() -> Quart:
    app = Quart(__name__)
    app.config.from_prefixed_env(prefix="CRM")

    tasks.init_app(app)
    quart_db.init_app(app)

    QuartAuth(app)
    QuartSchema(app, convert_casing=True)
    FileStoreExtension(app)

    if not app.config.get("TESTING", False):
        RateLimiter(app)

    app.register_blueprint(api_blueprint)
    app.register_blueprint(control_blueprint)
    app.register_blueprint(members_blueprint)
    app.register_blueprint(serving_blueprint)
    app.register_blueprint(sessions_blueprint)
    app.register_blueprint(staff_blueprint)

    app.add_url_rule(
        "/assets/<path:filename>",
        "assets",
        app.send_static_file,
    )

    @app.errorhandler(APIError)  # type: ignore
    async def handle_api_error(error: APIError) -> ResponseReturnValue:
        return {"code": error.code}, error.status_code

    @app.errorhandler(RateLimitExceeded)  # type: ignore
    async def handle_rate_limit_exceeded_error(
        error: RateLimitExceeded,
    ) -> ResponseReturnValue:
        return {}, 429, error.get_headers()

    @app.errorhandler(RequestSchemaValidationError)  # type: ignore
    async def handle_request_validation_error(
        error: RequestSchemaValidationError,
    ) -> ResponseReturnValue:
        if isinstance(error.validation_error, TypeError):
            return {"errors": str(error.validation_error)}, 400

    @app.errorhandler(500)
    async def handle_generic_error(error: Exception) -> ResponseReturnValue:
        return {"code": "INTERNAL_SERVER_ERROR"}, 500

    @app.cli.command("recreate_db")
    def recreate_db() -> None:
        db_url = urlparse(os.environ["CRM_QUART_DB_DATABASE_URL"])
        call(
            [  # nosec
                "psql",
                "-U",
                "postgres",
                "-c",
                f"DROP DATABASE IF EXISTS {db_url.path.removeprefix('/')}",
            ]
        )
        call(
            [  # nosec
                "psql",
                "-U",
                "postgres",
                "-c",
                f"DROP USER IF EXISTS {db_url.username}",
            ]
        )
        call(
            [  # nosec
                "psql",
                "-U",
                "postgres",
                "-c",
                f"CREATE USER {db_url.username} LOGIN PASSWORD '{db_url.password}' CREATEDB SUPERUSER",  # noqa: E501
            ]
        )
        call(
            [  # nosec
                "psql",
                "-U",
                "postgres",
                "-c",
                f"CREATE DATABASE {db_url.path.removeprefix('/')} locale 'en_US.UTF-8' TEMPLATE template0;",  # noqa: E501
            ]
        )
        call(
            [  # nosec
                "psql",
                "-U",
                "postgres",
                "-d",
                f"{db_url.path.removeprefix('/')}",
                "-c",
                f"GRANT ALL ON SCHEMA public TO {db_url.username}",
            ]
        )

    @app.cli.command("migrate-gc")
    def migrate_gc_data(info: ScriptInfo):
        app = info.load_app()

        async def _inner() -> None:
            async with app.app_context():
                try:
                    (db,) = app.extensions["QUART_DB"]
                    async with db.connection() as connection:
                        await migrate_customers_and_mandates(connection)
                except Exception:
                    app.logger.exception("Exception in GoCardless data migration")

        asyncio.run(_inner())

    return app
