"use client";
import { useEffect, useState, useRef } from "react";
import { listDocuments, uploadFile, deleteDocument } from "@/lib/api";
import { UploadCloud, FileText, X } from "lucide-react";

interface DocItem {
  id: string;
  filename: string;
  uploaded_at: string;
}

interface Props {
  onDocsChanged?: () => void;
}

export default function UploadZone({ onDocsChanged }: Props) {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    try {
      const data = await listDocuments();
      setDocs(data);
      if (onDocsChanged) onDocsChanged();
    } catch {
      // Backend offline or loading
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFiles = async (files: FileList | File[]) => {
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      try {
        await uploadFile(files[i]);
      } catch (err: any) {
        alert(`Failed to upload ${files[i].name}: ${err.message}`);
      }
    }
    setUploading(false);
    fetchDocs();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name} from Holms index?`)) return;
    try {
      await deleteDocument(id);
      fetchDocs();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 p-4 bg-foam border-t border-teal/15 w-full shrink-0">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        className={`flex items-center justify-center gap-2.5 p-3.5 border border-dashed border-teal/25 rounded-xl
                   bg-sand/40 text-teal text-xs font-medium cursor-pointer hover:border-teal hover:bg-sand/70 transition-all ${
                     uploading ? "opacity-50 pointer-events-none" : ""
                   }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.png,.jpg,.jpeg,.txt,.md"
          hidden
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <UploadCloud className="h-4 w-4 text-drift" />
        <span>{uploading ? "Uploading & Indexing..." : "Upload files / Drop documents here"}</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {docs.length === 0 ? (
          <span className="text-xs text-muted">No documents indexed yet.</span>
        ) : (
          docs.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-sand border border-teal/15 text-teal text-xs font-mono rounded-lg whitespace-nowrap shadow-xs"
            >
              <FileText className="h-3 w-3 text-teal/80" />
              <span className="truncate max-w-[180px]">{d.filename}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(d.id, d.filename);
                }}
                className="text-muted hover:text-red-600 ml-1 cursor-pointer"
                title="Delete from index"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
