"use client";
import { Sparkles } from "lucide-react";

export default function AnswerBox({ answer }: { answer: string }) {
  return (
    <div className="bg-neutral-900 border border-emerald-500/30 rounded-xl p-5 mt-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-emerald-400" />
        <h3 className="font-semibold text-emerald-400 text-sm tracking-tight">
          Grounded AI Answer
        </h3>
      </div>
      <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
        {answer}
      </p>
    </div>
  );
}
