"use client";

export default function OceanWaves() {
  return (
    <div className="relative w-full h-48 overflow-hidden pointer-events-none select-none">
      {/* Sandy shore gradient bottom */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-sand via-sand to-transparent z-10" />

      {/* Layer 3: Deep wave */}
      <svg
        className="absolute bottom-4 left-0 w-[120%] h-32 animate-[shoreWave_7s_ease-in-out_infinite_alternate] opacity-30"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0 40 C 300 80, 600 10, 900 60 L 1200 40 L 1200 120 L 0 120 Z"
          fill="#1F4E4A"
        />
      </svg>

      {/* Layer 2: Mid wave with foam edge */}
      <svg
        className="absolute bottom-2 left-[-5%] w-[115%] h-28 animate-[shoreWave_5s_ease-in-out_infinite_alternate-reverse] opacity-50"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0 50 C 250 15, 550 75, 900 25 L 1200 50 L 1200 120 L 0 120 Z"
          fill="#2a6b66"
        />
        {/* Foam highlight */}
        <path
          d="M0 50 C 250 15, 550 75, 900 25 L 1200 50"
          stroke="#F7F6F1"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Layer 1: Front wave gently hitting the sand */}
      <svg
        className="absolute bottom-0 left-0 w-[110%] h-24 animate-[shoreWave_4s_ease-in-out_infinite_alternate]"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60 C 300 30, 600 70, 900 40 C 1050 25, 1150 50, 1200 60 L 1200 120 L 0 120 Z"
          fill="#1F4E4A"
          opacity="0.85"
        />
        {/* Crisp foam edge on shore */}
        <path
          d="M0 60 C 300 30, 600 70, 900 40 C 1050 25, 1150 50, 1200 60"
          stroke="#EDE3D0"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      <style jsx>{`
        @keyframes shoreWave {
          0% {
            transform: translateX(0) translateY(0) scaleY(1);
          }
          50% {
            transform: translateX(-2%) translateY(-4px) scaleY(1.05);
          }
          100% {
            transform: translateX(1.5%) translateY(3px) scaleY(0.98);
          }
        }
      `}</style>
    </div>
  );
}
