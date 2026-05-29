from flask import Blueprint, jsonify, request
from ..services.person_service import PersonService

import pandas as pd


scenario_bp = Blueprint("scenario", __name__)

@scenario_bp.get("/scenarios")
def get_scenarios():
    scenarios = PersonService.get_unique_scenarios()

    return jsonify({
        "scenarios": scenarios
    }), 200