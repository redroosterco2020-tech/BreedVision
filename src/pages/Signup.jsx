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
    <div
      dir="rtl"
      className="min-h-screen bg-[#F4F7FA] text-[#101B26] dark:bg-[#0D1B2A] dark:text-[#E7EEF4] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-sm bg-white border border-[#DCE5EC] dark:bg-[#13253A] dark:border-[#1E3A54] rounded-2xl p-7">
        <div className="flex items-center gap-2.5 mb-6">
          <img src="/icons/icon-192.png" alt="BreedVision" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <div className="font-extrabold text-lg leading-none">BreedVision</div>
            <div className="text-[10px] text-[#5C7385] dark:text-[#7189A0] mono tracking-wider mt-1">
              GENETICS · v1.0
            </div>
          </div>
        </div>
        <h1 className="text-xl font-extrabold mb-1">ساخت حساب جدید</h1>
        <p className="text-[#5C7385] dark:text-[#9DB4C7] text-sm mb-5">
          داده‌های گله شما فقط برای خودتان ذخیره می‌شود.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="نام مزرعه یا نام شما"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#F7FAFC] border border-[#D7E0E8] dark:bg-[#0E2033] dark:border-[#24425E] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6FA83E] placeholder:text-[#8A9BA8] dark:placeholder:text-[#56707F]"
          />
          <input
            type="email"
            required
            placeholder="ایمیل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#F7FAFC] border border-[#D7E0E8] dark:bg-[#0E2033] dark:border-[#24425E] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6FA83E] placeholder:text-[#8A9BA8] dark:placeholder:text-[#56707F]"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="رمز عبور (حداقل ۶ کاراکتر)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F7FAFC] border border-[#D7E0E8] dark:bg-[#0E2033] dark:border-[#24425E] rounded-lg px-3 py-2.5 pl-10 text-sm outline-none focus:border-[#6FA83E] placeholder:text-[#8A9BA8] dark:placeholder:text-[#56707F]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5C7385] dark:text-[#7189A0] hover:text-[#101B26] dark:hover:text-[#E7EEF4]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <div className="text-[#C2493A] dark:text-[#E88A7A] text-xs">{error}</div>}
          <button
            disabled={busy}
            className="mt-2 bg-[#6FA83E] text-[#0A1622] font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            ثبت‌نام
          </button>
        </form>

        <div className="text-center text-sm text-[#5C7385] dark:text-[#9DB4C7] mt-5">
          حساب دارید؟{" "}
          <Link to="/login" className="text-[#6FA83E] font-semibold">
            وارد شوید
          </Link>
        </div>
      </div>
    </div>
  );
            }
