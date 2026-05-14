import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

var ADMIN_TABS = [
  { to: "/admin/dashboard",   label: "Самбар" },
  { to: "/admin/users",       label: "Хэрэглэгчид" },
  { to: "/admin/interview",   label: "Ярилцлага" },
  { to: "/admin/advice",      label: "Зөвлөмж" },
  { to: "/admin/scholarship", label: "Тэтгэлэг" },
];

function emptyForm() {
  return {
    name: "", organization: "", target: "", requirements: "",
    deadline: "", website_url: "", description: "", image_url: "", gpa: "", duration: "",
  };
}

export default function AdminScholarship() {
  var location = useLocation();
  var [scholarships, setScholarships] = useState([]);
  var [loading, setLoading] = useState(true);
  var [showModal, setShowModal] = useState(false);
  var [editingId, setEditingId] = useState(null);
  var [form, setForm] = useState(emptyForm());
  var [selected, setSelected] = useState([]);

  function load() {
    setLoading(true);
    API.get("/scholarship", { params: { limit: 100 } })
      .then(function (res) { setScholarships(res.data); })
      .catch(function () { toast.error("Ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }

  useEffect(function () { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowModal(true);
  }

  function openEdit(s) {
    setEditingId(s.id);
    setForm({
      name: s.name || "", organization: s.organization || "", target: s.target || "",
      requirements: s.requirements || "", deadline: s.deadline || "", website_url: s.website_url || "",
      description: s.description || "", image_url: s.image_url || "", gpa: s.gpa || "", duration: s.duration || "",
    });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditingId(null); }

  function upd(field, value) {
    setForm(function (p) { return { ...p, [field]: value }; });
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Тэтгэлгийн нэр заавал бичих ёстой"); return; }
    var payload = {
      ...form,
      deadline: form.deadline || null, organization: form.organization || null,
      target: form.target || null, requirements: form.requirements || null,
      website_url: form.website_url || null, description: form.description || null,
      image_url: form.image_url || null, gpa: form.gpa || null, duration: form.duration || null,
    };
    try {
      if (editingId) {
        await API.put("/scholarship/" + editingId, payload);
        toast.success("Шинэчлэгдлээ");
      } else {
        await API.post("/scholarship", payload);
        toast.success("Нэмэгдлээ");
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа гарлаа");
    }
  }

  async function handleDelete(s) {
    if (!window.confirm('"' + s.name + '" тэтгэлгийг устгах уу?')) return;
    try {
      await API.delete("/scholarship/" + s.id);
      toast.success("Устгагдлаа");
      setScholarships(scholarships.filter(function (x) { return x.id !== s.id; }));
      setSelected(selected.filter(function (id) { return id !== s.id; }));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа");
    }
  }

  function toggleSelect(id) {
    setSelected(function (prev) {
      return prev.includes(id) ? prev.filter(function (x) { return x !== id; }) : [...prev, id];
    });
  }

  function toggleAll() {
    setSelected(selected.length === scholarships.length ? [] : scholarships.map(function (s) { return s.id; }));
  }

  async function handleBulkDelete() {
    if (selected.length === 0) return;
    if (!window.confirm(selected.length + " тэтгэлгийг устгах уу?")) return;
    try {
      await Promise.all(selected.map(function (id) { return API.delete("/scholarship/" + id); }));
      toast.success(selected.length + " тэтгэлэг устгагдлаа");
      setScholarships(scholarships.filter(function (s) { return !selected.includes(s.id); }));
      setSelected([]);
    } catch (err) {
      toast.error("Устгахад алдаа гарлаа");
    }
  }

  function exportCSV() {
    var rows = [["ID", "Нэр", "Байгууллага", "Зорилтот бүлэг", "Дуусах хугацаа", "GPA", "Вэбсайт"]];
    scholarships.forEach(function (s) {
      rows.push([s.id, s.name, s.organization || "", s.target || "", s.deadline || "", s.gpa || "", s.website_url || ""]);
    });
    var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
    var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "scholarships_" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  var inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  var labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide";

  return (
    <Layout>
      <div className="p-5 md:p-6 space-y-6">

        {/* Admin tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mx-5 px-5 md:-mx-6 md:px-6">
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
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">Админ</p>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Тэтгэлгийн удирдлага</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Тэтгэлгүүдийг нэмэж, засаж, устгана уу.</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={exportCSV} className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              CSV татах
            </button>
            <button onClick={openCreate} className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition">
              + Тэтгэлэг
            </button>
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5">
            <span className="text-sm font-semibold text-violet-700">{selected.length} сонгосон</span>
            <button onClick={handleBulkDelete}
              className="text-sm border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg font-medium transition">
              Устгах
            </button>
            <button onClick={function () { setSelected([]); }} className="text-sm text-gray-500 hover:text-gray-700 ml-auto">
              Цуцлах
            </button>
          </div>
        )}

        {/* List */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">Ачааллаж байна...</div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-20 text-sm text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">Тэтгэлэг байхгүй байна</p>
              <button onClick={openCreate} className="text-violet-600 font-medium hover:underline">+ Тэтгэлэг нэмэх</button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.length === scholarships.length && scholarships.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 accent-violet-600"
                />
                <span className="text-xs text-gray-500 font-medium">Бүгдийг сонгох</span>
              </div>
              {scholarships.map(function (s) {
                var isSelected = selected.includes(s.id);
                return (
                  <div key={s.id} className={"p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition " + (isSelected ? "bg-violet-50 dark:bg-violet-900/20" : "")}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={function () { toggleSelect(s.id); }}
                        className="w-4 h-4 mt-1 accent-violet-600 flex-shrink-0"
                      />
                      <div className="flex-1 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {s.target && (
                              <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-lg font-semibold">
                                {s.target}
                              </span>
                            )}
                            {s.deadline && (
                              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg font-medium">
                                Дуусах: {s.deadline}
                              </span>
                            )}
                            {s.gpa && (
                              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg font-medium">
                                GPA: {s.gpa}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-0.5">{s.name}</h3>
                          {s.organization && <p className="text-sm text-gray-500 dark:text-gray-400">{s.organization}</p>}
                          {s.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{s.description}</p>}
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {s.website_url && (
                            <a href={s.website_url} target="_blank" rel="noopener noreferrer"
                              className="text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition">
                              Вэбсайт
                            </a>
                          )}
                          <button onClick={function () { openEdit(s); }}
                            className="text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition">
                            Засах
                          </button>
                          <button onClick={function () { handleDelete(s); }}
                            className="text-xs px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition">
                            Устгах
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400">Нийт {scholarships.length} тэтгэлэг.</p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {editingId ? "Тэтгэлэг засах" : "Шинэ тэтгэлэг нэмэх"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl leading-none">✕</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className={labelCls}>Тэтгэлгийн нэр <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={function (e) { upd("name", e.target.value); }} placeholder="Тэтгэлгийн нэр" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Байгууллага</label>
                  <input value={form.organization} onChange={function (e) { upd("organization", e.target.value); }} placeholder="Байгууллагын нэр" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Зорилтот бүлэг</label>
                  <input value={form.target} onChange={function (e) { upd("target", e.target.value); }} placeholder="Жишээ: Бакалавр" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Дуусах хугацаа</label>
                  <input type="date" value={form.deadline} onChange={function (e) { upd("deadline", e.target.value); }} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Үргэлжлэх хугацаа</label>
                  <input value={form.duration} onChange={function (e) { upd("duration", e.target.value); }} placeholder="Жишээ: 1 жил" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>GPA шаардлага</label>
                  <input value={form.gpa} onChange={function (e) { upd("gpa", e.target.value); }} placeholder="Жишээ: 3.0+" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Вэбсайт URL</label>
                  <input value={form.website_url} onChange={function (e) { upd("website_url", e.target.value); }} placeholder="https://..." className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Шаардлага</label>
                <textarea value={form.requirements} onChange={function (e) { upd("requirements", e.target.value); }} rows={3} placeholder="Тэтгэлгийн шаардлагууд..." className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Тайлбар</label>
                <textarea value={form.description} onChange={function (e) { upd("description", e.target.value); }} rows={4} placeholder="Тэтгэлгийн дэлгэрэнгүй тайлбар..." className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Зургийн URL (сонголтоор)</label>
                <input value={form.image_url} onChange={function (e) { upd("image_url", e.target.value); }} placeholder="https://example.com/image.jpg" className={inputCls} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
              <button onClick={closeModal} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition">
                Цуцлах
              </button>
              <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition">
                {editingId ? "Шинэчлэх" : "Үүсгэх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
