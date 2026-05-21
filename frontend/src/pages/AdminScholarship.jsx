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
  { to: "/admin/feedback",    label: "CV Үнэлгээ" },
];

function parseList(val) {
  if (!val) return [];
  try { var parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; } catch { return val.trim() ? [val.trim()] : []; }
}

function emptyForm() {
  return {
    name: "", organization: "", target: "", deadline: "",
    website_url: "", description: "", image_url: "", gpa: "", duration: "",
    requirements: [], directions: [], opportunities: [], notes: [],
  };
}

function formFromServer(s) {
  return {
    name: s.name || "", organization: s.organization || "", target: s.target || "",
    deadline: s.deadline || "", website_url: s.website_url || "",
    description: s.description || "", image_url: s.image_url || "",
    gpa: s.gpa || "", duration: s.duration || "",
    requirements: parseList(s.requirements),
    directions: parseList(s.directions),
    opportunities: parseList(s.opportunities),
    notes: parseList(s.notes),
  };
}

function ListInput({ items, onChange, placeholder }) {
  var [draft, setDraft] = useState("");

  function add() {
    var v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  }

  function remove(i) {
    onChange(items.filter(function (_, idx) { return idx !== i; }));
  }

  function handleKey(e) {
    if (e.key === "Enter") { e.preventDefault(); add(); }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={function (e) { setDraft(e.target.value); }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-bold transition flex-shrink-0"
        >
          +
        </button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map(function (item, i) {
            return (
              <li key={i} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-600 rounded-lg px-3 py-2 group">
                <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                <button
                  type="button"
                  onClick={function () { remove(i); }}
                  className="text-gray-300 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition text-base leading-none flex-shrink-0 mt-0.5"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function AdminScholarship() {
  var location = useLocation();
  var [scholarships, setScholarships] = useState([]);
  var [loading, setLoading] = useState(true);
  var [showModal, setShowModal] = useState(false);
  var [editingId, setEditingId] = useState(null);
  var [form, setForm] = useState(emptyForm());
  var [selected, setSelected] = useState([]);
  var [activeTab, setActiveTab] = useState("basic");

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
    setActiveTab("basic");
    setShowModal(true);
  }

  function openEdit(s) {
    setEditingId(s.id);
    setForm(formFromServer(s));
    setActiveTab("basic");
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditingId(null); }

  function upd(field, value) {
    setForm(function (p) { return { ...p, [field]: value }; });
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Тэтгэлгийн нэр заавал бичих ёстой"); return; }
    var payload = {
      name: form.name,
      organization: form.organization || null,
      target: form.target || null,
      deadline: form.deadline || null,
      website_url: form.website_url || null,
      description: form.description || null,
      image_url: form.image_url || null,
      gpa: form.gpa || null,
      duration: form.duration || null,
      requirements: form.requirements.length ? JSON.stringify(form.requirements) : null,
      directions: form.directions.length ? JSON.stringify(form.directions) : null,
      opportunities: form.opportunities.length ? JSON.stringify(form.opportunities) : null,
      notes: form.notes.length ? JSON.stringify(form.notes) : null,
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
    } catch {
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

  var MODAL_TABS = [
    { id: "basic",   label: "Үндсэн мэдээлэл" },
    { id: "lists",   label: "Шаардлага & Чиглэл" },
    { id: "extra",   label: "Боломж & Санамж" },
  ];

  var inputCls = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition";
  var labelCls = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5";

  return (
    <Layout>
      <div className="p-5 md:p-6 space-y-6">

        {/* Admin tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mx-5 px-5 md:-mx-6 md:px-6 overflow-x-auto scrollbar-hide">
          {ADMIN_TABS.map(function (tab) {
            var active = location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
            return (
              <Link key={tab.to} to={tab.to}
                className={"px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap flex-shrink-0 " +
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
            <button onClick={openCreate} className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full text-sm font-semibold hover:shadow-md transition">
              + Тэтгэлэг
            </button>
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-2.5">
            <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">{selected.length} сонгосон</span>
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
                var reqCount = parseList(s.requirements).length;
                var dirCount = parseList(s.directions).length;
                var oppCount = parseList(s.opportunities).length;
                var noteCount = parseList(s.notes).length;
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
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            {s.target && (
                              <span className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 px-2 py-0.5 rounded-md font-medium">
                                {s.target}
                              </span>
                            )}
                            {s.deadline && (
                              <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md font-medium">
                                Дуусах: {s.deadline}
                              </span>
                            )}
                            {s.gpa && (
                              <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md font-medium">
                                GPA {s.gpa}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-0.5">{s.name}</h3>
                          {s.organization && <p className="text-sm text-gray-500 dark:text-gray-400">{s.organization}</p>}
                          {s.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{s.description}</p>}
                          <div className="flex flex-wrap gap-3 mt-2">
                            {reqCount > 0 && <span className="text-[11px] text-gray-400 dark:text-gray-500">Шаардлага {reqCount}</span>}
                            {dirCount > 0 && <span className="text-[11px] text-gray-400 dark:text-gray-500">Чиглэл {dirCount}</span>}
                            {oppCount > 0 && <span className="text-[11px] text-gray-400 dark:text-gray-500">Боломж {oppCount}</span>}
                            {noteCount > 0 && <span className="text-[11px] text-gray-400 dark:text-gray-500">Санамж {noteCount}</span>}
                          </div>
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

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl my-8 flex flex-col shadow-2xl">

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                  {editingId ? "Тэтгэлэг засах" : "Шинэ тэтгэлэг нэмэх"}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">* тэмдэгтэй талбар заавал бөглөх шаардлагатай</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-lg">
                ✕
              </button>
            </div>

            {/* Modal inner tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700 px-6">
              {MODAL_TABS.map(function (t) {
                return (
                  <button key={t.id} onClick={function () { setActiveTab(t.id); }}
                    className={"py-3 px-1 mr-5 text-sm font-medium border-b-2 -mb-px transition " +
                      (activeTab === t.id ? "border-violet-600 text-violet-700 dark:text-violet-400" : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}>
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Modal content */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">

              {/* Tab 1: Үндсэн мэдээлэл */}
              {activeTab === "basic" && (
                <>
                  <div>
                    <label className={labelCls}>Тэтгэлгийн нэр <span className="text-red-500">*</span></label>
                    <input value={form.name} onChange={function (e) { upd("name", e.target.value); }} placeholder="Тэтгэлгийн бүрэн нэр" className={inputCls} />
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
                      <input value={form.duration} onChange={function (e) { upd("duration", e.target.value); }} placeholder="Жишээ: 12 сар" className={inputCls} />
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
                    <label className={labelCls}>Зургийн URL (logo)</label>
                    <input value={form.image_url} onChange={function (e) { upd("image_url", e.target.value); }} placeholder="https://example.com/logo.png" className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Мэдээлэл / Тайлбар</label>
                    <textarea
                      value={form.description}
                      onChange={function (e) { upd("description", e.target.value); }}
                      rows={4}
                      placeholder="Тэтгэлгийн тухай дэлгэрэнгүй тайлбар..."
                      className={inputCls + " resize-none"}
                    />
                  </div>
                </>
              )}

              {/* Tab 2: Шаардлага & Чиглэл */}
              {activeTab === "lists" && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls + " mb-0"}>Шаардлага</label>
                      <span className="text-[11px] text-gray-400">{form.requirements.length} утга</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Текст бичиж + дарах эсвэл Enter дарах</p>
                    <ListInput
                      items={form.requirements}
                      onChange={function (v) { upd("requirements", v); }}
                      placeholder="Жишээ: Монгол Улсын иргэн байх"
                    />
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls + " mb-0"}>Чиглэлүүд</label>
                      <span className="text-[11px] text-gray-400">{form.directions.length} утга</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Тэтгэлэгт хамрагдах боломжтой чиглэлүүд</p>
                    <ListInput
                      items={form.directions}
                      onChange={function (v) { upd("directions", v); }}
                      placeholder="Жишээ: Их сургуулийн үндсэн оюутан"
                    />
                  </div>
                </>
              )}

              {/* Tab 3: Боломж & Санамж */}
              {activeTab === "extra" && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls + " mb-0"}>Тэтгэлгийн боломж</label>
                      <span className="text-[11px] text-gray-400">{form.opportunities.length} утга</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Тэтгэлэгт хамрагдсанаар авах боломжууд</p>
                    <ListInput
                      items={form.opportunities}
                      onChange={function (v) { upd("opportunities", v); }}
                      placeholder="Жишээ: Сар бүр 700,000 төгрөгийн тэтгэлэг"
                    />
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelCls + " mb-0"}>Санамж</label>
                      <span className="text-[11px] text-gray-400">{form.notes.length} утга</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Анхаарах зүйлс, нийтлэг алдаа</p>
                    <ListInput
                      items={form.notes}
                      onChange={function (v) { upd("notes", v); }}
                      placeholder="Жишээ: Deadline-ыг хойшлуулах хамгийн нийтлэг алдаа"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
              <div className="flex gap-1">
                {MODAL_TABS.map(function (t) {
                  return (
                    <button key={t.id} onClick={function () { setActiveTab(t.id); }}
                      className={"w-2 h-2 rounded-full transition " + (activeTab === t.id ? "bg-violet-600" : "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500")}>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button onClick={closeModal} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition">
                  Цуцлах
                </button>
                <button onClick={handleSave} className="px-5 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-lg text-sm font-semibold hover:shadow-md transition">
                  {editingId ? "Шинэчлэх" : "Үүсгэх"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
