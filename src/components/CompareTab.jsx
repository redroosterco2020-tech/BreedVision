import React, { useState } from "react";
import { Card, Field, SectionEyebrow, EmptyHint, inputCls } from "./ui.jsx";
import { TRAIT_META, fmt } from "../lib/constants.js";

export default function CompareTab({ breeders }) {
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");
  const a = breeders.find((b) => b.id === aId);
  const b = breeders.find((b) => b.id === bId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <SectionEyebrow>COMPARE · مقایسه دو مولد</SectionEyebrow>
        <p className="text-[var(--text-secondary)] text-sm">دو مولد را انتخاب کنید تا صفات آن‌ها کنار هم مقایسه شود.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="مولد اول">
          <select className={inputCls} value={aId} onChange={(e) => setAId(e.target.value)}>
            <option value="">انتخاب کنید...</option>
            {breeders.map((x) => <option key={x.id} value={x.id}>{x.tag || x.name}</option>)}
          </select>
        </Field>
        <Field label="مولد دوم">
          <select className={inputCls} value={bId} onChange={(e) => setBId(e.target.value)}>
            <option value="">انتخاب کنید...</option>
            {breeders.map((x) => <option key={x.id} value={x.id}>{x.tag || x.name}</option>)}
          </select>
        </Field>
      </div>
      {(!a || !b) && <EmptyHint text="دو مولد را برای مقایسه انتخاب کنید." />}
      {a && b && (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-[13px] border-collapse min-w-[420px]">
            <thead>
              <tr className="text-[var(--text-tertiary)] border-b border-[var(--hover-bg)]">
                <th className="text-right py-2">صفت</th>
                <th className="text-center py-2">{a.tag || a.name}</th>
                <th className="text-center py-2">{b.tag || b.name}</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(TRAIT_META).map((field) => {
                const meta = TRAIT_META[field];
                const va = a[field];
                const vb = b[field];
                const na = Number(va), nb = Number(vb);
                let aBetter = false, bBetter = false;
                if (va !== "" && vb !== "" && !isNaN(na) && !isNaN(nb) && na !== nb) {
                  if (meta.inverse) { aBetter = na < nb; bBetter = nb < na; }
                  else { aBetter = na > nb; bBetter = nb > na; }
                }
                return (
                  <tr key={field} className="border-b border-[var(--divider)]">
                    <td className="py-2 text-[var(--text-secondary)]">{meta.label}</td>
                    <td className={`py-2 text-center mono ${aBetter ? "text-[var(--good-text)] font-bold" : "text-[var(--text-primary)]"}`}>{fmt(va)}</td>
                    <td className={`py-2 text-center mono ${bBetter ? "text-[var(--good-text)] font-bold" : "text-[var(--text-primary)]"}`}>{fmt(vb)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
            }
