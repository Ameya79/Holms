"use client";
import { useState } from "react";

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
        hasResults ? "mt-2 mb-6" : "mt-[16vh] mb-8"
      }`}
    >
      {!hasResults && (
        <h2 className="font-serif text-3xl sm:text-4xl text-teal tracking-wide mb-6 text-center">
          What do you need?
        </h2>
      )}
      <div className="flex gap-2 w-full max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Search your local documents..."
          disabled={loading}
          className="flex-1 border-[1.5px] border-teal rounded-lg px-4 py-3 text-base
                     bg-foam text-ink placeholder:text-muted
                     focus:outline-none focus:border-drift transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !query.trim()}
          className="bg-drift text-white px-6 py-3 rounded-lg text-sm
                     font-medium hover:bg-[#9a7d63] disabled:opacity-50 transition-all cursor-pointer"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
    </div>
  );
}
