"use client";

interface Props {
  answer: string;
}

function formatMarkdown(text: string) {
  if (!text) return "";
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/\n/g, "<br/>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export default function AnswerBox({ answer }: Props) {
  if (!answer) return null;

  return (
    <div className="bg-foam border-1.5 border-teal rounded-lg p-5 mt-4 shadow-sm">
      <div className="mb-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-drift text-white">
          AI Answer
        </span>
      </div>
      <div
        className="text-sm leading-relaxed text-ink"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(answer) }}
      />
    </div>
  );
}
