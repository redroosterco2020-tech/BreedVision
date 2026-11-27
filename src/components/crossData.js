// داده ژن‌ها و محاسبات شبیه‌ساز تلاقی نژادها (بدون وابستگی خارجی)
// ژنوتیپ‌ها با A (آلل اول) و a (آلل دوم) کدگذاری می‌شوند.
// اتوزومی: AA / Aa / aa ، وابسته به جنس (Z): نر AA / Aa / aa ، ماده A / a

export const GENES = [
  { id: "white_dom", label: "سفید غالب", names: ["I", "i"], loc: "auto",
    ph: { AA: "سفید", Aa: "سفید (گاهی لکه‌های رنگی ریز)", aa: "رنگی" } },
  { id: "blue", label: "آبی آندلوسی (روی زمینه سیاه)", names: ["Bl", "bl"], loc: "auto",
    ph: { AA: "اسپلش (سفید کدر با لکه)", Aa: "آبی", aa: "سیاه" } },
  { id: "rec_white", label: "سفید مغلوب", names: ["C", "c"], loc: "auto",
    ph: { AA: "رنگی", Aa: "رنگی (حامل سفید)", aa: "سفید" } },
  { id: "naked", label: "گردن‌برهنه", names: ["Na", "na"], loc: "auto",
    ph: { AA: "گردن‌برهنه (کامل)", Aa: "گردن‌برهنه (با کمی پر)", aa: "گردن پردار (عادی)" } },
  { id: "frizzle", label: "فریزل", names: ["F", "f"], loc: "auto",
    ph: { AA: "فریزل شدید", Aa: "فریزل", aa: "پر عادی" } },
  { id: "crest", label: "کاکل", names: ["Cr", "cr"], loc: "auto",
    ph: { AA: "کاکل‌دار", Aa: "کاکل‌دار", aa: "بدون کاکل" } },
  { id: "blue_egg", label: "تخم آبی", names: ["O", "o"], loc: "auto",
    ph: { AA: "تخم آبی", Aa: "تخم آبی", aa: "تخم غیرآبی" } },
  { id: "barring", label: "نواربندی (وابسته به جنس)", names: ["B", "b"], loc: "Z",
    ph: { AA: "نواربندی (روشن‌تر)", Aa: "نواربندی", aa: "بدون نوار", A: "نواربندی", a: "بدون نوار" } },
  { id: "silver", label: "نقره‌ای / طلایی (وابسته به جنس)", names: ["S", "s"], loc: "Z",
    ph: { AA: "نقره‌ای", Aa: "نقره‌ای", aa: "طلایی", A: "نقره‌ای", a: "طلایی" } },
  { id: "slow", label: "پرگیری کند (وابسته به جنس)", names: ["K", "k"], loc: "Z",
    ph: { AA: "پرگیری کند", Aa: "پرگیری کند", aa: "پرگیری سریع", A: "پرگیری کند", a: "پرگیری سریع" } },
  { id: "dwarf", label: "کوتولگی (وابسته به جنس، مغلوب)", names: ["Dw", "dw"], loc: "Z",
    ph: { AA: "اندازه عادی", Aa: "اندازه عادی (حامل)", aa: "کوتوله", A: "اندازه عادی", a: "کوتوله" } },
];

const fA = (g) => ({ AA: 1, Aa: 0.5, aa: 0 })[g];
const fF = (g) => ({ A: 1, a: 0 })[g];
const dist = (a, b) => [a * b, a * (1 - b) + (1 - a) * b, (1 - a) * (1 - b)];

function group(sex, keys, probs, ph) {
  const m = new Map();
  keys.forEach((k, i) => m.set(ph[k], (m.get(ph[k]) || 0) + probs[i]));
  return { sex, items: [...m].filter(([, p]) => p > 0.0005).map(([label, p]) => ({ label, p })) };
}

// sireG: AA/Aa/aa ، damG: برای اتوزومی مثل sireG ؛ برای Z فقط A یا a
export function geneCross(gene, sireG, damG) {
  const gens = [];
  if (gene.loc === "auto") {
    const ps = fA(sireG), pd = fA(damG);
    if (ps === undefined || pd === undefined) return null;
    let a = ps, b = pd;
    for (let i = 1; i <= 3; i++) {
      const d = dist(a, b);
      gens.push({ name: "F" + i, groups: [group("all", ["AA", "Aa", "aa"], d, gene.ph)] });
      const p = d[0] + d[1] / 2;
      a = p; b = p;
    }
  } else {
    let M = fA(sireG), W = fF(damG);
    if (M === undefined || W === undefined) return null;
    for (let i = 1; i <= 3; i++) {
      const dm = dist(M, W);
      gens.push({
        name: "F" + i,
        groups: [
          group("male", ["AA", "Aa", "aa"], dm, gene.ph),
          group("female", ["A", "a"], [M, 1 - M], gene.ph),
        ],
      });
      const nM = (M + W) / 2, nW = M;
      M = nM; W = nW;
    }
  }
  const labels = (g) => new Set(g.groups.flatMap((x) => x.items.map((i) => i.label)));
  const f1 = labels(gens[0]);
  const newInF2 = [...labels(gens[1])].filter((l) => !f1.has(l));
  return { gens, newInF2 };
}

// H = بهبود ناشی از هتروزیس (٪) ، S = بهبود انتخاب در هر نسل (٪ از میانگین)
export function quantCross({ d, s, h2, inverse, H = 0, S = 0 }) {
  if (!isFinite(d) || !isFinite(s)) return null;
  const sign = inverse ? -1 : 1;
  const mid = (d + s) / 2;
  const f1 = mid * (1 + (sign * H) / 100);
  const base2 = mid * (1 + (sign * H) / 200); // در F2 نصف هتروزیس F1 باقی می‌ماند
  const R = h2 * (S / 100) * mid;
  return { mid, f1, f2: base2 + sign * R, f3: base2 + sign * 2 * R };
   }
