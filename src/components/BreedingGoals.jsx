import React, { useMemo, useState } from "react";
import { Card, Field, inputCls } from "./knowledgeShared.jsx";
import { ALL_GOALS, TRAIT_META } from "../lib/constants.js";

const num = (v) => parseFloat(String(v).replace(",", "."));

function speed(h) {
  if (h >= 0.3) return { t: "پاسخ سریع به انتخاب فردی", c: "#2f9e6f" };
  if (h >= 0.2) return { t: "پاسخ متوسط", c: "#d9a441" };
  return { t: "پاسخ کند؛ مدیریت و انتخاب خانوادگی هم لازم است", c: "#c8553d" };
}

export function GoalHeritability({ breeders = [], goalWeights = {} }) {
  const [h2Over, setH2Over] = useState({});
  const [selMean, setSelMean] = useState({});

  const rows = useMemo(() => {
    const byField = {};
    Object.entries(goalWeights || {}).forEach(([gid, w]) => {
      const weight = Number(w);
      const g = ALL_GOALS.find((x) => x.id === gid);
      if (!g || !(weight > 0) || !TRAIT_META[g.field]) return;
      const f = g.field;
      byField[f] = byField[f] || { field: f, weight: 0, meta: TRAIT_META[f] };
      byField[f].weight += weight;
    });
    const alive = breeders.filter((b) => !b.mortality);
    return Object.values(byField)
      .map((r) => {
        const vals = alive.map((b) => num(b[r.field])).filter((v) => isFinite(v));
        const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        return { ...r, mean, n: vals.length };
      })
      .sort((a, b) => b.weight - a.weight);
  }, [goalWeights, breeders]);

  const totalW = rows.reduce((s, r) => s + r.weight, 0);

  if (rows.length === 0)
    return (
      <Card>
        <p className="text-sm text-[var(--text-secondary)] leading-7">
          هنوز هدف اصلاح نژادی با وزن بیشتر از صفر تعیین نکرده‌اید. به تب «اهداف اصلاح نژاد» بروید و اهمیت هر هدف را مشخص کنید تا اینجا وراثت‌پذیری آن‌ها را ببینید.
        </p>
      </Card>
    );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        برای هر هدف اصلاح نژاد شما، وراثت‌پذیری (h²) نشان می‌دهد انتخاب فردی چقدر سریع جواب می‌دهد. h² پیش‌فرض تقریبی است؛ اگر عدد دقیق‌تری برای گله خود دارید، آن را جایگزین کنید.
      </p>

      {rows.map((r) => {
        const o = num(h2Over[r.field]);
        const h = isFinite(o) && o >= 0 && o <= 1 ? o : r.meta.h2;
        const sp = speed(h);
        const share = totalW ? Math.round((r.weight / totalW) * 100) : 0;
        const sm = num(selMean[r.field]);
        const hasSel = isFinite(sm) && r.mean !== null;
        const R = hasSel ? h * (sm - r.mean) : null;
        const better = R === null ? null : r.meta.inverse ? R < 0 : R > 0;
        const warn = share >= 30 && h < 0.2;
        return (
          <Card key={r.field} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold">{r.meta.label}</span>
              <span className="text-xs text-[var(--accent)] font-bold">سهم در اهداف: {share}٪</span>
            </div>

            <div className="text-xs leading-6">
              <span style={{ color: sp.c }} className="font-bold">
                h² = {h.toFixed(2)} — {sp.t}
              </span>
              {r.meta.inverse && <span className="text-[var(--text-secondary)]"> (برای این صفت کمتر بهتر است)</span>}
            </div>

            {warn && (
              <div className="text-xs leading-6 text-[#c8553d]">
                وزن زیادی روی صفتی با وراثت‌پذیری پایین گذاشته‌اید. انتظار پیشرفت سریع با انتخاب فردی نداشته باشید و به مدیریت، تغذیه و رکوردگیری از خانواده‌ها هم توجه کنید.
              </div>
            )}

            <div className="text-xs text-[var(--text-secondary)] leading-6">
              {r.mean !== null
                ? `میانگین گله: ${r.mean.toFixed(2)} ${r.meta.unit} (از ${r.n} مولد زنده)`
                : "برای این صفت هنوز در مولدها داده‌ای ثبت نشده است."}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="h² اصلاح‌شده (اختیاری)">
                <input
                  className={inputCls}
                  inputMode="decimal"
                  placeholder={String(r.meta.h2)}
                  value={h2Over[r.field] || ""}
                  onChange={(e) => setH2Over({ ...h2Over, [r.field]: e.target.value })}
                />
              </Field>
              <Field label="میانگین انتخاب‌شده‌ها">
                <input
                  className={inputCls}
                  inputMode="decimal"
                  value={selMean[r.field] || ""}
                  onChange={(e) => setSelMean({ ...selMean, [r.field]: e.target.value })}
                />
              </Field>
            </div>

            {hasSel && (
              <div className="text-sm leading-7">
                پیشرفت مورد انتظار نسل بعد: <b>{R.toFixed(2)}</b> {r.meta.unit} — میانگین نسل بعد حدود <b>{(r.mean + R).toFixed(2)}</b>
                <div className="text-xs font-bold" style={{ color: R === 0 ? "inherit" : better ? "#2f9e6f" : "#c8553d" }}>
                  {R === 0 ? "بدون تغییر" : better ? "در جهت هدف شما" : "خلاف جهت هدف؛ انتخاب‌شده‌ها را بازبینی کنید"}
                </div>
              </div>
            )}
          </Card>
        );
      })}
      <p className="text-[11px] text-[var(--text-secondary)] leading-6">
        فرمول: R = h² × S، که S تفاوت میانگین انتخاب‌شده‌ها با میانگین کل گله است. برآورد نظری است و به دقت h² و رکوردها بستگی دارد.
      </p>
    </div>
  );
  }
