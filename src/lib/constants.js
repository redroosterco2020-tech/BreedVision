export const GOALS = [
  { id: "weight", label: "افزایش وزن", field: "weight", icon: "⚖️" },
  { id: "egg", label: "افزایش تولید تخم", field: "eggProduction", icon: "🥚" },
  { id: "resistance", label: "افزایش مقاومت", field: "resistanceScore", icon: "🛡️" },
  { id: "fcr", label: "کاهش FCR", field: "fcr", icon: "🌾", inverse: true },
  { id: "hatch", label: "افزایش درصد هچ", field: "hatchPercent", icon: "🐣" },
  { id: "lifespan", label: "افزایش طول عمر تولید", field: "productiveLifespanMonths", icon: "⏳" },
];

export const TRAIT_META = {
  weight: { label: "وزن (کیلوگرم)", inverse: false, h2: 0.35 },
  eggProduction: { label: "تولید تخم (فرد در سال)", inverse: false, h2: 0.25 },
  resistanceScore: { label: "امتیاز مقاومت", inverse: false, h2: 0.2 },
  fcr: { label: "FCR", inverse: true, h2: 0.3 },
  hatchPercent: { label: "درصد هچ", inverse: false, h2: 0.2 },
  productiveLifespanMonths: { label: "طول عمر تولید (ماه)", inverse: false, h2: 0.15 },
};

export const emptyBreeder = () => ({
  id: "",
  tag: "",
  name: "",
  sex: "female",
  breed: "",
  birthDate: "",
  active: true,
  sireId: "",
  damId: "",
  weight: "",
  eggProduction: "",
  hatchPercent: "",
  fcr: "",
  resistanceScore: "",
  productiveLifespanMonths: "",
  mortality: false,
  mortalityDate: "",
  weightHistory: [],
  notes: "",
});

export function uid() {
  return "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function ageInMonths(birthDate) {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  return Math.max(0, Math.round((now - b) / (1000 * 60 * 60 * 24 * 30.44)));
}

export function fmt(n, digits = 2) {
  if (n === null || n === undefined || n === "" || isNaN(n)) return "—";
  return Number(n).toLocaleString("fa-IR", { maximumFractionDigits: digits });
                                             }
