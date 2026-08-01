import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { mapAuthError } from "./Login.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div dir="rtl" className="min-h-screen bg-[#0D1B2A] text-[#E7EEF4] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#13253A] border border-[#1E3A54] rounded-2xl p-7">
        <div className="flex items-center gap-2.5 mb-6">
          <img src="/icons/icon-192.png" alt="فلاک‌لاین" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <div className="font-extrabold text-lg leading-none">فلاک‌لاین</div>
            <div className="text-[10px] text-[#7189A0] mono tracking-wider mt-1">GENETICS · v1.0</div>
          </div>
        </div>
        <h1 className="text-xl font-extrabold mb-1">ساخت حساب جدید</h1>
        <p className="text-[#9DB4C7] text-sm mb-5">داده‌های گله شما فقط برای خودتان ذخیره می‌شود.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="نام مزرعه یا نام شما"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#0E2033] border border-[#24425E] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6FA83E] placeholder:text-[#56707F]"
          />
          <input
            type="email"
            required
            placeholder="ایمیل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#0E2033] border border-[#24425E] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6FA83E] placeholder:text-[#56707F]"
          />
          <input
            type="password"
            required
            placeholder="رمز عبور (حداقل ۶ کاراکتر)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#0E2033] border border-[#24425E] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6FA83E] placeholder:text-[#56707F]"
          />
          {error && <div className="text-[#E88A7A] text-xs">{error}</div>}
          <button
            disabled={busy}
            className="mt-2 bg-[#6FA83E] text-[#0A1622] font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            ثبت‌نام
          </button>
        </form>

        <div className="text-center text-sm text-[#9DB4C7] mt-5">
          حساب دارید؟{" "}
          <Link to="/login" className="text-[#6FA83E] font-semibold">
            وارد شوید
          </Link>
        </div>
      </div>
    </div>
  );
            }
