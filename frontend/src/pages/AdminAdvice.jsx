import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { ListSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

export default function AdminAdvice() {
  var [searchParams] = useSearchParams();
  var editParam = searchParams.get("edit");

  var [articles, setArticles] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState("");
  var [categoryFilter, setCategoryFilter] = useState("all");

  // Modal
  var [showModal, setShowModal] = useState(false);
  var [editingId, setEditingId] = useState(null);
  var [form, setForm] = useState(emptyForm());

  // External links editor: use array state for easier editing
  var [linksArr, setLinksArr] = useState([]);

  function emptyForm() {
    return {
      category: "cv",
      title: "",
      summary: "",
      content: "",
      youtube_url: "",
      external_links: "",
      sort_order: 0,
      is_published: true,
    };
  }

  function loadArticles() {
    setLoading(true);
    var p = { include_unpublished: true };
    if (categoryFilter !== "all") p.category = categoryFilter;
    if (search) p.search = search;
    API.get("/advice/", { params: p })
      .then(function (res) { setArticles(res.data); })
      .catch(function () { toast.error("Ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }

  useEffect(function () {
    var timer = setTimeout(loadArticles, 300);
    return function () { clearTimeout(timer); };
  }, [search, categoryFilter]);

  // If URL has ?edit=X, open edit modal automatically
  useEffect(function () {
    if (editParam) {
      API.get("/advice/" + editParam)
        .then(function (res) { openEdit(res.data); })
        .catch(function () {});
    }
  }, [editParam]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setLinksArr([]);
    setShowModal(true);
  }

  function openEdit(a) {
    setEditingId(a.id);
    setForm({
      category: a.category || "cv",
      title: a.title || "",
      summary: a.summary || "",
      content: a.content || "",
      youtube_url: a.youtube_url || "",
      external_links: a.external_links || "",
      sort_order: a.sort_order || 0,
      is_published: a.is_published !== false,
    });
    // Parse existing links
    try {
      var parsed = a.external_links ? JSON.parse(a.external_links) : [];
      setLinksArr(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setLinksArr([]);
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
  }

  function upd(field, value) {
    setForm(function (p) { return { ...p, [field]: value }; });
  }

  function addLink() {
    setLinksArr([...linksArr, { title: "", url: "" }]);
  }

  function updLink(i, field, value) {
    var updated = linksArr.map(function (l, idx) {
      return idx === i ? { ...l, [field]: value } : l;
    });
    setLinksArr(updated);
  }

  function removeLink(i) {
    setLinksArr(linksArr.filter(function (_, idx) { return idx !== i; }));
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Гарчиг заавал бичих ёстой"); return; }
    if (!form.content.trim()) { toast.error("Агуулга заавал бичих ёстой"); return; }

    var validLinks = linksArr.filter(function (l) { return l.title.trim() && l.url.trim(); });

    try {
      var payload = {
        ...form,
        external_links: validLinks.length > 0 ? JSON.stringify(validLinks) : null,
        youtube_url: form.youtube_url.trim() || null,
      };
      if (editingId) {
        await API.put("/advice/" + editingId, payload);
        toast.success("Шинэчлэгдлээ");
      } else {
        await API.post("/advice/", payload);
        toast.success("Нэмэгдлээ");
      }
      closeModal();
      loadArticles();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа");
    }
  }

  async function handleDelete(a) {
    if (!window.confirm('"' + a.title + '" зөвлөмжийг устгах уу?')) return;
    try {
      await API.delete("/advice/" + a.id);
      toast.success("Устгагдлаа");
      setArticles(articles.filter(function (x) { return x.id !== a.id; }));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа");
    }
  }

  async function togglePublish(a) {
    try {
      await API.put("/advice/" + a.id, { ...a, is_published: !a.is_published });
      toast.success(a.is_published ? "Нуугдлаа" : "Нийтлэгдлээ");
      setArticles(articles.map(function (x) {
        return x.id === a.id ? { ...x, is_published: !a.is_published } : x;
      }));
    } catch (err) {
      toast.error("Алдаа");
    }
  }

  var categoryLabels = { cv: "CV", interview: "Ярилцлага", job_search: "Ажил олох", career: "Карьер" };
  var inputCls = "w-full px-4 py-2.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition";
  var labelCls = "block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide";

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
            <Link to="/admin/users" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Хэрэглэгч</Link>
            <Link to="/admin/interview" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Ярилцлага</Link>
            <Link to="/admin/advice" className="px-3 py-2 text-slate-900 font-medium border-b-2 border-[#1e3a8a]">Зөвлөмж</Link>
          </div>
          <button onClick={openCreate} className="bg-[#1e3a8a] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#1e40af] transition">
            + Зөвлөмж
          </button>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">Админ — Карьерын зөвлөмж</span>
          </div>
          <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 px-2 py-0.5 rounded font-medium">Админ горим</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Карьерын зөвлөмжийн удирдлага</h1>
          <p className="text-sm text-slate-600 mt-1">Зөвлөмжүүдийг үүсгэж, засаж, нийтлэх/нуух.</p>
        </div>

        {/* Filter */}
        <div className="bg-white border border-slate-200 rounded p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Хайх..."
              className={"flex-1 " + inputCls}
            />
            <select value={categoryFilter} onChange={function (e) { setCategoryFilter(e.target.value); }} className={inputCls + " md:w-52"}>
              <option value="all">Бүх категори</option>
              <option value="cv">CV</option>
              <option value="interview">Ярилцлага</option>
              <option value="job_search">Ажил олох</option>
              <option value="career">Карьер</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <ListSkeleton count={6} />
        ) : articles.length === 0 ? (
          <EmptyState illustration="advice" title="Зөвлөмж олдсонгүй" description="Шинэ зөвлөмж нэмэхийн тулд дээрх товч дарна уу." />
        ) : (
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="divide-y divide-slate-200">
              {articles.map(function (a) {
                return (
                  <div key={a.id} className="p-5 hover:bg-slate-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 px-2 py-0.5 rounded font-semibold">
                            {categoryLabels[a.category]}
                          </span>
                          {!a.is_published && (
                            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">
                              Нуугдсан
                            </span>
                          )}
                          {a.youtube_url && (
                            <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-medium">
                              ▶ Видео
                            </span>
                          )}
                          <span className="text-xs text-slate-500">Order: {a.sort_order}</span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mb-1">{a.title}</h3>
                        {a.summary && <p className="text-sm text-slate-600 line-clamp-2">{a.summary}</p>}
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={function () { togglePublish(a); }}
                          title={a.is_published ? "Нуух" : "Нийтлэх"}
                          className={"text-xs px-3 py-1.5 border rounded font-medium transition " + (a.is_published ? "border-amber-300 text-amber-700 hover:bg-amber-50" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50")}
                        >
                          {a.is_published ? "Нуух" : "Нийтлэх"}
                        </button>
                        <button
                          onClick={function () { openEdit(a); }}
                          className="text-xs px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded font-medium transition"
                        >
                          Засах
                        </button>
                        <button
                          onClick={function () { handleDelete(a); }}
                          className="text-xs px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded font-medium transition"
                        >
                          Устгах
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-3">Нийт {articles.length} зөвлөмж харагдаж байна.</p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? "Зөвлөмж засах" : "Шинэ зөвлөмж нэмэх"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Гарчиг <span className="text-red-500">*</span></label>
                  <input
                    value={form.title}
                    onChange={function (e) { upd("title", e.target.value); }}
                    placeholder="Зөвлөмжийн гарчиг"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Эрэмбэ</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={function (e) { upd("sort_order", parseInt(e.target.value) || 0); }}
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Категори <span className="text-red-500">*</span></label>
                <select value={form.category} onChange={function (e) { upd("category", e.target.value); }} className={inputCls}>
                  <option value="cv">CV бичих</option>
                  <option value="interview">Ярилцлага</option>
                  <option value="job_search">Ажил олох</option>
                  <option value="career">Карьер</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Товч тайлбар (карт дээр гарна)</label>
                <textarea
                  value={form.summary}
                  onChange={function (e) { upd("summary", e.target.value); }}
                  rows={2}
                  placeholder="1-2 өгүүлбэр..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Үндсэн агуулга <span className="text-red-500">*</span></label>
                <textarea
                  value={form.content}
                  onChange={function (e) { upd("content", e.target.value); }}
                  rows={10}
                  placeholder="Бүтэн агуулга. Шинэ мөр автоматаар хадгалагдана."
                  className={inputCls}
                />
                <p className="text-xs text-slate-500 mt-1">Шинэ мөр (Enter) хадгалагдана. Markdown дэмжихгүй.</p>
              </div>

              <div>
                <label className={labelCls}>YouTube видео URL (сонголтоор)</label>
                <input
                  value={form.youtube_url}
                  onChange={function (e) { upd("youtube_url", e.target.value); }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={inputCls}
                />
                <p className="text-xs text-slate-500 mt-1">Дэмжигдэх: youtube.com/watch, youtu.be, youtube.com/shorts</p>
              </div>

              {/* External links editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Гадаад холбоосууд (сонголтоор)
                  </label>
                  <button
                    type="button"
                    onClick={addLink}
                    className="text-xs px-3 py-1 border border-[#1e3a8a] text-[#1e3a8a] rounded font-medium hover:bg-[#1e3a8a]/5 transition"
                  >
                    + Холбоос нэмэх
                  </button>
                </div>

                {linksArr.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Одоогоор холбоос байхгүй.</p>
                ) : (
                  <div className="space-y-2">
                    {linksArr.map(function (link, i) {
                      return (
                        <div key={i} className="flex gap-2 items-start bg-slate-50 border border-slate-200 rounded p-2">
                          <div className="flex-1 space-y-1.5">
                            <input
                              value={link.title}
                              onChange={function (e) { updLink(i, "title", e.target.value); }}
                              placeholder="Холбоосны нэр (Жишээ: Canva CV загвар)"
                              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#1e3a8a]"
                            />
                            <input
                              value={link.url}
                              onChange={function (e) { updLink(i, "url", e.target.value); }}
                              placeholder="https://..."
                              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#1e3a8a]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={function () { removeLink(i); }}
                            className="text-xs px-2 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition flex-shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={function (e) { upd("is_published", e.target.checked); }}
                    className="w-4 h-4 accent-[#1e3a8a]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Нийтлэх</p>
                    <p className="text-xs text-slate-500">Нэмэх бол зөвлөмж нийтийн нүдэнд харагдана. Шалгаагүй бол зөвхөн админд харагдана.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={closeModal}
                className="px-5 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-white transition"
              >
                Цуцлах
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#1e3a8a] text-white rounded text-sm font-semibold hover:bg-[#1e40af] transition"
              >
                {editingId ? "Шинэчлэх" : "Үүсгэх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}