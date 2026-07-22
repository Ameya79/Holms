"""
desktop.py — Holms Native Desktop Application Entry Point.
Starts the FastAPI backend on 127.0.0.1:8000 silently and opens a native OS application window via pywebview.
"""

import sys
import os
import time
import shutil
import threading
import uvicorn
import webview

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

def main():
    if not check_tesseract():
        print("[holms] Tesseract not found — scanned image OCR will be disabled.", file=sys.stderr)
    if not check_sqlite_vec():
        print("[holms] sqlite-vec unavailable — falling back to numpy search.", file=sys.stderr)

    # Start FastAPI backend server in background thread
    t = threading.Thread(target=run_server, daemon=True)
    t.start()
    time.sleep(1.2)

    # Launch native desktop application window using pywebview
    window = webview.create_window(
        title="Holms — Local Document Search",
        url=f"http://127.0.0.1:{PORT}/app",
        width=1280,
        height=820,
        min_size=(900, 600),
        resizable=True,
    )
    webview.start()

if __name__ == "__main__":
    main()
