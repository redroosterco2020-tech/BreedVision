import React, { useMemo, useState } from "react";
import { Card, Field, inputCls } from "./knowledgeShared.jsx";
import { buildPedigree } from "./pedigree.js";
import { SPECIES } from "../lib/constants.js";

const pct = (x) => (x * 100).toFixed(2) + "٪";
const name = (b) => (b.tag || "") + (b.tag && b.name ? " — " : "") + (b.name || "");
const speciesLabel = (id) => (SPECIES || []).find((s) => s.id === id)?.label || id || "نامشخص";

function level(F) {
  if (F < 0.0625) return { t: "کم", c: "#2f9e6f" };
  if (F < 0.125) return { t: "متوسط", c: "#d9a441" };
  if (F < 0.25) return { t: "زیاد", c: "#e07b39" };
  return { t: "بسیار زیاد", c: "#c8553d" };
}

export function PairPlanner({ breeders }) {
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
        return {
          b,
          F: ped.pairF(sire.id, dam.id),
          incomplete: ped.knownParents(b.id) === 0 || ped.knownParents(sel.id) === 0,
        };
      })
      .sort((x, y) => x.F - y.F);
  }, [sel, alive, ped]);

  if (alive.length === 0)
    return (
      <Card>
        <p className="text-sm text-[var(--text-secondary)]">
          هنوز مولدی در برنامه ثبت نکرده‌اید. بعد از ثبت مولدها، اینجا پیشنهاد جفت‌گیری می‌بینید.
        </p>
      </Card>
    );

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
          {speciesLabel(sel.species)}
          {sel.breed ? " — " + sel.breed : ""} · همخونی خود این پرنده: <b>{pct(ped.selfF(sel.id))}</b> · والدین ثبت‌شده: {ped.knownParents(sel.id)} از ۲
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

export function FlockStatus({ breeders }) {
  const alive = breeders.filter((b) => !b.mortality);
  const groups = {};
  alive.forEach((b) => {
    const k = b.species || "";
    groups[k] = groups[k] || { m: 0, f: 0 };
    if (b.sex === "male") groups[k].m++;
    else groups[k].f++;
  });
  const keys = Object.keys(groups);
  if (keys.length === 0)
    return (
      <Card>
        <p className="text-sm text-[var(--text-secondary)]">هنوز مولدی ثبت نشده است.</p>
      </Card>
    );

  return (
    <div className="flex flex-col gap-3">
      {keys.map((k) => {
        const { m, f } = groups[k];
        const ok = m > 0 && f > 0;
        const ne = ok ? (4 * m * f) / (m + f) : NaN;
        const dF = ok ? 1 / (8 * m) + 1 / (8 * f) : NaN;
        return (
          <Card key={k}>
            <div className="text-sm font-bold mb-1">{speciesLabel(k)}</div>
            <div className="text-sm leading-8">
              <div>
                نر زنده: <b>{m}</b> — ماده زنده: <b>{f}</b>
              </div>
              {ok ? (
                <>
                  <div>
                    نسبت نر به ماده: <b>۱ : {(f / m).toFixed(1)}</b>
                  </div>
                  <div>
                    اندازه مؤثر جمعیت (Ne): <b>{ne.toFixed(1)}</b>
                  </div>
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
