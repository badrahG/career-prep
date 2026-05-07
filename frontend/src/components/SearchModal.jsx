import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const TYPE_META = {
  advice:      { label: "Зөвлөмж",   color: "#10B981", bg: "#ECFDF5", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  scholarship: { label: "Тэтгэлэг",  color: "#F59E0B", bg: "#FFFBEB", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
  interview:   { label: "Ярилцлага", color: "#06B6D4", bg: "#ECFEFF", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
};

const QUICK_LINKS = [
  { label: "CV үүсгэх",         url: "/cv/new",           icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",  color: "#7C3AED", bg: "#EDE9FE" },
  { label: "Ярилцлага",          url: "/interview",        icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",            color: "#06B6D4", bg: "#ECFEFF" },
  { label: "Тэтгэлэгүүд",        url: "/scholarship",      icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z", color: "#F59E0B", bg: "#FFFBEB" },
  { label: "CV Анализ",          url: "/cv-analysis",      icon: "M13 10V3L4 14h7v7l9-11h-7z",                                                                                              color: "#EC4899", bg: "#FDF2F8" },
];

export default function SearchModal({ open, onClose }) {
  var [query, setQuery] = useState("");
  var [results, setResults] = useState([]);
  var [loading, setLoading] = useState(false);
  var [active, setActive] = useState(0);
  var inputRef = useRef(null);
  var navigate = useNavigate();

  useEffect(function () {
    if (open) {
      setQuery("");
      setResults([]);
      setActive(0);
      setTimeout(function () { inputRef.current?.focus(); }, 50);
    }
  }, [open]);

  useEffect(function () {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    var timer = setTimeout(function () {
      API.get("/search", { params: { q: query } })
        .then(function (r) { setResults(r.data.results || []); })
        .catch(function () { setResults([]); })
        .finally(function () { setLoading(false); });
    }, 280);
    return function () { clearTimeout(timer); };
  }, [query]);

  var allItems = useMemo(function () {
    return query.trim().length >= 2 ? results : [];
  }, [query, results]);

  var handleKey = useCallback(function (e) {
    if (!open) return;
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(function (a) { return Math.min(a + 1, allItems.length - 1); }); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(function (a) { return Math.max(a - 1, 0); }); }
    if (e.key === "Enter" && allItems[active]) {
      navigate(allItems[active].url);
      onClose();
    }
  }, [open, allItems, active, navigate, onClose]);

  useEffect(function () {
    window.addEventListener("keydown", handleKey);
    return function () { window.removeEventListener("keydown", handleKey); };
  }, [handleKey]);

  if (!open) return null;

  function go(url) { navigate(url); onClose(); }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      onClick={function (e) { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <span className="text-gray-400 flex-shrink-0">
            <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={18} />
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={function (e) { setQuery(e.target.value); setActive(0); }}
            placeholder="Хайх... (зөвлөмж, тэтгэлэг, асуулт)"
            className="flex-1 text-sm text-gray-800 outline-none placeholder-gray-400 bg-transparent"
          />
          {loading && (
            <span className="text-gray-300 flex-shrink-0">
              <svg className="animate-spin" width={16} height={16} fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".3" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </span>
          )}
          <button onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition flex-shrink-0">
            Esc
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {/* Search results */}
          {allItems.length > 0 && (
            <div className="py-2">
              {allItems.map(function (item, i) {
                var meta = TYPE_META[item.type] || TYPE_META.advice;
                return (
                  <button key={i} onClick={function () { go(item.url); }}
                    className={"w-full flex items-center gap-3 px-4 py-2.5 text-left transition " +
                      (active === i ? "bg-gray-50" : "hover:bg-gray-50")}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: meta.bg }}>
                      <span style={{ color: meta.color }}>
                        <Icon d={meta.icon} size={15} />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{item.subtitle}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* No results */}
          {query.trim().length >= 2 && !loading && allItems.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">
              <p>"{query}" гэсэн үр дүн олдсонгүй</p>
            </div>
          )}

          {/* Quick links (shown when no query) */}
          {query.trim().length < 2 && (
            <div className="py-3 px-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Шуурхай холбоос</p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_LINKS.map(function (ql, i) {
                  return (
                    <button key={i} onClick={function () { go(ql.url); }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition text-left">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: ql.bg }}>
                        <span style={{ color: ql.color }}><Icon d={ql.icon} size={14} /></span>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{ql.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-4 text-[11px] text-gray-400">
          <span><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium">↑↓</kbd> шилжих</span>
          <span><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium">Enter</kbd> нээх</span>
          <span><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium">Esc</kbd> хаах</span>
        </div>
      </div>
    </div>
  );
}
