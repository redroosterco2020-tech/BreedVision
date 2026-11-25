import React, { useState } from "react";
import { Card, Pills, SearchBox } from "./knowledgeShared.jsx";

// mode: Z = وابسته به جنس، D = غالب، R = مغلوب، I = ناقص‌غالب
const GENES = [
  { n: "نواربندی", sym: "B / b+", loc: "Z", mode: "Z", dom: "غالب",
    d: "الگوی نوار سیاه و سفید (مثل بارد راک). نر با دو نسخه B روشن‌تر از ماده است." },
  { n: "نقره‌ای / طلایی", sym: "S / s+", loc: "Z", mode: "Z", dom: "S غالب",
    d: "S پر نقره‌ای/سفید و s+ طلایی/قهوه‌ای. پایه جفت‌گیری اتوسکس رنگی." },
  { n: "پرگیری کند", sym: "K / k+", loc: "Z", mode: "Z", dom: "K غالب",
    d: "K پرگیری کند و k+ پرگیری سریع. برای تشخیص جنسیت جوجه یک‌روزه از طول پر بال." },
  { n: "کوتولگی وابسته به جنس", sym: "dw", loc: "Z", mode: "Z", dom: "مغلوب",
    d: "جثه کوچک‌تر. در ماده با یک نسخه دیده می‌شود." },
  { n: "سفید غالب", sym: "I", loc: "اتوزوم", mode: "D", dom: "غالب",
    d: "مانع تولید رنگدانه سیاه در پر می‌شود. معمولاً با لکه‌های رنگی ریز همراه است." },
  { n: "سفید مغلوب", sym: "c", loc: "اتوزوم", mode: "R", dom: "مغلوب",
    d: "کاهش شدید رنگدانه (سفید خالص)، مثل مرغ سیلکی سفید." },
  { n: "آبی آندلوسی", sym: "Bl", loc: "اتوزوم", mode: "I", dom: "ناقص‌غالب",
    d: "Bl/bl آبی، Bl/Bl اسپلش (سفید کدر با لکه) و bl/bl سیاه. دو آبی هرگز آبی خالص نمی‌دهند: ۱ سیاه : ۲ آبی : ۱ اسپلش." },
  { n: "سیاه گسترده", sym: "E", loc: "اتوزوم", mode: "D", dom: "غالب",
    d: "گسترش رنگدانه سیاه روی بدن." },
  { n: "تاج گل‌سرخی", sym: "R", loc: "اتوزوم", mode: "D", dom: "غالب",
    d: "تاج پهن و پرزدار. در ترکیب با P، تاج گردویی می‌دهد." },
  { n: "تاج نخودی", sym: "P", loc: "اتوزوم", mode: "D", dom: "غالب",
    d: "تاج سه‌ردیفه کوتاه. تاج ساده rrpp است." },
  { n: "تاج گردویی", sym: "R_P_", loc: "اتوزوم", mode: "D", dom: "برهم‌کنش",
    d: "حاصل بودن همزمان R و P. نمونه کلاسیک برهم‌کنش ژنی (اپیستازی): ۹ گردویی : ۳ گل‌سرخی : ۳ نخودی : ۱ ساده." },
  { n: "کاکل", sym: "Cr", loc: "اتوزوم", mode: "D", dom: "غالب",
    d: "تاج پر روی سر. ممکن است با کاهش جوجه‌درآوری همراه باشد." },
  { n: "گردن‌برهنه", sym: "Na", loc: "اتوزوم", mode: "I", dom: "ناقص‌غالب",
    d: "کاهش پر گردن. Na/Na برهنه‌تر از Na/na+ است." },
  { n: "فریزل", sym: "F", loc: "اتوزوم", mode: "I", dom: "ناقص‌غالب",
    d: "پرهای فرخورده. F/F اغلب پرهای شکننده و مشکل تنظیم دما دارد، پس معمولاً F×نرمال توصیه می‌شود." },
  { n: "لوندر (بنفش)", sym: "lav", loc: "اتوزوم", mode: "R", dom: "مغلوب",
    d: "رقیق شدن رنگ سیاه به خاکستری نقره‌ای روشن." },
  { n: "پوست سفید", sym: "W / w", loc: "اتوزوم", mode: "D", dom: "W (پوست سفید) غالب",
    d: "رنگ پوست و ساق‌ها وابسته به ژن‌های متعدد است. زرد بودن پوست مغلوب است." },
  { n: "فیبرومالانوز", sym: "Fm", loc: "اتوزوم", mode: "D", dom: "غالب",
    d: "رنگ سیاه در بافت‌ها (سیلکی سیاه‌گوشت). غالب است." },
  { n: "تخم آبی", sym: "O", loc: "اتوزوم", mode: "D", dom: "غالب",
    d: "پوسته آبی (آروکانا). پوسته در تمام ضخامت رنگی است." },
];

const FILTERS = [
  { id: "all", label: "همه" },
  { id: "Z", label: "وابسته به جنس" },
  { id: "D", label: "غالب" },
  { id: "R", label: "مغلوب" },
  { id: "I", label: "ناقص‌غالب" },
];

export default function GeneticBank() {
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");
  const list = GENES.filter(
    (g) => (f === "all" || g.mode === f) && (g.n + g.sym + g.d).toLowerCase().includes(q.trim().toLowerCase())
  );
  return (
    <div className="flex flex-col gap-3">
      <SearchBox value={q} onChange={setQ} placeholder="جستجوی صفت یا نماد ژن..." />
      <Pills items={FILTERS} value={f} onChange={setF} />
      <p className="text-xs text-[var(--text-secondary)]">{list.length} مورد</p>
      {list.map((g) => (
        <Card key={g.n}>
          <div className="flex items-center justify-between gap-2">
            <div className="font-bold text-sm">{g.n}</div>
            <div dir="ltr" className="text-xs font-mono text-[var(--accent)]">{g.sym}</div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5 text-[11px] text-[var(--text-secondary)]">
            <span className="px-2 py-0.5 rounded-full border border-[var(--input-border)]">جایگاه: {g.loc}</span>
            <span className="px-2 py-0.5 rounded-full border border-[var(--input-border)]">{g.dom}</span>
          </div>
          <p className="text-sm leading-7 text-[var(--text-secondary)] mt-2">{g.d}</p>
        </Card>
      ))}
    </div>
  );
}
