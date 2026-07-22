"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import SearchBox from "@/components/SearchBox";
import DocumentGrid from "@/components/DocumentGrid";
import AnswerBox from "@/components/AnswerBox";
import UploadZone from "@/components/UploadZone";
import SettingsModal from "@/components/SettingsModal";
import { search, checkBackend } from "@/lib/api";
import { DocResult } from "@/components/DocumentCard";

export default function SearchAppPage() {
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState<DocResult[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    async function verifyBackend() {
      const isOk = await checkBackend();
      setBackendConnected(isOk);
    }
    verifyBackend();
  }, []);

  if (backendConnected === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sand">
        <p className="text-muted text-sm">Connecting…</p>
      </div>
    );
  }

  if (backendConnected === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sand gap-4 text-center px-6">
        <span className="text-5xl">🏝</span>
        <h2 className="font-serif text-2xl text-teal">Holms isn't running on this machine.</h2>
        <p className="text-muted text-sm max-w-xs">
          The app needs to be running locally to access your documents.
        </p>
        <a
          href="https://github.com/Ameya79/Holms/releases/latest"
          className="bg-drift text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download the app
        </a>
        <p className="text-muted text-xs">Already installed? Launch it from your system tray.</p>
      </div>
    );
  }

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

  const triggerUploadClick = () => {
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput) fileInput.click();
  };

  const hasSearched = query.length > 0 || documents.length > 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-sand text-ink font-sans relative select-none">
      {/* Clean Unified Top Bar */}
      <TopBar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUpload={triggerUploadClick}
      />

      {/* Main Search Area */}
      <main className="flex-1 flex flex-col items-center overflow-y-auto px-6 pb-6 select-text">
        <SearchBox
          onSearch={handleSearch}
          loading={loading}
          hasResults={hasSearched}
        />

        {hasSearched && (
          <div className="w-full max-w-3xl flex flex-col gap-4 animate-fade-in mb-6">
            {statusMsg && (
              <p className="text-xs text-muted font-mono mb-1">{statusMsg}</p>
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
