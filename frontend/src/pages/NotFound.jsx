import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  var { token } = useAuth();
  var homeLink = token ? "/dashboard" : "/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        <Link to={homeLink} className="inline-flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 bg-[#1e3a8a] flex items-center justify-center rounded">
            <span className="text-white font-bold text-sm tracking-wide">CP</span>
          </div>
          <span className="text-base font-semibold text-slate-900">CareerPrep</span>
        </Link>

        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-10 shadow-lg">
          <p className="text-7xl font-extrabold text-[#1e3a8a] mb-2">404</p>
          <h1 className="text-xl font-bold text-slate-900 mb-3">Хуудас олдсонгүй</h1>
          <p className="text-sm text-slate-500 mb-8">
            Та хайж буй хуудас байхгүй эсвэл зөөгдсэн байна.
          </p>
          <Link
            to={homeLink}
            className="inline-block bg-[#1e3a8a] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition"
          >
            ← Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    </div>
  );
}
