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
                "node": graph.node
            }
            for graph in graphs
    }

    @staticmethod
    def bulk_replace_graph(graph_data):
        graph = []

        Graph.query.delete()

        for item in graph_data:
            graph_item = Graph(
                node=item["node"],
                neighbors=item["neighbors"],
            )
            graph.append(graph_item)

        db.session.add_all(graph)
        db.session.commit()

        return graph