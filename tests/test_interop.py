"""Test the interop endpoints"""

from base64 import b64encode
import logging

import pytest
from fastapi.testclient import TestClient

from rmmtxauthz.mediamtx import MediaMTXControl
from rmmtxauthz.schema.interop import (
    ProductAddRequest,
    ProductAuthzResponse,
    ProductStream,
)
from rmmtxauthz.db.product import Product

LOGGER = logging.getLogger(__name__)


async def ensure_product(
    testclient: TestClient, certcn: str = "fake.localmaeher.dev.pvarki.fi"
) -> Product:
    """Ensure a product exists for interop tests."""
    req = ProductAddRequest(
        certcn=certcn,
        x509cert="-----BEGIN CERTIFICATE-----\\nMIIEwjCC...\\n-----END CERTIFICATE-----\\n",
    )
    resp = testclient.post("/api/v1/interop/add", json=req.model_dump())
    assert resp.status_code == 200
    return await Product.by_cn(certcn)


@pytest.mark.asyncio
async def test_add(dbinstance: None, testclient: TestClient) -> None:
    """Test adding of product"""
    _ = dbinstance
    await ensure_product(testclient)
    dbproduct = await Product.by_cn("fake.localmaeher.dev.pvarki.fi")
    assert dbproduct


@pytest.mark.asyncio
async def test_authz(
    dbinstance: None, testclient: TestClient, product_testclient: TestClient
) -> None:
    """Test adding of product"""
    _ = dbinstance
    await ensure_product(testclient)
    resp = product_testclient.get("/api/v1/interop/authz")
    assert resp.status_code == 200
    parsed = ProductAuthzResponse.model_validate_json(resp.text)
    assert parsed
    assert parsed.type == "basic"
    assert parsed.username == "fake.localmaeher.dev.pvarki.fi"
    assert parsed.token is None


@pytest.mark.asyncio
async def test_brokered_authz(dbinstance: None, testclient: TestClient) -> None:
    """RM can fetch authz for a source product."""
    _ = dbinstance
    product = await ensure_product(testclient)
    resp = testclient.post("/api/v1/interop/authz", json={"certcn": product.certcn})
    assert resp.status_code == 200
    parsed = ProductAuthzResponse.model_validate_json(resp.text)
    assert parsed.username == product.certcn
    assert parsed.password == product.mtxpassword
    assert parsed.ro_password == product.stream_ro_password


@pytest.mark.asyncio
async def test_stream_inventory(
    dbinstance: None,
    testclient: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Product inventory returns active streams with read-only watch URLs."""
    _ = dbinstance
    product = await ensure_product(testclient)

    async def fake_get_active_paths(
        self: MediaMTXControl, username: str, password: str = ""
    ) -> list[dict[str, object]]:
        assert username == product.certcn
        assert password == product.stream_ro_password
        return [
            {
                "path": "/live/demo",
                "urls": {
                    "rtmps": f"rtmps://streams.example.test:1936/live/demo?user={username}&pass={password}",
                },
            }
        ]

    monkeypatch.setattr(MediaMTXControl, "get_active_paths", fake_get_active_paths)
    authz = b64encode(f"{product.certcn}:{product.mtxpassword}".encode("utf-8")).decode(
        "ascii"
    )
    resp = testclient.get(
        "/api/v1/interop/streams", headers={"Authorization": f"Basic {authz}"}
    )
    assert resp.status_code == 200
    parsed = [ProductStream.model_validate(item) for item in resp.json()]
    assert len(parsed) == 1
    assert parsed[0].path == "/live/demo"
    assert parsed[0].alias == "live/demo"
    assert parsed[0].urls.rtmps
    assert product.stream_ro_password in parsed[0].urls.rtmps
