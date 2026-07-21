"use client";

import { FileText, Search, ShieldCheck, Zap } from "lucide-react";

export default function UseCasesVisual() {
  const useCases = [
    {
      icon: FileText,
      title: "Scanned Notices & PDF OCR",
      description: "Drag in scanned hostel notices, contracts, or tax receipts. PyMuPDF and local Tesseract OCR extract embedded text automatically.",
      badge: "Local OCR",
      codeSnippet: "hostel_notice_march.pdf → OCR (300 DPI) → Indexed",
    },
    {
      icon: Search,
      title: "Fast Keyword & Semantic Search",
      description: "Search by exact keywords or natural language meaning. SQLite FTS5 BM25 and Fastembed embeddings run 100% locally without any API key.",
      badge: "No API Key Needed",
      codeSnippet: "query: 'when is mess closed' → 3 docs matched",
    },
    {
      icon: Zap,
      title: "Original Document Viewer",
      description: "Every result surfaces the actual document as the primary artifact. Click 'Open Document' to view the raw PDF or DOCX file instantly.",
      badge: "Direct File Access",
      codeSnippet: "Open Document → GET /documents/notice.pdf",
    },
    {
      icon: ShieldCheck,
      title: "Verified AI Summary",
      description: "Connect Claude, GPT, Gemini, or Groq with a single LLM call per question. AI answers are grounded strictly in your retrieved excerpts.",
      badge: "Private Grounding",
      codeSnippet: "1 LLM Call → 'The mess is closed on March 15th.'",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto my-20 px-6">
      <div className="text-center mb-12">
        <span className="text-xs font-semibold uppercase tracking-wider text-drift bg-drift/10 px-3 py-1 rounded-full">
          Real-World Capabilities
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif text-teal mt-3 mb-3">
          Built for how you actually search files
        </h2>
        <p className="text-muted text-base max-w-xl mx-auto">
          No cloud sync, no monthly accounts, no chat-bubble clutter. Just your documents, indexed and searchable on your machine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {useCases.map((uc, i) => {
          const IconComp = uc.icon;
          return (
            <div
              key={i}
              className="bg-foam border border-teal/15 rounded-2xl p-6 flex flex-col justify-between hover:border-teal/30 hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-teal/10 text-teal">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-teal bg-sand px-2.5 py-1 rounded-md border border-teal/10">
                    {uc.badge}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-teal mb-2">{uc.title}</h3>
                <p className="text-sm text-ink/80 leading-relaxed mb-6">
                  {uc.description}
                </p>
              </div>

              {/* Visual Mockup Code Box */}
              <div className="bg-sand/60 border border-teal/10 rounded-xl p-3 font-mono text-xs text-teal/90 flex items-center justify-between">
                <span className="truncate">{uc.codeSnippet}</span>
                <span className="text-[10px] text-muted uppercase font-sans font-semibold ml-2">Verified</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
