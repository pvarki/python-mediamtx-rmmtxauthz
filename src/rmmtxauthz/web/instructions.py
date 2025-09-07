"""Instructions and descriptions"""

from __future__ import annotations
from typing import Optional, Dict
import logging
import json
from pathlib import Path

from pydantic import BaseModel, Field, ConfigDict
from fastapi import APIRouter, Depends, Request, HTTPException
from libpvarki.middleware import MTLSHeader
from libpvarki.schemas.product import UserCRUDRequest

from ..db.user import User
from ..db.errors import NotFound
from .usercrud import comes_from_rm, create_user
from ..mediamtx import MediaMTXControl

LOGGER = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(MTLSHeader(auto_error=True))])


# FIXME: Move to libpvarki
class ProductDescription(BaseModel):  # pylint: disable=too-few-public-methods
    """Description of a product"""

    model_config = ConfigDict(extra="forbid")

    shortname: str = Field(description="Short name for the product, used as slug/key in dicts and urls")
    title: str = Field(description="Fancy name for the product")
    icon: Optional[str] = Field(description="URL for icon")
    description: str = Field(description="Short-ish description of the product")
    language: str = Field(description="Language of this response")


@router.get(
    "/description/{language}",
    response_model=ProductDescription,
)
async def return_product_description(language: str, request: Request) -> ProductDescription:
    """The product description"""
    comes_from_rm(request)
    # FIXME: return in correct Rune format
    if language == "fi":
        return ProductDescription(
            shortname="fake",
            title="Feikkituote",
            icon=None,
            description=""""tuote" integraatioiden testaamiseen""",
            language="fi",
        )
    return ProductDescription(
        shortname="fake",
        title="Fake Product",
        icon=None,
        description="Fake product for integrations testing and examples",
        language="en",
    )


@router.post("/instructions/{language}")
async def user_intructions(user: UserCRUDRequest, request: Request, language: str) -> Dict[str, str]:
    """return user instructions"""
    comes_from_rm(request)
    try:
        dbuser = await User.by_rmuuid(user.uuid)
    except NotFound:
        dbuser = await create_user(user)

    # Use language specific rune if one is available
    instructions_json_file = Path(f"/opt/templates/mediamtx_{language}.json")
    if not instructions_json_file.is_file():
        instructions_json_file = Path("/opt/templates/mediamtx.json")

    if not instructions_json_file.is_file():
        _reason = "mediamtx json rune is missing from server."
        LOGGER.error("{} : {}".format(request.url, _reason))
        raise HTTPException(status_code=500, detail=_reason)

    instructions_data = json.loads(instructions_json_file.read_text(encoding="utf-8"))
    instructions_data.append(
        {
            "type": "Component",
            "name": "CredentialUser",
            "body": dbuser.username,
        }
    )
    instructions_data.append(
        {
            "type": "Component",
            "name": "CredentialPassword",
            "body": dbuser.mtxpassword,
        }
    )
    streams = await MediaMTXControl.singleton().get_paths(insert_credentials=f"{dbuser.username}:{dbuser.mtxpassword}@")
    streams_content = "<ul>\n"
    for streamdict in streams:
        streams_content += f"<li>{streamdict['path']}<ul>"
        for pname, purl in streamdict["urls"].items():
            streams_content += f'<li><a href="{purl}">{pname}</a></li>'
        streams_content += "</ul></li>\n"
    streams_content += "<ul>\n"
    instructions_data.append(
        {
            "type": "Component",
            "name": "StreamsList",
            "body": streams_content,
        }
    )

    return {"callsign": dbuser.username, "instructions": instructions_data, "language": language}
