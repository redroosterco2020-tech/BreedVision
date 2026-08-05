import React, { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Card, Field, inputCls } from "./ui.jsx";

export default function DeleteAccountCard({ deleteAccount }) {
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
