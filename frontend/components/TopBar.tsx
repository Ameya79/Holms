"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listDocuments } from "@/lib/api";

interface Props {
  onOpenSettings: () => void;
}

export default function TopBar({ onOpenSettings }: Props) {
  const [docCount, setDocCount] = useState<number | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    listDocuments()
      .then((docs) => setDocCount(docs.length))
      .catch(() => setDocCount(null));

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-transparent shrink-0">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <svg className="brand-logo" viewBox="0 0 40 40" width="28" height="28">
          <ellipse cx="20" cy="34" rx="18" ry="4" fill="#EDE3D0" />
          <path d="M12 28 L20 18 L28 28 Z" fill="#1F4E4A" />
          <rect x="18" y="22" width="4" height="6" fill="#8A6D53" />
        </svg>
        <h1 className="font-serif text-2xl font-normal text-teal tracking-wide">Holms</h1>
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted bg-teal/5 px-2.5 py-1 rounded-full font-medium">
          {docCount !== null ? `${docCount} indexed docs` : "Offline"}
        </span>

        {installPrompt && (
          <button
            onClick={handleInstall}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-teal text-teal text-xs font-medium rounded-md hover:bg-teal hover:text-white transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Install App
          </button>
        )}

        <button
          onClick={onOpenSettings}
          title="Settings"
          className="inline-flex items-center justify-center w-9 h-9 border border-teal/20 bg-foam text-teal rounded-md hover:bg-teal hover:text-white transition-colors cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
