"use client";

import { FileText, Cpu, Search, CheckCircle2 } from "lucide-react";

export default function Infographics() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-16 my-16 px-6">
      {/* Infographic 1: How it Works (3-Step Pipeline) */}
      <div>
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-drift bg-drift/10 border border-drift/20 px-3 py-1 rounded-full">
            3-Step Local Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-teal mt-3 mb-2">
            How Holms Works
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            Everything runs directly on your hardware. Zero data leaves your machine.
          </p>
        </div>

        {/* 3 Step Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-foam border border-teal/20 rounded-2xl p-6 relative flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-9 h-9 rounded-xl bg-teal/10 border border-teal/20 text-teal flex items-center justify-center font-bold mb-4 text-xs font-mono">
                01
              </div>
              <h3 className="text-lg font-semibold text-teal mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-drift" />
                Drop Documents
              </h3>
              <p className="text-ink/80 text-xs leading-relaxed">
                Drag in PDFs, DOCX files, or scanned images (hostel notices, receipts). Text is extracted or OCR'd automatically.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-teal/15 font-mono text-[11px] text-teal bg-sand/60 p-2.5 rounded-xl border border-teal/10">
              PDF · DOCX · PNG · JPG
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-foam border border-teal/20 rounded-2xl p-6 relative flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-9 h-9 rounded-xl bg-teal/10 border border-teal/20 text-teal flex items-center justify-center font-bold mb-4 text-xs font-mono">
                02
              </div>
              <h3 className="text-lg font-semibold text-teal mb-2 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-drift" />
                Local Indexing
              </h3>
              <p className="text-ink/80 text-xs leading-relaxed">
                Sentence-aware chunking, Tesseract OCR, and Fastembed vector embedding stored into local SQLite.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-teal/15 font-mono text-[11px] text-teal bg-sand/60 p-2.5 rounded-xl border border-teal/10">
              SQLite FTS5 + Vector DB
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-foam border border-teal/20 rounded-2xl p-6 relative flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-9 h-9 rounded-xl bg-teal/10 border border-teal/20 text-teal flex items-center justify-center font-bold mb-4 text-xs font-mono">
                03
              </div>
              <h3 className="text-lg font-semibold text-teal mb-2 flex items-center gap-2">
                <Search className="h-5 w-5 text-drift" />
                Search & Retrieve
              </h3>
              <p className="text-ink/80 text-xs leading-relaxed">
                Search via meaning or keyword. Surfaced as document cards with direct open/download buttons.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-teal/15 font-mono text-[11px] text-teal bg-sand/60 p-2.5 rounded-xl border border-teal/10">
              Doc Cards + Highlight Snippet
            </div>
          </div>
        </div>
      </div>

      {/* Infographic 2: What's Possible Without AI (100% Free & Keyless) */}
      <div className="bg-foam border border-teal/25 rounded-3xl p-8 sm:p-10 shadow-xs">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-drift bg-drift/10 border border-drift/20 px-3 py-1 rounded-full">
            No API Key Mode
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-teal mt-3">
            What's Possible Without Any AI API Key?
          </h2>
          <p className="text-muted text-sm mt-2">
            Holms is a document search engine first. AI synthesis is optional. You get full functionality out of the box with zero subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-sand/60 border border-teal/15 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-teal mb-1">BM25 Exact Keyword Search</h4>
              <p className="text-ink/80 text-xs leading-relaxed">
                SQLite FTS5 ranks documents instantly by exact word matches and highlighted snippets.
              </p>
            </div>
          </div>

          <div className="bg-sand/60 border border-teal/15 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-teal mb-1">Local Neural Vector Search</h4>
              <p className="text-ink/80 text-xs leading-relaxed">
                Fastembed runs local BAAI/bge-small-en-v1.5 embeddings on CPU to find documents by natural language meaning.
              </p>
            </div>
          </div>

          <div className="bg-sand/60 border border-teal/15 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-teal mb-1">Tesseract OCR for Scanned Notices</h4>
              <p className="text-ink/80 text-xs leading-relaxed">
                Renders image/scanned PDF pages to 300 DPI and extracts text locally—even if text isn't selectable.
              </p>
            </div>
          </div>

          <div className="bg-sand/60 border border-teal/15 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-teal mb-1">Direct Raw File Access</h4>
              <p className="text-ink/80 text-xs leading-relaxed">
                Click 'Open Document' on any document card to immediately open or download the original file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
