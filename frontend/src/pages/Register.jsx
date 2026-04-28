import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);
  const { register } = useAuth();

  const handleChange = function (e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async function (e) {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      toast.error("Нууц үг таарахгүй байна");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой");
      return;
    }
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      });
      setRegisteredEmail(form.email);
      setSubmitted(true);
      toast.success("Бүртгэл амжилттай!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Бүртгэл амжилтгүй");
    }
  };

  async function handleResend() {
    setResending(true);
    try {
      await API.post("/auth/resend-verification", { email: registeredEmail });
      toast.success("Баталгаажуулах линк дахин илгээгдлээ");
    } catch (err) {
      toast.error("Алдаа гарлаа");
    } finally {
      setResending(false);
    }
  }

  var inputCls = "w-full px-4 py-2.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition bg-white";

  function getPasswordStrength(pw) {
    if (!pw) return { score: 0, label: "", color: "" };
    var score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score: 1, label: "Маш сул", color: "bg-red-500" };
    if (score === 2) return { score: 2, label: "Сул", color: "bg-orange-400" };
    if (score === 3) return { score: 3, label: "Дунд", color: "bg-yellow-400" };
    if (score === 4) return { score: 4, label: "Хүчтэй", color: "bg-emerald-500" };
    return { score: 5, label: "Маш хүчтэй", color: "bg-emerald-600" };
  }

  var strength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Top bar */}
      <div className="bg-[#1e3a8a] text-white text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-2">
          Залуучуудын ажилд орох бэлтгэлийг дэмжих платформ
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
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
          <Link to="/login" className="text-sm text-slate-700 hover:text-[#1e3a8a] font-medium">
            ← Нэвтрэх
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          {submitted ? (
            /* Success screen after registration */
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-8 md:p-10 shadow-lg text-center">
              <div className="w-16 h-16 mx-auto mb-5 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">И-мэйлээ шалгана уу</h1>
              <p className="text-sm text-slate-600 mb-6">
                Бид <span className="font-semibold text-slate-900">{registeredEmail}</span> хаяг руу баталгаажуулах линк илгээлээ. И-мэйл доторх линкийг дарж баталгаажуулснаар нэвтрэх боломжтой болно.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-5 text-left">
                <p className="text-xs font-semibold text-slate-700 mb-2">Дараах зүйлсийг анхаараарай:</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Линкийн хүчинтэй хугацаа <strong>24 цаг</strong></li>
                  <li>• И-мэйл ирэхгүй бол <strong>Spam/Junk</strong> хавтас шалгана уу</li>
                  <li>• Буруу и-мэйл оруулсан бол дахин бүртгүүлнэ үү</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <Link to="/login" className="bg-[#1e3a8a] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition">
                  Нэвтрэх хуудас руу очих →
                </Link>
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-sm text-slate-600 hover:text-[#1e3a8a] font-medium py-2 disabled:opacity-50"
                >
                  {resending ? "Илгээж байна..." : "Баталгаажуулах линк дахин илгээх"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-8 md:p-10 shadow-lg">
              <div className="mb-8">
                <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">Бүртгүүлэх</p>
                <h1 className="text-2xl font-bold text-slate-900">Шинээр бүртгүүлэх</h1>
                <p className="text-sm text-slate-600 mt-2">Үнэгүй бүртгүүлж эхлээрэй.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Овог</label>
                    <input
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      required
                      placeholder="Овог"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Нэр</label>
                    <input
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      required
                      placeholder="Нэр"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">И-мэйл</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="name@example.com"
                    className={inputCls}
                  />
                  <p className="text-xs text-slate-500 mt-1">Бодит и-мэйл оруулна уу. Баталгаажуулах линк энэ хаяг руу илгээгдэнэ.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Нууц үг</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="8+ тэмдэгт"
                    className={inputCls}
                  />
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(function (i) {
                          return (
                            <div
                              key={i}
                              className={"h-1 flex-1 rounded-full transition-all duration-300 " + (i <= strength.score ? strength.color : "bg-slate-200")}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-500">{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Нууц үг давтах</label>
                  <input
                    type="password"
                    name="password_confirm"
                    value={form.password_confirm}
                    onChange={handleChange}
                    required
                    placeholder="Нууц үгээ дахин оруулна уу"
                    className={inputCls}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1e3a8a] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition mt-2"
                >
                  Үнэгүй бүртгүүлэх →
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-600">
                  Бүртгэлтэй юу?{" "}
                  <Link to="/login" className="text-[#1e3a8a] font-semibold hover:underline">
                    Нэвтрэх
                  </Link>
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-slate-500 mt-6">
            Бүртгүүлснээр та{" "}
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