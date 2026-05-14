import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

export default function ResetPassword() {
  var [searchParams] = useSearchParams();
  var token = searchParams.get("token");
  var navigate = useNavigate();

  var [password, setPassword] = useState("");
  var [confirm, setConfirm] = useState("");
  var [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой"); return; }
    if (password !== confirm) { toast.error("Нууц үг таарахгүй байна"); return; }
    if (!token) { toast.error("Линк буруу байна"); return; }

    setSaving(true);
    try {
      await API.post("/auth/reset-password", { token: token, new_password: password });
      toast.success("Нууц үг амжилттай шинэчлэгдлээ!");
      setTimeout(function () { navigate("/login"); }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  }

  var inputCls = "w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

  // If no token at all, show error
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center gap-4 p-6">
        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900 rounded p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-gray-100 mb-2">Линк буруу байна</h1>
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-5">Нууц үг сэргээх линк буруу эсвэл бүрэн бус байна.</p>
          <Link to="/forgot-password" className="inline-block bg-[#1e3a8a] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition">
            Шинэ линк авах
          </Link>
        </div>
      </div>
    );
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
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded p-8 md:p-10 shadow-sm">
            <div className="mb-8">
              <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">Нууц үг сэргээх</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Шинэ нууц үг тохируулах</h1>
              <p className="text-sm text-slate-600 dark:text-gray-400 mt-2">Хүчтэй, шинэ нууц үг оруулна уу.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Шинэ нууц үг <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={password}
                  onChange={function (e) { setPassword(e.target.value); }}
                  required
                  placeholder="8+ тэмдэгт"
                  className={inputCls}
                  autoComplete="new-password"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Нууц үг давтах <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={confirm}
                  onChange={function (e) { setConfirm(e.target.value); }}
                  required
                  placeholder="Нууц үгээ дахин оруулна уу"
                  className={inputCls}
                  autoComplete="new-password"
                />
              </div>

              <div className="bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded p-3 text-xs text-slate-600 dark:text-gray-400">
                <p className="font-semibold text-slate-700 dark:text-gray-300 mb-1">Нууц үгийн зөвлөмж:</p>
                <ul className="space-y-0.5">
                  <li>• Хамгийн багадаа 8 тэмдэгт</li>
                  <li>• Том ба жижиг үсэг хослуулах</li>
                  <li>• Тоо эсвэл тэмдэгт нэмэх</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#1e3a8a] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-50 transition"
              >
                {saving ? "Шинэчилж байна..." : "Нууц үг шинэчлэх →"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-gray-700 text-center">
              <Link to="/login" className="text-sm text-slate-600 dark:text-gray-400 hover:text-[#1e3a8a] font-medium">
                ← Нэвтрэх хуудас руу буцах
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}