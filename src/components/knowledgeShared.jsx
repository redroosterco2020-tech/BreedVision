import React, { useState } from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={"rounded-xl border p-3 bg-[var(--input-bg)] border-[var(--input-border)] " + className}>
      {children}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = "جستجو..." }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border px-3 py-2 text-sm bg-[var(--input-bg)] border-[var(--input-border)] outline-none"
    />
  );
}

export function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border bg-[var(--input-bg)] border-[var(--input-border)] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-bold text-right">
        <span>{title}</span>
        <span className="text-[var(--text-secondary)] text-xs">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-3 pb-3 text-sm leading-7 text-[var(--text-secondary)] flex flex-col gap-2">{children}</div>}
    </div>
  );
}

export function Pills({ items, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " +
            (value === it.id
              ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]"
              : "bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-secondary)]")
          }
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export const inputCls =
  "w-full rounded-lg border px-3 py-2 text-sm bg-[var(--input-bg)] border-[var(--input-border)] outline-none";

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-[var(--text-secondary)]">
      {label}
      {children}
    </label>
  );
}

export function Btn({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={"px-4 py-2 rounded-lg text-sm font-bold border bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)] " + className}
    >
      {children}
    </button>
  );
}

export function Table({ head, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-right border-collapse">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className="p-2 border-b border-[var(--input-border)] font-bold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className="p-2 border-b border-[var(--input-border)] text-[var(--text-secondary)]">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
      }
