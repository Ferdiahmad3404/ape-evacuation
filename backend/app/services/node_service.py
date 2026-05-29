import math

from ..extensions import db
from ..models.node import Node
import json


class NodeService:
    @staticmethod
    def get_all_nodes():
        nodes = Node.query.all()

        return {
            node.node_id: {
                "eta": node.eta,
                "latitude": node.latitude,
                "longitude": node.longitude,
                "node_id": node.node_id,
                "status": node.status
            }
            for node in nodes
        }

    @staticmethod
    def get_node_by_id(node_id):
        return Node.query.get(node_id)
    
    @staticmethod
    def get_all_node_evacuation_points():
        nodes = Node.query.filter_by(status="evacuation_point").all()

        return {
            node.node_id: {
                "eta": node.eta,
                "latitude": node.latitude,
                "longitude": node.longitude,
                "node_id": node.node_id,
                "status": node.status
            }
            for node in nodes
        }

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