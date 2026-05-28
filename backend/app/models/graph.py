from sqlalchemy import func

from ..extensions import db


class Graph(db.Model):
    __tablename__ = "graph"

    id = db.Column(db.Integer, primary_key=True)
    node = db.Column(db.String(50),  nullable=False)
    neighbors = db.Column(db.String, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "node": self.node,
            "neighbors": self.neighbors,
        }
