import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function emptyForm() {
  return {
    name: "",
    organization: "",
    target: "",
    requirements: "",
    deadline: "",
    website_url: "",
    description: "",
    image_url: "",
    gpa: "",
    duration: "",
  };
}

export default function AdminScholarship() {
  var [scholarships, setScholarships] = useState([]);
  var [loading, setLoading] = useState(true);
  var [showModal, setShowModal] = useState(false);
  var [editingId, setEditingId] = useState(null);
  var [form, setForm] = useState(emptyForm());

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
      name: s.name || "",
      organization: s.organization || "",
      target: s.target || "",
      requirements: s.requirements || "",
      deadline: s.deadline || "",
      website_url: s.website_url || "",
      description: s.description || "",
      image_url: s.image_url || "",
      gpa: s.gpa || "",
      duration: s.duration || "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
  }

  function upd(field, value) {
    setForm(function (p) { return { ...p, [field]: value }; });
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Тэтгэлгийн нэр заавал бичих ёстой"); return; }

    var payload = {
      ...form,
      deadline: form.deadline || null,
      organization: form.organization || null,
      target: form.target || null,
      requirements: form.requirements || null,
      website_url: form.website_url || null,
      description: form.description || null,
      image_url: form.image_url || null,
      gpa: form.gpa || null,
      duration: form.duration || null,
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
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа");
    }
  }

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
            <Link to="/admin/advice" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Зөвлөмж</Link>
            <Link to="/admin/scholarship" className="px-3 py-2 text-slate-900 font-medium border-b-2 border-[#1e3a8a]">Тэтгэлэг</Link>
          </div>
          <button onClick={openCreate} className="bg-[#1e3a8a] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#1e40af] transition">
            + Тэтгэлэг
          </button>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">Админ — Тэтгэлэг</span>
          </div>
          <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 px-2 py-0.5 rounded font-medium">Админ горим</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Тэтгэлгийн удирдлага</h1>
          <p className="text-sm text-slate-600 mt-1">Тэтгэлгүүдийг нэмэж, засаж, устгана уу.</p>
        </div>

        {/* List */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-slate-400 text-sm">Ачааллаж байна...</div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-20 text-sm text-slate-500">
              <p className="text-lg mb-2">Тэтгэлэг байхгүй байна</p>
              <button onClick={openCreate} className="text-[#1e3a8a] font-medium hover:underline">+ Тэтгэлэг нэмэх</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {scholarships.map(function (s) {
                return (
                  <div key={s.id} className="p-5 hover:bg-slate-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {s.target && (
                            <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 px-2 py-0.5 rounded font-semibold">
                              {s.target}
                            </span>
                          )}
                          {s.deadline && (
                            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">
                              Дуусах: {s.deadline}
                            </span>
                          )}
                          {s.gpa && (
                            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                              GPA: {s.gpa}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-0.5">{s.name}</h3>
                        {s.organization && <p className="text-sm text-slate-500">{s.organization}</p>}
                        {s.description && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{s.description}</p>}
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0">
                        {s.website_url && (
                          <a
                            href={s.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded font-medium transition"
                          >
                            Вэбсайт
                          </a>
                        )}
                        <button
                          onClick={function () { openEdit(s); }}
                          className="text-xs px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded font-medium transition"
                        >
                          Засах
                        </button>
                        <button
                          onClick={function () { handleDelete(s); }}
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
          )}
        </div>

        <p className="text-xs text-slate-400 mt-3">Нийт {scholarships.length} тэтгэлэг.</p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? "Тэтгэлэг засах" : "Шинэ тэтгэлэг нэмэх"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
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

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button onClick={closeModal} className="px-5 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-white transition">
                Цуцлах
              </button>
              <button onClick={handleSave} className="px-6 py-2 bg-[#1e3a8a] text-white rounded text-sm font-semibold hover:bg-[#1e40af] transition">
                {editingId ? "Шинэчлэх" : "Үүсгэх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
