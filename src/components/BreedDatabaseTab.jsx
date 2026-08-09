import React, { useState } from "react";
import { Search } from "lucide-react";
import { Card, SectionEyebrow, EmptyHint, inputCls } from "./ui.jsx";
import { BREED_DATABASE } from "../lib/breedDatabase.js";
import { SPECIES } from "../lib/constants.js";

const SPECIES_MAP = Object.fromEntries(SPECIES.map((s) => [s.id, s.label]));

export default function BreedDatabaseTab() {
  const [search, setSearch] = useState("");
  const filtered = BREED_DATABASE.filter((b) =>
    (b.name + b.origin + b.purpose + b.notes).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <SectionEyebrow>BREED DATABASE · بانک اطلاعات نژادها</SectionEyebrow>
        <p className="text-[var(--text-secondary)] text-sm">مرجع کوتاهی از نژادهای رایج طیور و دام — صرفاً اطلاعاتی و مستقل از داده‌های گله شما.</p>
      </div>
      <div className="relative w-full md:w-72">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-quaternary)]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی نژاد..." className={`${inputCls} w-full pr-9`} />
      </div>
      {filtered.length === 0 && <EmptyHint text="نژادی یافت نشد." />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((b, i) => (
          <Card key={i} className="p-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm">{b.name}</div>
              <span className="text-[11px] text-[var(--accent)]">{SPECIES_MAP[b.species] || b.species}</span>
            </div>
            <div className="text-[12px] text-[var(--text-tertiary)]">منشأ: {b.origin} · کاربرد: {b.purpose}</div>
            <p className="text-[12px] text-[var(--text-detail)] leading-6">{b.notes}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
