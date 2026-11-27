import React, { useMemo, useState } from "react";
import { Card, Pills, Field, inputCls } from "./knowledgeShared.jsx";
import { TRAIT_META, SPECIES } from "../lib/constants.js";
import { GENES, geneCross, quantCross } from "./crossData.js";
import CrossTree from "./CrossTree.jsx";

const num = (v) => parseFloat(String(v ?? "").replace(",", "."));
const f2 = (x) => (isFinite(x) ? x.toFixed(2) : "—");

const TABS = [
  { id: "tree", label: "نمودار نسل‌ها" },
  { id: "quant", label: "صفات کمی" },
  { id: "genes", label: "ژن‌های مندلی" },
];

const TAGS = {
  calc: ["محاسبه‌شده از ژنوتیپ واردشده (مدل مندلی)", "#2f9e6f"],
  model: ["برآورد بر پایه مدل و فرض‌های مشخص", "#d9a441"],
  none: ["اطلاعات کافی برای پیش‌بینی وجود ندارد", "#c8553d"],
};

function Tag({ kind }) {
  const [t, c] = TAGS[kind];
  return <span className="text-[11px] font-bold" style={{ color: c }}>{t}</span>;
}

function traitsFor(species) {
  const poultry = (species || "").startsWith("poultry");
  return Object.entries(TRAIT_META).filter(([k]) =>
    poultry ? k !== "milkProduction" : !["eggProduction", "hatchPercent"].includes(k)
  );
}

function ParentPicker({ title, sex, species, breeders, name, setName, onPick }) {
  const list = breeders.filter((b) => !b.mortality && b.sex === sex && (b.species || "") === species);
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-bold">{title}</div>
      <input className={inputCls} placeholder="نام نژاد یا لاین" value={name} onChange={(e) => setName(e.target.value)} />
      {list.length > 0 && (
        <select className={inputCls} defaultValue="" onChange={(e) => onPick(list.find((b) => b.id === e.target.value))}>
          <option value="">— پر کردن از گله (اختیاری) —</option>
          {list.map((b) => (
            <option key={b.id} value={b.id}>{(b.tag || "") + (b.name ? " — " + b.name : "")}</option>
          ))}
        </select>
      )}
    </div>
  );
}

function GeneCard({ g, value, onChange, res }) {
  const [n0, n1] = g.names;
  const male = [["AA", `${n0}/${n0}`], ["Aa", `${n0}/${n1}`], ["aa", `${n1}/${n1}`]];
  const female = g.loc === "Z" ? [["A", `${n0}/W`], ["a", `${n1}/W`]] : male;
  const sel = (opts, v, set) => (
    <select dir="ltr" className={inputCls} value={v || ""} onChange={(e) => set(e.target.value)}>
      <option value="">نامشخص</option>
      {opts.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
    </select>
  );
  return (
    <Card className="flex flex-col gap-2">
      <div className="text-sm font-bold">{g.label}</div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="ژنوتیپ والد ماده">{sel(female, value.d, (v) => onChange({ ...value, d: v }))}</Field>
        <Field label="ژنوتیپ والد نر">{sel(male, value.s, (v) => onChange({ ...value, s: v }))}</Field>
      </div>
      {res ? (
        <div className="flex flex-col gap-1">
          <Tag kind="calc" />
          {res.gens.map((gen) => (
            <div key={gen.name} className="text-xs leading-6">
              <b>{gen.name}</b>
              {gen.groups.map((gr) => (
                <div key={gr.sex} className="text-[var(--text-secondary)]">
                  {gr.sex === "male" ? "نر: " : gr.sex === "female" ? "ماده: " : ""}
                  {gr.items.map((i) => `${i.label} ${Math.round(i.p * 100)}٪`).join(" ، ")}
                </div>
              ))}
            </div>
          ))}
          {res.newInF2.length > 0 && (
            <div className="text-xs text-[var(--accent)] leading-6">
              در F2 فنوتیپ‌های تازه بروز می‌کنند (تفکیک): {res.newInF2.join(" ، ")}
            </div>
          )}
        </div>
      ) : (
        <Tag kind="none" />
      )}
    </Card>
  );
}

export default function CrossbreedingSimulator({ breeders = [] }) {
  const [tab, setTab] = useState("tree");
  const [species, setSpecies] = useState("poultry_chicken");
  const [damName, setDamName] = useState("");
  const [sireName, setSireName] = useState("");
  const [vals, setVals] = useState({});
  const [H, setH] = useState("0");
  const [S, setS] = useState("0");
  const [geno, setGeno] = useState({});

  const traits = useMemo(() => traitsFor(species), [species]);
  const isChicken = species === "poultry_chicken";

  const setVal = (k, who, v) => setVals((p) => ({ ...p, [k]: { ...(p[k] || {}), [who]: v } }));

  function pick(who, b) {
    if (!b) return;
    (who === "d" ? setDamName : setSireName)(b.breed || b.tag || "");
    setVals((p) => {
      const next = { ...p };
      traits.forEach(([k]) => {
        if (b[k] !== "" && b[k] != null) next[k] = { ...(next[k] || {}), [who]: String(b[k]) };
      });
      return next;
    });
  }

  const quant = useMemo(
    () =>
      traits.map(([k, meta]) => {
        const d = num(vals[k]?.d), s = num(vals[k]?.s);
        return { k, meta, r: quantCross({ d, s, h2: meta.h2, inverse: meta.inverse, H: num(H) || 0, S: num(S) || 0 }) };
      }),
    [traits, vals, H, S]
  );

  const geneRes = useMemo(
    () =>
      GENES.map((g) => {
        const x = geno[g.id] || {};
        return { g, r: x.s && x.d ? geneCross(g, x.s, x.d) : null };
      }),
    [geno]
  );

  const quantDone = quant.filter((q) => q.r).length;
  const geneDone = isChicken ? geneRes.filter((x) => x.r).length : 0;

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-col gap-3">
        <Field label="گونه">
          <select className={inputCls} value={species} onChange={(e) => setSpecies(e.target.value)}>
            {SPECIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <ParentPicker title="والد ماده" sex="female" species={species} breeders={breeders} name={damName} setName={setDamName} onPick={(b) => pick("d", b)} />
        <ParentPicker title="والد نر" sex="male" species={species} breeders={breeders} name={sireName} setName={setSireName} onPick={(b) => pick("s", b)} />
        <p className="text-[11px] text-[var(--text-secondary)] leading-6">
          نام نژاد یا برند به‌تنهایی اطلاعات ژنتیکی نیست؛ مثلاً مرغ تخم‌گذار صنعتی معمولاً حاصل تلاقی چند لاین اصلاح‌شده است. مقادیر را از رکورد واقعی یا مولدهای ثبت‌شده وارد کنید.
        </p>
      </Card>

      <Pills items={TABS} value={tab} onChange={setTab} />

      {tab === "tree" && (
        <>
          <Card>
            <div className="max-w-md mx-auto"><CrossTree damName={damName} sireName={sireName} /></div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-6 mt-2">
              نمایش مفهومی مسیر نسل‌ها؛ نتایج واقعی به ژنتیک والدین و نحوه انتخاب جفت‌ها وابسته است.
            </p>
          </Card>
          <Card className="text-sm leading-7">
            <div className="font-bold mb-1">خلاصه</div>
            <div>صفات کمی محاسبه‌شده: <b>{quantDone}</b> از {quant.length}</div>
            <div>
              ژن‌های مندلی محاسبه‌شده: <b>{geneDone}</b>
              {isChicken ? ` از ${GENES.length}` : " (کاتالوگ ژن فقط برای مرغ است)"}
            </div>
            <div className="text-xs text-[var(--text-secondary)] leading-6 mt-2">
              F1 معمولاً یکنواخت است و برای تولید تجاری مناسب است. در F2 ژن‌های ناخالص تفکیک می‌شوند و تنوع زیاد می‌شود؛ برای ادامه اصلاح نژاد، انتخاب از F2 به بعد انجام می‌شود.
            </div>
          </Card>
          <Card className="flex flex-col gap-1">
            <div className="text-sm font-bold">سه نوع نتیجه</div>
            <Tag kind="calc" />
            <Tag kind="model" />
            <Tag kind="none" />
          </Card>
        </>
      )}

      {tab === "quant" && (
        <>
          <Card className="flex flex-col gap-2">
            <p className="text-xs text-[var(--text-secondary)] leading-6">
              مدل ساده: میانگین والدین + هتروزیس (در F2 نصف می‌شود) + پاسخ به انتخاب (R = h² × S). اثر ژن‌های متقابل (اپیستازی)، پیوستگی و تفاوت جنسیت در نظر گرفته نشده است. برای صفات محدود به جنس (مثل تولید تخم)، برای نر میانگین خواهران او را وارد کنید.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="بهبود هتروزیس در F1 (٪، می‌تواند منفی باشد)">
                <input className={inputCls} inputMode="decimal" value={H} onChange={(e) => setH(e.target.value)} />
              </Field>
              <Field label="بهبود انتخاب در هر نسل (٪)">
                <input className={inputCls} inputMode="decimal" value={S} onChange={(e) => setS(e.target.value)} />
              </Field>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-6">
              مقدار هر دو پیش‌فرض صفر است، چون اندازه هتروزیس به لاین‌های شما بستگی دارد. برای FCR «بهبود» یعنی کاهش عدد.
            </p>
          </Card>
          {quant.map(({ k, meta, r }) => (
            <Card key={k} className="flex flex-col gap-2">
              <div className="text-sm font-bold">
                {meta.label} {meta.unit ? <span className="text-xs font-normal text-[var(--text-secondary)]">({meta.unit})</span> : null}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="والد ماده">
                  <input className={inputCls} inputMode="decimal" value={vals[k]?.d || ""} onChange={(e) => setVal(k, "d", e.target.value)} />
                </Field>
                <Field label="والد نر">
                  <input className={inputCls} inputMode="decimal" value={vals[k]?.s || ""} onChange={(e) => setVal(k, "s", e.target.value)} />
                </Field>
              </div>
              {r ? (
                <div className="flex flex-col gap-1">
                  <Tag kind="model" />
                  <div className="text-sm leading-7">
                    F1: <b>{f2(r.f1)}</b> ← F2: <b>{f2(r.f2)}</b> ← F3: <b>{f2(r.f3)}</b>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    میانگین والدین: {f2(r.mid)} · h² فرضی: {meta.h2}{meta.inverse ? " · کمتر بهتر است" : ""}
                  </div>
                </div>
              ) : (
                <Tag kind="none" />
              )}
            </Card>
          ))}
        </>
      )}

      {tab === "genes" && (
        <>
          {!isChicken && (
            <Card>
              <p className="text-sm text-[var(--text-secondary)] leading-7">
                کاتالوگ ژن‌های اصلی فعلاً فقط برای مرغ است. گونه را روی «مرغ و خروس» بگذارید.
              </p>
            </Card>
          )}
          {isChicken && (
            <>
              <p className="text-xs text-[var(--text-secondary)] leading-6">
                ژنوتیپ والدین را از روی شجره یا آزمون جفت‌گیری وارد کنید. اگر ژنوتیپی را نمی‌دانید «نامشخص» بگذارید تا نتیجه ساختگی داده نشود.
              </p>
              {geneRes.map(({ g, r }) => (
                <GeneCard key={g.id} g={g} res={r} value={geno[g.id] || {}} onChange={(v) => setGeno((p) => ({ ...p, [g.id]: v }))} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
