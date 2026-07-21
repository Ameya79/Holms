"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import OceanWaves from "@/components/OceanWaves";
import FeatureSection from "@/components/ui/stack-feature-section";
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
    <main className="min-h-screen flex flex-col bg-sand text-ink selection:bg-match selection:text-ink">
      {/* Navigation Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Holms Logomark"
            width={40}
            height={40}
            className="rounded-lg shadow-sm border border-teal/20 object-cover"
          />
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
      <section className="relative pt-12 pb-24 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Brand Logomark Badge */}
        <div className="mb-6 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal to-drift rounded-2xl blur-sm opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <Image
            src="/logo.png"
            alt="Holms Brand Logo"
            width={120}
            height={120}
            priority
            className="relative rounded-2xl shadow-md border-2 border-teal/30 object-cover bg-foam"
          />
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl text-teal tracking-wide mb-4 max-w-3xl leading-[1.1]">
          Your documents. <br />
          <span className="italic font-light">Your island.</span>
        </h1>

        <p className="text-muted text-lg sm:text-xl max-w-xl mb-10 leading-relaxed">
          Local-first, self-hosted personal document search. OCR scanned notices, search by meaning in SQLite, and verify with your own AI key.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 z-20">
          <Button size="lg" variant="secondary" onClick={handleInstall} className="shadow-md text-base px-8 py-6">
            <Download className="mr-2 h-5 w-5" />
            Install Holms App
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base px-8 py-6">
            <Link href="/app">
              Launch Web Interface <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <p className="text-muted text-xs mt-4">Works natively on macOS, Windows, Linux</p>

        {/* Shore & Ocean Waves Animation */}
        <div className="w-full mt-12">
          <OceanWaves />
        </div>
      </section>

      {/* Value Strip */}
      <div className="bg-foam border-y border-teal/15 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 text-teal font-medium text-sm sm:text-base text-center">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-drift"></span>
            Search what's yours
          </span>
          <span className="text-drift/40 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal"></span>
            Works without an API key
          </span>
          <span className="text-drift/40 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-drift"></span>
            Nothing leaves your machine
          </span>
        </div>
      </div>

      {/* Interactive Stack Feature Section (Stack-Feature Component) */}
      <div className="px-6">
        <FeatureSection />
      </div>

      {/* Sand Section Footer */}
      <footer className="bg-[#D9CDB5] border-t border-teal/20 py-16 px-6 text-teal">
        <div className="max-w-2xl mx-auto text-center">
          <Image
            src="/logo.png"
            alt="Holms Logo"
            width={48}
            height={48}
            className="mx-auto rounded-xl border border-teal/30 mb-4 shadow-sm"
          />
          <h3 className="font-serif text-2xl text-teal mb-3">Holms</h3>
          <p className="text-sm leading-relaxed text-ink/90 mb-6">
            A single-tenant local document search engine. Indexes PDFs, DOCX files, and scanned images locally into SQLite index using fastembed and FTS5 BM25 search.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm font-semibold">
            <Link href="/app" className="text-teal hover:text-drift underline underline-offset-4">
              Open Search App
            </Link>
            <a
              href="https://github.com/Ameya79/Holms.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:text-drift underline underline-offset-4 flex items-center gap-1.5"
            >
              <FaGithub className="h-4 w-4" /> GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
