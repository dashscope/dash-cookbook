#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   chat_history.py
@Date    :   2024-06-05
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2024, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   chat history service
"""
from typing import List

import diskcache
from llama_index.core.base.llms.types import ChatMessage, MessageRole

from settings import settings


class ChatHistory:

    def __init__(self, directory: str):
        self.directory = directory
        self.cache = diskcache.Cache(directory=directory)

    @staticmethod
    def get_key(chat_id: str) -> str:
        return "chat_" + chat_id

    def add_chat_history(self, session_id: str, messages: List[ChatMessage]):
        key = self.get_key(session_id)
        self.cache.set(key, messages, expire=settings.CHAT_CACHE_EXPIRE)

    def add_chat_message(self, session_id: str, user_message: str, assistant_message: str):
        key = self.get_key(session_id)
        history = self.cache.get(key)

        if history is None:
            history = []

        if len(history) >= settings.MAX_CHAT_MESSAGE_LENGTH:
            history.pop(0)
            history.pop(1)

        history.append(ChatMessage(role=MessageRole.USER, content=user_message))
        history.append(ChatMessage(role=MessageRole.ASSISTANT, content=assistant_message))

        self.cache.set(key, history, expire=settings.CHAT_CACHE_EXPIRE)

    def get_chat_history(self, session_id: str) -> List[ChatMessage]:
        key = self.get_key(session_id)
        return self.cache.get(key)

    def delete_chat_history(self, session_id: str):
        key = self.get_key(session_id)
        self.cache.delete(key)


chat_history = ChatHistory(directory=settings.CACHE_DIR)
