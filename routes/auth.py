from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
bcrypt = Bcrypt()
jwt = JWTManager()

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URI"))
db = client['ImpactMapDB']  # Replace with your database name

# Create a Blueprint for auth routes
auth_routes = Blueprint('auth', __name__)

# User registration
@auth_routes.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Check if user already exists
    if db.users.find_one({"username": username}):
        return jsonify({"msg": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    db.users.insert_one({"username": username, "password": hashed_password})
    return jsonify({"msg": "User registered successfully"}), 201

# User login
@auth_routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = db.users.find_one({"username": username})
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity={"username": username})
    return jsonify(access_token=access_token), 200
