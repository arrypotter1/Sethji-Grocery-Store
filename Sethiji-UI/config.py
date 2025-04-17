import os

# Flask configuration
DEBUG = True
SECRET_KEY = os.environ.get("SESSION_SECRET", "dev_secret_key")

# Path configurations
DATABASE_PATH = "database"

# API Keys
TELEGRAM_API_KEY = os.environ.get("TELEGRAM_API_KEY", "")
DEEPGRAM_API_KEY = os.environ.get("DEEPGRAM_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# Application settings
MAX_INVENTORY_DISPLAY = 50
MAX_ORDERS_DISPLAY = 20
