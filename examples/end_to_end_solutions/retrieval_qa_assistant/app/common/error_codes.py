#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   error_codes.py
@Date    :   2023-11-21
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2023, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   error code defination
"""
from enum import Enum


class ErrorCodeBase(Enum):
    @property
    def code(self) -> str:
        """ 错误状态码 """
        return self.value[0]

    @property
    def message(self) -> str:
        """ 错误状态码消息 """
        return self.value[1]


class ErrorCode(ErrorCodeBase):
    """ 错误状态码和消息定义 """

    INVALID_PARAM = ("100101", "invalid params")
    CHAT_ERROR = ("100102", "chat error")

