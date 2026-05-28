from flask import Blueprint, json, jsonify, request
from ..services.graph_service import GraphService
from ..services.node_service import NodeService
from ..utils.shortest_path_algorithm import dijkstra, dijkstra_with_rst, find_nearest_node, reconstruct_path


simulation_bp = Blueprint("simulation", __name__)


@simulation_bp.post("/simulations")
def create_simulation():
    payload = request.get_json(silent=True)

    if not payload:
        return jsonify({
            "message": "Payload tidak boleh kosong"
        }), 400
    
    print("Payload diterima:", payload)
    
    walking_speeds = [5.0]

    graph_data = GraphService.get_all_graphs()
    graph = {}

    for item in graph_data:
        graph[item.node] = json.loads(
            item.neighbors.replace("Infinity", "null")
        )

    nodes_data = NodeService.get_all_nodes()
    nodes = [node.to_dict() for node in nodes_data]

    evacuation_points = NodeService.get_node_evacuation_point()
    evacuation_point_ids = [evac_point.node_id for evac_point in evacuation_points]

    for departure_point in payload:
        for walking_speed in walking_speeds:
            for evac_point_id in evacuation_point_ids:

                start_node_id = find_nearest_node(
                    nodes,
                    departure_point["latitude"],
                    departure_point["longitude"]
                )

                dist, prev = dijkstra(
                    graph,
                    start_node_id,
                    evac_point_id,
                    walking_speed
                )

                path = reconstruct_path(prev, start_node_id, evac_point_id)

                dist_rst, prev_rst = dijkstra_with_rst(
                    graph,
                    start_node_id,
                    evac_point_id,
                    5,
                    1,
                    walking_speed,
                )

                with open("trace_dijkstra_rst.txt", "w", encoding="utf-8") as file:
                    file.write(
                        json.dumps(
                            {
                                "departure_point": departure_point,
                                "speed": walking_speed,
                                "evac_point_id": evac_point_id,
                                "start_node_id": start_node_id,
                                "dist_rst": dist_rst,
                                "prev_rst": prev_rst,
                            },
                            indent=2,
                            ensure_ascii=False
                        )
                    )
                    file.write("\n====================\n")

                return jsonify({
                    "message": "Payload diterima",
                }), 200

    return jsonify({
        "message": "Payload diterima",
        "data": {
            "graph": graph,
        }
    }), 200