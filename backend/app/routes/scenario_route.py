from flask import Blueprint, json, jsonify, request

from ..services.person_service import PersonService
from ..services.scenario_service import ScenarioService
from ..services.result_service import ResultService

import pandas as pd


scenario_bp = Blueprint("scenario", __name__)

@scenario_bp.get("/scenarios")
def get_scenarios():
    scenarios = ScenarioService.get_all_scenarios()

    return jsonify({
        "scenarios": scenarios
    }), 200

@scenario_bp.get("/scenarios/<scenario_id>")
def get_persons_by_scenario(scenario_id):
    persons = PersonService.get_all_persons_by_scenario(scenario_id)

    return jsonify({
        "scenario_id": scenario_id,
        "persons": persons
    }), 200

@scenario_bp.get("/scenarios/<scenario_id>/<person_id>")
def get_results_by_scenario_and_person(scenario_id, person_id):
    result = ResultService.get_all_result_by_person_id(person_id)
    with open("result.json", "w") as file:
        json.dump(result, file, indent=4)
    return jsonify({
        "scenario_id": scenario_id,
        "person_id": person_id,
        "result": result
    }), 200 

@scenario_bp.delete("/scenarios/<scenario_id>")
def delete_scenario(scenario_id):
    scenario = ScenarioService.delete_scenario(scenario_id)
    persons = PersonService.delete_persons_by_scenario(scenario.id)
    results = ResultService.delete_results_by_persons(persons)

    return jsonify({
        "message": f"Scenario dengan id {scenario_id} berhasil dihapus"
    }), 200