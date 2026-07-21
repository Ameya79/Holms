"use client";
import { Sparkles } from "lucide-react";

export default function AnswerBox({ answer }: { answer: string }) {
  return (
    <div className="bg-foam border border-teal/30 rounded-2xl p-5 mt-4 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-teal" />
        <h3 className="font-semibold text-teal text-sm tracking-tight">
          Grounded AI Answer
        </h3>
      </div>
      <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap font-sans">
        {answer}
      </p>
    </div>
  );
}
