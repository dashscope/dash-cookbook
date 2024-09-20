import os
from llama_index.core import Settings
from llama_index.indices.managed.dashscope import DashScopeCloudIndex
from llama_index.llms.dashscope import DashScope
from llama_index.embeddings.dashscope import DashScopeEmbedding


class Rag:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        llm = DashScope(model_name="qwen-max")
        embed_model = DashScopeEmbedding(model_name="text-embedding-v2", text_type="query")
        Settings.llm = llm
        Settings.embed_model = embed_model

    def query(self, index_name: str, question: str) -> str:
        index = DashScopeCloudIndex(name=index_name)
        query_engine = index.as_query_engine()
        answer = query_engine.query(question)
        return str(answer)


