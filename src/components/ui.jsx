import React from "react";

export function Pill({ children, tone = "default" }) {
  const tones = {
    default: "bg-[#1B3349] text-[#D3E3EE] border-[#2C4C68]",
    good: "bg-[#1F3A2E] text-[#7FD9A8] border-[#2E5641]",
    warn: "bg-[#3A2E17] text-[#E8B15D] border-[#5A4522]",
    bad: "bg-[#3A1F1B] text-[#E88A7A] border-[#5A3128]",
    accent: "bg-[#16321F] text-[#6FA83E] border-[#3F6B24]",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`bg-[#13253A] border border-[#1E3A54] rounded-2xl ${className}`}>{children}</div>;
}

export function SectionEyebrow({ children }) {
  return (
    <div
      className="flex items-center gap-2 text-[#6FA83E] text-[11px] tracking-[0.2em] font-semibold mb-1"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {children}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-[#9DB4C7] text-xs">{label}</span>
      {children}
    </label>
  );
}

export function EmptyHint({ text }) {
  return <div className="text-sm text-[#56707F] py-4 text-center">{text}</div>;
}

export const inputCls =
  "bg-[#0E2033] border border-[#24425E] rounded-lg px-3 py-2 text-[#E7EEF4] text-sm outline-none focus:border-[#6FA83E] focus:ring-1 focus:ring-[#6FA83E] transition-colors placeholder:text-[#56707F]";
