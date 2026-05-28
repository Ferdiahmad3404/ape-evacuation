from sqlalchemy import func

from ..extensions import db


class Edge(db.Model):
    __tablename__ = "edges"

    id = db.Column(db.Integer, primary_key=True)
    u = db.Column(db.String(50), nullable=False)
    v = db.Column(db.String(50), nullable=False)
    length = db.Column(db.Float, nullable=False)
    geometry = db.Column(db.String, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "u": self.u,
            "v": self.v,
            "length": self.length,
            "geometry": self.geometry,
        }