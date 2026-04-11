"""MediaMTX auth routes"""

from typing import Optional, Any, Dict
import logging

from fastapi import APIRouter, HTTPException, Response

from ..db.errors import NotFound, Deleted
from ..db.user import User
from ..db.product import Product
from ..schema.mediamtx import MTXAuthReq
from ..config import RMMTXSettings

LOGGER = logging.getLogger(__name__)

mtxrouter = APIRouter()


def authreq_redact(authreq: MTXAuthReq) -> MTXAuthReq:
    """Redact secrets if present"""
    copy = authreq.model_copy()
    if copy.password:
        copy.password = "REDACTED"  # nosec # pragma: allowlist secret
    return copy


def make_log_extra(authreq: MTXAuthReq, **kwargs: Dict[str, Any]) -> Dict[str, Any]:
    """Make extra logging info"""
    ret = {
        "authreq": authreq_redact(authreq).model_dump(),
    }
    ret.update(kwargs)
    return ret


def check_apiuser(authreq: MTXAuthReq) -> Optional[Response]:
    """Check if user is this API"""
    if not authreq.user or not authreq.password:
        LOGGER.debug("No user/password, returning 401")
        raise HTTPException(status_code=401)
    conf = RMMTXSettings.singleton()
    if authreq.user != conf.api_username:
        return None
    if conf.api_password == "CHANGEME":  # pragma: allowlist secret ; # nosec
        LOGGER.audit("api_password has not been changed from default, disallowing use")  # type: ignore[attr-defined]  # pylint: disable=C0301
        raise HTTPException(status_code=401)
    if authreq.password != conf.api_password:
        raise HTTPException(status_code=401)
    return Response(status_code=204)


async def check_productuser(authreq: MTXAuthReq) -> Optional[Response]:
    """Check if the user is a product that requested interop"""
    if not authreq.user or not authreq.password:
        LOGGER.debug("No user/password, returning 401")
        raise HTTPException(status_code=401)
    try:
        dbproduct = await Product.by_cn(authreq.user)
        if authreq.password != dbproduct.mtxpassword:
            LOGGER.audit("Wrong password for {}".format(authreq.user), extra=make_log_extra(authreq))  # type: ignore[attr-defined]  # pylint: disable=C0301
            raise HTTPException(status_code=403)
        return Response(status_code=204)
    except (NotFound, Deleted):
        pass
    return None


async def check_rmuser(authreq: MTXAuthReq) -> Optional[Response]:
    """Check RM user credentials"""
    if not authreq.user or not authreq.password:
        LOGGER.debug("No user/password, returning 401")
        raise HTTPException(status_code=401)
    try:
        dbuser = await User.by_username(authreq.user)
        if authreq.password != dbuser.mtxpassword:
            LOGGER.audit("Wrong password for {}".format(authreq.user), extra=make_log_extra(authreq))  # type: ignore[attr-defined]  # pylint: disable=C0301
            raise HTTPException(status_code=403)
        if dbuser.is_rmadmin:
            LOGGER.audit("{} is admin, allowing everything".format(authreq.user), extra=make_log_extra(authreq))  # type: ignore[attr-defined]  # pylint: disable=C0301
            return Response(status_code=204)
        # Operations that require admin privileges
        if authreq.action in ("api", "metrics", "pprof") and not dbuser.is_rmadmin:
            LOGGER.audit(  # type: ignore[attr-defined]
                "{} is not admin requesting {}".format(authreq.user, authreq.action), extra=make_log_extra(authreq)
            )
            raise HTTPException(status_code=403)
        return Response(status_code=204)
    except (NotFound, Deleted) as exc:
        LOGGER.audit("Invalid user {}: {}".format(authreq.user, exc), extra=make_log_extra(authreq))  # type: ignore[attr-defined]  # pylint: disable=C0301
        raise HTTPException(status_code=403) from exc


@mtxrouter.post("/auth")
async def get_auth(authreq: MTXAuthReq) -> Response:
    """Check if username and password match and return empty ok if so"""
    LOGGER.debug("Processing {}".format(authreq_redact(authreq)))
    if not authreq.user or not authreq.password:
        LOGGER.debug("No user/password, returning 401")
        raise HTTPException(status_code=401)
    if resp := check_apiuser(authreq):
        return resp
    if resp := await check_productuser(authreq):
        return resp
    if resp := await check_rmuser(authreq):
        return resp
    LOGGER.audit("Fell through the checks, this should not happen", extra=make_log_extra(authreq))  # type: ignore[attr-defined]  # pylint: disable=C0301
    raise HTTPException(status_code=403)
