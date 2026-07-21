"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import SearchBox from "@/components/SearchBox";
import DocumentGrid from "@/components/DocumentGrid";
import AnswerBox from "@/components/AnswerBox";
import UploadZone from "@/components/UploadZone";
import SettingsModal from "@/components/SettingsModal";
import AppDock from "@/components/AppDock";
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
    setStatusMsg("Searching documents...");
    setDocuments([]);
    setAnswer(null);

    try {
      const data = await search(q);
      const docs: DocResult[] = data.documents || [];
      setDocuments(docs);

      setStatusMsg(
        `${docs.length} ${docs.length === 1 ? "document" : "documents"} matched`
      );

      if (data.mode === "answered" && data.answer) {
        setAnswer(data.answer);
      }
    } catch (err: any) {
      setStatusMsg(`Could not reach backend. Is Holms running? (${err.message})`);
    } finally {
      setLoading(false);
    }
  };

  const hasSearched = query.length > 0 || documents.length > 0;

  const triggerUploadClick = () => {
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput) fileInput.click();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-sand text-ink relative font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-transparent shrink-0">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Logo size={28} />
          <h1 className="font-serif text-2xl font-semibold text-teal tracking-tight">
            Holms
          </h1>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            className="inline-flex items-center justify-center w-9 h-9 border border-teal/20 bg-foam text-teal rounded-lg hover:bg-teal hover:text-white transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Search Body */}
      <main className="flex-1 flex flex-col items-center overflow-y-auto px-6 pb-6">
        <SearchBox
          onSearch={handleSearch}
          loading={loading}
          hasResults={hasSearched}
        />

        {hasSearched && (
          <div className="w-full max-w-3xl flex flex-col gap-4 animate-fade-in mb-6">
            {statusMsg && (
              <p className="text-xs text-muted mb-1">{statusMsg}</p>
            )}

            <DocumentGrid documents={documents} query={query} />

            {answer && <AnswerBox answer={answer} />}
          </div>
        )}
      </main>

      {/* Bottom Container: Clean Dock + Upload Zone */}
      <div className="flex flex-col items-center bg-foam border-t border-teal/15 pt-2">
        <AppDock
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenUpload={triggerUploadClick}
        />
        <UploadZone />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
