from flask import Flask
from .models import db


def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'PUT,GET,POST,DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    return response


def create_app(config: object) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config)
    app.after_request(after_request)
    app.jinja_env.auto_reload = True

    db.init_app(app)
    with app.app_context():
        db.create_all()

    from .views.main import main as main_blueprint
    from .views.chatbot import chatbot as chatbot_blueprint
    app.register_blueprint(main_blueprint)
    app.register_blueprint(chatbot_blueprint)

    from .views.apis import UsersApi, ProductsApi, OrdersApi, ChatHistoriesApi
    app.add_url_rule('/api/users', view_func=UsersApi.as_view('users_api'))
    app.add_url_rule('/api/products', view_func=ProductsApi.as_view('products_api'))
    app.add_url_rule('/api/orders', view_func=OrdersApi.as_view('orders_api'))
    app.add_url_rule("/api/chat_histories", view_func=ChatHistoriesApi.as_view('chat_histories_api'))

    return app

