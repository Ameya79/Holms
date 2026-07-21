"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { listDocuments } from "@/lib/api";
import { Plus, Settings, Download } from "lucide-react";
import { FaGithub } from "react-icons/fa";

interface Props {
  onOpenSettings: () => void;
  onOpenUpload: () => void;
}

export default function TopBar({ onOpenSettings, onOpenUpload }: Props) {
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
    <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md shrink-0">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <Logo size={28} />
        <span className="font-sans text-lg font-bold tracking-tight text-white">
          Holms
        </span>
        <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full ml-1">
          {docCount !== null ? `${docCount} docs` : "Offline"}
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 text-white text-xs font-medium rounded-lg hover:bg-emerald-500 transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Upload File
        </button>

        {installPrompt && (
          <button
            onClick={handleInstall}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs font-medium rounded-lg hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Install
          </button>
        )}

        <a
          href="https://github.com/Ameya79/Holms.git"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-8 h-8 border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white rounded-lg transition-colors"
          title="GitHub Source"
        >
          <FaGithub className="h-4 w-4" />
        </a>

        <button
          onClick={onOpenSettings}
          title="Settings"
          className="inline-flex items-center justify-center w-8 h-8 border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
