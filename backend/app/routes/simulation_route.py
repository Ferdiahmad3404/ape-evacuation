from flask import Blueprint, json, jsonify, request

from ..services.edge_service import EdgeService
from ..services.graph_service import GraphService
from ..services.node_service import NodeService
from ..services.result_service import ResultService
from ..services.scenario_service import ScenarioService
from ..services.person_service import PersonService
from ..utils.shortest_path_algorithm import dijkstra, dijkstra_with_rst, find_nearest_node, reconstruct_path, get_geometry_by_node_id, get_node_information_by_node_id, get_edge_information_by_node_id
import uuid

simulation_bp = Blueprint("simulation", __name__)


@simulation_bp.post("/simulations")
def create_simulation():
    payload = request.get_json(silent=True)

    if not payload:
        return jsonify({
            "message": "Payload tidak boleh kosong"
        }), 400
    
    walking_speeds = [1.35, 1.40, 1.51]

    graph_data = GraphService.get_all_graphs()

    nodes_data = NodeService.get_all_nodes()

    edges_data = EdgeService.get_all_edges()

    lowest_eta_node = NodeService.get_lowest_eta_node()['eta']

    evacuation_points_data = NodeService.get_all_node_evacuation_points()

    t_warning = 8

    t_reaction = 10

    scenario_name = next(iter(graph_data.values()))["scenario_name"]
    scenario, count = ScenarioService.create_scenario(prefix_name=scenario_name)
    scenario_id = scenario.id

    for departure_point in payload:
        person = PersonService.create_person(
            latitude=departure_point["latitude"],
            longitude=departure_point["longitude"],
            scenario_id=scenario_id
        )

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

                node_information_dijkstra = get_node_information_by_node_id(nodes_data, path_dijkstra)

                edge_information_dijkstra = get_edge_information_by_node_id(edges_data, path_dijkstra)

                geometries_dijkstra = get_geometry_by_node_id(nodes_data, path_dijkstra)

                dist_dijkstra_rst, prev_dijkstra_rst = dijkstra_with_rst(
                    graph_data,
                    start_node_id,
                    evac_point_id,
                    t_warning,
                    t_reaction,
                    walking_speed,
                )

                path_dijkstra_rst = reconstruct_path(prev_dijkstra_rst, start_node_id, evac_point_id)

                node_information_dijkstra_rst = get_node_information_by_node_id(nodes_data, path_dijkstra_rst)

                edge_information_dijkstra_rst = get_edge_information_by_node_id(edges_data, path_dijkstra_rst)

                find_latest_eta_node = NodeService.get_latest_eta_node_by_path(path_dijkstra_rst)

                geometries_dijkstra_rst = get_geometry_by_node_id(nodes_data, path_dijkstra_rst)

                ResultService.save_result(
                    person.id,
                    round(float(dist_dijkstra[evac_point_id]), 2),
                    json.dumps(node_information_dijkstra),
                    json.dumps(edge_information_dijkstra),
                    json.dumps(geometries_dijkstra),
                    lowest_eta_node - t_warning - t_reaction,
                    round(float(dist_dijkstra_rst[evac_point_id]), 2),
                    json.dumps(node_information_dijkstra_rst),
                    json.dumps(edge_information_dijkstra_rst),
                    find_latest_eta_node["eta"] - t_warning - t_reaction if find_latest_eta_node else None,
                    json.dumps(geometries_dijkstra_rst),
                    evac_point["name"],
                    walking_speed,
                    json.dumps(path_dijkstra),
                    json.dumps(path_dijkstra_rst)
                )

    return jsonify({
        "message": "Payload diterima",
        "scenario_id": scenario_id
    }), 200