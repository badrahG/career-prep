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
    cv:         { title: "CV бичих зөвлөмж",   link: "/advice/cv",         gradient: "from-blue-600 to-blue-700",     light: "bg-blue-50 text-blue-700" },
    interview:  { title: "Ярилцлагын зөвлөмж", link: "/advice/interview",  gradient: "from-violet-600 to-indigo-700", light: "bg-violet-50 text-violet-700" },
    job_search: { title: "Ажил олох",           link: "/advice/job_search", gradient: "from-emerald-600 to-teal-700",  light: "bg-emerald-50 text-emerald-700" },
    career:     { title: "Карьерын зөвлөмж",    link: "/advice/career",     gradient: "from-amber-500 to-orange-600",  light: "bg-amber-50 text-amber-700" },
  };

  useEffect(function () {
    setLoading(true);
    API.get("/advice/" + id)
      .then(function (res) {
        setArticle(res.data);
        return API.get("/advice/", { params: { category: res.data.category } });
      })
      .then(function (res) {
        if (res) setRelated(res.data.filter(function (a) { return a.id !== parseInt(id); }).slice(0, 4));
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

  function renderContent(text) {
    if (!text) return null;
    var lines = text.split("\n");
    var elements = [];
    var bulletBuffer = [];

    function flushBullets(key) {
      if (bulletBuffer.length === 0) return;
      elements.push(
        <ul key={"ul-" + key} className="space-y-2 pl-1 mb-1">
          {bulletBuffer.map(function (b, i) {
            return (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0"></span>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{b}</span>
              </li>
            );
          })}
        </ul>
      );
      bulletBuffer = [];
    }

    lines.forEach(function (line, idx) {
      var trimmed = line.trim();
      if (!trimmed) {
        flushBullets(idx);
        return;
      }
      var numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        flushBullets(idx);
        elements.push(
          <div key={idx} className="flex items-start gap-3 mt-5 mb-1">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center mt-0.5">
              {numberedMatch[1]}
            </span>
            <span className="text-base font-semibold text-gray-800 dark:text-gray-100 leading-snug pt-1">{numberedMatch[2]}</span>
          </div>
        );
        return;
      }
      var bulletMatch = trimmed.match(/^[-•]\s+(.+)$/);
      if (bulletMatch) {
        bulletBuffer.push(bulletMatch[1]);
        return;
      }
      flushBullets(idx);
      elements.push(
        <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed">{trimmed}</p>
      );
    });
    flushBullets("end");
    return elements;
  }

  function parseLinks(str) {
    if (!str) return [];
    try { var p = JSON.parse(str); return Array.isArray(p) ? p : []; }
    catch (e) { return []; }
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-400 dark:text-gray-500 text-sm">Ачааллаж байна...</div>
        </div>
      </Layout>
    );
  }
  if (notFound || !article) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Зөвлөмж олдсонгүй.</p>
          <Link to="/advice" className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition">← Зөвлөмжүүд</Link>
        </div>
      </Layout>
    );
  }

  var meta = CATEGORY_META[article.category] || { title: article.category, link: "/advice", gradient: "from-gray-600 to-gray-700", light: "bg-gray-50 text-gray-700" };
  var embedUrl = getYouTubeEmbed(article.youtube_url);
  var links = parseLinks(article.external_links);

  return (
    <Layout>
      {/* Hero */}
      <div className={"bg-gradient-to-br " + meta.gradient + " px-5 md:px-10 pt-7 pb-10"}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-white/50 mb-5">
            <Link to="/advice" className="hover:text-white transition">Зөвлөмж</Link>
            <span>/</span>
            <Link to={meta.link} className="hover:text-white transition">{meta.title}</Link>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">{meta.title}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-3">
            {article.title}
          </h1>
          {article.summary && (
            <p className="text-sm text-white/70 leading-relaxed">{article.summary}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
        <div className="max-w-4xl mx-auto px-5 md:px-10 py-8 space-y-6">

          {/* Admin toolbar */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500 flex-1">Админ</span>
              <Link to={"/admin/advice?edit=" + article.id}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Засах
              </Link>
              <button onClick={handleDelete}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                Устгах
              </button>
            </div>
          )}

          {/* YouTube */}
          {embedUrl && (
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 aspect-video">
              <iframe src={embedUrl} title={article.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            </div>
          )}

          {/* Article body */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 px-6 md:px-10 py-8">
            <div className="text-[15px] space-y-3">
              {renderContent(article.content)}
            </div>
          </div>

          {/* External links */}
          {links.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 px-6 py-5">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Нэмэлт эх сурвалж</p>
              <div className="space-y-2">
                {links.map(function (link, i) {
                  return (
                    <a key={i} href={link.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-600 hover:bg-violet-50/40 dark:hover:bg-violet-900/10 transition group">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 flex items-center justify-center flex-shrink-0 transition">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 transition">
                          <path d="M5 2H2.5A1 1 0 0 0 1.5 3v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          <path d="M8 1.5h3m0 0v3m0-3L5.5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition truncate">{link.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{link.url}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related articles */}
          {related.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Ижил сэдвийн зөвлөмжүүд</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {related.map(function (r) {
                  return (
                    <Link key={r.id} to={"/advice/detail/" + r.id}
                      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-violet-200 dark:hover:border-violet-600 hover:shadow-sm transition group">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition leading-snug mb-1">{r.title}</p>
                      {r.summary && <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">{r.summary}</p>}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back */}
          <Link to={meta.link}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-violet-600 transition font-medium py-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {meta.title} руу буцах
          </Link>

        </div>
      </div>
    </Layout>
  );
}
