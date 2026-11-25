import React, { useState } from "react";
import { Card, Pills, Field, inputCls, Btn, Accordion } from "./knowledgeShared.jsx";
import { parseGenotype, gametes, combine, phenotype, tally, randomPick } from "./geneticsUtils.js";

const STAGES = [
  ["تشکیل گامت", "در میوز، سلول‌های جنسی هاپلوئید (۳۹ کروموزوم در مرغ) ساخته می‌شوند. خروس اسپرم Z و مرغ تخمک Z یا W تولید می‌کند."],
  ["جفت‌گیری", "اسپرم وارد دستگاه تناسلی مرغ می‌شود. بخشی از آن در غدد ذخیره اسپرم نزدیک رحم نگهداری می‌شود و تا حدود ۲ هفته (گاهی تا ۳ هفته) قدرت باروری دارد."],
  ["تخمک‌ریزی و لقاح", "تخمک (زرده) پس از آزاد شدن از تخمدان در قیف تخم‌ریز (اینفاندیبولوم) با اسپرم برخورد می‌کند. لقاح در همین بخش و طی دقایق اول انجام می‌شود."],
  ["تشکیل تخم", "سفیده در بخش ماگنوم، پوسته‌های غشایی در ایستموس و پوسته آهکی در رحم (غده پوسته) ساخته می‌شود. کل فرایند حدود ۲۴ تا ۲۶ ساعت طول می‌کشد."],
  ["رشد جنین", "تقسیمات اولیه جنین پیش از تخم‌گذاری شروع می‌شود. پس از تخم‌گذاری، رشد تا شروع جوجه‌کشی متوقف می‌ماند و با گرما از سر گرفته می‌شود."],
  ["جوجه‌درآوری", "۲۱ روز پس از شروع جوجه‌کشی در مرغ، جوجه از تخم خارج می‌شود."],
];

function Stages() {
  const [i, setI] = useState(0);
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex gap-1">
        {STAGES.map((_, k) => (
          <div key={k} className={"h-1.5 flex-1 rounded " + (k <= i ? "bg-[var(--accent)]" : "bg-[var(--input-border)]")} />
        ))}
      </div>
      <div className="text-sm font-bold">مرحله {i + 1} از {STAGES.length}: {STAGES[i][0]}</div>
      <p className="text-sm leading-7 text-[var(--text-secondary)]">{STAGES[i][1]}</p>
      <div className="flex gap-2">
        <Btn onClick={() => setI(Math.max(0, i - 1))}>قبلی</Btn>
        <Btn onClick={() => setI(Math.min(STAGES.length - 1, i + 1))}>بعدی</Btn>
      </div>
    </Card>
  );
}

function Simulate() {
  const [sire, setSire] = useState("AaBb");
  const [dam, setDam] = useState("AaBb");
  const [n, setN] = useState("40");
  const [res, setRes] = useState(null);

  const run = () => {
    const ps = parseGenotype(sire), pd = parseGenotype(dam);
    if (!ps || !pd || ps.length !== pd.length || ps.length > 3) { setRes({ err: true }); return; }
    const gs = gametes(ps), gd = gametes(pd);
    const count = Math.max(1, Math.min(500, parseInt(n) || 1));
    const chicks = [];
    for (let i = 0; i < count; i++) {
      const g = combine(randomPick(gs), randomPick(gd));
      chicks.push({ g, sex: Math.random() < 0.5 ? "نر" : "ماده" });
    }
    setRes({
      count,
      pheno: tally(chicks.map((c) => phenotype(c.g))),
      geno: tally(chicks.map((c) => c.g)),
      sex: tally(chicks.map((c) => c.sex)),
      sample: [randomPick(gs), randomPick(gd)],
    });
  };

  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-secondary)] leading-6">
        شبیه‌سازی تصادفی لقاح: هر جوجه از یک گامت تصادفی خروس و یک گامت تصادفی مرغ ساخته می‌شود. هر بار نتیجه کمی فرق می‌کند، درست مثل جوجه‌کشی واقعی.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Field label="خروس"><input dir="ltr" className={inputCls} value={sire} onChange={(e) => setSire(e.target.value)} /></Field>
        <Field label="مرغ"><input dir="ltr" className={inputCls} value={dam} onChange={(e) => setDam(e.target.value)} /></Field>
        <Field label="تعداد جوجه"><input className={inputCls} inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} /></Field>
      </div>
      <Btn onClick={run}>شبیه‌سازی کن</Btn>
      {res?.err && <p className="text-sm text-red-500">ژنوتیپ نامعتبر. مثال: Aa یا AaBb (هر دو با تعداد ژن یکسان).</p>}
      {res && !res.err && (
        <div className="text-sm leading-7">
          <div className="font-bold mb-1">فنوتیپ‌ها از {res.count} جوجه</div>
          <div dir="ltr" className="flex flex-wrap gap-2 font-mono text-xs">
            {Object.entries(res.pheno).sort().map(([k, v]) => (
              <span key={k} className="px-2 py-1 rounded border border-[var(--accent-border)] text-[var(--accent)]">{k}: {v} ({((v / res.count) * 100).toFixed(0)}٪)</span>
            ))}
          </div>
          <div className="font-bold mt-3 mb-1">ژنوتیپ‌ها</div>
          <div dir="ltr" className="flex flex-wrap gap-2 font-mono text-xs">
            {Object.entries(res.geno).sort().map(([k, v]) => (
              <span key={k} className="px-2 py-1 rounded border border-[var(--input-border)]">{k}: {v}</span>
            ))}
          </div>
          <div className="mt-3">جنسیت: نر {res.sex["نر"] || 0} — ماده {res.sex["ماده"] || 0}</div>
          <p className="text-xs text-[var(--text-secondary)] mt-2 leading-6">
            با تعداد کم، انحراف از نسبت‌های نظری عادی است. برای نزدیک شدن به نسبت‌ها (مثلاً ۹:۳:۳:۱) تعداد را بیشتر کنید.
          </p>
        </div>
      )}
    </Card>
  );
}

export default function FertilizationSimulator() {
  const [m, setM] = useState("sim");
  return (
    <div className="flex flex-col gap-3">
      <Pills items={[{ id: "sim", label: "شبیه‌ساز لقاح" }, { id: "stages", label: "مراحل تولیدمثل" }]} value={m} onChange={setM} />
      {m === "sim" ? <Simulate /> : <Stages />}
      <Accordion title="چرا هر جوجه متفاوت است؟">
        <p>در میوز، آلل‌ها مستقل از هم بین گامت‌ها تقسیم می‌شوند. یک خروس AaBb چهار نوع اسپرم AB، Ab، aB و ab به‌طور مساوی می‌سازد و هر تخمک با شانس برابر با یکی از آن‌ها لقاح می‌شود.</p>
      </Accordion>
    </div>
  );
}
