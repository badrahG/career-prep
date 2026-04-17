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
      // If the backend says email not verified, show a resend link
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-[#1e3a8a] text-white text-xs">
        <div className="max-w-7xl mx-auto px-6 py-2">
          Залуучуудын ажилд орох бэлтгэлийг дэмжих платформ
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-sm tracking-wide">CP</span>
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 leading-none">CareerPrep</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Career Platform</div>
            </div>
          </Link>
          <Link to="/register" className="text-sm text-slate-700 hover:text-[#1e3a8a] font-medium">
            Бүртгүүлэх →
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded p-8 md:p-10 shadow-sm">
            <div className="mb-8">
              <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">Нэвтрэх</p>
              <h1 className="text-2xl font-bold text-slate-900">Тавтай морил</h1>
              <p className="text-sm text-slate-600 mt-2">И-мэйл хаягаараа нэвтэрнэ үү.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">И-мэйл</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Нууц үг</label>
                  <Link to="/forgot-password" className="text-xs text-[#1e3a8a] hover:underline font-medium">
                    Нууц үг мартсан уу?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Нууц үгээ оруулна уу"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1e3a8a] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition mt-2"
              >
                Нэвтрэх →
              </button>
            </form>

            {unverified && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-4">
                <p className="text-sm font-semibold text-amber-900 mb-1">И-мэйл хаяг баталгаажаагүй байна</p>
                <p className="text-xs text-amber-800 mb-3">
                  Бүртгүүлэх үед илгээсэн баталгаажуулах линкийг дарна уу. Эсвэл доорх товчоор шинээр илгээж болно.
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded font-semibold hover:bg-amber-700 disabled:opacity-50 transition"
                >
                  {resending ? "Илгээж байна..." : "Баталгаажуулах линк дахин илгээх"}
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600">
                Бүртгэл байхгүй юу?{" "}
                <Link to="/register" className="text-[#1e3a8a] font-semibold hover:underline">
                  Бүртгүүлэх
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Нэвтэрснээр та{" "}
            <Link to="/terms" className="hover:text-slate-900 underline">Үйлчилгээний нөхцөл</Link>
            {" "}ба{" "}
            <Link to="/privacy" className="hover:text-slate-900 underline">Нууцлалын бодлого</Link>
            -г хүлээн зөвшөөрсөн болно.
          </p>
        </div>
      </div>
    </div>
  );
}