import json
import os
import sys
from pathlib import Path

def get_app_data_dir() -> Path:
    """Return OS-standard user app data directory for Holms."""
    if getattr(sys, "frozen", False):
        if sys.platform == "win32":
            base = Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData" / "Local"))
            return base / "Holms" / "data"
        elif sys.platform == "darwin":
            return Path.home() / "Library" / "Application Support" / "Holms" / "data"
        else:
            return Path.home() / ".config" / "holms" / "data"
    return Path(__file__).parent.parent / "data"

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = get_app_data_dir()
DATA_DIR.mkdir(parents=True, exist_ok=True)
CONFIG_FILE = DATA_DIR / "config.json"

DEFAULT_CONFIG = {
    "provider": "anthropic",
    "api_keys": {
        "anthropic": "",
        "gemini": "",
        "openai": "",
        "groq": ""
    }
}

def load_config():
    if not CONFIG_FILE.exists():
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)

def save_config(config):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)

def get_config():
    return load_config()
