"use client";
import { useState } from "react";
import { Search } from "lucide-react";

interface Props {
  onSearch: (q: string) => void;
  loading: boolean;
  hasResults: boolean;
}

export default function SearchBox({ onSearch, loading, hasResults }: Props) {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (query.trim() && !loading) {
      onSearch(query.trim());
    }
  };

  return (
    <div
      className={`flex flex-col items-center w-full transition-all duration-300 ${
        hasResults ? "mt-4 mb-6" : "mt-[18vh] mb-8"
      }`}
    >
      {!hasResults && (
        <h2 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6 text-center">
          What do you need?
        </h2>
      )}
      <div className="flex gap-2 w-full max-w-xl">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Search your local documents..."
            disabled={loading}
            className="w-full border border-neutral-800 rounded-xl px-4 py-3.5 pl-11 text-base
                       bg-neutral-900 text-white placeholder:text-neutral-500
                       focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
          />
          <Search className="absolute left-3.5 top-4 h-5 w-5 text-neutral-500 pointer-events-none" />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !query.trim()}
          className="bg-emerald-600 text-white px-6 py-3.5 rounded-xl text-sm
                     font-medium hover:bg-emerald-500 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
    </div>
  );
}
