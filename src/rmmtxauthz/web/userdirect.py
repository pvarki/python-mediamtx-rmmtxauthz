"""APIs usable directly by the user with mTLS"""

import logging

from fastapi import APIRouter, Depends, Request
from libpvarki.middleware import MTLSHeader

from ..db.user import User
from ..schema.userdirect import UserCredentials

LOGGER = logging.getLogger(__name__)

userrouter = APIRouter(dependencies=[Depends(MTLSHeader(auto_error=True))])


def get_callsign(request: Request) -> str:
    """extract callsign from metadata"""
    payload = request.state.mtlsdn
    return str(payload.get("CN"))


@userrouter.get("/credentials", response_model=UserCredentials)
async def get_credentials(request: Request) -> UserCredentials:
    """Get my MediaMTX credentials"""
    user = await User.by_username(get_callsign(request))
    return UserCredentials(username=user.username, password=user.mtxpassword)
