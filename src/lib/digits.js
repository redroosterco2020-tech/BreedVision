const FA = "۰۱۲۳۴۵۶۷۸۹";
const AR = "٠١٢٣٤٥٦٧٨٩";

// Converts Persian/Arabic-Indic digits in a string to plain Western digits,
// so numeric inputs work correctly no matter which keyboard/locale typed them.
export function toLatinDigits(str) {
  if (str === null || str === undefined) return str;
  return String(str).replace(/[۰-۹٠-٩]/g, (ch) => {
    const fi = FA.indexOf(ch);
    if (fi > -1) return String(fi);
    const ai = AR.indexOf(ch);
    if (ai > -1) return String(ai);
    return ch;
  });
}

// Sanitizes free-typed text into a valid numeric string (optionally decimal).
export function sanitizeNumericInput(raw, allowDecimal = true) {
  let v = toLatinDigits(raw);
  v = allowDecimal ? v.replace(/[^0-9.]/g, "") : v.replace(/[^0-9]/g, "");
  if (allowDecimal) {
    const firstDot = v.indexOf(".");
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
    }
  }
  return v;
}
