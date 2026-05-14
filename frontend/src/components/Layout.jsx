import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import SearchModal from "./SearchModal";

function Icon({ d, size = 18 }) {
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
  sun:        "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  moon:       "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
};

const NAV = [
  { label: "Нүүр",      link: "/dashboard",   icon: "home" },
  { label: "CV",        link: "/cv",          icon: "cv" },
  { label: "Ярилцлага", link: "/interview",   icon: "interview" },
  { label: "Зөвлөмж",  link: "/advice",      icon: "advice" },
  { label: "Тэтгэлэг", link: "/scholarship", icon: "scholarship" },
  { label: "Профайл",  link: "/profile",     icon: "profile" },
  { label: "CV Анализ", link: "/cv-analysis", icon: "analyze" },
];

export default function Layout({ children }) {
  var { user, logout } = useAuth();
  var { theme, toggle } = useTheme();
  var location = useLocation();
  var [sidebarOpen, setSidebarOpen] = useState(false);
  var [userMenuOpen, setUserMenuOpen] = useState(false);
  var [searchOpen, setSearchOpen] = useState(false);

  var isAdmin = user?.role === "admin";
  var firstName = user?.first_name || "Хэрэглэгч";
  var initial = firstName.charAt(0).toUpperCase();

  var handleGlobalKey = useCallback(function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  useEffect(function () {
    window.addEventListener("keydown", handleGlobalKey);
    return function () { window.removeEventListener("keydown", handleGlobalKey); };
  }, [handleGlobalKey]);

  function isActive(link) {
    if (link === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(link);
  }

  return (
    <div className="flex h-screen bg-[#f3f4f6] dark:bg-gray-950 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={function () { setSidebarOpen(false); }} />
      )}

      {/* Sidebar */}
      <aside className={
        "fixed top-0 left-0 h-full z-30 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 transition-transform duration-300 w-[220px] " +
        (sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
      }>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white font-bold text-xs">CP</span>
          </div>
          <Link to="/dashboard" onClick={function () { setSidebarOpen(false); }}
            className="text-[15px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            CareerPrep
          </Link>
          <button className="lg:hidden ml-auto text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" onClick={function () { setSidebarOpen(false); }}>
            <Icon d={ICONS.close} size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(function (item) {
            var active = isActive(item.link);
            return (
              <Link key={item.link} to={item.link} onClick={function () { setSidebarOpen(false); }}
                className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition " +
                  (active
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 font-medium")}
              >
                <span className={active ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"}>
                  <Icon d={ICONS[item.icon]} size={18} />
                </span>
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin/users" onClick={function () { setSidebarOpen(false); }}
              className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition " +
                (location.pathname.startsWith("/admin")
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 font-medium")}
            >
              <span className="text-gray-400 dark:text-gray-500"><Icon d={ICONS.admin} size={18} /></span>
              Админ
            </Link>
          )}
        </nav>

        {/* Help + Logout */}
        <div className="px-3 pb-5 space-y-0.5">
          <Link to="/profile" onClick={function () { setSidebarOpen(false); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            <span className="text-gray-400 dark:text-gray-500">
              <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Тусламж
          </Link>
          <button
            onClick={function () { logout(); window.location.href = "/login"; }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition w-full text-left"
          >
            <span className="text-gray-400 dark:text-gray-500">
              <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            Гарах
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[220px]">

        {/* Top header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-6 py-3.5 flex items-center gap-3 sticky top-0 z-10">
          <button className="lg:hidden text-gray-500 dark:text-gray-400" onClick={function () { setSidebarOpen(true); }}>
            <Icon d={ICONS.menu} size={20} />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={function () { setSearchOpen(true); }}
              className="hidden md:flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 shadow-sm hover:border-violet-300 hover:shadow-md transition group"
            >
              <span className="text-gray-400 group-hover:text-violet-500 transition"><Icon d={ICONS.search} size={14} /></span>
              <span className="text-sm text-gray-400 w-24 text-left">Хайх...</span>
              <kbd className="text-[10px] text-gray-300 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded font-medium">Ctrl K</kbd>
            </button>

            <button
              onClick={toggle}
              className="w-9 h-9 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition border border-gray-200 dark:border-gray-700"
              title={theme === "dark" ? "Өдрийн горим" : "Шөнийн горим"}
            >
              <Icon d={theme === "dark" ? ICONS.sun : ICONS.moon} size={15} />
            </button>

            <button className="w-9 h-9 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition border border-gray-200 dark:border-gray-700">
              <Icon d={ICONS.bell} size={16} />
            </button>

            <div className="relative">
              <button onClick={function () { setUserMenuOpen(!userMenuOpen); }}
                className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1.5 rounded-xl transition">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="text-white font-bold text-sm">{initial}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">{firstName}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs">▾</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg py-2 z-20">
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user?.last_name} {user?.first_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                    {isAdmin && <span className="text-xs px-2 py-0.5 mt-1.5 inline-block rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 font-medium">Админ</span>}
                  </div>
                  <Link to="/profile" onClick={function () { setUserMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <Icon d={ICONS.profile} size={15} /> Профайл
                  </Link>
                  <Link to="/cv" onClick={function () { setUserMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <Icon d={ICONS.cv} size={15} /> Миний CV
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                  <button onClick={function () { logout(); window.location.href = "/login"; }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    <Icon d={ICONS.logout} size={15} /> Гарах
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <SearchModal open={searchOpen} onClose={function () { setSearchOpen(false); }} />
    </div>
  );
}
