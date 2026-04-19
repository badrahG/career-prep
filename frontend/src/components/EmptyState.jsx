/*
 * EmptyState component — үзүүлэх өгөгдөл байхгүй үед харагдана.
 *
 * Usage:
 *   <EmptyState
 *     illustration="cv" // "cv" | "search" | "scholarship" | "interview" | "advice" | "inbox"
 *     title="CV үүсгээгүй байна"
 *     description="Эхний CV-гээ үүсгэж ажилд хамгийн ойр байцгаая."
 *     actionLabel="Шинэ CV үүсгэх"
 *     actionLink="/cv/new"
 *   />
 */

import { Link } from "react-router-dom";

// SVG illustrations — simple, warm-theme-friendly
var illustrations = {
  cv: (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40 mx-auto">
      {/* Background circle */}
      <circle cx="100" cy="100" r="90" fill="#FDF6EC" />
      <circle cx="100" cy="100" r="90" stroke="#e5dfd2" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      {/* Back paper */}
      <rect x="60" y="50" width="80" height="100" rx="4" fill="#FFFBF5" stroke="#e5dfd2" strokeWidth="1.5" transform="rotate(-5 100 100)" />
      {/* Main paper */}
      <rect x="65" y="55" width="80" height="100" rx="4" fill="white" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x="65" y="55" width="80" height="12" rx="4" fill="#1e3a8a" />
      <circle cx="78" cy="78" r="5" fill="#cbd5e1" />
      <rect x="88" y="75" width="40" height="3" rx="1" fill="#94a3b8" />
      <rect x="88" y="81" width="28" height="2" rx="1" fill="#cbd5e1" />
      <rect x="72" y="95" width="12" height="2" rx="1" fill="#1e3a8a" />
      <rect x="72" y="102" width="60" height="2" rx="1" fill="#e2e8f0" />
      <rect x="72" y="107" width="50" height="2" rx="1" fill="#e2e8f0" />
      <rect x="72" y="112" width="55" height="2" rx="1" fill="#e2e8f0" />
      <rect x="72" y="122" width="16" height="2" rx="1" fill="#1e3a8a" />
      <rect x="72" y="129" width="60" height="2" rx="1" fill="#e2e8f0" />
      <rect x="72" y="134" width="45" height="2" rx="1" fill="#e2e8f0" />
      {/* Decorative sparkles */}
      <circle cx="40" cy="60" r="3" fill="#fbbf24" opacity="0.6" />
      <circle cx="160" cy="70" r="4" fill="#60a5fa" opacity="0.5" />
      <circle cx="35" cy="140" r="3" fill="#34d399" opacity="0.5" />
      <circle cx="165" cy="145" r="3" fill="#f472b6" opacity="0.5" />
    </svg>
  ),

  search: (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40 mx-auto">
      <circle cx="100" cy="100" r="90" fill="#FDF6EC" />
      <circle cx="100" cy="100" r="90" stroke="#e5dfd2" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      {/* Magnifying glass */}
      <circle cx="88" cy="88" r="30" fill="white" stroke="#1e3a8a" strokeWidth="3" />
      <circle cx="88" cy="88" r="22" fill="#FDF6EC" />
      <line x1="110" y1="110" x2="135" y2="135" stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" />
      {/* Question mark inside */}
      <text x="88" y="98" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#94a3b8">?</text>
      {/* Dust */}
      <circle cx="50" cy="50" r="2" fill="#cbd5e1" />
      <circle cx="150" cy="55" r="2" fill="#cbd5e1" />
      <circle cx="145" cy="160" r="2" fill="#cbd5e1" />
      <circle cx="55" cy="155" r="2" fill="#cbd5e1" />
    </svg>
  ),

  scholarship: (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40 mx-auto">
      <circle cx="100" cy="100" r="90" fill="#FDF6EC" />
      <circle cx="100" cy="100" r="90" stroke="#e5dfd2" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      {/* Trophy */}
      <path d="M 70 70 L 130 70 L 125 115 Q 100 130 75 115 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <rect x="92" y="130" width="16" height="15" fill="#f59e0b" />
      <rect x="80" y="145" width="40" height="6" rx="2" fill="#d97706" />
      {/* Handles */}
      <path d="M 70 75 Q 55 80 55 95 Q 55 105 70 105" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 130 75 Q 145 80 145 95 Q 145 105 130 105" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Star inside */}
      <text x="100" y="100" textAnchor="middle" fontSize="24" fill="white">★</text>
      {/* Sparkles */}
      <circle cx="45" cy="60" r="3" fill="#fbbf24" opacity="0.6" />
      <circle cx="155" cy="60" r="3" fill="#fbbf24" opacity="0.6" />
      <text x="155" y="120" fontSize="14" fill="#fbbf24">✦</text>
      <text x="40" y="120" fontSize="14" fill="#fbbf24">✦</text>
    </svg>
  ),

  interview: (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40 mx-auto">
      <circle cx="100" cy="100" r="90" fill="#FDF6EC" />
      <circle cx="100" cy="100" r="90" stroke="#e5dfd2" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      {/* Speech bubble 1 */}
      <rect x="40" y="65" width="70" height="45" rx="8" fill="#1e3a8a" />
      <path d="M 55 110 L 55 120 L 68 110 Z" fill="#1e3a8a" />
      <rect x="50" y="78" width="50" height="3" rx="1" fill="white" opacity="0.7" />
      <rect x="50" y="85" width="35" height="3" rx="1" fill="white" opacity="0.5" />
      <rect x="50" y="92" width="45" height="3" rx="1" fill="white" opacity="0.5" />
      {/* Speech bubble 2 */}
      <rect x="95" y="110" width="70" height="45" rx="8" fill="white" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M 135 155 L 135 165 L 148 155 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="105" y="123" width="50" height="3" rx="1" fill="#94a3b8" />
      <rect x="105" y="130" width="40" height="3" rx="1" fill="#cbd5e1" />
      <rect x="105" y="137" width="45" height="3" rx="1" fill="#cbd5e1" />
    </svg>
  ),

  advice: (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40 mx-auto">
      <circle cx="100" cy="100" r="90" fill="#FDF6EC" />
      <circle cx="100" cy="100" r="90" stroke="#e5dfd2" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      {/* Lightbulb */}
      <path d="M 100 55 Q 75 55 75 85 Q 75 100 85 112 L 85 130 L 115 130 L 115 112 Q 125 100 125 85 Q 125 55 100 55 Z"
            fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <rect x="88" y="133" width="24" height="6" rx="1" fill="#64748b" />
      <rect x="90" y="142" width="20" height="4" rx="1" fill="#64748b" />
      <path d="M 95 148 L 105 148" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      {/* Rays */}
      <line x1="100" y1="35" x2="100" y2="45" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <line x1="140" y1="55" x2="147" y2="48" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="55" x2="53" y2="48" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <line x1="150" y1="90" x2="160" y2="90" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="90" x2="50" y2="90" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),

  inbox: (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40 mx-auto">
      <circle cx="100" cy="100" r="90" fill="#FDF6EC" />
      <circle cx="100" cy="100" r="90" stroke="#e5dfd2" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      {/* Box */}
      <rect x="55" y="90" width="90" height="55" rx="3" fill="white" stroke="#94a3b8" strokeWidth="2" />
      <path d="M 55 90 L 70 65 L 130 65 L 145 90 Z" fill="#FFFBF5" stroke="#94a3b8" strokeWidth="2" />
      <rect x="80" y="90" width="40" height="10" rx="2" fill="#cbd5e1" />
      {/* Content hint */}
      <rect x="75" y="110" width="50" height="4" rx="1" fill="#e2e8f0" />
      <rect x="75" y="120" width="30" height="3" rx="1" fill="#e2e8f0" />
    </svg>
  ),
};

export default function EmptyState({ illustration, title, description, actionLabel, actionLink, onAction, secondaryLabel, secondaryLink }) {
  var svg = illustrations[illustration] || illustrations.inbox;

  return (
    <div className="bg-white border border-slate-200 rounded p-8 md:p-12 text-center">
      <div className="mb-5">{svg}</div>

      <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">{description}</p>
      )}

      {(actionLabel || secondaryLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            actionLink ? (
              <Link
                to={actionLink}
                className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition shadow-sm"
              >
                {actionLabel}
              </Link>
            ) : (
              <button
                onClick={onAction}
                className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition shadow-sm"
              >
                {actionLabel}
              </button>
            )
          )}
          {secondaryLabel && secondaryLink && (
            <Link
              to={secondaryLink}
              className="inline-flex items-center gap-2 border border-slate-300 bg-white text-slate-700 px-5 py-2.5 rounded text-sm font-semibold hover:bg-slate-50 transition"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}