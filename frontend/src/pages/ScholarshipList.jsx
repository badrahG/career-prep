import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import OrgLogo from "../components/OrgLogo";
import { CardSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";

export default function ScholarshipList() {
  var [items, setItems] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState("");
  var [filter, setFilter] = useState("all");
  var [activeOnly, setActiveOnly] = useState(false);
  var [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  var [bookmarks, setBookmarks] = useState(new Set());
  var { user } = useAuth();
  var isAdmin = user?.role === "admin";

  useEffect(function () {
    API.get("/scholarship").then(function (res) { setItems(res.data); }).catch(function () { toast.error("Ачаалахад алдаа"); }).finally(function () { setLoading(false); });
    if (user) {
      API.get("/scholarship/bookmarks").then(function (res) {
        setBookmarks(new Set(res.data.ids));
      }).catch(function () {});
    }
  }, [user]);

  function handleDelete(e, id) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Устгах уу?")) return;
    API.delete("/scholarship/" + id).then(function () {
      setItems(items.filter(function (i) { return i.id !== id; }));
      toast.success("Устгагдлаа");
    });
  }

  function stop(e) { e.stopPropagation(); }

  async function toggleBookmark(e, id) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Нэвтэрнэ үү"); return; }
    try {
      var res = await API.post("/scholarship/" + id + "/bookmark");
      setBookmarks(function (prev) {
        var next = new Set(prev);
        if (res.data.bookmarked) { next.add(id); } else { next.delete(id); }
        return next;
      });
    } catch { toast.error("Алдаа гарлаа"); }
  }

  var filtered = items.filter(function (s) {
    var matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || (s.organization || "").toLowerCase().includes(search.toLowerCase());
    var matchFilter = filter === "all" || s.target === filter;
    var matchActive = !activeOnly || !s.deadline || new Date(s.deadline) >= new Date();
    var matchBookmark = !bookmarkedOnly || bookmarks.has(s.id);
    return matchSearch && matchFilter && matchActive && matchBookmark;
  });

  function daysLeft(deadline) {
    if (!deadline) return null;
    var diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Дууссан";
    if (diff === 0) return "Өнөөдөр";
    return diff + " хоног";
  }

  return (
    <Layout>
      <div className="p-5 md:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">Тэтгэлэг & Internship</p>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Тэтгэлэг & Internship</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Дотоодын тэтгэлэг, дадлагын хөтөлбөрүүд.</p>
          </div>
          {isAdmin && <Link to="/scholarship/new" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition whitespace-nowrap">+ Нэмэх</Link>}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input value={search} onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Нэр эсвэл байгууллагаар хайх..."
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="flex flex-wrap gap-1.5">
              {["all", "Бакалавр", "Магистр", "Internship"].map(function (f) {
                return (
                  <button key={f} onClick={function () { setFilter(f); }}
                    className={"px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap " + (filter === f ? "bg-violet-600 text-white" : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600")}>
                    {f === "all" ? "Бүгд" : f}
                  </button>
                );
              })}
              <button onClick={function () { setActiveOnly(!activeOnly); }}
                className={"px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex items-center gap-1.5 " + (activeOnly ? "bg-emerald-500 text-white" : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600")}>
                <span className={"w-2 h-2 rounded-full " + (activeOnly ? "bg-white" : "bg-emerald-500")} />
                Хугацаа дуусаагүй
              </button>
              {user && (
                <button onClick={function () { setBookmarkedOnly(!bookmarkedOnly); }}
                  className={"px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap " + (bookmarkedOnly ? "bg-amber-500 text-white" : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600")}>
                  ★ Хадгалсан
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <CardSkeleton count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState illustration="search" title="Тэтгэлэг олдсонгүй" description="Хайлтын нөхцөл эсвэл шүүлтүүрээ өөрчилж үзнэ үү." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(function (s) {
              var days = daysLeft(s.deadline);
              var isExpired = days === "Дууссан";
              return (
                <Link to={"/scholarship/" + s.id} key={s.id}
                  className={"bg-white dark:bg-gray-800 rounded-2xl border shadow-sm overflow-hidden transition flex flex-col group " + (isExpired ? "border-gray-100 dark:border-gray-700 opacity-70 hover:opacity-100" : "border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-600 hover:shadow-md")}>
                  <div className={"h-1.5 " + (isExpired ? "bg-gray-200 dark:bg-gray-600" : "bg-gradient-to-r from-violet-500 to-indigo-500")} />
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <OrgLogo name={s.organization || s.name} imageUrl={s.image_url} websiteUrl={s.website_url} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-tight group-hover:text-violet-700 dark:group-hover:text-violet-400 transition">{s.name}</p>
                            <p className="text-xs text-violet-600 font-medium mt-1 truncate">{s.organization}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {s.target && <span className="text-xs px-2 py-0.5 rounded-lg font-medium bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">{s.target}</span>}
                            {user && (
                              <button onClick={function (e) { toggleBookmark(e, s.id); }}
                                className={"w-7 h-7 flex items-center justify-center rounded-lg text-sm transition " + (bookmarks.has(s.id) ? "text-amber-500" : "text-gray-300 dark:text-gray-600 hover:text-amber-400")}>
                                ★
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {s.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-3">
                        {s.description.substring(0, 120)}{s.description.length > 120 ? "..." : ""}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {s.gpa && <span className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-gray-600">GPA {s.gpa}</span>}
                      {s.duration && <span className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-gray-600">{s.duration}</span>}
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          {s.deadline && <p className="text-xs text-gray-400 dark:text-gray-500">Хугацаа: {s.deadline}</p>}
                          {days && <p className={"text-xs font-semibold mt-0.5 " + (isExpired ? "text-red-500" : "text-emerald-600")}>{days}</p>}
                        </div>
                        <span className="text-xs text-violet-600 font-semibold group-hover:underline">Дэлгэрэнгүй →</span>
                      </div>
                      {(s.website_url || isAdmin) && (
                        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                          {s.website_url && !isExpired && (
                            <a href={s.website_url} target="_blank" rel="noreferrer" onClick={stop}
                              className="flex-1 text-center text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium py-1.5 rounded-lg transition hover:shadow-sm">
                              Бүртгүүлэх
                            </a>
                          )}
                          {isAdmin && (
                            <>
                              <Link to={"/scholarship/" + s.id + "/edit"} onClick={stop}
                                className="flex-1 text-center text-xs border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-1.5 rounded-lg transition">
                                Засах
                              </Link>
                              <button onClick={function (e) { handleDelete(e, s.id); }}
                                className="flex-1 text-xs border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-1.5 rounded-lg transition">
                                Устгах
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
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
