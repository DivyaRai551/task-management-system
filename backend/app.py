from flask import Flask
from config import DevelopmentConfig
from flask_cors import CORS  # If you installed this
from src import bcrypt, mongo, jwt
import os
from dotenv import load_dotenv


def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    
    mongo.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)


    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    
    from src.auth.controllers import auth_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")

  
    from src.users.controllers import users_bp

    app.register_blueprint(users_bp, url_prefix="/api/users")

    from src.tasks.controllers import tasks_bp

    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    # ...

  
    @app.route("/")
    def index():
        return {"message": "Task Manager API is running!"}

    return app


if __name__ == "__main__":
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

    app = create_app()
    app.run(host="0.0.0.0", port=5000)
