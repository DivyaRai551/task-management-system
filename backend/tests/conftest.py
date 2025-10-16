import pytest


from flask import Flask
import sys
import os


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app


from src import mongo, bcrypt


from config import TestConfig

import json

@pytest.fixture(scope="session")
def app():
    """Fixture to create and configure the Flask app for testing."""
 
    import os
    from dotenv import load_dotenv

    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

    app = create_app(config_class=TestConfig)

    with app.app_context():
        
        pass

    yield app


@pytest.fixture(scope="function")
def client(app):
    """Fixture to provide a test client for making requests."""
    return app.test_client()


@pytest.fixture(scope="function", autouse=True)
def cleanup_db(app):
    """Fixture to run before and after each test function to ensure clean state."""

    with app.app_context():
        

        database_name = (
            app.config.get("MONGO_DB") or "task_management_test_db"
        )  
        
        mongo.db.client.drop_database(
            database_name
        )  
    yield  

    
    with app.app_context():
        
        mongo.db.client.drop_database(database_name)



@pytest.fixture
def test_user_data():
    """Returns standard data for a test user."""
    return {"email": "test@example.com", "password": "Password123"}


@pytest.fixture
def create_test_user(app, test_user_data):
    """A callable fixture to quickly register a user and return their data."""

    def _create_user(role="user", email=None):
        from src.auth.models import get_user_collection

       
        user_email = email if email is not None else test_user_data["email"]


        hashed_password = bcrypt.generate_password_hash(
            test_user_data["password"]
        ).decode("utf-8")

        user_data = {
            "email": user_email,
            "password": hashed_password,
            "role": role,
        }
        result = get_user_collection().insert_one(user_data)
        return {
            "id": str(result.inserted_id),
            "email": user_data["email"],
            "role": role,
        }

    return _create_user


@pytest.fixture
def get_auth_token_for(client, create_test_user, test_user_data):
    """
    Callable fixture to register a user/admin and return their token and ID.

    Usage: token, user_id = get_auth_token_for('admin')
    """

    def _get_token(role="user", email_suffix=""):
        
        user_email = f"test_{role}{email_suffix}@example.com"
        password = test_user_data["password"]

        
     
        from src.auth.models import get_user_collection
        from app import bcrypt

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        user_data = {"email": user_email, "password": hashed_password, "role": role}
        user_id = str(get_user_collection().insert_one(user_data).inserted_id)

        
        response = client.post(
            "/api/auth/login",
            data=json.dumps({"email": user_email, "password": password}),
            content_type="application/json",
        )
        assert response.status_code == 200
        token = response.get_json()["access_token"]

        return f"Bearer {token}", user_id

    return _get_token
