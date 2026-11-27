import React, { useMemo, useState } from "react";
import { Card, Btn } from "./knowledgeShared.jsx";
import { blup, BLUP_MAX } from "./quantEngine.js";

const nameOf = (b) => (b.tag || "") + (b.tag && b.name ? " — " : "") + (b.name || "");
const sgn = (x) => (x > 0 ? "+" : "") + x.toFixed(2);

const ERR = {
  h2: "h² باید بین ۰ و ۱ باشد.",
  size: "تعداد پرنده‌ها بیش از " + BLUP_MAX + " است؛ محاسبه EBV در برنامه برای این اندازه محدود شده است.",
  records: "برای محاسبه EBV حداقل ۵ رکورد برای این صفت لازم است.",
  variance: "همه رکوردها یکسان‌اند و واریانس صفر است.",
  singular: "محاسبه ممکن نشد؛ شجره ناسازگار یا داده نامعتبر است.",
};

export default function QuantEbv({ flock, field, meta, h2 }) {
  const [all, setAll] = useState(false);
  const res = useMemo(() => blup(flock, field, h2), [flock, field, h2]);

  if (res.error)
    return (
      <Card>
        <p className="text-sm text-[var(--text-secondary)] leading-7">{ERR[res.error]}</p>
      </Card>
    );

  const byId = new Map(flock.map((b) => [b.id, b]));
  const dir = meta.inverse ? 1 : -1;
  const rows = [...res.rows].sort((a, b) => dir * (a.ebv - b.ebv));
  const shown = all ? rows : rows.slice(0, 15);
  const meanAcc = res.rows.reduce((s, r) => s + r.acc, 0) / res.rows.length;

  return (
    <div className="flex flex-col gap-3">
      <Card className="text-sm leading-7">
        <div>تعداد رکورد: <b>{res.nrec}</b> از {flock.length} پرنده</div>
        <div>میانگین پایه گله: <b>{res.mu.toFixed(2)}</b> {meta.unit}</div>
        <div>میانگین دقت EBV: <b>{Math.round(meanAcc * 100)}٪</b></div>
        <p className="text-[11px] text-[var(--text-secondary)] leading-6 mt-1">
          EBV انحراف ژنتیکی پرنده از میانگین پایه همین گله است و فقط درون همین گله قابل مقایسه است.
          {meta.inverse ? " برای این صفت کمتر بهتر است و فهرست از کمترین EBV شروع می‌شود." : ""}
        </p>
      </Card>

      {shown.map((r, i) => {
        const b = byId.get(r.id);
        if (!b) return null;
        return (
          <Card key={r.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold">{i + 1}. {nameOf(b)}</span>
              <span className="text-sm font-bold text-[var(--accent)]" dir="ltr">{sgn(r.ebv)}</span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] flex flex-wrap gap-x-3">
              <span>{b.sex === "male" ? "نر" : "ماده"}</span>
              <span>دقت: {Math.round(r.acc * 100)}٪</span>
              <span>{r.y != null ? "رکورد: " + r.y : "بدون رکورد (برآورد از خویشاوندان)"}</span>
              {r.F > 0.001 && <span>همخونی: {(r.F * 100).toFixed(1)}٪</span>}
              {b.mortality && <span>تلف‌شده</span>}
            </div>
          </Card>
        );
      })}

      {rows.length > 15 && <Btn onClick={() => setAll(!all)}>{all ? "نمایش ۱۵ مورد اول" : "نمایش همه"}</Btn>}

      <p className="text-[11px] text-[var(--text-secondary)] leading-6">
        مدل: BLUP مدل حیوانی با h² واردشده و میانگین کل به‌عنوان تنها اثر ثابت. اثر سن، جنس و گروه همزمان جدا مدل نشده است و برای صفات محدود به جنس (مثل تولید تخم) EBV نرها فقط از خویشاوندان آمده است. دقت پایین یعنی اطلاعات شجره و رکورد کم است. برآورد آموزشی است، نه پیش‌بینی قطعی.
      </p>
    </div>
  );
}
