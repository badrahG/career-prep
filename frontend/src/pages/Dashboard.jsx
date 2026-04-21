import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import API from "../services/api";
import { StatsSkeleton } from "../components/Skeleton";

export default function Dashboard() {
  var { user, logout } = useAuth();
  var [stats, setStats] = useState({ cv_count: 0, progress: 0, studied_questions: 0, checklist_count: 0, quiz_count: 0, quiz_avg: 0, profile_done: false, cv_done: false });
  var [statsLoading, setStatsLoading] = useState(true);
  var [cvs, setCvs] = useState([]);
  var [menuOpen, setMenuOpen] = useState(false);
  var [activity, setActivity] = useState([]);
  var [activityLoading, setActivityLoading] = useState(true);

 var isAdmin = user?.role === "admin";

  useEffect(function () {
    API.get("/auth/dashboard-stats")
      .then(function (res) { setStats(res.data); })
      .catch(function () {})
      .finally(function () { setStatsLoading(false); });

    API.get("/cv").then(function (res) { setCvs(res.data); }).catch(function () {});

    API.get("/auth/activity")
      .then(function (res) { setActivity(res.data); })
      .catch(function () {})
      .finally(function () { setActivityLoading(false); });
  }, []);

  var firstName = user?.first_name || "Хэрэглэгч";
  var initial = firstName.charAt(0).toUpperCase();
  var hour = new Date().getHours();
  var greeting = hour < 12 ? "Өглөөний мэнд" : hour < 18 ? "Өдрийн мэнд" : "Оройн мэнд";

  var checklist = [
    { label: "Профайл бүрэн бөглөх", done: stats.profile_done, link: "/profile" },
    { label: "Эхний CV үүсгэх", done: stats.cv_done, link: "/cv/new" },
    { label: "5+ ярилцлагын асуулт судлах", done: stats.studied_questions >= 5, link: "/interview/flashcard", hint: stats.studied_questions + "/5 судалсан" },
    { label: "Тэтгэлгийн checklist үүсгэх", done: stats.checklist_count > 0, link: "/scholarship", hint: stats.checklist_count > 0 ? stats.checklist_count + " checklist" : null },
    { label: "2 дахь CV үүсгэх", done: stats.cv_count >= 2, link: "/cv/new", hint: stats.cv_count + "/2" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Top nav */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30 relative">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900">CareerPrep</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 text-sm">
            <Link to="/dashboard" className="px-3 py-2 text-slate-900 font-medium border-b-2 border-[#1e3a8a]">Нүүр</Link>
            <Link to="/cv" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">CV</Link>
            <Link to="/interview" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Ярилцлага</Link>
            <Link to="/advice" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Зөвлөмж</Link>
            <Link to="/scholarship" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Тэтгэлэг</Link>
            {isAdmin && <Link to="/admin/users" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Админ</Link>}
          </div>

          <div className="relative">
            <button
              onClick={function () { setMenuOpen(!menuOpen); }}
              className="flex items-center gap-2 hover:bg-slate-100 px-2 py-1.5 rounded transition"
            >
              <div className="w-8 h-8 bg-[#1e3a8a] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{initial}</span>
              </div>
              <span className="text-sm text-slate-700 font-medium hidden md:block">{firstName}</span>
              <span className="text-slate-400 text-xs">▾</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded shadow-md py-1 z-20">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{user?.last_name} {user?.first_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                  {isAdmin && <span className="text-xs px-2 py-0.5 mt-1.5 inline-block rounded font-medium border bg-[#1e3a8a]/5 text-[#1e3a8a] border-[#1e3a8a]/20">Админ</span>}
                </div>
                <Link to="/profile" onClick={function () { setMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Профайл</Link>
                <Link to="/cv" onClick={function () { setMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Миний CV</Link>
                {isAdmin && <Link to="/admin/users" onClick={function () { setMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Админ панель</Link>}
                <div className="border-t border-slate-100 my-1"></div>
                <button onClick={function () { logout(); window.location.href = "/login"; }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Гарах</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">

        {/* Page header */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{greeting}</p>
          <h1 className="text-2xl font-bold text-slate-900">{firstName}, тавтай морилно уу</h1>
          <p className="text-sm text-slate-600 mt-1">Ажилд орох бэлтгэлийнхээ явцыг эндээс хянана уу.</p>
        </div>

        {/* Admin quick link banner */}
        {isAdmin && (
          <div className="bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded p-4 mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1e3a8a]">Админ горим</p>
              <p className="text-xs text-slate-600 mt-0.5">Системийн хэрэглэгч, тэтгэлэг, контентыг удирдах.</p>
            </div>
            <Link to="/admin/users" className="bg-[#1e3a8a] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#1e40af] transition whitespace-nowrap">
              Админ панель →
            </Link>
          </div>
        )}

        {/* Stats */}
        {statsLoading ? (
          <div className="mb-8"><StatsSkeleton /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Үүсгэсэн CV", value: stats.cv_count },
              { label: "Ерөнхий явц", value: stats.progress + "%" },
              { label: "Судалсан асуулт", value: stats.studied_questions },
              { label: "Quiz дундаж", value: stats.quiz_count > 0 ? stats.quiz_avg + "%" : "—" },
            ].map(function (s, i) {
              return (
                <div key={i} className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">{s.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Checklist + Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Бэлтгэлийн алхамууд</h2>
                <span className="text-sm font-semibold text-[#1e3a8a]">{stats.progress}%</span>
              </div>
              <div className="px-6 pt-4">
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-[#1e3a8a] rounded-full h-1.5 transition-all duration-500"
                    style={{ width: stats.progress + "%" }}
                  ></div>
                </div>
              </div>
              <div className="px-3 py-3">
                {checklist.map(function (item, i) {
                  return (
                    <Link key={i} to={item.link} className="flex items-center gap-3 p-3 rounded hover:bg-slate-50 transition group">
                      <div className={"w-6 h-6 rounded flex items-center justify-center text-xs font-semibold flex-shrink-0 " + (item.done ? "bg-green-600 text-white" : "border border-slate-300 text-slate-400")}>
                        {item.done ? "✓" : i + 1}
                      </div>
                      <div className="flex-1">
                        <p className={"text-sm " + (item.done ? "text-slate-400 line-through" : "text-slate-700")}>{item.label}</p>
                        {item.hint && <p className="text-xs text-slate-500 mt-0.5">{item.hint}</p>}
                      </div>
                      {!item.done && (
                        <span className="text-xs text-[#1e3a8a] font-medium opacity-0 group-hover:opacity-100 transition">Хийх →</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Хурдан үйлдлүүд</h2>
            </div>
            <div className="p-3">
              {[
                { label: "Шинэ CV үүсгэх", link: "/cv/new" },
                { label: "Ярилцлагад бэлтгэх", link: "/interview" },
                { label: "Зөвлөмж унших", link: "/advice" },
                { label: "Тэтгэлэг хайх", link: "/scholarship" },
                { label: "Профайл засах", link: "/profile" },
              ].map(function (a, i) {
                return (
                  <Link key={i} to={a.link} className="flex items-center justify-between p-3 rounded hover:bg-slate-50 transition group">
                    <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">{a.label}</span>
                    <span className="text-slate-400 group-hover:text-[#1e3a8a]">→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* CV list */}
        {cvs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Миний CV</h2>
              <Link to="/cv" className="text-sm text-[#1e3a8a] hover:underline font-medium">Бүгд харах →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cvs.slice(0, 3).map(function (cv) {
                return (
                  <Link key={cv.id} to={"/cv/" + cv.id} className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 hover:border-[#1e3a8a] transition group shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-700 font-bold text-xs">CV</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate group-hover:text-[#1e3a8a] transition">{cv.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(cv.created_at).toLocaleDateString("mn-MN")} · {cv.template_type}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        <div className="mb-8">
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Сүүлийн үйлдлүүд</h2>
            </div>
            {activityLoading ? (
              <div className="px-6 py-8 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activity.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-400">Одоохондоо үйлдэл байхгүй байна.</div>
            ) : (
              <div className="px-6 py-4">
                <div className="relative">
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-100"></div>
                  <div className="space-y-4">
                    {activity.map(function (item, i) {
                      var iconMap = {
                        cv: { bg: "bg-blue-100", text: "text-blue-600", icon: "📄" },
                        quiz: { bg: "bg-purple-100", text: "text-purple-600", icon: "🎯" },
                        flashcard: { bg: "bg-emerald-100", text: "text-emerald-600", icon: "🃏" },
                        checklist: { bg: "bg-amber-100", text: "text-amber-600", icon: "✅" },
                        login: { bg: "bg-slate-100", text: "text-slate-500", icon: "🔑" },
                        profile_update: { bg: "bg-slate-100", text: "text-slate-500", icon: "👤" },
                      };
                      var style = iconMap[item.type] || { bg: "bg-slate-100", text: "text-slate-500", icon: "•" };
                      var date = item.created_at ? new Date(item.created_at) : null;
                      var dateStr = date
                        ? date.toLocaleDateString("mn-MN", { month: "short", day: "numeric" }) + " " + date.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })
                        : "";
                      return (
                        <div key={i} className="flex items-start gap-4 relative">
                          <div className={"w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-sm " + style.bg}>
                            <span>{style.icon}</span>
                          </div>
                          <div className="flex-1 pt-0.5">
                            <p className="text-sm font-medium text-slate-800">{item.label}</p>
                            {item.detail && <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>}
                          </div>
                          <span className="text-xs text-slate-400 whitespace-nowrap pt-0.5">{dateStr}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modules */}
        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-4">Модулиуд</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "CV үүсгэх", desc: "Мэргэжлийн CV үүсгэж, татаж авах", link: "/cv" },
              { title: "Ярилцлагын бэлтгэл", desc: "Flashcard, Quiz, STAR дадлага", link: "/interview" },
              { title: "Карьерын зөвлөмж", desc: "CV бичих, ярилцлагын зөвлөмж", link: "/advice" },
              { title: "Тэтгэлэг", desc: "Дотоодын тэтгэлэг, internship хайх", link: "/scholarship" },
            ].map(function (m, i) {
              return (
                <Link key={i} to={m.link} className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-5 hover:border-[#1e3a8a] transition group shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-1 bg-[#1e3a8a]"></div>
                    <span className="text-slate-300 group-hover:text-[#1e3a8a] transition">→</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm group-hover:text-[#1e3a8a] transition">{m.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">© 2026 CareerPrep. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/privacy" className="hover:text-slate-900">Нууцлал</Link>
            <Link to="/terms" className="hover:text-slate-900">Нөхцөл</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}