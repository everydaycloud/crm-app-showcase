from quart import Quart
from quart_rate_limiter import (
    QUART_RATE_LIMITER_EXEMPT_ATTRIBUTE,
    QUART_RATE_LIMITER_LIMITS_ATTRIBUTE,
)

IGNORED_ENDPOINTS = {
    "static",
    "assets",
    "openapi",
    "redoc_ui",
    "swagger_ui",
    "scalar_ui",
    "register",
    "staff.register",
    "api.v1.gc_webhook.gc_webhook",
}


def test_routes_have_rate_limits(app: Quart) -> None:
    for rule in app.url_map.iter_rules():
        endpoint = rule.endpoint

        exempt = getattr(
            app.view_functions[endpoint],
            QUART_RATE_LIMITER_EXEMPT_ATTRIBUTE,
            False,
        )
        if not exempt and endpoint not in IGNORED_ENDPOINTS:
            rate_limits = getattr(
                app.view_functions[endpoint],
                QUART_RATE_LIMITER_LIMITS_ATTRIBUTE,
                [],
            )
            assert rate_limits != []
