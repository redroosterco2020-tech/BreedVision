import { kinshipCoefficient } from "./genetics.js";

// Rule-based, template-driven management tips derived from the flock's own
// data — no external AI call, just pattern checks against known thresholds.
export function generateManagementTips(breeders, byId, goalWeights, alerts) {
  const tips = [];
  const males = breeders.filter((b) => b.sex === "male");
  const females = breeders.filter((b) => b.sex === "female");
  const activeGoalCount = Object.values(goalWeights || {}).filter((w) => Number(w) > 0).length;

  if (breeders.length < 4) {
    tips.push({ icon: "📋", text: "برای تحلیل ژنتیکی معتبرتر، حداقل ۴ تا ۶ مولد ثبت کنید. با تعداد کم، شاخص‌های آماری قابل‌اتکا نیستند." });
  }
  if (activeGoalCount === 0) {
    tips.push({ icon: "🎯", text: "هنوز هیچ هدف اصلاح نژادی انتخاب نکرده‌اید. از تب «اهداف اصلاح نژاد» حداقل یک هدف را با درصد اهمیت مشخص کنید تا پیشنهادها دقیق‌تر شوند." });
  }
  if (breeders.length >= 3 && males.length === 0) {
    tips.push({ icon: "♂️", text: "هیچ مولد نری در گله ثبت نشده — بدون آن امکان برنامه‌ریزی جفت‌گیری و شبیه‌سازی نسل وجود ندارد." });
  }
  if (breeders.length >= 3 && females.length === 0) {
    tips.push({ icon: "♀️", text: "هیچ مولد ماده‌ای در گله ثبت نشده — بدون آن امکان برنامه‌ریزی جفت‌گیری و شبیه‌سازی نسل وجود ندارد." });
  }
  if (males.length > 0 && females.length > 0 && females.length / males.length < 2 && breeders.length >= 6) {
    tips.push({ icon: "⚖️", text: "نسبت نر به ماده در گله نسبتاً پایین است. نسبت بیشتر ماده به نر معمولاً تنوع ژنتیکی بهتری در نسل بعد ایجاد می‌کند." });
  }
  const missingPedigree = breeders.filter((b) => !b.sireId && !b.damId).length;
  if (breeders.length >= 5 && missingPedigree / breeders.length > 0.6) {
    tips.push({ icon: "🌳", text: "شجره‌نامه بیشتر مولدها ثبت نشده. تکمیل فیلدهای «پدر» و «مادر» دقت محاسبه هم‌خونی و پیشنهادهای جفت‌گیری را به‌طور محسوسی بالا می‌برد." });
  }
  const mortalityCount = breeders.filter((b) => b.mortality).length;
  if (breeders.length >= 5 && mortalityCount / breeders.length > 0.15) {
    tips.push({ icon: "⚕️", text: `نرخ تلفات ثبت‌شده در گله (${Math.round((mortalityCount / breeders.length) * 100)}٪) نسبتاً بالاست. بررسی شرایط بهداشتی، تغذیه و مدیریت محیط توصیه می‌شود.` });
  }
  if (alerts.length >= 4) {
    tips.push({ icon: "🚨", text: "تعداد هشدارهای فعال زیاد است. اولویت را به رفع هشدارهای هم‌خونی بدهید، چون بیشترین تأثیر منفی را روی نسل‌های بعدی دارند." });
  }
  const highInbreedingPairs = [];
  males.forEach((m) =>
    females.forEach((f) => {
      const k = kinshipCoefficient(m.id, f.id, byId);
      if (k >= 0.25) highInbreedingPairs.push([m, f]);
    })
  );
  if (highInbreedingPairs.length > 0) {
    tips.push({ icon: "🧬", text: "برخی جفت‌های موجود هم‌خونی بسیار بالایی دارند (خواهر/برادر یا والد/فرزند). از جفت‌گیری این افراد اجتناب کنید و در صورت امکان مولد جدید و غیرخویشاوند به گله اضافه کنید." });
  }
  if (tips.length === 0) {
    tips.push({ icon: "✅", text: "بر اساس داده‌های فعلی، گله در وضعیت مناسبی قرار دارد. ثبت منظم رکوردهای وزن و عملکرد را ادامه دهید تا پیشنهادها دقیق‌تر شوند." });
  }
  return tips;
               }
