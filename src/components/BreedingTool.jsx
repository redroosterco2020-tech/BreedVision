import React, { useMemo, useState } from "react";
import { Card, Pills, Field, inputCls, Table } from "./knowledgeShared.jsx";
import { buildPedigree } from "./pedigree.js";
import { SPECIES } from "../lib/constants.js";

const num = (v) => parseFloat(String(v).replace(",", "."));
const pct = (x) => (x * 100).toFixed(2) + "٪";
const name = (b) => (b.tag || "") + (b.tag && b.name ? " — " : "") + (b.name || "");
const speciesLabel = (id) => (SPECIES || []).find((s) => s.id === id)?.label || id || "نامشخص";

function level(F) {
  if (F < 0.0625) return { t: "کم", c: "#2f9e6f" };
  if (F < 0.125) return { t: "متوسط", c: "#d9a441" };
  if (F < 0.25) return { t: "زیاد", c: "#e07b39" };
  return { t: "بسیار زیاد", c: "#c8553d" };
}

/* ---------- پیشنهاد جفت از گله ---------- */
function PairPlanner({ breeders }) {
  const alive = useMemo(() => breeders.filter((b) => !b.mortality), [breeders]);
  const ped = useMemo(() => buildPedigree(breeders), [breeders]);
  const [selId, setSelId] = useState("");
  const sel = alive.find((b) => b.id === selId);

  const rows = useMemo(() => {
    if (!sel) return [];
    return alive
      .filter((b) => b.id !== sel.id && b.sex !== sel.sex && (b.species || "") === (sel.species || ""))
      .map((b) => {
        const sire = sel.sex === "male" ? sel : b;
        const dam = sel.sex === "male" ? b : sel;
        return { b, F: ped.pairF(sire.id, dam.id), incomplete: ped.knownParents(b.id) === 0 || ped.knownParents(sel.id) === 0 };
      })
      .sort((x, y) => x.F - y.F);
  }, [sel, alive, ped]);

  if (alive.length === 0) return <Card><p className="text-sm text-[var(--text-secondary)]">هنوز مولدی در برنامه ثبت نکرده‌اید. بعد از ثبت مولدها، اینجا پیشنهاد جفت‌گیری می‌بینید.</p></Card>;

  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        یک مولد را انتخاب کنید. جفت‌های ممکن (جنس مخالف و هم‌گونه) از کمترین تا بیشترین همخونی نتاج مرتب می‌شوند. محاسبه از روی شجره ثبت‌شده (پدر و مادر) انجام می‌شود.
      </p>
      <Field label="مولد">
        <select className={inputCls} value={selId} onChange={(e) => setSelId(e.target.value)}>
          <option value="">— انتخاب کنید —</option>
          {alive.map((b) => (
            <option key={b.id} value={b.id}>
              {name(b)} ({b.sex === "male" ? "نر" : "ماده"})
            </option>
          ))}
        </select>
      </Field>

      {sel && (
        <div className="text-xs text-[var(--text-secondary)] leading-6">
          {speciesLabel(sel.species)}{sel.breed ? " — " + sel.breed : ""} · همخونی خود این پرنده: <b>{pct(ped.selfF(sel.id))}</b> · والدین ثبت‌شده: {ped.knownParents(sel.id)} از ۲
        </div>
      )}

      {sel && rows.length === 0 && (
        <p className="text-sm text-[var(--text-secondary)]">جفت مناسبی (جنس مخالف و هم‌گونه) در گله پیدا نشد.</p>
      )}

      {rows.map(({ b, F, incomplete }) => {
        const lv = level(F);
        return (
          <div key={b.id} className="rounded-lg border border-[var(--input-border)] p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold">{name(b)}</span>
              <span className="text-xs font-bold" style={{ color: lv.c }}>
                {pct(F)} — {lv.t}
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-1 flex flex-wrap gap-x-3">
              {b.breed && <span>{b.breed}</span>}
              {b.hatchPercent !== "" && b.hatchPercent != null && <span>هچ: {b.hatchPercent}٪</span>}
              {b.fertilityScore !== "" && b.fertilityScore != null && <span>باروری: {b.fertilityScore}/۱۰</span>}
              {incomplete && <span>شجره ناقص: همخونی احتمالاً کمتر از واقع برآورد شده</span>}
            </div>
          </div>
        );
      })}
      {sel && rows.length > 0 && (
        <p className="text-[11px] text-[var(--text-secondary)] leading-6">
          اعداد فقط بر پایه شجره ثبت‌شده‌اند. برای جفت‌گیری نهایی، سلامت، باروری و صفات هدف پرورش را هم در نظر بگیرید.
        </p>
      )}
    </Card>
  );
}

/* ---------- وضعیت گله ---------- */
function FlockStatus({ breeders }) {
  const alive = breeders.filter((b) => !b.mortality);
  const groups = {};
  alive.forEach((b) => {
    const k = b.species || "";
    groups[k] = groups[k] || { m: 0, f: 0 };
    if (b.sex === "male") groups[k].m++;
    else groups[k].f++;
  });
  const keys = Object.keys(groups);
  if (keys.length === 0) return <Card><p className="text-sm text-[var(--text-secondary)]">هنوز مولدی ثبت نشده است.</p></Card>;
  return (
    <div className="flex flex-col gap-3">
      {keys.map((k) => {
        const { m, f } = groups[k];
        const ok = m > 0 && f > 0;
        const ne = ok ? (4 * m * f) / (m + f) : NaN;
        const dF = ok ? 1 / (8 * m) + 1 / (8 * f) : NaN;
        const lv = level(dF * 4); // مقیاس هشدار برای ΔF
        return (
          <Card key={k}>
            <div className="text-sm font-bold mb-1">{speciesLabel(k)}</div>
            <div className="text-sm leading-8">
              <div>نر زنده: <b>{m}</b> — ماده زنده: <b>{f}</b></div>
              {ok ? (
                <>
                  <div>نسبت نر به ماده: <b>۱ : {(f / m).toFixed(1)}</b></div>
                  <div>اندازه مؤثر جمعیت (Ne): <b>{ne.toFixed(1)}</b></div>
                  <div>
                    افزایش همخونی هر نسل (ΔF): <b>{pct(dF)}</b>{" "}
                    <span style={{ color: dF > 0.03 ? "#c8553d" : dF > 0.01 ? "#d9a441" : "#2f9e6f" }}>
                      ({dF > 0.03 ? "خطر بالا" : dF > 0.01 ? "خطر متوسط" : "خطر پایین"})
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-[var(--text-secondary)]">برای محاسبه، هر دو جنس باید ثبت شده باشند.</div>
              )}
            </div>
          </Card>
        );
      })}
      <p className="text-[11px] text-[var(--text-secondary)] leading-6">
        فرمول: ΔF = 1/(8·Nm) + 1/(8·Nf). افزودن نر یا ماده غیرخویشاوند تازه، همخونی را سریع کاهش می‌دهد.
      </p>
    </div>
  );
}

/* ---------- ابزارهای قبلی ---------- */
function Response() {
  const [h2, setH2] = useState("0.4");
  const [mean, setMean] = useState("2000");
  const [sel, setSel] = useState("2400");
  const [unit, setUnit] = useState("گرم");
  const h = num(h2), m = num(mean), s = num(sel);
  const S = s - m;
  const R = h * S;
  const ok = !isNaN(h) && !isNaN(m) && !isNaN(s) && h >= 0 && h <= 1;
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        معادله پرورش‌دهنده: R = h² × S. میانگین کل گله و میانگین پرندگان انتخاب‌شده برای تولید مثل را وارد کنید تا پیشرفت نسل بعد برآورد شود.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Field label="وراثت‌پذیری h² (۰ تا ۱)"><input className={inputCls} inputMode="decimal" value={h2} onChange={(e) => setH2(e.target.value)} /></Field>
        <Field label="واحد"><input className={inputCls} value={unit} onChange={(e) => setUnit(e.target.value)} /></Field>
        <Field label="میانگین کل گله"><input className={inputCls} inputMode="decimal" value={mean} onChange={(e) => setMean(e.target.value)} /></Field>
        <Field label="میانگین انتخاب‌شده‌ها"><input className={inputCls} inputMode="decimal" value={sel} onChange={(e) => setSel(e.target.value)} /></Field>
      </div>
      {ok ? (
        <div className="text-sm leading-8">
          <div>تفاضل انتخاب (S): <b>{S.toFixed(1)}</b> {unit}</div>
          <div>پاسخ مورد انتظار (R): <b>{R.toFixed(1)}</b> {unit}</div>
          <div>میانگین نسل بعد: <b>{(m + R).toFixed(1)}</b> {unit}</div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-6">برآورد نظری است و به دقت h² و رکورد پرندگان بستگی دارد.</p>
        </div>
      ) : <p className="text-sm text-red-500">مقادیر را درست وارد کنید.</p>}
    </Card>
  );
}

function Pop() {
  const [nm, setNm] = useState("5");
  const [nf, setNf] = useState("40");
  const a = num(nm), b = num(nf);
  const ok = a > 0 && b > 0;
  const ne = ok ? (4 * a * b) / (a + b) : NaN;
  const dF = ok ? 1 / (8 * a) + 1 / (8 * b) : NaN;
  const risk = dF > 0.03 ? "بالا" : dF > 0.01 ? "متوسط" : "پایین";
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        برای برنامه‌ریزی: تعداد خروس و مرغ‌های مولد را فرضی وارد کنید تا اندازه مؤثر جمعیت و افزایش همخونی برآورد شود.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Field label="تعداد نر مولد"><input className={inputCls} inputMode="numeric" value={nm} onChange={(e) => setNm(e.target.value)} /></Field>
        <Field label="تعداد ماده مولد"><input className={inputCls} inputMode="numeric" value={nf} onChange={(e) => setNf(e.target.value)} /></Field>
      </div>
      {ok ? (
        <div className="text-sm leading-8">
          <div>نسبت نر به ماده: <b>۱ : {(b / a).toFixed(1)}</b></div>
          <div>اندازه مؤثر جمعیت (Ne): <b>{ne.toFixed(1)}</b></div>
          <div>افزایش همخونی در هر نسل (ΔF): <b>{(dF * 100).toFixed(2)}٪</b> — خطر: <b>{risk}</b></div>
        </div>
      ) : <p className="text-sm text-red-500">اعداد را بزرگ‌تر از صفر وارد کنید.</p>}
    </Card>
  );
}

const H2 = [
  ["وزن بدن", "۰٫۴ – ۰٫۶", "بالا"],
  ["وزن تخم", "۰٫۴ – ۰٫۶", "بالا"],
  ["سن بلوغ جنسی", "۰٫۲ – ۰٫۴", "متوسط"],
  ["ضخامت پوسته", "۰٫۲ – ۰٫۴", "متوسط"],
  ["ضریب تبدیل خوراک", "۰٫۲ – ۰٫۴", "متوسط"],
  ["تعداد تخم", "۰٫۱ – ۰٫۳", "پایین تا متوسط"],
  ["باروری", "۰٫۰۱ – ۰٫۱", "پایین"],
  ["جوجه‌درآوری", "۰٫۰۵ – ۰٫۲", "پایین"],
  ["زنده‌مانی", "۰٫۰۱ – ۰٫۱", "پایین"],
];

function H2Table() {
  return (
    <Card className="flex flex-col gap-2">
      <Table head={["صفت", "h² تقریبی", "سطح"]} rows={H2} />
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        مقادیر تقریبی و وابسته به نژاد و گله‌اند. صفات با h² بالا با انتخاب فردی سریع‌تر پیشرفت می‌کنند.
      </p>
    </Card>
  );
}

const TOOLS = [
  { id: "pair", label: "پیشنهاد جفت" },
  { id: "flock", label: "وضعیت گله" },
  { id: "resp", label: "پاسخ به انتخاب" },
  { id: "pop", label: "برنامه‌ریزی گله" },
  { id: "h2", label: "وراثت‌پذیری" },
];

export default function BreedingTool({ breeders = [] }) {
  const [t, setT] = useState("pair");
  return (
    <div className="flex flex-col gap-3">
      <Pills items={TOOLS} value={t} onChange={setT} />
      {t === "pair" && <PairPlanner breeders={breeders} />}
      {t === "flock" && <FlockStatus breeders={breeders} />}
      {t === "resp" && <Response />}
      {t === "pop" && <Pop />}
      {t === "h2" && <H2Table />}
    </div>
  );
      }import React, { useMemo, useState } from "react";
import { Card, Pills, Field, inputCls, Table } from "./knowledgeShared.jsx";
import { buildPedigree } from "./pedigree.js";
import { SPECIES } from "../lib/constants.js";

const num = (v) => parseFloat(String(v).replace(",", "."));
const pct = (x) => (x * 100).toFixed(2) + "٪";
const name = (b) => (b.tag || "") + (b.tag && b.name ? " — " : "") + (b.name || "");
const speciesLabel = (id) => (SPECIES || []).find((s) => s.id === id)?.label || id || "نامشخص";

function level(F) {
  if (F < 0.0625) return { t: "کم", c: "#2f9e6f" };
  if (F < 0.125) return { t: "متوسط", c: "#d9a441" };
  if (F < 0.25) return { t: "زیاد", c: "#e07b39" };
  return { t: "بسیار زیاد", c: "#c8553d" };
}

/* ---------- پیشنهاد جفت از گله ---------- */
function PairPlanner({ breeders }) {
  const alive = useMemo(() => breeders.filter((b) => !b.mortality), [breeders]);
  const ped = useMemo(() => buildPedigree(breeders), [breeders]);
  const [selId, setSelId] = useState("");
  const sel = alive.find((b) => b.id === selId);

  const rows = useMemo(() => {
    if (!sel) return [];
    return alive
      .filter((b) => b.id !== sel.id && b.sex !== sel.sex && (b.species || "") === (sel.species || ""))
      .map((b) => {
        const sire = sel.sex === "male" ? sel : b;
        const dam = sel.sex === "male" ? b : sel;
        return { b, F: ped.pairF(sire.id, dam.id), incomplete: ped.knownParents(b.id) === 0 || ped.knownParents(sel.id) === 0 };
      })
      .sort((x, y) => x.F - y.F);
  }, [sel, alive, ped]);

  if (alive.length === 0) return <Card><p className="text-sm text-[var(--text-secondary)]">هنوز مولدی در برنامه ثبت نکرده‌اید. بعد از ثبت مولدها، اینجا پیشنهاد جفت‌گیری می‌بینید.</p></Card>;

  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        یک مولد را انتخاب کنید. جفت‌های ممکن (جنس مخالف و هم‌گونه) از کمترین تا بیشترین همخونی نتاج مرتب می‌شوند. محاسبه از روی شجره ثبت‌شده (پدر و مادر) انجام می‌شود.
      </p>
      <Field label="مولد">
        <select className={inputCls} value={selId} onChange={(e) => setSelId(e.target.value)}>
          <option value="">— انتخاب کنید —</option>
          {alive.map((b) => (
            <option key={b.id} value={b.id}>
              {name(b)} ({b.sex === "male" ? "نر" : "ماده"})
            </option>
          ))}
        </select>
      </Field>

      {sel && (
        <div className="text-xs text-[var(--text-secondary)] leading-6">
          {speciesLabel(sel.species)}{sel.breed ? " — " + sel.breed : ""} · همخونی خود این پرنده: <b>{pct(ped.selfF(sel.id))}</b> · والدین ثبت‌شده: {ped.knownParents(sel.id)} از ۲
        </div>
      )}

      {sel && rows.length === 0 && (
        <p className="text-sm text-[var(--text-secondary)]">جفت مناسبی (جنس مخالف و هم‌گونه) در گله پیدا نشد.</p>
      )}

      {rows.map(({ b, F, incomplete }) => {
        const lv = level(F);
        return (
          <div key={b.id} className="rounded-lg border border-[var(--input-border)] p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold">{name(b)}</span>
              <span className="text-xs font-bold" style={{ color: lv.c }}>
                {pct(F)} — {lv.t}
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-1 flex flex-wrap gap-x-3">
              {b.breed && <span>{b.breed}</span>}
              {b.hatchPercent !== "" && b.hatchPercent != null && <span>هچ: {b.hatchPercent}٪</span>}
              {b.fertilityScore !== "" && b.fertilityScore != null && <span>باروری: {b.fertilityScore}/۱۰</span>}
              {incomplete && <span>شجره ناقص: همخونی احتمالاً کمتر از واقع برآورد شده</span>}
            </div>
          </div>
        );
      })}
      {sel && rows.length > 0 && (
        <p className="text-[11px] text-[var(--text-secondary)] leading-6">
          اعداد فقط بر پایه شجره ثبت‌شده‌اند. برای جفت‌گیری نهایی، سلامت، باروری و صفات هدف پرورش را هم در نظر بگیرید.
        </p>
      )}
    </Card>
  );
}

/* ---------- وضعیت گله ---------- */
function FlockStatus({ breeders }) {
  const alive = breeders.filter((b) => !b.mortality);
  const groups = {};
  alive.forEach((b) => {
    const k = b.species || "";
    groups[k] = groups[k] || { m: 0, f: 0 };
    if (b.sex === "male") groups[k].m++;
    else groups[k].f++;
  });
  const keys = Object.keys(groups);
  if (keys.length === 0) return <Card><p className="text-sm text-[var(--text-secondary)]">هنوز مولدی ثبت نشده است.</p></Card>;
  return (
    <div className="flex flex-col gap-3">
      {keys.map((k) => {
        const { m, f } = groups[k];
        const ok = m > 0 && f > 0;
        const ne = ok ? (4 * m * f) / (m + f) : NaN;
        const dF = ok ? 1 / (8 * m) + 1 / (8 * f) : NaN;
        const lv = level(dF * 4); // مقیاس هشدار برای ΔF
        return (
          <Card key={k}>
            <div className="text-sm font-bold mb-1">{speciesLabel(k)}</div>
            <div className="text-sm leading-8">
              <div>نر زنده: <b>{m}</b> — ماده زنده: <b>{f}</b></div>
              {ok ? (
                <>
                  <div>نسبت نر به ماده: <b>۱ : {(f / m).toFixed(1)}</b></div>
                  <div>اندازه مؤثر جمعیت (Ne): <b>{ne.toFixed(1)}</b></div>
                  <div>
                    افزایش همخونی هر نسل (ΔF): <b>{pct(dF)}</b>{" "}
                    <span style={{ color: dF > 0.03 ? "#c8553d" : dF > 0.01 ? "#d9a441" : "#2f9e6f" }}>
                      ({dF > 0.03 ? "خطر بالا" : dF > 0.01 ? "خطر متوسط" : "خطر پایین"})
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-[var(--text-secondary)]">برای محاسبه، هر دو جنس باید ثبت شده باشند.</div>
              )}
            </div>
          </Card>
        );
      })}
      <p className="text-[11px] text-[var(--text-secondary)] leading-6">
        فرمول: ΔF = 1/(8·Nm) + 1/(8·Nf). افزودن نر یا ماده غیرخویشاوند تازه، همخونی را سریع کاهش می‌دهد.
      </p>
    </div>
  );
}

/* ---------- ابزارهای قبلی ---------- */
function Response() {
  const [h2, setH2] = useState("0.4");
  const [mean, setMean] = useState("2000");
  const [sel, setSel] = useState("2400");
  const [unit, setUnit] = useState("گرم");
  const h = num(h2), m = num(mean), s = num(sel);
  const S = s - m;
  const R = h * S;
  const ok = !isNaN(h) && !isNaN(m) && !isNaN(s) && h >= 0 && h <= 1;
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        معادله پرورش‌دهنده: R = h² × S. میانگین کل گله و میانگین پرندگان انتخاب‌شده برای تولید مثل را وارد کنید تا پیشرفت نسل بعد برآورد شود.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Field label="وراثت‌پذیری h² (۰ تا ۱)"><input className={inputCls} inputMode="decimal" value={h2} onChange={(e) => setH2(e.target.value)} /></Field>
        <Field label="واحد"><input className={inputCls} value={unit} onChange={(e) => setUnit(e.target.value)} /></Field>
        <Field label="میانگین کل گله"><input className={inputCls} inputMode="decimal" value={mean} onChange={(e) => setMean(e.target.value)} /></Field>
        <Field label="میانگین انتخاب‌شده‌ها"><input className={inputCls} inputMode="decimal" value={sel} onChange={(e) => setSel(e.target.value)} /></Field>
      </div>
      {ok ? (
        <div className="text-sm leading-8">
          <div>تفاضل انتخاب (S): <b>{S.toFixed(1)}</b> {unit}</div>
          <div>پاسخ مورد انتظار (R): <b>{R.toFixed(1)}</b> {unit}</div>
          <div>میانگین نسل بعد: <b>{(m + R).toFixed(1)}</b> {unit}</div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-6">برآورد نظری است و به دقت h² و رکورد پرندگان بستگی دارد.</p>
        </div>
      ) : <p className="text-sm text-red-500">مقادیر را درست وارد کنید.</p>}
    </Card>
  );
}

function Pop() {
  const [nm, setNm] = useState("5");
  const [nf, setNf] = useState("40");
  const a = num(nm), b = num(nf);
  const ok = a > 0 && b > 0;
  const ne = ok ? (4 * a * b) / (a + b) : NaN;
  const dF = ok ? 1 / (8 * a) + 1 / (8 * b) : NaN;
  const risk = dF > 0.03 ? "بالا" : dF > 0.01 ? "متوسط" : "پایین";
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        برای برنامه‌ریزی: تعداد خروس و مرغ‌های مولد را فرضی وارد کنید تا اندازه مؤثر جمعیت و افزایش همخونی برآورد شود.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Field label="تعداد نر مولد"><input className={inputCls} inputMode="numeric" value={nm} onChange={(e) => setNm(e.target.value)} /></Field>
        <Field label="تعداد ماده مولد"><input className={inputCls} inputMode="numeric" value={nf} onChange={(e) => setNf(e.target.value)} /></Field>
      </div>
      {ok ? (
        <div className="text-sm leading-8">
          <div>نسبت نر به ماده: <b>۱ : {(b / a).toFixed(1)}</b></div>
          <div>اندازه مؤثر جمعیت (Ne): <b>{ne.toFixed(1)}</b></div>
          <div>افزایش همخونی در هر نسل (ΔF): <b>{(dF * 100).toFixed(2)}٪</b> — خطر: <b>{risk}</b></div>
        </div>
      ) : <p className="text-sm text-red-500">اعداد را بزرگ‌تر از صفر وارد کنید.</p>}
    </Card>
  );
}

const H2 = [
  ["وزن بدن", "۰٫۴ – ۰٫۶", "بالا"],
  ["وزن تخم", "۰٫۴ – ۰٫۶", "بالا"],
  ["سن بلوغ جنسی", "۰٫۲ – ۰٫۴", "متوسط"],
  ["ضخامت پوسته", "۰٫۲ – ۰٫۴", "متوسط"],
  ["ضریب تبدیل خوراک", "۰٫۲ – ۰٫۴", "متوسط"],
  ["تعداد تخم", "۰٫۱ – ۰٫۳", "پایین تا متوسط"],
  ["باروری", "۰٫۰۱ – ۰٫۱", "پایین"],
  ["جوجه‌درآوری", "۰٫۰۵ – ۰٫۲", "پایین"],
  ["زنده‌مانی", "۰٫۰۱ – ۰٫۱", "پایین"],
];

function H2Table() {
  return (
    <Card className="flex flex-col gap-2">
      <Table head={["صفت", "h² تقریبی", "سطح"]} rows={H2} />
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        مقادیر تقریبی و وابسته به نژاد و گله‌اند. صفات با h² بالا با انتخاب فردی سریع‌تر پیشرفت می‌کنند.
      </p>
    </Card>
  );
}

const TOOLS = [
  { id: "pair", label: "پیشنهاد جفت" },
  { id: "flock", label: "وضعیت گله" },
  { id: "resp", label: "پاسخ به انتخاب" },
  { id: "pop", label: "برنامه‌ریزی گله" },
  { id: "h2", label: "وراثت‌پذیری" },
];

export default function BreedingTool({ breeders = [] }) {
  const [t, setT] = useState("pair");
  return (
    <div className="flex flex-col gap-3">
      <Pills items={TOOLS} value={t} onChange={setT} />
      {t === "pair" && <PairPlanner breeders={breeders} />}
      {t === "flock" && <FlockStatus breeders={breeders} />}
      {t === "resp" && <Response />}
      {t === "pop" && <Pop />}
      {t === "h2" && <H2Table />}
    </div>
  );
                                   }
