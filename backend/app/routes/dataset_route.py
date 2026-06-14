from fileinput import filename
from flask import Blueprint, jsonify, request
from ..utils.transformer import transform_to_graph
from ..services.node_service import NodeService
from ..services.edge_service import EdgeService
from ..services.graph_service import GraphService

import re
import pandas as pd



dataset_bp = Blueprint("dataset", __name__)

@dataset_bp.post("/datasets")
def create_dataset():
    nodes_file = request.files.get("nodes_file")
    edges_file = request.files.get("edges_file")

    scenario_name = re.search(r'nodes-(.*)\.csv$', nodes_file.filename).group(1)

    if not nodes_file or not edges_file:
        return jsonify({
            "message": "Nodes dan edges file wajib ada"
        }), 400

    nodes_df = pd.read_csv(nodes_file)
    edges_df = pd.read_csv(edges_file)
    graph_df = transform_to_graph(nodes_df, edges_df)

    NodeService.bulk_replace_nodes(nodes_df.to_dict(orient="records"))
    EdgeService.bulk_replace_edges(edges_df.to_dict(orient="records"))
    GraphService.bulk_replace_graph(graph_df.to_dict(orient="records"), scenario_name)

    return jsonify({
        "nodes_rows": len(nodes_df),
        "edges_rows": len(edges_df),
    }), 200