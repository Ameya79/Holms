"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { Download, ArrowRight, ShieldCheck, Search, FileText, CheckCircle2, Lock } from "lucide-react";

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
          <Logo size={40} />
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
      <section className="relative pt-12 pb-16 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
        <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-foam border border-teal/20 text-teal text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-drift"></span>
          Your Personal File Retriever
        </div>

        {/* Relatable Hook Headline */}
        <h1 className="font-serif text-5xl sm:text-7xl text-teal tracking-wide mb-6 max-w-3xl leading-[1.08]">
          Stop fishing for <br />
          <span className="italic font-light">lost documents.</span>
        </h1>

        {/* Non-Technical Relatable Copy */}
        <p className="text-muted text-base sm:text-xl max-w-2xl mb-8 leading-relaxed font-sans">
          We save files and forget where they went. Hostel notices, tax receipts, rental agreements, medical bills—buried deep in Downloads. Holms reels them back in instantly by what they mean.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 z-20 mb-12">
          <Button size="lg" variant="secondary" onClick={handleInstall} className="shadow-sm text-sm px-8 py-5">
            <Download className="mr-2 h-4 w-4" />
            Install Holms Free
          </Button>
          <Button size="lg" variant="outline" asChild className="text-sm px-8 py-5">
            <Link href="/app">
              Try Search Interface <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Fisherman Hero Artwork (Seamless Transparent Background) */}
        <div className="w-full max-w-2xl relative my-4">
          <Image
            src="/hero_illustration.png"
            alt="Fisherman fishing for lost documents in the sea"
            width={750}
            height={480}
            priority
            className="w-full h-auto object-contain mx-auto transition-transform hover:scale-[1.02] duration-500"
          />
        </div>
      </section>

      {/* Creative Story Section 1: The Problem & Solution */}
      <section className="bg-foam border-y border-teal/15 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-drift">
              The Everyday Struggle
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-teal mt-2">
              Why your computer's built-in search fails you
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="bg-sand/60 border border-teal/15 rounded-2xl p-6 relative">
              <div className="text-red-700 text-xs font-mono font-semibold uppercase mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                Standard File Search
              </div>
              <h3 className="font-semibold text-teal text-lg mb-2">Searches filenames, misses content</h3>
              <p className="text-muted text-xs leading-relaxed mb-4">
                You saved a photo of a hostel notice named <code className="bg-sand px-1.5 py-0.5 rounded text-teal">IMG_4901.jpg</code>. Standard search will never find it when you search <span className="italic">"mess closed"</span> because it can't read text baked into images.
              </p>
              <div className="bg-sand p-3 rounded-xl border border-teal/10 text-xs text-muted font-mono">
                🔍 Search: "mess closed" → <span className="text-red-700">0 results found</span>
              </div>
            </div>

            {/* The Holms Way */}
            <div className="bg-teal/10 border border-teal/30 rounded-2xl p-6 relative">
              <div className="text-teal text-xs font-mono font-semibold uppercase mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal" />
                With Holms
              </div>
              <h3 className="font-semibold text-teal text-lg mb-2">Reads what's inside & understands meaning</h3>
              <p className="text-teal/90 text-xs leading-relaxed mb-4">
                Holms reads text inside PDFs, DOCX, and photo notices automatically. Search <span className="italic">"hostel closure"</span> and Holms brings up the exact image with the relevant answer highlighted.
              </p>
              <div className="bg-foam p-3 rounded-xl border border-teal/20 text-xs text-teal font-mono">
                🔍 Search: "hostel closure" → <span className="font-semibold text-teal">IMG_4901.jpg matched!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Story Section 2: What You Can Do Without AI */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-drift">
            100% Free & Keyless
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-teal mt-2 mb-3">
            Everything works without any AI subscription
          </h2>
          <p className="text-muted text-sm max-w-lg mx-auto">
            Holms is a personal search engine first. You don't need any API key, monthly subscription, or internet connection to search your files.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-foam border border-teal/20 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="p-2.5 rounded-xl bg-teal/10 text-teal w-fit mb-4">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-teal text-base mb-2">Smart Meaning Search</h3>
              <p className="text-muted text-xs leading-relaxed">
                Find files by concept. Searching "rent receipt" matches documents containing "monthly lease payment".
              </p>
            </div>
          </div>

          <div className="bg-foam border border-teal/20 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="p-2.5 rounded-xl bg-teal/10 text-teal w-fit mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-teal text-base mb-2">Reads Scanned Photos</h3>
              <p className="text-muted text-xs leading-relaxed">
                Automatically extracts un-selectable text from photo notices, receipts, and scanned PDF forms.
              </p>
            </div>
          </div>

          <div className="bg-foam border border-teal/20 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="p-2.5 rounded-xl bg-teal/10 text-teal w-fit mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-teal text-base mb-2">100% Private & Local</h3>
              <p className="text-muted text-xs leading-relaxed">
                Your documents never leave your computer. Nothing is uploaded to third-party servers.
              </p>
            </div>
          </div>
        </div>
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
