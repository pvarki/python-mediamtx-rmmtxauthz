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
from rmmtxauthz.web.application import get_app_no_init


init_logging(logging.DEBUG)
LOGGER = logging.getLogger(__name__)

# pylint: disable=W0621


@pytest.fixture(scope="session")
def app_instance() -> FastAPI:
    """app instance"""
    return get_app_no_init()


@pytest.fixture(scope="function")
def testclient(app_instance: FastAPI) -> TestClient:
    """Plain TestClient instance"""
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
        yield None


@pytest_asyncio.fixture(scope="module", loop_scope="session")
async def dbinstance(
    docker_ip: str, docker_services: Services, monkeysession: pytest.MonkeyPatch
) -> AsyncGenerator[None, None]:
    """Module scoped db instance, drops tables at end of scope"""
    with monkeysession.context() as mpatch:
        mpatch.setenv("RMMTX_DATABASE_PORT", str(docker_services.port_for("postgres", 5432)))
        mpatch.setenv("RMMTX_DATABASE_HOST", docker_ip)
        mpatch.setenv("RMMTX_DATABASE_PASSWORD", "rmmtxauthztestpwd")
        await asyncio.sleep(1.0)
        await init_db()
        await asyncio.sleep(0.5)
        yield None
        await drop_db()
