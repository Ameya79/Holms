"use client";

export default function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg bg-teal text-foam shrink-0 ${className}`}
      style={{ width: size, height: size, padding: size * 0.2 }}
    >
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Ultra-minimal house/hut icon */}
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 9.5V19a1 1 0 001 1h12a1 1 0 001-1V9.5" />
        <path d="M10 20v-6h4v6" />
      </svg>
    </div>
  );
}
