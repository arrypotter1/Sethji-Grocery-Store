import os
import logging
from flask import Flask
from routes.main_routes import main_bp

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create and configure the app
app = Flask(__name__)
app.config.from_pyfile('config.py')
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")

# Register blueprints
app.register_blueprint(main_bp)

# Initialize database folder if it doesn't exist
from database.db_manager import init_database
init_database()

logger.debug("Application initialized")
