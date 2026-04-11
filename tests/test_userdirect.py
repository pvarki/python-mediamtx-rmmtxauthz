"""Direct user routes"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from rmmtxauthz.db.user import User
from rmmtxauthz.config import RMMTXSettings
from .test_mediamtx import valid_user  # pylint: disable=W0611


# pylint: disable=W0621


@pytest.fixture(scope="function")
def user_testclient(app_instance: FastAPI, valid_user: User) -> TestClient:
    """Testclient with user DN"""
    client = TestClient(app_instance)
    client.headers["X-ClientCert-DN"] = f"CN={valid_user.username},O=N/A"
    return client


def test_srt(user_testclient: TestClient) -> None:
    """SRT passwords"""
    client = user_testclient
    resp = client.get(
        "/api/v1/direct/srt_default",
    )
    payload = resp.json()
    cnf = RMMTXSettings.singleton()
    assert payload["publish"] == cnf.srt_pub_password
    assert payload["read"] == cnf.srt_read_password


def test_credentials(user_testclient: TestClient, valid_user: User) -> None:
    """SRT passwords"""
    client = user_testclient
    resp = client.get(
        "/api/v1/direct/credentials",
    )
    payload = resp.json()
    assert payload["username"] == valid_user.username
    assert payload["password"] == valid_user.mtxpassword
