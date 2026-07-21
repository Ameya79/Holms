"use client";
import Image from "next/image";

export default function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Holms Logo"
      width={size}
      height={size}
      className={`rounded-md object-cover border border-neutral-800 shrink-0 ${className}`}
    />
  );
}
