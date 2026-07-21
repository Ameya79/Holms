"use client";

import { FileText, Cpu, Search, CheckCircle2, ShieldCheck, Zap, Lock, Database } from "lucide-react";

export default function Infographics() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-20 my-16 px-6">
      {/* Infographic 1: How it Works (3-Step Pipeline) */}
      <div>
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
            3-Step Local Pipeline
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-3">
            How Holms Works
          </h2>
          <p className="text-neutral-400 text-sm max-w-md mx-auto mt-2">
            Everything runs directly on your hardware. Zero data leaves your machine.
          </p>
        </div>

        {/* 3 Step Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4 text-sm">
                01
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                Drop Documents
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Drag in PDFs, DOCX files, or scanned images (hostel notices, receipts). Text is extracted or OCR'd automatically.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 font-mono text-[11px] text-emerald-400/90 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
              PDF · DOCX · PNG · JPG
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4 text-sm">
                02
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-emerald-400" />
                Local Indexing
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Sentence-aware chunking, Tesseract OCR, and Fastembed vector embedding stored into local SQLite.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 font-mono text-[11px] text-emerald-400/90 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
              SQLite FTS5 + Vector DB
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4 text-sm">
                03
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Search className="h-5 w-5 text-emerald-400" />
                Search & Retrieve
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Search via meaning or keyword. Surfaced as document cards with direct open/download buttons.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-800 font-mono text-[11px] text-emerald-400/90 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
              Doc Cards + Highlight Snippet
            </div>
          </div>
        </div>
      </div>

      {/* Infographic 2: What's Possible Without AI (100% Free & Keyless) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-10">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
            No API Key Mode
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3">
            What's Possible Without Any AI API Key?
          </h2>
          <p className="text-neutral-400 text-sm mt-2">
            Holms is a document search engine first. AI synthesis is optional. You get full functionality out of the box with zero subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">BM25 Exact Keyword Search</h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                SQLite FTS5 ranks documents instantly by exact word matches and highlighted snippets.
              </p>
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Local Neural Vector Search</h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Fastembed runs local BAAI/bge-small-en-v1.5 embeddings on CPU to find documents by natural language meaning.
              </p>
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Tesseract OCR for Scanned Notices</h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Renders image/scanned PDF pages to 300 DPI and extracts text locally—even if text isn't selectable.
              </p>
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Direct Raw File Access</h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Click 'Open File' on any document card to immediately open or download the original file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
