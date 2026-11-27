import React, { useMemo, useState } from "react";
import { Card, Pills, Field, inputCls, Btn, Table } from "./knowledgeShared.jsx";
import { TRAIT_META, SPECIES } from "../lib/constants.js";
import {
  toNum, sampleVar, estimateH2, selectionIntensity, generationInterval, geneticGain,
} from "./quantEngine.js";
import QuantEbv from "./QuantEbv.jsx";

const TABS = [
  { id: "params", label: "پارامترها" },
  { id: "ebv", label: "ارزش اصلاحی (EBV)" },
  { id: "intensity", label: "شدت انتخاب" },
  { id: "gain", label: "پاسخ و پیشرفت سالانه" },
];

const numOr = (v, d) => {
  const x = toNum(v);
  return isFinite(x) ? x : d;
};
const f2 = (x) => (isFinite(x) ? x.toFixed(2) : "—");

function traitsFor(species) {
  const poultry = (species || "").startsWith("poultry");
  return Object.entries(TRAIT_META).filter(([k]) =>
    poultry ? k !== "milkProduction" : !["eggProduction", "hatchPercent"].includes(k)
  );
}

export default function QuantGenetics({ breeders = [] }) {
  const [species, setSpecies] = useState(() => {
    const c = {};
    breeders.forEach((b) => { c[b.species] = (c[b.species] || 0) + 1; });
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : "poultry_chicken";
  });
  const [trait, setTrait] = useState("weight");
  const [tab, setTab] = useState("params");
  const [h2Over, setH2Over] = useState("");
  const [spOver, setSpOver] = useState("");
  const [nm, setNm] = useState(""), [sm, setSm] = useState("");
  const [nf, setNf] = useState(""), [sf, setSf] = useState("");
  const [rmS, setRmS] = useState(""), [rfS, setRfS] = useState("");
  const [LmS, setLmS] = useState(""), [LfS, setLfS] = useState("");

  const traits = useMemo(() => traitsFor(species), [species]);
  const field = traits.some(([k]) => k === trait) ? trait : traits[0][0];
  const meta = TRAIT_META[field];

  const flock = useMemo(() => breeders.filter((b) => (b.species || "") === species), [breeders, species]);
  const alive = flock.filter((b) => !b.mortality);
  const nMales = alive.filter((b) => b.sex === "male").length;
  const nFemales = alive.filter((b) => b.sex === "female").length;

  const h2o = toNum(h2Over);
  const h2Own = h2o > 0 && h2o < 1;
  const h2 = h2Own ? h2o : meta.h2;

  const vals = useMemo(() => flock.map((b) => toNum(b[field])).filter((v) => isFinite(v)), [flock, field]);
  const meanY = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : NaN;
  const vp = vals.length >= 5 ? sampleVar(vals) : NaN;
  const sigP = numOr(spOver, isFinite(vp) ? Math.sqrt(vp) : NaN);
  const sigA = Math.sqrt(h2) * sigP;

  const est = useMemo(() => estimateH2(flock, field), [flock, field]);
  const gi = useMemo(() => generationInterval(flock), [flock]);

  // شدت انتخاب
  const Nm = numOr(nm, nMales), Nf = numOr(nf, nFemales);
  const Sm = numOr(sm, Math.max(1, Math.round(0.2 * Nm)));
  const Sf = numOr(sf, Math.max(1, Math.round(0.5 * Nf)));
  const pm = Nm > 0 && Sm > 0 && Sm <= Nm ? Sm / Nm : NaN;
  const pf = Nf > 0 && Sf > 0 && Sf <= Nf ? Sf / Nf : NaN;

  // پیشرفت
  const rDefault = Math.sqrt(h2);
  const rm = numOr(rmS, rDefault), rf = numOr(rfS, rDefault);
  const Lm = numOr(LmS, gi.Ls ?? NaN), Lf = numOr(LfS, gi.Ld ?? NaN);
  const gain = geneticGain({ pm, pf, rm, rf, Lm, Lf, sigmaA: sigA });
  const dirTxt = meta.inverse ? " (کاهش عدد، چون کمتر بهتر است)" : "";

  const pctOfMean = (x) => (isFinite(meanY) && meanY !== 0 ? " ≈ " + ((x / meanY) * 100).toFixed(1) + "٪ از میانگین" : "");

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-col gap-3">
        <Field label="گونه">
          <select className={inputCls} value={species} onChange={(e) => { setSpecies(e.target.value); setH2Over(""); setSpOver(""); }}>
            {SPECIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="صفت">
          <select className={inputCls} value={field} onChange={(e) => { setTrait(e.target.value); setH2Over(""); setSpOver(""); }}>
            {traits.map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </select>
        </Field>
        <div className="text-[11px] text-[var(--text-secondary)] leading-6">
          {flock.length} پرنده از این گونه، {vals.length} رکورد برای این صفت.
        </div>
      </Card>

      <Pills items={TABS} value={tab} onChange={setTab} />

      {tab === "params" && (
        <>
          <Card className="flex flex-col gap-2">
            <div className="text-sm font-bold">
              h² در محاسبات: {h2.toFixed(2)}{" "}
              <span className="text-xs font-normal" style={{ color: h2Own ? "#2f9e6f" : "#d9a441" }}>
                ({h2Own ? "واردشده توسط شما" : "مقدار فرضی پیش‌فرض برنامه"})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="h² دلخواه (۰ تا ۱)">
                <input className={inputCls} inputMode="decimal" placeholder={String(meta.h2)} value={h2Over} onChange={(e) => setH2Over(e.target.value)} />
              </Field>
              <Field label="انحراف معیار فنوتیپی σp">
                <input className={inputCls} inputMode="decimal" placeholder={isFinite(vp) ? Math.sqrt(vp).toFixed(2) : "—"} value={spOver} onChange={(e) => setSpOver(e.target.value)} />
              </Field>
            </div>
            <div className="text-xs leading-7 text-[var(--text-secondary)]">
              {isFinite(sigP) ? (
                <>
                  σp² = {f2(sigP * sigP)} · σa² (افزایشی) = {f2(h2 * sigP * sigP)} · σe² = {f2((1 - h2) * sigP * sigP)} · σa = {f2(sigA)} {meta.unit}
                </>
              ) : (
                "برای محاسبه واریانس‌ها حداقل ۵ رکورد لازم است یا σp را وارد کنید."
              )}
            </div>
          </Card>

          <Card className="flex flex-col gap-2">
            <div className="text-sm font-bold">برآورد h² از داده‌های گله</div>
            <Table
              head={["روش", "تعداد جفت", "h²", "خطای معیار"]}
              rows={est.map((e) => [e.name, e.n, e.h2 == null ? "اطلاعات کافی نیست" : e.h2.toFixed(2), e.se == null ? "—" : e.se.toFixed(2)])}
            />
            <div className="flex flex-wrap gap-2">
              {est
                .filter((e) => e.h2 != null && e.h2 > 0.02 && e.h2 < 0.98)
                .map((e) => (
                  <Btn key={e.name} onClick={() => setH2Over(e.h2.toFixed(2))}>استفاده از {e.h2.toFixed(2)} ({e.name})</Btn>
                ))}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-6">
              رگرسیون نتاج بر والدین به محیط مشترک و اثر مادری حساس است (به‌خصوص روش مادر). با کمتر از ۳۰ جفت، خطای معیار بزرگ است؛ برآورد خارج از ۰ تا ۱ یعنی داده کم یا محیط نامتعادل است. وراثت‌پذیری معتبر معمولاً از مقالات یا برآورد روی گله بزرگ می‌آید.
            </p>
          </Card>
        </>
      )}

      {tab === "ebv" && <QuantEbv flock={flock} field={field} meta={meta} h2={h2} />}

      {tab === "intensity" && (
        <Card className="flex flex-col gap-3">
          <p className="text-xs text-[var(--text-secondary)] leading-6">
            شدت انتخاب (i) از نسبت انتخاب‌شده‌ها به کل کاندیدها به دست می‌آید. هرچه نسبت کمتر باشد، i بیشتر است. مقادیر خالی از گله خوانده می‌شود (نر و ماده زنده).
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="نرهای کاندید">
              <input className={inputCls} inputMode="numeric" placeholder={String(nMales)} value={nm} onChange={(e) => setNm(e.target.value)} />
            </Field>
            <Field label="نرهای انتخاب‌شده">
              <input className={inputCls} inputMode="numeric" placeholder={String(Math.max(1, Math.round(0.2 * Nm)))} value={sm} onChange={(e) => setSm(e.target.value)} />
            </Field>
            <Field label="ماده‌های کاندید">
              <input className={inputCls} inputMode="numeric" placeholder={String(nFemales)} value={nf} onChange={(e) => setNf(e.target.value)} />
            </Field>
            <Field label="ماده‌های انتخاب‌شده">
              <input className={inputCls} inputMode="numeric" placeholder={String(Math.max(1, Math.round(0.5 * Nf)))} value={sf} onChange={(e) => setSf(e.target.value)} />
            </Field>
          </div>
          <div className="text-sm leading-8">
            <div>نرها: نسبت <b>{isFinite(pm) ? (pm * 100).toFixed(1) + "٪" : "—"}</b> ← i = <b>{f2(selectionIntensity(pm))}</b></div>
            <div>ماده‌ها: نسبت <b>{isFinite(pf) ? (pf * 100).toFixed(1) + "٪" : "—"}</b> ← i = <b>{f2(selectionIntensity(pf))}</b></div>
          </div>
          {(Nm < 20 || Nf < 20) && (
            <p className="text-[11px] text-[#c8553d] leading-6">
              با کمتر از ۲۰ کاندید، شدت انتخاب واقعی کمی کمتر از مقدار نظری است (فرمول برای جمعیت بزرگ است).
            </p>
          )}
        </Card>
      )}

      {tab === "gain" && (
        <Card className="flex flex-col gap-3">
          <p className="text-xs text-[var(--text-secondary)] leading-6">
            R در هر نسل = (i نر × r نر + i ماده × r ماده) ÷ ۲ × σa . پیشرفت سالانه = (i نر × r نر + i ماده × r ماده) × σa ÷ (L نر + L ماده). شدت انتخاب از تب قبلی می‌آید. دقت انتخاب پیش‌فرض √h² است (انتخاب بر پایه رکورد خود پرنده)؛ اگر EBV دارید، میانگین دقت آن را وارد کنید.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="دقت انتخاب نرها (r)">
              <input className={inputCls} inputMode="decimal" placeholder={f2(rDefault)} value={rmS} onChange={(e) => setRmS(e.target.value)} />
            </Field>
            <Field label="دقت انتخاب ماده‌ها (r)">
              <input className={inputCls} inputMode="decimal" placeholder={f2(rDefault)} value={rfS} onChange={(e) => setRfS(e.target.value)} />
            </Field>
            <Field label="فاصله نسلی نر (سال)">
              <input className={inputCls} inputMode="decimal" placeholder={gi.Ls != null ? gi.Ls.toFixed(2) : "وارد کنید"} value={LmS} onChange={(e) => setLmS(e.target.value)} />
            </Field>
            <Field label="فاصله نسلی ماده (سال)">
              <input className={inputCls} inputMode="decimal" placeholder={gi.Ld != null ? gi.Ld.toFixed(2) : "وارد کنید"} value={LfS} onChange={(e) => setLfS(e.target.value)} />
            </Field>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] leading-6">
            فاصله نسلی از تاریخ تولد والدین و نتاج گله: نر {gi.Ls != null ? gi.Ls.toFixed(2) + " سال (" + gi.ns + " مورد)" : "داده کافی نیست"} ، ماده {gi.Ld != null ? gi.Ld.toFixed(2) + " سال (" + gi.nd + " مورد)" : "داده کافی نیست"}.
          </div>

          {gain ? (
            <div className="text-sm leading-8">
              <div>i نر = <b>{f2(gain.im)}</b> ، i ماده = <b>{f2(gain.if)}</b></div>
              <div>
                پیشرفت مورد انتظار هر نسل (R): <b>{f2(gain.perGen)}</b> {meta.unit}
                {dirTxt}
                <span className="text-xs text-[var(--text-secondary)]">{pctOfMean(gain.perGen)}</span>
              </div>
              <div>
                پیشرفت ژنتیکی سالانه: <b style={{ color: "#2f9e6f" }}>{f2(gain.perYear)}</b> {meta.unit} در سال
                {dirTxt}
                <span className="text-xs text-[var(--text-secondary)]">{pctOfMean(gain.perYear)}</span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] leading-6 mt-1">
                برآورد آموزشی بر پایه h² ({h2Own ? "واردشده" : "فرضی"}) و σp از داده‌های گله است، نه پیش‌بینی قطعی. فرض‌ها: انتخاب بدون همخونی زیاد، واریانس ژنتیکی ثابت و نبود تغییر محیط.
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-secondary)] leading-7">
              اطلاعات کافی نیست: نسبت انتخاب، فاصله نسلی و σp باید مشخص باشند (فاصله نسلی و σp را دستی هم می‌توانید وارد کنید).
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
