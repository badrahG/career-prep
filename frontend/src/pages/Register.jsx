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

  var inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  var labelCls = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex flex-col">
      {/* Nav */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center rounded-xl shadow-sm">
              <span className="text-white font-bold text-sm tracking-wide">CP</span>
            </div>
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">CareerPrep</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Career Platform</div>
            </div>
          </Link>
          <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 font-medium transition">
            ← Нэвтрэх
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {submitted ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 md:p-10 shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">И-мэйлээ шалгана уу</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Бид <span className="font-semibold text-gray-800 dark:text-gray-200">{registeredEmail}</span> хаяг руу баталгаажуулах линк илгээлээ.
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl p-4 mb-5 text-left">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Дараах зүйлсийг анхаараарай:</p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5">
                  <li>• Линкийн хүчинтэй хугацаа <strong className="text-gray-700 dark:text-gray-300">24 цаг</strong></li>
                  <li>• И-мэйл ирэхгүй бол <strong className="text-gray-700 dark:text-gray-300">Spam/Junk</strong> хавтас шалгана уу</li>
                  <li>• Буруу и-мэйл оруулсан бол дахин бүртгүүлнэ үү</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <Link to="/login" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition">
                  Нэвтрэх хуудас руу очих →
                </Link>
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 font-medium py-2 disabled:opacity-50 transition"
                >
                  {resending ? "Илгээж байна..." : "Баталгаажуулах линк дахин илгээх"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 md:p-10 shadow-sm">
              <div className="mb-8">
                <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">Бүртгүүлэх</p>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Шинээр бүртгүүлэх</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Үнэгүй бүртгүүлж эхлээрэй.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Овог</label>
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
                    <label className={labelCls}>Нэр</label>
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
                  <label className={labelCls}>И-мэйл</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="name@example.com"
                    className={inputCls}
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Баталгаажуулах линк энэ хаяг руу илгээгдэнэ.</p>
                </div>

                <div>
                  <label className={labelCls}>Нууц үг</label>
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
                              className={"h-1 flex-1 rounded-full transition-all duration-300 " + (i <= strength.score ? strength.color : "bg-gray-100 dark:bg-gray-600")}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Нууц үг давтах</label>
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
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition mt-2"
                >
                  Үнэгүй бүртгүүлэх →
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Бүртгэлтэй юу?{" "}
                  <Link to="/login" className="text-violet-600 font-semibold hover:underline">
                    Нэвтрэх
                  </Link>
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            Бүртгүүлснээр та{" "}
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
