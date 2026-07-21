# TRD — Local Document RAG Assistant (v1)

Companion to PRD.md. Read PRD §2 first — this whole design assumes single-tenant-per-install, no auth.

## 1. High-level architecture

```
[ Browser: chat UI ]
        │  (runs on http://localhost:PORT, OR hosted on Vercel — see §6)
        ▼
[ FastAPI backend — runs on the user's own machine, no auth middleware ]
        │
        ├─ documents/        (raw uploaded files)
        ├─ index.db          (SQLite + sqlite-vec + a keyword index — one file, no server)
        └─ config.json       (which AI provider + which API key)
        ▼
[ Ingestion pipeline ]  →  [ Retrieval pipeline ]  →  [ single LLM call: verify + answer ]
```

Because there's no auth, there's no `user_id` to key folders by (contrast with the earlier multi-user draft). Everything just lives in one flat `data/` directory on the machine running the backend.

```
data/
 ├─ documents/
 ├─ index.db
 └─ config.json
```

## 2. "Straight up gets local storage access" — what this actually means

The backend is a normal Python process with normal filesystem access — it doesn't need any special permission model, because it's not running in a browser sandbox. The trick is just: **don't put a web server between the user and their disk that then re-restricts access.** Concretely:

- The FastAPI process runs directly on the user's machine (not in a container with a mounted-but-limited volume, not on serverless).
- File uploads write straight to `data/documents/` using the plain Python `pathlib`/`open()` you already know — no cloud SDK, no presigned URLs, no storage abstraction layer.
- The frontend never touches the filesystem directly (browsers can't do this anyway) — it only ever talks to the local backend over HTTP, and the backend does the actual disk I/O.

```python
from pathlib import Path

DATA_DIR = Path("data")
(DATA_DIR / "documents").mkdir(parents=True, exist_ok=True)

@app.post("/upload")
async def upload(file: UploadFile):
    dest = DATA_DIR / "documents" / file.filename
    dest.write_bytes(await file.read())
    process_document(dest)   # ingestion pipeline, §3
    return {"status": "ok"}
```

No user_id, no auth dependency, no per-request permission check — that's the entire simplification from dropping multi-tenancy.

## 3. Ingestion pipeline (with OCR)

Every uploaded file goes through this decision tree before chunking:

```
file in ──▶ is it PDF/DOCX with real selectable text?
              │
              ├─ YES ──▶ extract text directly (pymupdf / python-docx)
              │
              └─ NO (scanned PDF, or PNG/JPG) ──▶ run OCR (Tesseract) ──▶ extracted text
                                                       │
                                                       ▼
                                         same chunking pipeline either way
```

**How to detect "does this page actually have text"**: PyMuPDF (`fitz`) can extract text per page. If `page.get_text().strip()` comes back empty (or below some tiny character threshold), that page has no real text layer — it's an image, even if it's technically inside a PDF (a common case for scanned notices saved as PDF). Render that page to an image and OCR it instead.

```python
import fitz  # pymupdf
import pytesseract
from PIL import Image

def extract_text_from_pdf(path):
    doc = fitz.open(path)
    full_text = []
    for page in doc:
        text = page.get_text().strip()
        if len(text) < 20:  # effectively no real text layer — treat as scanned
            pix = page.get_pixmap(dpi=300)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            text = pytesseract.image_to_string(img)
        full_text.append(text)
    return "\n".join(full_text)

def extract_text_from_image(path):
    return pytesseract.image_to_string(Image.open(path))
```

**Why 300 DPI**: Tesseract's accuracy drops sharply below ~200 DPI on small/dense text (common in official notices with fine print). 300 DPI is the standard floor for reasonable OCR accuracy without excessive processing time.

**Install requirement**: Tesseract itself is a system binary, not just a pip package — `pytesseract` is a thin Python wrapper around it.
```bash
# macOS
brew install tesseract
# Ubuntu/Debian
sudo apt install tesseract-ocr
# Windows: installer from https://github.com/UB-Mannheim/tesseract/wiki
pip install pytesseract pymupdf pillow
```

**Confidence check (optional but recommended)**: `pytesseract.image_to_data()` returns per-word confidence scores. If average confidence on a page is very low (e.g. under 40), flag that document in the UI as "OCR quality may be poor" rather than silently indexing garbage text.

**Chunking — sentence-aware, not a character sliding window.** Cutting text at a fixed character/word count mid-sentence produces chunks that start or end on a fragment, which hurts both keyword and embedding search — a fragment doesn't carry a complete idea. Split on sentence boundaries first, then group whole sentences up to a target size:

```python
import re

def split_sentences(text: str) -> list[str]:
    # simple, dependency-free sentence splitter — good enough for notices/reports;
    # swap for a proper library (e.g. `blingfire` or `pysbd`) if abbreviations cause bad splits
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]

def chunk_text(text: str, target_words=300, overlap_sentences=1) -> list[str]:
    sentences = split_sentences(text)
    chunks, current, current_len = [], [], 0

    for sentence in sentences:
        words = len(sentence.split())
        if current_len + words > target_words and current:
            chunks.append(" ".join(current))
            current = current[-overlap_sentences:]  # carry the last sentence forward for continuity
            current_len = sum(len(s.split()) for s in current)
        current.append(sentence)
        current_len += words

    if current:
        chunks.append(" ".join(current))
    return chunks
```

Every chunk now ends on a real sentence boundary, and the one-sentence overlap keeps continuity across chunk edges without duplicating much text.

## 4. Retrieval: non-AI fetch, AI only for verification

This is the core architectural instruction from the brief — worth stating precisely, since it's easy to accidentally build the opposite (an LLM that "decides" how to search, which is slower and less deterministic).

**Fetch stage — all non-generative, all fast, all local:**
1. **Keyword search via SQLite FTS5** over chunk text — a name, a date, an exact term in a query matches directly. FTS5 ships built into SQLite itself, so there's no separate index to keep in memory or rebuild on startup — it's just another table, persistent on disk like everything else.
   ```sql
   CREATE VIRTUAL TABLE chunks_fts USING fts5(text, doc_id, content='chunks', content_rowid='id');
   -- query:
   SELECT doc_id, text, bm25(chunks_fts) AS score
   FROM chunks_fts WHERE chunks_fts MATCH ? ORDER BY score LIMIT 20;
   ```
   `bm25()` is FTS5's built-in ranking function — same BM25 algorithm the `rank-bm25` package implements, just computed by SQLite directly against a persistent index instead of rebuilt from scratch in Python memory on every query.
2. **Dense embedding search** via `fastembed` (ONNX runtime, no PyTorch) running the same BGE model (`BAAI/bge-small-en-v1.5`) + `sqlite-vec`. Functionally identical embeddings to the `sentence-transformers` version, at roughly a tenth of the install size — this matters for a tool meant to install easily on someone else's machine (PRD §2). Still not generative, still not an API call, still the same "fixed local computation" cost category as FTS5.

   **BGE instruction prefix — apply only to queries, not to stored document chunks:**
   ```python
   from fastembed import TextEmbedding

   embedder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

   def embed_documents(chunks: list[str]):
       return list(embedder.embed(chunks))          # no prefix — plain chunk text

   def embed_query(query: str):
       prefixed = f"Represent this sentence for searching relevant passages: {query}"
       return list(embedder.embed([prefixed]))[0]    # prefix only at query time
   ```
   BGE models are trained expecting this exact instruction string on the query side only — leaving it off doesn't break anything, but including it is a well-documented, essentially free recall improvement, so there's no reason to skip it.
3. Merge both rankings with **Reciprocal Rank Fusion** (compares rank position, not raw scores — the two methods aren't on comparable scales).

None of step 1–3 calls out to Claude/GPT/Gemini/Groq. This is the "use non-AI methods more to fetch" requirement — the fetch stage is entirely local, deterministic, and near-instant.

**Verification stage — the one and only LLM call:**
Take the top ~8 chunks from the fetch stage and hand them to the configured LLM with an instruction to (a) discard any that aren't actually relevant to the question and (b) answer using only the ones that are. This single call does double duty as reranker and answer-writer, rather than running a separate reranking model pass — that's the "fast" tradeoff: one network round-trip to an LLM API per question, not several.

```python
def answer_query(query: str) -> dict:
    shortlist = hybrid_search(query, k=8)   # BM25 + embeddings + RRF — all local, all fast

    prompt = f"""Below are candidate excerpts retrieved for a question. Some may be irrelevant — ignore those.
Answer using only the relevant excerpts. If none are relevant, say so.

{format_chunks(shortlist)}

Question: {query}"""

    response = call_llm(prompt)   # §5 — provider-agnostic
    return {"answer": response, "sources": [c.doc_id for c in shortlist]}
```

**Why this is faster than an "AI-heavy" pipeline**: an agentic approach (LLM decides what to search, calls a search tool, reads results, decides to search again...) costs multiple LLM round-trips per question, each with unpredictable latency. This design costs exactly one.

## 5. Multi-provider LLM support (bring-your-own-key)

A single interface, one small adapter per provider, selected by config — not by hardcoding one vendor's SDK into the app logic.

```python
# config.json
{
  "provider": "anthropic",   # or "gemini", "openai", "groq"
  "api_keys": {
    "anthropic": "sk-ant-...",
    "gemini": "...",
    "openai": "sk-...",
    "groq": "gsk_..."
  }
}
```

```python
def call_llm(prompt: str) -> str:
    provider = config["provider"]
    key = config["api_keys"][provider]

    if provider == "anthropic":
        import anthropic
        client = anthropic.Anthropic(api_key=key)
        r = client.messages.create(model="claude-sonnet-4-6", max_tokens=1000,
                                    messages=[{"role": "user", "content": prompt}])
        return r.content[0].text

    if provider == "openai":
        from openai import OpenAI
        client = OpenAI(api_key=key)
        r = client.chat.completions.create(model="gpt-4o-mini",
                                            messages=[{"role": "user", "content": prompt}])
        return r.choices[0].message.content

    if provider == "groq":
        from groq import Groq
        client = Groq(api_key=key)
        r = client.chat.completions.create(model="llama-3.3-70b-versatile",
                                            messages=[{"role": "user", "content": prompt}])
        return r.choices[0].message.content

    if provider == "gemini":
        from google import genai
        client = genai.Client(api_key=key)
        r = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        return r.text
```

`google-generativeai` (the `import google.generativeai as genai` form) is Google's deprecated legacy SDK — end-of-life as of November 30, 2025. `google-genai` (imported as `from google import genai`) is the current unified SDK and the one to build against.

**Important — verify exact model names before shipping.** Provider model names and which tiers are free change often (Groq's free-tier model list in particular rotates). Check each provider's current docs at build time rather than trusting any hardcoded name above, including the ones in this document — this is exactly the kind of fast-changing detail your IDE/agent should re-verify live rather than trust from a written spec.

Settings screen just needs: a dropdown for provider, a text field for that provider's key, a "test connection" button that fires one trivial prompt.

## 6. Vercel deployment (frontend only)

Recall from PRD §2: no shared backend server. Vercel hosts only the **static chat UI**; it talks to the FastAPI backend running on `localhost` on the user's own machine.

**Steps:**
1. Frontend is a Next.js (or plain Vite/React) app. Build it as a normal Vercel project — `vercel.json` not required for a standard Next.js app, Vercel auto-detects it.
2. The frontend needs to know where the backend is. Use an environment variable, not a hardcoded URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   Set this in Vercel's project settings (Environment Variables).
3. **CORS** — the FastAPI backend must explicitly allow the Vercel domain as an origin, since browser and backend are now on different origins (`https://your-app.vercel.app` calling `http://localhost:8000`):
   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-app.vercel.app", "http://localhost:3000"],
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
4. Deploy: `vercel --prod` from the frontend directory, or connect the GitHub repo in the Vercel dashboard for auto-deploy on push.
5. **The catch to be upfront about**: this only works while the user's own backend is running and reachable. A browser on `https://your-app.vercel.app` can reach `http://localhost:8000` **only on the same machine** the backend is running on — it cannot reach another person's `localhost`. So this Vercel deployment is really "a nicer-looking UI for your own local app," not a way for other people to use your machine's backend. If the goal is letting other people use the hosted UI against their *own* local backend, the UI needs a settings field where each person points it at their own `http://localhost:PORT` (which is already covered by making the API URL configurable, not hardcoded, per step 2).

## 7. Dependencies (superset, includes OCR + multi-provider)

```
fastapi
uvicorn[standard]
python-multipart

pymupdf
python-docx
pytesseract
pillow

fastembed
sqlite-vec

anthropic
openai
groq
google-genai
```

`rank-bm25` is dropped — FTS5 is built into Python's standard-library `sqlite3` module, no separate package needed. `sentence-transformers` is dropped in favor of `fastembed` (~200MB install, no PyTorch, vs. ~2GB). Tesseract itself installs separately as a system binary — see §3.

## 8. No-API-key mode — technical shape

The `/chat` endpoint from §4 branches on whether a key is configured, rather than requiring one:

```python
@app.post("/chat")
def chat(query: str):
    shortlist = hybrid_search(query, k=8)   # always runs, always local, always free

    if not config.get("api_keys", {}).get(config.get("provider")):
        # no-AI mode: return ranked, snippeted chunks directly
        return {
            "mode": "search_only",
            "results": [
                {"doc_id": c.doc_id, "snippet": highlight(c.text, query), "score": c.score}
                for c in shortlist
            ]
        }

    # AI mode: same shortlist, now verified + answered — see §4
    answer = call_llm(build_prompt(query, shortlist))
    return {"mode": "answered", "answer": answer, "sources": [c.doc_id for c in shortlist]}
```

`highlight()` is a plain string match/bolding of the query terms within the returned snippet — no model involved. This is what makes the no-key mode already better than a regular file search: it's ranked by meaning (embeddings) and keyword (BM25) together, and it searches OCR'd text from scanned files that a normal file explorer's search can't see at all.

## 9. Branding, PWA & landing page

**Brand tokens** (for whoever builds the actual page — landing page + in-app UI should share these):
- **Palette**: pale sand (`#EDE3D0`), deep sea teal (`#1F4E4A`), foam white (`#F7F6F1`), a single warm driftwood-brown accent (`#8A6D53`) for the one CTA button — not more than these four.
- **Type**: one calm, slightly humanist serif or rounded-sans for the wordmark "Holms," a plain clean sans for body copy. Avoid anything that reads "corporate SaaS."
- **Signature element**: a single small hut-on-an-island silhouette as the wordmark/favicon — this is the one bold visual choice; everything else on the page stays quiet around it.
- **Motion**: a slow, subtle wave motion (CSS/SVG, not heavy JS) behind or beneath the hero — restraint matters more than richness here, this is "calm island," not "busy ocean."
- **Copy tone**: plain, short sentences. "Your documents, on your own island." not marketing-speak.

**PWA setup** (what the landing page's download button actually does):
1. Add a `manifest.json` to the frontend app:
   ```json
   {
     "name": "Holms",
     "short_name": "Holms",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#EDE3D0",
     "theme_color": "#1F4E4A",
     "icons": [
       { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
     ]
   }
   ```
2. Link it in the HTML head: `<link rel="manifest" href="/manifest.json">`.
3. Register a service worker (even a minimal one) — a PWA install prompt won't fire without one:
   ```js
   if ("serviceWorker" in navigator) {
     navigator.serviceWorker.register("/sw.js");
   }
   ```
4. The landing page CTA button listens for the browser's `beforeinstallprompt` event and triggers it on click — this is the real "download" mechanism (there's no file being downloaded; it's the browser's native "install this as an app" flow):
   ```js
   let deferredPrompt;
   window.addEventListener("beforeinstallprompt", (e) => {
     e.preventDefault();
     deferredPrompt = e;
   });

   document.querySelector("#install-btn").addEventListener("click", async () => {
     if (deferredPrompt) {
       deferredPrompt.prompt();
       await deferredPrompt.userChoice;
       deferredPrompt = null;
     }
   });
   ```
5. **Caveat to flag**: since the backend still runs on `localhost` (§6), the installed PWA is a shortcut to the same UI — it still only works while the user's own local backend process is running. The PWA install solves "feels like an app, launches from the dock/home screen," not "works without the local server."

## 10. Startup script & platform fallback

**`run.py`** — a single entry point that sanity-checks the environment before the server starts, so failures show up as one clear message instead of a confusing runtime error three requests in:

```python
import shutil, subprocess, sys

def check_tesseract():
    if shutil.which("tesseract") is None:
        print("Tesseract not found on PATH. Install it:")
        print("  macOS:  brew install tesseract")
        print("  Ubuntu: sudo apt install tesseract-ocr")
        print("  Windows: https://github.com/UB-Mannheim/tesseract/wiki")
        sys.exit(1)
    subprocess.run(["tesseract", "--version"], capture_output=True)

def check_sqlite_vec():
    try:
        import sqlite_vec  # noqa
        return True
    except ImportError:
        print("sqlite-vec not available — falling back to brute-force numpy search (see below).")
        return False

if __name__ == "__main__":
    check_tesseract()
    vec_available = check_sqlite_vec()
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
```

**`sqlite-vec` fallback for Windows.** `sqlite-vec` is a relatively young project and its prebuilt wheels don't cover every Windows/Python version combination consistently — a clean pip install isn't guaranteed. Rather than blocking the whole app on it, fall back to a plain brute-force cosine similarity search when the extension fails to load. At personal-document scale (thousands of chunks, not millions), a numpy brute-force scan is genuinely fast enough — this isn't just a stopgap, it's a legitimate permanent path for smaller collections:

```python
import numpy as np

def brute_force_search(query_vector: np.ndarray, all_vectors: np.ndarray, k=20):
    # all_vectors: shape (n_chunks, dim), pre-loaded from index.db into memory at startup
    sims = all_vectors @ query_vector / (
        np.linalg.norm(all_vectors, axis=1) * np.linalg.norm(query_vector)
    )
    top_k = np.argsort(-sims)[:k]
    return top_k, sims[top_k]

def dense_search(query_vector, k=20):
    if vec_available:
        return sqlite_vec_search(query_vector, k)   # the sqlite-vec path from §4
    return brute_force_search(query_vector, loaded_vectors, k)
```

Store the same embeddings in both paths (as a BLOB column in the regular `chunks` table works fine even without the `vec0` virtual table) so switching between the two is just a matter of which search function runs, not a different storage format.

## 11. Explicit build-order delta from the earlier auth-based draft
Drop the entire "Login, sessions & JWT" stage from the earlier systems guide for this version — there is no auth layer in v1. Keep that document for reference only if a future multi-tenant SaaS version is ever built; it does not apply here.
