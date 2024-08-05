#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   indexing.py
@Date    :   2024-06-07
@Author  :   linkesheng.lks
@Version :   1.0.0
@License :   Copyright(C) 1999-2024, All rights Reserved, Designed By Alibaba Group Inc.
@Desc    :   Scheme definition of indexing
"""
from typing import Optional, Union
from pydantic import Field
from app.schemes.base import BaseModel


class IndexingRequest(BaseModel):
    request_id: str = Field(default=None, alias='requestId')

    restart: bool = Field(default=True, alias='restart')

    times: int = Field(default=0, alias='times')

    doc_cate_id: str = Field(default=None, alias='docCateId')

    index_name: str = Field(default=None, alias='indexName')

    resource_url: str = Field(default=None, alias='resourceUrl')

    resource_selector: str = Field(default=None, alias='resourceSelector')


class IndexingResponse(BaseModel):
    request_id: str = Field(default=None, alias='requestId')

    success: bool = Field(default=True, alias='success')

    code: Optional[str] = Field(default=None, alias='errorCode')

    message: Optional[str] = Field(default=None, alias='errorMsg')

    items_num: Optional[int] = Field(default=None, alias='itemsNum')

    spent_minutes: Optional[int] = Field(default=None, alias='spentMinutes')
