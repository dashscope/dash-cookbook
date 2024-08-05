#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   errors.py
@Date    :   2023-11-21
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2023, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   errors definition
"""
from app.common.error_codes import ErrorCode


class BizException(Exception):
    code: str
    message: str

    def __init__(self, error: ErrorCode):
        if error is not None:
            self.code = error.code
            self.message = error.message
