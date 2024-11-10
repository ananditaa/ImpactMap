from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt  # Import Bcrypt for password hashing

load_dotenv()

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URI"))
db = client['ImpactMapDB']  # Replace with your database name

# Create a Blueprint for auth routes
auth_routes = Blueprint('auth', __name__)

def register_auth_routes(bcrypt: Bcrypt, jwt):
    # User registration
    @auth_routes.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # Check if user already exists
        if db.UserAuth.find_one({"username": username}):
            return jsonify({"msg": "User already exists"}), 400

        # Hash password with bcrypt
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Insert new user into MongoDB
        db.UserAuth.insert_one({"username": username, "password": hashed_password})

        return jsonify({"msg": "User registered successfully"}), 201

    # User login
    @auth_routes.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        print(data)
        username = data.get('username')
        password = data.get('password')

        # Find user by username
        user = db.UserAuth.find_one({"username": username})
        print(user['password'])
        # Check if user exists and password matches
        if not user or not bcrypt.check_password_hash(user['password'], password):
            return jsonify({"msg": "Invalid credentials"}), 401

        # Create JWT access token
        access_token = create_access_token(identity={"username": username})
        return jsonify(access_token=access_token), 200

    return auth_routes
