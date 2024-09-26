import json
from datetime import datetime
from .models import db, User, Product, Order, ChatHistory
from .rag import Rag


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


def get_orders(user_id: str, start_time: datetime, end_time: datetime) -> str:
    result = []
    datas = db.session.query(Order, Product).filter(Order.user_id == user_id, Order.time >= start_time, Order.time <= end_time, Order.product_id == Product.id).all()
    for order, product in datas:
        result.append("订单号：" + order.number + "；商品名称：" + product.name)
    return json.dumps(result, ensure_ascii=False)


def get_order(number: str) -> str:
    order = Order.query.get(number)
    if order is None:
        return "订单不存在"
    product = Product.query.get(order.product_id)
    if product is None:
        return "商品信息不存在"

    result = "下单时间：" + order.time.strftime("%Y-%m-%d %H:%M:%S") + "；物流状态：" + order.logistics_status + "；商品id：" + order.product_id + "；商品名称：" + product.name + "；商品类型：" + product.category + "；商品价格：" + product.price + "；商品文档id：" + product.document_id
    return result


def get_product(name: str) -> str:
    product = Product.query.filter(Product.name.ilike("%{}%".format(name))).first()
    if product is None:
        return "商品未查询到"
    result = "商品id：" + product.id + "商品名称：" + product.name + "；商品类型：" + product.category + "；商品价格：" + product.price + "；商品库存：" + str(product.stock) + "；商品文档id：" + product.document_id
    return result


def retrieving_documents(document_id: str, question: str) -> str:
    product = Product.query.filter(Product.document_id == document_id).first()
    if product is None:
        return "商品文档id错误，查询不到相关文档"
    return Rag.get_instance().query(index_name=document_id, question=question)


def function_call(name: str, args: str) -> str:
    argsDict = json.loads(args)
    if name == "get_orders":
        if argsDict.get("user_id") and argsDict.get("start_time") and argsDict.get("end_time"):
            start_time = datetime.strptime(argsDict["start_time"], "%Y-%m-%d %H:%M:%S")
            end_time = datetime.strptime(argsDict["end_time"], "%Y-%m-%d %H:%M:%S")
            return get_orders(user_id=argsDict['user_id'], start_time=start_time, end_time=end_time)
    elif name == "get_order":
        if argsDict.get("number"):
            return get_order(number=argsDict['number'])
    elif name == "get_product":
        if argsDict.get("name"):
            return get_product(name=argsDict['name'])
    elif name == "retrieving_documents":
        if argsDict.get("document_id") and argsDict.get("question"):
            return retrieving_documents(document_id=argsDict["document_id"], question=argsDict["question"])
    else:
        return "函数不存在"
    return "函数入参不全"
