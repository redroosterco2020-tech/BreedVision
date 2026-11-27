// موتور ژنتیک کمی BreedVision — بدون وابستگی خارجی
// h² ، BLUP (مدل حیوانی) برای EBV ، شدت انتخاب ، فاصله نسلی ، پیشرفت ژنتیکی
import { buildPedigree } from "./pedigree.js";

export const toNum = (v) => {
  if (v === "" || v == null) return NaN;
  return parseFloat(String(v).replace(",", "."));
};

/* ---------------- توزیع نرمال و شدت انتخاب ---------------- */
export const phi = (x) => Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI);

function erf(x) {
  const s = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
  return s * y;
}
export const Phi = (x) => 0.5 * (1 + erf(x / Math.SQRT2));

// نقطه‌ای که احتمال دم راست آن p است
export function upperPoint(p) {
  let lo = -10, hi = 10;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (1 - Phi(mid) > p) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// شدت انتخاب برای جمعیت بی‌نهایت (نرمال): i = z / p
export function selectionIntensity(p) {
  if (!(p > 0) || p > 1) return NaN;
  if (p >= 1) return 0;
  return phi(upperPoint(p)) / p;
}

/* ---------------- رگرسیون ساده و برآورد h² ---------------- */
export function ols(x, y) {
  const n = x.length;
  if (n < 3) return null;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (x[i] - mx) ** 2;
    sxy += (x[i] - mx) * (y[i] - my);
    syy += (y[i] - my) ** 2;
  }
  if (sxx === 0) return null;
  const b = sxy / sxx;
  const se = Math.sqrt(Math.max(0, (syy - b * sxy) / (n - 2)) / sxx);
  return { n, b, se };
}

// برآورد h² از رگرسیون نتاج بر والدین (حداقل ۱۰ جفت)
export function estimateH2(breeders, field) {
  const byId = new Map(breeders.map((b) => [b.id, b]));
  const mp = { x: [], y: [] }, sire = { x: [], y: [] }, dam = { x: [], y: [] };
  breeders.forEach((o) => {
    const y = toNum(o[field]);
    if (!isFinite(y)) return;
    const s = byId.get(o.sireId), d = byId.get(o.damId);
    const ps = s ? toNum(s[field]) : NaN, pd = d ? toNum(d[field]) : NaN;
    if (isFinite(ps) && isFinite(pd)) { mp.x.push((ps + pd) / 2); mp.y.push(y); }
    if (isFinite(ps)) { sire.x.push(ps); sire.y.push(y); }
    if (isFinite(pd)) { dam.x.push(pd); dam.y.push(y); }
  });
  const make = (name, d, mult) => {
    const r = d.x.length >= 10 ? ols(d.x, d.y) : null;
    return { name, n: d.x.length, h2: r ? r.b * mult : null, se: r ? r.se * mult : null };
  };
  return [
    make("نتاج × میانگین والدین", mp, 1),
    make("نتاج × پدر", sire, 2),
    make("نتاج × مادر", dam, 2),
  ];
}

/* ---------------- BLUP مدل حیوانی ---------------- */
// parents[i] = [sireIdx|null, damIdx|null] ، F[i] = ضریب همخونی حیوان i
export function buildAinv(parents, F) {
  const n = parents.length;
  const M = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    const [s, d] = parents[i];
    const Fs = s != null ? F[s] : 0, Fd = d != null ? F[d] : 0;
    let dii;
    if (s != null && d != null) dii = 0.5 - 0.25 * (Fs + Fd);
    else if (s != null || d != null) dii = 0.75 - 0.25 * (s != null ? Fs : Fd);
    else dii = 1;
    const b = 1 / dii;
    M[i][i] += b;
    if (s != null) { M[i][s] -= b / 2; M[s][i] -= b / 2; M[s][s] += b / 4; }
    if (d != null) { M[i][d] -= b / 2; M[d][i] -= b / 2; M[d][d] += b / 4; }
    if (s != null && d != null) { M[s][d] += b / 4; M[d][s] += b / 4; }
  }
  return M;
}

export function invertMatrix(A) {
  const n = A.length;
  const M = A.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    const div = M[c][c];
    for (let j = 0; j < 2 * n; j++) M[c][j] /= div;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c];
      if (f === 0) continue;
      for (let j = 0; j < 2 * n; j++) M[r][j] -= f * M[c][j];
    }
  }
  return M.map((r) => r.slice(n));
}

export const BLUP_MAX = 300;

export function sampleVar(vals) {
  const n = vals.length;
  if (n < 2) return NaN;
  const m = vals.reduce((a, b) => a + b, 0) / n;
  return vals.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1);
}

// خروجی: { mu, rows:[{id, ebv, acc, y, F}], sa2, se2, vp, nrec } یا { error }
export function blup(breeders, field, h2) {
  if (!(h2 > 0 && h2 < 1)) return { error: "h2" };
  if (breeders.length > BLUP_MAX) return { error: "size" };
  const ped = buildPedigree(breeders);
  const idx = new Map(breeders.map((b, i) => [b.id, i]));
  const n = breeders.length;
  const y = breeders.map((b) => toNum(b[field]));
  const recIdx = y.map((v, i) => (isFinite(v) ? i : -1)).filter((i) => i >= 0);
  if (recIdx.length < 5) return { error: "records" };
  const vp = sampleVar(recIdx.map((i) => y[i]));
  if (!(vp > 0)) return { error: "variance" };

  const sa2 = h2 * vp, se2 = (1 - h2) * vp, alpha = se2 / sa2;
  const parents = breeders.map((b) => {
    const s = ped.byId[b.sireId] ? b.sireId : null;
    const d = ped.byId[b.damId] ? b.damId : null;
    return [s != null && idx.has(s) ? idx.get(s) : null, d != null && idx.has(d) ? idx.get(d) : null];
  });
  const F = breeders.map((b) => ped.selfF(b.id));
  const Ainv = buildAinv(parents, F);

  const N = n + 1;
  const C = Array.from({ length: N }, () => new Array(N).fill(0));
  const rhs = new Array(N).fill(0);
  C[0][0] = recIdx.length;
  recIdx.forEach((i) => {
    C[0][i + 1] = 1; C[i + 1][0] = 1; C[i + 1][i + 1] += 1;
    rhs[0] += y[i]; rhs[i + 1] = y[i];
  });
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) C[i + 1][j + 1] += Ainv[i][j] * alpha;

  const Cinv = invertMatrix(C);
  if (!Cinv) return { error: "singular" };
  const sol = Cinv.map((row) => row.reduce((a, v, j) => a + v * rhs[j], 0));

  const rows = breeders.map((b, i) => {
    const pev = Cinv[i + 1][i + 1] * se2;
    const rel = 1 - pev / (sa2 * (1 + F[i]));
    return { id: b.id, ebv: sol[i + 1], acc: Math.sqrt(Math.max(0, Math.min(1, rel))), y: isFinite(y[i]) ? y[i] : null, F: F[i] };
  });
  return { mu: sol[0], rows, sa2, se2, vp, nrec: recIdx.length };
}

/* ---------------- فاصله نسلی ---------------- */
const YEAR = 365.25 * 24 * 3600 * 1000;

export function generationInterval(breeders) {
  const byId = new Map(breeders.map((b) => [b.id, b]));
  const sAges = [], dAges = [];
  breeders.forEach((o) => {
    const od = new Date(o.birthDate).getTime();
    if (!isFinite(od)) return;
    const add = (pid, arr) => {
      const p = byId.get(pid);
      if (!p) return;
      const pd = new Date(p.birthDate).getTime();
      const age = (od - pd) / YEAR;
      if (isFinite(age) && age > 0.2 && age < 15) arr.push(age);
    };
    add(o.sireId, sAges);
    add(o.damId, dAges);
  });
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  return { Ls: mean(sAges), Ld: mean(dAges), ns: sAges.length, nd: dAges.length };
}

/* ---------------- پاسخ به انتخاب و پیشرفت سالانه ---------------- */
// pm, pf = نسبت انتخاب‌شده‌ها ؛ rm, rf = دقت انتخاب ؛ Lm, Lf = فاصله نسلی (سال) ؛ sigmaA = انحراف معیار افزایشی
export function geneticGain({ pm, pf, rm, rf, Lm, Lf, sigmaA }) {
  const im = selectionIntensity(pm), iff = selectionIntensity(pf);
  if (![im, iff, rm, rf, Lm, Lf, sigmaA].every(isFinite) || Lm + Lf <= 0) return null;
  return {
    im,
    if: iff,
    perGen: ((im * rm + iff * rf) / 2) * sigmaA,
    perYear: ((im * rm + iff * rf) * sigmaA) / (Lm + Lf),
  };
}
