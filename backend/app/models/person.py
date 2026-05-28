from sqlalchemy import func

from ..extensions import db


class Person(db.Model):
    __tablename__ = "persons"

    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    movement_speed = db.Column(db.Float, nullable=True)
    scenario_id = db.Column(db.String(50), nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "movement_speed": self.movement_speed,
            "scenario_id": self.scenario_id,
        }
