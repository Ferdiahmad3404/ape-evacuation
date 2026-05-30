from sqlalchemy import func

from ..extensions import db


class Person(db.Model):
    __tablename__ = "persons"

    id = db.Column(db.Integer, primary_key=True)
    person_id = db.Column(db.String(50), unique=True, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    scenario_id = db.Column(db.String(50), nullable=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "person_id": self.person_id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "scenario_id": self.scenario_id,
        }