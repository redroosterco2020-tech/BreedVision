// ابزارهای مشترک ژنتیک (بدون وابستگی خارجی)

// ژنوتیپ مثل "AaBb" => [["A","a"],["B","b"]]
export function parseGenotype(str) {
  const s = (str || "").replace(/\s+/g, "");
  if (s.length === 0 || s.length % 2 !== 0) return null;
  const loci = [];
  for (let i = 0; i < s.length; i += 2) {
    const a = s[i], b = s[i + 1];
    if (a.toLowerCase() !== b.toLowerCase()) return null;
    loci.push([a, b]);
  }
  return loci;
}

// همه گامت‌های ممکن (هر کدام با احتمال برابر)
export function gametes(loci) {
  let out = [""];
  for (const [a, b] of loci) {
    const next = [];
    for (const g of out) {
      next.push(g + a);
      next.push(g + b);
    }
    out = next;
  }
  return out;
}

// ترکیب دو گامت => ژنوتیپ مرتب (بزرگ قبل از کوچک)
export function combine(g1, g2) {
  let r = "";
  for (let i = 0; i < g1.length; i++) {
    const pair = [g1[i], g2[i]];
    const up = pair.filter((c) => c === c.toUpperCase());
    const low = pair.filter((c) => c !== c.toUpperCase());
    r += up.concat(low).join("");
  }
  return r;
}

// فنوتیپ با غالبیت کامل: "AaBb" => "A_B_"
export function phenotype(geno) {
  let r = "";
  for (let i = 0; i < geno.length; i += 2) {
    const a = geno[i], b = geno[i + 1];
    r += a === a.toUpperCase() || b === b.toUpperCase() ? a.toUpperCase() + "_" : a.toLowerCase() + a.toLowerCase();
  }
  return r;
}

export function tally(list) {
  const m = {};
  list.forEach((x) => (m[x] = (m[x] || 0) + 1));
  return m;
}

export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
