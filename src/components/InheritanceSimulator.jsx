import React, { useState } from "react";
import { Card, Pills, Field, inputCls } from "./knowledgeShared.jsx";
import { parseGenotype, gametes, combine, phenotype, tally } from "./geneticsUtils.js";

const MODES = [
  { id: "punnett", label: "جدول پانت" },
  { id: "sex", label: "وابسته به جنس (ZW)" },
  { id: "gen", label: "نسل F1 تا F3" },
];

/* ---------- پانت ---------- */
function Punnett() {
  const [a, setA] = useState("Aa");
  const [b, setB] = useState("Aa");
  const pa = parseGenotype(a), pb = parseGenotype(b);
  const bad = !pa || !pb || pa.length !== pb.length || pa.length > 3;
  let content = null;
  if (!bad) {
    const ga = gametes(pa), gb = gametes(pb);
    const cells = ga.map((x) => gb.map((y) => combine(x, y)));
    const flat = cells.flat();
    const gt = tally(flat);
    const pt = tally(flat.map(phenotype));
    const total = flat.length;
    content = (
      <>
        {pa.length <= 2 && (
          <div className="overflow-x-auto">
            <table dir="ltr" className="text-xs text-center border-collapse mx-auto">
              <thead>
                <tr>
                  <th className="p-1.5"></th>
                  {gb.map((g, i) => <th key={i} className="p-1.5 border border-[var(--input-border)] font-mono text-[var(--accent)]">{g}</th>)}
                </tr>
              </thead>
              <tbody>
                {ga.map((g, i) => (
                  <tr key={i}>
                    <th className="p-1.5 border border-[var(--input-border)] font-mono text-[var(--accent)]">{g}</th>
                    {cells[i].map((c, j) => <td key={j} className="p-1.5 border border-[var(--input-border)] font-mono">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="text-sm leading-7">
          <div className="font-bold mb-1">نسبت ژنوتیپی ({total} ترکیب)</div>
          <div dir="ltr" className="flex flex-wrap gap-2 font-mono text-xs">
            {Object.entries(gt).map(([k, v]) => <span key={k} className="px-2 py-1 rounded border border-[var(--input-border)]">{k}: {v}/{total}</span>)}
          </div>
          <div className="font-bold mt-3 mb-1">نسبت فنوتیپی (غالبیت کامل)</div>
          <div dir="ltr" className="flex flex-wrap gap-2 font-mono text-xs">
            {Object.entries(pt).map(([k, v]) => <span key={k} className="px-2 py-1 rounded border border-[var(--accent-border)] text-[var(--accent)]">{k}: {v}</span>)}
          </div>
        </div>
      </>
    );
  }
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        ژنوتیپ را با حروف بزرگ و کوچک بنویسید: «Aa» تک‌ژنی، «AaBb» دو‌ژنی (تا سه ژن). حرف بزرگ = آلل غالب.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Field label="والد اول (مثلاً AaBb)"><input dir="ltr" className={inputCls} value={a} onChange={(e) => setA(e.target.value)} /></Field>
        <Field label="والد دوم"><input dir="ltr" className={inputCls} value={b} onChange={(e) => setB(e.target.value)} /></Field>
      </div>
      {bad ? <p className="text-sm text-red-500">ژنوتیپ نامعتبر است. هر ژن دو حرف هم‌نام می‌خواهد (مثل Aa) و هر دو والد باید تعداد ژن یکسان داشته باشند.</p> : content}
    </Card>
  );
}

/* ---------- وابسته به جنس ---------- */
function SexLinked() {
  const [m1, setM1] = useState("B");
  const [m2, setM2] = useState("B");
  const [f1, setF1] = useState("b");
  const alleles = ["B", "b"];
  const Sel = ({ v, set }) => (
    <select dir="ltr" className={inputCls} value={v} onChange={(e) => set(e.target.value)}>
      {alleles.map((x) => <option key={x}>{x}</option>)}
    </select>
  );
  const fmt = (x, y) => (x === y ? x + y : "Bb");
  const sons = [m1, m2].map((x) => fmt(x, f1));
  const daughters = [m1, m2].map((x) => x + "W");
  const sT = tally(sons.map((s) => "Z" + s[0] + "Z" + s[1]));
  const dT = tally(daughters.map((d) => "Z" + d[0] + "W"));
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        خروس ZZ و مرغ ZW است. آلل «B» نمونه غالب وابسته به جنس است (مثل نواربندی). مرغ فقط یک آلل Z دارد.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Field label="خروس: آلل ۱"><Sel v={m1} set={setM1} /></Field>
        <Field label="خروس: آلل ۲"><Sel v={m2} set={setM2} /></Field>
        <Field label="مرغ: آلل Z"><Sel v={f1} set={setF1} /></Field>
      </div>
      <div className="text-sm leading-8">
        <div className="font-bold">پسرها (ZZ) — ۵۰٪ جوجه‌ها</div>
        <div dir="ltr" className="flex flex-wrap gap-2 font-mono text-xs mb-2">
          {Object.entries(sT).map(([k, v]) => <span key={k} className="px-2 py-1 rounded border border-[var(--input-border)]">{k}: {v}/2</span>)}
        </div>
        <div className="font-bold">دخترها (ZW) — ۵۰٪ جوجه‌ها</div>
        <div dir="ltr" className="flex flex-wrap gap-2 font-mono text-xs">
          {Object.entries(dT).map(([k, v]) => <span key={k} className="px-2 py-1 rounded border border-[var(--input-border)]">{k}: {v}/2</span>)}
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-2 leading-6">
          الگوی صلیبی: دخترها Z خود را از پدر می‌گیرند. اگر خروس bb و مرغ B باشد، همه پسرها Bb و همه دخترها b هستند (اتوسکس).
        </p>
      </div>
    </Card>
  );
}

/* ---------- نسل‌ها ---------- */
const SYSTEMS = [
  { id: "random", label: "جفت‌گیری تصادفی" },
  { id: "self", label: "همخونی شدید (خودلقاحی نظری)" },
  { id: "bcr", label: "برگشتی با aa" },
  { id: "bcd", label: "برگشتی با AA" },
];

function step(d, sys) {
  const [AA, Aa, aa] = d;
  if (sys === "random") { const p = AA + Aa / 2, q = 1 - p; return [p * p, 2 * p * q, q * q]; }
  if (sys === "self") return [AA + Aa / 4, Aa / 2, aa + Aa / 4];
  if (sys === "bcr") return [0, AA + Aa / 2, aa + Aa / 2];
  return [AA + Aa / 2, aa + Aa / 2, 0];
}

function Generations() {
  const [p1, setP1] = useState("AA");
  const [p2, setP2] = useState("aa");
  const [sys, setSys] = useState("random");
  const g1 = gametes(parseGenotype(p1) || [["A", "A"]]);
  const g2 = gametes(parseGenotype(p2) || [["a", "a"]]);
  const valid = parseGenotype(p1)?.length === 1 && parseGenotype(p2)?.length === 1;
  let f1 = [0, 0, 0];
  if (valid) {
    const all = g1.flatMap((x) => g2.map((y) => combine(x, y)));
    f1 = ["AA", "Aa", "aa"].map((k) => all.filter((z) => z === k).length / all.length);
  }
  const f2 = step(f1, sys), f3 = step(f2, sys);
  const gens = [["F1", f1], ["F2", f2], ["F3", f3]];
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        تک‌ژن A/a. والدین را وارد کنید (AA، Aa یا aa)، سپس سیستم جفت‌گیری نسل‌های بعد را انتخاب کنید.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Field label="والد اول"><input dir="ltr" className={inputCls} value={p1} onChange={(e) => setP1(e.target.value)} /></Field>
        <Field label="والد دوم"><input dir="ltr" className={inputCls} value={p2} onChange={(e) => setP2(e.target.value)} /></Field>
      </div>
      <Pills items={SYSTEMS} value={sys} onChange={setSys} />
      {!valid ? <p className="text-sm text-red-500">فقط ژنوتیپ‌های AA، Aa یا aa.</p> : (
        <div className="flex flex-col gap-2">
          {gens.map(([name, d]) => (
            <div key={name}>
              <div className="text-xs font-bold mb-1">{name}</div>
              <div dir="ltr" className="flex h-6 rounded overflow-hidden border border-[var(--input-border)] text-[10px] font-mono">
                {[["AA", "#2f9e6f"], ["Aa", "#d9a441"], ["aa", "#c8553d"]].map(([k, c], i) =>
                  d[i] > 0.0001 ? (
                    <div key={k} style={{ width: d[i] * 100 + "%", background: c }} className="flex items-center justify-center text-white whitespace-nowrap overflow-hidden">
                      {d[i] > 0.1 ? `${k} ${(d[i] * 100).toFixed(1)}٪` : ""}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-[var(--text-secondary)] leading-6 mt-1">
            در جفت‌گیری تصادفی، نسبت‌ها از F2 به بعد ثابت می‌مانند (تعادل هاردی–واینبرگ). در همخونی، ناخالص‌ها در هر نسل نصف می‌شوند.
          </p>
        </div>
      )}
    </Card>
  );
}

export default function InheritanceSimulator() {
  const [m, setM] = useState("punnett");
  return (
    <div className="flex flex-col gap-3">
      <Pills items={MODES} value={m} onChange={setM} />
      {m === "punnett" && <Punnett />}
      {m === "sex" && <SexLinked />}
      {m === "gen" && <Generations />}
    </div>
  );
}
