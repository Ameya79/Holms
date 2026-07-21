"""
Embedding module — TRD §4.

Uses fastembed (ONNX runtime, no PyTorch) with BAAI/bge-small-en-v1.5.
BGE instruction prefix is applied to queries ONLY, never to stored chunks.

This module is loaded once and reused — the model stays in memory.
"""

import numpy as np
from fastembed import TextEmbedding

# Model is loaded once at import time (~130 MB download on first run)
_embedder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

EMBEDDING_DIM = 384  # bge-small-en-v1.5 output dimensionality


def embed_documents(chunks: list[str]) -> list[np.ndarray]:
    """
    Embed document chunks for storage. No instruction prefix —
    BGE documents are embedded as plain text.
    """
    return list(_embedder.embed(chunks))


def embed_query(query: str) -> np.ndarray:
    """
    Embed a search query with the BGE instruction prefix.
    This prefix was used during training and measurably improves recall.
    """
    prefixed = f"Represent this sentence for searching relevant passages: {query}"
    return list(_embedder.embed([prefixed]))[0]
