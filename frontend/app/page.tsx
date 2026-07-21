"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import FeatureSection from "@/components/ui/stack-feature-section";
import VectorVisualization from "@/components/VectorVisualization";
import Infographics from "@/components/Infographics";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { Download, ArrowRight, Shield, Zap, Lock } from "lucide-react";

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
    <main className="min-h-screen flex flex-col bg-sand text-ink font-sans selection:bg-match selection:text-ink">
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between z-20 border-b border-teal/15">
        <div className="flex items-center gap-3">
          <Logo size={44} />
          <span className="font-serif text-2xl text-teal tracking-wide font-normal">
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
      <section className="relative pt-14 pb-12 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Large Floating Logo (No Card wrapper per user request) */}
        <div className="mb-6">
          <Logo size={110} />
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl text-teal tracking-wide mb-5 max-w-3xl leading-[1.08]">
          Search your files <br />
          <span className="italic font-light">by what they mean.</span>
        </h1>

        <p className="text-muted text-base sm:text-xl max-w-2xl mb-8 leading-relaxed font-sans">
          A personal, private document search engine that runs 100% on your laptop. Drag in PDFs, contracts, or photo notices and search them instantly—no accounts, no cloud sync, and no AI API key needed.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 z-20 mb-10">
          <Button size="lg" variant="secondary" onClick={handleInstall} className="shadow-sm text-sm px-8 py-5">
            <Download className="mr-2 h-4 w-4" />
            Install Desktop App
          </Button>
          <Button size="lg" variant="outline" asChild className="text-sm px-8 py-5">
            <Link href="/app">
              Try Web Interface <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Orbiting Tech Stack Component in Hero */}
        <div className="w-full max-w-6xl">
          <FeatureSection />
        </div>
      </section>

      {/* Plain-English Value Strip */}
      <div className="bg-foam border-y border-teal/15 py-5 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-teal font-medium text-xs sm:text-sm text-center">
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-drift" />
            100% Private on Your Machine
          </span>
          <span className="text-drift/40 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-teal" />
            Works Free Without Any AI Key
          </span>
          <span className="text-drift/40 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-drift" />
            Reads Scanned Notice Photos
          </span>
        </div>
      </div>

      {/* Vector Visualization Component (Shows how files are vectorized without AI) */}
      <div className="max-w-6xl mx-auto w-full px-6">
        <VectorVisualization />
      </div>

      {/* Non-Technical Infographics & How it Works */}
      <Infographics />

      {/* Sand Footer */}
      <footer className="bg-[#D9CDB5] border-t border-teal/20 py-12 px-6 text-teal">
        <div className="max-w-xl mx-auto text-center">
          <div className="flex justify-center mb-3">
            <Logo size={48} />
          </div>
          <h3 className="font-serif text-2xl text-teal mb-2">Holms</h3>
          <p className="text-xs leading-relaxed text-ink/90 mb-6">
            A single-tenant personal search assistant. Indexes your files locally into SQLite so you can search them instantly by concept or keyword.
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
