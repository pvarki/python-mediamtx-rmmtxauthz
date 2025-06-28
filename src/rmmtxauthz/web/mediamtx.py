"""MediaMTX auth routes"""

from typing import Optional
import logging

from fastapi import APIRouter, HTTPException, Response

from ..db.errors import NotFound, Deleted
from ..db.user import User
from ..db.product import Product
from ..schema.mediamtx import MTXAuthReq
from ..config import RMMTXSettings

LOGGER = logging.getLogger(__name__)

mtxrouter = APIRouter()


def check_apiuser(authreq: MTXAuthReq) -> Optional[Response]:
    """Check if user is this API"""
    conf = RMMTXSettings.singleton()
    if authreq.user != conf.api_username:
        return None
    if conf.api_password == "CHANGEME":  # pragma: allowlist secret ; # nosec
        LOGGER.error("api_password has not been changed from default, disallowing use")
        raise HTTPException(status_code=401)
    if authreq.password != conf.api_password:
        raise HTTPException(status_code=401)
    return Response(status_code=204)


async def check_productuser(authreq: MTXAuthReq) -> Optional[Response]:
    """Check if the user is a product that requested interop"""
    try:
        dbproduct = await Product.by_cn(authreq.user)
        if authreq.password != dbproduct.mtxpassword:
            LOGGER.error("Wrong password for {}".format(authreq.user))
            raise HTTPException(status_code=403)
        return Response(status_code=204)
    except (NotFound, Deleted):
        pass
    return None


async def check_rmuser(authreq: MTXAuthReq) -> Optional[Response]:
    """Check RM user credentials"""
    try:
        dbuser = await User.by_username(authreq.user)
        if authreq.password != dbuser.mtxpassword:
            LOGGER.error("Wrong password for {}".format(authreq.user))
            raise HTTPException(status_code=403)
        # Operations that require admin privileges
        if authreq.action in ("api", "metrics", "pprof") and not dbuser.is_rmadmin:
            LOGGER.error("{} is not admin requesting {}".format(authreq.user, authreq.action))
            raise HTTPException(status_code=403)
        return Response(status_code=204)
    except (NotFound, Deleted) as exc:
        LOGGER.error("Invalid user {}: {}".format(authreq.user, exc))
        raise HTTPException(status_code=403) from exc


@mtxrouter.post("/auth")
async def get_auth(authreq: MTXAuthReq) -> Response:
    """Check if username and password match and return empty ok if so"""
    if not authreq.user or not authreq.password:
        raise HTTPException(status_code=401)
    if resp := check_apiuser(authreq):
        return resp
    if resp := await check_productuser(authreq):
        return resp
    if resp := await check_rmuser(authreq):
        return resp
    LOGGER.error("Fell through the checks, this should not happen")
    raise HTTPException(status_code=403)
