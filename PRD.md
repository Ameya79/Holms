# PRD — Local Document RAG Assistant (v1)

## 1. Problem
The user has documents (PDFs, DOCX, scanned notices — some with text embedded as images, not selectable text) scattered across a local machine. Finding a specific one, or a fact inside one, currently means manually searching folders. There is no way to just "ask" your own document collection a question in natural language.

## 2. Product shape for v1 — read this before anything else
This is a **self-hosted, single-tenant-per-install** tool, not a multi-tenant SaaS.

- Each person who uses it **runs their own instance** on their own machine.
- Their documents and index never leave their machine.
- Because every install belongs to exactly one person, **there is no login screen, no signup, and no shared server** — isolation between "users" is just the fact that they're running separate copies of the app, not a multi-account system on one backend.
- "Many people should be able to use it, each isolated" is satisfied by distribution (each person installs it), not by an auth layer.

This resolves what would otherwise be a contradiction: zero login friction *and* per-person isolation *and* fully local storage all hold at once under this model. If a future version needs one shared server for many simultaneous users, that is a different product (multi-tenant SaaS) and needs its own PRD — do not retrofit auth into this one.

## 3. Target user (v1)
A single technical-enough person (can run one install command, can paste an API key into a settings screen) who wants their own local documents searchable via chat.

## 4. Core user flows
1. **First run** — user starts the app, is dropped straight into a settings screen (not a login screen) to paste an API key for their AI provider of choice.
2. **Upload** — drag a file (PDF, DOCX, scanned image-based PDF, PNG/JPG of a notice) into the app. It gets indexed automatically, no separate "process" button needed.
3. **Ask** — type a question in a chat box ("what did I do about the ThinkAct job", "what does my hostel notice from March say"). Get an answer with the source document named.
4. **Browse** — see a plain list of everything indexed, with the option to open the original file.

## 5. Functional requirements
- **Ingestion**: accept PDF, DOCX, PNG, JPG.
- **OCR**: any page/image without extractable native text must be run through OCR before chunking — see TRD for the exact pipeline. This must happen silently; the user never manually flags "this one needs OCR."
- **Retrieval**: answer natural-language queries against the indexed documents, including vague/broad queries ("what did I do last week"), not just exact-keyword queries.
- **Multi-provider LLM support**: user can configure and switch between Claude, Gemini, GPT, and Groq (and other free-tier providers) using their own API key for each — see TRD for the provider abstraction. Bring-your-own-key, no key of the app's own.
- **Speed**: retrieval (finding the right chunk) must not depend on repeated LLM calls. Only one LLM call per user question, at the end, for verification + answer generation — see TRD §4 for why.
- **Source attribution**: every answer names which document(s) it came from.

## 6. Non-functional requirements
- **Privacy**: no document content leaves the user's machine except the final small set of retrieved chunks sent to the LLM API for the answer step.
- **Zero setup friction**: no accounts, no email verification, no OAuth consent screens for v1.
- **Fast**: sub-second retrieval for the fetch stage; total answer latency dominated only by the single LLM API call, not by the app's own logic.
- **Portable**: user can move their whole data folder to a new machine and pick up exactly where they left off.

## 7. Explicit non-goals for v1
- No multi-tenant shared server.
- No OAuth / Google login.
- No cloud storage (S3, Supabase, etc.) for documents or the index.
- No agentic multi-step tool-calling search loop — retrieval is deterministic and fast, not an LLM planning its own search strategy.
- No billing/pricing (tracked separately, out of scope until the product itself is validated).

## 8. Branding & landing page (new)

**Name**: Holms.

**Visual concept**: a small, calm island — a single hut on it — surrounded by sea. This is the whole metaphor for the product: your documents are the island, self-contained and yours alone, and Holms is the quiet hut that watches over them. Clean, minimal, not busy. Sea waves and sand are the two textural motifs to use (as a hero visual/animation and as a background/section-divider treatment respectively) — not decoration bolted on, they should carry the "self-contained, calm, yours" feeling the product itself has (a local-first tool with no server watching over your files).

**Landing page requirements**:
- Must feel distinct, not like a generic SaaS template — this is one visual idea (island + hut + waves + sand) executed with restraint, not several unrelated design trends stacked together.
- One clear CTA: a button to install/download the app as a PWA (see TRD §9 for what this button actually triggers technically).
- No login-wall anywhere on the page — the whole pitch is "install it, it's yours."

## 9. No-API-key mode (new)

The app must be useful **before** anyone configures an LLM key, not just degrade gracefully — this is a hard requirement, not a fallback.

- Ingestion (upload, OCR, chunking, embedding, indexing) never requires an API key — all of it already runs locally per TRD §3–4.
- Retrieval (BM25 + embedding hybrid search) never requires an API key — also already fully local.
- Without a key configured, a query returns the **ranked source chunks directly** (with the matching snippet highlighted and the source file named) instead of a generated natural-language answer.
- This must already beat plain OS file search / Ctrl-F, because it's semantic (finds "what did I do last week" style queries) and searches *inside* scanned/image documents via OCR — neither of which a regular file explorer can do, with zero AI API cost.
- Adding an API key is purely additive: it turns the same ranked chunks into a written answer (TRD §4's verification step). It never gates whether search works at all.

## 10. Success criteria for v1
- A scanned image-based notice can be uploaded and correctly answers a question about its content.
- A vague query ("what have I been doing on Project X") returns the right documents, not just documents matching literal keywords.
- Time from "ask a question" to "see an answer" feels instant for retrieval, and is bottlenecked only by the LLM API's own response time.
- User can switch their configured AI provider without touching any code.
