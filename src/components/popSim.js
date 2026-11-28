// شبیه‌سازی جمعیت چندنسلی (مدل بی‌نهایت‌جایگاهی افزایشی) — بدون وابستگی خارجی
import { selectionIntensity } from "./quantEngine.js";

export const SIM_MAX_N = 400;
export const simCost = (P) => (P.Nm + P.Nf) ** 2 * P.gens * P.reps;
export const SIM_MAX_COST = 6e8;

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(seed) {
  const next = mulberry32(seed >>> 0);
  let spare = null;
  const gauss = () => {
    if (spare !== null) { const v = spare; spare = null; return v; }
    let u = 0;
    while (u === 0) u = next();
    const v = next();
    const mag = Math.sqrt(-2 * Math.log(u));
    spare = mag * Math.sin(2 * Math.PI * v);
    return mag * Math.cos(2 * Math.PI * v);
  };
  return { next, gauss };
}

const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sdOf = (a) => {
  if (a.length < 2) return 0;
  const m = avg(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
};
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);

// نسل‌های جدا؛ A = ماتریس خویشاوندی افزایشی نسل جاری (برای همخونی)
function runRep(P, rng) {
  const { Nm, Nf, Sm, Sf, r, gens, sigA, avoidKin } = P;
  const N = Nm + Nf;
  let a = new Float64Array(N);
  for (let i = 0; i < N; i++) a[i] = sigA * rng.gauss();
  let A = new Float64Array(N * N);
  for (let i = 0; i < N; i++) A[i * N + i] = 1;
  const critNoise = r >= 1 ? 0 : sigA * Math.sqrt(1 / (r * r) - 1);
  const stats = [];
  const record = () => {
    let m = 0, f = 0;
    for (let i = 0; i < N; i++) { m += a[i]; f += A[i * N + i] - 1; }
    m /= N; f /= N;
    let v = 0;
    for (let i = 0; i < N; i++) v += (a[i] - m) ** 2;
    stats.push({ meanA: m, meanF: f, sdA: Math.sqrt(v / (N - 1)) });
  };
  record();
  for (let g = 1; g <= gens; g++) {
    const crit = Array.from(a, (x) => x + critNoise * rng.gauss());
    const males = range(0, Nm).sort((i, j) => crit[j] - crit[i]).slice(0, Sm);
    const females = range(Nm, N).sort((i, j) => crit[j] - crit[i]).slice(0, Sf);
    const ps = new Int32Array(N), pd = new Int32Array(N);
    const na = new Float64Array(N);
    for (let o = 0; o < N; o++) {
      const d = females[Math.floor(rng.next() * females.length)];
      let s = males[Math.floor(rng.next() * males.length)];
      if (avoidKin) {
        let best = A[s * N + d];
        for (let t = 0; t < 9; t++) {
          const c = males[Math.floor(rng.next() * males.length)];
          const v = A[c * N + d];
          if (v < best) { best = v; s = c; }
        }
      }
      ps[o] = s; pd[o] = d;
      const Fs = A[s * N + s] - 1, Fd = A[d * N + d] - 1;
      na[o] = 0.5 * (a[s] + a[d]) + sigA * Math.sqrt(0.5 * (1 - 0.5 * (Fs + Fd))) * rng.gauss();
    }
    const nA = new Float64Array(N * N);
    for (let o = 0; o < N; o++) {
      const s = ps[o], d = pd[o];
      nA[o * N + o] = 1 + 0.5 * A[s * N + d];
      for (let q = o + 1; q < N; q++) {
        const s2 = ps[q], d2 = pd[q];
        const v = 0.25 * (A[s * N + s2] + A[s * N + d2] + A[d * N + s2] + A[d * N + d2]);
        nA[o * N + q] = v; nA[q * N + o] = v;
      }
    }
    a = na; A = nA;
    record();
  }
  return stats;
}

// P: { mu, sigP, h2, Nm, Nf, Sm, Sf, r, gens, reps, seed, avoidKin, depression, inverse }
export function simulatePopulation(P) {
  const sigA = Math.sqrt(P.h2) * P.sigP;
  const all = [];
  for (let k = 0; k < P.reps; k++) all.push(runRep({ ...P, sigA }, makeRng(P.seed + k * 7919)));
  const dir = P.inverse ? -1 : 1;
  const rows = [];
  for (let g = 0; g <= P.gens; g++) {
    const ys = all.map((s) => P.mu + dir * (s[g].meanA - ((P.depression || 0) / 100) * P.mu * (s[g].meanF / 0.1)));
    rows.push({
      g,
      y: avg(ys),
      ySd: sdOf(ys),
      meanA: avg(all.map((s) => s[g].meanA)),
      F: avg(all.map((s) => s[g].meanF)),
      sdA: avg(all.map((s) => s[g].sdA)),
    });
  }
  const im = selectionIntensity(P.Sm / P.Nm), iff = selectionIntensity(P.Sf / P.Nf);
  return {
    rows,
    sigA,
    theory: { im, if: iff, R1: ((im + iff) / 2) * P.r * sigA, dF: 1 / (8 * P.Sm) + 1 / (8 * P.Sf) },
  };
}
