"""Test the mediamtx routes"""

from typing import Generator
import logging
import uuid


import pytest
from fastapi.testclient import TestClient

from rmmtxauthz.db.user import User, generate_code
from rmmtxauthz.db.engine import EngineWrapper

LOGGER = logging.getLogger(__name__)


# pylint: disable=W0621


@pytest.fixture(scope="module")
def valid_user(dbinstance: None) -> Generator[User, None, None]:
    """A valid user"""
    _ = dbinstance
    with EngineWrapper.singleton().get_session() as session:
        dbuser = User(
            rmuuid=str(uuid.uuid4()),
            username=f"koira_{generate_code(4)}",
        )
        session.add(dbuser)
        session.commit()
        session.refresh(dbuser)
        yield dbuser
        session.delete(dbuser)
        session.commit()


def test_no_password(unauth_testclient: TestClient) -> None:
    """Test without password"""
    resp = unauth_testclient.post("/api/v1/mediamtx/auth", json={"user": "", "password": ""})
    assert resp.status_code == 401


def test_wrong_password(unauth_testclient: TestClient, valid_user: User) -> None:
    """Test without password"""
    resp = unauth_testclient.post(
        "/api/v1/mediamtx/auth",
        json={"user": valid_user.username, "password": "wrongpassword"},  # pragma: allowlist secret
    )
    assert resp.status_code == 403


def test_real_data(unauth_testclient: TestClient, valid_user: User) -> None:
    """See what gives with this real request"""
    content = '{"ip":"185.11.209.242","user":"__USERNAME__","password":"__PASSWORD__","token":"","action":"read","path":"live/icu/eetu","protocol":"hls","id":null,"query":""}'.replace(  # pylint: disable=C0301  ;  # pragma: allowlist secret
        "__USERNAME__",
        valid_user.username,
    ).replace(
        "__PASSWORD__", valid_user.mtxpassword  # pragma: allowlist secret
    )
    LOGGER.debug("POSTing '{}'".format(content))
    resp = unauth_testclient.post(
        "/api/v1/mediamtx/auth",
        content=content,
    )
    assert resp.status_code == 204


def test_wrong_username(unauth_testclient: TestClient, valid_user: User) -> None:
    """Test without password"""
    _ = valid_user
    resp = unauth_testclient.post("/api/v1/mediamtx/auth", json={"user": "nosuchuser", "password": "wrongpassword"})
    assert resp.status_code == 403


def test_right_password(unauth_testclient: TestClient, valid_user: User) -> None:
    """Test without password"""
    resp = unauth_testclient.post(
        "/api/v1/mediamtx/auth", json={"user": valid_user.username, "password": valid_user.mtxpassword}
    )
    assert resp.status_code == 204
