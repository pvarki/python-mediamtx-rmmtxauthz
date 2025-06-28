"""Configurations"""

from typing import ClassVar, Optional, Annotated
import logging

from pydantic import Field
from pydantic.types import StringConstraints
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine.url import URL
from sqlalchemy import util

LOGGER = logging.getLogger(__name__)

UCStr = Annotated[str, StringConstraints(to_upper=True)]


class DBSettings(BaseSettings):
    """Database settings"""

    driver: str = "postgresql"
    host: str = "localhost"
    port: int = 5432
    user: str = "rmmtx"
    password: str = "<PASSWORD>"  # pragma: allowlist secret
    database: str = "rmmtx"
    echo: bool = False

    model_config = SettingsConfigDict(env_prefix="RMMTX_DATABASE_", extra="ignore")

    _singleton: ClassVar[Optional["DBSettings"]] = None

    @property
    def dsn(self) -> URL:
        """Return the DSN URL for the db"""
        return URL(
            drivername=self.driver,
            username=self.user,
            password=self.password,
            host=self.host,
            port=self.port,
            database=self.database,
            query=util.EMPTY_DICT,
        )

    @classmethod
    def singleton(cls) -> "DBSettings":
        """Return singleton"""
        if not DBSettings._singleton:
            DBSettings._singleton = DBSettings()
        return DBSettings._singleton


class RMMTXSettings(BaseSettings):  # pylint: disable=too-few-public-methods
    """
    Application settings.

    These parameters can be configured
    with environment variables.
    """

    host: str = "127.0.0.1"
    port: int = 8005
    # quantity of workers for uvicorn
    workers_count: int = 1
    # Enable uvicorn reloading
    reload: bool = True
    log_level: UCStr = Field(default="DEBUG", alias="LOG_LEVEL")
    rmcn: str = Field(default="rasenmaeher", description="expected CN for RASENMAEHERs mTLS cert")

    model_config = SettingsConfigDict(env_prefix="RMMTX_", extra="ignore")

    _singleton: ClassVar[Optional["RMMTXSettings"]] = None

    @classmethod
    def singleton(cls) -> "RMMTXSettings":
        """Return singleton"""
        if not RMMTXSettings._singleton:
            RMMTXSettings._singleton = RMMTXSettings()
        return RMMTXSettings._singleton
