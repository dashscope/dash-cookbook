import requests


base_url = 'http://127.0.0.1:5000'

users = [
    {
        "id": "user_111113",
        "name": "张三",
        "gender": "男"
    },
    {
        "id": "user_111114",
        "name": "李四",
        "gender": "男"
    },
    {
        "id": "user_111115",
        "name": "王五",
        "gender": "男"
    },
]

products = [
    {
        "id": "product_111111",
        "name": "HUAWEI Pura 70 Ultra",
        "category": "手机",
        "price": "9999",
        "stock": "20",
        "document_id": "huawei_pura_70_ultra"
    },
    {
        "id": "product_111112",
        "name": "HUAWEI Mate 60 Pro+",
        "category": "手机",
        "price": "8999",
        "stock": "320",
        "document_id": "huawei_mate_60_pro"
    },
    {
        "id": "product_111113",
        "name": "HUAWEI MateBook X Pro",
        "category": "电脑",
        "price": "11199",
        "stock": "32",
        "document_id": "matebook_x_pro"
    },
    {
        "id": "product_111114",
        "name": "HUAWEI WATCH ULTIMATE DESIGN 非凡大师",
        "category": "手表",
        "price": "21999",
        "stock": "3",
        "document_id": "huawei_watch"
    },
]

orders = [
    {
        "number": "order_111111",
        "time": "2024-07-01 10:00:00",
        "user_id": "user_111113",
        "product_id": "product_111111",
        "logistics_status": "待发货",
    },
    {
        "number": "order_111112",
        "time": "2024-06-15 10:00:00",
        "user_id": "user_111113",
        "product_id": "product_111114",
        "logistics_status": "已签收",
    },
    {
        "number": "order_111113",
        "time": "2024-06-26 10:00:00",
        "user_id": "user_111113",
        "product_id": "product_111113",
        "logistics_status": "运输中，预计7月8日送达，今日快件离开【武汉转运中心】已发往【杭州转运中心】",
    },
]


response = requests.post(base_url + "/api/users", json=users)
print(response.text)


response = requests.post(base_url + "/api/products", json=products)
print(response.text)


response = requests.post(base_url + "/api/orders", json=orders)
print(response.text)


