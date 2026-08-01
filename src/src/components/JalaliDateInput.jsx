import React from "react";
import { gregorianToJalali, jalaliToGregorian, jalaliMonthLength, JALALI_MONTHS } from "../lib/jalali.js";
import { inputCls } from "./ui.jsx";

export default function JalaliDateInput({ value, onChange, yearsBack = 20, yearsForward = 2 }) {
  const today = new Date();
  const [todayJy] = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());

  let jy = "", jm = "", jd = "";
  if (value) {
    const d = new Date(value + "T00:00:00");
    if (!isNaN(d.getTime())) {
      const [y, m, dd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
      jy = y;
      jm = m;
      jd = dd;
    }
  }

  const years = [];
  for (let y = todayJy + yearsForward; y >= todayJy - yearsBack; y--) years.push(y);

  const dayCount = jalaliMonthLength(Number(jy) || todayJy, Number(jm) || 1);
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);

  function emit(newJy, newJm, newJd) {
    const y = Number(newJy) || todayJy;
    const m = Number(newJm) || 1;
    const maxD = jalaliMonthLength(y, m);
    let d = Number(newJd) || 1;
    if (d > maxD) d = maxD;
    const [gy, gm, gd] = jalaliToGregorian(y, m, d);
    const iso = `${String(gy).padStart(4, "0")}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
    onChange(iso);
  }

  return (
    <div className="flex gap-1.5">
      <select className={`${inputCls} flex-1`} value={jd} onChange={(e) => emit(jy, jm, e.target.value)}>
        <option value="">روز</option>
        {days.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select className={`${inputCls} flex-[1.5]`} value={jm} onChange={(e) => emit(jy, e.target.value, jd)}>
        <option value="">ماه</option>
        {JALALI_MONTHS.map((m, i) => (
          <option key={i} value={i + 1}>{m}</option>
        ))}
      </select>
      <select className={`${inputCls} flex-1`} value={jy} onChange={(e) => emit(e.target.value, jm, jd)}>
        <option value="">سال</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
