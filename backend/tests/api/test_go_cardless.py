import hashlib
import hmac
from json import dumps
from types import SimpleNamespace
from typing import Any, Tuple
from unittest import mock

import pytest
from gocardless_pro.services.customers_service import CustomersService
from gocardless_pro.services.mandates_service import MandatesService
from quart import Quart
from quart_db import Connection

from backend.models.mandate import MandateStatus, PaymentStatus, select_mandate


def _generate_gocardless_event(
    secret: str, payload: dict[str, Any]
) -> Tuple[bytes, str]:
    """
    Returns (body_bytes, webhook_signature_header_value).
    GoCardless expects an HMAC-SHA256 hex (lowercase) of the raw request body.
    """
    body = dumps(payload).encode()
    mac = hmac.new(secret.encode(), body, hashlib.sha256)
    signature = mac.hexdigest()
    # GoCardless uses the raw hex signature in the `Webhook-Signature` header.
    return body, signature


@pytest.mark.asyncio
async def test_unknown_gocardless_event(app: Quart) -> None:
    body, header = _generate_gocardless_event(
        app.config["GC_WEBHOOK_SECRET"],
        {
            "events": [
                {
                    "id": "EV_TEST_123",
                    "created_at": "2025-09-25T12:00:00Z",
                    "action": "created",
                    "resource_type": "payments",
                    "links": {"payment": "PMT_1"},
                }
            ]
        },
    )

    test_client = app.test_client()
    response = await test_client.post(
        "/v1/gc-webhook/",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Webhook-Signature": header,
        },
        subdomain="api",
    )
    assert response.status_code in (200, 204)


async def test_handle_mandate_created_customer_exists(
    app: Quart,
    connection: Connection,
) -> None:
    mock_mandate_data: dict[str, Any] = {
        "id": "MD01K4VVZF8R4894Z6GBR29CRK3R",
        "created_at": "2025-09-11T07:48:56.724Z",
        "reference": "CLI-3ZVOJ",
        "status": "active",
        "scheme": "bacs",
        "next_possible_charge_date": "2025-10-22",
        "payments_require_approval": False,
        "metadata": {},
        "links": {
            "customer_bank_account": "BA01K4VVZF6KJACDMCFC3F7F010V",
            "creditor": "CR00007FAASD1N",
            "customer": "CU01K4VVZF39141RQAWF8ME4TVPG",
            "organisation": "OR00005D5NGATG",
        },
    }

    mock_mandate = SimpleNamespace(**mock_mandate_data)
    mock_mandate.links = SimpleNamespace(**mock_mandate_data["links"])

    with mock.patch(
        "backend.api.go_cardless.run_gocardless",
        new_callable=mock.AsyncMock,
    ) as mock_new_mandate:
        mock_new_mandate.return_value = mock_mandate
        body, header = _generate_gocardless_event(
            app.config["GC_WEBHOOK_SECRET"],
            {
                "events": [
                    {
                        "id": "EV_TEST_123",
                        "created_at": "2025-09-25T12:00:00Z",
                        "action": "created",
                        "resource_type": "mandates",
                        "links": {"mandate": "MD01K4VVZF8R4894Z6GBR29CRK3R"},
                    }
                ]
            },
        )
        test_client = app.test_client()
        response = await test_client.post(
            "/v1/gc-webhook/",
            data=body,
            headers={
                "Content-Type": "application/json",
                "Webhook-Signature": header,
            },
            subdomain="api",
        )

        response.status_code == 200

        mandate = await select_mandate(connection, gc_id="MD01K4VVZF8R4894Z6GBR29CRK3R")
        assert mandate is not None
        assert mandate.status == MandateStatus.ACTIVE


async def test_handle_customer_and_mandate_created_then_cancelled(
    app: Quart,
    connection: Connection,
) -> None:
    mock_customer_data: dict[str, Any] = {
        "id": "CU01K4VVXTH4KX0VXQCW8FN3A22F",
        "created_at": "2025-09-11T07:48:02.721Z",
        "email": "gbymwwwzxq8j5ezuug@customer.com",
        "given_name": "GBOdpZoNj3LFg1QCiU",
        "family_name": "GBtId3AmooDbilesAJ",
        "company_name": None,
        "address_line1": "5 Britain Place",
        "address_line2": "Britain Road",
        "address_line3": None,
        "city": "London",
        "region": None,
        "postal_code": "E1 1AA",
        "country_code": "GB",
        "language": "en",
        "swedish_identity_number": None,
        "danish_identity_number": None,
        "phone_number": None,
        "metadata": {},
        "name": "GBOdpZoNj3LFg1QCiU GBtId3AmooDbilesAJ",
        "active_mandates": False,
        "organisation_id": "OR00005D5NGATG",
        "organisation_details": {"name": "Jiu Jitsu Republic", "nickname": None},
    }
    mock_mandate_data: dict[str, Any] = {
        "id": "MD01K4VVXTM6J34WA2ESSCXFZ45R",
        "created_at": "2025-09-11T07:48:56.724Z",
        "reference": "CLI-3ZVOJ",
        "status": "active",
        "scheme": "bacs",
        "next_possible_charge_date": "2025-10-22",
        "payments_require_approval": False,
        "metadata": {},
        "links": {
            "customer_bank_account": "BA01K4VVZF6KJACDMCFC3F7F010V",
            "creditor": "CR00007FAASD1N",
            "customer": "CU01K4VVXTH4KX0VXQCW8FN3A22F",
            "organisation": "OR00005D5NGATG",
        },
    }

    mock_mandate = SimpleNamespace(**mock_mandate_data)
    mock_mandate.links = SimpleNamespace(**mock_mandate_data["links"])
    mock_customer = SimpleNamespace(**mock_customer_data)

    with mock.patch(
        "backend.api.go_cardless.run_gocardless",
        new_callable=mock.AsyncMock,
    ) as mock_run_gc:

        async def fake_run_gocardless(func, resource_id):
            if isinstance(func.__self__, MandatesService):
                return mock_mandate
            elif isinstance(func.__self__, CustomersService):
                return mock_customer
            else:
                raise ValueError(f"Unexpected call to run_gocardless: {func}")

        mock_run_gc.side_effect = fake_run_gocardless

        body, header = _generate_gocardless_event(
            app.config["GC_WEBHOOK_SECRET"],
            {
                "events": [
                    {
                        "id": "EV_TEST_123",
                        "created_at": "2025-09-25T12:00:00Z",
                        "action": "created",
                        "resource_type": "mandates",
                        "links": {"mandate": "MD01K4VVXTM6J34WA2ESSCXFZ45R"},
                    }
                ]
            },
        )
        test_client = app.test_client()
        response = await test_client.post(
            "/v1/gc-webhook/",
            data=body,
            headers={
                "Content-Type": "application/json",
                "Webhook-Signature": header,
            },
            subdomain="api",
        )

        response.status_code == 200

        mandate = await select_mandate(connection, gc_id="MD01K4VVXTM6J34WA2ESSCXFZ45R")
        assert mandate is not None
        assert mandate.status == MandateStatus.ACTIVE

        body, header = _generate_gocardless_event(
            app.config["GC_WEBHOOK_SECRET"],
            {
                "events": [
                    {
                        "id": "EV_TEST_123",
                        "created_at": "2025-09-25T12:00:00Z",
                        "action": "cancelled",
                        "resource_type": "mandates",
                        "links": {"mandate": "MD01K4VVXTM6J34WA2ESSCXFZ45R"},
                    }
                ]
            },
        )
        test_client = app.test_client()
        response = await test_client.post(
            "/v1/gc-webhook/",
            data=body,
            headers={
                "Content-Type": "application/json",
                "Webhook-Signature": header,
            },
            subdomain="api",
        )

        response.status_code == 200

        mandate = await select_mandate(connection, gc_id="MD01K4VVXTM6J34WA2ESSCXFZ45R")
        assert mandate is not None
        assert mandate.status == MandateStatus.CANCELLED


async def test_handle_payment_confirmed(
    app: Quart,
    connection: Connection,
) -> None:
    mock_payment_data: dict[str, Any] = {
        "id": "PM01K4VTZPG0683KKQG337SXYEMR",
        "created_at": "2025-09-11T07:31:35.549Z",
        "charge_date": "2025-09-16",
        "amount": 1234,
        "description": "Payment Triggered From Event Simulation",
        "currency": "GBP",
        "status": "confirmed",
        "amount_refunded": 0,
        "links": {
            "mandate": "MD01K4VVZF8R4894Z6GBR29CRK3R",
            "creditor": "CR00007FAASD1N",
            "organisation": "OR00005D5NGATG",
            "payout": "PO01K4YJY1M2B4RHV70XQZ07SNV0",
        },
        "retry_if_possible": False,
        "scheme": "bacs",
        "transaction_fee": 44,
        "payout_date": "2025-09-12",
        "payout_received_date": "2025-09-12",
        "paid_at": "2025-09-11T07:31:36.101Z",
        "app_fee": 0,
        "source": "api",
        "surcharge_fee_summary": {"chargeback_fee": 0, "failure_fee": 0},
        "tax_amount": 7,
        "failure_probability_bucket": None,
        "funds_settlement": "managed",
        "organisation_details": {"name": "Jiu Jitsu Republic", "nickname": None},
    }

    mock_mandate = SimpleNamespace(**mock_payment_data)
    mock_mandate.links = SimpleNamespace(**mock_payment_data["links"])

    with mock.patch(
        "backend.api.go_cardless.run_gocardless",
        new_callable=mock.AsyncMock,
    ) as mock_new_mandate:
        mock_new_mandate.return_value = mock_mandate
        body, header = _generate_gocardless_event(
            app.config["GC_WEBHOOK_SECRET"],
            {
                "events": [
                    {
                        "id": "EV_TEST_123",
                        "created_at": "2025-09-25T12:00:00Z",
                        "action": "confirmed",
                        "resource_type": "payments",
                        "links": {"payment": "PM01K4VTZPG0683KKQG337SXYEMR"},
                    }
                ]
            },
        )
        test_client = app.test_client()
        response = await test_client.post(
            "/v1/gc-webhook/",
            data=body,
            headers={
                "Content-Type": "application/json",
                "Webhook-Signature": header,
            },
            subdomain="api",
        )

        response.status_code == 200

        mandate = await select_mandate(connection, gc_id="MD01K4VVZF8R4894Z6GBR29CRK3R")
        assert mandate is not None
        assert mandate.payment_status == PaymentStatus.PAID


async def test_handle_payment_cancelled(
    app: Quart,
    connection: Connection,
) -> None:
    mock_payment_data: dict[str, Any] = {
        "id": "PM01K4VTZPG0683KKQG337SXYEMR",
        "created_at": "2025-09-11T07:31:35.549Z",
        "charge_date": "2025-09-16",
        "amount": 1234,
        "description": "Payment Triggered From Event Simulation",
        "currency": "GBP",
        "status": "cancelled",
        "amount_refunded": 0,
        "links": {
            "mandate": "MD01K4VVZF8R4894Z6GBR29CRK3R",
            "creditor": "CR00007FAASD1N",
            "organisation": "OR00005D5NGATG",
            "payout": "PO01K4YJY1M2B4RHV70XQZ07SNV0",
        },
        "retry_if_possible": False,
        "scheme": "bacs",
        "transaction_fee": 44,
        "payout_date": "2025-09-12",
        "payout_received_date": "2025-09-12",
        "paid_at": "2025-09-11T07:31:36.101Z",
        "app_fee": 0,
        "source": "api",
        "surcharge_fee_summary": {"chargeback_fee": 0, "failure_fee": 0},
        "tax_amount": 7,
        "failure_probability_bucket": None,
        "funds_settlement": "managed",
        "organisation_details": {"name": "Jiu Jitsu Republic", "nickname": None},
    }

    mock_mandate = SimpleNamespace(**mock_payment_data)
    mock_mandate.links = SimpleNamespace(**mock_payment_data["links"])

    with mock.patch(
        "backend.api.go_cardless.run_gocardless",
        new_callable=mock.AsyncMock,
    ) as mock_new_mandate:
        mock_new_mandate.return_value = mock_mandate
        body, header = _generate_gocardless_event(
            app.config["GC_WEBHOOK_SECRET"],
            {
                "events": [
                    {
                        "id": "EV_TEST_123",
                        "created_at": "2025-09-25T12:00:00Z",
                        "action": "cancelled",
                        "resource_type": "payments",
                        "links": {"payment": "PM01K4VTZPG0683KKQG337SXYEMR"},
                    }
                ]
            },
        )
        test_client = app.test_client()
        response = await test_client.post(
            "/v1/gc-webhook/",
            data=body,
            headers={
                "Content-Type": "application/json",
                "Webhook-Signature": header,
            },
            subdomain="api",
        )

        response.status_code == 200

        mandate = await select_mandate(connection, gc_id="MD01K4VVZF8R4894Z6GBR29CRK3R")
        assert mandate is not None
        assert mandate.payment_status == PaymentStatus.UNPAID


async def test_handle_payment_failed(
    app: Quart,
    connection: Connection,
) -> None:
    mock_payment_data: dict[str, Any] = {
        "id": "PM01K4VTZPG0683KKQG337SXYEMR",
        "created_at": "2025-09-11T07:31:35.549Z",
        "charge_date": "2025-09-16",
        "amount": 1234,
        "description": "Payment Triggered From Event Simulation",
        "currency": "GBP",
        "status": "failed",
        "amount_refunded": 0,
        "links": {
            "mandate": "MD01K4VVZF8R4894Z6GBR29CRK3R",
            "creditor": "CR00007FAASD1N",
            "organisation": "OR00005D5NGATG",
            "payout": "PO01K4YJY1M2B4RHV70XQZ07SNV0",
        },
        "retry_if_possible": False,
        "scheme": "bacs",
        "transaction_fee": 44,
        "payout_date": "2025-09-12",
        "payout_received_date": "2025-09-12",
        "paid_at": "2025-09-11T07:31:36.101Z",
        "app_fee": 0,
        "source": "api",
        "surcharge_fee_summary": {"chargeback_fee": 0, "failure_fee": 0},
        "tax_amount": 7,
        "failure_probability_bucket": None,
        "funds_settlement": "managed",
        "organisation_details": {"name": "Jiu Jitsu Republic", "nickname": None},
    }

    mock_mandate = SimpleNamespace(**mock_payment_data)
    mock_mandate.links = SimpleNamespace(**mock_payment_data["links"])

    with mock.patch(
        "backend.api.go_cardless.run_gocardless",
        new_callable=mock.AsyncMock,
    ) as mock_new_mandate:
        mock_new_mandate.return_value = mock_mandate
        body, header = _generate_gocardless_event(
            app.config["GC_WEBHOOK_SECRET"],
            {
                "events": [
                    {
                        "id": "EV_TEST_123",
                        "created_at": "2025-09-25T12:00:00Z",
                        "action": "failed",
                        "resource_type": "payments",
                        "links": {"payment": "PM01K4VTZPG0683KKQG337SXYEMR"},
                    }
                ]
            },
        )
        test_client = app.test_client()
        response = await test_client.post(
            "/v1/gc-webhook/",
            data=body,
            headers={
                "Content-Type": "application/json",
                "Webhook-Signature": header,
            },
            subdomain="api",
        )

        response.status_code == 200

        mandate = await select_mandate(connection, gc_id="MD01K4VVZF8R4894Z6GBR29CRK3R")
        assert mandate is not None
        assert mandate.payment_status == PaymentStatus.UNPAID
