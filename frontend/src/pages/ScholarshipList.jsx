import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import OrgLogo from "../components/OrgLogo";
import { CardSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-blue-300/10 rounded-full blur-2xl"></div>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900">CareerPrep</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <Link to="/dashboard" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Нүүр</Link>
            <Link to="/cv" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">CV</Link>
            <Link to="/interview" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Ярилцлага</Link>
             <Link to="/advice" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Зөвлөмж</Link>
            <Link to="/scholarship" className="px-3 py-2 text-slate-900 font-medium border-b-2 border-[#1e3a8a]">Тэтгэлэг</Link>
          </div>
          {isAdmin && <Link to="/scholarship/new" className="bg-[#1e3a8a] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#1e40af] transition">+ Нэмэх</Link>}
          {!isAdmin && <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 font-medium md:hidden">← Буцах</Link>}
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">Тэтгэлэг & Internship</span>
          </div>
          {isAdmin && <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 px-2 py-0.5 rounded font-medium">Админ горим</span>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-6 pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Тэтгэлэг & Internship</h1>
          <p className="text-sm text-slate-600 mt-1">Дотоодын тэтгэлэг, дадлагын хөтөлбөрүүд. Дэлгэрэнгүйг харахын тулд карт дарна уу.</p>
        </div>

        {/* Search + filter */}
        <div className="bg-white border border-slate-200 rounded p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Нэр эсвэл байгууллагаар хайх..."
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition"
            />
            <div className="flex flex-wrap gap-1">
              {["all", "Бакалавр", "Магистр", "Internship"].map(function (f) {
                return (
                  <button
                    key={f}
                    onClick={function () { setFilter(f); }}
                    className={"px-4 py-2 rounded text-sm font-medium transition whitespace-nowrap " + (filter === f ? "bg-[#1e3a8a] text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")}
                  >
                    {f === "all" ? "Бүгд" : f}
                  </button>
                );
              })}
              <button
                onClick={function () { setActiveOnly(!activeOnly); }}
                className={"px-4 py-2 rounded text-sm font-medium transition whitespace-nowrap flex items-center gap-1.5 " + (activeOnly ? "bg-emerald-600 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")}
              >
                <span className={"w-2 h-2 rounded-full flex-shrink-0 " + (activeOnly ? "bg-white" : "bg-emerald-500")}></span>
                Хугацаа дуусаагүй
              </button>
              {user && (
                <button
                  onClick={function () { setBookmarkedOnly(!bookmarkedOnly); }}
                  className={"px-4 py-2 rounded text-sm font-medium transition whitespace-nowrap " + (bookmarkedOnly ? "bg-amber-500 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")}
                >
                  ★ Хадгалсан
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <CardSkeleton count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            illustration="search"
            title="Тэтгэлэг олдсонгүй"
            description="Хайлтын нөхцөл эсвэл шүүлтүүрээ өөрчилж үзнэ үү."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(function (s) {
              var days = daysLeft(s.deadline);
              var isExpired = days === "Дууссан";
              return (
                <Link
                  to={"/scholarship/" + s.id}
                  key={s.id}
                  className={"bg-white rounded border overflow-hidden transition flex flex-col group " + (isExpired ? "border-slate-200 opacity-70 hover:opacity-100" : "border-slate-200 hover:border-[#1e3a8a] hover:shadow-sm")}
                >
                  <div className={"h-1 " + (isExpired ? "bg-slate-300" : "bg-[#1e3a8a]")}></div>
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Top row: Logo + title + target badge + bookmark */}
                    <div className="flex items-start gap-3 mb-3">
                      <OrgLogo
                        name={s.organization || s.name}
                        imageUrl={s.image_url}
                        websiteUrl={s.website_url}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-[#1e3a8a] transition">{s.name}</p>
                            <p className="text-xs text-[#1e3a8a] font-medium mt-1 truncate">{s.organization}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {s.target && (
                              <span className="text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap bg-slate-50 text-slate-700 border border-slate-200">
                                {s.target}
                              </span>
                            )}
                            {user && (
                              <button
                                onClick={function (e) { toggleBookmark(e, s.id); }}
                                title={bookmarks.has(s.id) ? "Хадгалсан" : "Хадгалах"}
                                className={"w-7 h-7 flex items-center justify-center rounded text-sm transition " + (bookmarks.has(s.id) ? "text-amber-500 hover:text-amber-400" : "text-slate-300 hover:text-amber-400")}
                              >
                                ★
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {s.description && (
                      <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">
                        {s.description.substring(0, 120)}{s.description.length > 120 ? "..." : ""}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {s.gpa && <span className="text-xs bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200">GPA {s.gpa}</span>}
                      {s.duration && <span className="text-xs bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200">{s.duration}</span>}
                    </div>

                    <div className="mt-auto pt-3 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          {s.deadline && <p className="text-xs text-slate-500">Хугацаа: {s.deadline}</p>}
                          {days && <p className={"text-xs font-semibold mt-0.5 " + (isExpired ? "text-red-600" : "text-emerald-700")}>{days}</p>}
                        </div>
                        <span className="text-xs text-[#1e3a8a] font-semibold group-hover:underline">Дэлгэрэнгүй →</span>
                      </div>

                      {/* External register link + admin buttons */}
                      {(s.website_url || isAdmin) && (
                        <div className="flex gap-2 pt-3 border-t border-slate-200">
                          {s.website_url && !isExpired && (
                            <a
                              href={s.website_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={stop}
                              className="flex-1 text-center text-xs bg-[#1e3a8a] text-white hover:bg-[#1e40af] font-medium py-1.5 rounded transition"
                            >
                              Бүртгүүлэх
                            </a>
                          )}
                          {isAdmin && (
                            <>
                              <Link
                                to={"/scholarship/" + s.id + "/edit"}
                                onClick={stop}
                                className="flex-1 text-center text-xs border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-1.5 rounded transition"
                              >
                                Засах
                              </Link>
                              <button
                                onClick={function (e) { handleDelete(e, s.id); }}
                                className="flex-1 text-xs border border-red-200 text-red-600 hover:bg-red-50 font-medium py-1.5 rounded transition"
                              >
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
    </div>
  );
}