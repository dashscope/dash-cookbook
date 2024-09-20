import os

# 百炼平台api_key
os.environ['DASHSCOPE_API_KEY'] = ''


class Config:
    TEMPLATES_AUTO_RELOAD = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # mysql数据库的url，注意启动前要先创建数据库名
    SQLALCHEMY_DATABASE_URI = 'mysql://root:123456@127.0.0.1:3306/database'


class ProdConfig(Config):
    DEBUG = False


class DevConfig(Config):
    DEBUG = True


config = {
    'development': DevConfig,
    'production': ProdConfig,
}
