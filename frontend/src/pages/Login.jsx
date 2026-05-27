import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const timedOut = searchParams.get("reason") === "timeout";

  const handleSubmit = async function (e) {
    e.preventDefault();
    if (loading) return;
    setUnverified(false);
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Амжилттай нэвтэрлээ!");
      window.location.href = "/dashboard";
    } catch (err) {
      var msg = err.response?.data?.detail || "Нэвтрэх боломжгүй";
      toast.error(msg);
      if (msg.indexOf("баталгаажуул") !== -1) {
        setUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  async function handleResend() {
    if (!email) { toast.error("И-мэйл хаягаа оруулна уу"); return; }
    setResending(true);
    try {
      await API.post("/auth/resend-verification", { email: email });
      toast.success("Баталгаажуулах линк дахин илгээгдлээ. И-мэйлээ шалгана уу.");
    } catch (err) {
      toast.error("Алдаа гарлаа");
    } finally {
      setResending(false);
    }
  }

  var inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  var labelCls = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex flex-col">
      {/* Nav */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="CareerPrep" className="w-9 h-9 drop-shadow-sm" />
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">CareerPrep</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Career Platform</div>
            </div>
          </Link>
          <Link to="/register" className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 font-medium transition">
            Бүртгүүлэх →
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 md:p-10 shadow-sm">
            {timedOut && (
              <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl leading-none">🔒</span>
                <div>
                  <p className="text-sm text-amber-900 dark:text-amber-300">Аюулгүй байдлын үүднээс 15 минут идэвхгүй байсан тул автоматаар гарлаа. Дахин нэвтэрнэ үү.</p>
                </div>
              </div>
            )}

            <div className="mb-8">
              <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">Нэвтрэх</p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Тавтай морил</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">И-мэйл хаягаараа нэвтэрнэ үү.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>И-мэйл</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className={inputCls}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Нууц үг</label>
                  <Link to="/forgot-password" className="text-xs text-violet-600 hover:underline font-medium">
                    Нууц үг мартсан уу?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Нууц үгээ оруулна уу"
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-2.5 rounded-full text-sm font-semibold hover:shadow-md transition mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Нэвтэрж байна...
                  </>
                ) : (
                  "Нэвтрэх →"
                )}
              </button>
            </form>

            {unverified && (
              <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">И-мэйл хаяг баталгаажаагүй байна</p>
                <p className="text-xs text-amber-800 dark:text-amber-400 mb-3">
                  Бүртгүүлэх үед илгээсэн баталгаажуулах линкийг дарна уу. Эсвэл доорх товчоор шинээр илгээж болно.
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 transition"
                >
                  {resending ? "Илгээж байна..." : "Баталгаажуулах линк дахин илгээх"}
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Бүртгэл байхгүй юу?{" "}
                <Link to="/register" className="text-violet-600 font-semibold hover:underline">
                  Бүртгүүлэх
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            Нэвтэрснээр та{" "}
            <Link to="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 underline">Үйлчилгээний нөхцөл</Link>
            {" "}ба{" "}
            <Link to="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 underline">Нууцлалын бодлого</Link>
            -г хүлээн зөвшөөрсөн болно.
          </p>
        </div>
      </div>
    </div>
  );
}
