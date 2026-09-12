from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    SIMULATION_MODE: bool = False
    HEARTBEAT_INTERVAL: float = 1.0
    TIMEOUT_SECONDS: float = 10.0
    DEVICE_ID: str = "esp32-motor-01"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
