import pandas as pd
import json
import math

def _normalize_eta(value):
    if value in (None, "", "Infinity", "inf"):
        return None

    eta_value = float(value)

    if not math.isfinite(eta_value):
        return None

    return eta_value

def transform_to_graph(nodes_df, edges_df):
    graph = {}

    for _, row in edges_df.iterrows():
        u = row["u"]
        v = row["v"]
        length = row["length"]

        if u not in graph:
            graph[u] = {}

        if v not in graph:
            graph[v] = {}   

        graph[u][v] = length
        graph[v][u] = length

    eta_map = dict(
        zip(
            nodes_df["node_id"].astype(str),
            nodes_df["eta"].map(_normalize_eta)
        )
    )

    rows = []

    for node, neighbors in graph.items():

        neighbors_with_eta = {
            k: {
                "length": weight,
                "eta": eta_map.get(str(k), None)
            }
            for k, weight in neighbors.items()
        }

        rows.append({
            "node": node,
            "neighbors": json.dumps(neighbors_with_eta)
        })

    graph_df = pd.DataFrame(rows)

    return graph_df