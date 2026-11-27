import React from "react";

const cut = (s, n = 14) => (s && s.length > n ? s.slice(0, n) + "…" : s || "—");

function Box({ x, y, w, h, title, sub, color }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={color} fillOpacity="0.25" stroke={color} />
      <text x={x + w / 2} y={y + 20} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">{title}</text>
      <text x={x + w / 2} y={y + 37} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.8">{sub}</text>
    </g>
  );
}

export default function CrossTree({ damName, sireName }) {
  const line = { stroke: "var(--text-secondary)", strokeWidth: 1.5, fill: "none" };
  const small = { fontSize: 10, fill: "currentColor", fillOpacity: 0.7 };
  return (
    <svg viewBox="0 0 340 320" className="w-full" role="img" aria-label="نمودار نسل‌ها">
      <Box x={20} y={10} w={140} h={48} title={cut(damName)} sub="والد ماده (ZW)" color="#d9a441" />
      <Box x={180} y={10} w={140} h={48} title={cut(sireName)} sub="والد نر (ZZ)" color="#2f9e6f" />
      <path d="M90 58 L90 78 L170 78 M250 58 L250 78 L170 78 L170 96" {...line} />
      <Box x={60} y={96} w={220} h={48} title="F1" sub="ترکیب والدین؛ معمولاً یکنواخت" color="#4a90d9" />
      <path d="M170 144 L170 176" {...line} />
      <text x="180" y="164" {...small}>انتخاب و جفت‌گیری F1</text>
      <Box x={60} y={176} w={220} h={48} title="F2" sub="تفکیک و ترکیب مجدد صفات" color="#e07b39" />
      <path d="M170 224 L170 256" {...line} />
      <text x="180" y="244" {...small}>انتخاب و جفت‌گیری F2</text>
      <Box x={60} y={256} w={220} h={48} title="F3" sub="تداوم و تثبیت با انتخاب" color="#9b6fd1" />
    </svg>
  );
      }
