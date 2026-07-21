"use client";
import DocumentCard, { DocResult } from "./DocumentCard";

interface Props {
  documents: DocResult[];
  query: string;
}

export default function DocumentGrid({ documents, query }: Props) {
  if (!documents.length) return null;

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {documents.map((doc) => (
        <DocumentCard key={doc.doc_id} doc={doc} query={query} />
      ))}
    </div>
  );
}
