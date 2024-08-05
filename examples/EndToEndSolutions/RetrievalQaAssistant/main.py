#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   main.py
@Date    :   2023-11-21
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2023, All rights Reserved, Designed By Alibaba Group Inc.
@Desc    :   #TODO
"""

import uvicorn
from path import Path

from app.bootstrap.application import create_app
from settings import settings

app = create_app()

if __name__ == "__main__":
    uvicorn.run(app=f"{Path(__file__).stem}:app",
                host=settings.UVICORN_HOST,
                port=settings.UVICORN_PORT)
