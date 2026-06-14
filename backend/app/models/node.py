from sqlalchemy import func

from ..extensions import db


class Node(db.Model):
    __tablename__ = "nodes"

    id = db.Column(db.Integer, primary_key=True)
    node_id = db.Column(db.String(50), unique=True, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    eta = db.Column(db.Float, nullable=True)
    name = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "node_id": self.node_id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "status": self.status,
            "eta": self.eta,
            "name": self.name
        }
