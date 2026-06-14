from ..extensions import db
from ..models.graph import Graph

import json
class GraphService:

    @staticmethod
    def get_all_graphs():
        graphs = Graph.query.all()

        return {
            graph.node: {
                "neighbors": json.loads(
                    graph.neighbors.replace("NaN", "null")
                ),
                "node": graph.node,
                "scenario_name": graph.scenario_name
            }
            for graph in graphs
    }

    @staticmethod
    def bulk_replace_graph(graph_data, scenario_name):
        graph = []

        Graph.query.delete()

        for item in graph_data:
            graph_item = Graph(
                node=item["node"],
                neighbors=item["neighbors"],
                scenario_name=scenario_name
            )
            graph.append(graph_item)

        db.session.add_all(graph)
        db.session.commit()

        return graph