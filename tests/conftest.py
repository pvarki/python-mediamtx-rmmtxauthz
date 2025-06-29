"""pytest automagics"""

from typing import Generator, AsyncGenerator
import asyncio
import logging

import pytest
import pytest_asyncio
from libadvian.logging import init_logging
from libadvian.testhelpers import monkeysession, nice_tmpdir_mod, nice_tmpdir_ses  # pylint: disable=unused-import
from pytest_docker.plugin import Services
from fastapi import FastAPI
from fastapi.testclient import TestClient

from rmmtxauthz.db.dbinit import init_db, drop_db
from rmmtxauthz.config import RMMTXSettings


init_logging(logging.DEBUG)
LOGGER = logging.getLogger(__name__)

# pylint: disable=W0621


@pytest.fixture(scope="function")
def testclient(app_instance: FastAPI) -> TestClient:
    """Testclient with Rasenmaeher DN"""
    client = TestClient(app_instance)
    cnf = RMMTXSettings.singleton()
    client.headers["X-ClientCert-DN"] = f"CN={cnf.rmcn},O=N/A"
    return client


@pytest.fixture(scope="function")
def product_testclient(app_instance: FastAPI) -> TestClient:
    """Testclient with Product DN"""
    client = TestClient(app_instance)
    client.headers["X-ClientCert-DN"] = "CN=fake.localmaeher.dev.pvarki.fi,O=N/A"
    return client


@pytest.fixture(scope="function")
def unauth_testclient(app_instance: FastAPI) -> TestClient:
    """Testclient without auth headers"""
    return TestClient(app_instance)


@pytest.fixture(scope="session", autouse=True)
def session_env_config(
    monkeysession: pytest.MonkeyPatch,
) -> Generator[None, None, None]:
    """Test env variables"""
    with monkeysession.context() as mpatch:
        mpatch.setenv("LOG_CONSOLE_FORMATTER", "utc")
        mpatch.setenv("LOG_LEVEL", "DEBUG")
        mpatch.setenv("DB_ECHO", "0")
        mpatch.setenv("RMMTX_API_PASSWORD", "pytestpasswd")
        yield None


@pytest.fixture(scope="session")
def app_instance(session_env_config: None) -> FastAPI:
    """app instance"""
    _ = session_env_config
    # To ensure that env mock happens before import side-effects (if any)
    from rmmtxauthz.web.application import get_app_no_init  # pylint: disable=C0415

    return get_app_no_init()


@pytest_asyncio.fixture(scope="module", loop_scope="session")
async def dbinstance(
    docker_ip: str, docker_services: Services, monkeysession: pytest.MonkeyPatch
) -> AsyncGenerator[None, None]:
    """Module scoped db instance, drops tables at end of scope"""
    with monkeysession.context() as mpatch:
        mpatch.setenv("RMMTX_DATABASE_PORT", str(docker_services.port_for("postgres", 5432)))
        mpatch.setenv("RMMTX_DATABASE_HOST", docker_ip)
        mpatch.setenv("RMMTX_DATABASE_PASSWORD", "rmmtxauthztestpwd")
        mpatch.setenv("RMMTX_DATABASE_USER", "rmmtxauthz")
        mpatch.setenv("RMMTX_DATABASE_DATABASE", "rmmtxauthz")
        await asyncio.sleep(1.0)
        await init_db()
        await asyncio.sleep(0.5)
        yield None
        await drop_db()
