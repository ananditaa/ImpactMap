from flask import Flask
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.auth import register_auth_routes  # Import the function, not the blueprint directly
from routes.questions import questions_routes

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "4b07efc7a8cd9fdd9a1bc6e78805de4321c9b18b4faae34e6d57d59f82bdbe3c"

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URI"))
db = client['ImpactMapDB']  # Replace with your database name

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Register the authentication routes
auth_routes = register_auth_routes(bcrypt, jwt)
app.register_blueprint(auth_routes)
app.register_blueprint(questions_routes)

@app.route('/')
def home():
    client.admin.command('ping')
    return "Server is running!"

if __name__ == '__main__':
    app.run(debug=True)
