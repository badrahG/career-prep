import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";

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
    cv: { title: "CV бичих зөвлөмж", link: "/advice/cv", color: "bg-blue-600" },
    interview: { title: "Ярилцлагын зөвлөмж", link: "/advice/interview", color: "bg-purple-600" },
    job_search: { title: "Ажил олох", link: "/advice/job_search", color: "bg-emerald-600" },
    career: { title: "Карьерын зөвлөмж", link: "/advice/career", color: "bg-amber-600" },
  };

  useEffect(function () {
    setLoading(true);
    API.get("/advice/" + id)
      .then(function (res) {
        setArticle(res.data);
        // Load related articles from same category
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

  // Extract YouTube video ID from various URL formats
  function getYouTubeEmbed(url) {
    if (!url) return null;
    try {
      // Matches: youtube.com/watch?v=XXX, youtu.be/XXX, youtube.com/embed/XXX
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

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Ачааллаж байна...</div>;
  }
  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600 text-sm">Зөвлөмж олдсонгүй.</p>
        <Link to="/advice" className="px-5 py-2.5 bg-[#1e3a8a] text-white rounded text-sm font-semibold hover:bg-[#1e40af] transition">← Зөвлөмжүүд</Link>
      </div>
    );
  }

  var meta = CATEGORY_META[article.category] || { title: article.category, link: "/advice", color: "bg-slate-600" };
  var embedUrl = getYouTubeEmbed(article.youtube_url);
  var links = parseLinks(article.external_links);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Nav */}
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
          <Link to={meta.link} className="text-sm text-slate-600 hover:text-slate-900 font-medium">← Буцах</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-3 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
          <span className="mx-2">/</span>
          <Link to="/advice" className="hover:text-slate-900">Зөвлөмж</Link>
          <span className="mx-2">/</span>
          <Link to={meta.link} className="hover:text-slate-900">{meta.title}</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium truncate">{article.title}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Article header */}
        <article className="bg-white border border-slate-200 rounded mb-6 overflow-hidden">
          <div className={"h-1 " + meta.color}></div>
          <div className="p-6 md:p-10">
            <div className="mb-5">
              <Link to={meta.link} className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider hover:underline">
                ← {meta.title}
              </Link>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-3">
              {article.title}
            </h1>

            {article.summary && (
              <p className="text-base text-slate-600 leading-relaxed mb-6 border-l-4 border-slate-200 pl-4">
                {article.summary}
              </p>
            )}

            {/* Admin actions */}
            {isAdmin && (
              <div className="flex gap-2 mb-6 pb-6 border-b border-slate-200">
                <Link
                  to={"/admin/advice?edit=" + article.id}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Засах
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded text-sm font-semibold hover:bg-red-50 transition"
                >
                  Устгах
                </button>
              </div>
            )}

            {/* YouTube video */}
            {embedUrl && (
              <div className="mb-8">
                <div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
                  <iframe
                    src={embedUrl}
                    title={article.title}
                    className="absolute top-0 left-0 w-full h-full rounded border border-slate-200"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">YouTube видео — дэлгэрэнгүй тайлбар</p>
              </div>
            )}

            {/* Content — whitespace-pre-line preserves line breaks */}
            <div className="prose prose-slate max-w-none">
              <div className="text-sm md:text-base text-slate-800 leading-relaxed whitespace-pre-line">
                {article.content}
              </div>
            </div>

            {/* External links */}
            {links.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Нэмэлт эх сурвалж</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {links.map(function (link, i) {
                    return (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded p-3 hover:bg-slate-100 hover:border-[#1e3a8a] transition group"
                      >
                        <div className="w-8 h-8 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 text-[#1e3a8a] rounded flex items-center justify-center flex-shrink-0 text-sm">
                          🔗
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1e3a8a] transition truncate">
                            {link.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{link.url}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="bg-white border border-slate-200 rounded p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Ижил сэдвийн зөвлөмжүүд</h3>
            <div className="space-y-2">
              {related.map(function (r) {
                return (
                  <Link
                    key={r.id}
                    to={"/advice/detail/" + r.id}
                    className="flex items-start gap-3 p-3 rounded hover:bg-slate-50 transition group"
                  >
                    <div className="w-8 h-8 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-[#1e3a8a] text-sm">›</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1e3a8a] transition">{r.title}</p>
                      {r.summary && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{r.summary}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Back */}
        <div className="mt-6 text-center">
          <Link to={meta.link} className="text-sm text-[#1e3a8a] hover:underline font-medium">
            ← {meta.title} руу буцах
          </Link>
        </div>
      </div>
    </div>
  );
}