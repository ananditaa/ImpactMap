import os

class Config:
    MONGODB_URI = os.getenv("MONGODB_URI")
