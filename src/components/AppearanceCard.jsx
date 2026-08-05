import React from "react";
import { Sun, Moon, MonitorSmartphone } from "lucide-react";
import { Card } from "./ui.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function AppearanceCard() {
  const { mode, setMode } = useTheme();
  const options = [
    { id: "light", label: "روشن", icon: Sun },
    { id: "dark", label: "تیره", icon: Moon },
    { id: "auto", label: "خودکار", icon: MonitorSmartphone },
  ];
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="font-bold text-sm">ظاهر برنامه</div>
      <div className="grid grid-cols-3 gap-3">
        {options.map((o) => {
          const Icon = o.icon;
          const active = mode === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setMode(o.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors ${
                active ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]" : "bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-secondary)]"
              }`}
            >
              <Icon size={18} />
              <span className="text-xs font-medium">{o.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
