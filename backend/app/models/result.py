from sqlalchemy import func

from ..extensions import db


class Result(db.Model):
    __tablename__ = "results"

    id = db.Column(db.Integer, primary_key=True)
    person_id = db.Column(db.String(50), nullable=True)
    ete_dijkstra = db.Column(db.Float, nullable=True)
    status_dijsktra = db.Column(db.Boolean, nullable=True)
    geometry_dijkstra = db.Column(db.String, nullable=True)
    ete_dijkstra_rst = db.Column(db.Float, nullable=True)
    status_dijsktra_rst = db.Column(db.Boolean, nullable=True)
    geometry_dijkstra_rst = db.Column(db.String, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "person_id": self.person_id,
            "ete_dijkstra": self.ete_dijkstra,
            "status_dijsktra": self.status_dijsktra,
            "geometry_dijkstra": self.geometry_dijkstra,
            "ete_dijkstra_rst": self.ete_dijkstra_rst,
            "status_dijsktra_rst": self.status_dijsktra_rst,
            "geometry_dijkstra_rst": self.geometry_dijkstra_rst,
        }
