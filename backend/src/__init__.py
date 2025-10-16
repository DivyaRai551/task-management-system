from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, get_jwt_identity, get_jwt # Import necessary functions

BLACKLIST = set()

bcrypt = Bcrypt()
mongo = PyMongo()
jwt = JWTManager()
@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload):
    """Checks if the token's JTI (unique ID) is in the global blocklist."""
    jti = jwt_payload["jti"]
    return jti in BLACKLIST