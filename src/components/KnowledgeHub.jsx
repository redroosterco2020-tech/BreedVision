import React, { useState } from "react";
import { SectionEyebrow } from "./ui.jsx";
import BreedEncyclopedia from "./BreedEncyclopedia.jsx";
import ChromosomeEncyclopedia from "./ChromosomeEncyclopedia.jsx";
import GeneticBank from "./GeneticBank.jsx";
import GeneticCalculator from "./GeneticCalculator.jsx";
import InheritanceSimulator from "./InheritanceSimulator.jsx";
import FertilizationSimulator from "./FertilizationSimulator.jsx";
import BreedingTool from "./BreedingTool.jsx";
import ReproductionEncyclopedia from "./ReproductionEncyclopedia.jsx";
import Glossary from "./Glossary.jsx";
import VisualAtlas from "./VisualAtlas.jsx";
import CrossbreedingSimulator from "./CrossbreedingSimulator.jsx";
const SECTIONS = [
  { id: "breeds", label: "نژادها", Comp: BreedEncyclopedia },
    { id: "cross", label: "شبیه‌ساز تلاقی نژادها", Comp: CrossbreedingSimulator },
  { id: "chromo", label: "کروموزوم‌شناسی", Comp: ChromosomeEncyclopedia },
  { id: "bank", label: "بانک ژنتیک", Comp: GeneticBank },
  { id: "calc", label: "ماشین‌حساب ژنتیک", Comp: GeneticCalculator },
  { id: "inherit", label: "شبیه‌ساز وراثت", Comp: InheritanceSimulator },
  { id: "fert", label: "شبیه‌ساز لقاح", Comp: FertilizationSimulator },
  { id: "breeding", label: "ابزار اصلاح نژاد", Comp: BreedingTool },
  { id: "repro", label: "دانشنامه تولیدمثل", Comp: ReproductionEncyclopedia },
  { id: "glossary", label: "فرهنگ اصطلاحات", Comp: Glossary },
  { id: "atlas", label: "اطلس و کتابخانه", Comp: VisualAtlas },
];
export default function KnowledgeHub({ breeders = [], goalWeights = {} }) {
  const [section, setSection] = useState("breeds");
  const active = SECTIONS.find((s) => s.id === section) || SECTIONS[0];
  const Comp = active.Comp;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <SectionEyebrow>KNOWLEDGE · دانشنامه</SectionEyebrow>
        <h1 className="text-2xl font-extrabold">دانشنامه (آفلاین)</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          همه اطلاعات این بخش داخل خود برنامه است و بدون اینترنت هم کار می‌کند.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " +
              (section === s.id
                ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]"
                : "bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-secondary)]")
            }
          >
            {s.label}
          </button>
        ))}
      </div>
<Comp breeders={breeders} goalWeights={goalWeights} />
    </div>
  );
}
