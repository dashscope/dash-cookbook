#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   indexing.py
@Date    :   2024-06-07
@Author  :   linkesheng.lks
@Version :   1.0.0
@License :   Copyright(C) 1999-2024, All rights Reserved, Designed By Alibaba Group Inc.
@Desc    :   indexing api
"""
import asyncio
import json

from fastapi import APIRouter

from app.common.error_codes import ErrorCode
from app.common.errors import BizException
from app.common.log import log
from app.schemes.indexing import IndexingRequest
from app.schemes.indexing import IndexingResponse
from app.services.indexing_service import indexing_service

router = APIRouter()


def is_valid_json(data):
    try:
        json.loads(data)
    except json.JSONDecodeError:
        return False
    return True


def sse_data(data: str) -> str:
    return f"data: {data}\n\n"


@router.post("/updateIndex", summary="update index")
async def update_index(request: IndexingRequest):
    log.info("update index, request: %s" % json.dumps(request.dict(), ensure_ascii=False))

    asyncio.ensure_future(
        indexing_service.run(restart=request.restart,
                             doc_cate_id=request.doc_cate_id,
                             index_name=request.index_name,
                             resource_url=request.resource_url,
                             resource_selector=request.resource_selector))

    return IndexingResponse(request_id=request.request_id,
                            success=True,
                            code=None,
                            message=None,
                            items_num=0,
                            spent_minutes=0)
