"""MediaMTX auth routes"""

import logging

from fastapi import APIRouter, HTTPException, Response

from ..db.errors import NotFound, Deleted
from ..db.user import User
from ..schema.mediamtx import MTXAuthReq

LOGGER = logging.getLogger(__name__)

mtxrouter = APIRouter()


@mtxrouter.post("/auth")
async def get_auth(authreq: MTXAuthReq) -> Response:
    """Check if username and password match and return empty ok if so"""
    if not authreq.user or not authreq.password:
        raise HTTPException(status_code=401)
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
