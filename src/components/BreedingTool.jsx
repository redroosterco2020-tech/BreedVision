import React, { useState } from "react";
import { Card, Pills, Field, inputCls, Table } from "./knowledgeShared.jsx";
import { PairPlanner, FlockStatus } from "./BreedingFlock.jsx";
import { GoalHeritability } from "./BreedingGoals.jsx";

const num = (v) => parseFloat(String(v).replace(",", "."));

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
        برای برنامه‌ریزی: تعداد نر و ماده مولد را فرضی وارد کنید تا اندازه مؤثر جمعیت و افزایش همخونی برآورد شود.
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
    { id: "goals", label: "اهداف و وراثت‌پذیری" },
  { id: "resp", label: "پاسخ به انتخاب" },
  { id: "pop", label: "برنامه‌ریزی گله" },
  { id: "h2", label: "وراثت‌پذیری" },
];
export default function BreedingTool({ breeders = [], goalWeights = {} }) {
  const [t, setT] = useState("pair");
  return (
    <div className="flex flex-col gap-3">
      <Pills items={TOOLS} value={t} onChange={setT} />
      {t === "pair" && <PairPlanner breeders={breeders} />}
      {t === "flock" && <FlockStatus breeders={breeders} />}
            {t === "goals" && <GoalHeritability breeders={breeders} goalWeights={goalWeights} />}
      {t === "resp" && <Response />}
      {t === "pop" && <Pop />}
      {t === "h2" && <H2Table />}
    </div>
  );
          }
