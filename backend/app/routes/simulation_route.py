import csv

from flask import Blueprint, json, jsonify, request


from ..services.inundation_service import InundationService
from ..services.edge_service import EdgeService
from ..services.graph_service import GraphService
from ..services.node_service import NodeService
from ..services.result_service import ResultService
from ..services.scenario_service import ScenarioService
from ..services.person_service import PersonService
from ..utils.shortest_path_algorithm import dijkstra, dijkstra_with_rst, find_nearest_node, reconstruct_path, get_geometry_by_node_id, get_node_information_by_node_id, get_edge_information_by_node_id, find_nearest_inundation, haversine_distance

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

    inundation_data = InundationService.get_all_inundations()

    lowest_eta_node = NodeService.get_lowest_eta_node()['eta']

    evacuation_points_data = NodeService.get_all_node_evacuation_points()

    t_warning = 8

    t_reaction = 10

    scenario_name = next(iter(graph_data.values()))["scenario_name"]
    scenario, count = ScenarioService.create_scenario(prefix_name=scenario_name)
    scenario_id = scenario.id

    with open("eksperimen.csv", "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow([
            "scenario",
            "path_dijkstra",
            "ete_dijkstra",
            "rst_dijkstra",
            "ete_dijkstra_rst",
            "rst_dijkstra_rst",
            "path_dijkstra",
            "path_dijkstra_rst"
        ])

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

                latest_eta_node_index = None
                latest_eta_node = None

                for idx, node in enumerate(node_information_dijkstra_rst):
                    if node["eta"] is None:
                        break
                    
                    latest_eta_node_index = idx
                    latest_eta_node = node

                nearest_inundation = find_nearest_inundation(node_information_dijkstra_rst[latest_eta_node_index + 1], node_information_dijkstra_rst[latest_eta_node_index], inundation_data)
                ete_inundation_save_dijkstra_rst = round(float(dist_dijkstra_rst[evac_point_id]) + (haversine_distance(
                    nearest_inundation["inundation"]["latitude"], nearest_inundation["inundation"]["longitude"], latest_eta_node["latitude"], latest_eta_node["longitude"]) / walking_speed / 60), 2)
                print(f"Latest ETA Node: {round(float(dist_dijkstra_rst[evac_point_id]), 2)}")
                print(f"Updated Inundation Save (Dijkstra RsT): {ete_inundation_save_dijkstra_rst}")
                geometries_dijkstra_rst = get_geometry_by_node_id(nodes_data, path_dijkstra_rst)

                with open("eksperimen.csv", "a", newline="", encoding="utf-8") as file:
                    writer = csv.writer(file)
                
                    writer.writerow([
                        f"RsT2 - {person.id} - {evac_point_id} - {walking_speed} - R1",
                        json.dumps(path_dijkstra),
                        round(float(dist_dijkstra[evac_point_id]), 2),
                        round(lowest_eta_node - t_warning - t_reaction, 2),
                        round(float(dist_dijkstra_rst[evac_point_id]), 2),
                        round(
                            latest_eta_node["eta"] - t_warning - t_reaction
                            if latest_eta_node else None,
                            2
                        ),
                        json.dumps(path_dijkstra),
                        json.dumps(path_dijkstra_rst)
                    ])
                
                ResultService.save_result(
                    person.id,
                    round(float(dist_dijkstra[evac_point_id]), 2),
                    json.dumps(node_information_dijkstra),
                    json.dumps(edge_information_dijkstra),
                    json.dumps(geometries_dijkstra),
                    round(lowest_eta_node - t_warning - t_reaction, 2),
                    round(float(dist_dijkstra_rst[evac_point_id]), 2),
                    json.dumps(node_information_dijkstra_rst),
                    json.dumps(edge_information_dijkstra_rst),
                    round(latest_eta_node["eta"] - t_warning - t_reaction if latest_eta_node else None, 2),
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