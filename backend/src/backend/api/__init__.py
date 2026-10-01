from quart import Blueprint

from backend.api.go_cardless import blueprint as gc_webhook_blueprint

v1_blueprint = Blueprint("v1", __name__, url_prefix="/v1")
v1_blueprint.register_blueprint(gc_webhook_blueprint)

blueprint = Blueprint("api", __name__)
blueprint.register_blueprint(v1_blueprint)
