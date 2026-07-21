"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import FeatureSection from "@/components/ui/stack-feature-section";
import UseCasesVisual from "@/components/UseCasesVisual";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { Download, ArrowRight } from "lucide-react";

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
    <main className="min-h-screen flex flex-col bg-sand text-ink selection:bg-match selection:text-ink font-sans">
      {/* Navigation Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <span className="font-serif text-2xl text-teal tracking-tight font-semibold">
            Holms
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild size="sm">
            <a
              href="https://github.com/Ameya79/Holms.git"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub className="mr-1.5 h-3.5 w-3.5" /> Source
            </a>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/app">
              Open App <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 pb-12 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="mb-4">
          <span className="text-xs font-semibold text-teal bg-teal/10 px-3 py-1 rounded-full border border-teal/15">
            Self-Hosted · Local-First · Single-Tenant
          </span>
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl text-teal tracking-tight mb-4 max-w-3xl leading-[1.08]">
          Your documents. <br />
          <span className="italic font-light">Your island.</span>
        </h1>

        <p className="text-muted text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
          Search PDFs, DOCX, and scanned notices locally with zero API key required. Connect Claude, GPT, Gemini, or Groq for grounded AI answers.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 z-20 mb-12">
          <Button size="lg" variant="secondary" onClick={handleInstall} className="shadow-xs text-sm px-7 py-5">
            <Download className="mr-2 h-4 w-4" />
            Install Holms App
          </Button>
          <Button size="lg" variant="outline" asChild className="text-sm px-7 py-5">
            <Link href="/app">
              Launch Search Interface <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Feature Component (Stack Feature Section in Hero) */}
        <div className="w-full max-w-6xl">
          <FeatureSection />
        </div>
      </section>

      {/* Value Strip */}
      <div className="bg-foam border-y border-teal/15 py-5 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 text-teal font-medium text-xs sm:text-sm text-center">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-drift"></span>
            Search what's yours
          </span>
          <span className="text-drift/40 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal"></span>
            Works without an API key
          </span>
          <span className="text-drift/40 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-drift"></span>
            Nothing leaves your machine
          </span>
        </div>
      </div>

      {/* Visual Use Cases Section */}
      <UseCasesVisual />

      {/* Sand Section Footer */}
      <footer className="bg-[#D9CDB5] border-t border-teal/20 py-12 px-6 text-teal">
        <div className="max-w-xl mx-auto text-center">
          <div className="flex justify-center mb-3">
            <Logo size={36} />
          </div>
          <h3 className="font-serif text-2xl text-teal mb-2">Holms</h3>
          <p className="text-xs leading-relaxed text-ink/90 mb-6">
            A single-tenant local document search engine. Indexes PDFs, DOCX files, and scanned images locally into SQLite index using fastembed and FTS5 BM25 search.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs font-semibold">
            <Link href="/app" className="text-teal hover:text-drift underline underline-offset-4">
              Open Search App
            </Link>
            <a
              href="https://github.com/Ameya79/Holms.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:text-drift underline underline-offset-4 flex items-center gap-1.5"
            >
              <FaGithub className="h-3.5 w-3.5" /> GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
