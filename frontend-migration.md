# Holms — Frontend Migration: Vanilla → Next.js

**Scope**: frontend only. The Python backend (`run.py`, FastAPI, ingestion, retrieval, sqlite-vec, FTS5) is not touched at all. No file inside the backend directory changes. If you are touching `run.py`, `app.py`, `ingestion.py`, or anything in `data/` — stop, you are out of scope.

---

## The tradeoff you are accepting

| | Vanilla (before) | Next.js (after) |
|---|---|---|
| **User needs Node.js** | No | Yes — one-time install |
| **Single command startup** | `python run.py` | Two terminals: `python run.py` + `npm run dev`, OR one command with `concurrently` (step 7) |
| **Static export option** | Not needed | Available: `next export` → serve static files from FastAPI (restores single-command) |
| **UI quality ceiling** | Low — raw DOM manipulation | Full React component model, Tailwind, easy to extend |
| **Vercel deploy** | Manual | `git push` auto-deploys |

The recommended dev setup: two terminals. The recommended distribution setup: Next.js static export served by FastAPI (step 8 covers both).

---

## Step 0 — Read before touching anything

Understand the current file layout first. Run `tree` or look at the repo. Expected structure before this migration:

```
Holms/
 ├─ run.py               ← DO NOT TOUCH
 ├─ app.py               ← DO NOT TOUCH
 ├─ ingestion.py         ← DO NOT TOUCH
 ├─ requirements.txt     ← DO NOT TOUCH
 ├─ data/                ← DO NOT TOUCH
 ├─ static/              ← THIS IS WHAT YOU ARE REPLACING
 │   ├─ index.html
 │   ├─ app.html (or similar)
 │   └─ *.css / *.js
 └─ README.md
```

The `static/` directory (or wherever vanilla HTML files live) is the only thing being migrated. The new `frontend/` directory will sit alongside the backend, not inside it.

---

## Step 1 — Scaffold the Next.js app

From the **repo root** (not inside any existing directory):

```bash
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

When it asks "Would you like to use Turbopack?": **Yes**.

This creates `Holms/frontend/` alongside your existing backend files.

**Verify the backend is unaffected:**
```bash
# In the repo root — still works exactly as before
python run.py
```

---

## Step 2 — Configure the API URL

Create `frontend/.env.local` (this file is gitignored by default in Next.js — good, API URLs should not be committed):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Create `frontend/.env.production` for when the frontend is deployed to Vercel:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Note: in production, each user's frontend points at their own `localhost:8000` — this is intentional per the architecture (TRD §6). The env var is what makes this configurable per-user rather than hardcoded.

Create a typed API helper so the URL is never scattered across components:

```ts
// frontend/lib/api.ts

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function search(query: string) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

export async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function listDocuments() {
  const res = await fetch(`${BASE}/documents`);
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  return res.json();
}

export function documentUrl(filename: string) {
  return `${BASE}/documents/${encodeURIComponent(filename)}`;
}
```

---

## Step 3 — CORS update on the backend (one line, then stop)

The only backend change in this whole migration: add your Next.js dev origin to the CORS allow-list in `app.py`. Find the existing `CORSMiddleware` block and update `allow_origins`:

```python
# app.py — find this block and update allow_origins only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",          # Next.js dev server
        "https://your-app.vercel.app",    # Vercel deploy (update with real domain)
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

That is the entire backend change. Do not touch anything else in `app.py`.

---

## Step 4 — Design tokens (Tailwind)

Replace `frontend/tailwind.config.ts` content with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.ts"],
  theme: {
    extend: {
      colors: {
        sand:  "#EDE3D0",   // page background
        foam:  "#F7F6F1",   // card background
        teal:  "#1F4E4A",   // primary text, borders, buttons
        drift: "#8A6D53",   // CTA button, PDF border accent
        ink:   "#2C2C2C",   // body text
        muted: "#7A8A85",   // secondary text
        match: "#F5D87A",   // snippet keyword highlight
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans:  ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Step 5 — Component breakdown

Migrate the vanilla HTML into these components. Create each file in `frontend/components/`:

```
frontend/
 └─ components/
     ├─ SearchBox.tsx        ← the centered input, slides up on results
     ├─ DocumentCard.tsx     ← one card per matched document
     ├─ DocumentGrid.tsx     ← responsive grid of DocumentCards
     ├─ AnswerBox.tsx        ← AI answer (shown only if API key configured)
     ├─ UploadZone.tsx       ← drag-and-drop + indexed files list
     └─ TopBar.tsx           ← wordmark + doc count + settings icon
```

**SearchBox.tsx** — centered input, not bottom-anchored. Transitions upward when results exist:

```tsx
"use client";
import { useState } from "react";

interface Props {
  onSearch: (q: string) => void;
  loading: boolean;
  hasResults: boolean;
}

export default function SearchBox({ onSearch, loading, hasResults }: Props) {
  const [query, setQuery] = useState("");

  return (
    <div className={`flex flex-col items-center transition-all duration-300 ${
      hasResults ? "mt-8" : "mt-[25vh]"   // slides up when results appear
    }`}>
      <h1 className="font-serif text-4xl text-teal tracking-wide mb-6">Holms</h1>
      <div className="flex gap-2 w-full max-w-xl">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && onSearch(query)}
          placeholder="What do you need?"
          disabled={loading}
          className="flex-1 border-[1.5px] border-teal rounded-lg px-4 py-3 text-base
                     bg-foam text-ink placeholder:text-muted
                     focus:outline-none focus:border-drift transition-colors"
        />
        <button
          onClick={() => onSearch(query)}
          disabled={loading}
          className="bg-drift text-white px-5 py-3 rounded-lg text-sm
                     font-medium disabled:opacity-50 transition-opacity"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>
    </div>
  );
}
```

**DocumentCard.tsx** — shows a single matched document, not a text block:

```tsx
import { documentUrl } from "@/lib/api";

interface Chunk {
  text: string;
  score: number;
}

interface Doc {
  doc_id: string;
  filename: string;
  file_type: string;
  top_snippet: string;
  matched_chunks: Chunk[];
}

interface Props {
  doc: Doc;
  query: string;
}

const TYPE_ACCENT: Record<string, string> = {
  pdf:  "border-l-drift",
  docx: "border-l-teal",
  img:  "border-l-sand",
};

function highlight(text: string, query: string) {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return text;
  const pattern = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.replace(pattern, `<mark class="bg-match rounded-sm px-0.5">$1</mark>`);
}

export default function DocumentCard({ doc, query }: Props) {
  const accent = TYPE_ACCENT[doc.file_type] ?? "border-l-muted";
  const snippet = highlight(doc.top_snippet, query);

  return (
    <div className={`bg-foam border border-teal/20 border-l-4 ${accent} rounded-lg p-4 flex flex-col gap-3`}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-ink text-sm leading-tight">{doc.filename}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted border border-muted/40
                         rounded px-1.5 py-0.5 shrink-0">
          {doc.file_type}
        </span>
      </div>
      <p
        className="text-sm text-ink/80 leading-relaxed line-clamp-3"
        dangerouslySetInnerHTML={{ __html: snippet }}
      />
      <div className="flex gap-2 mt-1">
        <a
          href={documentUrl(doc.filename)}
          target="_blank"
          rel="noopener"
          className="text-xs bg-teal text-white px-3 py-1.5 rounded hover:opacity-80 transition-opacity"
        >
          Open
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(doc.filename)}
          className="text-xs border border-teal/40 text-teal px-3 py-1.5 rounded
                     hover:bg-teal/5 transition-colors"
        >
          Copy name
        </button>
      </div>
    </div>
  );
}
```

**DocumentGrid.tsx** — responsive grid:

```tsx
import DocumentCard from "./DocumentCard";

interface Props {
  documents: ReturnType<typeof Object.values>[number][];
  query: string;
}

export default function DocumentGrid({ documents, query }: Props) {
  if (!documents.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {documents.map((doc: any) => (
        <DocumentCard key={doc.doc_id} doc={doc} query={query} />
      ))}
    </div>
  );
}
```

---

## Step 6 — App routes

```
frontend/app/
 ├─ layout.tsx          ← global font, sand background
 ├─ page.tsx            ← landing page (island, CTA)
 └─ app/
     └─ page.tsx        ← the search app UI
```

**`frontend/app/layout.tsx`**:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Holms",
  description: "Your documents. Your island.",
  themeColor: "#1F4E4A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-sand min-h-screen font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
```

**`frontend/app/page.tsx`** — landing page. Keep it as a thin shell; the real landing page content follows the spec in `update-prompt.md` (SVG island, animated wave, one CTA). Placeholder structure:

```tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Landing() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* Hero — SVG island goes here per update-prompt.md Fix 3 */}
      <section className="w-full flex flex-col items-center justify-center" style={{ minHeight: "70vh" }}>
        {/* TODO: SVG island illustration + animated wave */}
        <h1 className="font-serif text-6xl text-teal tracking-wide mb-4">Holms</h1>
        <p className="text-muted text-lg mb-10">Your documents. Your island.</p>
        <button
          onClick={install}
          className="bg-drift text-white px-8 py-3 rounded-lg text-base font-medium
                     hover:opacity-90 transition-opacity"
        >
          Install Holms
        </button>
        <p className="text-muted text-xs mt-3">Works on Mac, Windows, Linux</p>
      </section>

      {/* Value strip */}
      <p className="text-muted text-sm text-center py-8 border-t border-teal/10 w-full">
        Search what's yours · Works without an API key · Nothing leaves your machine
      </p>

      <Link href="/app" className="text-teal text-sm underline underline-offset-2 pb-8">
        Open the app →
      </Link>
    </main>
  );
}
```

**`frontend/app/app/page.tsx`** — the search UI:

```tsx
"use client";
import { useState } from "react";
import SearchBox from "@/components/SearchBox";
import DocumentGrid from "@/components/DocumentGrid";
import AnswerBox from "@/components/AnswerBox";
import UploadZone from "@/components/UploadZone";
import { search } from "@/lib/api";

export default function AppPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    setError(null);
    try {
      const data = await search(q);
      setResults(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = !!results?.documents?.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 min-h-screen flex flex-col">
      <SearchBox onSearch={handleSearch} loading={loading} hasResults={hasResults} />

      {error && (
        <p className="text-red-600 text-sm text-center mt-4">{error}</p>
      )}

      {hasResults && (
        <>
          <DocumentGrid documents={results.documents} query={query} />
          {results.answer && <AnswerBox answer={results.answer} />}
        </>
      )}

      <div className="mt-auto pt-12">
        <UploadZone />
      </div>
    </div>
  );
}
```

---

## Step 7 — Single-command dev startup (optional but recommended)

Install `concurrently` so you don't need two terminals:

```bash
# in repo root
npm init -y   # just to get a root package.json
npm install --save-dev concurrently
```

Add to the root `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently -n BACKEND,FRONTEND -c green,blue \"python run.py\" \"cd frontend && npm run dev\""
  }
}
```

Now `npm run dev` from repo root starts both. `python run.py` alone still works for backend-only testing.

---

## Step 8 — Static export option (restores single-command for distribution)

If you want to go back to `python run.py` serving everything without Node.js at runtime (only needs Node.js at build time):

**`frontend/next.config.ts`**:

```ts
const nextConfig = {
  output: "export",        // generates frontend/out/ as a static site
  trailingSlash: true,
};
export default nextConfig;
```

**Build and copy:**

```bash
cd frontend && npm run build
# generates frontend/out/
```

**Serve from FastAPI** (add to `app.py` — this is the only other backend change):

```python
from fastapi.staticfiles import StaticFiles
import os

# Mount AFTER all your API routes so /chat, /upload etc. take priority
if os.path.exists("frontend/out"):
    app.mount("/", StaticFiles(directory="frontend/out", html=True), name="static")
```

Now `python run.py` serves the full app at `localhost:8000` exactly like before, no Node.js needed at runtime. Build step (`npm run build`) only needed when you change the frontend.

**Tradeoff**: static export means no server-side rendering (fine — Holms has no SSR needs) and no Next.js API routes (not using them anyway, backend is FastAPI).

---

## Step 9 — Delete the old vanilla files

Only after you have verified the Next.js app is working end-to-end:

```bash
# from repo root
rm -rf static/   # or whatever directory held index.html, app.html, etc.
```

Do not do this before step 8 works. Keep the old files alive until the new ones are confirmed functional.

---

## Step 10 — Update run.py startup message (one line)

In `run.py`, update the startup print to reflect the new URL:

```python
# Change this line in run.py (if it exists):
print("Holms running at http://localhost:8000")

# To:
if os.path.exists("frontend/out"):
    print("Holms running at http://localhost:8000")
else:
    print("Backend running at http://localhost:8000")
    print("Start the frontend: cd frontend && npm run dev → http://localhost:3000")
```

---

## What is NOT in scope

| Thing | Status |
|---|---|
| `run.py` logic | Unchanged |
| `app.py` routes | Unchanged (except 1-line CORS update in step 3) |
| `ingestion.py` | Unchanged |
| `data/` directory | Unchanged |
| `requirements.txt` | Unchanged |
| SQLite index | Unchanged |
| fastembed / FTS5 / RRF | Unchanged |
| The `/chat` response shape | Unchanged (already updated in update-prompt.md) |

---

## Acceptance check

- [ ] `python run.py` starts the backend cleanly, no errors
- [ ] `cd frontend && npm run dev` starts Next.js on port 3000
- [ ] Navigating to `localhost:3000` shows the landing page with island hero and Install button
- [ ] Navigating to `localhost:3000/app` shows the centered search box (not bottom-anchored)
- [ ] Uploading a file via the UploadZone hits `localhost:8000/upload` and returns success
- [ ] Searching a query returns document cards, not text blobs in chat bubbles
- [ ] Colors on screen match `sand / foam / teal / drift / ink / muted / match` — nothing grey or white-background SaaS
- [ ] `python run.py` still works standalone for backend testing without Node.js running
