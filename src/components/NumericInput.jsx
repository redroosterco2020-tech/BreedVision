import React from "react";
import { sanitizeNumericInput } from "../lib/digits.js";

// Drop-in replacement for <input type="number">. Accepts Persian, Arabic-Indic,
// or Western digits from any keyboard and normalizes them, since native
// type="number" inputs silently reject Persian-digit keystrokes on many
// Android keyboards.
export default function NumericInput({ value, onChange, allowDecimal = true, min, max, className, placeholder }) {
  function handleChange(e) {
    let v = sanitizeNumericInput(e.target.value, allowDecimal);
    onChange(v);
  }
  function handleBlur() {
    if (value === "" || value === undefined) return;
    let n = Number(value);
    if (isNaN(n)) {
      onChange("");
      return;
    }
    if (min !== undefined && n < min) n = min;
    if (max !== undefined && n > max) n = max;
    if (String(n) !== String(value)) onChange(String(n));
  }
  return (
    <input
      type="text"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
    />
  );
}
