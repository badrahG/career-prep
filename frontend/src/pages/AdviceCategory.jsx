import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";

export default function AdviceCategory() {
  var params = useParams();
  var categoryKey = params.category;
  var { user } = useAuth();
  var isAdmin = user?.role === "admin";

  var [articles, setArticles] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState("");

  var CATEGORY_META = {
    cv: { title: "CV бичих зөвлөмж", subtitle: "CV Writing", color: "bg-blue-600" },
    interview: { title: "Ярилцлагын зөвлөмж", subtitle: "Interview Tips", color: "bg-purple-600" },
    job_search: { title: "Ажил олох", subtitle: "Job Search", color: "bg-emerald-600" },
    career: { title: "Карьерын зөвлөмж", subtitle: "Career Growth", color: "bg-amber-600" },
  };

  var meta = CATEGORY_META[categoryKey];

  useEffect(function () {
    if (!meta) return;
    var timer = setTimeout(function () {
      setLoading(true);
      var p = { category: categoryKey };
      if (search) p.search = search;
      API.get("/advice/", { params: p })
        .then(function (res) { setArticles(res.data); })
        .catch(function () { toast.error("Ачаалахад алдаа"); })
        .finally(function () { setLoading(false); });
    }, 300);
    return function () { clearTimeout(timer); };
  }, [categoryKey, search]);

  if (!meta) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600 text-sm">Буруу категори.</p>
        <Link to="/advice" className="px-5 py-2.5 bg-[#1e3a8a] text-white rounded text-sm font-semibold hover:bg-[#1e40af] transition">← Зөвлөмжүүд</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900">CareerPrep</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <Link to="/dashboard" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Нүүр</Link>
            <Link to="/advice" className="px-3 py-2 text-slate-900 font-medium border-b-2 border-[#1e3a8a]">Зөвлөмж</Link>
          </div>
          <Link to="/advice" className="text-sm text-slate-600 hover:text-slate-900 font-medium">← Сэдвүүд</Link>
        </div>
      </nav>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-3 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
          <span className="mx-2">/</span>
          <Link to="/advice" className="hover:text-slate-900">Зөвлөмж</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">{meta.title}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4 mb-3">
            <div className={"w-12 h-12 rounded flex items-center justify-center flex-shrink-0 " + meta.color}>
              <span className="text-white font-bold text-lg">{meta.title.charAt(0)}</span>
            </div>
            <div>
              <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider">{meta.subtitle}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{meta.title}</h1>
            </div>
          </div>
          <p className="text-sm text-slate-600">{articles.length} зөвлөмж</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 mb-6">
          <input
            value={search}
            onChange={function (e) { setSearch(e.target.value); }}
            placeholder="Зөвлөмж дотроос хайх..."
            className="w-full px-4 py-2.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Ачааллаж байна...</div>
        ) : articles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded p-12 text-center text-sm text-slate-500">
            Зөвлөмж олдсонгүй.
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map(function (a, i) {
              var hasVideo = Boolean(a.youtube_url);
              var hasLinks = Boolean(a.external_links);
              return (
                <Link
                  key={a.id}
                  to={"/advice/detail/" + a.id}
                  className="bg-white border border-slate-200 rounded p-5 hover:border-[#1e3a8a] hover:shadow-sm transition group block"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded flex items-center justify-center flex-shrink-0 font-bold text-[#1e3a8a]">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1e3a8a] transition mb-1">
                        {a.title}
                      </h3>
                      {a.summary && (
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{a.summary}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        {hasVideo && (
                          <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                            ▶ Видео
                          </span>
                        )}
                        {hasLinks && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                            🔗 Холбоос
                          </span>
                        )}
                        {!a.is_published && isAdmin && (
                          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">
                            Нийтлэгдээгүй
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:text-[#1e3a8a] text-xl">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}