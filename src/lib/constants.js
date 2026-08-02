export const SPECIES = [
  { id: "poultry_chicken", label: "طیور — مرغ و خروس" },
  { id: "poultry_turkey", label: "طیور — بوقلمون" },
  { id: "poultry_quail", label: "طیور — بلدرچین" },
  { id: "poultry_goose", label: "طیور — غاز" },
  { id: "poultry_duck", label: "طیور — اردک" },
  { id: "light_livestock", label: "دام سبک (گوسفند / بز)" },
  { id: "heavy_livestock", label: "دام سنگین (گاو / گاومیش / شتر)" },
];

// All possible breeding traits, shared across species. Not every trait is
// relevant to every species — irrelevant fields are simply left blank.
export const TRAIT_META = {
  weight: { label: "وزن / سرعت رشد", unit: "کیلوگرم", inverse: false, h2: 0.35 },
  milkProduction: { label: "تولید شیر", unit: "لیتر/روز", inverse: false, h2: 0.3 },
  meatQuality: { label: "کیفیت گوشت و لاشه", unit: "۱ تا ۱۰", inverse: false, h2: 0.25 },
  eggProduction: { label: "تولید تخم", unit: "عدد/سال", inverse: false, h2: 0.25 },
  hatchPercent: { label: "درصد جوجه‌درآوری (هچ)", unit: "%", inverse: false, h2: 0.2 },
  fcr: { label: "ضریب تبدیل خوراک (FCR)", unit: "", inverse: true, h2: 0.3 },
  resistanceScore: { label: "مقاومت به بیماری", unit: "۱ تا ۱۰", inverse: false, h2: 0.2 },
  fertilityScore: { label: "باروری / عملکرد تولیدمثل", unit: "۱ تا ۱۰", inverse: false, h2: 0.2 },
  survivalRate: { label: "نرخ زنده‌مانی نوزاد/جوجه", unit: "%", inverse: false, h2: 0.2 },
  productiveLifespanMonths: { label: "طول عمر / دوره تولید", unit: "ماه", inverse: false, h2: 0.15 },
  climateTolerance: { label: "سازگاری با آب‌وهوا و تنش محیطی", unit: "۱ تا ۱۰", inverse: false, h2: 0.15 },
};

// Breeding goals grouped by animal category, per the user's requested list.
export const GOAL_GROUPS = [
  {
    id: "livestock",
    label: "دام سبک و سنگین",
    icon: "🐄",
    goals: [
      { id: "ls_milk", label: "افزایش تولید شیر", field: "milkProduction", icon: "🥛" },
      { id: "ls_meat", label: "افزایش تولید گوشت و کیفیت لاشه", field: "meatQuality", icon: "🥩" },
      { id: "ls_growth", label: "افزایش سرعت رشد و وزن‌گیری", field: "weight", icon: "⚖️" },
      { id: "ls_fcr", label: "بهبود ضریب تبدیل خوراک (FCR)", field: "fcr", icon: "🍽️" },
      { id: "ls_resist", label: "افزایش مقاومت به بیماری‌ها", field: "resistanceScore", icon: "🩺" },
      { id: "ls_fertility", label: "بهبود باروری و عملکرد تولیدمثل", field: "fertilityScore", icon: "♀️" },
      { id: "ls_survival", label: "افزایش نرخ زنده‌مانی نوزادان", field: "survivalRate", icon: "👶" },
      { id: "ls_lifespan", label: "افزایش طول عمر اقتصادی دام", field: "productiveLifespanMonths", icon: "⏳" },
      { id: "ls_climate", label: "افزایش سازگاری با شرایط آب‌وهوایی و محیطی", field: "climateTolerance", icon: "🌡️" },
    ],
  },
  {
    id: "poultry",
    label: "طیور",
    icon: "🐔",
    goals: [
      { id: "pl_egg", label: "افزایش تولید تخم‌مرغ", field: "eggProduction", icon: "🥚" },
      { id: "pl_hatch", label: "افزایش درصد جوجه‌درآوری (Hatchability)", field: "hatchPercent", icon: "🐣" },
      { id: "pl_growth", label: "افزایش سرعت رشد و وزن نهایی", field: "weight", icon: "⚖️" },
      { id: "pl_fcr", label: "بهبود ضریب تبدیل خوراک (FCR)", field: "fcr", icon: "🍽️" },
      { id: "pl_resist", label: "افزایش مقاومت به بیماری‌ها", field: "resistanceScore", icon: "🩺" },
      { id: "pl_fertility", label: "بهبود باروری و کیفیت تخم نطفه‌دار", field: "fertilityScore", icon: "♀️" },
      { id: "pl_survival", label: "افزایش زنده‌مانی جوجه‌ها", field: "survivalRate", icon: "🐥" },
      { id: "pl_lifespan", label: "افزایش طول دوره تولید", field: "productiveLifespanMonths", icon: "⏳" },
      { id: "pl_climate", label: "افزایش تحمل تنش‌های محیطی و گرمایی", field: "climateTolerance", icon: "🌡️" },
    ],
  },
];

export const ALL_GOALS = GOAL_GROUPS.flatMap((g) => g.goals);

export function goalLabel(id) {
  const g = ALL_GOALS.find((x) => x.id === id);
  return g ? g.label : "";
}

// Default goal weighting for a brand-new flock: 100% on growth/weight.
export const DEFAULT_GOAL_WEIGHTS = { ls_growth: 100 };

export const emptyBreeder = () => ({
  id: "",
  tag: "",
  name: "",
  species: "poultry_chicken",
  sex: "female",
  breed: "",
  birthDate: "",
  active: true,
  sireId: "",
  damId: "",
  weight: "",
  milkProduction: "",
  meatQuality: "",
  eggProduction: "",
  hatchPercent: "",
  fcr: "",
  resistanceScore: "",
  fertilityScore: "",
  survivalRate: "",
  productiveLifespanMonths: "",
  climateTolerance: "",
  mortality: false,
  mortalityDate: "",
  weightHistory: [],
  notes: "",
});

export function speciesLabel(id) {
  const s = SPECIES.find((x) => x.id === id);
  return s ? s.label : "";
}

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
