from flask import Flask
from pymongo import MongoClient
import os
from dotenv import load_dotenv

from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from routes.auth import auth_routes  # Import your auth blueprint

load_dotenv()

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "4b07efc7a8cd9fdd9a1bc6e78805de4321c9b18b4faae34e6d57d59f82bdbe3c"

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URI"))
db = client['ImpactMapDB']  # Replace with your database name

# Register the authentication routesgi
app.register_blueprint(auth_routes)

@app.route('/')
def home():
    client.admin.command('ping')
    return "Server is running!"

if __name__ == '__main__':
    app.run(debug=True)
