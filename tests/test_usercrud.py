"""Test the RM CRUD endpoints"""

import logging
import uuid

import pytest
from fastapi.testclient import TestClient
from libpvarki.schemas.product import UserCRUDRequest

from rmmtxauthz.db.user import User
from rmmtxauthz.db.errors import Deleted

LOGGER = logging.getLogger(__name__)


@pytest.mark.asyncio
async def test_normal_crud(dbinstance: None, testclient: TestClient) -> None:
    """Test basic crud operations in order"""
    _ = dbinstance
    user = UserCRUDRequest(
        uuid=str(uuid.uuid4()),
        callsign="ROTTA01a",
        x509cert="-----BEGIN CERTIFICATE-----\\nMIIEwjCC...\\n-----END CERTIFICATE-----\\n",
    )
    payload = user.model_dump()
    resp = testclient.post("/api/v1/users/created", json=payload)
    assert resp.status_code == 200

    resp = testclient.put("/api/v1/users/updated", json=payload)
    assert resp.status_code == 200

    resp = testclient.post("/api/v1/users/promoted", json=payload)
    assert resp.status_code == 200
    dbuser = await User.by_rmuuid(user.uuid)
    assert dbuser.is_rmadmin is True

    resp = testclient.post("/api/v1/users/demoted", json=payload)
    assert resp.status_code == 200
    dbuser = await User.by_rmuuid(user.uuid)
    assert dbuser.is_rmadmin is False

    resp = testclient.post("/api/v1/users/revoked", json=payload)
    assert resp.status_code == 200

    with pytest.raises(Deleted):
        _dbuser = await User.by_rmuuid(user.uuid)
