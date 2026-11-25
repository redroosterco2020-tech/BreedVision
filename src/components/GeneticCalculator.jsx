import React, { useState } from "react";
import { Card, Pills, Field, inputCls, Btn } from "./knowledgeShared.jsx";

const TOOLS = [
  { id: "hw", label: "هاردی–واینبرگ" },
  { id: "freq", label: "فراوانی آلل" },
  { id: "chi", label: "مربع کای" },
  { id: "f", label: "ضریب همخونی" },
];

const pct = (x) => (isFinite(x) ? (x * 100).toFixed(2) + "٪" : "—");
const num = (v) => parseFloat(String(v).replace(",", "."));

function HW() {
  const [q2, setQ2] = useState("0.04");
  const [n, setN] = useState("100");
  const v = num(q2);
  const ok = v >= 0 && v <= 1;
  const q = Math.sqrt(v);
  const p = 1 - q;
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        اگر فراوانی افراد مغلوب (aa) را بدانید، فراوانی آلل‌ها و ژنوتیپ‌ها تحت جفت‌گیری تصادفی برآورد می‌شود.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Field label="فراوانی ژنوتیپ مغلوب aa (۰ تا ۱)">
          <input className={inputCls} inputMode="decimal" value={q2} onChange={(e) => setQ2(e.target.value)} />
        </Field>
        <Field label="اندازه گله">
          <input className={inputCls} inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} />
        </Field>
      </div>
      {!ok ? (
        <p className="text-sm text-red-500">عدد باید بین ۰ و ۱ باشد.</p>
      ) : (
        <div className="text-sm leading-8">
          <div>فراوانی آلل مغلوب (q): <b>{q.toFixed(4)}</b></div>
          <div>فراوانی آلل غالب (p): <b>{p.toFixed(4)}</b></div>
          <div>AA = p² = <b>{pct(p * p)}</b> ≈ {Math.round(p * p * (num(n) || 0))} پرنده</div>
          <div>Aa = 2pq = <b>{pct(2 * p * q)}</b> ≈ {Math.round(2 * p * q * (num(n) || 0))} پرنده</div>
          <div>aa = q² = <b>{pct(q * q)}</b> ≈ {Math.round(q * q * (num(n) || 0))} پرنده</div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            حاملان پنهان (Aa) همان پرندگانی‌اند که صفت را نشان نمی‌دهند ولی آلل مغلوب را منتقل می‌کنند.
          </p>
        </div>
      )}
    </Card>
  );
}

function Freq() {
  const [aa, setAA] = useState("30");
  const [ab, setAB] = useState("50");
  const [bb, setBB] = useState("20");
  const [A, B, C] = [num(aa) || 0, num(ab) || 0, num(bb) || 0];
  const N = A + B + C;
  const p = N ? (2 * A + B) / (2 * N) : NaN;
  const q = 1 - p;
  const expAA = N * p * p, expAb = N * 2 * p * q, expbb = N * q * q;
  const chi = expAA ? (A - expAA) ** 2 / expAA + (B - expAb) ** 2 / expAb + (C - expbb) ** 2 / expbb : NaN;
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        تعداد پرندگان هر ژنوتیپ را وارد کنید تا فراوانی آلل‌ها و برازش به تعادل هاردی–واینبرگ محاسبه شود.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Field label="AA"><input className={inputCls} inputMode="numeric" value={aa} onChange={(e) => setAA(e.target.value)} /></Field>
        <Field label="Aa"><input className={inputCls} inputMode="numeric" value={ab} onChange={(e) => setAB(e.target.value)} /></Field>
        <Field label="aa"><input className={inputCls} inputMode="numeric" value={bb} onChange={(e) => setBB(e.target.value)} /></Field>
      </div>
      {N > 0 && (
        <div className="text-sm leading-8">
          <div>تعداد کل: <b>{N}</b></div>
          <div>فراوانی A (p): <b>{p.toFixed(4)}</b> — فراوانی a (q): <b>{q.toFixed(4)}</b></div>
          <div>مورد انتظار: AA={expAA.toFixed(1)}، Aa={expAb.toFixed(1)}، aa={expbb.toFixed(1)}</div>
          <div>
            χ² = <b>{isFinite(chi) ? chi.toFixed(3) : "—"}</b> (۱ درجه آزادی):{" "}
            {isFinite(chi) && (chi > 3.841 ? "با تعادل هاردی–واینبرگ تفاوت معنی‌دار دارد (p<0.05)" : "با تعادل سازگار است")}
          </div>
        </div>
      )}
    </Card>
  );
}

const CRIT = { 1: [3.841, 6.635], 2: [5.991, 9.21], 3: [7.815, 11.345], 4: [9.488, 13.277], 5: [11.07, 15.086] };

function Chi() {
  const [obs, setObs] = useState("68, 22");
  const [ratio, setRatio] = useState("3, 1");
  const O = obs.split(/[,،\s]+/).map(num).filter((x) => !isNaN(x));
  const R = ratio.split(/[,،\s:]+/).map(num).filter((x) => !isNaN(x));
  const valid = O.length > 1 && O.length === R.length && O.length - 1 <= 5 && R.every((x) => x > 0);
  const N = O.reduce((a, b) => a + b, 0);
  const rs = R.reduce((a, b) => a + b, 0);
  const E = valid ? R.map((r) => (N * r) / rs) : [];
  const chi = valid ? O.reduce((s, o, i) => s + (o - E[i]) ** 2 / E[i], 0) : NaN;
  const df = O.length - 1;
  const [c05, c01] = CRIT[df] || [NaN, NaN];
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        بررسی می‌کند نتیجه جوجه‌ها با نسبت مندلی مورد انتظار (مثلاً ۳:۱ یا ۹:۳:۳:۱) سازگار است یا نه.
      </p>
      <Field label="تعداد مشاهده‌شده (با کاما جدا کنید)">
        <input className={inputCls} dir="ltr" value={obs} onChange={(e) => setObs(e.target.value)} />
      </Field>
      <Field label="نسبت مورد انتظار">
        <input className={inputCls} dir="ltr" value={ratio} onChange={(e) => setRatio(e.target.value)} />
      </Field>
      {valid ? (
        <div className="text-sm leading-8">
          <div>مورد انتظار: {E.map((e) => e.toFixed(1)).join(" ، ")}</div>
          <div>χ² = <b>{chi.toFixed(3)}</b> — درجه آزادی = {df}</div>
          <div>مقدار بحرانی ۵٪: {c05} — ۱٪: {c01}</div>
          <div className="font-bold">
            {chi < c05
              ? "تفاوت معنی‌دار نیست؛ داده با نسبت مورد انتظار سازگار است."
              : chi < c01
              ? "تفاوت در سطح ۵٪ معنی‌دار است."
              : "تفاوت در سطح ۱٪ معنی‌دار است؛ فرضیه نسبت را رد کنید."}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">برای نتیجه قابل‌اعتماد، تعداد مورد انتظار هر دسته باید حداقل ۵ باشد.</p>
        </div>
      ) : (
        <p className="text-sm text-red-500">تعداد مشاهده‌ها و نسبت‌ها باید هم‌اندازه باشد (حداکثر ۶ دسته).</p>
      )}
    </Card>
  );
}

function Inbreeding() {
  // هر جد مشترک: n1 و n2 = تعداد نسل از پدر و مادر تا جد مشترک ، Fa = ضریب همخونی جد
  const [rows, setRows] = useState([{ n1: "1", n2: "1", fa: "0" }, { n1: "1", n2: "1", fa: "0" }]);
  const set = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const F = rows.reduce((s, r) => {
    const n1 = num(r.n1), n2 = num(r.n2), fa = num(r.fa) || 0;
    if (isNaN(n1) || isNaN(n2)) return s;
    return s + Math.pow(0.5, n1 + n2 + 1) * (1 + fa);
  }, 0);
  const level = F < 0.0625 ? "کم" : F < 0.125 ? "متوسط" : F < 0.25 ? "زیاد" : "بسیار زیاد";
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        روش رایت: برای هر جد مشترک، تعداد نسل از پدر و از مادر تا آن جد را وارد کنید.
        F = Σ (½)^(n1+n2+1) × (1+Fa)
      </p>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <Field label="n1 (از پدر)"><input className={inputCls} inputMode="numeric" value={r.n1} onChange={(e) => set(i, "n1", e.target.value)} /></Field>
          <Field label="n2 (از مادر)"><input className={inputCls} inputMode="numeric" value={r.n2} onChange={(e) => set(i, "n2", e.target.value)} /></Field>
          <Field label="Fa جد"><input className={inputCls} inputMode="decimal" value={r.fa} onChange={(e) => set(i, "fa", e.target.value)} /></Field>
        </div>
      ))}
      <div className="flex gap-2">
        <Btn onClick={() => setRows([...rows, { n1: "2", n2: "2", fa: "0" }])}>+ جد مشترک</Btn>
        {rows.length > 1 && <Btn onClick={() => setRows(rows.slice(0, -1))}>حذف آخری</Btn>}
      </div>
      <div className="text-sm leading-8">
        ضریب همخونی نتاج: <b>{F.toFixed(4)}</b> ({pct(F)}) — سطح: <b>{level}</b>
      </div>
      <div className="text-xs text-[var(--text-secondary)] leading-6">
        مرجع سریع: برادر×خواهر کامل ۲۵٪ ، والد×فرزند ۲۵٪ ، نیمه‌برادر×نیمه‌خواهر ۱۲٫۵٪ ، عمو×برادرزاده ۱۲٫۵٪ ، پسرعمو×دخترعمو ۶٫۲۵٪.
        (برای برادر×خواهر کامل: دو جد مشترک — پدر و مادر — با n1=n2=1 وارد کنید.)
      </div>
    </Card>
  );
}

export default function GeneticCalculator() {
  const [t, setT] = useState("hw");
  return (
    <div className="flex flex-col gap-3">
      <Pills items={TOOLS} value={t} onChange={setT} />
      {t === "hw" && <HW />}
      {t === "freq" && <Freq />}
      {t === "chi" && <Chi />}
      {t === "f" && <Inbreeding />}
    </div>
  );
}
