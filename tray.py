"""
tray.py — Holms tray app entry point.
Starts the FastAPI backend silently on localhost:8000, shows a system tray icon.
"""

import sys
import os
import time
import shutil
import threading
import webbrowser

import uvicorn
import pystray
from PIL import Image, ImageDraw

APP_URL = "https://holms.vercel.app/app"
PORT = 8000


def check_tesseract() -> bool:
    return shutil.which("tesseract") is not None


def check_sqlite_vec() -> bool:
    try:
        import sqlite_vec  # noqa
        return True
    except ImportError:
        return False


def run_server():
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=PORT,
        log_level="warning",
        access_log=False,
    )


def make_icon() -> Image.Image:
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([4, 38, 60, 58], fill="#1F4E4A")   # sea
    d.ellipse([14, 26, 50, 50], fill="#8A6D53")   # island
    d.polygon([(24, 26), (40, 26), (32, 14)], fill="#EDE3D0")  # hut roof
    d.rectangle([29, 32, 35, 40], fill="#1F4E4A")              # hut door
    return img


def open_app(icon, item):
    webbrowser.open(APP_URL)


def quit_app(icon, item):
    icon.stop()
    sys.exit(0)


def main():
    if not check_tesseract():
        print("[holms] Tesseract not found — scanned image OCR will be disabled.", file=sys.stderr)
    if not check_sqlite_vec():
        print("[holms] sqlite-vec unavailable — falling back to numpy search.", file=sys.stderr)

    t = threading.Thread(target=run_server, daemon=True)
    t.start()
    time.sleep(1.5)

    webbrowser.open(APP_URL)   # open browser automatically on launch

    menu = pystray.Menu(
        pystray.MenuItem("Open Holms", open_app, default=True),
        pystray.MenuItem("Quit", quit_app),
    )
    icon = pystray.Icon("Holms", make_icon(), "Holms", menu)
    icon.run()


if __name__ == "__main__":
    main()
