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

  function emi
