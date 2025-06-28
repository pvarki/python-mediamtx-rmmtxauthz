""" "User actions"""

import logging

from fastapi import APIRouter, Depends, Request, HTTPException
from libpvarki.middleware import MTLSHeader
from libpvarki.schemas.product import UserCRUDRequest
from libpvarki.schemas.generic import OperationResultResponse

from ..config import RMMTXSettings
from ..db.engine import EngineWrapper
from ..db.errors import NotFound
from ..db.user import User

LOGGER = logging.getLogger(__name__)

crudrouter = APIRouter(dependencies=[Depends(MTLSHeader(auto_error=True))])


def comes_from_rm(request: Request) -> None:
    """Check the CN, raises 403 if not"""
    payload = request.state.mtlsdn
    if payload.get("CN") != RMMTXSettings.singleton().rmcn:
        raise HTTPException(status_code=403)


async def create_user(user: UserCRUDRequest) -> User:
    """Be more dry"""
    with EngineWrapper.singleton().get_session() as session:
        dbuser = User(rmuuid=user.uuid, username=user.callsign)
        session.add(dbuser)
        session.commit()
        session.refresh(dbuser)
        return dbuser


@crudrouter.post("/created")
async def user_created(
    user: UserCRUDRequest,
    request: Request,
) -> OperationResultResponse:
    """New device cert was created"""
    comes_from_rm(request)
    await create_user(user)
    result = OperationResultResponse(success=True)
    return result


# While delete would be semantically better it takes no body and definitely forces the
# integration layer to keep track of UUIDs
@crudrouter.post("/revoked")
async def user_revoked(
    user: UserCRUDRequest,
    request: Request,
) -> OperationResultResponse:
    """Device cert was revoked"""
    comes_from_rm(request)
    dbuser = await User.by_rmuuid(user.uuid)
    await dbuser.delete()
    result = OperationResultResponse(success=True)
    return result


@crudrouter.post("/promoted")
async def user_promoted(
    user: UserCRUDRequest,
    request: Request,
) -> OperationResultResponse:
    """Device cert was promoted to admin privileges"""
    comes_from_rm(request)
    try:
        dbuser = await User.by_rmuuid(user.uuid)
    except NotFound:
        LOGGER.warning("User '{}' did not exist, creating transparently".format(user.callsign))
        dbuser = await create_user(user)
    with EngineWrapper.singleton().get_session() as session:
        dbuser.is_rmadmin = True
        session.add(dbuser)
        session.commit()
    result = OperationResultResponse(success=True)
    return result


@crudrouter.post("/demoted")
async def user_demoted(
    user: UserCRUDRequest,
    request: Request,
) -> OperationResultResponse:
    """Device cert was demoted to standard privileges"""
    comes_from_rm(request)
    try:
        dbuser = await User.by_rmuuid(user.uuid)
    except NotFound:
        LOGGER.warning("User '{}' did not exist, creating transparently".format(user.callsign))
        dbuser = await create_user(user)
    with EngineWrapper.singleton().get_session() as session:
        dbuser.is_rmadmin = False
        session.add(dbuser)
        session.commit()
    result = OperationResultResponse(success=True)
    return result


@crudrouter.put("/updated")
async def user_updated(
    user: UserCRUDRequest,
    request: Request,
) -> OperationResultResponse:
    """Device callsign updated"""
    comes_from_rm(request)
    # We do not really care, but check that the user exists for create if not
    try:
        dbuser = await User.by_rmuuid(user.uuid)
    except NotFound:
        LOGGER.warning("User '{}' did not exist, creating transparently".format(user.callsign))
        dbuser = await create_user(user)
    _ = dbuser
    result = OperationResultResponse(success=True)
    return result
