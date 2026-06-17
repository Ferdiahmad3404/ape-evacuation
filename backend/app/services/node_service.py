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
                "name": node.name,
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
                "status": node.status,
                "name": node.name
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
                eta_value = round(float(eta_value), 2)

            if eta_value is not None and not math.isfinite(eta_value):
                eta_value = None

            name_value = item.get("name")
            if name_value in (None, "", "nan", "NaN") or (isinstance(name_value, float) and math.isnan(name_value)):
                name_value = None

            node = Node(
                node_id=item["node_id"],
                latitude=float(item["latitude"]),
                longitude=float(item["longitude"]),
                status=item["status"],
                eta=eta_value,
                name=name_value,
            )

            nodes.append(node)

        db.session.add_all(nodes)
        db.session.commit()

        return nodes
    
    @staticmethod
    def get_lowest_eta_node():
        lowest_eta_node = Node.query.filter(Node.eta != None).order_by(Node.eta.asc()).first()
        if lowest_eta_node:
            return lowest_eta_node.to_dict()
        else:
            return None
        
    @staticmethod
    def get_latest_eta_node_by_path(path):
        latest_eta_node = Node.query.filter(Node.node_id.in_(path), Node.eta != None).order_by(Node.eta.desc()).first()
        if latest_eta_node:
            return latest_eta_node.to_dict()
        else:
            return None