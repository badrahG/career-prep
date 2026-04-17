import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {
  var { user, logout } = useAuth();
  var [stats, setStats] = useState({ cv_count: 0, progress: 0, studied_questions: 0, checklist_count: 0, profile_done: false, cv_done: false });
  var [cvs, setCvs] = useState([]);
  var [menuOpen, setMenuOpen] = useState(false);

  var isAdmin = user?.role === "admin";

  useEffect(function () {
    API.get("/auth/dashboard-stats").then(function (res) { setStats(res.data); }).catch(function () {});
    API.get("/cv").then(function (res) { setCvs(res.data); }).catch(function () {});
  }, []);

  var firstName = user?.first_name || "Хэрэглэгч";
  var initial = firstName.charAt(0).toUpperCase();
  var hour = new Date().getHours();
  var greeting = hour < 12 ? "Өглөөний мэнд" : hour < 18 ? "Өдрийн мэнд" : "Оройн мэнд";

  var checklist = [
    { label: "Профайл бүрэн бөглөх", done: stats.profile_done, link: "/profile" },
    { label: "Эхний CV үүсгэх", done: stats.cv_done, link: "/cv/new" },
    { label: "Ярилцлагын асуулт судлах", done: stats.studied_questions > 0, link: "/interview" },
    { label: "Тэтгэлэг хайх", done: false, link: "/scholarship" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top nav */}
      <nav className="bg-white border-b border-slate-200">
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

      <div className="max-w-7xl mx-auto px-6 py-8">

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Үүсгэсэн CV", value: stats.cv_count },
            { label: "Ерөнхий явц", value: stats.progress + "%" },
            { label: "Судалсан асуулт", value: stats.studied_questions },
            { label: "Checklist", value: stats.checklist_count },
          ].map(function (s, i) {
            return (
              <div key={i} className="bg-white border border-slate-200 rounded p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">{s.label}</p>
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Checklist + Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded">
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
                      <span className={"text-sm flex-1 " + (item.done ? "text-slate-400 line-through" : "text-slate-700")}>{item.label}</span>
                      {!item.done && (
                        <span className="text-xs text-[#1e3a8a] font-medium opacity-0 group-hover:opacity-100 transition">Хийх →</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Хурдан үйлдлүүд</h2>
            </div>
            <div className="p-3">
              {[
                { label: "Шинэ CV үүсгэх", link: "/cv/new" },
                { label: "Ярилцлагад бэлтгэх", link: "/interview" },
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
                  <Link key={cv.id} to={"/cv/" + cv.id} className="bg-white border border-slate-200 rounded p-4 hover:border-[#1e3a8a] transition group">
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

        {/* Modules */}
        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-4">Модулиуд</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "CV үүсгэх", desc: "Мэргэжлийн CV үүсгэж, PDF татаж авах", link: "/cv" },
              { title: "Ярилцлагын бэлтгэл", desc: "Flashcard, Quiz, STAR дадлага", link: "/interview" },
              { title: "Тэтгэлэг", desc: "Дотоодын тэтгэлэг, internship хайх", link: "/scholarship" },
              { title: "Карьерын зөвлөмж", desc: "CV бичих, ярилцлагын зөвлөмж", link: "/advice" },
            ].map(function (m, i) {
              return (
                <Link key={i} to={m.link} className="bg-white border border-slate-200 rounded p-5 hover:border-[#1e3a8a] transition group">
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
      <footer className="bg-white border-t border-slate-200 mt-12">
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