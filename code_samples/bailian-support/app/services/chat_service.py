#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   chat_service.py
@Date    :   2023-11-21
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2023, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   chat service logic
"""
import json
import re
import time
import traceback
from typing import Generator, Dict, List, Optional

import aiohttp
from llama_index.core import ChatPromptTemplate
from llama_index.core.bridge.pydantic import Field
from llama_index.core.base.llms.types import ChatMessage, MessageRole
from llama_index.core.chat_engine.types import ChatMode, StreamingAgentChatResponse
from llama_index.core.postprocessor.types import BaseNodePostprocessor
from llama_index.core.schema import NodeWithScore, TextNode, MetadataMode, QueryBundle
from llama_index.indices.managed.dashscope import DashScopeCloudIndex
from llama_index.llms.dashscope import DashScope, DashScopeGenerationModels
from llama_index.core.node_parser import SentenceSplitter, TextSplitter

from app.common.error_codes import ErrorCode
from app.common.errors import BizException
from app.common.log import log
from app.schemes.chat import ChatRequest, ChatResponse
from app.services.chat_history import chat_history
from settings import settings

QA_SYSTEM_PROMPT = ChatMessage(
    content=("""
# 角色
您是百炼灵积的答疑机器人，能够基于百炼灵积相关的知识库的内容回答关于阿里云百炼灵积的产品使用、API/SDK调用和常见错误等相关问题。

# 技能
## 技能1：精准信息提取
- **深入理解**：快速消化并理解文档内容，包括阿里云百炼灵积的产品文档、技术文档、API/SDK、常见问题等多种类型。
- **问题对应**：精确匹配用户提问与文档中的相关信息，无需依赖外部知识或先前经验。

## 技能2：上下文应用
- **间接引用**：在回答问题时，需间接体现对文档内容的理解，避免直接引用或提及“上下文”，确保回复自然流畅且基于当前文档。
- **逻辑推理**：基于文档逻辑推导答案，即使答案未被直接陈述，也能通过综合分析得出合理结论。

# 知识库与工具
- **依赖材料**：利用已提供的文档内容作为唯一信息源，进行问题解答。您需要仅使用提供的搜索文档为给定问题写出高质量的答案，并正确引用它们。
引用多个搜索结果时，请使用[编号]格式，注意确保这些引用直接有助于解答问题，编号需与材料原始编号一致且唯一。
如果句子至少引用一个文档，则在该句子中必须添加对应引用符号，注意在句号之前。但如果句子中确认没有引用文档内容，则不用在句子末尾加引用符号，也不能
自行凭空构造引用列表。

# 工作原则与限制
- **严格遵循上下文**：所有答案必须严格依据提供的文档内容，不得掺杂外部信息或假设。
- **不随意扩展**：仅限于文档内信息的查询与解答，不扩展至通用知识或未提及的外部资源。
- **不凭空构造引用**: 如果回答内容确实不是引用文档内容，则禁止凭空编造引用列表。
- **表达方式**：在构造答案时，避免直接指示词如“根据上下文...”，而是通过整合信息形成独立、明确的回答。

# 执行步骤
对于每个问题按照下面的推理步骤得到带引用的答案：
1. **步骤1**：我判断文档1和文档2与问题相关。
2. **步骤2**：根据文档1，我写了一个回答陈述并引用了该文档。
3. **步骤3**：根据文档2，我写一个答案声明并引用该文档。
4. **步骤4**：我将以上两个答案语句进行合并、排序和连接，以获得流畅连贯的答案。

# 典型示例
材料：
[1] 【文档名】植物中的光合作用.pdf
【标题】光合作用位置
【正文】光合作用主要在叶绿体中进行，涉及光能到化学能的转化。

[2] 【文档名】光合作用.pdf
【标题】光合作用转化
【正文】光合作用是利用阳光将CO2和H2O转化为氧气和葡萄糖的过程。

问题：光合作用的基本过程是什么？

答案：光合作用是植物、藻类和某些细菌利用阳光将二氧化碳和水转化为氧气和葡萄糖的过程[2]。这一过程主要在叶绿体中进行，
其中光能被叶绿素吸收，并通过一系列化学反应转化为化学能，存储在产生的葡萄糖中[1]。
"""),
    role=MessageRole.SYSTEM,
)

QA_PROMPT_TMPL_MSGS = [
    QA_SYSTEM_PROMPT,
    ChatMessage(
        content=(
            "下面是上下文信息: \n"
            "---------------------\n"
            "{context_str}\n"
            "---------------------\n"
            "在给定的上下文信息下，根据问题回答。"
            "问题: {query_str}\n"
        ),
        role=MessageRole.USER,
    ),
]

CONTEXT_TEMPLATE = (
    "# 当前问题的上下文信息如下:"
    "\n--------------------\n"
    "{context_str}"
    "\n--------------------\n"
)

PROMPT_TEMPLATE = (
    "请根据阿里云百炼灵积的相关知识回答问题。\n"
    "问题: {prompt_str}"
)


class CitationEditor(BaseNodePostprocessor):
    """引用编辑器"""
    metadata_mode: MetadataMode = Field(description="meta data mode")
    text_splitter: TextSplitter = Field(description="text splitter")

    def __init__(self) -> None:
        metadata_mode = MetadataMode.NONE
        text_splitter = SentenceSplitter(
            chunk_size=1024, chunk_overlap=20
        )
        super().__init__(
            metadata_mode=metadata_mode,
            text_splitter=text_splitter
        )

    @classmethod
    def class_name(cls) -> str:
        return "CitationEditor"

    def _postprocess_nodes(
        self,
        nodes: List[NodeWithScore],
        query_bundle: Optional[QueryBundle] = None,
    ) -> List[NodeWithScore]:
        """retrieved nodes后处理，改写node text"""
        new_nodes: List[NodeWithScore] = []
        for node in nodes:
            text_chunks = self.text_splitter.split_text(
                node.node.get_content(metadata_mode=self.metadata_mode)
            )

            # 按照QA_SYSTEM_PROMPT的示例格式改写node text
            for text_chunk in text_chunks:
                doc_name = node.metadata['doc_name']
                title = node.metadata['title']
                new_text = f"[{len(new_nodes)+1}] 【文档名】{doc_name}\n【标题】{title}\n【正文】{text_chunk}\n"
                new_node = NodeWithScore(
                    node=TextNode.parse_obj(node.node), score=node.score
                )
                new_node.node.text = new_text
                new_node.node.metadata['content'] = new_text
                new_nodes.append(new_node)
        return new_nodes


class ChatService:
    """大模型问答服务"""
    # 创建引用编辑器
    citation_editor = CitationEditor()
    def stream_chat(self, request: ChatRequest) -> Generator[ChatResponse, None, None]:
        if request is None or request.content is None:
            log.error("request or request content must be provided, request: %s" % request)
            raise BizException(ErrorCode.INVALID_PARAM)

        try:
            log.info("start stream chat, session id: %s" % request.request_id)

            start = time.time() * 1000
            response = self._stream_chat(request)
            spent = time.time() * 1000 - start

            log.info("end stream chat, session id: %s, spent: %d ms " % (request.request_id, spent))

            for text in response:
                yield ChatResponse(session_id=request.session_id, content=text)
        except Exception as e:
            log.error("failed to chat with stream, session id: %s, err: %s" %
                      (request.session_id, traceback.format_exc()))
            raise e

    def _stream_chat(self, request: ChatRequest) -> Generator[str, None, None]:
        query_engine = self._get_chat_engine(True)

        messages = chat_history.get_chat_history(session_id=request.session_id)

        prompt = PROMPT_TEMPLATE.format(prompt_str=request.content)
        responses = query_engine.stream_chat(prompt, chat_history=messages)

        assistant_message = ""

        for response in responses.response_gen:
            assistant_message += response
            yield response

        citations = ChatService.get_citations(responses)
        if citations:
            yield f"\n\n{citations}"

        if assistant_message:
            chat_history.add_chat_message(session_id=request.session_id,
                                          user_message=request.content,
                                          assistant_message=responses.response)

    def _chat(self, request: ChatRequest) -> str:
        query_engine = self._get_chat_engine(False)

        messages = chat_history.get_chat_history(session_id=request.session_id)

        log.info("prepare to start qa chat, request id: %s,  session id: %s" %
                 (request.request_id, request.session_id))
        start = time.time() * 1000
        prompt = PROMPT_TEMPLATE.format(prompt_str=request.content)
        responses = query_engine.chat(prompt, chat_history=messages)
        spent = time.time() * 1000 - start
        log.info("end qa chat, request id: %s, session id: %s, spent: %d ms "
                 % (request.request_id, request.session_id, spent))

        assistant_message = responses.response

        if assistant_message:
            chat_history.add_chat_message(session_id=request.session_id,
                                          user_message=request.content,
                                          assistant_message=assistant_message)

        return assistant_message

    def _get_chat_engine(self, stream: bool):
        index = DashScopeCloudIndex(name=settings.INDEX_NAME)

        llm = DashScope(model_name=DashScopeGenerationModels.QWEN_MAX,
                        max_tokens=None,
                        incremental_output=False)

        text_qa_template = ChatPromptTemplate(message_templates=QA_PROMPT_TMPL_MSGS)
        chat_engine = index.as_chat_engine(llm=llm,
                                           streaming=stream,
                                           chat_mode=ChatMode.CONTEXT,
                                           text_qa_template=text_qa_template,
                                           system_prompt=QA_SYSTEM_PROMPT.content,
                                           context_template=CONTEXT_TEMPLATE,
                                           node_postprocessors=[self.citation_editor])

        return chat_engine

    async def webhook_chat(self, message: Dict):
        conversation_id = message.get("conversationId")
        msg_id = message.get("msgId")
        message_type = message.get("msgtype")

        try:
            if message_type == "text":
                text = message.get("text", {}).get("content", None)
            else:
                log.error("unknown supported type: %s, conversation_id: %s, msg_id: %s" %
                          (conversation_id, msg_id, message_type))
                return

            request = ChatRequest(request_id=msg_id,
                                  session_id=conversation_id,
                                  session_type="text_chat",
                                  content=text)
            responses = self._stream_chat(request)
            response_text = ""

            # 超时发送提示
            start = time.time() * 1000
            send_tips = False
            for response in responses:
                response_text += response
                spent = time.time() * 1000 - start
                if spent >= settings.SEND_TIPS_TIMEOUT and not send_tips:
                    waiting_text = "小助手正在处理中，请稍后......"
                    await self._send_webhook_message(message=message,
                                                     text=waiting_text
                                                     )
                    send_tips = True

            pattern = r'```[a-z]*\n|```'
            replaced_text = re.sub(pattern, "", response_text, flags=re.DOTALL)
            await self._send_webhook_message(message=message,
                                             text=replaced_text
                                             )

        except Exception as e:
            log.error("failed to chat with stream, conversation id: %s, msg id: %s err: %s" %
                      (conversation_id, msg_id, traceback.format_exc()))
            waiting_text = "小助手出小差了，请您稍后在重试......"
            await self._send_webhook_message(message=message,
                                             text=waiting_text
                                             )

    async def _send_webhook_message(self,
                                    message: Dict,
                                    text: str):
        conversation_id = message.get("conversationId")
        msg_id = message.get("msgId")
        sender_nick = message.get("senderNick")
        session_webhook = message.get("sessionWebhook")
        at_users = message.get("atUsers")

        result = {
            "msgtype": "markdown",
            "at": {
                "isAtAll": "false",
                "atUserIds": at_users
            },
            "markdown": {
                "title": "百炼答疑机器人",
                "text": text
            }
        }

        headers = {
            "Content-Type": "application/json"
        }

        result_json = json.dumps(result, ensure_ascii=False)
        log.info("send result to ding webhook, conversation_id: %s, msg_id: %s, content: %s" %
                 (conversation_id, msg_id, result_json))
        async with aiohttp.ClientSession() as session:
            async with session.post(session_webhook, data=result_json, headers=headers) as response:
                text = await response.text()
            # response = requests.post(session_webhook, data=json.dumps(result), headers=headers)
            if response.status == 200:
                log.info("send success, conversationId: %s, msgId: %s, text: %s" %
                         (conversation_id, msg_id, text))
            else:
                log.error(
                    "send fail, conversationId: %s, msgId: %s, err: %s" %
                    (conversation_id, msg_id, text))

    @staticmethod
    def get_citations(response: StreamingAgentChatResponse) -> Optional[str]:
        matches = re.findall(r"\[(\d+)\]", response.response)
        citations = None
        if matches:
            citations = ''
            log.info('original citation codes: %s' % matches)
            matches = sorted(list(set(matches)), key=int)
            log.info('formated citation codes: %s' % matches)
            for match in matches:
                match_code = int(match)
                if 1 <= match_code <= len(response.source_nodes):
                    full_name = response.source_nodes[match_code - 1].metadata['doc_name']
                    id = full_name
                    name = full_name
                    full_name_parts = full_name.split('_')
                    if len(full_name_parts) == 2:
                        id = full_name_parts[0]
                        name = full_name_parts[1]
                    url = f"https://help.aliyun.com/product/{id}.html"
                    log.info("[%d] [%s](%s)" % (match_code, name, url))
                    citations += f"[{match}] [{name}]({url})\n"
        return citations


chat_service = ChatService()
