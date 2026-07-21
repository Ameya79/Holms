import sqlite3
import struct
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "index.db"

# Global flag — set once at init, read by search.py
vec_available = False


def get_db():
    """Get a database connection. sqlite-vec is loaded if available."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(str(DB_PATH))
    db.execute("PRAGMA journal_mode=WAL")
    db.execute("PRAGMA foreign_keys=ON")
    db.row_factory = sqlite3.Row

    if vec_available:
        db.enable_load_extension(True)
        try:
            import sqlite_vec
            sqlite_vec.load(db)
        except Exception:
            pass
        db.enable_load_extension(False)

    return db


def init_db():
    """Create tables. Called once at startup via run.py."""
    global vec_available

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(str(DB_PATH))
    db.execute("PRAGMA journal_mode=WAL")
    db.execute("PRAGMA foreign_keys=ON")
    db.row_factory = sqlite3.Row

    # --- Check sqlite-vec availability ---
    try:
        db.enable_load_extension(True)
        import sqlite_vec
        sqlite_vec.load(db)
        vec_available = True
        db.enable_load_extension(False)
    except Exception:
        vec_available = False

    # --- Documents table ---
    db.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            filepath TEXT,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ocr_used BOOLEAN DEFAULT 0
        )
    """)

    # --- Chunks table ---
    db.execute("""
        CREATE TABLE IF NOT EXISTS chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            text TEXT NOT NULL,
            embedding BLOB,
            FOREIGN KEY(doc_id) REFERENCES documents(id) ON DELETE CASCADE
        )
    """)

    # --- FTS5 full-text index (keyword search) ---
    db.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
            text,
            content='chunks',
            content_rowid='id'
        )
    """)

    # --- sqlite-vec vector index (dense search) ---
    if vec_available:
        try:
            db.execute("""
                CREATE VIRTUAL TABLE IF NOT EXISTS vec_chunks USING vec0(
                    id INTEGER PRIMARY KEY,
                    embedding float[384]
                )
            """)
        except sqlite3.OperationalError:
            vec_available = False

    db.commit()
    db.close()


def serialize_embedding(embedding) -> bytes:
    """Convert a numpy array or list of floats to bytes for SQLite storage."""
    import numpy as np
    if isinstance(embedding, np.ndarray):
        return embedding.astype(np.float32).tobytes()
    return struct.pack(f"{len(embedding)}f", *embedding)


def deserialize_embedding(blob: bytes):
    """Convert bytes back to a numpy array."""
    import numpy as np
    return np.frombuffer(blob, dtype=np.float32)
