import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, SectionEyebrow, EmptyHint, inputCls } from "./ui.jsx";
import { BREED_GROUPS, groupById } from "../data/breedGroups.js";
import { BREEDS_LIVESTOCK } from "../data/breedsLivestock.js";
import { BREEDS_EQUINE } from "../data/breedsEquine.js";
import { BREEDS_OTHERS } from "../data/breedsOthers.js";

const ALL_BREEDS = [...BREEDS_LIVESTOCK, ...BREEDS_EQUINE, ...BREEDS_OTHERS];

export default function BreedEncyclopedia() {
  const [group, setGroup] = useState("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [picked, setPicked] = useState([]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_BREEDS.filter((b) => {
      if (group !== "all" && b.group !== group) return false;
      if (!q) return true;
      return (b.fa + " " + b.en + " " + b.origin).toLowerCase().includes(q);
    });
  }, [group, search]);

  function togglePick(id) {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  const pickedBreeds = picked
    .map((id) => ALL_BREEDS.find((b) => b.id === id))
    .filter(Boolean);

  const chipCls = (active) =>
    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " +
    (active
      ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]"
      : "bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-secondary)]");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <SectionEyebrow>BREEDS · دانشنامه نژادها</SectionEyebrow>
        <p className="text-[var(--text-secondary)] text-sm">
          معرفی نژادها با نام فارسی، انگلیسی و علمی، منشأ، تاریخچه و ویژگی‌ها. برای مقایسه، دو نژاد را علامت بزنید.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setGroup("all")} className={chipCls(group === "all")}>همه</button>
        {BREED_GROUPS.map((g) => (
          <button key={g.id} onClick={() => setGroup(g.id)} className={chipCls(group === g.id)}>
            {g.icon} {g.fa}
          </button>
        ))}
      </div>

      {group !== "all" && groupById(group) && (
        <Card className="p-3 text-[12px] text-[var(--text-detail)]">
          نام علمی گونه: <span className="mono text-[var(--text-primary)]">{groupById(group).sci}</span>
        </Card>
      )}

      <div className="relative w-full md:w-80">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-quaternary)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی نژاد یا منشأ..."
          className={inputCls + " w-full pr-9"}
        />
      </div>

      {pickedBreeds.length === 2 && (
        <Card className="p-4 overflow-x-auto">
          <div className="font-bold text-sm mb-3">مقایسه نژادها</div>
          <table className="w-full text-[12px] border-collapse min-w-[420px]">
            <thead>
              <tr className="text-[var(--text-tertiary)] border-b border-[var(--hover-bg)]">
                <th className="text-right py-2 w-24">ویژگی</th>
                <th className="text-right py-2">{pickedBreeds[0].fa}</th>
                <th className="text-right py-2">{pickedBreeds[1].fa}</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["نام انگلیسی", "en"],
                ["منشأ", "origin"],
                ["ظاهر", "look"],
                ["ویژگی‌های تولیدی", "production"],
                ["تاریخچه", "history"],
              ].map(([label, key]) => (
                <tr key={key} className="border-b border-[var(--divider)] align-top">
                  <td className="py-2 text-[var(--text-secondary)]">{label}</td>
                  <td className="py-2 text-[var(--text-detail)] leading-6">{pickedBreeds[0][key]}</td>
                  <td className="py-2 text-[var(--text-detail)] leading-6">{pickedBreeds[1][key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setPicked([])} className="mt-3 text-xs text-[var(--accent)]">
            پاک‌کردن انتخاب
          </button>
        </Card>
      )}

      {filtered.length === 0 && <EmptyHint text="نژادی یافت نشد." />}

      <div className="flex flex-col gap-2">
        {filtered.map((b) => {
          const g = groupById(b.group);
          const open = openId === b.id;
          const isPicked = picked.includes(b.id);
          return (
            <Card key={b.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => setOpenId(open ? null : b.id)}
                  className="text-right flex-1 min-w-0"
                >
                  <div className="font-bold text-sm">
                    {g ? g.icon : ""} {b.fa}
                    <span className="mono text-[11px] text-[var(--text-tertiary)] mr-2">{b.en}</span>
                  </div>
                  <div className="text-[12px] text-[var(--text-tertiary)] mt-1">
                    {g ? g.fa : ""} · منشأ: {b.origin}
                  </div>
                </button>
                <button
                  onClick={() => togglePick(b.id)}
                  className={
                    "shrink-0 px-2.5 py-1 rounded-lg text-[11px] border " +
                    (isPicked
                      ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]"
                      : "bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-secondary)]")
                  }
                >
                  {isPicked ? "انتخاب شد" : "مقایسه"}
                </button>
              </div>
              {open && (
                <div className="flex flex-col gap-1.5 text-[12px] text-[var(--text-detail)] leading-6 pt-2 border-t border-[var(--hover-bg)]">
                  <div><span className="text-[var(--text-secondary)]">تاریخچه: </span>{b.history}</div>
                  <div><span className="text-[var(--text-secondary)]">ظاهر: </span>{b.look}</div>
                  <div><span className="text-[var(--text-secondary)]">ویژگی‌های تولیدی: </span>{b.production}</div>
                  {g && (
                    <div>
                      <span className="text-[var(--text-secondary)]">نام علمی گونه: </span>
                      <span className="mono">{g.sci}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <p className="text-[11px] text-[var(--text-quaternary)] leading-5">
        اطلاعات این بخش آموزشی و خلاصه است و ممکن است با منابع تخصصی تفاوت جزئی داشته باشد.
      </p>
    </div>
  );
}
