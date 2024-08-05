#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   pdf_loader.py
@Date    :   2023-11-21
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2023, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   chat api
"""
import asyncio
import json
import traceback
from typing import Generator, Dict

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from app.common.error_codes import ErrorCode
from app.common.errors import BizException
from app.common.log import log
from app.schemes.chat import ChatRequest
from app.schemes.response_model import ResponseModel
from app.services.chat_service import chat_service
from settings import settings

router = APIRouter()


# executor = ThreadPoolExecutor(max_workers=10)

def is_valid_json(data):
    try:
        json.loads(data)
    except json.JSONDecodeError:
        return False
    return True


def sse_data(data: str) -> str:
    return f"data: {data}\n\n"


def chat_generator(request: ChatRequest) -> Generator[str, None, None]:
    try:
        results = chat_service.stream_chat(request=request)
        for result in results:
            data = ResponseModel(request_id=request.request_id,
                                 data=result).json()
            yield sse_data(data)

    except BizException as e:
        log.error("failed to do stream chat, request: %s, error: %s" % (request, traceback.format_exc()))

        data = ResponseModel(request_id=request.request_id,
                             success=False,
                             code=e.code,
                             message=e.message).json()
        yield sse_data(data)
    except Exception as e:
        log.error("failed to do stream chat, request: %s, error: %s" % (request, traceback.format_exc()))

        if is_valid_json(str(e)):
            err = json.loads(str(e))
            code = err.get("code", "")
            message = err.get("message", "")
        else:
            code = ErrorCode.CHAT_ERROR.code,
            code = code[0]
            message = ErrorCode.CHAT_ERROR.message

        data = ResponseModel(request_id=request.request_id,
                             success=False,
                             code=code,
                             message=message).json()
        yield sse_data(data)


@router.post("/chat", summary="chat api")
async def chat(request: ChatRequest):
    log.info("start chat, request: %s" % json.dumps(request.dict(), ensure_ascii=False))
    return StreamingResponse(chat_generator(request=request), media_type="text/event-stream")


@router.post("/ding_webhook_chat", summary="dingding chat")
async def ding_webhook_chat(message: Dict, request: Request):
    log.info("start ding webhook chat, ip: %s, request: %s" %
             (request.client.host, json.dumps(message, ensure_ascii=False)))

    token = request.headers.get("token")
    if token != settings.DING_WEBHOOK_TOKEN:
        log.error("invalid token, message: %s" % message)
        return {"errorCode": 403,
                "errorMessage": "Token does not match"}

    asyncio.ensure_future(chat_service.webhook_chat(message=message))

    log.info("end ding webhook chat, ip: %s" % request.client.host)
    return {"errorCode": 0,
            "errorMessage": "success"}


@router.post("/stopGeneration", summary="stop generation")
async def stop_generation(request: ChatRequest):
    log.info("stop generation, request: %s" % json.dumps(request.dict(), ensure_ascii=False))
    return ResponseModel(request_id=request.request_id,
                         success=True)
