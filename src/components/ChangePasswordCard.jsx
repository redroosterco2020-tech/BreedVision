import React, { useState } from "react";
import { Loader2, Eye, EyeOff, KeyRound } from "lucide-react";
import { Card, Field, inputCls } from "./ui.jsx";

export default function ChangePasswordCard({ changePassword }) {
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
