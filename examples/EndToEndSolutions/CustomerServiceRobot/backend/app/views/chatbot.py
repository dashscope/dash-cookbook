import json
import time

from flask import Blueprint, Response, request, stream_with_context
from http import HTTPStatus
from dashscope import Generation
from ..functions import tools, function_call
from ..models import db, User, Product, Order, ChatHistory

chatbot = Blueprint('chatbot', __name__)


prompt_template = ("任务指令：作为线上百货商城的专业客服，为用户{}（用户ID：{}，性别：{}）提供全方位咨询服务，当前时间为{}。在利用内置工具函数处理查询请求时，如信息不足，请主动引导用户提供详细信息。"
                   "回答策略："
                   "1. **主动信息索取**：在需要调用如订单查询等工具功能时，若必要参数（如订单号）缺失，采用友好且明确的语言主动询问：“尊敬的张三，为了快速查询您的信息，请提供一下订单号好吗？”"
                   "2. **精准解答**：基于用户提出的问题，严格参照公司政策与操作流程，结合最新文档内容给予精确解答，避免无关扩展，确保用户问题得到有效解决。"
                   "3. **透明化操作**：在处理用户请求过程中，如需使用特定工具函数，简要告知用户将采取的步骤，增加服务透明度，例如：“我将通过我们的订单查询系统来获取您的订单详情，请稍候。”"
                   "4. **确认与跟进**：解答完毕后，确认用户是否满意解答，并主动询问是否有其他可以帮助的地方，如：“张三先生/女士，您的问题已解答完毕，请问还有其他方面需要我的协助吗？”"
                   "注意事项："
                   "- 维持专业且亲切的交流风格，确保每一次互动都能提升用户满意度。"
                   "- 对于所有工具函数调用，务必确保在获取足够且准确的参数后再执行，避免因信息不全导致处理错误。 "
                   "- 记录重要咨询细节，以便后续跟踪服务或内部评估使用。")


def insert_chat_history(session_id: str, message: dict) -> list:
    chatHistory = ChatHistory.query.get(session_id)
    if chatHistory:
        messages = json.loads(chatHistory.messages)
        if message != {}:
            messages.append(message)
            chatHistory.messages = json.dumps(messages, ensure_ascii=False)
            db.session.commit()
        return messages
    return []


@stream_with_context
def ai_generation(session_id: str, messages: list) -> None:
    responses = Generation.call(
        model="qwen-max",
        messages=messages,
        result_format='message',
        stream=True,
        incremental_output=False,
        tools=tools
    )

    result = ''
    for response in responses:
        if response.status_code != HTTPStatus.OK:
            result = json.dumps({"success": False, "errorMsg": response.message}, ensure_ascii=False)
        else:
            content = response.output.choices[0].message.content
            finish_reason = response.output.choices[0].finish_reason

            if finish_reason == "null":
                result = json.dumps({"success": True, "data": {"finish": False, "message": {"role": "assistant", "content": content}}}, ensure_ascii=False)
            elif finish_reason == "stop":
                message = {"role": "assistant", "content": content}
                insert_chat_history(session_id=session_id, message=message)
                result = json.dumps({"success": True, "data": {"finish": True, "message": message}}, ensure_ascii=False)
            elif finish_reason == "tool_calls":
                assistant_msg = {"role": "assistant", "content": content, "tool_calls": response.output.choices[0].message.tool_calls}
                insert_chat_history(session_id=session_id, message=assistant_msg)
                result = json.dumps({"success": True, "data": {"finish": True, "message": assistant_msg}}, ensure_ascii=False)

                for tool_call in response.output.choices[0].message.tool_calls:
                    function_name = tool_call["function"]['name']
                    function_args = tool_call["function"]["arguments"]
                    print("function name: {}, args: {}".format(function_name, function_args))
                    function_response = function_call(function_name, function_args)
                    print("function_response: {}".format(function_response))
                    tool_msg = {"role": "tool", "name": function_name, "content": function_response}
                    insert_chat_history(session_id=session_id, message=tool_msg)
            elif finish_reason == "length":
                result = json.dumps({"success": True, "data": {"finish": True, "message": "生成长度导致结束"}}, ensure_ascii=False)
        yield f"data: {result}\n\n"


@chatbot.route('/chatbot')
def view():
    return "chatbot"


@chatbot.route('/chatbot/ask', methods=['POST'])
def ask():
    data = request.get_json()
    messages = insert_chat_history(data['sessionId'], data["message"])
    if not messages:
        current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        messages.append({"role": "system", "content": prompt_template.format(data['userName'], data['userId'], data['userGender'], current_time)})
        messages.append(data["message"])
        chatHistory = ChatHistory(session_id=data['sessionId'], time=current_time, user_id=data['userId'], messages=json.dumps(messages, ensure_ascii=False))
        db.session.add(chatHistory)
        db.session.commit()

    return Response(
        ai_generation(session_id=data['sessionId'], messages=messages),
        mimetype='text/event-stream',
    )


@chatbot.route('/chatbot/summary', methods=['POST'])
def summary():
    data = request.get_json()
    chatHistory = ChatHistory.query.get(data['sessionId'])
    if not chatHistory:
        return json.dumps({"success": False, "errorMsg": "对话记录查询不到"}, ensure_ascii=False)
    messages = json.loads(chatHistory.messages)

    user_prompt = "聊天内容如下：\n"
    for message in messages:
        if message["role"] == "user":
            user_prompt += "用户问：" + message["content"]+"\n"
        elif message["role"] == "assistant":
            user_prompt += "客服答：" + message["content"]+"\n"

    sys_prompt = ("任务指令：为用户提供聊天内容总结服务。 操作指南： "
                  "1. 分析聊天记录，识别并提取关键信息点，包括但不限于讨论的主题、各方观点、提出的疑问、达成的共识或决定等。 "
                  "2. 将提取的信息整合成连贯、简洁的摘要形式，确保所有重要细节得到体现，同时避免冗余和偏题内容。 "
                  "3. 使用中立、客观的语言进行总结，不添加个人意见或解释，维持总结的客观性。 "
                  "4. 总结结尾可提供一个简短的总结语句，概括聊天的核心内容或结果。 "
                  "5. 若聊天涉及多个不同话题，可按话题分割，为每个话题提供独立的小结。 "
                  "输出格式：一段清晰、精炼的文本，概述聊天的主要内容。")

    new_messages = [{"role": "system", "content": sys_prompt}, {"role": "user", "content": user_prompt}]
    return Response(
        ai_generation(session_id="", messages=new_messages),
        mimetype='text/event-stream',
    )
