from ..extensions import db
from ..models.edge import Edge


class EdgeService:
    @staticmethod
    def get_all_edges():
        return Edge.query.order_by(Edge.id.desc()).all()

    @staticmethod
    def get_edge_by_id(edge_id):
        return Edge.query.get(edge_id)

    @staticmethod
    def create_edge(edge_id, source_node_id, target_node_id, weight=None):
        existing_edge = Edge.query.filter_by(edge_id=edge_id).first()

        if existing_edge:
            raise ValueError("Edge ID sudah digunakan")

        edge = Edge(
            edge_id=edge_id,
            source_node_id=source_node_id,
            target_node_id=target_node_id,
            weight=weight,
        )

        db.session.add(edge)
        db.session.commit()

        return edge

    @staticmethod
    def bulk_replace_edges(edges_data):
        edges = []

        Edge.query.delete()

        for item in edges_data:
            edge = Edge(
                u=item["u"],
                v=item["v"],
                length=item["length"],
                geometry=item.get("geometry"),
            )

            edges.append(edge)

        db.session.add_all(edges)
        db.session.commit()

        return edges