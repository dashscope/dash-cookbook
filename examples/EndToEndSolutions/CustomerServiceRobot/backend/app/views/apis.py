from flask.views import MethodView
from flask import request, jsonify
from ..models import db, User, Product, Order, ChatHistory


class UsersApi(MethodView):
    def get(self):
        userList = []
        users = User.query.all()
        for user in users:
            userList.append(user.to_dict())
        return jsonify({"status": "success", "data": userList})

    def post(self):
        userList = request.get_json()
        for userDict in userList:
            user = User(id=userDict['id'], name=userDict['name'], gender=userDict['gender'])
            db.session.add(user)
        try:
            db.session.commit()
        except Exception as e:
            return jsonify({"status": "failed", "msg": str(e)})
        return jsonify({"status": "success"})


class ProductsApi(MethodView):
    def get(self):
        productList = []
        products = Product.query.all()
        for product in products:
            productList.append(product.to_dict())
        return jsonify({"status": "success", "data": productList})

    def post(self):
        productList = request.get_json()
        for productDict in productList:
            product = Product(id=productDict['id'], name=productDict['name'], category=productDict['category'], price=productDict['price'], stock=productDict['stock'], document_id=productDict['document_id'])
            db.session.add(product)
        try:
            db.session.commit()
        except Exception as e:
            return jsonify({"status": "failed", "msg": str(e)})
        return jsonify({"status": "success"})


class OrdersApi(MethodView):
    def get(self):
        orderList = []
        orders = Order.query.all()
        for order in orders:
            orderList.append(order.to_dict())
        return jsonify({"status": "success", "data": orderList})

    def post(self):
        orderList = request.get_json()
        for orderDict in orderList:
            order = Order(number=orderDict['number'], time=orderDict['time'], user_id=orderDict['user_id'], product_id=orderDict['product_id'], logistics_status=orderDict['logistics_status'])
            db.session.add(order)
        try:
            db.session.commit()
        except Exception as e:
            return jsonify({"status": "failed", "msg": str(e)})
        return jsonify({"status": "success"})


class ChatHistoriesApi(MethodView):
    def get(self):
        chatHistoryList = []
        chatHistories = ChatHistory.query.all()
        for chatHistory in chatHistories:
            chatHistoryList.append(chatHistory.to_dict())
        return jsonify({"status": "success", "data": chatHistoryList})
