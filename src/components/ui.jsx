import React from "react";

export function Pill({ children, tone = "default" }) {
  const tones = {
    default: "bg-[var(--hover-bg)] text-[var(--pill-text)] border-[var(--pill-border)]",
    good: "bg-[var(--good-bg)] text-[var(--good-text)] border-[var(--good-border)]",
    warn: "bg-[var(--warn-bg)] text-[var(--warn-text)] border-[var(--warn-border)]",
    bad: "bg-[var(--bad-bg)] text-[var(--bad-text)] border-[var(--bad-border)]",
    accent: "bg-[var(--accent-bg)] text-[var(--accent)] border-[var(--accent-border)]",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl ${className}`}>{children}</div>;
}

export function SectionEyebrow({ children }) {
  return (
    <div
      className="flex items-center gap-2 text-[var(--accent)] text-[11px] tracking-[0.2em] font-semibold mb-1"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {children}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-[var(--text-secondary)] text-xs">{label}</span>
      {children}
    </label>
  );
}

export function EmptyHint({ text }) {
  return <div className="text-sm text-[var(--text-quaternary)] py-4 text-center">{text}</div>;
}

export const inputCls =
  "bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors placeholder:text-[var(--text-quaternary)]";
