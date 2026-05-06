import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async function (e) {
    e.preventDefault();
    setUnverified(false);
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

  var inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition bg-white";
  var labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center rounded-xl shadow-sm">
              <span className="text-white font-bold text-sm tracking-wide">CP</span>
            </div>
            <div>
              <div className="text-base font-bold text-gray-900 leading-none">CareerPrep</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Career Platform</div>
            </div>
          </Link>
          <Link to="/register" className="text-sm text-gray-600 hover:text-violet-600 font-medium transition">
            Бүртгүүлэх →
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 md:p-10 shadow-sm">
            <div className="mb-8">
              <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">Нэвтрэх</p>
              <h1 className="text-2xl font-bold text-gray-900">Тавтай морил</h1>
              <p className="text-sm text-gray-500 mt-2">И-мэйл хаягаараа нэвтэрнэ үү.</p>
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
                  <label className="block text-sm font-semibold text-gray-700">Нууц үг</label>
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
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition mt-2"
              >
                Нэвтрэх →
              </button>
            </form>

            {unverified && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-900 mb-1">И-мэйл хаяг баталгаажаагүй байна</p>
                <p className="text-xs text-amber-800 mb-3">
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

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Бүртгэл байхгүй юу?{" "}
                <Link to="/register" className="text-violet-600 font-semibold hover:underline">
                  Бүртгүүлэх
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Нэвтэрснээр та{" "}
            <Link to="/terms" className="hover:text-gray-700 underline">Үйлчилгээний нөхцөл</Link>
            {" "}ба{" "}
            <Link to="/privacy" className="hover:text-gray-700 underline">Нууцлалын бодлого</Link>
            -г хүлээн зөвшөөрсөн болно.
          </p>
        </div>
      </div>
    </div>
  );
}
