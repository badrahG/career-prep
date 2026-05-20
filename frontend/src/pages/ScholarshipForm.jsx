import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import OrgLogo from "../components/OrgLogo";
import Layout from "../components/Layout";

function parseList(val) {
  if (!val) return [];
  try { var p = JSON.parse(val); return Array.isArray(p) ? p.filter(Boolean) : []; } catch { return val.trim() ? [val.trim()] : []; }
}

function emptyForm() {
  return {
    name: "", organization: "", target: "Бакалавр", deadline: "",
    website_url: "", description: "", image_url: "", gpa: "", duration: "",
    requirements: [], directions: [], opportunities: [], notes: [],
  };
}

function formFromServer(s) {
  return {
    name: s.name || "", organization: s.organization || "",
    target: s.target || "Бакалавр", deadline: s.deadline || "",
    website_url: s.website_url || "", description: s.description || "",
    image_url: s.image_url || "", gpa: s.gpa || "", duration: s.duration || "",
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
          className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition"
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition flex-shrink-0"
        >
          +
        </button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map(function (item, i) {
            return (
              <li key={i} className="flex items-start gap-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-600 rounded-xl px-3.5 py-2.5">
                <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                <button
                  type="button"
                  onClick={function () { remove(i); }}
                  className="text-gray-300 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition text-lg leading-none flex-shrink-0"
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

var TABS = [
  { id: "basic",  label: "Үндсэн мэдээлэл" },
  { id: "lists",  label: "Шаардлага & Чиглэл" },
  { id: "extra",  label: "Боломж & Санамж" },
];

export default function ScholarshipForm() {
  var navigate = useNavigate();
  var params = useParams();
  var editId = params.id;
  var isEdit = Boolean(editId);

  var [saving, setSaving] = useState(false);
  var [loading, setLoading] = useState(isEdit);
  var [notFound, setNotFound] = useState(false);
  var [form, setForm] = useState(emptyForm());
  var [activeTab, setActiveTab] = useState("basic");

  useEffect(function () {
    if (!isEdit) return;
    API.get("/scholarship/" + editId)
      .then(function (res) { setForm(formFromServer(res.data)); })
      .catch(function () { setNotFound(true); })
      .finally(function () { setLoading(false); });
  }, [editId, isEdit]);

  function upd(field, value) {
    setForm(function (p) { return { ...p, [field]: value }; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Нэр оруулна уу"); return; }
    setSaving(true);
    try {
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
      if (isEdit) {
        await API.put("/scholarship/" + editId, payload);
        toast.success("Амжилттай шинэчлэгдлээ!");
      } else {
        await API.post("/scholarship", payload);
        toast.success("Амжилттай нэмэгдлээ!");
      }
      navigate("/scholarship");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  }

  var inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  var labelCls = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5";

  if (loading) {
    return (
      <Layout>
        <div className="p-5 md:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-400 dark:text-gray-500 text-sm">Ачааллаж байна...</div>
        </div>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout>
        <div className="p-5 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Тэтгэлэг олдсонгүй.</p>
          <Link to="/scholarship" className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition">
            ← Жагсаалт руу буцах
          </Link>
        </div>
      </Layout>
    );
  }

  var logoSource = form.image_url ? "custom" : form.website_url ? "clearbit" : "fallback";

  return (
    <Layout>
      <div className="p-5 md:p-6 max-w-2xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-5">
          <Link to="/scholarship" className="hover:text-violet-600 transition">Тэтгэлэг</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 font-medium">{isEdit ? "Засах" : "Шинээр нэмэх"}</span>
          {isEdit && (
            <span className="ml-auto text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-lg font-medium">
              Засварлах горим
            </span>
          )}
        </div>

        {/* Header */}
        <div className="mb-5">
          <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">
            {isEdit ? "Засах" : "Шинэ тэтгэлэг"}
          </p>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {isEdit ? "Тэтгэлэг засах" : "Тэтгэлэг / Internship нэмэх"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            * тэмдэгтэй талбар заавал бөглөх шаардлагатай
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700 px-5">
              {TABS.map(function (t) {
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={function () { setActiveTab(t.id); }}
                    className={"py-3.5 px-1 mr-5 text-sm font-medium border-b-2 -mb-px transition " +
                      (activeTab === t.id
                        ? "border-violet-600 text-violet-700 dark:text-violet-400"
                        : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6 space-y-5">

              {/* ── Таб 1: Үндсэн мэдээлэл ── */}
              {activeTab === "basic" && (
                <>
                  <div>
                    <label className={labelCls}>Тэтгэлгийн нэр <span className="text-red-500">*</span></label>
                    <input
                      value={form.name}
                      onChange={function (e) { upd("name", e.target.value); }}
                      placeholder="Жишээ: Japanese Government Scholarship 2026"
                      className={inputCls}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Байгууллага</label>
                      <input
                        value={form.organization}
                        onChange={function (e) { upd("organization", e.target.value); }}
                        placeholder="Байгууллагын нэр"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Төрөл</label>
                      <select
                        value={form.target}
                        onChange={function (e) { upd("target", e.target.value); }}
                        className={inputCls}
                      >
                        <option value="Бакалавр">Бакалавр</option>
                        <option value="Магистр">Магистр</option>
                        <option value="Internship">Internship</option>
                        <option value="PhD">PhD</option>
                        <option value="Бүх түвшин">Бүх түвшин</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Дуусах хугацаа</label>
                      <input
                        type="date"
                        value={form.deadline}
                        onChange={function (e) { upd("deadline", e.target.value); }}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Үргэлжлэх хугацаа</label>
                      <input
                        value={form.duration}
                        onChange={function (e) { upd("duration", e.target.value); }}
                        placeholder="Жишээ: 12 сар"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>GPA шаардлага</label>
                      <input
                        value={form.gpa}
                        onChange={function (e) { upd("gpa", e.target.value); }}
                        placeholder="Жишээ: 3.0+"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Вэбсайт URL</label>
                      <input
                        value={form.website_url}
                        onChange={function (e) { upd("website_url", e.target.value); }}
                        placeholder="https://..."
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Мэдээлэл / Тайлбар</label>
                    <textarea
                      value={form.description}
                      onChange={function (e) { upd("description", e.target.value); }}
                      rows={4}
                      placeholder="Тэтгэлгийн тухай дэлгэрэнгүй мэдээлэл..."
                      className={inputCls + " resize-none"}
                    />
                  </div>

                  {/* Logo section */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <label className={labelCls + " mb-0"}>Байгууллагын лого</label>
                      <span className={"text-xs px-2 py-0.5 rounded-lg font-medium border " +
                        (logoSource === "custom"
                          ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-800"
                          : logoSource === "clearbit"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                          : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600")}>
                        {logoSource === "custom" ? "Гараар оруулсан" : logoSource === "clearbit" ? "Автомат (Clearbit)" : "Эхний үсэг"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <div className="md:col-span-2 space-y-1.5">
                        <input
                          value={form.image_url}
                          onChange={function (e) { upd("image_url", e.target.value); }}
                          placeholder="https://example.com/logo.png"
                          className={inputCls}
                        />
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Хоосон үлдээвэл вэбсайтаас <span className="font-semibold">Clearbit</span>-ээр автоматаар татна.
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 flex flex-col items-center gap-2">
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Урьдчилж харах</p>
                        <OrgLogo
                          key={form.image_url + "_" + form.website_url + "_" + form.organization}
                          name={form.organization || form.name || "?"}
                          imageUrl={form.image_url}
                          websiteUrl={form.website_url}
                          size="lg"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium text-center line-clamp-1">
                          {form.organization || "Байгууллагын нэр"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Таб 2: Шаардлага & Чиглэл ── */}
              {activeTab === "lists" && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelCls + " mb-0"}>Шаардлага</label>
                      <span className="text-[11px] text-gray-400">{form.requirements.length} утга</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2.5">Текст бичиж + дарах эсвэл Enter дарах</p>
                    <ListInput
                      items={form.requirements}
                      onChange={function (v) { upd("requirements", v); }}
                      placeholder="Жишээ: Монгол Улсын иргэн байх"
                    />
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelCls + " mb-0"}>Чиглэлүүд</label>
                      <span className="text-[11px] text-gray-400">{form.directions.length} утга</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2.5">Тэтгэлэгт хамрагдах боломжтой чиглэлүүд</p>
                    <ListInput
                      items={form.directions}
                      onChange={function (v) { upd("directions", v); }}
                      placeholder="Жишээ: Их сургуулийн үндсэн оюутан"
                    />
                  </div>
                </>
              )}

              {/* ── Таб 3: Боломж & Санамж ── */}
              {activeTab === "extra" && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelCls + " mb-0"}>Тэтгэлгийн боломж</label>
                      <span className="text-[11px] text-gray-400">{form.opportunities.length} утга</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2.5">Тэтгэлэгт хамрагдснаар авах боломжууд</p>
                    <ListInput
                      items={form.opportunities}
                      onChange={function (v) { upd("opportunities", v); }}
                      placeholder="Жишээ: Сар бүр 700,000 төгрөгийн тэтгэлэг"
                    />
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelCls + " mb-0"}>Санамж</label>
                      <span className="text-[11px] text-gray-400">{form.notes.length} утга</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2.5">Анхаарах зүйлс, нийтлэг алдаа</p>
                    <ListInput
                      items={form.notes}
                      onChange={function (v) { upd("notes", v); }}
                      placeholder="Жишээ: Deadline-ыг хойшлуулах хамгийн нийтлэг алдаа"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
              <div className="flex gap-1">
                {TABS.map(function (t) {
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={function () { setActiveTab(t.id); }}
                      className={"w-2 h-2 rounded-full transition " +
                        (activeTab === t.id ? "bg-violet-600" : "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500")}
                    />
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Link
                  to="/scholarship"
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition"
                >
                  Цуцлах
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md disabled:opacity-50 transition"
                >
                  {saving ? "Хадгалж байна..." : (isEdit ? "Шинэчлэлт хадгалах" : "Хадгалах")}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
