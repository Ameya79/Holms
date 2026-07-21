"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FaReact, FaPython, FaDatabase, FaLock, FaGithub,
  FaSearch, FaBrain, FaFilePdf, FaTerminal, FaShieldAlt, FaRobot
} from "react-icons/fa";
import {
  SiNextdotjs, SiTypescript, SiFastapi, SiSqlite, SiAnthropic, SiGooglecloud
} from "react-icons/si";

const iconConfigs = [
  { Icon: FaReact, color: "#61DAFB" },
  { Icon: SiNextdotjs, color: "#1F4E4A" },
  { Icon: SiTypescript, color: "#3178C6" },
  { Icon: FaPython, color: "#3776AB" },
  { Icon: SiFastapi, color: "#009688" },
  { Icon: SiSqlite, color: "#003B57" },
  { Icon: FaSearch, color: "#8A6D53" },
  { Icon: FaBrain, color: "#1F4E4A" },
  { Icon: FaFilePdf, color: "#E2574C" },
  { Icon: SiAnthropic, color: "#D97757" },
  { Icon: FaRobot, color: "#10A37F" },
  { Icon: SiGooglecloud, color: "#4285F4" },
  { Icon: FaShieldAlt, color: "#1F4E4A" },
  { Icon: FaLock, color: "#8A6D53" },
  { Icon: FaGithub, color: "#181717" },
];

export default function FeatureSection() {
  const orbitCount = 3;
  const orbitGap = 8; // rem between orbits
  const iconsPerOrbit = Math.ceil(iconConfigs.length / orbitCount);

  return (
    <section className="relative max-w-6xl mx-auto my-24 px-8 py-10 flex flex-col md:flex-row items-center justify-between min-h-[30rem] border border-teal/20 bg-foam overflow-hidden rounded-3xl shadow-sm">
      {/* Left side: Heading and Text */}
      <div className="w-full md:w-1/2 z-10 mb-8 md:mb-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-drift bg-drift/10 px-3 py-1 rounded-full inline-block mb-3">
          Local-First Architecture
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-normal mb-4 text-teal leading-tight">
          Your documents. Completely private.
        </h2>
        <p className="text-ink/80 text-base mb-6 max-w-lg leading-relaxed">
          Holms indexes your PDFs, DOCX, and scanned notices locally in SQLite. Fast hybrid search works without any API key — connect your choice of Claude, GPT, Gemini, or Groq for AI answers.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="secondary" asChild>
            <Link href="/app">Try Holms Now</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="https://github.com/Ameya79/Holms.git" target="_blank">
              <FaGithub className="mr-2 h-4 w-4" /> GitHub Source
            </Link>
          </Button>
        </div>
      </div>

      {/* Right side: Orbit animation cropped to 1/4 */}
      <div className="relative w-full md:w-1/2 h-[26rem] flex items-center justify-center md:justify-start overflow-hidden">
        <div className="relative w-[48rem] h-[48rem] md:translate-x-[40%] flex items-center justify-center">
          {/* Center Circle */}
          <div className="w-24 h-24 rounded-full bg-sand border-2 border-teal/30 shadow-lg flex items-center justify-center z-20">
            <FaSearch className="w-10 h-10 text-teal" />
          </div>

          {/* Generate Orbits */}
          {[...Array(orbitCount)].map((_, orbitIdx) => {
            const size = `${12 + orbitGap * (orbitIdx + 1)}rem`;
            const angleStep = (2 * Math.PI) / iconsPerOrbit;

            return (
              <div
                key={orbitIdx}
                className="absolute rounded-full border-2 border-dashed border-teal/20"
                style={{
                  width: size,
                  height: size,
                  animation: `spin ${14 + orbitIdx * 7}s linear infinite`,
                }}
              >
                {iconConfigs
                  .slice(orbitIdx * iconsPerOrbit, orbitIdx * iconsPerOrbit + iconsPerOrbit)
                  .map((cfg, iconIdx) => {
                    const angle = iconIdx * angleStep;
                    const x = 50 + 50 * Math.cos(angle);
                    const y = 50 + 50 * Math.sin(angle);

                    return (
                      <div
                        key={iconIdx}
                        className="absolute bg-white rounded-full p-2 shadow-md border border-teal/10 hover:scale-110 transition-transform"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        {cfg.Icon && (
                          <cfg.Icon className="w-7 h-7" style={{ color: cfg.color }} />
                        )}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}
