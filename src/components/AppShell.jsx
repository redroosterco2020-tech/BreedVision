import React, { useState, useMemo } from "react";
import {
  PawPrint, GitBranch, Sparkles, FlaskConical, AlertTriangle, Target,
  LayoutDashboard, FileDown, Dna, LogOut, Menu, X, UserCircle, Sun, Moon,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useFlockData } from "../lib/useFlockData.js";
import { emptyBreeder, uid, ageInMonths, SPECIES, ALL_GOALS } from "../lib/constants.js";
import { computeSelectionIndex, computeAlerts, computeAiSuggestions } from "../lib/genetics.js";
import BreederFormModal from "../components/BreederFormModal.jsx";
import ProfileTab from "../components/ProfileTab.jsx";
import AIHub from "../components/AIHub.jsx";
import {
  DashboardTab, BreedersTab, PedigreeTab, PairingTab, SimulationTab,
  AlertsTab, GoalTab, ReportTab,
} from "../components/Tabs.jsx";

const NAV = [
  { id: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { id: "breeders", label: "مولدها", icon: PawPrint },
  { id: "pedigree", label: "شجره‌نامه", icon: GitBranch },
  { id: "pairing", label: "انتخاب جفت", icon: Dna },
  { id: "simulation", label: "شبیه‌سازی نسل‌ها", icon: FlaskConical },
  { id: "alerts", label: "هشدارها", icon: AlertTriangle },
  { id: "goal", label: "اهداف اصلاح نژاد", icon: Target },
  { id: "ai", label: "هوش مصنوعی", icon: Sparkles },
  { id: "report", label: "گزارش", icon: FileDown },
  { id: "profile", label: "پروفایل", icon: UserCircle },
];

const SPECIES_MAP = Object.fromEntries(SPECIES.map((s) => [s.id, s.label]));

export default function AppShell() {
  const { user, logout } = useAuth();
  const { mode, setMode } = useTheme();
  const isLight = mode === "light" || (mode === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches);
  function toggleQuickTheme() { setMode(isLight ? "dark" : "light"); }
  const { breeders, goalWeights, profile, loaded, updateBreeders, updateGoalWeights, updateProfile, saveError, saving } = useFlockData(user?.uid);
  const [tab, setTab] = useState("dashboard");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [pairSel, setPairSel] = useState({ sireId: "", damId: "" });
  const [pedigreeFocus, setPedigreeFocus] = useState("");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const byId = useMemo(() => new Map(breeders.map((b) => [b.id, b])), [breeders]);
  const males = useMemo(() => breeders.filter((b) => b.sex === "male"), [breeders]);
  const females = useMemo(() => breeders.filter((b) => b.sex === "female"), [breeders]);
  const selectionScores = useMemo(() => computeSelectionIndex(breeders, goalWeights), [breeders, goalWeights]);
  const alerts = useMemo(() => computeAlerts(breeders, byId), [breeders, byId]);
  const aiSuggestions = useMemo(() => computeAiSuggestions(breeders, selectionScores, byId, goalWeights), [breeders, selectionScores, byId, goalWeights]);

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
  function selectTab(id) { setTab(id); setMenuOpen(false); }

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    const breederRows = breeders.map((b) => ({
      "شماره شناسایی": b.tag, "نام": b.name, "نوع دام": SPECIES_MAP[b.species] || "", "جنسیت": b.sex === "male" ? "نر" : "ماده",
      "نژاد": b.breed, "تاریخ تولد": b.birthDate, "سن (ماه)": ageInMonths(b.birthDate) ?? "",
      "پدر": byId.get(b.sireId)?.tag || "", "مادر": byId.get(b.damId)?.tag || "",
      "وزن (kg)": b.weight, "تولید شیر (لیتر/روز)": b.milkProduction, "کیفیت گوشت": b.meatQuality,
      "تولید تخم": b.eggProduction, "درصد هچ": b.hatchPercent, "FCR": b.fcr,
      "مقاومت (۱-۱۰)": b.resistanceScore, "باروری (۱-۱۰)": b.fertilityScore, "نرخ زنده‌مانی (%)": b.survivalRate,
      "طول عمر تولید (ماه)": b.productiveLifespanMonths, "سازگاری آب‌وهوا (۱-۱۰)": b.climateTolerance,
      "تلفات": b.mortality ? "بله" : "خیر", "شاخص انتخاب": (selectionScores.get(b.id) || 0).toFixed(3),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(breederRows), "مولدها");
    const recordRows = [];
    breeders.forEach((b) => (b.weightHistory || []).forEach((h) => recordRows.push({ "شماره شناسایی": b.tag, "تاریخ": h.date, "وزن (kg)": h.weight })));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recordRows), "رکوردهای وزن");
    const goalRows = Object.entries(goalWeights || {}).map(([gid, w]) => {
      const g = ALL_GOALS.find((x) => x.id === gid);
      return { "هدف": g ? g.label : gid, "اهمیت (%)": w };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(goalRows), "اهداف اصلاح نژاد");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(alerts.map((a) => ({ نوع: a.type, پیام: a.text }))), "هشدارها");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(aiSuggestions.map((a) => ({ نوع: a.tone, پیشنهاد: a.text }))), "پیشنهاد اصلاح نژاد");
    XLSX.writeFile(wb, "breedvision-report.xlsx");
  }

  const filteredBreeders = breeders.filter((b) => {
    const q = search.trim();
    if (!q) return true;
    return (b.tag + b.name + b.breed).toLowerCase().includes(q.toLowerCase());
  });

  const activeNav = NAV.find((n) => n.id === tab);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)]">
      {saveError && (
        <div className="no-print fixed top-0 inset-x-0 z-50 bg-[var(--bad-bg)] border-b border-[var(--bad-border)] text-[var(--bad-text)] text-xs px-4 py-2 text-center">
          {saveError}
        </div>
      )}
      {/* Mobile top bar */}
      <header className="no-print md:hidden sticky top-0 z-30 flex items-center justify-between bg-[var(--bg-elevated)] border-b border-[var(--hover-bg)] px-4 py-3">
        <div className="flex items-center gap-2">
          <img src="/icons/icon-192.png" alt="BreedVision" className="w-8 h-8 rounded-xl object-cover" />
          <div>
            <div className="font-extrabold text-sm leading-none">BreedVision</div>
            <div className="text-[10px] text-[var(--text-tertiary)] mono mt-0.5">{activeNav?.label}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleQuickTheme} className="p-2 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-primary)]">
            {isLight ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={() => setMenuOpen(true)} className="p-2 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-primary)]">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="no-print fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="absolute top-0 right-0 h-full w-[78%] max-w-[300px] bg-[var(--bg-elevated)] border-l border-[var(--hover-bg)] flex flex-col py-5 px-3 gap-1 overflow-y-auto">
            <div className="flex items-center justify-between px-2 mb-4">
              <div className="flex items-center gap-2.5">
                <img src="/icons/icon-192.png" alt="BreedVision" className="w-9 h-9 rounded-xl object-cover" />
                <div>
                  <div className="font-extrabold text-[15px] leading-none">BreedVision</div>
                  <div className="text-[10px] text-[var(--text-tertiary)] mono tracking-wider mt-1">GENETICS · v1.0</div>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)]">
                <X size={18} />
              </button>
            </div>
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = tab === n.id;
              return (
                <button key={n.id} onClick={() => selectTab(n.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-right ${active ? "bg-[var(--hover-bg)] text-[var(--accent)] font-semibold" : "text-[var(--text-detail)] hover:bg-[var(--card-bg)]"}`}>
                  <Icon size={16} />{n.label}
                </button>
              );
            })}
            <div className="mt-auto flex flex-col gap-2 pt-3">
              <div className="px-3 text-[10px] text-[var(--text-quaternary)] leading-5">
                {user?.email}
                <br />{breeders.length} مولد ثبت‌شده
              </div>
              <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--bad-text)] hover:bg-[var(--bad-bg)]">
                <LogOut size={16} /> خروج از حساب
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="no-print hidden md:flex w-[220px] shrink-0 bg-[var(--bg-elevated)] border-l border-[var(--hover-bg)] flex-col py-6 px-3 gap-1">
          <div className="flex items-center gap-2 px-3 mb-6">
            <img src="/icons/icon-192.png" alt="BreedVision" className="w-9 h-9 rounded-xl object-cover" />
            <div>
              <div className="font-extrabold text-[15px] leading-none">BreedVision</div>
              <div className="text-[10px] text-[var(--text-tertiary)] mono tracking-wider mt-1">GENETICS · v1.0</div>
            </div>
          </div>
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-right ${active ? "bg-[var(--hover-bg)] text-[var(--accent)] font-semibold" : "text-[var(--text-detail)] hover:bg-[var(--card-bg)]"}`}>
                <Icon size={16} />{n.label}
              </button>
            );
          })}
          <div className="mt-auto flex flex-col gap-2">
            <div className="px-3 text-[10px] text-[var(--text-quaternary)] leading-5">
              {user?.email}
              <br />{breeders.length} مولد ثبت‌شده
            </div>
            <button onClick={toggleQuickTheme} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]">
              {isLight ? <Moon size={16} /> : <Sun size={16} />} {isLight ? "حالت تیره" : "حالت روشن"}
            </button>
            <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--bad-text)] hover:bg-[var(--bad-bg)]">
              <LogOut size={16} /> خروج از حساب
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 max-w-full md:max-w-[1200px] overflow-x-hidden">
          {tab === "dashboard" && <DashboardTab breeders={breeders} selectionScores={selectionScores} goalWeights={goalWeights} byId={byId} alerts={alerts} />}
          {tab === "breeders" && (
            <BreedersTab breeders={filteredBreeders} byId={byId} search={search} setSearch={setSearch} openNew={openNew} openEdit={openEdit} deleteBreeder={deleteBreeder} selectionScores={selectionScores} />
          )}
          {tab === "pedigree" && <PedigreeTab breeders={breeders} byId={byId} focus={pedigreeFocus} setFocus={setPedigreeFocus} />}
          {tab === "pairing" && <PairingTab breeders={breeders} males={males} females={females} byId={byId} goalWeights={goalWeights} pairSel={pairSel} setPairSel={setPairSel} />}
          {tab === "simulation" && <SimulationTab males={males} females={females} byId={byId} goalWeights={goalWeights} pairSel={pairSel} setPairSel={setPairSel} />}
          {tab === "alerts" && <AlertsTab alerts={alerts} />}
          {tab === "goal" && <GoalTab goalWeights={goalWeights} setGoalWeights={updateGoalWeights} />}
          {tab === "ai" && <AIHub breeders={breeders} byId={byId} selectionScores={selectionScores} goalWeights={goalWeights} alerts={alerts} aiSuggestions={aiSuggestions} />}
          {tab === "report" && (
            <ReportTab breeders={breeders} byId={byId} alerts={alerts} aiSuggestions={aiSuggestions} selectionScores={selectionScores} goalWeights={goalWeights} exportExcel={exportExcel} />
          )}
          {tab === "profile" && <ProfileTab profile={profile} updateProfile={updateProfile} />}
        </main>
      </div>

      {showForm && editing && (
        <BreederFormModal breeder={editing} breeders={breeders} onClose={() => { setShowForm(false); setEditing(null); }} onSave={saveBreeder} />
      )}
    </div>
  );
}
