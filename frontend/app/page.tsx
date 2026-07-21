"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } else {
      window.location.href = "/app";
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-sand text-ink">
      {/* Hero (70vh) */}
      <section className="h-[70vh] min-h-[520px] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden bg-sand">
        {/* SVG Island Pictogram */}
        <div className="mb-6">
          <svg viewBox="0 0 160 120" width="140" height="105">
            <ellipse cx="80" cy="92" rx="58" ry="14" fill="#EDE3D0" stroke="#1F4E4A" strokeWidth="1.5"/>
            <path d="M64 78 L80 62 L96 78 Z" fill="#1F4E4A"/>
            <rect x="74" y="74" width="12" height="18" fill="#8A6D53"/>
            <path d="M110 90 Q106 68 112 52" stroke="#8A6D53" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M112 52 Q95 46 88 56" stroke="#1F4E4A" strokeWidth="2.5" fill="none"/>
            <path d="M112 52 Q125 40 132 50" stroke="#1F4E4A" strokeWidth="2.5" fill="none"/>
            <path d="M112 52 Q118 64 126 62" stroke="#1F4E4A" strokeWidth="2" fill="none"/>
          </svg>
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl text-teal tracking-wide mb-2.5">Holms</h1>
        <p className="text-muted text-lg sm:text-xl italic mb-8">Your documents. Your island.</p>

        {/* Animated Wave Lines */}
        <div className="absolute bottom-6 left-0 w-full h-16 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1200 60" preserveAspectRatio="none">
            <path className="stroke-teal/40 stroke-2 fill-none animate-pulse" d="M0,30 Q300,5 600,30 T1200,30"/>
            <path className="stroke-teal/20 stroke-[1.5] fill-none" d="M0,40 Q300,55 600,40 T1200,40"/>
          </svg>
        </div>
      </section>

      {/* Value Strip */}
      <div className="flex items-center justify-center gap-4 px-5 py-6 bg-foam border-y border-teal/15 text-teal text-sm font-medium text-center flex-wrap">
        <span>Search what's yours</span>
        <span className="text-drift font-bold">·</span>
        <span>Works without an API key</span>
        <span className="text-drift font-bold">·</span>
        <span>Nothing leaves your machine</span>
      </div>

      {/* CTA Section */}
      <section className="flex flex-col items-center justify-center p-12 bg-foam text-center">
        <button
          onClick={handleInstall}
          className="inline-flex items-center gap-2.5 px-9 py-4 bg-drift text-white text-base font-semibold rounded-md hover:bg-[#9a7d63] transition-colors cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Install Holms
        </button>
        <p className="text-muted text-xs mt-3.5">Works on Mac, Windows, Linux</p>
        <p className="text-muted text-[11px] mt-1">v0.1 — self-hosted, open source</p>

        <Link href="/app" className="text-teal text-sm underline underline-offset-4 mt-6 hover:text-drift">
          Open the App →
        </Link>
      </section>

      {/* Sand Section Footer */}
      <footer className="bg-[#D9CDB5] p-12 text-center text-teal">
        <div className="max-w-xl mx-auto">
          <p className="text-sm leading-relaxed text-ink/90 mb-6">
            Holms runs locally on your computer. It extracts, embeds, and indexes your PDFs, DOCX files, and scanned notices into a local SQLite index file. You can search by meaning without any AI API key configured, or connect your key to get concise answers verified against your own documents.
          </p>
          <a
            href="https://github.com/Ameya79/Holms.git"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal font-semibold text-sm underline underline-offset-4 hover:text-drift"
          >
            View Source on GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
