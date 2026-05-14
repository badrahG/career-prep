import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

export default function ForgotPassword() {
  var [email, setEmail] = useState("");
  var [sending, setSending] = useState(false);
  var [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { toast.error("И-мэйл оруулна уу"); return; }
    setSending(true);
    try {
      await API.post("/auth/forgot-password", { email: email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа гарлаа");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-sm tracking-wide">CP</span>
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-gray-100">CareerPrep</span>
          </Link>
          <Link to="/login" className="text-sm text-slate-700 dark:text-gray-300 hover:text-[#1e3a8a] font-medium">
            ← Нэвтрэх
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded p-8 md:p-10 shadow-sm">
            {sent ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100 mb-2">И-мэйлээ шалгана уу</h1>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-6">
                  Хэрэв <span className="font-semibold text-slate-900 dark:text-gray-200">{email}</span> хаяг бүртгэлтэй бол нууц үг сэргээх линкийг илгээлээ. Линкийн хүчинтэй хугацаа <strong>1 цаг</strong>.
                </p>
                <div className="bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded p-3 mb-5 text-xs text-slate-600 dark:text-gray-400 text-left">
                  И-мэйл ирэхгүй бол <strong>Spam/Junk</strong> хавтас шалгана уу. Эсвэл хаягаа зөв бичсэн эсэхээ нягтална уу.
                </div>
                <Link to="/login" className="block bg-[#1e3a8a] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition">
                  Нэвтрэх хуудас руу буцах
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">Нууц үг сэргээх</p>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Нууц үгээ мартсан уу?</h1>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mt-2">
                    Санаа зоволтгүй. Бүртгэлтэй и-мэйл хаягаа оруулбал нууц үг сэргээх линк илгээнэ.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">И-мэйл хаяг</label>
                    <input
                      type="email"
                      value={email}
                      onChange={function (e) { setEmail(e.target.value); }}
                      required
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-[#1e3a8a] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-50 transition"
                  >
                    {sending ? "Илгээж байна..." : "Сэргээх линк илгээх →"}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-gray-700 text-center">
                  <p className="text-sm text-slate-600 dark:text-gray-400">
                    Нууц үгээ санасан уу?{" "}
                    <Link to="/login" className="text-[#1e3a8a] font-semibold hover:underline">
                      Нэвтрэх
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}