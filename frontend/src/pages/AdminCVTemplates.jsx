import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { ListSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

var DEFAULT_FORM = { key: "", name: "", description: "", preview_url: "", is_active: true, sort_order: 0 };

export default function AdminCVTemplates() {
  var [templates, setTemplates] = useState([]);
  var [loading, setLoading] = useState(true);
  var [modal, setModal] = useState(null); // null | { mode: "create"|"edit", data: {} }
  var [form, setForm] = useState(DEFAULT_FORM);
  var [saving, setSaving] = useState(false);

  function loadTemplates() {
    setLoading(true);
    API.get("/admin/cv-templates")
      .then(function (res) { setTemplates(res.data); })
      .catch(function () { toast.error("Загвар ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }

  useEffect(function () { loadTemplates(); }, []);

  function openCreate() {
    setForm(DEFAULT_FORM);
    setModal({ mode: "create" });
  }

  function openEdit(t) {
    setForm({ key: t.key, name: t.name, description: t.description, preview_url: t.preview_url, is_active: t.is_active, sort_order: t.sort_order });
    setModal({ mode: "edit", id: t.id });
  }

  function closeModal() {
    setModal(null);
    setForm(DEFAULT_FORM);
  }

  function handleSave() {
    if (!form.name.trim()) { toast.error("Загварын нэр оруулна уу"); return; }
    if (modal.mode === "create" && !form.key.trim()) { toast.error("key оруулна уу"); return; }

    setSaving(true);
    var req = modal.mode === "create"
      ? API.post("/admin/cv-templates", form)
      : API.put("/admin/cv-templates/" + modal.id, form);

    req
      .then(function () {
        toast.success(modal.mode === "create" ? "Загвар нэмэгдлээ" : "Хадгалагдлаа");
        closeModal();
        loadTemplates();
      })
      .catch(function (err) { toast.error(err.response?.data?.detail || "Алдаа"); })
      .finally(function () { setSaving(false); });
  }

  function handleDelete(t) {
    if (!window.confirm('"' + t.name + '" загварыг устгах уу?' + (t.cv_count > 0 ? " " + t.cv_count + " CV ашиглаж байгаа тул боломжгүй байж магадгүй." : ""))) return;
    API.delete("/admin/cv-templates/" + t.id)
      .then(function () {
        toast.success("Устгагдлаа");
        loadTemplates();
      })
      .catch(function (err) { toast.error(err.response?.data?.detail || "Алдаа"); });
  }

  function toggleActive(t) {
    API.put("/admin/cv-templates/" + t.id, { is_active: !t.is_active })
      .then(function () {
        setTemplates(templates.map(function (x) { return x.id === t.id ? { ...x, is_active: !t.is_active } : x; }));
      })
      .catch(function (err) { toast.error(err.response?.data?.detail || "Алдаа"); });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
      </div>

      {/* Nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900 dark:text-gray-100">CareerPrep</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <Link to="/dashboard" className="px-3 py-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 font-medium">Нүүр</Link>
            <Link to="/admin/users" className="px-3 py-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 font-medium">Хэрэглэгчид</Link>
            <Link to="/admin/cv-templates" className="px-3 py-2 text-slate-900 dark:text-gray-100 font-medium border-b-2 border-[#1e3a8a]">CV Загвар</Link>
          </div>
          <Link to="/admin/users" className="text-sm text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 font-medium">← Буцах</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-3 text-xs text-slate-500 dark:text-gray-500 flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="hover:text-slate-900 dark:hover:text-gray-300">Нүүр</Link>
            <span className="mx-2">/</span>
            <Link to="/admin/users" className="hover:text-slate-900 dark:hover:text-gray-300">Админ</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 dark:text-gray-300 font-medium">CV Загвар</span>
          </div>
          <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 px-2 py-0.5 rounded font-medium">Админ горим</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-200">CV Загвар удирдлага</h1>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">CV-д ашиглах загваруудыг нэмэх, засах, идэвхжүүлэх.</p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-[#1e3a8a] text-white rounded text-sm font-medium hover:bg-[#1e3a8a]/90 transition"
          >
            + Загвар нэмэх
          </button>
        </div>

        {loading ? (
          <ListSkeleton count={4} />
        ) : templates.length === 0 ? (
          <EmptyState illustration="inbox" title="Загвар байхгүй" description="Шинэ загвар нэмнэ үү." />
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px]">
                <thead className="bg-slate-50 dark:bg-gray-700/50 border-b border-slate-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Загвар</th>
                    <th className="text-left text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Key</th>
                    <th className="text-left text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Тайлбар</th>
                    <th className="text-center text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">CV тоо</th>
                    <th className="text-center text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Дараалал</th>
                    <th className="text-left text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Төлөв</th>
                    <th className="text-right text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                  {templates.map(function (t) {
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900 dark:text-gray-100">{t.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono bg-slate-100 dark:bg-gray-700 px-2 py-0.5 rounded text-slate-700 dark:text-gray-300">{t.key}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-gray-400 hidden md:table-cell">{t.description || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block min-w-[24px] px-2 py-0.5 bg-slate-100 dark:bg-gray-700 rounded text-xs font-semibold text-slate-700 dark:text-gray-300">{t.cv_count}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-600 dark:text-gray-400">{t.sort_order}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={function () { toggleActive(t); }}
                            className={"text-xs px-2 py-0.5 rounded font-medium border inline-flex items-center gap-1.5 cursor-pointer " + (t.is_active ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30" : "bg-slate-50 dark:bg-gray-700 text-slate-500 dark:text-gray-400 border-slate-200 dark:border-gray-600 hover:bg-slate-100 dark:hover:bg-gray-600")}
                          >
                            <span className={"w-1.5 h-1.5 rounded-full " + (t.is_active ? "bg-emerald-500" : "bg-slate-400 dark:bg-gray-500")}></span>
                            {t.is_active ? "Идэвхтэй" : "Нуугдсан"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={function () { openEdit(t); }}
                              className="text-xs px-2 py-1 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 rounded font-medium transition"
                            >
                              Засах
                            </button>
                            <button
                              onClick={function () { handleDelete(t); }}
                              className="text-xs px-2 py-1 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded font-medium transition"
                            >
                              Устгах
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 mb-4">
              {modal.mode === "create" ? "Шинэ загвар нэмэх" : "Загвар засах"}
            </h2>

            <div className="space-y-4">
              {modal.mode === "create" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Key <span className="text-red-500">*</span></label>
                  <input
                    value={form.key}
                    onChange={function (e) { setForm({ ...form, key: e.target.value }); }}
                    placeholder="Жишээ: creative"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">Латин үсэг, тоо, доогуур зураасыг зөвшөөрнө. Үүсгэсний дараа өөрчлөх боломжгүй.</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Нэр <span className="text-red-500">*</span></label>
                <input
                  value={form.name}
                  onChange={function (e) { setForm({ ...form, name: e.target.value }); }}
                  placeholder="Жишээ: Орчин үеийн"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Тайлбар</label>
                <input
                  value={form.description}
                  onChange={function (e) { setForm({ ...form, description: e.target.value }); }}
                  placeholder="Товч тайлбар"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Урьдчилан харах зургийн URL</label>
                <input
                  value={form.preview_url}
                  onChange={function (e) { setForm({ ...form, preview_url: e.target.value }); }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Дараалал</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={function (e) { setForm({ ...form, sort_order: parseInt(e.target.value) || 0 }); }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={function (e) { setForm({ ...form, is_active: e.target.checked }); }}
                      className="rounded border-slate-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-slate-700 dark:text-gray-300 font-medium">Идэвхтэй</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded hover:bg-slate-50 dark:hover:bg-gray-700 font-medium transition"
              >
                Болих
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-[#1e3a8a] text-white rounded hover:bg-[#1e3a8a]/90 font-medium transition disabled:opacity-50"
              >
                {saving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
