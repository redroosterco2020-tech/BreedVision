export const BREED_GROUPS = [
  { id: "cattle", fa: "گاو", en: "Cattle", sci: "Bos taurus / Bos indicus", icon: "🐄" },
  { id: "sheep", fa: "گوسفند", en: "Sheep", sci: "Ovis aries", icon: "🐑" },
  { id: "goat", fa: "بز", en: "Goat", sci: "Capra hircus", icon: "🐐" },
  { id: "horse", fa: "اسب", en: "Horse", sci: "Equus ferus caballus", icon: "🐴" },
  { id: "donkey", fa: "الاغ", en: "Donkey", sci: "Equus africanus asinus", icon: "🐾" },
  { id: "poultry", fa: "طیور (مرغ)", en: "Chicken", sci: "Gallus gallus domesticus", icon: "🐔" },
  { id: "dog", fa: "سگ", en: "Dog", sci: "Canis lupus familiaris", icon: "🐕" },
  { id: "cat", fa: "گربه", en: "Cat", sci: "Felis catus", icon: "🐈" },
  { id: "rabbit", fa: "خرگوش", en: "Rabbit", sci: "Oryctolagus cuniculus", icon: "🐇" },
];

export function groupById(id) {
  return BREED_GROUPS.find((g) => g.id === id);
   }
