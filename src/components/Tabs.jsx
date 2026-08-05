import React, { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  PawPrint, Pencil, Trash2, Search, Plus, Skull, AlertTriangle, Check, X, Info,
  ChevronLeft, FileDown,
} from "lucide-react";
import { Card, Pill, SectionEyebrow, Field, EmptyHint, inputCls } from "./ui.jsx";
import NumericInput from "./NumericInput.jsx";
import { GOAL_GROUPS, ALL_GOALS, TRAIT_META, ageInMonths, fmt, speciesLabel } from "../lib/constants.js";
import { kinshipCoefficient, pairingScore, simulateGenerations, fieldWeightsFromGoals } from "../lib/genetics.js";

/* ---------------- Dashboard ---------------- */

export function DashboardTab({ breeders, selectionScores, goalWeights, byId, alerts }) {
  const sorted = [...breeders].sort((a, b) => (selectionScores.get(b.id) || 0) - (selectionScores.get(a.id) || 0));
  const top = sorted.slice(0, 5);
  const bottom = sorted.slice(-5).reverse();
  const avgInbreeding = useMemo(() => {
    const males = breeders.filter((b) => b.sex === "male");
    const females = breeders.filter((b) => b.sex === "female");
    let sum = 0, count = 0;
    males.forEach((m) => females.forEach((f) => { sum += kinshipCoefficient(m.id, f.id, byId); count++; }));
    return count ? sum / count : 0;
  }, [breeders, byId]);
  const activeGoals = Object.entries(goalWeights || {}).filter(([, w]) => Number(w) > 0);
  const trendData = useMemo(() => {
    const map = new Map();
    breeders.forEach((b) => (b.weightHistory || []).forEach((h) => {
      const key = h.date?.slice(0, 7);
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(Number(h.weight));
    }));
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({ month, avg: vals.reduce((a, c) => a + c, 0) / vals.length }));
  }, [breeders]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <SectionEyebrow>DASHBOARD · نمای کلی</SectionEyebrow>
        <h1 className="text-2xl font-extrabold">داشبورد ژنتیکی گله</h1>
        <div className="text-[var(--text-secondary)] text-sm mt-1 flex flex-wrap gap-x-2 gap-y-1">
          <span>اهداف اصلاح نژاد فعال:</span>
          {activeGoals.length === 0 && <span className="text-[var(--text-quaternary)]">تعیین نشده</span>}
          {activeGoals.map(([gid, w]) => {
            const g = ALL_GOALS.find((x) => x.id === gid);
            if (!g) return null;
            return <Pill key={gid} tone="accent">{g.icon} {g.label} ({w}٪)</Pill>;
          })}
        </div>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="تعداد مولدها" value={breeders.length} />
        <StatCard label="میانگین هم‌خونی گله" value={`${(avgInbreeding * 100).toFixed(1)}٪`} tone={avgInbreeding > 0.0625 ? "warn" : "good"} />
        <StatCard label="هشدارهای فعال" value={alerts.length} tone={alerts.length ? "warn" : "good"} />
        <StatCard label="نر / ماده" value={`${breeders.filter((b) => b.sex === "male").length} / ${breeders.filter((b) => b.sex === "female").length}`} />
      </div>
      {trendData.length > 1 && (
        <Card className="p-5">
          <SectionEyebrow>TREND · روند پیشرفت ژنتیکی</SectionEyebrow>
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="var(--hover-bg)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--input-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="avg" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} name="میانگین وزن" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionEyebrow>TOP 5 · بهترین مولدها</SectionEyebrow>
          <div className="flex flex-col gap-2 mt-2">
            {top.length === 0 && <EmptyHint text="هنوز مولدی ثبت نشده." />}
            {top.map((b, i) => <RankRow key={b.id} rank={i + 1} breeder={b} score={selectionScores.get(b.id)} tone="good" />)}
          </div>
        </Card>
        <Card className="p-5">
          <SectionEyebrow>BOTTOM 5 · ضعیف‌ترین مولدها</SectionEyebrow>
          <div className="flex flex-col gap-2 mt-2">
            {bottom.length === 0 && <EmptyHint text="هنوز مولدی ثبت نشده." />}
            {bottom.map((b, i) => <RankRow key={b.id} rank={i + 1} breeder={b} score={selectionScores.get(b.id)} tone="bad" />)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = "default" }) {
  const toneColor = tone === "warn" ? "text-[var(--warn-text)]" : tone === "good" ? "text-[var(--good-text)]" : "text-[var(--text-primary)]";
  return (
    <Card className="p-4">
      <div className="text-[11px] text-[var(--text-tertiary)]">{label}</div>
      <div className={`text-2xl font-extrabold mono mt-1 ${toneColor}`}>{value}</div>
    </Card>
  );
}

function RankRow({ rank, breeder, score, tone }) {
  return (
    <div className="flex items-center justify-between bg-[var(--input-bg)] rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="mono text-[var(--text-quaternary)] text-xs w-4">{rank}</span>
        <span className="text-sm font-medium">{breeder.tag || breeder.name}</span>
        <span className="text-[11px] text-[var(--text-tertiary)]">{breeder.sex === "male" ? "نر" : "ماده"}</span>
      </div>
      <Pill tone={tone}>{(score || 0).toFixed(2)}</Pill>
    </div>
  );
}

/* ---------------- Breeders ---------------- */

export function BreedersTab({ breeders, byId, search, setSearch, openNew, openEdit, deleteBreeder, selectionScores }) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <SectionEyebrow>REGISTRY · ثبت مولدها</SectionEyebrow>
          <h1 className="text-2xl font-extrabold">مدیریت مولدها</h1>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[var(--accent)] text-[var(--on-accent)] font-bold px-4 py-2.5 rounded-xl hover:brightness-110 transition">
          <Plus size={16} /> افزودن مولد
        </button>
      </header>
      <div className="relative w-full md:w-80">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-quaternary)]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو با شماره، نام یا نژاد..." className={`${inputCls} w-full pr-9`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {breeders.length === 0 && <EmptyHint text="هیچ مولدی یافت نشد — یک مولد جدید اضافه کنید." />}
        {breeders.map((b) => (
          <Card key={b.id} className="p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-[45%_55%_55%_45%] flex items-center justify-center ${b.sex === "male" ? "bg-[var(--male-bg)] text-[var(--male-text)]" : "bg-[var(--good-bg)] text-[var(--good-text)]"}`}>
                  <PawPrint size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm">{b.tag || "بدون شماره"}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">{speciesLabel(b.species)} · {b.breed || "نژاد نامشخص"}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-secondary)]"><Pencil size={14} /></button>
                <button onClick={() => deleteBreeder(b.id)} className="p-1.5 rounded-lg hover:bg-[var(--bad-bg)] text-[var(--bad-text)]"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] text-[var(--text-detail)]">
              <div>سن: <span className="mono text-[var(--text-primary)]">{ageInMonths(b.birthDate) ?? "—"} ماه</span></div>
              <div>وزن: <span className="mono text-[var(--text-primary)]">{fmt(b.weight)} kg</span></div>
              <div>تخم: <span className="mono text-[var(--text-primary)]">{fmt(b.eggProduction, 0)}</span></div>
              <div>FCR: <span className="mono text-[var(--text-primary)]">{fmt(b.fcr)}</span></div>
              <div>هچ: <span className="mono text-[var(--text-primary)]">{fmt(b.hatchPercent, 0)}٪</span></div>
              <div>مقاومت: <span className="mono text-[var(--text-primary)]">{fmt(b.resistanceScore, 0)}/۱۰</span></div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[var(--hover-bg)]">
              <div className="text-[11px] text-[var(--text-tertiary)]">پدر: {byId.get(b.sireId)?.tag || "—"} · مادر: {byId.get(b.damId)?.tag || "—"}</div>
              <Pill tone="accent">SI {(selectionScores.get(b.id) || 0).toFixed(2)}</Pill>
            </div>
            {b.mortality && <div className="flex items-center gap-1 text-[11px] text-[var(--bad-text)]"><Skull size={12} /> تلف‌شده {b.mortalityDate ? `— ${b.mortalityDate}` : ""}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Pedigree ---------------- */

export function PedigreeTab({ breeders, byId, focus, setFocus }) {
  const focusBreeder = byId.get(focus) || breeders[0];
  function buildTree(id, depth) {
    const b = byId.get(id);
    if (!b || depth < 0) return null;
    return { breeder: b, sire: b.sireId ? buildTree(b.sireId, depth - 1) : null, dam: b.damId ? buildTree(b.damId, depth - 1) : null };
  }
  const tree = focusBreeder ? buildTree(focusBreeder.id, 3) : null;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <SectionEyebrow>PEDIGREE · درخت ژنتیکی</SectionEyebrow>
        <h1 className="text-2xl font-extrabold">شجره‌نامه</h1>
      </header>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--text-secondary)]">نمایش شجره برای:</span>
        <select className={inputCls} value={focusBreeder?.id || ""} onChange={(e) => setFocus(e.target.value)}>
          {breeders.map((b) => <option key={b.id} value={b.id}>{b.tag || b.name}</option>)}
        </select>
      </div>
      {!focusBreeder && <EmptyHint text="ابتدا یک مولد ثبت کنید." />}
      {tree && (
        <Card className="p-6 overflow-x-auto">
          <div className="flex flex-col items-center gap-8 min-w-[700px]">
            <TreeLevel nodes={[tree]} />
          </div>
        </Card>
      )}
    </div>
  );
}

function TreeNode({ breeder }) {
  if (!breeder) {
    return (
      <div className="w-32 h-16 rounded-[45%_55%_55%_45%_/_60%_60%_40%_40%] border border-dashed border-[var(--input-border)] flex items-center justify-center text-[10px] text-[var(--text-quaternary)]">
        نامشخص
      </div>
    );
  }
  const male = breeder.sex === "male";
  return (
    <div className={`w-32 rounded-[45%_55%_55%_45%_/_60%_60%_40%_40%] border px-3 py-2 text-center ${male ? "bg-[var(--male-bg)] border-[var(--male-border)] text-[var(--male-text)]" : "bg-[var(--good-bg)] border-[var(--good-border)] text-[var(--good-text)]"}`}>
      <div className="text-[12px] font-bold truncate">{breeder.tag || breeder.name}</div>
      <div className="text-[10px] opacity-70">{breeder.breed || "—"}</div>
    </div>
  );
}

function TreeLevel({ nodes }) {
  function renderGen(items, gen) {
    if (gen > 3 || items.every((i) => !i)) return null;
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">{items.map((item, i) => <TreeNode key={i} breeder={item ? item.breeder : null} />)}</div>
        {gen < 3 && (
          <>
            <div className="flex gap-1 text-[var(--input-border)]">{items.map((_, i) => <ChevronLeft key={i} size={14} />)}</div>
            {renderGen(items.flatMap((item) => (item ? [item.sire, item.dam] : [null, null])), gen + 1)}
          </>
        )}
      </div>
    );
  }
  return renderGen(nodes, 0);
}

/* ---------------- Pairing ---------------- */

export function PairingTab({ males, females, byId, goalWeights, pairSel, setPairSel }) {
  const sire = byId.get(pairSel.sireId);
  const dam = byId.get(pairSel.damId);
  const score = sire && dam ? pairingScore(sire, dam, byId, goalWeights) : null;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <SectionEyebrow>PAIRING · انتخاب بهترین جفت</SectionEyebrow>
        <h1 className="text-2xl font-extrabold">انتخاب جفت مولد</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="نر (پدر)">
          <select className={inputCls} value={pairSel.sireId} onChange={(e) => setPairSel((p) => ({ ...p, sireId: e.target.value }))}>
            <option value="">انتخاب کنید...</option>
            {males.map((m) => <option key={m.id} value={m.id}>{m.tag || m.name}</option>)}
          </select>
        </Field>
        <Field label="ماده (مادر)">
          <select className={inputCls} value={pairSel.damId} onChange={(e) => setPairSel((p) => ({ ...p, damId: e.target.value }))}>
            <option value="">انتخاب کنید...</option>
            {females.map((f) => <option key={f.id} value={f.id}>{f.tag || f.name}</option>)}
          </select>
        </Field>
      </div>
      {!sire || !dam ? (
        <EmptyHint text="یک نر و یک ماده را برای محاسبه امتیاز انتخاب کنید." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScoreCard icon="⭐" label="سازگاری ژنتیکی" value={score.geneticCompat} tone={score.geneticCompat > 0.7 ? "good" : score.geneticCompat > 0.4 ? "warn" : "bad"} />
          <ScoreCard icon="⭐" label="احتمال بهبود نسل" value={score.improvementProb} tone={score.improvementProb > 0.6 ? "good" : "warn"} />
          <ScoreCard icon="⭐" label="احتمال افت صفات" value={score.declineRisk} tone={score.declineRisk < 0.2 ? "good" : score.declineRisk < 0.4 ? "warn" : "bad"} />
          <Card className="p-4 md:col-span-3 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-sm text-[var(--text-secondary)]">امتیاز کلی جفت‌گیری</div>
              <div className="text-3xl font-extrabold mono mt-1">{(score.overall * 100).toFixed(0)}٪</div>
            </div>
            <div className="text-left">
              <div className="text-sm text-[var(--text-secondary)]">ضریب هم‌خونی نسل بعد</div>
              <Pill tone={score.inbreeding >= 0.0625 ? "warn" : "good"}>{(score.inbreeding * 100).toFixed(1)}٪</Pill>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ icon, label, value, tone }) {
  return (
    <Card className="p-4">
      <div className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1">{icon} {label}</div>
      <div className={`text-2xl font-extrabold mono mt-1 ${tone === "good" ? "text-[var(--good-text)]" : tone === "warn" ? "text-[var(--warn-text)]" : "text-[var(--bad-text)]"}`}>
        {(value * 100).toFixed(0)}٪
      </div>
      <div className="w-full h-1.5 bg-[var(--input-bg)] rounded-full mt-2 overflow-hidden">
        <div className={`h-full ${tone === "good" ? "bg-[var(--good-text)]" : tone === "warn" ? "bg-[var(--warn-text)]" : "bg-[var(--bad-text)]"}`} style={{ width: `${value * 100}%` }} />
      </div>
    </Card>
  );
}

/* ---------------- Simulation ---------------- */

export function SimulationTab({ males, females, byId, goalWeights, pairSel, setPairSel }) {
  const sire = byId.get(pairSel.sireId);
  const dam = byId.get(pairSel.damId);
  const sim = sire && dam ? simulateGenerations(sire, dam, byId, goalWeights, 5) : null;

  const fieldWeights = fieldWeightsFromGoals(goalWeights);
  const rankedFields = Object.keys(TRAIT_META).sort((a, b) => (fieldWeights[b] || 0) - (fieldWeights[a] || 0));
  const defaultField = rankedFields.find((f) => (fieldWeights[f] || 0) > 0) || "weight";
  const [focusField, setFocusField] = useState(defaultField);
  const activeField = sim && sim[0].traits[focusField] ? focusField : rankedFields.find((f) => sim && sim[0].traits[f]) || "weight";

  const chartData = sim ? sim.map((row) => ({
    gen: `نسل ${row.gen}`,
    value: row.traits[activeField]?.mean ?? null,
    low: row.traits[activeField]?.low ?? null,
    high: row.traits[activeField]?.high ?? null,
  })) : [];

  return (
    <div className="flex flex-col gap-5">
      <header>
        <SectionEyebrow>SIMULATION · شبیه‌سازی نسل‌ها</SectionEyebrow>
        <h1 className="text-2xl font-extrabold">شبیه‌سازی احتمالی نسل‌ها</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 flex items-center gap-1"><Info size={13} /> همه مقادیر برآورد احتمالی و بازه‌ای هستند، نه نتیجه قطعی.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="نر (پدر)">
          <select className={inputCls} value={pairSel.sireId} onChange={(e) => setPairSel((p) => ({ ...p, sireId: e.target.value }))}>
            <option value="">انتخاب کنید...</option>
            {males.map((m) => <option key={m.id} value={m.id}>{m.tag || m.name}</option>)}
          </select>
        </Field>
        <Field label="ماده (مادر)">
          <select className={inputCls} value={pairSel.damId} onChange={(e) => setPairSel((p) => ({ ...p, damId: e.target.value }))}>
            <option value="">انتخاب کنید...</option>
            {females.map((f) => <option key={f.id} value={f.id}>{f.tag || f.name}</option>)}
          </select>
        </Field>
      </div>
      {!sim && <EmptyHint text="یک جفت را برای مشاهده شبیه‌سازی انتخاب کنید." />}
      {sim && (
        <>
          <Field label="نمایش نمودار برای صفت">
            <select className={inputCls} value={activeField} onChange={(e) => setFocusField(e.target.value)}>
              {Object.keys(TRAIT_META).filter((f) => sim[0].traits[f]).map((f) => (
                <option key={f} value={f}>{TRAIT_META[f].label}{fieldWeights[f] > 0 ? ` — هدف (${Math.round(fieldWeights[f] * 100)}٪)` : ""}</option>
              ))}
            </select>
          </Field>
          <Card className="p-5">
            <SectionEyebrow>{TRAIT_META[activeField].label.toUpperCase()} · روند برآوردی صفت</SectionEyebrow>
            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="var(--hover-bg)" strokeDasharray="3 3" />
                  <XAxis dataKey="gen" stroke="var(--text-tertiary)" fontSize={11} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--input-border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="high" stroke="var(--input-border)" strokeWidth={1} dot={false} name="سقف بازه" />
                  <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} name="میانگین برآوردی" />
                  <Line type="monotone" dataKey="low" stroke="var(--input-border)" strokeWidth={1} dot={false} name="کف بازه" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {sim.map((row) => (
              <Card key={row.gen} className="p-3.5">
                <div className="text-[11px] text-[var(--accent)] font-bold mb-2">نسل {row.gen}</div>
                {Object.keys(TRAIT_META).map((f) => {
                  const t = row.traits[f];
                  if (!t) return null;
                  return (
                    <div key={f} className="text-[11px] text-[var(--text-detail)] mb-1 flex justify-between">
                      <span>{TRAIT_META[f].label.split(" ")[0]}</span>
                      <span className="mono text-[var(--text-primary)]">{fmt(t.mean, 1)}</span>
                    </div>
                  );
                })}
                <div className="text-[11px] mt-2 pt-2 border-t border-[var(--hover-bg)] flex justify-between">
                  <span className="text-[var(--text-secondary)]">هم‌خونی</span>
                  <span className={`mono ${row.inbreeding > 0.0625 ? "text-[var(--warn-text)]" : "text-[var(--good-text)]"}`}>{(row.inbreeding * 100).toFixed(1)}٪</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Alerts ---------------- */

export function AlertsTab({ alerts }) {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <SectionEyebrow>ALERTS · هشدارهای ژنتیکی</SectionEyebrow>
        <h1 className="text-2xl font-extrabold">هشدارها</h1>
      </header>
      {alerts.length === 0 && <EmptyHint text="هیچ هشداری فعال نیست. گله در وضعیت مطلوبی است." />}
      <div className="flex flex-col gap-2">
        {alerts.map((a, i) => (
          <Card key={i} className={`p-3.5 flex items-center gap-3 border-r-4 ${a.type === "bad" ? "border-r-[var(--bad-text)]" : "border-r-[var(--warn-text)]"}`}>
            <AlertTriangle size={16} className={a.type === "bad" ? "text-[var(--bad-text)]" : "text-[var(--warn-text)]"} />
            <span className="text-sm">{a.text}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Goal (multi-select + weights) ---------------- */

export function GoalTab({ goalWeights, setGoalWeights }) {
  const total = Object.values(goalWeights || {}).reduce((a, c) => a + (Number(c) || 0), 0);

  function toggleGoal(goalId, checked) {
    setGoalWeights((prev) => {
      const next = { ...prev };
      if (checked) {
        if (!next[goalId]) next[goalId] = 20;
      } else {
        delete next[goalId];
      }
      return next;
    });
  }

  function setWeight(goalId, val) {
    setGoalWeights((prev) => ({ ...prev, [goalId]: Math.max(0, Math.min(100, Number(val) || 0)) }));
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <SectionEyebrow>BREEDING GOALS · اهداف اصلاح نژاد</SectionEyebrow>
        <h1 className="text-2xl font-extrabold">اهداف برنامه اصلاح نژاد را انتخاب کنید</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          می‌توانید چند هدف را هم‌زمان انتخاب کنید و برای هرکدام یک اهمیت (درصد) تعیین کنید. برنامه بر همین اساس
          شاخص انتخاب، پیشنهادهای هوشمند و شبیه‌سازی نسل‌ها را محاسبه می‌کند.
        </p>
        <div className="mt-2">
          <Pill tone={total > 0 ? "accent" : "default"}>مجموع اهمیت انتخاب‌شده: {total}٪</Pill>
        </div>
      </header>

      {GOAL_GROUPS.map((group) => (
        <div key={group.id} className="flex flex-col gap-3">
          <div className="text-sm font-bold flex items-center gap-2">
            <span>{group.icon}</span> {group.label}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group.goals.map((g) => {
              const checked = goalWeights && goalWeights[g.id] !== undefined;
              const weight = goalWeights?.[g.id] ?? 0;
              return (
                <Card key={g.id} className={`p-3.5 flex items-center gap-3 ${checked ? "border-[var(--accent)]" : ""}`}>
                  <button
                    onClick={() => toggleGoal(g.id, !checked)}
                    className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-lg ${checked ? "bg-[var(--accent-bg)] border border-[var(--accent)]" : "bg-[var(--input-bg)] border border-[var(--input-border)]"}`}
                  >
                    {g.icon}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{g.label}</div>
                  </div>
                  {checked && (
                    <div className="flex items-center gap-1 shrink-0">
                      <NumericInput
                        allowDecimal={false}
                        min={0}
                        max={100}
                        value={weight}
                        onChange={(v) => setWeight(g.id, v)}
                        className="w-14 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2 py-1 text-sm text-center outline-none focus:border-[var(--accent)]"
                      />
                      <span className="text-xs text-[var(--text-tertiary)]">٪</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AiTab({ suggestions, breedersCount }) {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <SectionEyebrow>AI ADVISOR · پیشنهاد هوشمند</SectionEyebrow>
        <h1 className="text-2xl font-extrabold">پیشنهادهای اصلاح نژاد</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">بر اساس رکوردهای ثبت‌شده و اهداف اصلاح نژاد فعلی تولید می‌شود.</p>
      </header>
      {breedersCount < 4 && <EmptyHint text="برای دریافت پیشنهاد، حداقل ۴ مولد با رکورد کامل ثبت کنید." />}
      <div className="flex flex-col gap-2">
        {suggestions.map((s, i) => (
          <Card key={i} className={`p-3.5 flex items-center gap-3 border-r-4 ${s.tone === "good" ? "border-r-[var(--good-text)]" : "border-r-[var(--bad-text)]"}`}>
            {s.tone === "good" ? <Check size={16} className="text-[var(--good-text)]" /> : <X size={16} className="text-[var(--bad-text)]" />}
            <span className="text-sm">{s.text}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Report ---------------- */

export function ReportTab({ breeders, byId, alerts, aiSuggestions, selectionScores, goalWeights, exportExcel }) {
  const activeGoals = Object.entries(goalWeights || {}).filter(([, w]) => Number(w) > 0);
  return (
    <div className="flex flex-col gap-5">
      <header className="no-print flex items-center justify-between flex-wrap gap-3">
        <div>
          <SectionEyebrow>REPORT · گزارش</SectionEyebrow>
          <h1 className="text-2xl font-extrabold">گزارش خروجی</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="flex items-center gap-2 bg-[var(--hover-bg)] text-[var(--good-text)] font-semibold px-4 py-2.5 rounded-xl hover:brightness-110">
            <FileDown size={16} /> خروجی Excel
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-[var(--accent)] text-[var(--on-accent)] font-bold px-4 py-2.5 rounded-xl hover:brightness-110">
            <FileDown size={16} /> خروجی PDF (چاپ)
          </button>
        </div>
      </header>
      <Card className="p-6 print:border-none">
        <h2 className="text-xl font-extrabold mb-1">گزارش ژنتیکی گله</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-4">
          اهداف اصلاح نژاد: {activeGoals.length === 0 ? "تعیین نشده" : activeGoals.map(([gid, w]) => {
            const g = ALL_GOALS.find((x) => x.id === gid);
            return g ? `${g.label} (${w}٪)` : null;
          }).filter(Boolean).join("، ")}
          {" "}· تاریخ گزارش: {new Date().toLocaleDateString("fa-IR")}
        </p>
        <SectionEyebrow>مولدها</SectionEyebrow>
        <table className="w-full text-[12px] my-2 border-collapse">
          <thead>
            <tr className="text-[var(--text-tertiary)] border-b border-[var(--hover-bg)]">
              <th className="text-right py-1.5">شماره</th><th className="text-right">جنسیت</th><th className="text-right">وزن</th>
              <th className="text-right">تخم</th><th className="text-right">FCR</th><th className="text-right">هچ</th><th className="text-right">شاخص انتخاب</th>
            </tr>
          </thead>
          <tbody>
            {breeders.map((b) => (
              <tr key={b.id} className="border-b border-[var(--divider)]">
                <td className="py-1.5">{b.tag || b.name}</td>
                <td>{b.sex === "male" ? "نر" : "ماده"}</td>
                <td className="mono">{fmt(b.weight)}</td>
                <td className="mono">{fmt(b.eggProduction, 0)}</td>
                <td className="mono">{fmt(b.fcr)}</td>
                <td className="mono">{fmt(b.hatchPercent, 0)}٪</td>
                <td className="mono">{(selectionScores.get(b.id) || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <SectionEyebrow>هشدارها</SectionEyebrow>
        <ul className="text-[12px] my-2 list-disc pr-5 flex flex-col gap-1">
          {alerts.length === 0 && <li className="text-[var(--text-tertiary)]">هشداری ثبت نشده.</li>}
          {alerts.map((a, i) => <li key={i}>{a.text}</li>)}
        </ul>
        <SectionEyebrow>پیشنهاد اصلاح نژاد</SectionEyebrow>
        <ul className="text-[12px] my-2 list-disc pr-5 flex flex-col gap-1">
          {aiSuggestions.length === 0 && <li className="text-[var(--text-tertiary)]">پیشنهادی موجود نیست.</li>}
          {aiSuggestions.map((s, i) => <li key={i}>{s.text}</li>)}
        </ul>
      </Card>
    </div>
  );
                         }
