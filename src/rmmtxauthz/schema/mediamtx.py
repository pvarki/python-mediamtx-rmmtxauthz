"""MediaMTX schemas"""

from __future__ import annotations
import logging

from pydantic import BaseModel, Field, ConfigDict

LOGGER = logging.getLogger(__name__)


class MTXAuthReq(BaseModel):
    """
    https://github.com/bluenviron/mediamtx?tab=readme-ov-file#http-based
    {
      "user": "user",
      "password": "password",  # pragma: allowlist secret
      "ip": "ip",
      "action": "publish|read|playback|api|metrics|pprof",
      "path": "path",
      "protocol": "rtsp|rtmp|hls|webrtc|srt",
      "id": "id",
      "query": "query"
    }
    """

    model_config = ConfigDict(extra="ignore")

    user: str = Field(description="Username, may be empty if user is not provided yet", default="")
    password: str = Field(description="Password, may be empty if user+password is not provided yet", default="")
    ip: str = Field(description="IP address of the client from MediaMTX PoV", default="")
    action: str = Field(description="Action user wants to take", default="")
    path: str = Field(description="Path user wants to use", default="")
    protocol: str = Field(description="Protocol user wants to use", default="")
    id: str = Field(description="FIXME: Figure out what this actually means", default="")
    query: str = Field(description="FIXME: Figure out what this actually means", default="")
