from sqlalchemy import func

from ..extensions import db


class Result(db.Model):
    __tablename__ = "results"

    id = db.Column(db.Integer, primary_key=True)
    person_id = db.Column(db.Integer, nullable=False)
    ete_dijkstra = db.Column(db.Float, nullable=True)
    node_information_dijkstra = db.Column(db.Text, nullable=True)
    edge_information_dijkstra = db.Column(db.Text, nullable=True)
    rst_dijkstra = db.Column(db.Float, nullable=True)
    geometry_dijkstra = db.Column(db.String, nullable=True)
    ete_dijkstra_rst = db.Column(db.Float, nullable=True)
    node_information_dijkstra_rst = db.Column(db.Text, nullable=True)
    edge_information_dijkstra_rst = db.Column(db.Text, nullable=True)
    geometry_dijkstra_rst = db.Column(db.String, nullable=True)
    evacuation_point_name = db.Column(db.String(50), nullable=False)
    movement_speed = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "person_id": self.person_id,
            "ete_dijkstra": self.ete_dijkstra,
            "node_information_dijkstra": self.node_information_dijkstra,
            "edge_information_dijkstra": self.edge_information_dijkstra,
            "geometry_dijkstra": self.geometry_dijkstra,
            "rst_dijkstra": self.rst_dijkstra,
            "ete_dijkstra_rst": self.ete_dijkstra_rst,
            "node_information_dijkstra_rst": self.node_information_dijkstra_rst,
            "edge_information_dijkstra_rst": self.edge_information_dijkstra_rst,
            "geometry_dijkstra_rst": self.geometry_dijkstra_rst,
            "evacuation_point_name": self.evacuation_point_name,
            "movement_speed": self.movement_speed,
        }
