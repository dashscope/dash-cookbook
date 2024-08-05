#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   response_model.py
@Date    :   2023-11-21
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2023, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   response model
"""
from typing import Optional, Union
from pydantic import Field

from app.schemes.base import BaseModel


class ResponseModel(BaseModel):
    request_id: str = Field(default=None, alias='requestId')

    success: bool = Field(default=True, alias='success')

    code: Optional[str] = Field(default=None, alias='errorCode')

    message: Optional[str] = Field(default=None, alias='errorMsg')

    data: Optional[Union[BaseModel]] = Field(default=None, alias='data')
