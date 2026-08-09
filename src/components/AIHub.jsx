import React, { useMemo, useState } from "react";
import { Check, X, FileText } from "lucide-react";
import { Card, Pill, SectionEyebrow, EmptyHint } from "./ui.jsx";
import RankingsTab from "./RankingsTab.jsx";
import CompareTab from "./CompareTab.jsx";
import BreedDatabaseTab from "./BreedDatabaseTab.jsx";
import { topPairSuggestions } from "../lib/genetics.js";
import { generateManagementTips } from "../lib/managementTips.js";
import { buildSmartReport } from "../lib/smartReport.js";

const SECTIONS = [
  { id: "digest", label: "تصمیم‌یار" },
  { id: "pairs", label: "جفت‌های برتر" },
  { id: "rankings", label: "رتبه‌بندی" },
  { id: "compare", label: "مقایسه" },
  { id: "report", label: "گزارش هوشمند" },
  { id: "tips", label: "پیشنهادهای مدیریتی" },
  { id: "breeds", label: "بانک نژادها" },
];

export default function AIHub({ breeders, byId, selectionScores, goalWeights, alerts, aiSuggestions }) {
  const [section, setSection] = useState("digest");

  return (
    <div className="flex flex-col gap-5">
      <header>
        <SectionEyebrow>AI · هوش مصنوعی</SectionEyebrow>
        <h1 className="text-2xl font-extrabold">هوش مصنوعی گله</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">تحلیل‌ها و پیشنهادهای این بخش بر پایه قوانین ژنتیکی و آماری از داده‌های واقعی گله شما محاسبه می‌شوند.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              section === s.id ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]" : "bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-secondary)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "digest" && <DigestSection breedersCount={breeders.length} aiSuggestions={aiSuggestions} />}
      {section === "pairs" && <PairsSection breeders={breeders} byId={byId} selectionScores={selectionScores} goalWeights={goalWeights} />}
      {section === "rankings" && <RankingsTab breeders={breeders} selectionScores={selectionScores} />}
      {section === "compare" && <CompareTab breeders={breeders} />}
      {section === "report" && <ReportSection breeders={breeders} byId={byId} selectionScores={selectionScores} goalWeights={goalWeights} alerts={alerts} />}
      {section === "tips" && <TipsSection breeders={breeders} byId={byId} goalWeights={goalWeights} alerts={alerts} />}
      {section === "breeds" && <BreedDatabaseTab />}
    </div>
  );
}

function DigestSection({ breedersCount, aiSuggestions }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[var(--text-secondary)] text-sm">خلاصه‌ای از مهم‌ترین پیشنهادهای فعلی برای مدیریت گله.</p>
      {breedersCount < 4 && <EmptyHint text="برای دریافت پیشنهاد، حداقل ۴ مولد با رکورد کامل ثبت کنید." />}
      <div className="flex flex-col gap-2">
        {aiSuggestions.map((s, i) => (
          <Card key={i} className={`p-3.5 flex items-center gap-3 border-r-4 ${s.tone === "good" ? "border-r-[var(--good-text)]" : "border-r-[var(--bad-text)]"}`}>
            {s.tone === "good" ? <Check size={16} className="text-[var(--good-text)]" /> : <X size={16} className="text-[var(--bad-text)]" />}
            <span className="text-sm">{s.text}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PairsSection({ breeders, byId, selectionScores, goalWeights }) {
  const pairs = useMemo(
    () => topPairSuggestions(breeders, byId, goalWeights, selectionScores, 3),
    [breeders, byId, goalWeights, selectionScores]
  );
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[var(--text-secondary)] text-sm">۳ جفت برتر پیشنهادی، بر اساس سازگاری ژنتیکی و اهداف اصلاح نژاد فعلی.</p>
      {pairs.length === 0 && <EmptyHint text="برای پیشنهاد جفت، حداقل یک نر و یک ماده ثبت کنید." />}
      {pairs.map((p, i) => (
        <Card key={i} className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Pill tone="accent">#{i + 1}</Pill>
            <span className="text-sm font-medium">{p.sire.tag || p.sire.name} × {p.dam.tag || p.dam.name}</span>
          </div>
          <div className="flex items-center gap-3 text-[12px]">
            <span className="text-[var(--text-secondary)]">امتیاز کلی: <span className="mono text-[var(--text-primary)] font-bold">{(p.score.overall * 100).toFixed(0)}٪</span></span>
            <Pill tone={p.score.inbreeding >= 0.0625 ? "warn" : "good"}>هم‌خونی {(p.score.inbreeding * 100).toFixed(1)}٪</Pill>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ReportSection({ breeders, byId, selectionScores, goalWeights, alerts }) {
  const text = useMemo(
    () => buildSmartReport(breeders, byId, selectionScores, goalWeights, alerts),
    [breeders, byId, selectionScores, goalWeights, alerts]
  );
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 font-bold text-sm mb-3">
        <FileText size={16} className="text-[var(--accent)]" /> گزارش خودکار وضعیت گله
      </div>
      <p className="text-[13px] text-[var(--text-detail)] leading-8">{text}</p>
    </Card>
  );
}

function TipsSection({ breeders, byId, goalWeights, alerts }) {
  const tips = useMemo(
    () => generateManagementTips(breeders, byId, goalWeights, alerts),
    [breeders, byId, goalWeights, alerts]
  );
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[var(--text-secondary)] text-sm mb-1">پیشنهادهای مدیریتی بر اساس الگوهای موجود در داده‌های گله شما.</p>
      {tips.map((t, i) => (
        <Card key={i} className="p-3.5 flex items-start gap-3">
          <span className="text-lg shrink-0">{t.icon}</span>
          <span className="text-sm text-[var(--text-detail)] leading-6">{t.text}</span>
        </Card>
      ))}
    </div>
  );
}
