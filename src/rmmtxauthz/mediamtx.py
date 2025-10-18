"""MediaMTX control API abstraction"""

from typing import Optional, ClassVar, Sequence, Dict, Any
import logging
from dataclasses import dataclass
import ssl
from pathlib import Path

import aiohttp
from libpvarki.mtlshelp.context import get_ca_context

from .config import RMMTXSettings

LOGGER = logging.getLogger(__name__)


@dataclass
class MediaMTXControl:
    """MediaMTX control API abstraction"""

    _singleton: ClassVar[Optional["MediaMTXControl"]] = None

    @classmethod
    def singleton(cls) -> "MediaMTXControl":
        """Return singleton"""
        if not MediaMTXControl._singleton:
            MediaMTXControl._singleton = MediaMTXControl()
        return MediaMTXControl._singleton

    def get_session(self) -> aiohttp.ClientSession:
        """Get session"""
        cnf = RMMTXSettings.singleton()
        auth = aiohttp.BasicAuth(login=cnf.api_username, password=cnf.api_password)
        cadir = Path("/ca_public")
        if cadir.is_dir():
            ctx = get_ca_context(ssl.Purpose.SERVER_AUTH, cadir)
            conn = aiohttp.TCPConnector(ssl=ctx)
            return aiohttp.ClientSession(connector=conn, auth=auth, base_url=cnf.api_url, raise_for_status=True)
        # Fallback
        return aiohttp.ClientSession(auth=auth, base_url=cnf.api_url, raise_for_status=True)

    async def get_paths(self, insert_credentials: str = "") -> Sequence[Dict[str, Any]]:
        """Get active paths and generate their corresponding urls for each protocol
        insert_credentials MUST be in format: username:password@"""
        ret = []
        cnf = RMMTXSettings.singleton()
        protocols = cnf.protocols
        async with self.get_session() as session:
            resp = await session.get("/v3/paths/list", params={"itemsPerPage": 1000})
            payload = await resp.json()
            for plitem in payload["items"]:
                path = f"/{plitem['name']}"
                item = {
                    "path": path,
                    "urls": {},
                }
                for pname, pinfo in protocols.items():
                    url = f"{pinfo.proto}://{insert_credentials}{cnf.mtx_address}:{pinfo.port}{path}"
                    item["urls"][pname] = url  # type: ignore[index]
                ret.append(item)
        return ret
