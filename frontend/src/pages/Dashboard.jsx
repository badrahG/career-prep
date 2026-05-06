import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

function Icon({ d, size = 20 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ICONS = {
  home:       "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  cv:         "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  interview:  "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  advice:     "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  scholarship:"M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
  profile:    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  admin:      "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  analyze:    "M13 10V3L4 14h7v7l9-11h-7z",
  bell:       "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  search:     "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  logout:     "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  menu:       "M4 6h16M4 12h16M4 18h16",
  close:      "M6 18L18 6M6 6l12 12",
  help:       "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  refresh:    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  external:   "M7 17L17 7M17 7H7M17 7v10",
  arrow:      "M13 7l5 5m0 0l-5 5m5-5H6",
};

const NAV = [
  { label: "Нүүр",      link: "/dashboard",   icon: "home" },
  { label: "CV",        link: "/cv",          icon: "cv" },
  { label: "Ярилцлага", link: "/interview",   icon: "interview" },
  { label: "Зөвлөмж",  link: "/advice",      icon: "advice" },
  { label: "Тэтгэлэг", link: "/scholarship", icon: "scholarship" },
  { label: "Профайл",  link: "/profile",     icon: "profile" },
];

const MODULES = [
  { title: "CV бичих",       desc: "CV үүсгэж засварлах",     icon: "cv",         link: "/cv",          color: "#7C3AED", bg: "#EDE9FE", border: "#DDD6FE" },
  { title: "Ярилцлага",      desc: "Асуулт, quiz бэлтгэл",    icon: "interview",  link: "/interview",   color: "#06B6D4", bg: "#ECFEFF", border: "#A5F3FC" },
  { title: "Зөвлөмж",        desc: "Карьерын зөвлөмж унших",  icon: "advice",     link: "/advice",      color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
  { title: "Тэтгэлэг",       desc: "Боломжит тэтгэлгүүд",     icon: "scholarship",link: "/scholarship", color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  { title: "CV Анализ",       desc: "AI-д CV шалгуулах",       icon: "analyze",    link: "/cv-analysis", color: "#EC4899", bg: "#FDF2F8", border: "#FBCFE8" },
];

export default function Dashboard() {
  var { user, logout } = useAuth();
  var location = useLocation();
  var [stats, setStats] = useState({
    cv_count: 0, progress: 0, studied_questions: 0,
    quiz_count: 0, quiz_avg: 0, checklist_count: 0,
    profile_done: false, cv_done: false,
  });
  var [cvs, setCvs] = useState([]);
  var [activity, setActivity] = useState([]);
  var [sidebarOpen, setSidebarOpen] = useState(false);

  var isAdmin = user?.role === "admin";
  var firstName = user?.first_name || "Хэрэглэгч";
  var lastName = user?.last_name || "";
  var initial = firstName.charAt(0).toUpperCase();
  var todayStr = new Date().toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" });

  useEffect(function () {
    API.get("/auth/dashboard-stats").then(function (r) { setStats(r.data); }).catch(function () {});
    API.get("/cv").then(function (r) { setCvs(r.data); }).catch(function () {});
    API.get("/auth/activity").then(function (r) { setActivity(r.data); }).catch(function () {});
  }, []);

  var cvProgress = stats.cv_count > 0 ? stats.progress : 0;
  var ivProgress = Math.min(stats.studied_questions * 4 + (stats.quiz_count > 0 ? Math.round(stats.quiz_avg / 2) : 0), 100);

  var chartData = [
    { day: "Да", cv: stats.cv_count > 0 ? 1 : 0,        асуулт: Math.min(stats.studied_questions, 2) },
    { day: "Мя", cv: 0,                                  асуулт: Math.min(stats.studied_questions, 4) },
    { day: "Лх", cv: stats.cv_count > 1 ? 1 : 0,        асуулт: Math.min(stats.studied_questions, 6) },
    { day: "Пү", cv: 0,                                  асуулт: Math.min(stats.studied_questions, 8) },
    { day: "Ба", cv: 0,                                  асуулт: stats.studied_questions },
    { day: "Бя", cv: 0,                                  асуулт: stats.studied_questions },
    { day: "Ня", cv: stats.cv_count,                     асуулт: stats.studied_questions },
  ];

  var statCards = [
    { label: "CV",          value: stats.cv_count,           unit: "ширхэг", color: "#7C3AED", bg: "#EDE9FE" },
    { label: "Асуулт",      value: stats.studied_questions,  unit: "судалсан", color: "#06B6D4", bg: "#ECFEFF" },
    { label: "Quiz",        value: stats.quiz_count,         unit: "тоглосон", color: "#10B981", bg: "#ECFDF5" },
    { label: "Нийт явц",    value: (stats.progress || 0) + "%", unit: "гүйцэтгэл", color: "#F59E0B", bg: "#FFFBEB" },
  ];

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden">

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={function () { setSidebarOpen(false); }} />
      )}

      {/* ── LEFT SIDEBAR ── */}
      <aside className={
        "fixed top-0 left-0 h-full z-30 flex flex-col bg-white border-r border-gray-100 w-[220px] transition-transform duration-300 " +
        (sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
      }>
        <div className="px-5 pt-6 pb-5 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white font-bold text-xs">CP</span>
          </div>
          <span className="text-[15px] font-bold text-gray-900 tracking-tight">CareerPrep</span>
          <button className="lg:hidden ml-auto text-gray-400 hover:text-gray-600" onClick={function () { setSidebarOpen(false); }}>
            <Icon d={ICONS.close} size={16} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(function (item) {
            var active = location.pathname === item.link ||
              (item.link !== "/dashboard" && location.pathname.startsWith(item.link));
            return (
              <Link key={item.link} to={item.link}
                onClick={function () { setSidebarOpen(false); }}
                className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition " +
                  (active
                    ? "bg-gray-100 text-gray-900 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium")}
              >
                <span className={active ? "text-gray-800" : "text-gray-400"}>
                  <Icon d={ICONS[item.icon]} size={18} />
                </span>
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin/users"
              onClick={function () { setSidebarOpen(false); }}
              className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition " +
                (location.pathname.startsWith("/admin") ? "bg-gray-100 text-gray-900 font-semibold" : "text-gray-500 hover:bg-gray-50 font-medium")}
            >
              <span className="text-gray-400"><Icon d={ICONS.admin} size={18} /></span>
              Админ
            </Link>
          )}
        </nav>

        <div className="px-3 pb-5 space-y-1">
          <Link to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            <Icon d={ICONS.help} size={18} />
            Тусламж
          </Link>
          <button
            onClick={function () { logout(); window.location.href = "/login"; }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition font-medium w-full text-left"
          >
            <Icon d={ICONS.logout} size={18} />
            Гарах
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 lg:ml-[220px] overflow-y-auto">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-3">
          <button className="lg:hidden text-gray-500 mr-1" onClick={function () { setSidebarOpen(true); }}>
            <Icon d={ICONS.menu} size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Сайн уу, {lastName ? lastName + " " : ""}{firstName} 
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{todayStr}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
              <span className="text-gray-400"><Icon d={ICONS.search} size={14} /></span>
              <input type="text" readOnly placeholder="Хайх..." className="bg-transparent text-sm text-gray-400 outline-none w-28 cursor-default" />
            </div>
            <button className="w-9 h-9 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 transition">
              <Icon d={ICONS.bell} size={16} />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white font-bold text-sm">{initial}</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-8 space-y-5">

          {/* Onboarding banner */}
          {stats.cv_count === 0 && stats.studied_questions === 0 && !isAdmin && (
            <div className="rounded-2xl p-4 text-white flex items-center justify-between gap-4 shadow-sm"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}>
              <div>
                <p className="font-bold text-sm">CareerPrep-д тавтай морилно уу!</p>
                <p className="text-xs opacity-80 mt-0.5">Эхлэхийн тулд CV үүсгэж, ярилцлагын бэлтгэлээ эхлүүлнэ үү.</p>
              </div>
              <Link to="/cv/new" className="bg-white text-violet-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-50 transition whitespace-nowrap flex-shrink-0">
                CV үүсгэх →
              </Link>
            </div>
          )}
          {isAdmin && (
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-violet-700">Админ горим</p>
                <p className="text-xs text-gray-500 mt-0.5">Хэрэглэгч, тэтгэлэг, контентыг удирдах.</p>
              </div>
              <Link to="/admin/users" className="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-violet-700 transition">Панель →</Link>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map(function (s, i) {
              return (
                <div key={i} className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: s.bg }}>
                    <span className="text-lg font-bold" style={{ color: s.color }}>
                      {typeof s.value === "number" ? s.value : s.value}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.unit}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                    <span style={{ color: "#7C3AED" }}><Icon d={ICONS.cv} size={16} /></span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">CV явц</span>
                </div>
                <span className="text-base font-bold" style={{ color: "#7C3AED" }}>{cvProgress}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: cvProgress + "%", background: "linear-gradient(90deg, #7C3AED, #a78bfa)" }} />
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-xs text-gray-400">{stats.cv_count} CV үүсгэсэн</span>
                <Link to="/cv" className="text-xs font-semibold text-violet-600 hover:underline">Үргэлжлүүлэх →</Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ECFEFF" }}>
                    <span style={{ color: "#06B6D4" }}><Icon d={ICONS.interview} size={16} /></span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Ярилцлагын бэлтгэл</span>
                </div>
                <span className="text-base font-bold" style={{ color: "#06B6D4" }}>{ivProgress}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: ivProgress + "%", background: "linear-gradient(90deg, #06B6D4, #67e8f9)" }} />
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-xs text-gray-400">{stats.studied_questions} асуулт судалсан</span>
                <Link to="/interview" className="text-xs font-semibold text-cyan-600 hover:underline">Үргэлжлүүлэх →</Link>
              </div>
            </div>
          </div>

          {/* Module navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {MODULES.map(function (m, i) {
              return (
                <Link key={i} to={m.link}
                  className="bg-white rounded-2xl p-4 border hover:shadow-md transition-all group flex flex-col gap-2"
                  style={{ borderColor: m.border }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: m.bg }}>
                    <span style={{ color: m.color }}><Icon d={ICONS[m.icon]} size={20} /></span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{m.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{m.desc}</p>
                  </div>
                  <span className="text-xs font-semibold mt-auto" style={{ color: m.color }}>
                    Нээх →
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Chart + Recent CVs */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* Activity chart */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Идэвхийн аналитик</h2>
                  <p className="text-xs text-gray-400">7 хоногийн явц</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-[3px] rounded-full bg-violet-500 inline-block" />
                    <span className="text-xs text-gray-400">CV</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-[3px] rounded-full bg-cyan-400 inline-block" />
                    <span className="text-xs text-gray-400">Асуулт</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="cv" name="CV идэвх" stroke="#7C3AED" strokeWidth={2} fill="url(#gV)" dot={false} />
                  <Area type="monotone" dataKey="асуулт" name="Асуулт судлалт" stroke="#06B6D4" strokeWidth={2} fill="url(#gC)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent CVs */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">Сүүлийн CV-нүүд</h2>
                <Link to="/cv" className="text-xs text-gray-400 hover:text-violet-600 transition font-medium">Бүгд →</Link>
              </div>

              {cvs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-4">
                  <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mb-3">
                    <span className="text-violet-400"><Icon d={ICONS.cv} size={22} /></span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">CV байхгүй байна</p>
                  <Link to="/cv/new" className="text-xs font-semibold text-violet-600 hover:underline">+ CV үүсгэх</Link>
                </div>
              ) : (
                <div className="flex-1 space-y-1">
                  {cvs.slice(0, 4).map(function (cv, i) {
                    var d = new Date(cv.updated_at || cv.created_at);
                    var dateStr = d.toLocaleDateString("mn-MN", { month: "numeric", day: "numeric" });
                    var colors = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B"];
                    var bgs   = ["#EDE9FE", "#ECFEFF", "#ECFDF5", "#FFFBEB"];
                    return (
                      <Link key={cv.id} to={"/cv/" + cv.id}
                        className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition group"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: bgs[i % bgs.length] }}>
                          <span className="text-[10px] font-bold" style={{ color: colors[i % colors.length] }}>CV</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate group-hover:text-violet-700 transition">{cv.name}</p>
                          <p className="text-[11px] text-gray-400 capitalize">{cv.template_type} · {dateStr}</p>
                        </div>
                        <span className="text-gray-300 group-hover:text-gray-500 transition flex-shrink-0">
                          <Icon d={ICONS.arrow} size={14} />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {cvs.length > 0 && (
                <Link to="/cv/new"
                  className="mt-3 w-full text-center text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 transition rounded-xl py-2.5"
                >
                  + Шинэ CV үүсгэх
                </Link>
              )}
            </div>
          </div>

          {/* Recent activity */}
          {activity.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Сүүлийн үйлдлүүд</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activity.slice(0, 6).map(function (item, i) {
                  var ACT = {
                    cv:             { bg: "#EDE9FE", color: "#7C3AED", icon: "cv" },
                    quiz:           { bg: "#FEE2E2", color: "#EF4444", icon: "interview" },
                    flashcard:      { bg: "#ECFDF5", color: "#10B981", icon: "advice" },
                    checklist:      { bg: "#FFFBEB", color: "#F59E0B", icon: "scholarship" },
                    login:          { bg: "#F1F5F9", color: "#64748B", icon: "profile" },
                    profile_update: { bg: "#F1F5F9", color: "#64748B", icon: "profile" },
                  };
                  var style = ACT[item.type] || { bg: "#F1F5F9", color: "#64748B", icon: "home" };
                  var d = item.created_at ? new Date(item.created_at) : null;
                  var timeStr = d ? d.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" }) : "";
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: style.bg }}>
                        <span style={{ color: style.color }}><Icon d={ICONS[style.icon]} size={15} /></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 font-medium leading-tight truncate">{item.label}</p>
                        {item.detail && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.detail}</p>}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{timeStr}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
