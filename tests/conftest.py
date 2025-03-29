"""pytest automagics"""

from typing import Generator
import logging
from pathlib import Path

import pytest
from libadvian.logging import init_logging
from libadvian.testhelpers import monkeysession, nice_tmpdir_mod, nice_tmpdir_ses  # pylint: disable=unused-import
from pytest_docker.plugin import Services


init_logging(logging.DEBUG)
LOGGER = logging.getLogger(__name__)


# pylint: disable=W0621
@pytest.fixture(scope="session", autouse=True)
def session_env_config(  # pylint: disable=R0915,R0914
    monkeysession: pytest.MonkeyPatch,
    docker_ip: str,
    docker_services: Services,
    nice_tmpdir_ses: str,
) -> Generator[None, None, None]:
    """set the JWT auth config"""
    sessionfiles = Path(nice_tmpdir_ses)
    _sessionpersistent = sessionfiles / "data/persistent"

    with monkeysession.context() as mpatch:
        mpatch.setenv("LOG_CONSOLE_FORMATTER", "utc")
        mpatch.setenv("RMMTX_DATABASE_PORT", str(docker_services.port_for("postgres", 5432)))
        mpatch.setenv("RMMTX_DATABASE_HOST", docker_ip)
        mpatch.setenv("RMMTX_DATABASE_PASSWORD", "rmmtxauthztestpwd")

        yield
