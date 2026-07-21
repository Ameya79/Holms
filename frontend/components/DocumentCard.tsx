"use client";
import { FileText, Download, ExternalLink } from "lucide-react";

export interface DocResult {
  doc_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  download_url: string;
  top_snippet: string;
  matched_chunks: Array<{ chunk_id: number; snippet: string; score: number }>;
}

export default function DocumentCard({ doc, query }: { doc: DocResult; query: string }) {
  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "bg-red-950/80 text-red-300 border-red-900/50";
      case "docx":
        return "bg-blue-950/80 text-blue-300 border-blue-900/50";
      case "png":
      case "jpg":
      case "jpeg":
        return "bg-amber-950/80 text-amber-300 border-amber-900/50";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-all shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="h-5 w-5 text-emerald-400 shrink-0" />
            <h3 className="font-semibold text-white text-base truncate" title={doc.filename}>
              {doc.filename}
            </h3>
          </div>
          <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${getBadgeColor(doc.file_type)}`}>
            {doc.file_type}
          </span>
        </div>

        {/* Snippet box */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-3 my-3 text-xs text-neutral-300 font-sans leading-relaxed">
          <span
            dangerouslySetInnerHTML={{
              __html: doc.top_snippet || "Match found in document content.",
            }}
          />
        </div>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-xs text-neutral-400 font-mono">
        <span>{formatSize(doc.file_size)}</span>
        <a
          href={`http://127.0.0.1:8000${doc.download_url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md font-sans text-xs font-medium transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5 text-emerald-400" /> Open File
        </a>
      </div>
    </div>
  );
}
