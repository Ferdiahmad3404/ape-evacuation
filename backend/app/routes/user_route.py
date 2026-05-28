from flask import Blueprint, jsonify, request

from ..services.user_service import UserService


user_bp = Blueprint("user", __name__)


@user_bp.get("/users")
def list_users():
    users = UserService.get_all_users()
    return jsonify([user.to_dict() for user in users]), 200


@user_bp.get("/users/<int:user_id>")
def get_user(user_id):
    user = UserService.get_user_by_id(user_id)
    if user is None:
        return jsonify({"message": "User tidak ditemukan"}), 404
    return jsonify(user.to_dict()), 200


@user_bp.post("/users")
def create_user():
    payload = request.get_json(silent=True) or {}
    name = payload.get("name", "").strip()
    email = payload.get("email", "").strip()

    if not name or not email:
        return jsonify({"message": "name dan email wajib diisi"}), 400

    try:
        user = UserService.create_user(name=name, email=email)
    except ValueError as error:
        return jsonify({"message": str(error)}), 400

    return jsonify(user.to_dict()), 201
