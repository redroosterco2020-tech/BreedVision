import React, { useMemo, useState } from "react";
import { Card, Pills, Field, inputCls, Btn } from "./knowledgeShared.jsx";
import { TRAIT_META, SPECIES, ALL_GOALS } from "../lib/constants.js";
import { toNum, sampleVar, selectionIntensity } from "./quantEngine.js";
import { phenCorr, hazelIndex, indexResponse, singleEfficiency, indexScores, ebvMerit } from "./selIndex.js";

const MAX_TRAITS = 5;
const numOr = (v, d) => {
  const x = toNum(v);
  return isFinite(x) ? x : d;
};
const f2 = (x) => (isFinite(x) ? x.toFixed(2) : "—");
const nameOf = (b) => (b.tag || "") + (b.tag && b.name ? " — " : "") + (b.name || "");

const SEX = [
  { id: "all", label: "همه" },
  { id: "male", label: "نرها" },
  { id: "female", label: "ماده‌ها" },
];
const METHODS = [
  { id: "hazel", label: "شاخص فنوتیپی (هیزل)" },
  { id: "ebv", label: "شاخص بر پایه EBV" },
];
const ERR = {
  P: "ماتریس همبستگی فنوتیپی معتبر نیست (داده کم یا همبستگی‌های ناسازگار).",
  G: "همبستگی‌های ژنتیکی واردشده غیرممکن هستند؛ مقدارها را کوچک‌تر کنید.",
  zero: "اهمیت صفات یا واریانس‌ها طوری است که شاخص صفر می‌شود.",
  records: "برای یکی از صفات کمتر از ۵ رکورد وجود دارد.",
  size: "تعداد پرنده‌ها برای محاسبه EBV بیش از حد مجاز (۳۰۰) است.",
  h2: "h² باید بین ۰ و ۱ باشد.",
  variance: "همه رکوردهای یکی از صفات یکسان‌اند.",
  singular: "محاسبه ممکن نشد؛ شجره ناسازگار است.",
};

function traitsFor(species) {
  const poultry = (species || "").startsWith("poultry");
  return Object.entries(TRAIT_META).filter(([k]) =>
    poultry ? k !== "milkProduction" : !["eggProduction", "hatchPercent"].includes(k)
  );
}

function RankList({ rows, byId, k, showAll, setShowAll, extra }) {
  const shown = showAll ? rows : rows.slice(0, 15);
  return (
    <div className="flex flex-col gap-2">
      {shown.map((r, i) => {
        const b = byId.get(r.id);
        if (!b) return null;
        const sel = i < k;
        return (
          <Card key={r.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold">{i + 1}. {nameOf(b)}</span>
              <span className="text-sm font-bold" dir="ltr" style={{ color: sel ? "#2f9e6f" : undefined }}>
                {r.score > 0 ? "+" : ""}{r.score.toFixed(2)}
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] flex flex-wrap gap-x-3">
              <span>{b.sex === "male" ? "نر" : "ماده"}</span>
              {sel && <span style={{ color: "#2f9e6f" }}>در گروه انتخاب‌شده</span>}
              {extra && extra(r)}
            </div>
          </Card>
        );
      })}
      {rows.length > 15 && <Btn onClick={() => setShowAll(!showAll)}>{showAll ? "نمایش ۱۵ مورد اول" : "نمایش همه"}</Btn>}
    </div>
  );
}

export default function QuantIndex({ breeders = [], goalWeights = {} }) {
  const [species, setSpecies] = useState(() => {
    const c = {};
    breeders.forEach((b) => { c[b.species] = (c[b.species] || 0) + 1; });
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : "poultry_chicken";
  });
  const [method, setMethod] = useState("hazel");
  const [w, setW] = useState({});
  const [h, setH] = useState({});
  const [rg, setRg] = useState({});
  const [pS, setPS] = useState("20");
  const [sexF, setSexF] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const flock = useMemo(() => breeders.filter((b) => (b.species || "") === species), [breeders, species]);
  const byId = useMemo(() => new Map(flock.map((b) => [b.id, b])), [flock]);
  const goalByField = useMemo(() => {
    const m = {};
    Object.entries(goalWeights || {}).forEach(([gid, v]) => {
      const g = ALL_GOALS.find((x) => x.id === gid);
      if (g && Number(v) > 0) m[g.field] = (m[g.field] || 0) + Number(v);
    });
    return m;
  }, [goalWeights]);

  const info = traitsFor(species).map(([k, meta]) => {
    const vals = flock.map((b) => toNum(b[k])).filter((v) => isFinite(v));
    const vp = vals.length >= 5 ? sampleVar(vals) : NaN;
    const h2o = toNum(h[k]);
    return {
      k,
      meta,
      n: vals.length,
      wv: numOr(w[k], goalByField[k] || 0),
      h2: h2o > 0 && h2o < 1 ? h2o : meta.h2,
      sigP: Math.sqrt(vp),
      mean: vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : NaN,
      ok: vals.length >= 5 && vp > 0,
    };
  });
  const active = info.filter((t) => t.wv > 0 && t.ok).sort((x, y) => y.wv - x.wv).slice(0, MAX_TRAITS);
  const m = active.length;
  const cands = flock.filter((b) => !b.mortality && (sexF === "all" || b.sex === sexF));
  const candSet = new Set(cands.map((b) => b.id));

  const p = numOr(pS, 20) / 100;
  const pOK = p > 0 && p <= 1;
  const inten = pOK ? selectionIntensity(p) : NaN;

  // جفت صفات: همبستگی فنوتیپی (از داده) و ژنتیکی (از کاربر)
  const pairs = [];
  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < m; j++) {
      const key = active[i].k + "|" + active[j].k;
      pairs.push({
        i, j, key,
        pc: phenCorr(flock, active[i].k, active[j].k),
        g: Math.max(-0.95, Math.min(0.95, numOr(rg[key], 0))),
      });
    }
  }

  let hz = null;
  if (method === "hazel" && m > 0) {
    const rpM = Array.from({ length: m }, () => new Array(m).fill(0));
    const rgM = Array.from({ length: m }, () => new Array(m).fill(0));
    pairs.forEach((q) => {
      rpM[q.i][q.j] = rpM[q.j][q.i] = q.pc.r ?? 0;
      rgM[q.i][q.j] = rgM[q.j][q.i] = q.g;
    });
    hz = hazelIndex({
      sigP: active.map((t) => t.sigP),
      h2: active.map((t) => t.h2),
      rp: rpM,
      rg: rgM,
      a: active.map((t) => ((t.meta.inverse ? -1 : 1) * (t.wv / 100)) / (Math.sqrt(t.h2) * t.sigP)),
    });
  }

  const activeKey = active.map((t) => t.k + ":" + t.h2 + ":" + t.wv).join(",");
  const em = useMemo(
    () =>
      method === "ebv" && active.length > 0
        ? ebvMerit(flock, active.map((t) => ({ k: t.k, h2: t.h2, w: t.wv, inverse: t.meta.inverse })))
        : null,
    [method, flock, activeKey]
  );

  let rankRows = [];
  let excluded = 0;
  if (method === "hazel" && hz && !hz.error) {
    rankRows = indexScores(cands, active.map((t) => t.k), hz.b, active.map((t) => t.mean), hz.sigI).sort((x, y) => y.score - x.score);
    excluded = cands.length - rankRows.length;
  }
  if (method === "ebv" && em && !em.error) {
    rankRows = em.rows.filter((r) => candSet.has(r.id)).sort((x, y) => y.score - x.score);
  }
  const k = Math.max(1, Math.round((pOK ? p : 0.2) * rankRows.length));

  const resp = hz && !hz.error && pOK ? indexResponse(hz, inten) : null;
  const eff = hz && !hz.error && pOK ? singleEfficiency(hz, inten) : null;
  const relShare = hz && !hz.error ? (() => {
    const v = hz.b.map((b, j) => Math.abs(b * active[j].sigP));
    const s = v.reduce((x, y) => x + y, 0) || 1;
    return v.map((x) => (x / s) * 100);
  })() : [];

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-col gap-3">
        <Field label="گونه">
          <select className={inputCls} value={species} onChange={(e) => setSpecies(e.target.value)}>
            {SPECIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="کاندیدها">
          <Pills items={SEX} value={sexF} onChange={setSexF} />
        </Field>
        <Field label="درصد انتخاب‌شده از کاندیدها">
          <input className={inputCls} inputMode="decimal" value={pS} onChange={(e) => setPS(e.target.value)} />
        </Field>
        <div className="text-[11px] text-[var(--text-secondary)] leading-6">
          {cands.length} کاندید زنده{pOK ? ` — شدت انتخاب i = ${f2(inten)}` : " — درصد باید بین ۰ و ۱۰۰ باشد"}
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <div className="text-sm font-bold">صفات هدف</div>
        <p className="text-[11px] text-[var(--text-secondary)] leading-6">
          اهمیت هر صفت پیش‌فرض از «اهداف اصلاح نژاد» خوانده می‌شود و اینجا قابل تغییر است. اهمیت یعنی ارزش بهبود یک انحراف معیار ژنتیکی آن صفت. حداکثر {MAX_TRAITS} صفت با بیشترین اهمیت وارد شاخص می‌شوند و هر صفت حداقل ۵ رکورد لازم دارد. h² پیش‌فرض فرضی است.
        </p>
        {info.map((t) => (
          <div key={t.k} className="rounded-lg border border-[var(--input-border)] p-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold">{t.meta.label}</span>
              <span className="text-[11px] text-[var(--text-secondary)]">{t.n} رکورد{!t.ok ? " — کافی نیست" : ""}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="اهمیت (٪)">
                <input className={inputCls} inputMode="decimal" placeholder={String(goalByField[t.k] || 0)} value={w[t.k] ?? ""} onChange={(e) => setW({ ...w, [t.k]: e.target.value })} />
              </Field>
              <Field label="h²">
                <input className={inputCls} inputMode="decimal" placeholder={String(t.meta.h2)} value={h[t.k] ?? ""} onChange={(e) => setH({ ...h, [t.k]: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}
      </Card>

      <Pills items={METHODS} value={method} onChange={setMethod} />

      {m === 0 && (
        <Card>
          <p className="text-sm text-[var(--text-secondary)] leading-7">
            اطلاعات کافی نیست: حداقل یک صفت با اهمیت بیشتر از صفر و ۵ رکورد لازم است. وزن اهداف را در تب «اهداف اصلاح نژاد» بدهید یا بالا اهمیت وارد کنید.
          </p>
        </Card>
      )}

      {m > 0 && method === "hazel" && (
        <>
          {m >= 2 && (
            <Card className="flex flex-col gap-2">
              <div className="text-sm font-bold">همبستگی صفات</div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-6">
                همبستگی فنوتیپی از رکوردهای گله برآورد شده (حداقل ۱۰ جفت، وگرنه صفر فرض می‌شود). همبستگی ژنتیکی از داده قابل برآورد معتبر نیست؛ پیش‌فرض صفر یعنی «ناشناخته» است. اگر از مقاله یا گله بزرگ می‌دانید، وارد کنید (۰٫۹۵− تا ۰٫۹۵).
              </p>
              {pairs.map((q) => (
                <div key={q.key} className="flex flex-col gap-1">
                  <div className="text-xs">{active[q.i].meta.label} × {active[q.j].meta.label}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    همبستگی فنوتیپی: {q.pc.r == null ? `داده کافی نیست (${q.pc.n} جفت)` : `${q.pc.r.toFixed(2)} (${q.pc.n} جفت)`}
                  </div>
                  <input className={inputCls} inputMode="decimal" placeholder="همبستگی ژنتیکی (پیش‌فرض ۰)" value={rg[q.key] ?? ""} onChange={(e) => setRg({ ...rg, [q.key]: e.target.value })} />
                </div>
              ))}
            </Card>
          )}

          {hz && hz.error && (
            <Card><p className="text-sm text-[#c8553d] leading-7">{ERR[hz.error]}</p></Card>
          )}

          {hz && !hz.error && (
            <>
              <Card className="flex flex-col gap-2 text-sm leading-7">
                <div className="font-bold">شاخص هیزل</div>
                <div>دقت شاخص (r<sub>IH</sub>): <b>{f2(hz.rIH)}</b></div>
                {active.map((t, j) => (
                  <div key={t.k} className="text-xs">
                    {t.meta.label}: ضریب <b dir="ltr">{hz.b[j].toPrecision(3)}</b> — سهم نسبی در شاخص <b>{relShare[j].toFixed(0)}٪</b>
                  </div>
                ))}
                {resp && (
                  <>
                    <div className="font-bold mt-1">پیشرفت مورد انتظار هر نسل (با انتخاب {Math.round(p * 100)}٪)</div>
                    {active.map((t, j) => {
                      const d = resp.perTrait[j];
                      const good = t.meta.inverse ? d < 0 : d > 0;
                      return (
                        <div key={t.k} className="text-xs">
                          {t.meta.label}: <b dir="ltr">{d > 0 ? "+" : ""}{f2(d)}</b> {t.meta.unit}{" "}
                          <span style={{ color: good ? "#2f9e6f" : "#c8553d" }}>{good ? "(بهبود)" : "(بدتر شدن)"}</span>
                        </div>
                      );
                    })}
                    <div className="text-xs">پیشرفت کل هدف: <b>{f2(resp.dH)}</b> (واحد: انحراف معیار ژنتیکی وزنی)</div>
                  </>
                )}
                {eff && (
                  <>
                    <div className="font-bold mt-1">کارایی شاخص در برابر انتخاب فقط روی یک صفت</div>
                    {active.map((t, j) => (
                      <div key={t.k} className="text-xs text-[var(--text-secondary)]">
                        فقط {t.meta.label}:{" "}
                        {eff[j].eff == null ? "به هدف کلی کمکی نمی‌کند یا زیان می‌زند" : `شاخص ${f2(eff[j].eff)} برابر بهتر است`}
                      </div>
                    ))}
                  </>
                )}
              </Card>

              <div className="text-sm font-bold">رتبه‌بندی (نمره شاخص بر حسب انحراف معیار شاخص)</div>
              {excluded > 0 && (
                <p className="text-[11px] text-[var(--text-secondary)] leading-6">
                  {excluded} کاندید به‌خاطر نداشتن رکورد کامل همه صفات رتبه نگرفتند.
                </p>
              )}
              {rankRows.length === 0 ? (
                <Card><p className="text-sm text-[var(--text-secondary)] leading-7">هیچ کاندیدی همه این صفات را رکورد ندارد.</p></Card>
              ) : (
                <RankList rows={rankRows} byId={byId} k={k} showAll={showAll} setShowAll={setShowAll} />
              )}
            </>
          )}
        </>
      )}

      {m > 0 && method === "ebv" && (
        <>
          <Card>
            <p className="text-xs text-[var(--text-secondary)] leading-6">
              میانگین وزنی EBVهای استاندارد صفات (BLUP مرحله اول). برای پرنده‌های بدون رکورد هم از خویشاوندان برآورد می‌شود. همبستگی ژنتیکی بین صفات در نظر گرفته نمی‌شود. نمره بر حسب انحراف معیار ژنتیکی است.
            </p>
          </Card>
          {em && em.error ? (
            <Card><p className="text-sm text-[#c8553d] leading-7">{ERR[em.error]}</p></Card>
          ) : rankRows.length === 0 ? (
            <Card><p className="text-sm text-[var(--text-secondary)] leading-7">کاندیدی برای رتبه‌بندی نیست.</p></Card>
          ) : (
            <RankList
              rows={rankRows}
              byId={byId}
              k={k}
              showAll={showAll}
              setShowAll={setShowAll}
              extra={(r) => <span>کمترین دقت EBV: {Math.round(r.minAcc * 100)}٪</span>}
            />
          )}
        </>
      )}

      <p className="text-[11px] text-[var(--text-secondary)] leading-6">
        برآورد آموزشی بر پایه داده‌های ثبت‌شده و فرض‌های بالا است، نه پیش‌بینی قطعی. دقت نتیجه به تعداد رکوردها، کامل بودن شجره و درستی h² و همبستگی‌ها بستگی دارد.
      </p>
    </div>
  );
}
