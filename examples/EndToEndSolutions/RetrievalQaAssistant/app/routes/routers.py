#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   routers.py
@Date    :   2023-11-21
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2023, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   api routers
"""
from fastapi import APIRouter
from app.api.chat import router as chat_router
from app.api.indexing import router as indexing_router

api_router = APIRouter(prefix="/v1")

api_router.include_router(chat_router, tags=["chat"])

api_router.include_router(indexing_router, tags=["indexing"])
