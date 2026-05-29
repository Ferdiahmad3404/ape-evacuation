from ..extensions import db
from ..models.person import Person


class PersonService:
    @staticmethod
    def get_unique_scenarios():
        scenarios = db.session.query(Person.scenario_id).distinct().all()
        return [scenario[0] for scenario in scenarios]

    @staticmethod
    def get_all_persons_by_scenario(scenario_id):
        persons = Person.query.filter_by(scenario_id=scenario_id).all()

        return {
            person.person_id: {
                "person_id": person.person_id,
                "scenario_id": person.scenario_id,
                "latitude": person.latitude,
                "longitude": person.longitude
            }
            for person in persons
        }

    @staticmethod
    def create_person(person_id, scenario_id, latitude, longitude):
        existing_person = Person.query.filter_by(person_id=person_id).first()

        if existing_person:
            raise ValueError("Person ID sudah digunakan")

        person = Person(
            person_id=person_id,
            scenario_id=scenario_id,
            latitude=latitude,
            longitude=longitude
        )

        db.session.add(person)
        db.session.commit()

        return person