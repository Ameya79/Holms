"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import SearchBox from "@/components/SearchBox";
import DocumentGrid from "@/components/DocumentGrid";
import AnswerBox from "@/components/AnswerBox";
import UploadZone from "@/components/UploadZone";
import SettingsModal from "@/components/SettingsModal";
import { search } from "@/lib/api";
import { DocResult } from "@/components/DocumentCard";

export default function SearchAppPage() {
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState<DocResult[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    setStatusMsg("Searching your local documents...");
    setDocuments([]);
    setAnswer(null);

    try {
      const data: any = await search(q);
      const docs: DocResult[] = data.documents || [];
      setDocuments(docs);

      setStatusMsg(
        docs.length > 0
          ? `${docs.length} ${docs.length === 1 ? "document" : "documents"} matched`
          : "No matching documents found in your local collection."
      );

      if (data.mode === "answered" && data.answer) {
        setAnswer(data.answer);
      }
    } catch (err: any) {

      setStatusMsg(`Search completed. (${err.message})`);
    } finally {
      setLoading(false);
    }
  };

  const triggerUploadClick = () => {
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput) fileInput.click();
  };

  const hasSearched = query.length > 0 || documents.length > 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-sand text-ink font-sans relative select-none">
      {/* Top Bar */}
      <TopBar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUpload={triggerUploadClick}
      />

      {/* Main Search Area (Mobile & Laptop Friendly) */}
      <main className="flex-1 flex flex-col items-center overflow-y-auto px-4 sm:px-6 pb-6 select-text w-full max-w-5xl mx-auto">
        <SearchBox
          onSearch={handleSearch}
          loading={loading}
          hasResults={hasSearched}
        />

        {hasSearched && (
          <div className="w-full max-w-3xl flex flex-col gap-4 animate-fade-in mb-6 mt-4">
            {statusMsg && (
              <p className="text-xs text-muted font-mono mb-1 text-center sm:text-left">{statusMsg}</p>
            )}

            <DocumentGrid documents={documents} query={query} />

            {answer && <AnswerBox answer={answer} />}
          </div>
        )}
      </main>

      {/* Bottom Upload & File Pills Area */}
      <UploadZone />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
