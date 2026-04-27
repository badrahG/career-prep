import { useState } from "react";
import { Link } from "react-router-dom";

var NAV_LINKS = [
  { to: "/dashboard", label: "Нүүр", key: "dashboard" },
  { to: "/cv", label: "CV", key: "cv" },
  { to: "/interview", label: "Ярилцлага", key: "interview" },
  { to: "/advice", label: "Зөвлөмж", key: "advice" },
  { to: "/scholarship", label: "Тэтгэлэг", key: "scholarship" },
];

export default function NavBar({ active, isAdmin, rightContent, sticky }) {
  var [open, setOpen] = useState(false);

  var links = isAdmin
    ? [...NAV_LINKS, { to: "/admin/users", label: "Админ", key: "admin" }]
    : NAV_LINKS;

  return (
    <nav className={"bg-white border-b border-slate-200 relative z-10" + (sticky ? " sticky top-0" : "")}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
            <span className="text-white font-bold text-xs tracking-wide">CP</span>
          </div>
          <span className="text-base font-semibold text-slate-900">CareerPrep</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm">
          {links.map(function (l) {
            return (
              <Link
                key={l.key}
                to={l.to}
                className={"px-3 py-2 font-medium " + (l.key === active
                  ? "text-slate-900 border-b-2 border-[#1e3a8a]"
                  : "text-slate-600 hover:text-slate-900")}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">{rightContent}</div>
          <button
            onClick={function () { setOpen(function (v) { return !v; }); }}
            className="md:hidden flex flex-col items-center justify-center w-9 h-9 gap-1.5 rounded hover:bg-slate-100 transition"
            aria-label="Цэс"
          >
            <span className={"block w-5 h-0.5 bg-slate-700 transition-all duration-200 origin-center " + (open ? "rotate-45 translate-y-[7px]" : "")} />
            <span className={"block w-5 h-0.5 bg-slate-700 transition-all duration-200 " + (open ? "opacity-0" : "")} />
            <span className={"block w-5 h-0.5 bg-slate-700 transition-all duration-200 origin-center " + (open ? "-rotate-45 -translate-y-[7px]" : "")} />
          </button>
          <div className="md:hidden">{rightContent}</div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-3 pt-1">
          {links.map(function (l) {
            return (
              <Link
                key={l.key}
                to={l.to}
                onClick={function () { setOpen(false); }}
                className={"block px-3 py-2.5 rounded text-sm font-medium transition " + (l.key === active
                  ? "bg-[#1e3a8a]/5 text-[#1e3a8a] font-semibold"
                  : "text-slate-700 hover:bg-slate-50")}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
