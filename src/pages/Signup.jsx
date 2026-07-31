import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Egg, Loader2 } from "lucide-react";
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
    <div dir="rtl" className="min-h-screen bg-[#161F1A] text-[#EDE8DC] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#212C25] border border-[#31402F] rounded-2xl p-7">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-[40%_60%_60%_40%] bg-gradient-to-br from-[#E8A33D] to-[#C97A2B] flex items-center justify-center text-[#1B2420]">
            <Egg size={20} />
          </div>
          <div>
            <div className="font-extrabold text-lg leading-none">فلاک‌لاین</div>
            <div className="text-[10px] text-[#7C9186] mono tracking-wider mt-1">GENETICS · v1.0</div>
          </div>
        </div>
        <h1 className="text-xl font-extrabold mb-1">ساخت حساب جدید</h1>
        <p className="text-[#9FB3A5] text-sm mb-5">داده‌های گله شما فقط برای خودتان ذخیره می‌شود.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="نام مزرعه یا نام شما"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#1A2320] border border-[#354238] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#E8A33D] placeholder:text-[#5C6A61]"
          />
          <input
            type="email"
            required
            placeholder="ایمیل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#1A2320] border border-[#354238] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#E8A33D] placeholder:text-[#5C6A61]"
          />
          <input
            type="password"
            required
            placeholder="رمز عبور (حداقل ۶ کاراکتر)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#1A2320] border border-[#354238] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#E8A33D] placeholder:text-[#5C6A61]"
          />
          {error && <div className="text-[#E88A7A] text-xs">{error}</div>}
          <button
            disabled={busy}
            className="mt-2 bg-[#E8A33D] text-[#1B2420] font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            ثبت‌نام
          </button>
        </form>

        <div className="text-center text-sm text-[#9FB3A5] mt-5">
          حساب دارید؟{" "}
          <Link to="/login" className="text-[#E8A33D] font-semibold">
            وارد شوید
          </Link>
        </div>
      </div>
    </div>
  );
}
