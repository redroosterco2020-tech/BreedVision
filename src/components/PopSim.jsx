import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, Pills, Field, inputCls, Btn, Table } from "./knowledgeShared.jsx";
import { TRAIT_META, SPECIES } from "../lib/constants.js";
import { toNum, sampleVar, generationInterval } from "./quantEngine.js";
import { simulatePopulation, simCost, SIM_MAX_N, SIM_MAX_COST } from "./popSim.js";

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

function validate(P) {
  if (!isFinite(P.mu)) return "میانگین صفت را وارد کنید (یا برای این صفت حداقل ۵ رکورد ثبت کنید).";
  if (!(P.sigP > 0)) return "انحراف معیار فنوتیپی (σp) را وارد کنید.";
  if (!(P.h2 > 0 && P.h2 < 1)) return "h² باید بین ۰ و ۱ باشد.";
  if (P.Nm < 2 || P.Nf < 2 || P.Nm + P.Nf > SIM_MAX_N)
    return "تعداد نر و ماده هر کدام حداقل ۲ و مجموع آن‌ها حداکثر " + SIM_MAX_N + " باشد.";
  if (P.Sm < 1 || P.Sm > P.Nm || P.Sf < 1 || P.Sf > P.Nf) return "تعداد انتخاب‌شده‌ها باید بین ۱ و تعداد کاندیدها باشد.";
  if (!(P.r > 0 && P.r <= 1)) return "دقت انتخاب باید بین ۰ و ۱ باشد.";
  if (P.gens < 1 || P.gens > 20) return "تعداد نسل‌ها بین ۱ و ۲۰ باشد.";
  if (P.reps < 1 || P.reps > 30) return "تعداد تکرار بین ۱ و ۳۰ باشد.";
  if (simCost(P) > SIM_MAX_COST) return "حجم محاسبه زیاد است؛ تعداد نسل، تکرار یا اندازه گله را کم کنید.";
  return "";
}

function buildView(res, prev) {
  const rows = res.rows;
  const G = rows.length - 1;
  const dir = res.inverse ? -1 : 1;
  const Fg = rows[G].F;
  const total = dir * (rows[G].y - rows[0].y);
  return {
    G,
    gain1: rows[1].meanA - rows[0].meanA,
    total,
    perYear: total / (G * res.L),
    Fg,
    dFsim: 1 - Math.pow(1 - Fg, 1 / G),
    sdRatio: rows[0].sdA > 0 ? rows[G].sdA / rows[0].sdA : NaN,
    data: rows.map((r, i) => ({
      g: r.g,
      y: +r.y.toFixed(3),
      lo: +(r.y - r.ySd).toFixed(3),
      hi: +(r.y + r.ySd).toFixed(3),
      F: +(r.F * 100).toFixed(2),
      sdA: +r.sdA.toFixed(3),
      yPrev: prev && prev.rows[i] ? +prev.rows[i].y.toFixed(3) : undefined,
      FPrev: prev && prev.rows[i] ? +(prev.rows[i].F * 100).toFixed(2) : undefined,
    })),
  };
}

function Chart({ data, lines, height = 210 }) {
  return (
    <div dir="ltr" className="text-[var(--text-secondary)]">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
          <XAxis dataKey="g" tick={{ fontSize: 10, fill: "currentColor" }} />
          <YAxis tick={{ fontSize: 10, fill: "currentColor" }} domain={["auto", "auto"]} width={44} />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {lines.map((l) => (
            <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={l.w || 2} strokeDasharray={l.dash} dot={false} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function PopSim({ breeders = [] }) {
  const [species, setSpecies] = useState(() => {
    const c = {};
    breeders.forEach((b) => { c[b.species] = (c[b.species] || 0) + 1; });
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : "poultry_chicken";
  });
  const [trait, setTrait] = useState("weight");
  const [f, setF] = useState({});
  const [mate, setMate] = useState("random");
  const [seed, setSeed] = useState(0);
  const [res, setRes] = useState(null);
  const [prev, setPrev] = useState(null);
  const [err, setErr] = useState("");

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const traits = useMemo(() => traitsFor(species), [species]);
  const field = traits.some(([k]) => k === trait) ? trait : traits[0][0];
  const meta = TRAIT_META[field];

  const flock = useMemo(() => breeders.filter((b) => (b.species || "") === species), [breeders, species]);
  const alive = flock.filter((b) => !b.mortality);
  const nMales = alive.filter((b) => b.sex === "male").length;
  const nFemales = alive.filter((b) => b.sex === "female").length;
  const vals = useMemo(() => flock.map((b) => toNum(b[field])).filter((v) => isFinite(v)), [flock, field]);
  const meanY = vals.length >= 5 ? vals.reduce((a, b) => a + b, 0) / vals.length : NaN;
  const sdY = vals.length >= 5 ? Math.sqrt(sampleVar(vals)) : NaN;
  const gi = useMemo(() => generationInterval(flock), [flock]);
  const Ldef = gi.Ls != null && gi.Ld != null ? (gi.Ls + gi.Ld) / 2 : 1;

  const dNm = nMales > 1 ? nMales : 10;
  const dNf = nFemales > 1 ? nFemales : 40;
  const h2v = numOr(f.h2, meta.h2);

  function run() {
    const nm = Math.round(numOr(f.Nm, dNm));
    const nf = Math.round(numOr(f.Nf, dNf));
    const P = {
      mu: numOr(f.mu, meanY),
      sigP: numOr(f.sigP, sdY),
      h2: h2v,
      Nm: nm,
      Nf: nf,
      Sm: Math.round(numOr(f.Sm, Math.max(1, Math.round(0.2 * nm)))),
      Sf: Math.round(numOr(f.Sf, Math.max(1, Math.round(0.5 * nf)))),
      r: numOr(f.r, Math.sqrt(h2v)),
      gens: Math.round(numOr(f.gens, 10)),
      reps: Math.round(numOr(f.reps, 20)),
      avoidKin: mate === "avoid",
      depression: numOr(f.D, 0),
      inverse: meta.inverse,
    };
    const msg = validate(P);
    if (msg) { setErr(msg); return; }
    setErr("");
    const s = seed + 1;
    setSeed(s);
    const out = simulatePopulation({ ...P, seed: s * 1000 });
    setPrev(res);
    setRes({ ...out, P, label: meta.label, unit: meta.unit, inverse: meta.inverse, L: numOr(f.L, Ldef) });
  }

  const view = res ? buildView(res, prev) : null;
  const yLines = [
    { key: "y", name: "میانگین", color: "#2f9e6f" },
    { key: "lo", name: "−۱ انحراف", color: "#2f9e6f", dash: "4 3", w: 1 },
    { key: "hi", name: "+۱ انحراف", color: "#2f9e6f", dash: "4 3", w: 1 },
  ];
  if (prev) yLines.push({ key: "yPrev", name: "اجرای قبلی", color: "#9b6fd1" });
  const fLines = [{ key: "F", name: "همخونی ٪", color: "#c8553d" }];
  if (prev) fLines.push({ key: "FPrev", name: "اجرای قبلی", color: "#9b6fd1" });

  const inp = (k, label, ph) => (
    <Field label={label}>
      <input className={inputCls} inputMode="decimal" placeholder={ph} value={f[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
    </Field>
  );

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-col gap-3">
        <Field label="گونه">
          <select className={inputCls} value={species} onChange={(e) => { setSpecies(e.target.value); setRes(null); setPrev(null); }}>
            {SPECIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="صفت">
          <select className={inputCls} value={field} onChange={(e) => { setTrait(e.target.value); setRes(null); setPrev(null); }}>
            {traits.map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </select>
        </Field>
        <p className="text-[11px] text-[var(--text-secondary)] leading-6">
          مقادیر خالی از گله خوانده می‌شوند (میانگین و σp از رکوردها، تعداد نر و ماده از مولدهای زنده). h² پیش‌فرض فرضی است.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {inp("mu", `میانگین صفت (${meta.unit || "واحد"})`, isFinite(meanY) ? meanY.toFixed(2) : "وارد کنید")}
          {inp("sigP", "انحراف معیار فنوتیپی σp", isFinite(sdY) ? sdY.toFixed(2) : "وارد کنید")}
          {inp("h2", "h²", String(meta.h2))}
          {inp("r", "دقت انتخاب r", f2(Math.sqrt(h2v)))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="text-sm font-bold">برنامه انتخاب در هر نسل</div>
        <div className="grid grid-cols-2 gap-2">
          {inp("Nm", "نرهای کاندید", String(dNm))}
          {inp("Nf", "ماده‌های کاندید", String(dNf))}
          {inp("Sm", "نرهای انتخاب‌شده", String(Math.max(1, Math.round(0.2 * numOr(f.Nm, dNm)))))}
          {inp("Sf", "ماده‌های انتخاب‌شده", String(Math.max(1, Math.round(0.5 * numOr(f.Nf, dNf)))))}
          {inp("gens", "تعداد نسل (حداکثر ۲۰)", "10")}
          {inp("reps", "تعداد تکرار (حداکثر ۳۰)", "20")}
          {inp("L", "فاصله نسلی (سال)", f2(Ldef))}
          {inp("D", "افت همخونی (٪ به‌ازای ۱۰٪ همخونی)", "0")}
        </div>
        <Pills
          items={[{ id: "random", label: "جفت‌گیری تصادفی" }, { id: "avoid", label: "اجتناب از خویشاوند نزدیک" }]}
          value={mate}
          onChange={setMate}
        />
        {err && <p className="text-sm text-[#c8553d] leading-7">{err}</p>}
        <div className="flex gap-2">
          <Btn onClick={run}>اجرای شبیه‌سازی</Btn>
          {prev && <Btn onClick={() => setPrev(null)}>پاک کردن مقایسه</Btn>}
        </div>
        <p className="text-[11px] text-[var(--text-secondary)] leading-6">
          هر بار اجرا، اجرای قبلی روی نمودار برای مقایسه می‌ماند (مثلاً ۲۰٪ انتخاب در برابر ۱۰٪). افت همخونی را فقط اگر از گله یا مقاله می‌دانید وارد کنید.
        </p>
      </Card>

      {res && view && (
        <>
          <Card className="flex flex-col gap-1 text-sm leading-7">
            <div className="font-bold">خلاصه ({res.label})</div>
            <div>
              پیشرفت نسل اول: شبیه‌سازی <b>{f2(view.gain1)}</b> در برابر نظری <b>{f2(res.theory.R1)}</b> {res.unit}
              <span className="text-[11px] text-[var(--text-secondary)]"> (در جمعیت محدود کمی کمتر از نظری طبیعی است)</span>
            </div>
            <div>
              پس از {view.G} نسل: میانگین از <b>{f2(res.rows[0].y)}</b> به <b>{f2(res.rows[view.G].y)}</b> {res.unit}
              {" "}— بهبود <b style={{ color: view.total >= 0 ? "#2f9e6f" : "#c8553d" }}>{f2(view.total)}</b>
              {res.inverse ? " (کاهش عدد، چون کمتر بهتر است)" : ""}
            </div>
            <div>پیشرفت سالانه تقریبی: <b>{f2(view.perYear)}</b> {res.unit} در سال</div>
            <div>
              همخونی نسل آخر: <b style={{ color: view.Fg > 0.1 ? "#c8553d" : undefined }}>{(view.Fg * 100).toFixed(1)}٪</b>
              {" "}— افزایش هر نسل: {(view.dFsim * 100).toFixed(2)}٪ (نظری تقریبی: {(res.theory.dF * 100).toFixed(2)}٪)
            </div>
            <div>واریانس ژنتیکی: انحراف معیار ژنتیکی به <b>{isFinite(view.sdRatio) ? Math.round(view.sdRatio * 100) : "—"}٪</b> مقدار اولیه رسیده</div>
            {view.Fg > 0.1 && (
              <div className="text-xs text-[#c8553d] leading-6">
                همخونی بالای ۱۰٪ است؛ تعداد والدین را بیشتر کنید، «اجتناب از خویشاوند نزدیک» را امتحان کنید یا مولد غیرخویشاوند وارد گله کنید.
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-1">
            <div className="text-sm font-bold">میانگین صفت در نسل‌ها</div>
            <Chart data={view.data} lines={yLines} />
            <p className="text-[11px] text-[var(--text-secondary)] leading-6">
              خطوط نقطه‌چین انحراف معیار بین تکرارها هستند (عدم قطعیت تصادفی).
            </p>
          </Card>

          <Card className="flex flex-col gap-1">
            <div className="text-sm font-bold">همخونی (٪)</div>
            <Chart data={view.data} lines={fLines} />
          </Card>

          <Card className="flex flex-col gap-1">
            <div className="text-sm font-bold">انحراف معیار ژنتیکی</div>
            <Chart data={view.data} lines={[{ key: "sdA", name: "σa", color: "#4a90d9" }]} />
            <p className="text-[11px] text-[var(--text-secondary)] leading-6">
              کاهش آن در اثر انتخاب (اثر بالمر) و رانش ژنتیکی است و پیشرفت نسل‌های بعد را کند می‌کند.
            </p>
          </Card>

          <Card>
            <Table
              head={["نسل", "سال", "میانگین ± انحراف", "همخونی", "σa"]}
              rows={res.rows.map((r) => [
                r.g,
                (r.g * res.L).toFixed(1),
                f2(r.y) + " ± " + f2(r.ySd),
                (r.F * 100).toFixed(1) + "٪",
                f2(r.sdA),
              ])}
            />
          </Card>
        </>
      )}

      <p className="text-[11px] text-[var(--text-secondary)] leading-6">
        برآورد آموزشی: مدل افزایشی با ژن‌های بسیار، نسل‌های جدا، بدون پیوستگی ژنی، اپیستازی و اثر مادری، با واریانس محیطی ثابت. نتیجه واقعی به داده‌ها، مدیریت و محیط شما بستگی دارد و پیش‌بینی قطعی نیست.
      </p>
    </div>
  );
}
