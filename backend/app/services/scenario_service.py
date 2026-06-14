from ..extensions import db
from ..models.scenario import Scenario

class ScenarioService:
    @staticmethod
    def create_scenario(prefix_name):
        count = db.session.query(Scenario.name) \
            .filter(Scenario.name.startswith(prefix_name)) \
            .distinct() \
            .count()

        scenario_name = f"{prefix_name}-{count + 1}"

        scenario = Scenario(
            name=scenario_name
        )

        db.session.add(scenario)
        db.session.commit()

        return scenario, count + 1
    
    @staticmethod
    def get_all_scenarios():
        scenarios = Scenario.query.all()
    
        return [
            {
                "id": scenario.id,
                "name": scenario.name
            }
            for scenario in scenarios
        ]
    
    @staticmethod
    def delete_scenario(scenario_id):
        scenario = Scenario.query.filter_by(id=scenario_id).first()

        if not scenario:
            return

        db.session.delete(scenario)
        db.session.commit()

        return scenario