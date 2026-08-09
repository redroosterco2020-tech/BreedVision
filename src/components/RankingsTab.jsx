import React, { useState } from "react";
import { Search } from "lucide-react";
import { Card, Pill, SectionEyebrow, EmptyHint, inputCls } from "./ui.jsx";
import { speciesLabel } from "../lib/constants.js";

export default function RankingsTab({ breeders, selectionScores }) {
  const [search, setSearch] = useState("");
  const sorted = [...breeders]
    .filter((b) => (b.tag + b.name + b.breed).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (selectionScores.get(b.id) || 0) - (selectionScores.get(a.id) || 0));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <SectionEyebrow>RANKINGS · رتبه‌بندی کامل</SectionEyebrow>
        <p className="text-[var(--text-secondary)] text-sm">همه مولدها بر اساس شاخص انتخاب، از بهترین به ضعیف‌ترین.</p>
      </div>
      <div className="relative w-full md:w-72">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-quaternary)]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..." className={`${inputCls} w-full pr-9`} />
      </div>
      {sorted.length === 0 && <EmptyHint text="مولدی یافت نشد." />}
      <div className="flex flex-col gap-1.5">
        {sorted.map((b, i) => (
          <Card key={b.id} className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="mono text-[var(--text-quaternary)] text-xs w-5 shrink-0">{i + 1}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{b.tag || b.name}</div>
                <div className="text-[11px] text-[var(--text-tertiary)] truncate">{speciesLabel(b.species)} · {b.sex === "male" ? "نر" : "ماده"}</div>
              </div>
            </div>
            <Pill tone={i < 3 ? "good" : i >= sorted.length - 3 ? "bad" : "default"}>
              {(selectionScores.get(b.id) || 0).toFixed(2)}
            </Pill>
          </Card>
        ))}
      </div>
    </div>
  );
      }
