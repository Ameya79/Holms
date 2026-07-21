"""
Holms startup script — TRD §10.

Checks Tesseract + sqlite-vec before the server starts so failures
surface as one clear message, not a confusing runtime error later.
"""

import shutil
import subprocess
import sys
from pathlib import Path

# Ensure the project root is importable
sys.path.insert(0, str(Path(__file__).parent))


import os

def check_tesseract():
    """Check for Tesseract. Auto-detect common Windows paths if not on PATH."""
    common_windows_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe")
    ]
    
    tesseract_bin = shutil.which("tesseract")
    if not tesseract_bin:
        for path in common_windows_paths:
            if os.path.exists(path):
                tesseract_bin = path
                os.environ["PATH"] += os.pathsep + os.path.dirname(path)
                try:
                    import pytesseract
                    pytesseract.pytesseract.tesseract_cmd = path
                except ImportError:
                    pass
                break

    if not tesseract_bin:
        print("  [WARN] Tesseract is not installed or not on PATH.")
        print("         PDFs with selectable text and DOCX files will index fine.")
        print("         Scanned images/PDFs require Tesseract: https://github.com/UB-Mannheim/tesseract/wiki")
        return False

    try:
        result = subprocess.run(
            [tesseract_bin, "--version"],
            capture_output=True,
            text=True,
        )
        version_line = result.stdout.split("\n")[0] if result.stdout else "found"
        print(f"  [OK] Tesseract found: {version_line}")
        return True
    except Exception:
        print("  [WARN] Could not execute tesseract binary.")
        return False


def check_sqlite_vec():
    """Check if sqlite-vec is available. Non-fatal — falls back to numpy."""
    try:
        import sqlite_vec  # noqa: F401
        print("  [OK] sqlite-vec available (fast vector search)")
        return True
    except ImportError:
        print("  [WARN] sqlite-vec not available — using numpy brute-force search (fine for personal use)")
        return False


def check_python_version():
    """Warn if Python version is below 3.10."""
    v = sys.version_info
    if v < (3, 10):
        print(f"  [WARN] Python {v.major}.{v.minor} detected — 3.10+ recommended")
    else:
        print(f"  [OK] Python {v.major}.{v.minor}.{v.micro}")


def main():
    print()
    print("  H O L M S")
    print("  Your documents, on your own island.")
    print()
    print("Checking environment...")
    print()

    check_python_version()
    check_tesseract()
    check_sqlite_vec()

    print()
    print("Initializing database...")
    from backend.database import init_db
    init_db()

    print("Loading embedding model (first run downloads ~130 MB)...")
    from backend.embeddings import embed_query
    embed_query("warmup")  # Forces model download + load
    print("  [OK] Embedding model ready")

    print()
    print("=" * 60)
    if (Path(__file__).parent / "frontend" / "out").exists():
        print("  Holms is running at http://localhost:8000")
    else:
        print("  Backend running at http://localhost:8000")
        print("  Start frontend: cd frontend && npm run dev -> http://localhost:3000")
    print("  Press Ctrl+C to stop.")
    print("=" * 60)
    print()

    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",  # Local only — single-tenant, no network exposure
        port=8000,
        reload=False,
    )


if __name__ == "__main__":
    main()
