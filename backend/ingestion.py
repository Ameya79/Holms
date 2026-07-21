"""
Ingestion pipeline — TRD §3.

Extract text from PDF/DOCX/images, OCR when needed, chunk into sentences,
embed, and store in SQLite (chunks + FTS5 + optional vec0).
"""

import re
import uuid
import os

import fitz  # PyMuPDF
from docx import Document
import pytesseract
from PIL import Image

from backend.database import get_db, serialize_embedding
from backend.database import vec_available
from backend.embeddings import embed_documents


# ---------------------------------------------------------------------------
# Sentence-aware chunking (TRD §3)
# ---------------------------------------------------------------------------

def split_sentences(text: str) -> list[str]:
    """Dependency-free sentence splitter. Good enough for notices/reports."""
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]


def chunk_text(text: str, target_words: int = 300, overlap_sentences: int = 1) -> list[str]:
    """Group whole sentences up to *target_words*. Never cuts mid-sentence."""
    sentences = split_sentences(text)
    if not sentences:
        # Fallback: if the text has no sentence-ending punctuation at all,
        # treat the whole text as one chunk.
        return [text.strip()] if text.strip() else []

    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for sentence in sentences:
        words = len(sentence.split())
        if current_len + words > target_words and current:
            chunks.append(" ".join(current))
            # Carry the last sentence forward for continuity
            current = current[-overlap_sentences:]
            current_len = sum(len(s.split()) for s in current)
        current.append(sentence)
        current_len += words

    if current:
        chunks.append(" ".join(current))
    return chunks


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

def extract_text_from_pdf(filepath: str) -> tuple[str, bool]:
    """
    Extract text page by page.  If a page has < 20 chars of real text
    (TRD §3's threshold), render at 300 DPI and OCR it.

    Returns (full_text, ocr_was_used).
    """
    doc = fitz.open(filepath)
    full_text: list[str] = []
    ocr_used = False

    for page in doc:
        text = page.get_text().strip()

        if len(text) < 20:
            # No real text layer — treat as scanned
            ocr_used = True
            pix = page.get_pixmap(dpi=300)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            try:
                try:
                    data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
                    confidences = [int(c) for c in data["conf"] if str(c) != "-1"]
                    avg_conf = sum(confidences) / len(confidences) if confidences else 0
                    if avg_conf < 40:
                        print(f"  Low OCR confidence ({avg_conf:.0f}%) on page {page.number + 1} of {filepath}")
                except Exception:
                    pass

                text = pytesseract.image_to_string(img)
            except pytesseract.TesseractNotFoundError:
                raise ValueError(
                    "Tesseract binary was not found on your system PATH. "
                    "Please install Tesseract OCR (https://github.com/UB-Mannheim/tesseract/wiki) to process scanned documents or images."
                )
        full_text.append(text)

    doc.close()
    return "\n".join(full_text), ocr_used


def extract_text_from_docx(filepath: str) -> tuple[str, bool]:
    """Extract paragraph text from a DOCX file."""
    doc = Document(filepath)
    text = "\n".join(para.text for para in doc.paragraphs if para.text.strip())
    return text, False


def extract_text_from_image(filepath: str) -> tuple[str, bool]:
    """OCR an image file directly."""
    try:
        img = Image.open(filepath)
        text = pytesseract.image_to_string(img)
        return text, True
    except pytesseract.TesseractNotFoundError:
        raise ValueError(
            "Tesseract binary was not found on your system PATH. "
            "Please install Tesseract OCR (https://github.com/UB-Mannheim/tesseract/wiki) to process scanned documents or images."
        )


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".png", ".jpg", ".jpeg", ".txt", ".md"}


def process_document(filepath: str, filename: str) -> str:
    """
    Full ingestion pipeline: extract → chunk → embed → store.
    Returns the generated doc_id.
    """
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        text, ocr_used = extract_text_from_pdf(filepath)
    elif ext == ".docx":
        text, ocr_used = extract_text_from_docx(filepath)
    elif ext in {".png", ".jpg", ".jpeg"}:
        text, ocr_used = extract_text_from_image(filepath)
    elif ext in {".txt", ".md"}:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        ocr_used = False
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    if not text.strip():
        raise ValueError(f"No text could be extracted from {filename}")

    # Sentence-aware chunking
    chunks = chunk_text(text)
    if not chunks:
        raise ValueError(f"Chunking produced no output for {filename}")

    # Embed all chunks (local, ONNX, no API call)
    embeddings = embed_documents(chunks)

    # Store in database
    doc_id = str(uuid.uuid4())
    db = get_db()

    try:
        db.execute(
            "INSERT INTO documents (id, filename, filepath, ocr_used) VALUES (?, ?, ?, ?)",
            (doc_id, filename, filepath, ocr_used),
        )

        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            emb_bytes = serialize_embedding(emb)

            cursor = db.execute(
                "INSERT INTO chunks (doc_id, chunk_index, text, embedding) VALUES (?, ?, ?, ?)",
                (doc_id, i, chunk, emb_bytes),
            )
            chunk_id = cursor.lastrowid

            # FTS5 index
            db.execute(
                "INSERT INTO chunks_fts (rowid, text) VALUES (?, ?)",
                (chunk_id, chunk),
            )

            # sqlite-vec index (skip silently if unavailable)
            if vec_available:
                try:
                    db.execute(
                        "INSERT INTO vec_chunks (id, embedding) VALUES (?, ?)",
                        (chunk_id, emb_bytes),
                    )
                except Exception:
                    pass

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    return doc_id
