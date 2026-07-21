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
    <header className="flex items-center justify-between px-6 py-4 border-b border-teal/15 bg-sand/90 backdrop-blur-md shrink-0">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <Logo size={32} />
        <span className="font-serif text-xl font-bold tracking-tight text-teal">
          Holms
        </span>
        <span className="text-[11px] font-mono text-drift bg-foam border border-teal/15 px-2 py-0.5 rounded-full ml-1 font-medium">
          {docCount !== null ? `${docCount} docs` : "Offline"}
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal text-foam text-xs font-semibold rounded-xl hover:bg-[#153835] transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Upload File
        </button>

        {installPrompt && (
          <button
            onClick={handleInstall}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foam border border-teal/20 text-teal text-xs font-medium rounded-xl hover:bg-teal/10 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Install
          </button>
        )}

        <a
          href="https://github.com/Ameya79/Holms.git"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-8 h-8 border border-teal/20 bg-foam text-teal hover:bg-teal/10 rounded-xl transition-colors"
          title="GitHub Source"
        >
          <FaGithub className="h-4 w-4" />
        </a>

        <button
          onClick={onOpenSettings}
          title="Settings"
          className="inline-flex items-center justify-center w-8 h-8 border border-teal/20 bg-foam text-teal hover:bg-teal/10 rounded-xl transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
