import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError(mapAuthError(err.code));
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotSubmit(e) {
    e.preventDefault();
    setForgotStatus("");
    setForgotBusy(true);
    try {
      await resetPassword(forgotEmail);
      setForgotStatus("لینک بازیابی رمز عبور به ایمیل شما ارسال شد.");
    } catch (err) {
      setForgotStatus(mapAuthError(err.code));
    } finally {
      setForgotBusy(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#0D1B2A] text-[#E7EEF4] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#13253A] border border-[#1E3A54] rounded-2xl p-7">
        <div className="flex items-center gap-2.5 mb-6">
          <img src="/icons/icon-192.png" alt="BreedVision" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <div className="font-extrabold text-lg leading-none">BreedVision</div>
            <div className="text-[10px] text-[#7189A0] mono tracking-wider mt-1">GENETICS · v1.0</div>
          </div>
        </div>

        {!forgotMode ? (
          <>
            <h1 className="text-xl font-extrabold mb-1">ورود به حساب</h1>
            <p className="text-[#9DB4C7] text-sm mb-5">برای مدیریت گله خود وارد شوید.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="ایمیل"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0E2033] border border-[#24425E] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6FA83E] placeholder:text-[#56707F]"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="رمز عبور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0E2033] border border-[#24425E] rounded-lg px-3 py-2.5 pl-10 text-sm outline-none focus:border-[#6FA83E] placeholder:text-[#56707F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7189A0] hover:text-[#E7EEF4]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-left">
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setForgotEmail(email); setForgotStatus(""); }}
                  className="text-xs text-[#6FA83E] hover:underline"
                >
                  رمز عبور را فراموش کرده‌اید؟
                </button>
              </div>
              {error && <div className="text-[#E88A7A] text-xs">{error}</div>}
              <button
                disabled={busy}
                className="mt-2 bg-[#6FA83E] text-[#0A1622] font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy && <Loader2 size={16} className="animate-spin" />}
                ورود
              </button>
            </form>

            <div className="text-center text-sm text-[#9DB4C7] mt-5">
              حساب ندارید؟{" "}
              <Link to="/signup" className="text-[#6FA83E] font-semibold">
                ثبت‌نام کنید
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-extrabold mb-1">بازیابی رمز عبور</h1>
            <p className="text-[#9DB4C7] text-sm mb-5">ایمیل حساب خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.</p>

            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="ایمیل"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="bg-[#0E2033] border border-[#24425E] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#6FA83E] placeholder:text-[#56707F]"
              />
              {forgotStatus && <div className="text-[#9DB4C7] text-xs">{forgotStatus}</div>}
              <button
                disabled={forgotBusy}
                className="mt-2 bg-[#6FA83E] text-[#0A1622] font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {forgotBusy && <Loader2 size={16} className="animate-spin" />}
                ارسال لینک بازیابی
              </button>
            </form>

            <div className="text-center text-sm text-[#9DB4C7] mt-5">
              <button onClick={() => setForgotMode(false)} className="text-[#6FA83E] font-semibold">
                بازگشت به صفحه ورود
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function mapAuthError(code) {
  const map = {
    "auth/invalid-email": "ایمیل نامعتبر است.",
    "auth/user-not-found": "کاربری با این ایمیل یافت نشد.",
    "auth/wrong-password": "رمز عبور اشتباه است.",
    "auth/invalid-credential": "ایمیل یا رمز عبور اشتباه است.",
    "auth/email-already-in-use": "این ایمیل قبلاً ثبت شده است.",
    "auth/weak-password": "رمز عبور باید حداقل ۶ کاراکتر باشد.",
    "auth/too-many-requests": "تعداد تلاش‌ها زیاد بوده، کمی صبر کنید.",
  };
  return map[code] || "خطایی رخ داد. دوباره تلاش کنید.";
                                                                              }
