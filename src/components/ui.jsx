import React from "react";

export function Pill({ children, tone = "default" }) {
  const tones = {
    default: "bg-[#2A362F] text-[#CFE3D6] border-[#3E4E44]",
    good: "bg-[#1F3A2E] text-[#7FD9A8] border-[#2E5641]",
    warn: "bg-[#3A2E17] text-[#E8B15D] border-[#5A4522]",
    bad: "bg-[#3A1F1B] text-[#E88A7A] border-[#5A3128]",
    accent: "bg-[#3A2A10] text-[#E8A33D] border-[#5A4218]",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`bg-[#212C25] border border-[#31402F] rounded-2xl ${className}`}>{children}</div>;
}

export function SectionEyebrow({ children }) {
  return (
    <div
      className="flex items-center gap-2 text-[#E8A33D] text-[11px] tracking-[0.2em] font-semibold mb-1"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {children}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-[#9FB3A5] text-xs">{label}</span>
      {children}
    </label>
  );
}

export function EmptyHint({ text }) {
  return <div className="text-sm text-[#5C6A61] py-4 text-center">{text}</div>;
}

export const inputCls =
  "bg-[#1A2320] border border-[#354238] rounded-lg px-3 py-2 text-[#EDE8DC] text-sm outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-colors placeholder:text-[#5C6A61]";
