import React, { useState, useMemo } from "react";
import {
  Egg, Bird, GitBranch, Sparkles, FlaskConical, AlertTriangle, Target,
  LayoutDashboard, FileDown, Dna, LogOut,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useFlockData } from "../lib/useFlockData.js";
import { emptyBreeder, uid, ageInMonths } from "../lib/constants.js";
import { computeSelectionIndex, computeAlerts, computeAiSuggestions } from "../lib/genetics.js";
import BreederFormModal from "../components/BreederFormModal.jsx";
import {
  DashboardTab, BreedersTab, PedigreeTab, PairingTab, SimulationTab,
  AlertsTab, GoalTab, AiTab, ReportTab,
} from "../components/Tabs.jsx";

const NAV = [
  { id: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { id: "breeders", label: "مولدها", icon: Bird },
  { id: "pedigree", label: "شجره‌نامه", icon: GitBranch },
  { id: "pairing", label: "انتخاب جفت", icon: Dna },
  { id: "simulation", label: "شبیه‌سازی نسل‌ها", icon: FlaskConical },
  { id: "alerts", label: "هشدارها", icon: AlertTriangle },
  { id: "goal", label: "هدف اصلاح نژاد", icon: Target },
  { id: "ai", label: "پیشنهاد هوشمند", icon: Sparkles },
  { id: "report", label: "گزارش", icon: FileDown },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const { breeders, goalId, loaded, updateBreeders, updateGoal } = useFlockData(user?.uid);
  const [tab, setTab] = useState("dashboard");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [pairSel, setPairSel] = useState({ sireId: "", damId: "" });
  const [pedigreeFocus, setPedigreeFocus] = useState("");
  const [search, setSearch] = useState("");

  const byId = useMemo(() => new Map(breeders.map((b) => [b.id, b])), [breeders]);
  const males = useMemo(() => breeders.filter((b) => b.sex === "male"), [breeders]);
  const females = useMemo(() => breeders.filter((b) => b.sex === "female"), [breeders]);
  const selectionScores = useMemo(() => computeSelectionIndex(breeders, goalId), [breeders, goalId]);
  const alerts = useMemo(() => computeAlerts(breeders, byId), [breeders, byId]);
  const aiSuggestions = useMemo(() => computeAiSuggestions(breeders, selectionScores, byId, goalId), [breeders, selectionScores, byId, goalId]);

  function openNew() { setEditing(emptyBreeder()); setShowForm(true); }
  function openEdit(b) { setEditing({ ...b }); setShowForm(true); }
  function saveBreeder(b) {
    if (!b.tag && !b.name) return;
    if (!b.id) b.id = uid();
    updateBreeders((prev) => {
      const exists = prev.some((p) => p.id === b.id);
      return exists ? prev.map((p) => (p.id === b.id ? b : p)) : [...prev, b];
    });
    setShowForm(false);
    setEditing(null);
  }
  function deleteBreeder(id) { updateBreeders((prev) => prev.filter((p) => p.id !== id)); }

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    const breederRows = breeders.map((b) => ({
      "شماره شناسایی": b.tag, "نام": b.name, "جنسیت": b.sex === "male" ? "خروس" : "مرغ",
      "نژاد": b.breed, "تاریخ تولد": b.birthDate, "سن (ماه)": ageInMonths(b.birthDate) ?? "",
      "پدر": byId.get(b.sireId)?.tag || "", "مادر": byId.get(b.damId)?.tag || "",
      "وزن (kg)": b.weight, "تولید تخم": b.eggProduction, "درصد هچ": b.hatchPercent, "FCR": b.fcr,
      "مقاومت (۱-۱۰)": b.resistanceScore, "طول عمر تولید (ماه)": b.productiveLifespanMonths,
      "تلفات": b.mortality ? "بله" : "خیر", "شاخص انتخاب": (selectionScores.get(b.id) || 0).toFixed(3),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(breederRows), "مولدها");
    const recordRows = [];
    breeders.forEach((b) => (b.weightHistory || []).forEach((h) => recordRows.push({ "شماره شناسایی": b.tag, "تاریخ": h.date, "وزن (kg)": h.weight })));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recordRows), "رکوردهای وزن");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(alerts.map((a) => ({ نوع: a.type, پیام: a.text }))), "هشدارها");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(aiSuggestions.map((a) => ({ نوع: a.tone, پیشنهاد: a.text }))), "پیشنهاد اصلاح نژاد");
    XLSX.writeFile(wb, "flockline-report.xlsx");
  }

  const filteredBreeders = breeders.filter((b) => {
    const q = search.trim();
    if (!q) return true;
    return (b.tag + b.name + b.breed).toLowerCase().includes(q.toLowerCase());
  });

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#161F1A] text-[#EDE8DC] flex items-center justify-center">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen w-full bg-[#161F1A] text-[#EDE8DC]">
      <div className="flex min-h-screen">
        <aside className="no-print w-[220px] shrink-0 bg-[#1B2420] border-l border-[#2A362F] flex flex-col py-6 px-3 gap-1">
          <div className="flex items-center gap-2 px-3 mb-6">
            <div className="w-9 h-9 rounded-[40%_60%_60%_40%] bg-gradient-to-br from-[#E8A33D] to-[#C97A2B] flex items-center justify-center text-[#1B2420] font-extrabold text-lg">
              <Egg size={18} />
            </div>
            <div>
              <div className="font-extrabold text-[15px] leading-none">فلاک‌لاین</div>
              <div className="text-[10px] text-[#7C9186] mono tracking-wider mt-1">GENETICS · v1.0</div>
            </div>
          </div>
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-right ${active ? "bg-[#2A362F] text-[#E8A33D] font-semibold" : "text-[#B7C7BB] hover:bg-[#212C25]"}`}>
                <Icon size={16} />{n.label}
              </button>
            );
          })}
          <div className="mt-auto flex flex-col gap-2">
            <div className="px-3 text-[10px] text-[#5C6A61] leading-5">
              {user?.email}
              <br />{breeders.length} مولد ثبت‌شده
            </div>
            <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#E88A7A] hover:bg-[#3A1F1B]">
              <LogOut size={16} /> خروج از حساب
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 max-w-[1200px]">
          {tab === "dashboard" && <DashboardTab breeders={breeders} selectionScores={selectionScores} goalId={goalId} byId={byId} alerts={alerts} />}
          {tab === "breeders" && (
            <BreedersTab breeders={filteredBreeders} byId={byId} search={search} setSearch={setSearch} openNew={openNew} openEdit={openEdit} deleteBreeder={deleteBreeder} selectionScores={selectionScores} />
          )}
          {tab === "pedigree" && <PedigreeTab breeders={breeders} byId={byId} focus={pedigreeFocus} setFocus={setPedigreeFocus} />}
          {tab === "pairing" && <PairingTab breeders={breeders} males={males} females={females} byId={byId} goalId={goalId} pairSel={pairSel} setPairSel={setPairSel} />}
          {tab === "simulation" && <SimulationTab males={males} females={females} byId={byId} goalId={goalId} pairSel={pairSel} setPairSel={setPairSel} />}
          {tab === "alerts" && <AlertsTab alerts={alerts} />}
          {tab === "goal" && <GoalTab goalId={goalId} setGoalId={updateGoal} />}
          {tab === "ai" && <AiTab suggestions={aiSuggestions} breedersCount={breeders.length} />}
          {tab === "report" && (
            <ReportTab breeders={breeders} byId={byId} alerts={alerts} aiSuggestions={aiSuggestions} selectionScores={selectionScores} goalId={goalId} exportExcel={exportExcel} />
          )}
        </main>
      </div>

      {showForm && editing && (
        <BreederFormModal breeder={editing} breeders={breeders} onClose={() => { setShowForm(false); setEditing(null); }} onSave={saveBreeder} />
      )}
    </div>
  );
}
