import { ALL_GOALS, TRAIT_META, speciesLabel } from "./constants.js";
import { kinshipCoefficient } from "./genetics.js";

// Builds a readable Persian narrative paragraph from the flock's current
// stats — template-based (not a real language model), but reads naturally.
export function buildSmartReport(breeders, byId, selectionScores, goalWeights, alerts) {
  if (breeders.length === 0) {
    return "هنوز هیچ مولدی ثبت نشده است. پس از افزودن مولدها، این بخش یک گزارش خودکار از وضعیت گله شما ارائه می‌دهد.";
  }

  const males = breeders.filter((b) => b.sex === "male");
  const females = breeders.filter((b) => b.sex === "female");

  let inbreedingSum = 0, count = 0;
  males.forEach((m) => females.forEach((f) => { inbreedingSum += kinshipCoefficient(m.id, f.id, byId); count++; }));
  const avgInbreeding = count ? inbreedingSum / count : 0;

  const sorted = [...breeders].sort((a, b) => (selectionScores.get(b.id) || 0) - (selectionScores.get(a.id) || 0));
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const speciesCounts = {};
  breeders.forEach((b) => {
    const label = speciesLabel(b.species) || "نامشخص";
    speciesCounts[label] = (speciesCounts[label] || 0) + 1;
  });
  const speciesSummary = Object.entries(speciesCounts)
    .map(([label, n]) => `${n} رأس ${label}`)
    .join("، ");

  const activeGoals = Object.entries(goalWeights || {})
    .filter(([, w]) => Number(w) > 0)
    .map(([gid]) => ALL_GOALS.find((g) => g.id === gid))
    .filter(Boolean);

  const paragraphs = [];

  paragraphs.push(
    `گله شما در حال حاضر شامل ${breeders.length} رأس مولد است (${males.length} نر و ${females.length} ماده)، شامل ${speciesSummary || "دام‌های ثبت‌شده"}.`
  );

  if (activeGoals.length > 0) {
    const goalText = activeGoals.map((g) => g.label).join("، ");
    paragraphs.push(`هدف اصلاح نژاد فعلی روی «${goalText}» متمرکز است.`);
  } else {
    paragraphs.push("هنوز هدف مشخصی برای اصلاح نژاد انتخاب نشده؛ تعیین هدف باعث دقیق‌تر شدن پیشنهادها می‌شود.");
  }

  if (best) {
    paragraphs.push(
      `مولد «${best.tag || best.name}» بالاترین شاخص انتخاب گله را دارد (${(selectionScores.get(best.id) || 0).toFixed(2)}) و مناسب‌ترین گزینه برای ادامه تولیدمثل است` +
        (worst && worst.id !== best.id
          ? `، در حالی که «${worst.tag || worst.name}» پایین‌ترین شاخص را دارد و کاندید حذف از برنامه اصلاح نژاد است.`
          : ".")
    );
  }

  const inbreedingText =
    avgInbreeding >= 0.0625
      ? `میانگین هم‌خونی احتمالی بین جفت‌های ممکن گله ${(avgInbreeding * 100).toFixed(1)}٪ است که بالاتر از حد ایمن (۶.۲۵٪) بوده و نیاز به احتیاط دارد.`
      : `میانگین هم‌خونی احتمالی بین جفت‌های ممکن گله ${(avgInbreeding * 100).toFixed(1)}٪ است که در محدوده ایمن قرار دارد.`;
  paragraphs.push(inbreedingText);

  if (alerts.length > 0) {
    paragraphs.push(`در حال حاضر ${alerts.length} هشدار فعال برای گله ثبت شده که بررسی آن‌ها توصیه می‌شود.`);
  } else {
    paragraphs.push("هیچ هشدار فعالی برای گله ثبت نشده است.");
  }

  return paragraphs.join(" ");
    }
