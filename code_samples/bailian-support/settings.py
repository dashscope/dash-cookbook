#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   settings.py
@Date    :   2023-11-21
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2023, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   global settings
"""
import os
from functools import lru_cache


def get_base_path() -> str:
    base_path = os.environ.get("APP_HOME")
    if base_path is None:
        base_path = os.path.expanduser("~")

    return base_path


class Settings:
    # Uvicorn
    UVICORN_HOST: str = "0.0.0.0"
    UVICORN_PORT: int = 8080

    LOG_PATH: str = os.path.join(get_base_path(), "logs")
    LOG_FILE: str = os.path.join(LOG_PATH, "app.log")
    LOG_LEVEL: str = "DEBUG"

    INDEX_NAME = "your_index_name_on_bailian"
    CORS_ORIGINS = ["http://127.0.0.1:8080"]

    CACHE_DIR = os.path.join(get_base_path(), "cache")
    CHAT_CACHE_EXPIRE = 60 * 15
    MAX_CHAT_MESSAGE_LENGTH = 10

    STATIC_DIR = "frontend/build"
    DING_WEBHOOK_TOKEN = "your_webhook_token_on_dingtalk"
    SEND_TIPS_TIMEOUT = 5000

    # Indexing Service运行配置
    INDEXING_UPDATE_INTERVAL = 2 * 60 * 60
    # 百炼平台相关配置
    INDEXING_DOC_CATE_ID = "your_category_id_on_bailian"
    INDEXING_REPO_NAME = INDEX_NAME
    INDEXING_FILE_DIR = os.path.join(get_base_path(), "indexing_docs")
    # 百炼官方帮助网页的配置
    INDEXING_ROOT_URL = "https://help.aliyun.com/zh/model-studio/"
    INDEXING_ROOT_SELECTOR = "ul#common-menu-container"
    INDEXING_EXCLUDED_IDS = ["2712164", "2411865"]
    INDEXING_TIME_TAG = ".Header--updateTime--YXGPhcZ"
    INDEXING_TIME_PATTERN = r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'
    INDEXING_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"
    # MySQL相关配置(如果选择MySQL)
    INDEXING_DB_PATH = os.path.join(get_base_path(), "resource.db")
    INDEXING_DB_HOST = "your_host"
    INDEXING_DB_USER = "your_user_name"
    INDEXING_DB_PASSWORD = "your_password"
    INDEXING_DB_SCHEMA = "your_schema"


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()
