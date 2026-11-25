import React, { useState } from "react";
import { Card, Pills } from "./knowledgeShared.jsx";

const STROKE = "var(--text-secondary)";
const TXT = { fontSize: 12, fill: "currentColor" };

function EggSvg() {
  const L = ({ y, x1, x2, label, side }) => (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={STROKE} strokeWidth="0.8" />
      <text x={side === "r" ? x2 + 6 : x2 - 6} y={y + 4} textAnchor={side === "r" ? "start" : "end"} {...TXT}>{label}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 340 330" className="w-full" role="img" aria-label="ساختار تخم مرغ">
      <ellipse cx="170" cy="170" rx="82" ry="118" fill="#f2e9dc" stroke="#b79a76" strokeWidth="3" />
      <ellipse cx="170" cy="172" rx="72" ry="108" fill="#fff9ec" stroke="#d9c7a6" strokeWidth="1.5" />
      <ellipse cx="170" cy="178" rx="52" ry="82" fill="#fdf3cf" stroke="#e7d38c" strokeWidth="1" />
      <circle cx="170" cy="182" r="34" fill="#f2b63b" stroke="#d19a1f" strokeWidth="1.5" />
      <circle cx="170" cy="156" r="5" fill="#fff" stroke="#c68a12" strokeWidth="1" />
      <path d="M170 224 L170 262 M170 140 L170 82" stroke="#e7d38c" strokeWidth="3" />
      <ellipse cx="170" cy="66" rx="34" ry="12" fill="#ffffff" stroke="#d9c7a6" strokeWidth="1" />
      <L y={58} x1={204} x2={250} label="حفره هوایی" side="r" />
      <L y={90} x1={252} x2={280} label="پوسته آهکی" side="r" />
      <L y={125} x1={226} x2={262} label="سفیده غلیظ" side="r" />
      <L y={182} x1={204} x2={262} label="زرده" side="r" />
      <L y={156} x1={140} x2={96} label="دیسک جنینی" side="l" />
      <L y={250} x1={170} x2={96} label="کالازا" side="l" />
      <L y={285} x1={132} x2={96} label="سفیده رقیق" side="l" />
    </svg>
  );
}

function ChromSvg() {
  return (
    <svg viewBox="0 0 340 300" className="w-full" role="img" aria-label="ساختار کروموزوم">
      <g fill="var(--accent)" fillOpacity="0.85">
        <path d="M150 20 C130 20 128 50 140 80 L150 140 L140 200 C128 240 130 280 150 280 C168 280 170 250 168 220 L166 150 L168 80 C170 50 168 20 150 20Z" />
        <path d="M190 20 C170 20 172 50 172 80 L174 150 L172 220 C170 250 172 280 190 280 C210 280 212 240 200 200 L190 140 L200 80 C212 50 210 20 190 20Z" />
      </g>
      <circle cx="170" cy="150" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <g stroke={STROKE} strokeWidth="0.8">
        <line x1="212" y1="150" x2="250" y2="150" />
        <line x1="212" y1="60" x2="250" y2="60" />
        <line x1="212" y1="240" x2="250" y2="240" />
        <line x1="128" y1="100" x2="90" y2="100" />
        <line x1="128" y1="200" x2="90" y2="200" />
      </g>
      <text x="256" y="154" {...TXT}>سانترومر</text>
      <text x="256" y="64" {...TXT}>بازوی کوتاه (p)</text>
      <text x="256" y="244" {...TXT}>بازوی بلند (q)</text>
      <text x="84" y="104" textAnchor="end" {...TXT}>کروماتید ۱</text>
      <text x="84" y="204" textAnchor="end" {...TXT}>کروماتید ۲</text>
    </svg>
  );
}

function OviductSvg() {
  const rows = [
    ["تخمدان", "رشد و آزاد شدن زرده", "#f2b63b"],
    ["قیف (اینفاندیبولوم)", "لقاح — ۱۵ تا ۳۰ دقیقه", "#9bc7e8"],
    ["ماگنوم", "سفیده — حدود ۳ ساعت", "#cfe3b4"],
    ["ایستموس", "غشاهای پوسته — حدود ۱ تا ۱٫۵ ساعت", "#e8cfa2"],
    ["رحم (غده پوسته)", "پوسته آهکی — ۲۰ تا ۲۱ ساعت", "#d9c7e8"],
    ["واژن و کلواک", "تخم‌گذاری", "#e8b4b4"],
  ];
  return (
    <svg viewBox="0 0 340 370" className="w-full" role="img" aria-label="مسیر تشکیل تخم">
      {rows.map(([a, b, c], i) => (
        <g key={a}>
          <rect x="30" y={10 + i * 60} width="280" height="44" rx="10" fill={c} fillOpacity="0.55" stroke={c} />
          <text x="170" y={29 + i * 60} textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">{a}</text>
          <text x="170" y={46 + i * 60} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity="0.8">{b}</text>
          {i < rows.length - 1 && <path d={`M170 ${54 + i * 60} L170 ${70 + i * 60}`} stroke={STROKE} strokeWidth="1.5" markerEnd="url(#ar)" />}
        </g>
      ))}
      <defs>
        <marker id="ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8Z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
  );
}

const DIAGRAMS = [
  { id: "egg", label: "ساختار تخم", C: EggSvg, note: "حفره هوایی با گذشت زمان بزرگ‌تر می‌شود؛ از آن در نوربینی برای تخمین سن تخم و رشد جنین استفاده می‌شود." },
  { id: "chr", label: "کروموزوم", C: ChromSvg, note: "کروموزوم پیش از تقسیم، دو کروماتید خواهری متصل به سانترومر دارد." },
  { id: "ovi", label: "مجرای تخم", C: OviductSvg, note: "کل مسیر از آزاد شدن زرده تا تخم‌گذاری حدود ۲۴ تا ۲۶ ساعت طول می‌کشد." },
];

/* ---------- کتابخانه آفلاین: چک‌لیست‌ها ---------- */
const LISTS = [
  { t: "چک‌لیست آماده‌سازی فصل جفت‌گیری", items: [
    "سلامت و وزن خروس‌ها و مرغ‌ها بررسی شد",
    "تغذیه مولد (پروتئین و کلسیم کافی) تنظیم شد",
    "نسبت خروس به مرغ در هر جایگاه مشخص شد",
    "شجره و میزان خویشاوندی جفت‌ها بررسی شد",
    "برنامه نور ۱۴ تا ۱۶ ساعت تنظیم شد",
    "جایگاه و لانه‌ها تمیز و ضدعفونی شد",
  ]},
  { t: "چک‌لیست قبل از جوجه‌کشی", items: [
    "تخم‌ها بر اساس تمیزی و شکل انتخاب شد",
    "تاریخ و شماره مرغ یا جایگاه روی تخم‌ها ثبت شد",
    "انکوباتور یک روز قبل با دما و رطوبت تست شد",
    "تخم‌ها قبل از قرار دادن به دمای اتاق رسید",
    "تاریخ نوربینی (روز ۷ و ۱۴) و قفل (روز ۱۸) ثبت شد",
  ]},
  { t: "رکوردهای لازم برای اصلاح نژاد", items: [
    "شماره حلقه یا پلاک هر پرنده",
    "تاریخ تولد، والدین، نژاد و رنگ",
    "وزن در سنین مشخص (مثلاً ۸، ۱۶ و ۲۴ هفتگی)",
    "تعداد تخم و وزن تخم هر مرغ (در صورت امکان)",
    "باروری و جوجه‌درآوری هر جفت",
    "نقص‌ها و بیماری‌ها، و علت حذف پرنده",
  ]},
];

function Library() {
  const [done, setDone] = useState({});
  return (
    <div className="flex flex-col gap-3">
      {LISTS.map((l) => (
        <Card key={l.t}>
          <div className="text-sm font-bold mb-2">{l.t}</div>
          <div className="flex flex-col gap-1.5">
            {l.items.map((it) => {
              const k = l.t + it;
              return (
                <label key={k} className="flex items-start gap-2 text-sm leading-6 text-[var(--text-secondary)]">
                  <input type="checkbox" className="mt-1.5" checked={!!done[k]} onChange={() => setDone({ ...done, [k]: !done[k] })} />
                  <span className={done[k] ? "line-through opacity-60" : ""}>{it}</span>
                </label>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function VisualAtlas() {
  const [tab, setTab] = useState("egg");
  const items = [...DIAGRAMS.map((d) => ({ id: d.id, label: d.label })), { id: "lib", label: "کتابخانه (چک‌لیست)" }];
  const d = DIAGRAMS.find((x) => x.id === tab);
  return (
    <div className="flex flex-col gap-3">
      <Pills items={items} value={tab} onChange={setTab} />
      {d ? (
        <Card>
          <div dir="rtl" className="max-w-md mx-auto"><d.C /></div>
          <p className="text-sm leading-7 text-[var(--text-secondary)] mt-2">{d.note}</p>
        </Card>
      ) : <Library />}
    </div>
  );
}
