

import os
from datetime import timedelta



DEFAULT_MONGO_USER = "admin"  
DEFAULT_MONGO_PASSWORD = "password"  
DEFAULT_DB_HOST = "localhost"
DEFAULT_DB_PORT = "27017"  
DEFAULT_MONGO_DB = "task_management_db"  


class Config:
    """Base configuration."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "default_secret_key")

    _MONGO_USER = os.environ.get("MONGO_USER", DEFAULT_MONGO_USER)
    _MONGO_PASSWORD = os.environ.get("MONGO_PASSWORD", DEFAULT_MONGO_PASSWORD)
    _DB_HOST = os.environ.get("DB_HOST", DEFAULT_DB_HOST)
    _DB_PORT = os.environ.get("DB_PORT", DEFAULT_DB_PORT)
    _MONGO_DB = os.environ.get("MONGO_DB", DEFAULT_MONGO_DB)

    MONGO_URI = f"mongodb://{DEFAULT_DB_HOST}:{DEFAULT_DB_PORT}/{DEFAULT_MONGO_DB}"

  
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-super-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
    MAX_FILE_UPLOADS = 3  
    ALLOWED_EXTENSIONS = {"pdf"}  


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True

    




class TestConfig(Config):
    """Configuration for testing purposes."""

    TESTING = True

    MONGO_DB = "task_management_test_db" 

    MONGO_URI = "mongodb://localhost:27017/task_management_test_db"
    JWT_ACCESS_TOKEN_EXPIRES = False
