from flask import Blueprint, json, jsonify, request
from ..services.edge_service import EdgeService
from ..services.node_service import NodeService

node_bp = Blueprint("node", __name__)


@node_bp.get("/nodes")
def get_all_nodes():
    nodes = NodeService.get_all_nodes()

    return jsonify(nodes), 200


@node_bp.get("/edges")
def get_all_edges():
    edges = EdgeService.get_all_edges()

    return jsonify(edges), 200

@node_bp.get("/nodes/evacuation_points")
def get_all_node_evacuation_points():
    evacuation_points = NodeService.get_all_node_evacuation_points()
    with open("evacuation_points.json", "w", encoding="utf-8") as file:
        json.dump(evacuation_points, file, indent=2, ensure_ascii=False)

    return jsonify(evacuation_points), 200