"""Test the direct orm helpers"""

import uuid

import pytest


from rmmtxauthz.config import DBSettings
from rmmtxauthz.db.engine import EngineWrapper
from rmmtxauthz.db.product import Product
from rmmtxauthz.db.user import User, generate_code


def test_database_defaults() -> None:
    """ORM constructors accept fields generated during insertion."""
    assert DBSettings().dsn.drivername == "postgresql+psycopg2"
    for row in (
        User(rmuuid=uuid.uuid4(), username="defaults"),
        Product(certcn="defaults"),
    ):
        assert isinstance(row.pk, uuid.UUID)
        assert row.created is None
        assert row.updated is None
        assert row.deleted is None


@pytest.mark.asyncio
async def test_list_users(dbinstance: None) -> None:
    """Create some users and test the listing"""
    _ = dbinstance
    callsign = f"cs_{generate_code(6)}"
    with EngineWrapper.singleton().get_session() as session:
        dbuser = User(rmuuid=uuid.uuid4(), username=callsign)
        session.add(dbuser)
        session.commit()
        session.refresh(dbuser)
    async for user in dbuser.list():
        assert user.mtxpassword == "REDACTED"  # pragma: allowlist secret
