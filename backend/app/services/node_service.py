import math

from ..extensions import db
from ..models.node import Node
import json


class NodeService:
    @staticmethod
    def get_all_nodes():
        return Node.query.order_by(Node.id.desc()).all()

    @staticmethod
    def get_node_by_id(node_id):
        return Node.query.get(node_id)
    
    @staticmethod
    def get_all_node_evacuation_points():
        with open("trace_get_all_node_evacuation_points.json", "w", encoding="utf-8") as file:
            evacuation_points = Node.query.filter_by(status="evacuation_point").all()
            file.write(
                json.dumps(
                    [point.to_dict() for point in evacuation_points],
                    indent=2,
                    ensure_ascii=False
                )
            )
            return evacuation_points
        return Node.query.filter_by(status="evacuation_point").all()

    @staticmethod
    def bulk_replace_nodes(nodes_data):
        nodes = []

        Node.query.delete()

        for item in nodes_data:
            eta_value = item.get("eta")

            if eta_value in (None, "", "Infinity", "inf", float("inf")):
                eta_value = None
            else:
                eta_value = float(eta_value)

            if eta_value is not None and not math.isfinite(eta_value):
                eta_value = None

            node = Node(
                node_id=item["node_id"],
                latitude=float(item["latitude"]),
                longitude=float(item["longitude"]),
                status=item["status"],
                eta=eta_value,
            )

            nodes.append(node)

        db.session.add_all(nodes)
        db.session.commit()

        return nodes