"use client";

import Image from "next/image";

export default function Infographics() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-16 my-16 px-6">
      {/* How it Works Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-drift">
          Simple 3 Step Process
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif text-teal mt-2 mb-2">
          How Holms Works
        </h2>
        <p className="text-muted text-sm max-w-md mx-auto">
          Everything runs directly on your computer. Your files stay on your machine.
        </p>
      </div>

      {/* 3 Step Process Grid with Custom Step Illustrations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Step 01 */}
        <div className="bg-foam border border-teal/20 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-full h-40 relative mb-4 flex items-center justify-center">
              <Image
                src="/step1_drop.png"
                alt="Hand dropping documents into a tank"
                width={220}
                height={160}
                className="object-contain max-h-36 w-auto"
              />
            </div>
            <div className="text-xs font-mono font-bold text-drift uppercase mb-1">
              Step 01
            </div>
            <h3 className="text-lg font-semibold text-teal mb-2">
              Drop Documents
            </h3>
            <p className="text-ink/80 text-xs leading-relaxed">
              Drag in your PDFs, Word files, or photo notices. Holms handles receipts, contracts, and scanned images automatically.
            </p>
          </div>
          <div className="mt-6 pt-3 border-t border-teal/15 font-mono text-[11px] text-teal">
            PDFs, DOCX files, PNG and JPG images
          </div>
        </div>

        {/* Step 02 */}
        <div className="bg-foam border border-teal/20 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-full h-40 relative mb-4 flex items-center justify-center">
              <Image
                src="/step2_index.png"
                alt="Document transforming into searchable index"
                width={220}
                height={160}
                className="object-contain max-h-36 w-auto"
              />
            </div>
            <div className="text-xs font-mono font-bold text-drift uppercase mb-1">
              Step 02
            </div>
            <h3 className="text-lg font-semibold text-teal mb-2">
              Local Indexing
            </h3>
            <p className="text-ink/80 text-xs leading-relaxed">
              Holms reads text inside your documents and photo notices, storing a private index directly on your laptop.
            </p>
          </div>
          <div className="mt-6 pt-3 border-t border-teal/15 font-mono text-[11px] text-teal">
            100% offline local index
          </div>
        </div>

        {/* Step 03 */}
        <div className="bg-foam border border-teal/20 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-full h-40 relative mb-4 flex items-center justify-center">
              <Image
                src="/step3_search.png"
                alt="Search bar connected to document result cards"
                width={220}
                height={160}
                className="object-contain max-h-36 w-auto"
              />
            </div>
            <div className="text-xs font-mono font-bold text-drift uppercase mb-1">
              Step 03
            </div>
            <h3 className="text-lg font-semibold text-teal mb-2">
              Search & Retrieve
            </h3>
            <p className="text-ink/80 text-xs leading-relaxed">
              Type what you are looking for in simple words. Holms surfaces matched document cards with highlighted evidence snippets.
            </p>
          </div>
          <div className="mt-6 pt-3 border-t border-teal/15 font-mono text-[11px] text-teal">
            Direct file open and download
          </div>
        </div>
      </div>
    </div>
  );
}
