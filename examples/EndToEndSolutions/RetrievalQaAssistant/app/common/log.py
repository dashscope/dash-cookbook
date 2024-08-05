#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   log.py
@Date    :   2023-11-21
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2023, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   log util
"""
import logging
import os
import sys

from loguru import logger

from settings import settings


class Logger:
    def __init__(self):
        self.log_path = settings.LOG_PATH

    def log(self) -> logger:
        if not os.path.exists(self.log_path):
            os.mkdir(self.log_path)

        log_file = os.path.join(self.log_path, settings.LOG_FILE)

        log_config = dict(rotation='10 MB', retention='15 days', compression='tar.gz', enqueue=True)
        logger.add(
            log_file,
            level='DEBUG',
            **log_config,
            backtrace=False,
            diagnose=False,
        )

        return logger


log = Logger().log()


class InterceptHandler(logging.Handler):
    def emit(self, record):
        log.log(record.levelname, record.getMessage())


# logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
logging.getLogger().addHandler(InterceptHandler())
logging.getLogger().setLevel(logging.DEBUG)
