#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   application.py
@Date    :   2023-11-21
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2023, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   bootstrap application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

from app.routes.routers import api_router
from settings import settings

app = FastAPI()


def create_app() -> FastAPI:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    app.mount("/", StaticFiles(directory=settings.STATIC_DIR), name="static")

    return app


@app.get("/")
async def read_index():
    return FileResponse(f"{settings.STATIC_DIR}/index.html")
