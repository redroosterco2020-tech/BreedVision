// شاخص انتخاب چندصفتی (هیزل) و شاخص بر پایه EBV — بدون وابستگی خارجی
import { invertMatrix, toNum, blup } from "./quantEngine.js";

const mulMV = (M, v) => M.map((r) => r.reduce((s, x, i) => s + x * v[i], 0));

// بررسی مثبت‌معین بودن ماتریس متقارن (چولسکی)
export function isPD(M) {
  const n = M.length;
  const L = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s = M[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) {
        if (s <= 1e-12) return false;
        L[i][i] = Math.sqrt(s);
      } else L[i][j] = s / L[j][j];
    }
  }
  return true;
}

// همبستگی فنوتیپی دو صفت از رکوردهای گله (حداقل ۱۰ جفت)
export function phenCorr(flock, f1, f2) {
  const x = [], y = [];
  flock.forEach((b) => {
    const u = toNum(b[f1]), v = toNum(b[f2]);
    if (isFinite(u) && isFinite(v)) { x.push(u); y.push(v); }
  });
  const n = x.length;
  if (n < 10) return { r: null, n };
  const mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, syy = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; sxy += (x[i] - mx) * (y[i] - my);
  }
  if (sxx === 0 || syy === 0) return { r: null, n };
  return { r: sxy / Math.sqrt(sxx * syy), n };
}

// sigP[j] ، h2[j] ، rp / rg = ماتریس همبستگی فنوتیپی / ژنتیکی ، a[j] = وزن اقتصادی (برای صفت معکوس منفی)
export function hazelIndex({ sigP, h2, rp, rg, a }) {
  const m = sigP.length;
  const sigA = sigP.map((s, j) => Math.sqrt(h2[j]) * s);
  const P = [], G = [];
  for (let j = 0; j < m; j++) {
    P.push([]); G.push([]);
    for (let k = 0; k < m; k++) {
      P[j][k] = j === k ? sigP[j] ** 2 : rp[j][k] * sigP[j] * sigP[k];
      G[j][k] = j === k ? h2[j] * sigP[j] ** 2 : rg[j][k] * sigA[j] * sigA[k];
    }
  }
  if (!isPD(P)) return { error: "P" };
  if (!isPD(G)) return { error: "G" };
  const Pinv = invertMatrix(P);
  if (!Pinv) return { error: "P" };
  const Ga = mulMV(G, a);
  const b = mulMV(Pinv, Ga);
  const Pb = mulMV(P, b);
  const sigI2 = b.reduce((s, x, i) => s + x * Pb[i], 0);
  const sigH2 = a.reduce((s, x, i) => s + x * Ga[i], 0);
  if (!(sigI2 > 0) || !(sigH2 > 0)) return { error: "zero" };
  return { b, Ga, Gb: mulMV(G, b), sigI: Math.sqrt(sigI2), sigH: Math.sqrt(sigH2), rIH: Math.sqrt(sigI2 / sigH2), sigA, sigP };
}

// پیشرفت مورد انتظار هر صفت در هر نسل با شدت انتخاب i
export function indexResponse(res, i) {
  return { perTrait: res.Gb.map((g) => (i * g) / res.sigI), dH: i * res.sigI };
}

// کارایی نسبی شاخص در برابر انتخاب فقط روی هر صفت
export function singleEfficiency(res, i) {
  return res.Ga.map((g, j) => {
    const dHj = (i * g) / res.sigP[j];
    return { dHj, eff: dHj > 0 ? (i * res.sigI) / dHj : null };
  });
}

// نمره شاخص برای پرنده‌هایی که همه صفات را دارند
export function indexScores(cands, fields, b, means, sigI) {
  const out = [];
  cands.forEach((o) => {
    let s = 0, ok = true;
    fields.forEach((f, j) => {
      const v = toNum(o[f]);
      if (!isFinite(v)) ok = false; else s += b[j] * (v - means[j]);
    });
    if (ok) out.push({ id: o.id, score: s / sigI });
  });
  return out;
}

// شاخص بر پایه EBV: میانگین وزنی EBVهای استاندارد (واحد: انحراف معیار ژنتیکی)
export function ebvMerit(flock, traits) {
  const totalW = traits.reduce((s, t) => s + t.w, 0);
  const per = traits.map((t) => blup(flock, t.k, t.h2));
  const bad = per.findIndex((r) => r.error);
  if (bad >= 0) return { error: per[bad].error, field: traits[bad].k };
  const rows = flock.map((b, i) => {
    let merit = 0, minAcc = 1;
    const parts = per.map((r, j) => {
      const row = r.rows[i];
      const z = row.ebv / Math.sqrt(r.sa2);
      merit += (traits[j].w / totalW) * (traits[j].inverse ? -1 : 1) * z;
      minAcc = Math.min(minAcc, row.acc);
      return row.ebv;
    });
    return { id: b.id, score: merit, parts, minAcc };
  });
  return { rows };
}
