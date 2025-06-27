"""FastAPI entrypoint"""

from typing import AsyncGenerator
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from libadvian.logging import init_logging
from libadvian.tasks import TaskMaster

from rmmtxauthz import __version__
from ..db.dbinit import init_db
from ..config import RMMTXSettings
from .usercrud import crudrouter
from .mediamtx import mtxrouter
from .instructions import router as irouter
from .interop import interoprouter


LOGGER = logging.getLogger(__name__)


@asynccontextmanager
async def app_lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage lifespan stuff like DB initialization"""
    _ = app
    LOGGER.debug("DB startup")
    await asyncio.gather(
        init_db(),
    )
    yield None
    LOGGER.debug("Cleanup")
    await TaskMaster.singleton().stop_lingering_tasks()  # Make sure tasks get finished


def get_app_no_init() -> FastAPI:
    """Just get the app, do not init logging etc"""
    app = FastAPI(
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
        title="RM<->MediaMTX integration API",
        lifespan=app_lifespan,
        version=__version__,
    )
    app.include_router(interoprouter, prefix="/api/v1/interop", tags=["interop"])
    app.include_router(crudrouter, prefix="/api/v1/users", tags=["users"])
    app.include_router(mtxrouter, prefix="/api/v1/mediamtx", tags=["mediamtx"])
    app.include_router(irouter, prefix="/api/v1", tags=["instructions"])
    return app


def get_app() -> FastAPI:
    """Returns the FastAPI application."""
    config = RMMTXSettings.singleton()
    loglevel = getattr(logging, config.log_level.upper(), 30)
    init_logging(loglevel)
    LOGGER.debug("Active config: {}".format(config))
    return get_app_no_init()
