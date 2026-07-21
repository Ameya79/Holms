"""
Retrieval pipeline — TRD §4.

BM25 (FTS5) + dense embeddings (fastembed/sqlite-vec) → RRF merge.
All local, all fast, no LLM calls.
"""

import re
from dataclasses import dataclass

import numpy as np

from backend.database import get_db, deserialize_embedding, vec_available
from backend.embeddings import embed_query


@dataclass
class ChunkResult:
    """A single ranked chunk returned by hybrid_search."""
    chunk_id: int
    doc_id: str
    text: str
    score: float
    filename: str = ""


# ---------------------------------------------------------------------------
# BM25 keyword search via FTS5
# ---------------------------------------------------------------------------

def search_bm25(query: str, k: int = 60) -> list[dict]:
    """
    Keyword search using SQLite FTS5's built-in BM25 ranking.
    Returns list of {"id": chunk_id, "rank": bm25_rank}.
    """
    db = get_db()
    try:
        # FTS5 MATCH: quote each term to handle special chars
        terms = [t.strip() for t in query.split() if t.strip()]
        if not terms:
            return []

        # Use OR so that partial matches rank lower rather than being excluded
        fts_query = " OR ".join(f'"{t}"' for t in terms)

        rows = db.execute(
            """
            SELECT rowid, bm25(chunks_fts) AS rank
            FROM chunks_fts
            WHERE chunks_fts MATCH ?
            ORDER BY rank
            LIMIT ?
            """,
            (fts_query, k),
        ).fetchall()

        return [{"id": row["rowid"], "rank": row["rank"]} for row in rows]
    except Exception as e:
        print(f"BM25 search error: {e}")
        return []
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Dense vector search (sqlite-vec with numpy fallback)
# ---------------------------------------------------------------------------

def _sqlite_vec_search(query_vec: np.ndarray, k: int, db) -> list[dict]:
    """Use the sqlite-vec vec0 virtual table for ANN search."""
    rows = db.execute(
        """
        SELECT id, distance
        FROM vec_chunks
        WHERE embedding MATCH ? AND k = ?
        """,
        (query_vec.astype(np.float32).tobytes(), k),
    ).fetchall()
    return [{"id": row["id"], "distance": row["distance"]} for row in rows]


def _numpy_brute_force(query_vec: np.ndarray, k: int, db) -> list[dict]:
    """
    Fallback: load all embeddings from the chunks table and compute
    cosine similarity in numpy. At personal-document scale (thousands
    of chunks, not millions) this is genuinely fast enough.
    """
    rows = db.execute("SELECT id, embedding FROM chunks WHERE embedding IS NOT NULL").fetchall()
    if not rows:
        return []

    ids = [r["id"] for r in rows]
    vectors = np.array([np.frombuffer(r["embedding"], dtype=np.float32) for r in rows])

    # Cosine similarity
    query_norm = np.linalg.norm(query_vec)
    if query_norm == 0:
        return []
    vec_norms = np.linalg.norm(vectors, axis=1)
    # Avoid division by zero
    vec_norms = np.where(vec_norms == 0, 1e-10, vec_norms)
    sims = (vectors @ query_vec) / (vec_norms * query_norm)

    top_k_indices = np.argsort(-sims)[:k]
    return [{"id": ids[idx], "distance": float(1 - sims[idx])} for idx in top_k_indices]


def search_vector(query: str, k: int = 60) -> list[dict]:
    """
    Dense vector search. Tries sqlite-vec first, falls back to numpy.
    Returns list of {"id": chunk_id, "distance": float}.
    """
    query_vec = np.array(embed_query(query), dtype=np.float32)
    db = get_db()
    try:
        if vec_available:
            try:
                return _sqlite_vec_search(query_vec, k, db)
            except Exception:
                pass
        return _numpy_brute_force(query_vec, k, db)
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Reciprocal Rank Fusion (RRF)
# ---------------------------------------------------------------------------

def reciprocal_rank_fusion(
    bm25_results: list[dict],
    vec_results: list[dict],
    k_constant: int = 60,
) -> dict[int, float]:
    """
    RRF(d) = Σ 1/(k + rank(d)) across all rankers.
    k_constant = 60 is the standard default.
    """
    scores: dict[int, float] = {}

    for rank, res in enumerate(bm25_results):
        chunk_id = res["id"]
        scores[chunk_id] = scores.get(chunk_id, 0.0) + 1.0 / (k_constant + rank + 1)

    for rank, res in enumerate(vec_results):
        chunk_id = res["id"]
        scores[chunk_id] = scores.get(chunk_id, 0.0) + 1.0 / (k_constant + rank + 1)

    return scores


# ---------------------------------------------------------------------------
# Highlight
# ---------------------------------------------------------------------------

def highlight(text: str, query: str) -> str:
    """
    Plain string match — wrap query terms in **bold** markers.
    No model involved. Uses word boundaries for clean term matching.
    """
    terms = [t.strip() for t in query.split() if t.strip()]
    for term in terms:
        if term.isalnum():
            pattern = re.compile(r'\b' + re.escape(term) + r'\b', re.IGNORECASE)
        else:
            pattern = re.compile(re.escape(term), re.IGNORECASE)
        text = pattern.sub(lambda m: f"**{m.group(0)}**", text)
    return text


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

def hybrid_search(query: str, k: int = 8) -> list[ChunkResult]:
    """
    Full hybrid search: BM25 + dense embeddings + RRF merge.
    Returns the top-k ChunkResult objects, sorted by fused score.
    """
    bm25_results = search_bm25(query, k=60)
    vec_results = search_vector(query, k=60)

    rrf_scores = reciprocal_rank_fusion(bm25_results, vec_results)
    if not rrf_scores:
        return []

    # Get top-k chunk IDs by fused score
    sorted_ids = sorted(rrf_scores.keys(), key=lambda cid: rrf_scores[cid], reverse=True)[:k]

    # Fetch chunk text + doc info in one query
    db = get_db()
    try:
        placeholders = ",".join("?" * len(sorted_ids))
        rows = db.execute(
            f"""
            SELECT c.id, c.doc_id, c.text, d.filename
            FROM chunks c
            JOIN documents d ON c.doc_id = d.id
            WHERE c.id IN ({placeholders})
            """,
            sorted_ids,
        ).fetchall()
    finally:
        db.close()

    # Build a map and reorder by RRF score
    chunk_map = {
        row["id"]: ChunkResult(
            chunk_id=row["id"],
            doc_id=row["doc_id"],
            text=row["text"],
            score=rrf_scores[row["id"]],
            filename=row["filename"],
        )
        for row in rows
    }

    return [chunk_map[cid] for cid in sorted_ids if cid in chunk_map]
