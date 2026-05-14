import { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { ListSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";

var ADMIN_TABS = [
  { to: "/admin/dashboard",   label: "Самбар" },
  { to: "/admin/users",       label: "Хэрэглэгчид" },
  { to: "/admin/interview",   label: "Ярилцлага" },
  { to: "/admin/advice",      label: "Зөвлөмж" },
  { to: "/admin/scholarship", label: "Тэтгэлэг" },
];

export default function AdminAdvice() {
  var location = useLocation();
  var [searchParams] = useSearchParams();
  var editParam = searchParams.get("edit");

  var [articles, setArticles] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState("");
  var [categoryFilter, setCategoryFilter] = useState("all");

  var [showModal, setShowModal] = useState(false);
  var [editingId, setEditingId] = useState(null);
  var [form, setForm] = useState(emptyForm());
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
  var inputCls = "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  var labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide";

  return (
    <Layout>
      <div className="p-5 md:p-6 space-y-6">

        {/* Admin tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mx-5 px-5 md:-mx-6 md:px-6 mb-2">
          {ADMIN_TABS.map(function (tab) {
            var active = location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
            return (
              <Link key={tab.to} to={tab.to}
                className={"px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition " +
                  (active ? "border-violet-600 text-violet-700" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200")}>
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Карьерын зөвлөмжийн удирдлага</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Зөвлөмжүүдийг үүсгэж, засаж, нийтлэх/нуух.</p>
          </div>
          <button onClick={openCreate} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition flex-shrink-0">
            + Зөвлөмж
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
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
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {articles.map(function (a) {
                return (
                  <div key={a.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-semibold">
                            {categoryLabels[a.category]}
                          </span>
                          {!a.is_published && (
                            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                              Нуугдсан
                            </span>
                          )}
                          {a.youtube_url && (
                            <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                              ▶ Видео
                            </span>
                          )}
                          <span className="text-xs text-gray-500">Order: {a.sort_order}</span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">{a.title}</h3>
                        {a.summary && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{a.summary}</p>}
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={function () { togglePublish(a); }}
                          title={a.is_published ? "Нуух" : "Нийтлэх"}
                          className={"text-xs px-3 py-1.5 border rounded-lg font-medium transition " + (a.is_published ? "border-amber-300 text-amber-700 hover:bg-amber-50" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50")}
                        >
                          {a.is_published ? "Нуух" : "Нийтлэх"}
                        </button>
                        <button
                          onClick={function () { openEdit(a); }}
                          className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition"
                        >
                          Засах
                        </button>
                        <button
                          onClick={function () { handleDelete(a); }}
                          className="text-xs px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
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

        <p className="text-xs text-gray-400">Нийт {articles.length} зөвлөмж харагдаж байна.</p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full my-8 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editingId ? "Зөвлөмж засах" : "Шинэ зөвлөмж нэмэх"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl">✕</button>
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
                <p className="text-xs text-gray-500 mt-1">Шинэ мөр (Enter) хадгалагдана. Markdown дэмжихгүй.</p>
              </div>

              <div>
                <label className={labelCls}>YouTube видео URL (сонголтоор)</label>
                <input
                  value={form.youtube_url}
                  onChange={function (e) { upd("youtube_url", e.target.value); }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={inputCls}
                />
                <p className="text-xs text-gray-500 mt-1">Дэмжигдэх: youtube.com/watch, youtu.be, youtube.com/shorts</p>
              </div>

              {/* External links editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Гадаад холбоосууд (сонголтоор)
                  </label>
                  <button
                    type="button"
                    onClick={addLink}
                    className="text-xs px-3 py-1 border border-violet-500 text-violet-600 rounded-lg font-medium hover:bg-violet-50 transition"
                  >
                    + Холбоос нэмэх
                  </button>
                </div>

                {linksArr.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Одоогоор холбоос байхгүй.</p>
                ) : (
                  <div className="space-y-2">
                    {linksArr.map(function (link, i) {
                      return (
                        <div key={i} className="flex gap-2 items-start bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                          <div className="flex-1 space-y-1.5">
                            <input
                              value={link.title}
                              onChange={function (e) { updLink(i, "title", e.target.value); }}
                              placeholder="Холбоосны нэр (Жишээ: Canva CV загвар)"
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-violet-500"
                            />
                            <input
                              value={link.url}
                              onChange={function (e) { updLink(i, "url", e.target.value); }}
                              placeholder="https://..."
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-violet-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={function () { removeLink(i); }}
                            className="text-xs px-2 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex-shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={function (e) { upd("is_published", e.target.checked); }}
                    className="w-4 h-4 accent-violet-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Нийтлэх</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Нэмэх бол зөвлөмж нийтийн нүдэнд харагдана. Шалгаагүй бол зөвхөн админд харагдана.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={closeModal}
                className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition"
              >
                Цуцлах
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition"
              >
                {editingId ? "Шинэчлэх" : "Үүсгэх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
