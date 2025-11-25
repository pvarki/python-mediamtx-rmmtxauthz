"""Endpoints for information for the end-user"""

import logging
from fastapi import APIRouter, Depends
from libpvarki.middleware import MTLSHeader
from pydantic import BaseModel, Field

from rmmtxauthz.config import RMMTXSettings

LOGGER = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(MTLSHeader(auto_error=True))])


class ClientInstructionData(BaseModel):  # pylint: disable=too-few-public-methods
    """Represents data for media mtx product"""

    api_url: str = Field(..., description="Api endpoint for this integration")

    class Config:  # pylint: disable=too-few-public-methods
        """Pydantic configs"""

        extra = "forbid"


class ClientInstructionResponse(BaseModel):  # pylint: disable=too-few-public-methods
    """Response schema for returning client mission instructions."""

    data: ClientInstructionData = Field(..., description="Container object for returned data.")

    class Config:  # pylint: disable=too-few-public-methods
        """Pydantic configs"""

        extra = "forbid"


@router.post("/clients/data", response_model=ClientInstructionResponse)
async def client_instruction_fragment() -> ClientInstructionResponse:
    """Data passed to federated component"""
    conf = RMMTXSettings.singleton()
    url = conf.mtx_address

    return ClientInstructionResponse(data=ClientInstructionData(api_url=url))
