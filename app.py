from flask import Flask
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from routes.auth import auth_routes

load_dotenv()

app = Flask(__name__)

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URI"))
db = client['ImpactMapDB']  # Replace with your database name

# Register the authentication routes
app.register_blueprint(auth_routes)

@app.route('/')
def home():
    client.admin.command('ping')
    return "Server is running!"

if __name__ == '__main__':
    app.run(debug=True)
