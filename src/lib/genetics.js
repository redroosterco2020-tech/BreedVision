import { ALL_GOALS, TRAIT_META } from "./constants.js";

// Returns Map(ancestorId -> minimal generation distance) including self at distance 0
export function getAncestorPaths(id, byId, maxDepth = 6) {
  const dist = new Map();
  const queue = [[id, 0]];
  while (queue.length) {
    const [cur, d] = queue.shift();
    if (dist.has(cur) && dist.get(cur) <= d) continue;
    dist.set(cur, d);
    if (d >= maxDepth) continue;
    const b = byId.get(cur);
    if (!b) continue;
    if (b.sireId && byId.has(b.sireId)) queue.push([b.sireId, d + 1]);
    if (b.damId && byId.has(b.damId)) queue.push([b.damId, d + 1]);
  }
  return dist;
}

// Kinship coefficient f(A,B) ~ inbreeding coefficient of their potential offspring
export function kinshipCoefficient(idA, idB, byId) {
  if (!idA || !idB || !byId.has(idA) || !byId.has(idB)) return 0;
  if (idA === idB) return 0.5;
  const ancA = getAncestorPaths(idA, byId);
  const ancB = getAncestorPaths(idB, byId);
  let f = 0;
  for (const [anc, dA] of ancA) {
    if (anc === idA) continue;
    if (ancB.has(anc)) {
      const dB = ancB.get(anc);
      f += Math.pow(0.5, dA + dB + 1);
    }
  }
  return Math.min(f, 0.5);
}

// Converts a { goalId: percent } map into a per-trait-field weight map that
// sums to 1. Multiple goals pointing at the same field (e.g. "growth" for
// both livestock and poultry both map to "weight") add together.
export function fieldWeightsFromGoals(goalWeights) {
  const raw = {};
  let total = 0;
  Object.entries(goalWeights || {}).forEach(([goalId, pct]) => {
    const p = Number(pct) || 0;
    if (p <= 0) return;
    const goal = ALL_GOALS.find((g) => g.id === goalId);
    if (!goal) return;
    raw[goal.field] = (raw[goal.field] || 0) + p;
    total += p;
  });
  const weights = {};
  Object.keys(TRAIT_META).forEach((f) => (weights[f] = 0));
  if (total > 0) {
    Object.entries(raw).forEach(([field, p]) => {
      weights[field] = p / total;
    });
  }
  return weights;
}

function zscores(breeders, field) {
  const vals = breeders.map((b) => Number(b[field])).filter((v) => !isNaN(v) && v !== "");
  if (vals.length < 2) return new Map(breeders.map((b) => [b.id, 0]));
  const mean = vals.reduce((a, c) => a + c, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((a, c) => a + (c - mean) ** 2, 0) / vals.length) || 1;
  const m = new Map();
  breeders.forEach((b) => {
    const v = Number(b[field]);
    m.set(b.id, isNaN(v) || b[field] === "" ? 0 : (v - mean) / sd);
  });
  return m;
}

export function computeSelectionIndex(breeders, goalWeights) {
  const weights = fieldWeightsFromGoals(goalWeights);
  const zByField = {};
  Object.keys(TRAIT_META).forEach((field) => {
    zByField[field] = zscores(breeders, field);
  });
  const scores = new Map();
  breeders.forEach((b) => {
    let s = 0;
    Object.keys(TRAIT_META).forEach((field) => {
      let z = zByField[field].get(b.id) || 0;
      if (TRAIT_META[field].inverse) z = -z;
      s += z * (weights[field] || 0);
    });
    scores.set(b.id, s);
  });
  return scores;
}

export function pairingScore(sire, dam, byId, goalWeights) {
  const f = kinshipCoefficient(sire.id, dam.id, byId);
  const geneticCompat = Math.max(0, 1 - f / 0.25);
  const fieldWeights = fieldWeightsFromGoals(goalWeights);

  let improvementProb = 0.5;
  let weightedSum = 0;
  let weightTotal = 0;
  Object.keys(TRAIT_META).forEach((field) => {
    const w = fieldWeights[field] || 0;
    if (w <= 0) return;
    const meta = TRAIT_META[field];
    const sOk = sire[field] !== "" && sire[field] !== undefined && sire[field] !== null && !isNaN(Number(sire[field]));
    const dOk = dam[field] !== "" && dam[field] !== undefined && dam[field] !== null && !isNaN(Number(dam[field]));
    if (!sOk && !dOk) return;
    const avg = sOk && dOk ? (Number(sire[field]) + Number(dam[field])) / 2 : dOk ? Number(dam[field]) : Number(sire[field]);
    const direction = meta.inverse ? -1 : 1;
    const contribution = 0.5 + Math.min(0.4, direction * (avg > 0 ? 0.05 : -0.05) + meta.h2 * 0.3);
    weightedSum += contribution * w;
    weightTotal += w;
  });
  if (weightTotal > 0) improvementProb = weightedSum / weightTotal;

  const declineRisk = Math.min(0.95, f * 2 + (1 - geneticCompat) * 0.2);
  const overall = geneticCompat * 0.5 + improvementProb * 0.35 - declineRisk * 0.15;
  return {
    inbreeding: f,
    geneticCompat,
    improvementProb: Math.max(0, Math.min(1, improvementProb)),
    declineRisk,
    overall: Math.max(0, Math.min(1, overall)),
  };
}

export function simulateGenerations(sire, dam, byId, goalWeights, generations = 5) {
  const baseF = kinshipCoefficient(sire.id, dam.id, byId);
  const fieldWeights = fieldWeightsFromGoals(goalWeights);
  const fields = Object.keys(TRAIT_META);
  const results = [];
  let currentMeans = {};
  fields.forEach((f) => {
    const sOk = sire[f] !== "" && sire[f] !== undefined && sire[f] !== null && !isNaN(Number(sire[f]));
    const dOk = dam[f] !== "" && dam[f] !== undefined && dam[f] !== null && !isNaN(Number(dam[f]));
    if (sOk && dOk) currentMeans[f] = (Number(sire[f]) + Number(dam[f])) / 2;
    else if (dOk) currentMeans[f] = Number(dam[f]); // e.g. egg/milk production: only the dam expresses it
    else if (sOk) currentMeans[f] = Number(sire[f]);
    else currentMeans[f] = null;
  });
  let inbreeding = baseF;
  for (let g = 1; g <= generations; g++) {
    const genRow = { gen: g, traits: {}, inbreeding };
    fields.forEach((f) => {
      const meta = TRAIT_META[f];
      const mean = currentMeans[f];
      if (mean === null) {
        genRow.traits[f] = null;
        return;
      }
      const w = fieldWeights[f] || 0;
      const drift = 1 - inbreeding * 0.6;
      const gainRate = 0.01 + w * 0.035; // scales from 0.01 (untargeted) up to 0.045 (fully targeted)
      let newMean = meta.inverse
        ? mean * (1 - gainRate) * (1 + (1 - drift) * 0.4)
        : mean * (1 + gainRate) * drift;
      const varianceSpread = mean * (0.06 + inbreeding * 0.3 + g * 0.01);
      genRow.traits[f] = {
        mean: newMean,
        low: Math.max(0, newMean - varianceSpread),
        high: newMean + varianceSpread,
      };
      currentMeans[f] = newMean;
    });
    inbreeding = Math.min(0.5, inbreeding + 0.012 + baseF * 0.05);
    results.push(genRow);
  }
  return results;
}

export function computeAlerts(breeders, byId) {
  const list = [];
  const males = breeders.filter((b) => b.sex === "male");
  const females = breeders.filter((b) => b.sex === "female");
  for (const m of males) {
    for (const f of females) {
      const kin = kinshipCoefficient(m.id, f.id, byId);
      if (kin >= 0.0625) {
        list.push({
          type: kin >= 0.25 ? "bad" : "warn",
          text: `هم‌خونی بین «${m.tag || m.name}» و «${f.tag || f.name}»: ${(kin * 100).toFixed(1)}٪`,
        });
      }
    }
  }
  const activeSires = new Set(breeders.map((b) => b.sireId).filter(Boolean));
  const activeDams = new Set(breeders.map((b) => b.damId).filter(Boolean));
  if (breeders.length >= 6 && activeSires.size <= 1) {
    list.push({ type: "warn", text: "تنوع ژنتیکی پایین: بیشتر جوجه‌ها از یک پدر مشترک هستند." });
  }
  if (breeders.length >= 6 && activeDams.size <= 1) {
    list.push({ type: "warn", text: "تنوع ژنتیکی پایین: بیشتر جوجه‌ها از یک مادر مشترک هستند." });
  }
  breeders.forEach((b) => {
    if (b.weightHistory && b.weightHistory.length >= 3) {
      const h = [...b.weightHistory].sort((a, c) => new Date(a.date) - new Date(c.date));
      const first = h[0].weight;
      const last = h[h.length - 1].weight;
      if (last < first * 0.95) {
        list.push({ type: "bad", text: `احتمال افت رشد در «${b.tag || b.name}» بر اساس روند وزن.` });
      }
    }
    if (b.fcr && Number(b.fcr) > 2.2) {
      list.push({ type: "warn", text: `FCR بالا در «${b.tag || b.name}» → احتمال کاهش بازده تولید.` });
    }
    if (b.hatchPercent && Number(b.hatchPercent) < 60) {
      list.push({ type: "warn", text: `درصد هچ پایین در «${b.tag || b.name}» → احتمال کاهش باروری.` });
    }
  });
  return list;
}

export function computeAiSuggestions(breeders, selectionScores, byId, goalWeights) {
  if (breeders.length < 4) return [];
  const males = breeders.filter((b) => b.sex === "male");
  const females = breeders.filter((b) => b.sex === "female");
  const sorted = [...breeders].sort((a, b) => (selectionScores.get(b.id) || 0) - (selectionScores.get(a.id) || 0));
  const topCount = Math.max(1, Math.ceil(sorted.length * 0.2));
  const top = sorted.slice(0, topCount);
  const bottom = sorted.slice(-topCount);
  const out = [];
  top.forEach((b) => out.push({ tone: "good", text: `«${b.tag || b.name}» را نگه دار — شاخص انتخاب بالا (${selectionScores.get(b.id).toFixed(2)}).` }));
  bottom.forEach((b) => {
    if (!top.includes(b)) out.push({ tone: "bad", text: `حذف «${b.tag || b.name}» پیشنهاد می‌شود — شاخص انتخاب پایین (${selectionScores.get(b.id).toFixed(2)}).` });
  });
  const topMales = top.filter((b) => b.sex === "male");
  let bestPair = null;
  topMales.forEach((m) => {
    females.forEach((f) => {
      const sc = pairingScore(m, f, byId, goalWeights);
      if (!bestPair || sc.overall > bestPair.score.overall) bestPair = { m, f, score: sc };
    });
  });
  if (bestPair && bestPair.score.overall > 0.6) {
    out.push({ tone: "good", text: `جفت «${bestPair.m.tag || bestPair.m.name}» × «${bestPair.f.tag || bestPair.f.name}» بهترین انتخاب فعلی است (امتیاز ${(bestPair.score.overall * 100).toFixed(0)}٪).` });
  }
  males.forEach((m) => {
    females.forEach((f) => {
      const sc = pairingScore(m, f, byId, goalWeights);
      if (sc.inbreeding >= 0.125) {
        out.push({ tone: "bad", text: `جفت «${m.tag || m.name}» × «${f.tag || f.name}» مناسب نیست — هم‌خونی ${(sc.inbreeding * 100).toFixed(1)}٪.` });
      }
    });
  });
  return out.slice(0, 12);
    }
