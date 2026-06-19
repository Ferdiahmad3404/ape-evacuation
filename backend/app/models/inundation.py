from sqlalchemy import func

from ..extensions import db


class Inundation(db.Model):
    __tablename__ = "inundations"

    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    eta = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "eta": self.eta,
        }