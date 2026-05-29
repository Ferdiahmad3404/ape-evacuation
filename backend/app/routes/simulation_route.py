from flask import Blueprint, json, jsonify, request

from ..services.edge_service import EdgeService
from ..services.graph_service import GraphService
from ..services.node_service import NodeService
from ..services.result_service import ResultService
from ..utils.shortest_path_algorithm import dijkstra, dijkstra_with_rst, find_nearest_node, reconstruct_path, get_geometry_by_node_id, split_geometry_into_safe_and_unsafe

import uuid

simulation_bp = Blueprint("simulation", __name__)


@simulation_bp.post("/simulations")
def create_simulation():
    payload = request.get_json(silent=True)

    if not payload:
        return jsonify({
            "message": "Payload tidak boleh kosong"
        }), 400
    
    print("Payload diterima:", payload)
    
    walking_speeds = [0.8, 1.2, 1.6]

    graph_data = GraphService.get_all_graphs()

    nodes_data = NodeService.get_all_nodes()

    edges_data = EdgeService.get_all_edges()

    evacuation_points_data = NodeService.get_all_node_evacuation_points()


    for departure_point in payload:
        person_id = uuid.uuid4().hex
        for walking_speed in walking_speeds:
            for evac_point_id, evac_point in evacuation_points_data.items():

                start_node_id = find_nearest_node(
                    nodes_data,
                    departure_point["latitude"],
                    departure_point["longitude"]
                )

                dist_dijkstra, prev_dijkstra = dijkstra(
                    graph_data,
                    start_node_id,
                    evac_point_id,
                    walking_speed
                )

                path_dijkstra = reconstruct_path(prev_dijkstra, start_node_id, evac_point_id)

                geometries_dijkstra = get_geometry_by_node_id(edges_data, path_dijkstra)

                geometries_dijkstra = split_geometry_into_safe_and_unsafe(geometries_dijkstra, walking_speed, 0.40)

                dist_dijkstra_rst, prev_dijkstra_rst = dijkstra_with_rst(
                    graph_data,
                    start_node_id,
                    evac_point_id,
                    5,
                    10,
                    walking_speed,
                )

                path_dijkstra_rst = reconstruct_path(prev_dijkstra_rst, start_node_id, evac_point_id)

                geometries_dijkstra_rst = get_geometry_by_node_id(edges_data, path_dijkstra_rst)

                ResultService.save_result(
                    person_id,
                    dist_dijkstra[evac_point_id],
                    json.dumps(geometries_dijkstra),
                    dist_dijkstra_rst[evac_point_id],
                    json.dumps({
                        "safe": geometries_dijkstra_rst,
                        "unsafe": []
                    }),
                    movement_speed=walking_speed
                )

    return jsonify({
        "message": "Payload diterima",
    }), 200