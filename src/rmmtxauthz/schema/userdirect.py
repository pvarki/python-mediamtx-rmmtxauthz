"""Schemas for direct user mTLS routes"""

from pydantic import Field, BaseModel, ConfigDict


class UserCredentials(BaseModel):
    """Request to add product interoperability."""

    username: str = Field(description="MediaMTX username")
    password: str = Field(description="MediaMTX password")

    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "examples": [
                {
                    "username": "KOIRA11a",
                    "password": "SomethingRandom",  # pragma: allowlist secret
                },
            ],
        },
    )
