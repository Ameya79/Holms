"use client";
import { useEffect, useState, useRef } from "react";
import { listDocuments, uploadFile, deleteDocument } from "@/lib/api";

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
    <div className="flex flex-col gap-2.5 p-4 bg-foam border-t border-teal/15 w-full">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        className={`flex items-center justify-center gap-2 p-3 border-1.5 border-dashed border-teal/30 rounded-md
                   bg-foam text-teal text-xs font-medium cursor-pointer hover:bg-teal/5 hover:border-teal transition-all ${
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>{uploading ? "Uploading & Indexing..." : "Upload files / Drop documents here"}</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {docs.length === 0 ? (
          <span className="text-xs text-muted">No documents uploaded yet.</span>
        ) : (
          docs.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-sand text-teal text-xs font-medium rounded-full whitespace-nowrap"
            >
              📄 {d.filename}
              <button
                onClick={() => handleDelete(d.id, d.filename)}
                className="text-muted hover:text-red-600 text-sm leading-none ml-0.5 cursor-pointer"
                title="Delete"
              >
                &times;
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
