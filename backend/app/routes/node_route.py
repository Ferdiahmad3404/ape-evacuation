from flask import Blueprint, json, jsonify, request
from ..services.node_service import NodeService

node_bp = Blueprint("node", __name__)

@node_bp.get("/nodes/evacuation_points")
def get_all_node_evacuation_points():
    evacuation_points = NodeService.get_all_node_evacuation_points()

    return jsonify({
        "evacuation_points": [point.to_dict() for point in evacuation_points]
    }), 200