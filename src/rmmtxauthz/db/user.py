"""Users"""

from __future__ import annotations
from typing import AsyncGenerator, Self
import logging

from sqlmodel import Field, select

from .base import ORMBaseModel
from .engine import EngineWrapper
from .errors import NotFound, Deleted

LOGGER = logging.getLogger(__name__)


class User(ORMBaseModel, table=True):
    """Users"""

    __tablename__ = "users"

    username: str = Field(index=True, unique=True, description="Unique username")
    mtxpassword: str = Field(description="Plaintext password we give to user for using MediaMTX")

    @classmethod
    async def by_username(cls, username: str, allow_deleted: bool = False) -> Self:
        """Get by username"""
        with EngineWrapper.get_session() as session:
            statement = select(cls).where(cls.username == username)
            obj = session.exec(statement).first()
        if not obj:
            raise NotFound()
        if obj.deleted and not allow_deleted:
            raise Deleted()
        return obj

    @classmethod
    async def list(
        cls,
        include_deleted: bool = False,
    ) -> AsyncGenerator["User", None]:
        """List users, optionally including deleted users"""
        with EngineWrapper.get_session() as session:
            statement = select(cls)
            if not include_deleted:
                statement = statement.where(
                    cls.deleted == None  # pylint: disable=C0121 ; # "is None" will create invalid query
                )
            results = session.exec(statement)
            for result in results:
                result.password = "REDACTED"  # nosec  # pragma: allowlist secret
                yield result
