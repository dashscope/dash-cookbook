#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   gunicorn.py
@Date    :   2023-11-22
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2024, All rights Reserved, Designed By Alibaba Group Inc.
@Desc    :   gunicorn management
"""
import multiprocessing
import os

log_dir = os.path.join(os.path.dirname(os.getcwd()), "logs")
os.makedirs(log_dir, exist_ok=True)

workers = multiprocessing.cpu_count()
threads = 1
bind = "%s:%d" % ("0.0.0.0", 8080)
daemon = "false"
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 500
pidfile = "/tmp/gunicorn.pid"
accesslog = os.path.join(log_dir, "gunicorn.log")
errorlog = os.path.join(log_dir, "gunicorn_error.log")
access_log_format = '%(t)s %(p)s %(h)s "%(r)s" %(s)s %(L)s %(b)s %(f)s" "%(a)s"'
loglevel = "info"
