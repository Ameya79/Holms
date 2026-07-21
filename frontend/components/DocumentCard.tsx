"use client";
import { FileText, ExternalLink } from "lucide-react";

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
        return "bg-red-100 text-red-800 border-red-200";
      case "docx":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "png":
      case "jpg":
      case "jpeg":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-teal/10 text-teal border-teal/20";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-foam border border-teal/20 rounded-2xl p-5 flex flex-col justify-between hover:border-teal/40 transition-all shadow-xs">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="h-5 w-5 text-teal shrink-0" />
            <h3 className="font-semibold text-teal text-base truncate" title={doc.filename}>
              {doc.filename}
            </h3>
          </div>
          <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${getBadgeColor(doc.file_type)}`}>
            {doc.file_type}
          </span>
        </div>

        {/* Snippet box */}
        <div className="bg-sand/70 border border-teal/15 rounded-xl p-3 my-3 text-xs text-ink/90 font-sans leading-relaxed">
          <span
            dangerouslySetInnerHTML={{
              __html: doc.top_snippet || "Match found in document content.",
            }}
          />
        </div>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-2 border-t border-teal/15 text-xs text-muted font-mono">
        <span>{formatSize(doc.file_size)}</span>
        <a
          href={`http://127.0.0.1:8000${doc.download_url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal hover:bg-[#153835] text-foam rounded-lg font-sans text-xs font-medium transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open Document
        </a>
      </div>
    </div>
  );
}
