import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

export default function AdviceDetail() {
  var params = useParams();
  var id = params.id;
  var { user } = useAuth();
  var isAdmin = user?.role === "admin";

  var [article, setArticle] = useState(null);
  var [related, setRelated] = useState([]);
  var [loading, setLoading] = useState(true);
  var [notFound, setNotFound] = useState(false);

  var CATEGORY_META = {
    cv:         { title: "CV бичих зөвлөмж",   link: "/advice/cv",         color: "bg-blue-600" },
    interview:  { title: "Ярилцлагын зөвлөмж", link: "/advice/interview",  color: "bg-purple-600" },
    job_search: { title: "Ажил олох",           link: "/advice/job_search", color: "bg-emerald-600" },
    career:     { title: "Карьерын зөвлөмж",    link: "/advice/career",     color: "bg-amber-600" },
  };

  useEffect(function () {
    setLoading(true);
    API.get("/advice/" + id)
      .then(function (res) {
        setArticle(res.data);
        return API.get("/advice/", { params: { category: res.data.category } });
      })
      .then(function (res) {
        if (res) {
          setRelated(res.data.filter(function (a) { return a.id !== parseInt(id); }).slice(0, 4));
        }
      })
      .catch(function () { setNotFound(true); })
      .finally(function () { setLoading(false); });
  }, [id]);

  function getYouTubeEmbed(url) {
    if (!url) return null;
    try {
      var patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      ];
      for (var i = 0; i < patterns.length; i++) {
        var match = url.match(patterns[i]);
        if (match && match[1]) return "https://www.youtube.com/embed/" + match[1];
      }
    } catch (e) {}
    return null;
  }

  function parseLinks(linksStr) {
    if (!linksStr) return [];
    try {
      var parsed = JSON.parse(linksStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  async function handleDelete() {
    if (!window.confirm("Энэ зөвлөмжийг устгах уу?")) return;
    try {
      await API.delete("/advice/" + id);
      toast.success("Устгагдлаа");
      window.location.href = "/advice/" + article.category;
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа");
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-5 md:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-400 text-sm">Ачааллаж байна...</div>
        </div>
      </Layout>
    );
  }
  if (notFound || !article) {
    return (
      <Layout>
        <div className="p-5 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-gray-500 text-sm">Зөвлөмж олдсонгүй.</p>
          <Link to="/advice" className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition">← Зөвлөмжүүд</Link>
        </div>
      </Layout>
    );
  }

  var meta = CATEGORY_META[article.category] || { title: article.category, link: "/advice", color: "bg-gray-600" };
  var embedUrl = getYouTubeEmbed(article.youtube_url);
  var links = parseLinks(article.external_links);

  return (
    <Layout>
      <div className="p-5 md:p-6 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
          <Link to="/advice" className="hover:text-violet-600 transition">Зөвлөмж</Link>
          <span>/</span>
          <Link to={meta.link} className="hover:text-violet-600 transition">{meta.title}</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate">{article.title}</span>
        </div>

        {/* Article */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-5">
          <div className={"h-1 " + meta.color} />
          <div className="p-6 md:p-8">
            <Link to={meta.link} className="text-xs font-bold text-violet-600 uppercase tracking-wider hover:underline">
              ← {meta.title}
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mt-3 mb-3">
              {article.title}
            </h1>

            {article.summary && (
              <p className="text-sm text-gray-500 leading-relaxed mb-5 border-l-4 border-violet-200 pl-4">
                {article.summary}
              </p>
            )}

            {isAdmin && (
              <div className="flex gap-2 mb-5 pb-5 border-b border-gray-100">
                <Link
                  to={"/admin/advice?edit=" + article.id}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Засах
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition"
                >
                  Устгах
                </button>
              </div>
            )}

            {embedUrl && (
              <div className="mb-6">
                <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%", height: 0 }}>
                  <iframe
                    src={embedUrl}
                    title={article.title}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">YouTube видео — дэлгэрэнгүй тайлбар</p>
              </div>
            )}

            <div className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {article.content}
            </div>

            {links.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Нэмэлт эх сурвалж</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {links.map(function (link, i) {
                    return (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 hover:border-violet-300 hover:bg-violet-50 transition group"
                      >
                        <div className="w-8 h-8 bg-violet-50 border border-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 text-sm">
                          🔗
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-violet-700 transition truncate">{link.title}</p>
                          <p className="text-xs text-gray-400 truncate">{link.url}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Ижил сэдвийн зөвлөмжүүд</h3>
            <div className="space-y-1">
              {related.map(function (r) {
                return (
                  <Link
                    key={r.id}
                    to={"/advice/detail/" + r.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition group"
                  >
                    <div className="w-7 h-7 bg-violet-50 border border-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-600 text-sm">›</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-violet-700 transition">{r.title}</p>
                      {r.summary && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{r.summary}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link to={meta.link} className="text-sm text-violet-600 hover:underline font-medium">
            ← {meta.title} руу буцах
          </Link>
        </div>
      </div>
    </Layout>
  );
}
