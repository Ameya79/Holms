"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
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
    <main className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-emerald-500 selection:text-black">
      {/* Navbar */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between z-20 border-b border-neutral-900">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <span className="font-sans text-xl font-bold tracking-tight text-white">
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
          <Button variant="default" size="sm" asChild>
            <Link href="/app">
              Open App <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Clean Hero */}
      <section className="pt-20 pb-16 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Local-First · Self-Hosted · Single-Tenant
        </div>

        <h1 className="font-sans text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.05]">
          Your documents. <br />
          <span className="text-emerald-400">On your own machine.</span>
        </h1>

        <p className="text-neutral-400 text-base sm:text-lg max-w-xl mb-10 leading-relaxed font-sans">
          A personal document search engine. OCR scanned notices, search by meaning in SQLite, and open original files instantly—with 100% zero API key requirement.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button size="lg" variant="default" onClick={handleInstall} className="px-8 py-6 text-sm font-semibold">
            <Download className="mr-2 h-4 w-4" />
            Install Holms App
          </Button>
          <Button size="lg" variant="outline" asChild className="px-8 py-6 text-sm">
            <Link href="/app">
              Launch Search Interface <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Feature Strip */}
      <div className="border-y border-neutral-900 bg-neutral-950 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-neutral-400 text-xs font-mono">
          <span className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            100% Private & Local
          </span>
          <span className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            No API Key Required
          </span>
          <span className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            Zero Accounts / Subscriptions
          </span>
        </div>
      </div>

      {/* Clean Infographics Component */}
      <Infographics />

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-12 px-6 text-neutral-400 text-xs font-sans">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={24} />
            <span className="font-bold text-white">Holms</span>
            <span className="text-neutral-600">| Local Document Search Engine</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/app" className="hover:text-white transition-colors">
              Search App
            </Link>
            <a
              href="https://github.com/Ameya79/Holms.git"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <FaGithub className="h-3.5 w-3.5" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
