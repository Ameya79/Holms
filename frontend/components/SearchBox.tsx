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
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-teal mb-6 text-center tracking-wide">
          What do you need?
        </h2>
      )}
      <div className="flex gap-2.5 w-full max-w-xl">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Search your local documents..."
            disabled={loading}
            className="w-full border border-teal/25 rounded-2xl px-4 py-3.5 pl-11 text-base
                       bg-foam text-ink placeholder:text-muted/70
                       focus:outline-none focus:border-teal transition-colors shadow-xs"
          />
          <Search className="absolute left-3.5 top-4 h-5 w-5 text-muted pointer-events-none" />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !query.trim()}
          className="bg-drift text-white px-6 py-3.5 rounded-2xl text-sm
                     font-medium hover:bg-[#725740] disabled:opacity-40 transition-all cursor-pointer shadow-xs"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
    </div>
  );
}
