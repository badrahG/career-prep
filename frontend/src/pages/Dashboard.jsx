import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import API from "../services/api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import Layout from "../components/Layout";

function Icon({ d, size = 20 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ICONS = {
  cv:         "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  interview:  "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  advice:     "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  scholarship:"M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
  profile:    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  analyze:    "M13 10V3L4 14h7v7l9-11h-7z",
  arrow:      "M13 7l5 5m0 0l-5 5m5-5H6",
};

const MODULES = [
  { title: "CV бичих",    desc: "CV үүсгэж засварлах",    icon: "cv",          link: "/cv" },
  { title: "Ярилцлага",   desc: "Асуулт, quiz бэлтгэл",   icon: "interview",   link: "/interview" },
  { title: "Зөвлөмж",     desc: "Карьерын зөвлөмж унших", icon: "advice",      link: "/advice" },
  { title: "Тэтгэлэг",    desc: "Боломжит тэтгэлгүүд",    icon: "scholarship", link: "/scholarship" },
  { title: "CV Анализ",   desc: "AI-д CV шалгуулах",      icon: "analyze",     link: "/cv-analysis" },
];

export default function Dashboard() {
  var { user } = useAuth();
  var { theme } = useTheme();
  var [stats, setStats] = useState({
    cv_count: 0, progress: 0, studied_questions: 0,
    quiz_count: 0, quiz_avg: 0, checklist_count: 0,
    profile_done: false, cv_done: false,
  });
  var [cvs, setCvs] = useState([]);
  var [activity, setActivity] = useState([]);
  var [usage, setUsage] = useState(null);

  var isAdmin = user?.role === "admin";
  var firstName = user?.first_name || "Хэрэглэгч";
  var lastName = user?.last_name || "";
  var todayStr = new Date().toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" });

  useEffect(function () {
    API.get("/auth/dashboard-stats").then(function (r) { setStats(r.data); }).catch(function () {});
    API.get("/cv").then(function (r) { setCvs(r.data); }).catch(function () {});
    API.get("/auth/activity").then(function (r) { setActivity(r.data); }).catch(function () {});
    if (!isAdmin) {
      API.get("/subscription/usage").then(function (r) { setUsage(r.data); }).catch(function () {});
    }
  }, [isAdmin]);

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
    { label: "CV",       value: stats.cv_count,                unit: "ширхэг" },
    { label: "Асуулт",   value: stats.studied_questions,       unit: "судалсан" },
    { label: "Quiz",     value: stats.quiz_count,              unit: "өгсөн" },
    { label: "Нийт явц", value: (stats.progress || 0) + "%",  unit: "гүйцэтгэл" },
  ];

  var tooltipStyle = theme === "dark"
    ? { borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.4)", fontSize: 12, background: "#1f2937", color: "#e5e7eb" }
    : { borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 12 };

  return (
    <Layout>
      <div className="px-6 pb-8 space-y-5">

        {/* Greeting */}
        <div className="pt-6 pb-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
            Тавтай морил, {lastName ? lastName + " " : ""}{firstName}
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{todayStr}</p>
        </div>

        {/* Onboarding banner */}
        {stats.cv_count === 0 && stats.studied_questions === 0 && !isAdmin && (
          <div className="rounded-2xl p-4 text-white flex items-center justify-between gap-4 shadow-sm"
            style={{ background: "linear-gradient(135deg, #8c54ef 0%, #554de5 100%)" }}>
            <div>
              <p className="font-bold text-sm">CareerPrep системд тавтай морилно уу!</p>
              <p className="text-xs opacity-80 mt-0.5"> CV үүсгэж, ярилцлагын бэлтгэлээ эхлүүлнэ үү.</p>
            </div>
            <Link to="/cv/start" className="bg-white text-violet-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-50 transition whitespace-nowrap flex-shrink-0">
              CV үүсгэх →
            </Link>
          </div>
        )}
        {isAdmin && (
          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-violet-700 dark:text-violet-400">Админ горим</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Хэрэглэгч, тэтгэлэг, контентыг удирдах.</p>
            </div>
            <Link to="/admin/users" className="bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-violet-700 transition">Панель →</Link>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map(function (s, i) {
            return (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 border border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-medium text-gray-600 dark:text-gray-300 leading-none">{s.value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{s.label} · {s.unit}</p>
              </div>
            );
          })}
        </div>

        {/* Usage card */}
        {!isAdmin && usage && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Сарын ашиглалт</span>
              <span className={
                "text-xs font-semibold px-2.5 py-0.5 rounded-full " +
                (usage.plan === "pro"
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400")
              }>
                {usage.plan === "pro" ? "Pro" : "Free"}
              </span>
            </div>

            {/* AI зөвлөмж */}
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">AI зөвлөмж</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {usage.ai_used} / {usage.ai_limit}
                  {usage.extra_ai > 0 && (
                    <span className="ml-1.5 text-violet-500 dark:text-violet-400">+{usage.extra_ai} extra</span>
                  )}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: Math.min(usage.ai_used / Math.max(usage.ai_limit, 1) * 100, 100) + "%",
                    background: usage.ai_used / Math.max(usage.ai_limit, 1) >= 0.9 ? "#EF4444" : "#7C3AED",
                  }}
                />
              </div>
            </div>

            {/* Орчуулга */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Орчуулга</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {usage.tr_used} / {usage.tr_limit}
                  {usage.extra_tr > 0 && (
                    <span className="ml-1.5 text-violet-500 dark:text-violet-400">+{usage.extra_tr} extra</span>
                  )}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: Math.min(usage.tr_used / Math.max(usage.tr_limit, 1) * 100, 100) + "%",
                    background: usage.tr_used / Math.max(usage.tr_limit, 1) >= 0.9 ? "#EF4444" : "#7C3AED",
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Сэргэх: {new Date(usage.period_end).toLocaleDateString("mn-MN", { year: "numeric", month: "numeric", day: "numeric" })}
              </span>
              {usage.plan !== "pro" ? (
                <Link to="/pricing" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition">
                  Pro болгох →
                </Link>
              ) : (
                <Link to="/pricing" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
                  Extra Pack →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Progress cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400"><Icon d={ICONS.cv} size={15} /></span>
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">CV явц</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{cvProgress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700 bg-violet-600"
                style={{ width: cvProgress + "%" }} />
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-xs text-gray-400 dark:text-gray-500">{stats.cv_count} CV үүсгэсэн</span>
              <Link to="/cv" className="text-xs font-semibold text-violet-600 hover:underline">Үргэлжлүүлэх →</Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400"><Icon d={ICONS.interview} size={15} /></span>
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Ярилцлагын бэлтгэл</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{ivProgress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700 bg-violet-600"
                style={{ width: ivProgress + "%" }} />
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-xs text-gray-400 dark:text-gray-500">{stats.studied_questions} асуулт судалсан</span>
              <Link to="/interview" className="text-xs font-semibold text-violet-600 hover:underline">Үргэлжлүүлэх →</Link>
            </div>
          </div>
        </div>

        {/* Module navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {MODULES.map(function (m, i) {
            return (
              <Link key={i} to={m.link}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 transition group flex flex-col gap-2"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition">
                    <Icon d={ICONS[m.icon]} size={18} />
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{m.title}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">{m.desc}</p>
                </div>
                <span className="text-xs font-medium text-violet-600 dark:text-violet-400 mt-auto">Нээх →</span>
              </Link>
            );
          })}
        </div>

        {/* Chart + Recent CVs */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Activity chart */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Идэвхийн аналитик</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">7 хоногийн явц</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-[3px] rounded-full bg-violet-500 inline-block" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">CV</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-[3px] rounded-full bg-cyan-400 inline-block" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">Асуулт</span>
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
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="cv" name="CV идэвх" stroke="#7C3AED" strokeWidth={2} fill="url(#gV)" dot={false} />
                <Area type="monotone" dataKey="асуулт" name="Асуулт судлалт" stroke="#06B6D4" strokeWidth={2} fill="url(#gC)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent CVs */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Сүүлийн CV-нүүд</h2>
              <Link to="/cv" className="text-xs text-gray-400 dark:text-gray-500 hover:text-violet-600 transition font-medium">Бүгд →</Link>
            </div>

            {cvs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-4">
                <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-3">
                  <span className="text-violet-400"><Icon d={ICONS.cv} size={22} /></span>
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">CV байхгүй байна</p>
                <Link to="/cv/start" className="text-xs font-semibold text-violet-600 hover:underline">+ CV үүсгэх</Link>
              </div>
            ) : (
              <div className="flex-1 space-y-1">
                {cvs.slice(0, 4).map(function (cv) {
                  var d = new Date(cv.updated_at || cv.created_at);
                  var dateStr = d.toLocaleDateString("mn-MN", { month: "numeric", day: "numeric" });
                  return (
                    <Link key={cv.id} to={"/cv/" + cv.id}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">CV</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-violet-700 dark:group-hover:text-violet-400 transition">{cv.name}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 capitalize">{cv.template_type} · {dateStr}</p>
                      </div>
                      <span className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition flex-shrink-0">
                        <Icon d={ICONS.arrow} size={14} />
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {cvs.length > 0 && (
              <Link to="/cv/start"
                className="mt-3 w-full text-center text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition rounded-xl py-2.5"
              >
                + Шинэ CV үүсгэх
              </Link>
            )}
          </div>
        </div>

        {/* Recent activity */}
        {activity.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Сүүлийн үйлдлүүд</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activity.slice(0, 6).map(function (item, i) {
                var ACT = {
                  cv:             "cv",
                  cv_edit:        "cv",
                  quiz:           "interview",
                  flashcard:      "advice",
                  checklist:      "scholarship",
                  login:          "profile",
                  profile_update: "profile",
                };
                var icon = ACT[item.type] || "cv";
                var d = item.created_at ? new Date(item.created_at) : null;
                var timeStr = d ? d.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" }) : "";
                return (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500 dark:text-gray-400"><Icon d={ICONS[icon]} size={14} /></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-tight truncate">{item.label}</p>
                      {item.detail && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{item.detail}</p>}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">{timeStr}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </Layout>

);
}
