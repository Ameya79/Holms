"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import FeatureSection from "@/components/ui/stack-feature-section";
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
      window.open("https://github.com/Ameya79/Holms/releases/latest", "_blank");
    }
  };


  return (
    <main className="min-h-screen flex flex-col bg-sand text-ink font-sans selection:bg-match selection:text-ink">
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-4 flex items-center justify-between z-20 border-b border-teal/15">
        <div className="flex items-center gap-3">
          <Logo size={36} />
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
      <section className="relative pt-6 pb-6 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
        {/* Hook Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl text-teal tracking-wide mb-3 max-w-3xl leading-[1.08]">
          Stop fishing for <br />
          <span className="italic font-light">lost documents.</span>
        </h1>

        {/* Non-Technical Subtitle without em-dashes */}
        <p className="text-muted text-sm sm:text-base max-w-2xl mb-5 leading-relaxed font-sans">
          We save files and forget where they went. Hostel notices, tax receipts, rental agreements, and medical bills often get buried deep in your Downloads folder. Holms reels them back in instantly by what they mean.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-row items-center gap-3 z-20 mb-6">
          <Button size="default" variant="secondary" onClick={handleInstall} className="shadow-sm text-xs px-6 py-2.5">
            <Download className="mr-2 h-4 w-4" />
            Install Holms Free
          </Button>
          <Button size="default" variant="outline" asChild className="text-xs px-6 py-2.5">
            <Link href="/app">
              Try Search Interface <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Hero Fisherman Artwork (Prominent & Visible Above the Fold) */}
        <div className="w-full max-w-xl relative">
          <Image
            src="/hero_illustration.png"
            alt="Fisherman fishing for lost documents in the sea"
            width={640}
            height={380}
            priority
            className="w-full h-auto object-contain mx-auto transition-transform hover:scale-[1.01] duration-500"
          />
        </div>
      </section>

      {/* Value Strip */}
      <div className="bg-foam border-y border-teal/15 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 text-teal font-medium text-xs sm:text-sm text-center">
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-drift" />
            100% Private on Your Computer
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

      {/* Explanation Spot 1: Glass Tank Artwork & Problem Explanation */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-drift">
            The Sea of Forgotten Files
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-teal mt-2 mb-3">
            Why your computer's standard search fails you
          </h2>
          <p className="text-muted text-sm max-w-xl mx-auto">
            When you save a PDF receipt or photo notice, standard search only checks the filename. Holms indexes the contents inside your personal file tank.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Tank of Floating Documents (Transparent background) */}
          <div className="relative flex justify-center">
            <Image
              src="/explanation_tank.png"
              alt="Glass tank filled with floating documents"
              width={520}
              height={340}
              className="w-full max-w-md h-auto object-contain transition-transform hover:scale-[1.02] duration-500"
            />
          </div>

          {/* Problem Cards */}
          <div className="space-y-5">
            <div className="bg-foam border border-teal/20 rounded-2xl p-5 shadow-xs">
              <h3 className="font-semibold text-teal text-base mb-1">Standard search only looks at filenames</h3>
              <p className="text-muted text-xs leading-relaxed">
                If your hostel notice photo is named <code className="bg-sand px-1.5 py-0.5 rounded text-teal">IMG_4901.jpg</code>, standard search will never find it when you search "mess closed".
              </p>
            </div>

            <div className="bg-foam border border-teal/20 rounded-2xl p-5 shadow-xs">
              <h3 className="font-semibold text-teal text-base mb-1">Holms reads text inside photo notices</h3>
              <p className="text-muted text-xs leading-relaxed">
                Holms extracts text baked inside scanned images and PDF forms automatically so you can search their contents instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explanation Spot 2: Document Transform Artwork & How Holms Indexes Files */}
      <section className="py-16 px-6 max-w-5xl mx-auto border-t border-teal/15">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-drift">
            Smart & Simple Indexing
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-teal mt-2 mb-3">
            How Holms turns your files into searchable answers
          </h2>
          <p className="text-muted text-sm max-w-xl mx-auto">
            Drop in any file and Holms transforms raw text and photo notices into a private search index right on your laptop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Solution Cards */}
          <div className="space-y-5 order-2 md:order-1">
            <div className="bg-foam border border-teal/20 rounded-2xl p-5 shadow-xs">
              <h3 className="font-semibold text-teal text-base mb-1">Search by concepts, not just words</h3>
              <p className="text-muted text-xs leading-relaxed">
                Searching "rent receipt" will match lease PDFs containing "monthly payment terms", even if the exact word "rent" is never mentioned.
              </p>
            </div>

            <div className="bg-foam border border-teal/20 rounded-2xl p-5 shadow-xs">
              <h3 className="font-semibold text-teal text-base mb-1">Open original files with one click</h3>
              <p className="text-muted text-xs leading-relaxed">
                Every search result surfaces the actual document card with a single click button to open or download the original file.
              </p>
            </div>
          </div>

          {/* Document Indexing Transformation Artwork */}
          <div className="relative flex justify-center order-1 md:order-2">
            <Image
              src="/doc_transform.png"
              alt="Document transforming into a structured search index"
              width={480}
              height={320}
              className="w-full max-w-md h-auto object-contain transition-transform hover:scale-[1.02] duration-500"
            />
          </div>
        </div>
      </section>

      {/* 3 Step Process with Custom Step Illustrations */}
      <Infographics />

      {/* Tech Stack Orbit Feature Section */}
      <section className="px-6 max-w-6xl mx-auto">
        <div className="text-center pt-8">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-drift">
            Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-teal mt-1">
            Engineered for Local Performance
          </h2>
        </div>
        <FeatureSection />
      </section>

      {/* Sand Footer */}
      <footer className="bg-[#D9CDB5] border-t border-teal/20 py-12 px-6 text-teal">
        <div className="max-w-xl mx-auto text-center">
          <div className="flex justify-center mb-3">
            <Logo size={44} />
          </div>
          <h3 className="font-serif text-2xl text-teal mb-2">Holms</h3>
          <p className="text-xs leading-relaxed text-ink/90 mb-6">
            A single-tenant personal search assistant. Indexes your files locally on your machine so you can search them instantly by meaning or keyword.
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
