# 一、前言
过去一年，大模型在各种场合频频刷屏。在业界看来，它是类似于蒸汽机一样的划时代产物，将给每个人、每个企业、每个行业带来全面影响，甚至可能掀起新的一轮工业革命。但是如何将这台”蒸汽机“巧妙的整合到传统的纺纱机上，也是一个十分棘手的问题。本文将以AI客服为例，从开发者的视角探讨大模型的应用问题。
# 二、技术选型
首先，我们来了解下客服场景常见的一些问题<br />![fa469bf3-b57c-4e5c-8c2d-1e055e3ab051.png](https://intranetproxy.alipay.com/skylark/lark/0/2024/png/66356752/1721270416684-23c7937b-25cb-45c7-b0bc-b507642a20ac.png#clientId=uc7cca9ee-7c83-4&from=ui&id=u142e7aef&originHeight=960&originWidth=1280&originalType=binary&ratio=1&rotation=0&showTitle=false&size=587500&status=done&style=none&taskId=u930ab265-0707-4ac4-b09c-37b45a54931&title=)<br />从上图可以看到，客服面对的大部分问题其实都无法仅依赖大模型本身的知识进行回答。例如订单咨询、物流跟踪等问题，需要查询系统数据库；产品描述、功能咨询等问题，需要从产品说明文档中寻找答案；而处理订单取消、换货服务等流程，得对接电商后端服务的接口。那么我们该如何处理这些问题呢？解决思路是：用自然语言连接用户，用Function Call连接大模型和业务。<br />Function Call允许大模型在面对私域知识型问题时，输出一个请求调用函数的消息，其中包含所需调用的函数名、以及调用函数时所携带的参数信息。这是一种将大模型与传统应用程序连接起来的新方式，简单来说任何软件能实现的功能都可以包装成一个函数供大模型使用，它所带来的想象空间无比巨大。函数不仅可以封装查询数据库、调用API等流程，甚至可以封装文档RAG流程（检索增强内容生成）。<br />Function Call使用流程如下所示：<br />![UML时序图.jpg](https://intranetproxy.alipay.com/skylark/lark/0/2024/jpeg/66356752/1721284734452-611776a7-3ae6-4e57-8772-db7d40025961.jpeg#clientId=ue6942325-365a-4&from=ui&id=u8df9d0a9&originHeight=912&originWidth=847&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=47357&status=done&style=none&taskId=u2ef2f803-cc07-475f-9819-fdcb8df808c&title=)<br />更多资料请参考百炼帮助文档：<br />[如何使用通义千问API_大模型服务平台百炼(Model Studio)-阿里云帮助中心](https://help.aliyun.com/zh/model-studio/developer-reference/qwen-model-api-details?spm=a2c4g.11186623.0.0.7c101439MaV7kj#7cde05535euty)
# 三、业务数据
为了更直观的描述AI客服的开发过程与运行原理，这里我们先准备业务系统的数据库和产品手册，供大模型解答客户私域知识型问题时使用。
## 1、数据库
### （1）用户表
| id | name | gender |
| --- | --- | --- |
| user_111113 | 张三 | 男 |
| user_111114 | 李四 | 男 |
| user_111115 | 王五 | 男 |

### （2）产品表
| id | name | category | price | stock | document_id |
| --- | --- | --- | --- | --- | --- |
| product_111111 | Huawei Pura 70 Ultra | 手机 | 9999 | 20 | huawei_pura_70_ultra |
| product_111112 | Huawei Mate 60 Pro+ | 手机 | 8999 | 320 | huawei_mate_60_pro |
| product_111113 | Huawei MateBook X Pro | 电脑 | 11199 | 32 | matebook_x_pro |
| product_111114 | Huawei Watch Ultimate Design | 手表 | 21999 | 3 | huawei_watch |

### （3）订单表
| number | time | user_id | product_id | logistics_status |
| --- | --- | --- | --- | --- |
| order_111111 | 2024-07-01 10:00:00 | user_111113 | product_111111 | 待发货 |
| order_111112 | 2024-06-15 10:00:00 | user_111113 | product_111114 | 已签收 |
| order_111113 | 2024-06-26 10:00:00 | user_111113 | product_111113 | 运输中，预计7月8日送达，今日快件离开【武汉转运中心】已发往【杭州转运中心】 |

## 2、产品文档
![捕获.PNG](https://intranetproxy.alipay.com/skylark/lark/0/2024/png/66356752/1721293043385-78e467e7-702d-4cf5-afa1-4596b9652332.png#clientId=ud38dd301-dc63-4&from=ui&id=ued9acdbe&originHeight=175&originWidth=366&originalType=binary&ratio=1&rotation=0&showTitle=false&size=37002&status=done&style=none&taskId=u9e5ff83d-7a9f-4744-a2c6-6a015517fea&title=)
# 四、方案设计
## 1、项目架构
本项目作为大模型应用的端到端解决方案，采用python Flask框架编写了web后端服务，由阿里云百炼平台Dashscope sdk提供大模型接入能力，以及由开源社区LlamaIndex提供检索增强内容生成的能力。总体框架如下：<br />![](https://intranetproxy.alipay.com/skylark/lark/0/2024/jpeg/66356752/1722412269804-9b2396c2-fbdc-4f91-8834-97fb6378b068.jpeg)<br />其中web前端、web服务、mysql数据库等模块开发属于传统IT强项，资料繁多，本文不做详细介绍。
## 2、大模型接入
### （1）流式输出
用过大模型的同学一定对页面上对话“打字机式”效果非常熟悉：<br />![78891734-baa2-442b-b993-2dcfaee99dae.gif](https://intranetproxy.alipay.com/skylark/lark/0/2024/gif/66356752/1721717289457-5ab345bf-73e5-4eef-ab2b-9f22a986a98d.gif#clientId=u582f4217-a3e1-4&from=ui&id=u08b703e2&originHeight=708&originWidth=850&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=573602&status=done&style=none&taskId=u71dc2dab-7892-4b17-b88f-fb445d20742&title=)<br />这是由于大模型并不是一次性生成最终结果，而是逐步地生成中间结果，最终结果由中间结果拼接而成。流式输出可以实时地将中间结果返回，用户可以在模型进行输出的同时进行阅读，减少等待模型回复的时间。<br />这种一次请求多次返回的通信方式背后，其实是使用了SSE协议（Server Send Events）。SSE 是一种基于 HTTP 连接的服务器推送技术，客户端与服务器初始化好连接后，服务器可以随时向客户端发送内容更新。目前Python、Java、Javascript等主流语言对这种协议都有很好的支持。
### （2）多轮对话
为了让AI客服拥有“记忆力”，也就是记住我们聊天上下文的能力，我们需要在问题前面插入对话的历史消息。从百炼的开发文档可以得知，传递给大模型的消息体一般为：
```python
messages = [
    {"role": "system",    "content": "人设"},
    {"role": "user",      "content": "问题a"},
    {"role": "assistant", "content": "回答a"},
    {"role": "user",      "content": '问题b'},
]
```
但是在使用了Function Call能力后，消息体中也必须含有相关函数调用信息，例如：
```python
messages = [
    {"role": "system",    "content": "人设"},
    {"role": "user",      "content": "问题"},
    {"role": "assistant", "content": "", "tool_calls": [{"function": {"name": "function_name", "arguments": "function_args"}, "id": "", "type": "function"}]},
    {"role": "tool",      "content": "函数调用结果", "name": "function_name"},
    {"role": "assistant", "content": "回答"},
]
```
若历史消息中漏掉了tool_calls内容将使大模型忽略掉函数返回结果，这点在历史消息缓存模块开发时十分重要，切记！
### （3）系统提示词
系统提示词（System Prompt）是引导大模型行为和输出的重要信息，它将直接影响应用程序实际的使用效果，写好提示词是使用大模型很重要的一步。百炼平台提供在线Prompt优化工具，可以将简单的提示词优化得更加专业。<br />![2321.PNG](https://intranetproxy.alipay.com/skylark/lark/0/2024/png/66356752/1722223820477-b005dfde-5d8c-4109-b415-59b717551524.png#clientId=u8b30d33c-7c0a-4&from=ui&id=ud6b2a8cd&originHeight=727&originWidth=1236&originalType=binary&ratio=1&rotation=0&showTitle=false&size=417248&status=done&style=none&taskId=u26cc2645-fc50-47fa-ad42-1e0b755944c&title=)<br />考虑到大模型检索数据库时，可能遇到参数不全的情况，除了让它主动咨询客户外，我们还可以在系统提示词中预置一些关键信息。例如当前咨询客户的姓名、性别、id以及当前时间等，这些信息对于查询用户数据都非常有用。
```python
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
```
### （4）Function Call
Function Call为大模型的应用开辟了新的路径，使其不仅仅停留于语言理解和生成，还能充分发挥其智能化和自动化的潜力。我们在使用前，需要了解的一个原理是：大模型面对问题时是否需要调用函数是自身思考的结果，因此如何定义函数使大模型能在合适的时机使用显得尤为重要。一方面要对函数的描述信息尽可能的概要详细，包括函数功能、输入参数、参数格式、输出内容的描述；另一方面注意要设计各个函数之间的联动关系，往往一个复杂问题可能调用多个函数，而一个函数的输出信息可能是另一个函数的入参。例如在查订单信息时，我们可以直接通过订单号查询，但是当客户不记得订单号时，我们也可先根据用户id和时间段粗略的查出这段时间所有订单号，再查出订单信息。
```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_orders",
            "description": "当你想通过用户id查询一段时间内的订单时非常有用，返回结果包括订单号和商品名称",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "用户id"
                    },
                    "start_time": {
                        "type": "string",
                        "description": "开始时间，格式为%Y-%m-%d %H:%M:%S"
                    },
                    "end_time": {
                        "type": "string",
                        "description": "结束时间，格式为%Y-%m-%d %H:%M:%S"
                    }
                },
                "required": ["user_id", "start_time", "end_time"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_order",
            "description": "当你想通过订单号查询订单信息时非常有用，返回结果包含物流信息、下单时间以及商品id、名称、类型、价格、文档id等信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "number": {
                        "type": "string",
                        "description": "订单号"
                    }
                },
                "required": ["number"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_product",
            "description": "当你想通过商品名称查询商品信息时非常有用，返回结果包括商品id、商品名称、商品类型、商品价格、商品库存、商品文档id",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "商品名称"
                    }
                },
                "required": ["name"]
            }
        }
    },
]

def get_orders(user_id: str, start_time: datetime, end_time: datetime) -> str:
    pass

def get_order(number: str) -> str:
    pass

def get_product(name: str) -> str:
    pass
```
### （5）RAG
RAG的核心思想是通过检索外部知识库中的相关文档段落，并将其纳入大模型的输入中，从而提高生成结果的可靠性和准确性。从工程化角度讲，RAG包含了文档解析、文档切片、构建知识库索引、文档检索、文档召回、内容生成等一系列流程，使用百炼平台可以极大的简化开发者在这些专业领域的开发工作。<br />首先我们需要将之前准备的产品文档全部上传至百炼数据中心<br />![捕获.PNG](https://intranetproxy.alipay.com/skylark/lark/0/2024/png/66356752/1722337883831-d2e45aa0-a561-47ec-9242-cf58e5213dec.png#clientId=u9d7c4585-83c0-4&from=ui&id=u23365195&originHeight=957&originWidth=1633&originalType=binary&ratio=1&rotation=0&showTitle=false&size=796205&status=done&style=none&taskId=u1aaca43c-4d01-41fe-97aa-4570996349c&title=)<br />然后根据产品名称创建不同的知识索引，并在各个产品的知识索引中添加相关的文档，这样我们就完成了文档解析、文档切片以及构建知识库索引。<br />![34343.PNG](https://intranetproxy.alipay.com/skylark/lark/0/2024/png/66356752/1722338316839-cdd39f97-cf74-432c-a07e-9677e4de62c4.png#clientId=u9d7c4585-83c0-4&from=ui&id=uc00f99af&originHeight=941&originWidth=1873&originalType=binary&ratio=1&rotation=0&showTitle=false&size=754102&status=done&style=none&taskId=u2ed78678-68cd-4c74-97f8-49fb456fed4&title=)<br />![3213.PNG](https://intranetproxy.alipay.com/skylark/lark/0/2024/png/66356752/1722338434568-21bbd782-da31-4c9f-9120-d174018b0a92.png#clientId=u9d7c4585-83c0-4&from=ui&id=u43420575&originHeight=866&originWidth=1865&originalType=binary&ratio=1&rotation=0&showTitle=false&size=635449&status=done&style=none&taskId=u477cb308-798b-427c-bd60-6962f0bb42f&title=)<br />那么接下来我们该如何根据问题检索知识库呢？百炼结合LlamaIndex开源框架可以帮助我们解决这个问题。
```python
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
        
```
最后我们还要解决RAG与Function Call结合使用的问题，需要将RAG包装为一个函数供大模型使用。
```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "retrieving_documents",
            "description": "当你想通过商品文档id查询商品参数或功能使用说明时非常有用，返回结果为问题查询得到的答案",
            "parameters": {
                "type": "object",
                "properties": {
                    "document_id": {
                        "type": "string",
                        "description": "文档id，该值只能通过其他function查询得到"
                    },
                    "question": {
                        "type": "string",
                        "description": "问题描述，比如：该产品电池容量多大？"
                    }
                },
                "required": ["document_id", "question"]
            }
        }
    }
]

def retrieving_documents(document_id: str, question: str) -> str:
    return Rag.get_instance().query(index_name=document_id, question=question)
```
# 五、效果展示
## 1、订单及物流咨询
![3434.PNG](https://intranetproxy.alipay.com/skylark/lark/0/2024/png/66356752/1722396840173-272c9648-dba4-4ebf-9f4e-66288b0e515d.png#clientId=uf3585ebf-2bf8-4&from=ui&id=ud12b8220&originHeight=889&originWidth=655&originalType=binary&ratio=1&rotation=0&showTitle=false&size=275215&status=done&style=none&taskId=u482773f8-4fc4-421f-9b32-af30c9d6740&title=)
## 2、售前产品咨询
![767787.PNG](https://intranetproxy.alipay.com/skylark/lark/0/2024/png/66356752/1722397157758-521daeea-57cc-4a39-9ba0-be04d9c1b05b.png#clientId=uf3585ebf-2bf8-4&from=ui&id=u7b114789&originHeight=984&originWidth=637&originalType=binary&ratio=1&rotation=0&showTitle=false&size=309492&status=done&style=none&taskId=udd8ee08d-9ac0-4392-8ea1-60a84c8a39c&title=)

