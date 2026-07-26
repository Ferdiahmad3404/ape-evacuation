from flask import Flask, app
from flask_cors import CORS

from .config import Config
from .extensions import db
from .routes.dataset_route import dataset_bp
from .routes.simulation_route import simulation_bp
from .routes.node_route import node_bp
from .routes.scenario_route import scenario_bp


def create_app():
    app = Flask(__name__)
    
    CORS(app, origins=["http://localhost:5173"])

    app.config.from_object(Config)

    db.init_app(app)
    app.register_blueprint(dataset_bp, url_prefix="/api")
    app.register_blueprint(simulation_bp, url_prefix="/api")
    app.register_blueprint(node_bp, url_prefix="/api")
    app.register_blueprint(scenario_bp, url_prefix="/api")

    with app.app_context():
        from .models import edge
        from .models import graph
        from .models import node
        from .models import person
        from .models import result
        from .models import scenario

        db.create_all()

    return app
