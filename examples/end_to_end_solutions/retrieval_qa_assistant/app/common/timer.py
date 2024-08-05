#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   timer.py
@Date    :   2024-06-12
@Author  :   linkesheng.lks
@Version :   1.0.0
@License :   Copyright(C) 1999-2024, All rights Reserved, Designed By Alibaba Group Inc.
@Desc    :   timer
"""
import threading
import time
from app.common.log import log


class Timer:
    def __init__(self, interval, function, *args, **kwargs):
        self.interval = interval
        self.function = function
        self.args = args
        self.kwargs = kwargs
        self.stop_event = threading.Event()
        self.thread = threading.Thread(target=self._run)

    def start(self):
        self.stop_event.clear()
        if not self.thread.is_alive():
            self.thread = threading.Thread(target=self._run)
            self.thread.start()

    def stop(self):
        self.stop_event.set()
        self.thread.join()

    def _run(self):
        next_call = time.time()
        while not self.stop_event.is_set():
            log.info("trigger ....")
            self.function(*self.args, **self.kwargs)
            next_call += self.interval
            sleep_time = max(0, next_call - time.time())
            self.stop_event.wait(sleep_time)
