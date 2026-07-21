"use client";

import { useState } from "react";
import { Search, Sparkles, FileText, CheckCircle2 } from "lucide-react";

interface VectorPoint {
  id: string;
  name: string;
  category: "Notices" | "Contracts" | "Travel";
  x: number; // percentage
  y: number; // percentage
  snippet: string;
}

export default function VectorVisualization() {
  const [selectedPoint, setSelectedPoint] = useState<VectorPoint | null>({
    id: "1",
    name: "Mess Timings Notice.pdf",
    category: "Notices",
    x: 68,
    y: 35,
    snippet: "The hostel mess will remain closed on Sunday evening for maintenance.",
  });

  const points: VectorPoint[] = [
    {
      id: "1",
      name: "Mess Timings Notice.pdf",
      category: "Notices",
      x: 68,
      y: 35,
      snippet: "The hostel mess will remain closed on Sunday evening for maintenance.",
    },
    {
      id: "2",
      name: "Hostel Fee Receipt.png",
      category: "Notices",
      x: 75,
      y: 45,
      snippet: "Receipt #4091 for March hostel mess and maintenance fee.",
    },
    {
      id: "3",
      name: "Employment Contract.pdf",
      category: "Contracts",
      x: 25,
      y: 70,
      snippet: "Agreement between Employee and Company regarding confidential terms.",
    },
    {
      id: "4",
      name: "Resume 2026.docx",
      category: "Contracts",
      x: 32,
      y: 80,
      snippet: "Software Engineer with 4 years experience in Python and React.",
    },
    {
      id: "5",
      name: "Flight Tickets July.pdf",
      category: "Travel",
      x: 30,
      y: 25,
      snippet: "Boarding pass for Flight AI-502 departing at 08:30 AM.",
    },
  ];

  // Query vector position
  const queryPos = { x: 62, y: 30 };

  return (
    <div className="bg-foam border border-teal/20 rounded-3xl p-6 sm:p-8 shadow-xs my-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-teal/15">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-drift bg-drift/10 border border-drift/20 px-3 py-1 rounded-full inline-block mb-2">
            100% Offline Vector Search
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif text-teal">
            How Your Files Are Vectorized
          </h3>
          <p className="text-muted text-xs sm:text-sm mt-1 max-w-xl">
            When you add a file, Holms converts its meaning into a 3D coordinate (vector). When you search, it finds the closest files by concept—even without matching exact words.
          </p>
        </div>
        <div className="bg-sand/80 border border-teal/15 px-3.5 py-2 rounded-xl text-xs text-teal font-mono shrink-0">
          Embedding Model: <span className="font-semibold">bge-small-en (CPU)</span>
        </div>
      </div>

      {/* Vector Space Map & Detail Card Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interactive 2D Vector Canvas */}
        <div className="md:col-span-2 relative bg-sand/60 border border-teal/20 rounded-2xl h-80 overflow-hidden p-4">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F4E4A10_1px,transparent_1px),linear-gradient(to_bottom,#1F4E4A10_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Cluster Label Badges */}
          <span className="absolute top-3 left-4 text-[10px] font-mono text-teal/60 font-semibold uppercase">
            Travel & Tickets
          </span>
          <span className="absolute top-3 right-4 text-[10px] font-mono text-teal/60 font-semibold uppercase">
            Notices & Receipts
          </span>
          <span className="absolute bottom-3 left-4 text-[10px] font-mono text-teal/60 font-semibold uppercase">
            Work & Contracts
          </span>

          {/* Vector connection line from Query to closest match */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={`${queryPos.x}%`}
              y1={`${queryPos.y}%`}
              x2="68%"
              y2="35%"
              stroke="#1F4E4A"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="animate-pulse"
            />
          </svg>

          {/* Query Node */}
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-teal text-foam px-3 py-1.5 rounded-full text-xs font-medium shadow-md border border-sand"
            style={{ left: `${queryPos.x}%`, top: `${queryPos.y}%` }}
          >
            <Search className="h-3.5 w-3.5 text-match animate-bounce" />
            <span>"when is mess closed?"</span>
          </div>

          {/* Document Vector Points */}
          {points.map((pt) => {
            const isSelected = selectedPoint?.id === pt.id;
            return (
              <button
                key={pt.id}
                onClick={() => setSelectedPoint(pt)}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 group flex items-center gap-1.5 p-1.5 rounded-full transition-all cursor-pointer ${
                  isSelected
                    ? "bg-drift text-white scale-110 ring-4 ring-drift/20"
                    : "bg-foam text-teal hover:scale-105 border border-teal/30"
                }`}
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                title={pt.name}
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium px-1 max-w-[100px] truncate hidden sm:inline">
                  {pt.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Point Explanation Card */}
        <div className="bg-foam border border-teal/20 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-teal" />
              <span className="text-xs font-mono font-semibold text-teal uppercase">
                Vector Match Evidence
              </span>
            </div>

            {selectedPoint ? (
              <div>
                <h4 className="font-semibold text-teal text-base mb-1">
                  {selectedPoint.name}
                </h4>
                <span className="inline-block text-[10px] font-mono text-drift bg-drift/10 px-2 py-0.5 rounded border border-drift/20 mb-3">
                  Similarity Score: 0.92 (High Match)
                </span>
                <p className="text-xs text-ink/80 bg-sand/60 p-3 rounded-xl border border-teal/15 leading-relaxed font-sans">
                  "{selectedPoint.snippet}"
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted">Click any vector point on the map to see its content snippet.</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-teal/15 text-[11px] text-muted flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-teal" />
            <span>Runs 100% locally in SQLite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
