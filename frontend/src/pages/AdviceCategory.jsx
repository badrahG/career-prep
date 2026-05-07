import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import { ListSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";

export default function AdviceCategory() {
  var params = useParams();
  var categoryKey = params.category;
  var { user } = useAuth();
  var isAdmin = user?.role === "admin";

  var [articles, setArticles] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState("");

  var CATEGORY_META = {
    cv:          { title: "CV бичих зөвлөмж",    subtitle: "CV Writing",    color: "bg-blue-600" },
    interview:   { title: "Ярилцлагын зөвлөмж",  subtitle: "Interview Tips",color: "bg-purple-600" },
    job_search:  { title: "Ажил олох",            subtitle: "Job Search",    color: "bg-emerald-600" },
    career:      { title: "Карьерын зөвлөмж",     subtitle: "Career Growth", color: "bg-amber-600" },
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
      <Layout>
        <div className="p-5 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-gray-500 text-sm">Буруу категори.</p>
          <Link to="/advice" className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition">← Зөвлөмжүүд</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-5 md:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
          <Link to="/advice" className="hover:text-violet-600 transition">Зөвлөмж</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{meta.title}</span>
        </div>

        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={"w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 " + meta.color}>
              <span className="text-white font-bold text-lg">{meta.title.charAt(0)}</span>
            </div>
            <div>
              <p className="text-xs text-violet-600 font-bold uppercase tracking-wider">{meta.subtitle}</p>
              <h1 className="text-xl font-bold text-gray-800">{meta.title}</h1>
            </div>
          </div>
          {isAdmin && (
            <Link to="/admin/advice" className="text-sm text-violet-600 font-semibold hover:underline whitespace-nowrap">
              Удирдах →
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-5">
          <input
            value={search}
            onChange={function (e) { setSearch(e.target.value); }}
            placeholder="Зөвлөмж дотроос хайх..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition"
          />
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-xs text-gray-400 mb-3">{articles.length} зөвлөмж</p>
        )}

        {loading ? (
          <ListSkeleton count={4} />
        ) : articles.length === 0 ? (
          <EmptyState
            illustration="advice"
            title="Зөвлөмж олдсонгүй"
            description="Хайлтын үгээ өөрчилж үзнэ үү."
          />
        ) : (
          <div className="space-y-3">
            {articles.map(function (a, i) {
              var hasVideo = Boolean(a.youtube_url);
              var hasLinks = Boolean(a.external_links);
              return (
                <Link
                  key={a.id}
                  to={"/advice/detail/" + a.id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition group block"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-violet-600">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-800 group-hover:text-violet-700 transition mb-1">
                        {a.title}
                      </h3>
                      {a.summary && (
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{a.summary}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        {hasVideo && (
                          <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-lg font-medium flex items-center gap-1">
                            ▶ Видео
                          </span>
                        )}
                        {hasLinks && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg font-medium">
                            🔗 Холбоос
                          </span>
                        )}
                        {!a.is_published && isAdmin && (
                          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg font-medium">
                            Нийтлэгдээгүй
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-300 group-hover:text-violet-500 transition text-xl">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
