from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson.objectid import ObjectId
from src.utils.decorators import role_required
from src.auth.models import get_user_collection  
from .. import bcrypt  
from src.tasks.models import get_task_collection

TaskCollection = get_task_collection()
users_bp = Blueprint("users", __name__)
UserCollection = get_user_collection()  



@users_bp.route("", methods=["GET"])
@jwt_required()
@role_required("admin")
def list_users():
    """Admin endpoint to list all users with basic pagination and filtering."""

    users = UserCollection.find({}, {"password": 0})  

    user_list = []
    for user in users:
   
        user["_id"] = str(user["_id"])
        user_list.append(user)

    return jsonify(user_list), 200



@users_bp.route("/<user_id>", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_user(user_id):
    """Admin endpoint to get a single user by ID."""
    try:
        user = UserCollection.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    except:
        return jsonify({"msg": "Invalid User ID format"}), 400

    if not user:
        return jsonify({"msg": "User not found"}), 404

    user["_id"] = str(user["_id"])
    return jsonify(user), 200



@users_bp.route("/<user_id>", methods=["PUT"])
@jwt_required()
@role_required("admin")
def update_user(user_id):
    """Admin endpoint to update user attributes (email, role, password)."""
    data = request.get_json()
    update_data = {}

   
    try:
        user_object_id = ObjectId(user_id)
    except:
        return jsonify({"msg": "Invalid User ID format"}), 400

  
    if "email" in data:
        update_data["email"] = data["email"]
    if "role" in data:
        if data["role"] not in ["user", "admin"]:
            return jsonify({"msg": "Invalid role specified"}), 400
        update_data["role"] = data["role"]
    if "password" in data:
        update_data["password"] = bcrypt.generate_password_hash(
            data["password"]
        ).decode("utf-8")

    if not update_data:
        return jsonify({"msg": "No fields provided for update"}), 400


    try:
        result = UserCollection.update_one(
            {"_id": user_object_id}, {"$set": update_data}
        )

        if result.matched_count == 0:
            
            if not UserCollection.find_one({"_id": user_object_id}):
                return jsonify({"msg": "User not found"}), 404
        
            return (
                jsonify({"msg": "User updated successfully (no changes applied)"}),
                200,
            )

        return jsonify({"msg": "User updated successfully"}), 200

    except Exception as e:
        
        return jsonify({"msg": f"Error updating user: {e}"}), 500



@users_bp.route("/<user_id>", methods=["DELETE"])
@jwt_required()
@role_required("admin")
def delete_user(user_id):
    """Admin endpoint to delete a user AND their associated tasks."""
    try:
        user_object_id = ObjectId(user_id)
    except:
        return jsonify({"msg": "Invalid User ID format"}), 400

   
    user_to_delete = UserCollection.find_one({"_id": user_object_id})
    if not user_to_delete:
        return jsonify({"msg": "User not found"}), 404

  

    
    task_result = TaskCollection.delete_many(
        {"$or": [{"created_by": user_object_id}, {"assigned_to": user_object_id}]}
    )

   
    UserCollection.delete_one({"_id": user_object_id})

  
    return (
        jsonify(
            {
                "msg": "User and associated tasks deleted successfully",
                "tasks_deleted": task_result.deleted_count,
            }
        ),
        204,
    )
