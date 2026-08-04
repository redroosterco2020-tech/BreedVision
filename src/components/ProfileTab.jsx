import React, { useState } from "react";
import { Loader2, Eye, EyeOff, Save, KeyRound, Trash2, Sun, Moon, MonitorSmartphone } from "lucide-react";
import { Card, Field, SectionEyebrow, inputCls } from "./ui.jsx";
import { ACTIVITY_TYPES } from "../lib/constants.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function initialsFrom(text) {
  const t = (text || "").trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ProfileTab({ profile, updateProfile }) {
  const { user, changePassword, deleteAccount, logout } = useAuth();
  const [form, setForm] = useState(profile);
  const [savedMsg, setSavedMsg] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function saveProfile() {
    updateProfile(form);
    setSavedMsg("تغییرات ذخیره شد.");
    setTimeout(() => setSavedMsg(""), 2500);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <SectionEyebrow>PROFILE · پروفایل</SectionEyebrow>
        <h1 className="text-2xl font-extrabold">پروفایل کاربری</h1>
      </header>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14263A] to-[#4C7A2E] flex items-center justify-center text-xl font-extrabold text-white shrink-0">
            {initialsFrom(form.fullName || user?.email)}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm truncate">{form.fullName || "بدون نام"}</div>
            <div className="text-[12px] text-[var(--text-tertiary)] truncate">{user?.email}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="نام و نام خانوادگی">
            <input className={inputCls} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </Field>
          <Field label="نام مزرعه یا مرکز اصلاح نژاد">
            <input className={inputCls} value={form.farmName} onChange={(e) => set("farmName", e.target.value)} />
          </Field>
          <Field label="شماره تماس">
            <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="نوع فعالیت">
            <select className={inputCls} value={form.activityType} onChange={(e) => set("activityType", e.target.value)}>
              <option value="">— انتخاب کنید —</option>
              {ACTIVITY_TYPES.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </Field>
          <Field label="کشور">
            <input className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)} />
          </Field>
          <Field label="استان">
            <input className={inputCls} value={form.province} onChange={(e) => set("province", e.target.value)} />
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={saveProfile} className="flex items-center gap-2 bg-[var(--accent)] text-[var(--on-accent)] font-bold px-4 py-2.5 rounded-xl hover:brightness-110">
            <Save size={16} /> ذخیره پروفایل
          </button>
          {savedMsg && <span className="text-[var(--good-text)] text-sm">{savedMsg}</span>}
        </div>
      </Card>

      <AppearanceCard />

      <ChangePasswordCard changePassword={changePassword} />

      <DeleteAccountCard deleteAccount={deleteAccount} logout={logout} />
    </div>
  );
}

function AppearanceCard() {
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

function ChangePasswordCard({ changePassword }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState("good");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (next.length < 6) {
      setMsg("رمز جدید باید حداقل ۶ کاراکتر باشد.");
      setMsgTone("bad");
      return;
    }
    if (next !== confirm) {
      setMsg("تکرار رمز جدید با رمز جدید یکی نیست.");
      setMsgTone("bad");
      return;
    }
    setBusy(true);
    try {
      await changePassword(current, next);
      setMsg("رمز عبور با موفقیت تغییر کرد.");
      setMsgTone("good");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      const map = {
        "auth/wrong-password": "رمز عبور فعلی اشتباه است.",
        "auth/invalid-credential": "رمز عبور فعلی اشتباه است.",
        "auth/weak-password": "رمز جدید باید حداقل ۶ کاراکتر باشد.",
        "auth/too-many-requests": "تعداد تلاش‌ها زیاد بوده، کمی صبر کنید.",
      };
      setMsg(map[err.code] || "خطایی رخ داد. دوباره تلاش کنید.");
      setMsgTone("bad");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2 font-bold text-sm">
        <KeyRound size={16} /> تغییر رمز عبور
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="رمز عبور فعلی">
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              required
              className={`${inputCls} w-full pl-10`}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
            <button type="button" onClick={() => setShowCurrent((s) => !s)} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <div />
        <Field label="رمز عبور جدید">
          <div className="relative">
            <input
              type={showNext ? "text" : "password"}
              required
              minLength={6}
              className={`${inputCls} w-full pl-10`}
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
            <button type="button" onClick={() => setShowNext((s) => !s)} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              {showNext ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Field label="تکرار رمز عبور جدید">
          <input
            type={showNext ? "text" : "password"}
            required
            minLength={6}
            className={inputCls}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <div className="md:col-span-2 flex items-center gap-3">
          <button disabled={busy} className="flex items-center gap-2 bg-[var(--hover-bg)] text-[var(--good-text)] font-semibold px-4 py-2.5 rounded-xl hover:brightness-110 disabled:opacity-60">
            {busy && <Loader2 size={16} className="animate-spin" />}
            تغییر رمز عبور
          </button>
          {msg && <span className={`text-sm ${msgTone === "good" ? "text-[var(--good-text)]" : "text-[var(--bad-text)]"}`}>{msg}</span>}
        </div>
      </form>
    </Card>
  );
}

function DeleteAccountCard({ deleteAccount, logout }) {
  const [password, setPassword] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleDelete() {
    setMsg("");
    setBusy(true);
    try {
      await deleteAccount(password);
    } catch (err) {
      const map = {
        "auth/wrong-password": "رمز عبور اشتباه است.",
        "auth/invalid-credential": "رمز عبور اشتباه است.",
        "auth/too-many-requests": "تعداد تلاش‌ها زیاد بوده، کمی صبر کنید.",
      };
      setMsg(map[err.code] || "خطایی رخ داد. دوباره تلاش کنید.");
      setBusy(false);
    }
  }

  return (
    <Card className="p-5 flex flex-col gap-3 border-[var(--bad-border)]">
      <div className="flex items-center gap-2 font-bold text-sm text-[var(--bad-text)]">
        <Trash2 size={16} /> حذف حساب کاربری
      </div>
      <p className="text-[var(--text-secondary)] text-sm">
        با حذف حساب، تمام اطلاعات مولدها و تنظیمات گله شما برای همیشه پاک می‌شود و این عمل قابل بازگشت نیست.
      </p>
      {!confirming ? (
        <button onClick={() => setConfirming(true)} className="self-start px-4 py-2 rounded-xl text-sm bg-[var(--bad-bg)] text-[var(--bad-text)] font-bold">
          حذف حساب کاربری
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <Field label="برای تأیید، رمز عبور خود را وارد کنید">
            <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {msg && <div className="text-[var(--bad-text)] text-sm">{msg}</div>}
          <div className="flex gap-2">
            <button onClick={() => setConfirming(false)} className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]">
              انصراف
            </button>
            <button
              onClick={handleDelete}
              disabled={busy || !password}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-[var(--bad-border)] text-[var(--bad-text)] font-bold disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              تأیید نهایی حذف حساب
            </button>
          </div>
        </div>
      )}
    </Card>
  );
      }
