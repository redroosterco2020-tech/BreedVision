// Static reference database of common breeds, grouped by species category.
// Purely informational — no user data is tied to these entries.
export const BREED_DATABASE = [
  { species: "poultry_chicken", name: "لگهورن سفید", origin: "ایتالیا", purpose: "تخم", notes: "تولید بالای تخم، وزن بدن کم، مقاومت متوسط." },
  { species: "poultry_chicken", name: "راس ۳۰۸", origin: "بین‌المللی", purpose: "گوشت", notes: "رشد بسیار سریع، FCR پایین، پرورش صنعتی." },
  { species: "poultry_chicken", name: "کاب ۵۰۰", origin: "بین‌المللی", purpose: "گوشت", notes: "مشابه راس، رشد سریع و بازده بالای لاشه." },
  { species: "poultry_chicken", name: "مرغ بومی ایرانی", origin: "ایران", purpose: "دومنظوره", notes: "مقاومت بالا به بیماری و شرایط محیطی، تولید متوسط." },
  { species: "poultry_chicken", name: "رودآیلند رد", origin: "آمریکا", purpose: "دومنظوره", notes: "تخم و گوشت متوسط، سرسخت و پرمقاومت." },
  { species: "poultry_turkey", name: "بوقلمون برنز", origin: "اروپا/آمریکا", purpose: "گوشت", notes: "وزن نهایی بالا، رشد نسبتاً کند." },
  { species: "poultry_turkey", name: "بوقلمون سفید هلندی", origin: "هلند", purpose: "گوشت", notes: "رشد سریع‌تر از نژادهای سنتی، پرورش صنعتی رایج." },
  { species: "poultry_quail", name: "بلدرچین ژاپنی", origin: "ژاپن", purpose: "تخم و گوشت", notes: "بلوغ زودرس، دوره تولید کوتاه، پرورش پرتراکم." },
  { species: "poultry_goose", name: "غاز توسی", origin: "چین", purpose: "گوشت", notes: "رشد سریع، مقاومت خوب، نیاز به فضای باز." },
  { species: "poultry_duck", name: "اردک پکنی", origin: "چین", purpose: "گوشت", notes: "رشد سریع، لاشه با کیفیت، پرورش رایج صنعتی." },
  { species: "poultry_duck", name: "اردک خاکی", origin: "بریتانیا", purpose: "تخم", notes: "تولید تخم بالا، سازگاری خوب با آب‌وهوای مرطوب." },
  { species: "light_livestock", name: "گوسفند زل", origin: "ایران (مازندران)", purpose: "گوشت", notes: "سازگار با اقلیم مرطوب شمال، دنبه کوچک." },
  { species: "light_livestock", name: "گوسفند قزل", origin: "ایران (آذربایجان)", purpose: "گوشت و شیر", notes: "مقاوم به سرما، مناسب مناطق کوهستانی." },
  { species: "light_livestock", name: "گوسفند افشاری", origin: "ایران (زنجان)", purpose: "گوشت", notes: "رشد نسبتاً سریع، دنبه متوسط." },
  { species: "light_livestock", name: "بز سانن", origin: "سوئیس", purpose: "شیر", notes: "بالاترین تولید شیر در میان نژادهای بز، بدون شاخ رایج." },
  { species: "light_livestock", name: "بز مرخز (کرکی)", origin: "ایران", purpose: "کرک و گوشت", notes: "تولید کرک باکیفیت، سازگار با اقلیم خشک." },
  { species: "heavy_livestock", name: "گاو هلشتاین", origin: "هلند", purpose: "شیر", notes: "بالاترین تولید شیر جهانی، نیاز به مدیریت خوراک دقیق." },
  { species: "heavy_livestock", name: "گاو سیمنتال", origin: "سوئیس", purpose: "شیر و گوشت", notes: "دومنظوره، سازگاری خوب، رشد گوشتی مناسب." },
  { species: "heavy_livestock", name: "گاو نجدی", origin: "ایران", purpose: "بومی/کار", notes: "مقاومت بالا، تولید پایین، سازگار با شرایط سخت." },
  { species: "heavy_livestock", name: "شتر یک‌کوهانه", origin: "خاورمیانه", purpose: "شیر و بار", notes: "مقاومت فوق‌العاده به کم‌آبی و گرما." },
];

export function breedsForSpecies(speciesId) {
  return BREED_DATABASE.filter((b) => b.species === speciesId);
    }
