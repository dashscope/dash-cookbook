#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   file_downloader.py
@Date    :   2023-11-21
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2023, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   http helper
"""
import requests


def download_file(url, save_path) -> tuple[bool, str]:
    response = requests.get(url=url, stream=True)
    if response.status_code != 200:
        message = f"code={response.status_code}, message={response.text}"
        return False, message

    with open(save_path, "wb") as file:
        for chunk in response.iter_content(chunk_size=4096):
            file.write(chunk)

    return True, ""
