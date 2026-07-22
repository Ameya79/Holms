"""
Holms — FastAPI backend.

Routes: /upload, /chat, /documents, /settings.
No auth middleware, no user_id — single-tenant per PRD §2.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import shutil
import os

from backend.config import get_config, save_config, DATA_DIR
from backend.database import init_db
from backend.search import hybrid_search, highlight
from backend.llm import build_prompt, call_llm
from backend.ingestion import process_document, SUPPORTED_EXTENSIONS

app = FastAPI(title="Holms", description="Local document search + RAG assistant")

# CORS — allow the Vercel-hosted UI and local dev (TRD §6)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

DOCS_DIR = DATA_DIR / "documents"
DOCS_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    query: str


class SettingsRequest(BaseModel):
    provider: str
    api_keys: dict[str, str]


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Upload — TRD §2, §3
# ---------------------------------------------------------------------------

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Accept a file, write to data/documents/, run the full ingestion
    pipeline (extract → OCR if needed → chunk → embed → index).
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Supported: {', '.join(SUPPORTED_EXTENSIONS)}",
        )

    filepath = DOCS_DIR / file.filename
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        doc_id = process_document(str(filepath), file.filename)
    except Exception as e:
        # Clean up the uploaded file on failure
        if filepath.exists():
            os.remove(filepath)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {e}")

    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "message": "Uploaded and indexed successfully",
    }


def format_file_size(size_bytes: int) -> str:
    """Format file size in human-readable string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def get_file_type(filename: str) -> str:
    """Get uppercase file type badge label."""
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf":
        return "PDF"
    elif ext == ".docx":
        return "DOCX"
    elif ext in {".png", ".jpg", ".jpeg"}:
        return "IMG"
    return "TXT"


@app.get("/documents/{filename}")
def serve_document(filename: str):
    """Serve the raw original document file."""
    path = DOCS_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Document file not found")
    return FileResponse(path)


# ---------------------------------------------------------------------------
# Chat / Search — TRD §4, §8, v0.2 spec
# ---------------------------------------------------------------------------

@app.post("/chat")
def chat(request: ChatRequest):
    """
    Hybrid search → group hits by source document → return document objects.
    No-API-key mode: return document cards directly.
    AI mode: single LLM call for summary answer below document cards.
    """
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    shortlist = hybrid_search(query, k=16)  # Fetch candidate chunks

    # Group chunks by document
    doc_map = {}
    for c in shortlist:
        doc_id = c.doc_id
        if doc_id not in doc_map:
            doc_map[doc_id] = {
                "doc_id": doc_id,
                "filename": c.filename,
                "chunks": [],
            }
        doc_map[doc_id]["chunks"].append(c)

    # Build document result cards
    document_results = []
    for doc_id, data in doc_map.items():
        filename = data["filename"]
        chunks = sorted(data["chunks"], key=lambda x: x.score, reverse=True)
        top_chunk = chunks[0]

        filepath = DOCS_DIR / filename
        file_size = format_file_size(filepath.stat().st_size) if filepath.exists() else "Unknown size"
        file_type = get_file_type(filename)

        document_results.append({
            "doc_id": doc_id,
            "filename": filename,
            "file_type": file_type,
            "file_size": file_size,
            "download_url": f"/documents/{filename}",
            "top_snippet": highlight(top_chunk.text, query),
            "best_score": round(top_chunk.score, 4),
            "matched_chunks": [
                {"text": ch.text, "score": round(ch.score, 4)}
                for ch in chunks
            ],
        })

    # Sort documents by best chunk score descending
    document_results.sort(key=lambda d: d["best_score"], reverse=True)

    config = get_config()
    active_key = config.get("api_keys", {}).get(config.get("provider", ""), "")

    if not active_key:
        # Search-only mode: return ranked document cards directly
        return {
            "mode": "search_only",
            "documents": document_results,
        }

    # AI mode: same shortlist, verified + answered — one LLM call
    try:
        prompt = build_prompt(query, shortlist)
        answer = call_llm(prompt)
        return {
            "mode": "answered",
            "answer": answer,
            "documents": document_results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM call failed: {e}")
        raise HTTPException(status_code=500, detail=f"LLM call failed: {e}")


# ---------------------------------------------------------------------------
# Documents — browse indexed files
# ---------------------------------------------------------------------------

@app.get("/documents")
def list_documents():
    """List all indexed documents."""
    from backend.database import get_db

    db = get_db()
    try:
        docs = db.execute(
            "SELECT id, filename, uploaded_at, ocr_used FROM documents ORDER BY uploaded_at DESC"
        ).fetchall()

        result = []
        for d in docs:
            chunk_count = db.execute(
                "SELECT COUNT(*) FROM chunks WHERE doc_id = ?", (d["id"],)
            ).fetchone()[0]
            result.append({
                "id": d["id"],
                "filename": d["filename"],
                "uploaded_at": d["uploaded_at"],
                "ocr_used": bool(d["ocr_used"]),
                "chunk_count": chunk_count,
            })
        return result
    finally:
        db.close()


@app.get("/documents/{doc_id}")
def get_document(doc_id: str):
    """Get details for a single document."""
    from backend.database import get_db

    db = get_db()
    try:
        doc = db.execute(
            "SELECT id, filename, uploaded_at, ocr_used FROM documents WHERE id = ?",
            (doc_id,),
        ).fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        chunk_count = db.execute(
            "SELECT COUNT(*) FROM chunks WHERE doc_id = ?", (doc_id,)
        ).fetchone()[0]

        return {
            "id": doc["id"],
            "filename": doc["filename"],
            "uploaded_at": doc["uploaded_at"],
            "ocr_used": bool(doc["ocr_used"]),
            "chunk_count": chunk_count,
        }
    finally:
        db.close()


@app.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    """Remove a document and all its chunks / embeddings from the index."""
    from backend.database import get_db, vec_available

    db = get_db()
    try:
        doc = db.execute(
            "SELECT filename FROM documents WHERE id = ?", (doc_id,)
        ).fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Get chunk IDs for FTS5 / vec cleanup
        chunk_ids = [
            row["id"]
            for row in db.execute("SELECT id FROM chunks WHERE doc_id = ?", (doc_id,)).fetchall()
        ]

        if chunk_ids:
            ph = ",".join("?" * len(chunk_ids))
            db.execute(f"DELETE FROM chunks_fts WHERE rowid IN ({ph})", chunk_ids)
            if vec_available:
                try:
                    db.execute(f"DELETE FROM vec_chunks WHERE id IN ({ph})", chunk_ids)
                except Exception:
                    pass

        # Cascade will also delete chunks, but we already cleaned FTS/vec above
        db.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        db.commit()

        # Remove the file from disk
        filepath = DOCS_DIR / doc["filename"]
        if filepath.exists():
            os.remove(filepath)

        return {"message": "Deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Settings — TRD §5
# ---------------------------------------------------------------------------

@app.get("/settings")
def get_settings():
    """Get current config. API keys are masked for display."""
    config = get_config()
    masked_keys = {}
    for provider, key in config.get("api_keys", {}).items():
        if key:
            # Show first 4 and last 4 chars only
            masked_keys[provider] = f"{key[:4]}...{key[-4:]}" if len(key) > 8 else "****"
        else:
            masked_keys[provider] = ""
    return {"provider": config.get("provider", ""), "api_keys": masked_keys}


@app.post("/settings")
def update_settings(settings: SettingsRequest):
    """Save provider + API keys. Ignores masked placeholder values."""
    config = get_config()
    config["provider"] = settings.provider
    for provider, key in settings.api_keys.items():
        # Don't overwrite with masked display values
        if key and "..." not in key and key != "****":
            config.setdefault("api_keys", {})[provider] = key
    save_config(config)
    return {"message": "Settings updated"}


@app.post("/settings/test")
def test_connection():
    """Fire one trivial prompt to validate the configured API key."""
    try:
        response = call_llm("Reply with exactly: OK")
        return {"status": "success", "response": response}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ---------------------------------------------------------------------------
# Serve frontend static files (Next.js static export out/)
# ---------------------------------------------------------------------------
from pathlib import Path

OUT_DIR = Path(__file__).parent.parent / "frontend" / "out"
if OUT_DIR.exists():
    @app.get("/")
    def serve_landing():
        return FileResponse(OUT_DIR / "index.html")

    @app.get("/app")
    def serve_app_route():
        app_html = OUT_DIR / "app" / "index.html"
        if app_html.exists():
            return FileResponse(app_html)
        return FileResponse(OUT_DIR / "index.html")

    app.mount("/", StaticFiles(directory=str(OUT_DIR), html=True), name="static")

