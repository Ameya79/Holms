"use client";
import Image from "next/image";

export default function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Holms Palm Island Logo"
      width={size}
      height={size}
      priority
      className={`rounded-lg object-contain shrink-0 ${className}`}
    />
  );
}
