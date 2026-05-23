"""Routes for interoperation between products"""

from typing import Sequence
import logging
import secrets

from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from libpvarki.middleware import MTLSHeader
from libpvarki.schemas.generic import OperationResultResponse


from .usercrud import comes_from_rm
from ..db.product import Product
from ..db.errors import NotFound
from ..db.engine import EngineWrapper
from ..schema.interop import (
    ProductAddRequest,
    ProductAuthzResponse,
    ProductAuthzRequest,
    ProductStream,
    ProductStreamURLs,
)
from ..mediamtx import MediaMTXControl

LOGGER = logging.getLogger(__name__)

interoprouter = APIRouter()
basic_auth = HTTPBasic(auto_error=True)


async def get_product_from_basic(
    credentials: HTTPBasicCredentials = Depends(basic_auth),
) -> Product:
    """Authenticate product inventory access with product basic auth."""
    try:
        product = await Product.by_cn(credentials.username)
    except NotFound as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid product credentials",
            headers={"WWW-Authenticate": "Basic"},
        ) from exc
    if not secrets.compare_digest(credentials.password, product.mtxpassword):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid product credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return product


@interoprouter.post("/add", dependencies=[Depends(MTLSHeader(auto_error=True))])
async def add_product(
    product: ProductAddRequest,
    request: Request,
) -> OperationResultResponse:
    """Product needs interop privileges. This can only be called by RASENMAEHER"""
    comes_from_rm(request)
    try:
        exists = await Product.by_cn(product.certcn)
        if exists:
            LOGGER.info("Product {} already exists".format(product.certcn))
    except NotFound:
        with EngineWrapper.singleton().get_session() as session:
            dbproduct = Product(certcn=product.certcn)
            session.add(dbproduct)
            session.commit()
    result = OperationResultResponse(success=True)
    return result


@interoprouter.get("/authz", dependencies=[Depends(MTLSHeader(auto_error=True))])
async def get_authz(
    request: Request,
) -> ProductAuthzResponse:
    """Get authz info for the product"""
    payload = request.state.mtlsdn
    product = await Product.by_cn(payload.get("CN"))
    result = ProductAuthzResponse(
        type="basic",
        username=product.certcn,
        password=product.mtxpassword,
        ro_password=product.stream_ro_password,
    )
    return result


@interoprouter.post("/authz", dependencies=[Depends(MTLSHeader(auto_error=True))])
async def get_authz_for_product(
    payload: ProductAuthzRequest,
    request: Request,
) -> ProductAuthzResponse:
    """Get authz info for a source product via RM brokerage."""
    comes_from_rm(request)
    product = await Product.by_cn(payload.certcn)
    return ProductAuthzResponse(
        type="basic",
        username=product.certcn,
        password=product.mtxpassword,
        ro_password=product.stream_ro_password,
    )


@interoprouter.get("/streams", response_model=list[ProductStream])
async def get_product_streams(
    product: Product = Depends(get_product_from_basic),
) -> Sequence[ProductStream]:
    """Get active stream inventory for TAK/product integrations."""
    streams = await MediaMTXControl.singleton().get_active_paths(
        username=product.certcn,
        password=product.stream_ro_password,
    )
    return [
        ProductStream(
            path=item["path"],
            alias=item["path"].lstrip("/"),
            urls=ProductStreamURLs.model_validate({"rtmps": item["urls"].get("rtmps")}),
        )
        for item in sorted(streams, key=lambda item: item["path"])
    ]
