import React, { useState } from "react";
import { X } from "lucide-react";
import { Card, Field, Pill, inputCls } from "./ui.jsx";

export default function BreederFormModal({ breeder, breeders, onClose, onSave }) {
  const [form, setForm] = useState(breeder);
  const [newWeightDate, setNewWeightDate] = useState("");
  const [newWeightVal, setNewWeightVal] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const potentialParents = breeders.filter((b) => b.id !== form.id);

  function addWeightPoint() {
    if (!newWeightDate || !newWeightVal) return;
    set("weightHistory", [...(form.weightHistory || []), { date: newWeightDate, weight: Number(newWeightVal) }]);
    setNewWeightDate("");
    setNewWeightVal("");
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{breeder.id ? "ویرایش مولد" : "افزودن مولد جدید"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#1B3349]">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="شماره شناسایی">
            <input className={inputCls} value={form.tag} onChange={(e) => set("tag", e.target.value)} placeholder="مثلاً R-014" />
          </Field>
          <Field label="نام (اختیاری)">
            <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="جنسیت">
            <select className={inputCls} value={form.sex} onChange={(e) => set("sex", e.target.value)}>
              <option value="female">مرغ</option>
              <option value="male">خروس</option>
            </select>
          </Field>
          <Field label="نژاد">
            <input className={inputCls} value={form.breed} onChange={(e) => set("breed", e.target.value)} />
          </Field>
          <Field label="تاریخ تولد">
            <input type="date" className={inputCls} value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
          </Field>
          <Field label="وزن فعلی (kg)">
            <input type="number" step="0.01" className={inputCls} value={form.weight} onChange={(e) => set("weight", e.target.value)} />
          </Field>
          <Field label="پدر">
            <select className={inputCls} value={form.sireId} onChange={(e) => set("sireId", e.target.value)}>
              <option value="">— نامشخص —</option>
              {potentialParents.filter((p) => p.sex === "male").map((p) => (
                <option key={p.id} value={p.id}>{p.tag || p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="مادر">
            <select className={inputCls} value={form.damId} onChange={(e) => set("damId", e.target.value)}>
              <option value="">— نامشخص —</option>
              {potentialParents.filter((p) => p.sex === "female").map((p) => (
                <option key={p.id} value={p.id}>{p.tag || p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="تولید تخم (فرد در سال)">
            <input type="number" className={inputCls} value={form.eggProduction} onChange={(e) => set("eggProduction", e.target.value)} />
          </Field>
          <Field label="درصد هچ">
            <input type="number" className={inputCls} value={form.hatchPercent} onChange={(e) => set("hatchPercent", e.target.value)} />
          </Field>
          <Field label="FCR">
            <input type="number" step="0.01" className={inputCls} value={form.fcr} onChange={(e) => set("fcr", e.target.value)} />
          </Field>
          <Field label="امتیاز مقاومت (۱ تا ۱۰)">
            <input type="number" min="1" max="10" className={inputCls} value={form.resistanceScore} onChange={(e) => set("resistanceScore", e.target.value)} />
          </Field>
          <Field label="طول عمر تولید (ماه)">
            <input type="number" className={inputCls} value={form.productiveLifespanMonths} onChange={(e) => set("productiveLifespanMonths", e.target.value)} />
          </Field>
          <Field label="وضعیت تلفات">
            <select className={inputCls} value={form.mortality ? "yes" : "no"} onChange={(e) => set("mortality", e.target.value === "yes")}>
              <option value="no">زنده</option>
              <option value="yes">تلف‌شده</option>
            </select>
          </Field>
          {form.mortality && (
            <Field label="تاریخ تلفات">
              <input type="date" className={inputCls} value={form.mortalityDate} onChange={(e) => set("mortalityDate", e.target.value)} />
            </Field>
          )}
        </div>

        <div className="mt-5">
          <div className="text-[#6FA83E] text-[11px] tracking-[0.2em] font-semibold mb-1">WEIGHT LOG · تاریخچه وزن</div>
          <div className="flex gap-2 mt-2">
            <input type="date" className={inputCls} value={newWeightDate} onChange={(e) => setNewWeightDate(e.target.value)} />
            <input type="number" step="0.01" placeholder="وزن (kg)" className={inputCls} value={newWeightVal} onChange={(e) => setNewWeightVal(e.target.value)} />
            <button onClick={addWeightPoint} className="px-3 rounded-lg bg-[#1B3349] text-[#6FA83E] text-sm">افزودن</button>
          </div>
          {(form.weightHistory || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.weightHistory.map((h, i) => (
                <Pill key={i}>{h.date}: {h.weight}kg</Pill>
              ))}
            </div>
          )}
        </div>

        <Field label="یادداشت">
          <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-[#9DB4C7] hover:bg-[#1B3349]">انصراف</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 rounded-xl text-sm bg-[#6FA83E] text-[#0A1622] font-bold">ذخیره مولد</button>
        </div>
      </Card>
    </div>
  );
          }
