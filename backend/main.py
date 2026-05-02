from csv import DictReader
from io import StringIO
from flask import Flask, jsonify, request
from flask_cors import CORS
from query import get_graph, get_evacuation_points, replace_evacuation_points, get_scenario, get_nodes
import os
from dijkstra import dijkstra, dijkstra_with_rst, reconstruct_path, get_nearest_node

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/", methods=["GET"])
def home():
    G = get_graph()
    return jsonify({
        "nodes": len(G),
        "edges": sum(len(neighbors) for neighbors in G.values())
    })

@app.route("/evacuation-points", methods=["GET"])
def show_evacuation_points():
    G = get_evacuation_points()
    return list(G.values()), 200

@app.route("/scenario", methods=["GET"])
def show_scenario():
    scenario = get_scenario()
    return jsonify(scenario), 200

@app.route("/upload-csv", methods=["POST"])
def upload_csv():
    file = request.files.get("file")
    mode = request.form.get("mode")

    if (mode == "change-evacuation-points"):
        content = file.read().decode("utf-8-sig")
        reader = DictReader(StringIO(content))

        new_points = []
        for row in reader:
            new_points.append({
                "osmid": row["osmid"],
                "nama_tempat": row["nama_tempat"],
                "status_tempat": row["status_tempat"],
                "x": row["x"],
                "y": row["y"],
                "geometry": row["geometry"],
                "osmid1": row["osmid1"],
                "osmid2": row["osmid2"]
            })

        replace_evacuation_points(new_points)
    elif (mode == "change-scenario"):
        print("Mode: Change Scenario")

    return jsonify({
        "message": "CSV berhasil diupload",
    }), 200

@app.route("/simulation-evacuees", methods=["POST"])
def receive_simulation_evacuees():
    evacuees = request.get_json(silent=True) or []

    dijkstra_results = []
    G = get_graph()
    nodes = get_nodes()
    evacuation_points = get_evacuation_points()

    for i, evacuee in enumerate(evacuees):
        print(f"Processing evacuee {i+1}/{len(evacuees)}")
        start_node = get_nearest_node(nodes, evacuee["long"], evacuee["lat"])
        evacuee_routes = []

        for end_node in evacuation_points.keys():
            print(f"Processing evacuee {i+1}/{len(evacuees)} to evacuation point {end_node}...")
            times, previous_nodes = dijkstra(G, start_node, end_node, evacuee["speed"])
            path = reconstruct_path(previous_nodes, start_node, end_node)
            total_time = times.get(end_node, float("infinity"))
            print(f"Finished Dijkstra for evacuee {i+1}/{len(evacuees)} to evacuation point {end_node}. Total time: {total_time}")

            evacuee_routes.append({
                "end_node": end_node,
                "path": path,
                "total_time": total_time if total_time != float("infinity") else None
            })

        dijkstra_results.append({
            "routes": evacuee_routes
        })

    print("finished processing evacuees")
    return jsonify({
        "message": "Data evacuee simulasi berhasil diterima",
        "count": len(evacuees),
        "results": dijkstra_results,
        "evacuees": evacuees
    }), 200

if __name__ == "__main__":
    app.run(debug=True)