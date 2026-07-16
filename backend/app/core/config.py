import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME = "MediVision AI"
    VERSION = "1.0.0"

    MONGODB_URL = os.getenv("MONGODB_URL")
    SECRET_KEY = os.getenv("SECRET_KEY")

settings = Settings()