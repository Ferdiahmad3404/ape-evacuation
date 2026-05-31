from flask import Blueprint, jsonify, request

from ..services.person_service import PersonService
from ..services.result_service import ResultService

import pandas as pd


scenario_bp = Blueprint("scenario", __name__)

@scenario_bp.get("/scenarios")
def get_scenarios():
    scenarios = PersonService.get_unique_scenarios()

    return jsonify({
        "scenarios": scenarios
    }), 200

@scenario_bp.get("/scenarios/<scenario_id>")
def get_scenarios_by_id(scenario_id):
    scenarios = PersonService.get_all_persons_by_scenario(scenario_id)

    return jsonify({
        "scenario_id": scenario_id,
        "persons": scenarios
    }), 200

@scenario_bp.get("/scenarios/<scenario_id>/<person_id>")
def get_person_by_id(scenario_id, person_id):
    result = ResultService.get_all_result_by_person_id(person_id)

    return jsonify({
        "scenario_id": scenario_id,
        "result": result
    }), 200 