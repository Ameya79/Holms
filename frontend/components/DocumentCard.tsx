"use client";
import { documentUrl } from "@/lib/api";

interface Chunk {
  text: string;
  score: number;
}

export interface DocResult {
  doc_id: string;
  filename: string;
  file_type: string;
  file_size?: string;
  download_url: string;
  top_snippet: string;
  matched_chunks?: Chunk[];
}

interface Props {
  doc: DocResult;
  query: string;
}

const TYPE_ACCENT: Record<string, string> = {
  PDF: "border-l-teal",
  DOCX: "border-l-drift",
  IMG: "border-l-sand",
  TXT: "border-l-teal",
};

function formatSnippet(text: string) {
  if (!text) return "";
  // Convert **match** markers from backend highlight() to <mark class="bg-match px-0.5 rounded-xs font-semibold">
  return text.replace(/\*\*(.+?)\*\*/g, '<mark class="bg-match px-1 py-0.5 rounded-xs font-semibold">$1</mark>');
}

export default function DocumentCard({ doc, query }: Props) {
  const accent = TYPE_ACCENT[doc.file_type] ?? "border-l-teal";
  const snippet = formatSnippet(doc.top_snippet);
  const rawUrl = documentUrl(doc.filename);

  const handleCopyPath = () => {
    const path = `data/documents/${doc.filename}`;
    navigator.clipboard.writeText(path);
    alert(`Copied path: ${path}`);
  };

  return (
    <div
      className={`bg-foam border border-teal/20 border-l-[5px] ${accent} rounded-lg p-5 flex flex-col gap-3 shadow-xs hover:shadow-md transition-all`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-teal text-base truncate">{doc.filename}</span>
          <span className="text-[11px] font-semibold tracking-wider text-teal bg-teal/10 rounded px-2 py-0.5 shrink-0">
            {doc.file_type}
          </span>
        </div>
        {doc.file_size && (
          <span className="text-xs text-muted shrink-0">{doc.file_size}</span>
        )}
      </div>

      <p
        className="text-sm text-ink/90 leading-relaxed bg-white/60 p-3 rounded-md border border-teal/10"
        dangerouslySetInnerHTML={{ __html: snippet }}
      />

      <div className="flex items-center gap-2 mt-1">
        <a
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs bg-teal text-white px-3.5 py-1.5 rounded-md font-medium hover:bg-[#153835] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Open Document
        </a>
        <button
          onClick={handleCopyPath}
          className="inline-flex items-center gap-1.5 text-xs border border-teal/30 text-teal px-3.5 py-1.5 rounded-md font-medium hover:bg-teal/5 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          Copy Path
        </button>
      </div>
    </div>
  );
}
