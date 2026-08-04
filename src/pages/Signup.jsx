import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { mapAuthError } from "./Login.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signup(email, password, name);
      navigate("/app");
    } catch (err) {
      setError(mapAuthError(err.code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-7">
        <div className="flex items-center gap-2.5 mb-6">
          <img src="/icons/icon-192.png" alt="BreedVision" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <div className="font-extrabold text-lg leading-none">BreedVision</div>
            <div className="text-[10px] text-[var(--text-tertiary)] mono tracking-wider mt-1">GENETICS · v1.0</div>
          </div>
        </div>
        <h1 className="text-xl font-extrabold mb-1">ساخت حساب جدید</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-5">داده‌های گله شما فقط برای خودتان ذخیره می‌شود.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="نام مزرعه یا نام شما"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-quaternary)]"
          />
          <input
            type="email"
            required
            placeholder="ایمیل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-quaternary)]"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="رمز عبور (حداقل ۶ کاراکتر)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2.5 pl-10 text-sm outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-quaternary)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <div className="text-[var(--bad-text)] text-xs">{error}</div>}
          <button
            disabled={busy}
            className="mt-2 bg-[var(--accent)] text-[var(--on-accent)] font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            ثبت‌نام
          </button>
        </form>

        <div className="text-center text-sm text-[var(--text-secondary)] mt-5">
          حساب دارید؟{" "}
          <Link to="/login" className="text-[var(--accent)] font-semibold">
            وارد شوید
          </Link>
        </div>
      </div>
    </div>
  );
              }
