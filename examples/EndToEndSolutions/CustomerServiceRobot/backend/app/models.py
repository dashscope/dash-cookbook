from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    gender = db.Column(db.String(50), nullable=False)

    def __init__(self, id, name, gender):
        self.id = id
        self.name = name
        self.gender = gender

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'gender': self.gender
        }


class Product(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.String(50), nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    document_id = db.Column(db.String(50), nullable=False)

    def __init__(self, id, name, category, price, stock, document_id):
        self.id = id
        self.name = name
        self.category = category
        self.price = price
        self.stock = stock
        self.document_id = document_id

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'price': self.price,
            'stock': self.stock,
            'document_id': self.document_id
        }


class Order(db.Model):
    number = db.Column(db.String(50), primary_key=True)
    time = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.String(50), db.ForeignKey('product.id'), nullable=False)
    logistics_status = db.Column(db.String(50), nullable=False)

    def __init__(self, number, time, user_id, product_id, logistics_status):
        self.number = number
        self.time = time
        self.user_id = user_id
        self.product_id = product_id
        self.logistics_status = logistics_status

    def to_dict(self):
        return {
            'number': self.number,
            'time': self.time,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'logistics_status': self.logistics_status
        }


class ChatHistory(db.Model):
    session_id = db.Column(db.String(50), primary_key=True)
    time = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'), nullable=False)
    messages = db.Column(db.Text, nullable=False)

    def __init__(self, session_id, time, user_id, messages):
        self.session_id = session_id
        self.time = time
        self.user_id = user_id
        self.messages = messages

    def to_dict(self):
        return {
            'session_id': self.session_id,
            'time': self.time,
            'user_id': self.user_id,
            'messages': self.messages
        }
