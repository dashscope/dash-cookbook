from app import create_app
from config import config


app = create_app(config['development'])
app.run()
