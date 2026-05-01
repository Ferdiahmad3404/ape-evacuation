from csv import DictReader
from io import StringIO

from flask import Flask, jsonify, request
from flask_cors import CORS
from query import get_graph, get_evacuation_points, replace_evacuation_points, get_scenario
import os

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
    elif (mode == "import-evacuees"):
        print("Mode: Import Evacuees")

    return jsonify({
        "message": "CSV berhasil diupload",
    }), 200

if __name__ == "__main__":
    app.run(debug=True)