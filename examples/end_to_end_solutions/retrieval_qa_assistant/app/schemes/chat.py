#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   doc_info.py
@Date    :   2023-11-21
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2023, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   Scheme definition of chat
"""
from typing import Optional

from pydantic import Field

from app.schemes.base import BaseModel


class ChatRequest(BaseModel):
    request_id: str = Field(default=None, alias='requestId')

    session_id: str = Field(default=None, alias='sessionId')

    user_action: Optional[str] = Field(default=None, alias='userAction')

    session_type: str = Field(default="text_chat", alias='sessionType')

    content: str = Field(default=None, alias='content')

    user_id: Optional[str] = Field(default=None, alias='userId')


class ChatResponse(BaseModel):
    session_id: str = Field(default=None, alias='sessionId')

    content_type: str = Field(default="text", alias='contentType')

    content: str = Field(default=None, alias='content')
