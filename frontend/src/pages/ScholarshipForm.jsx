import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import OrgLogo from "../components/OrgLogo";

export default function ScholarshipForm() {
  var navigate = useNavigate();
  var params = useParams();
  var editId = params.id;
  var isEdit = Boolean(editId);

  var [saving, setSaving] = useState(false);
  var [loading, setLoading] = useState(isEdit);
  var [notFound, setNotFound] = useState(false);
  var [form, setForm] = useState({
    name: "",
    organization: "",
    target: "Бакалавр",
    requirements: "",
    deadline: "",
    website_url: "",
    description: "",
    gpa: "",
    duration: "",
    image_url: "",
  });

  // Load existing data if in edit mode
  useEffect(function () {
    if (!isEdit) return;
    API.get("/scholarship/" + editId)
      .then(function (res) {
        var s = res.data;
        setForm({
          name: s.name || "",
          organization: s.organization || "",
          target: s.target || "Бакалавр",
          requirements: s.requirements || "",
          deadline: s.deadline || "",
          website_url: s.website_url || "",
          description: s.description || "",
          gpa: s.gpa || "",
          duration: s.duration || "",
          image_url: s.image_url || "",
        });
      })
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
      var payload = { ...form };
      if (!payload.deadline) payload.deadline = null;
      if (!payload.image_url) payload.image_url = null;

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

  var inputCls = "w-full px-4 py-2.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition bg-white";

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Ачааллаж байна...</div>;
  }
  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600 text-sm">Тэтгэлэг олдсонгүй.</p>
        <Link to="/scholarship" className="px-5 py-2.5 bg-[#1e3a8a] text-white rounded text-sm font-semibold hover:bg-[#1e40af] transition">← Жагсаалт руу буцах</Link>
      </div>
    );
  }

  // Determine which logo source will be used for preview
  var logoSource = "fallback";
  if (form.image_url) logoSource = "custom";
  else if (form.website_url) logoSource = "clearbit";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/scholarship" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900">CareerPrep</span>
          </Link>
          <Link to="/scholarship" className="text-sm text-slate-600 hover:text-slate-900 font-medium">← Буцах</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
            <span className="mx-2">/</span>
            <Link to="/scholarship" className="hover:text-slate-900">Тэтгэлэг</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">{isEdit ? "Засах" : "Шинээр нэмэх"}</span>
          </div>
          {isEdit && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">Засварлах горим</span>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6 pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? "Тэтгэлэг засах" : "Тэтгэлэг / Internship нэмэх"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isEdit ? "Мэдээллийг шинэчилнэ үү." : "Мэдээллийг бүрэн оруулна уу."}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Нэр <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={function (e) { upd("name", e.target.value); }} placeholder="Жишээ: MCS Internship 2026" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Байгууллага <span className="text-red-500">*</span></label>
                <input value={form.organization} onChange={function (e) { upd("organization", e.target.value); }} placeholder="MCS Group" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Төрөл</label>
                <select value={form.target} onChange={function (e) { upd("target", e.target.value); }} className={inputCls}>
                  <option value="Бакалавр">Бакалавр</option>
                  <option value="Магистр">Магистр</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Дэлгэрэнгүй тайлбар</label>
              <textarea value={form.description} onChange={function (e) { upd("description", e.target.value); }} placeholder="Хөтөлбөрийн тухай дэлгэрэнгүй мэдээлэл..." rows={4} className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Шаардлага</label>
                <input value={form.requirements} onChange={function (e) { upd("requirements", e.target.value); }} placeholder="3,4-р курс, GPA 2.8+" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Голч дүн (GPA)</label>
                <input value={form.gpa} onChange={function (e) { upd("gpa", e.target.value); }} placeholder="2.8+" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Хугацаа (Deadline)</label>
                <input type="date" value={form.deadline} onChange={function (e) { upd("deadline", e.target.value); }} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Дадлагын хугацаа</label>
                <input value={form.duration} onChange={function (e) { upd("duration", e.target.value); }} placeholder="2026.06.02-08.31" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Бүртгүүлэх линк</label>
              <input value={form.website_url} onChange={function (e) { upd("website_url", e.target.value); }} placeholder="https://careers.mcs.mn/" className={inputCls} />
              <p className="text-xs text-slate-500 mt-1">
                Энэ линкээс байгууллагын лого автоматаар татагдах боломжтой.
              </p>
            </div>

            {/* Logo section */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">Байгууллагын лого</label>
                <span className={"text-xs px-2 py-0.5 rounded font-medium border " +
                  (logoSource === "custom" ? "bg-[#1e3a8a]/5 text-[#1e3a8a] border-[#1e3a8a]/20" :
                   logoSource === "clearbit" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                   "bg-slate-50 text-slate-600 border-slate-200")}>
                  {logoSource === "custom" ? "Гараар оруулсан" :
                   logoSource === "clearbit" ? "Автомат (Clearbit)" :
                   "Эхний үсэг"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2">
                  <input
                    value={form.image_url}
                    onChange={function (e) { upd("image_url", e.target.value); }}
                    placeholder="https://example.com/logo.png"
                    className={inputCls}
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Хоосон үлдээвэл бүртгүүлэх линкээс <span className="font-semibold">Clearbit</span>-ээр автоматаар татна. Хэрэв Clearbit олохгүй бол байгууллагын нэрний эхний үсэг харагдана.
                  </p>
                </div>

                {/* Live preview */}
                <div className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col items-center gap-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Урьдчилж харах</p>
                  <OrgLogo
                    key={form.image_url + "_" + form.website_url + "_" + form.organization}
                    name={form.organization || form.name || "?"}
                    imageUrl={form.image_url}
                    websiteUrl={form.website_url}
                    size="lg"
                  />
                  <p className="text-xs text-slate-600 font-medium text-center line-clamp-1">{form.organization || "Байгууллагын нэр"}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-5 border-t border-slate-200">
              <Link to="/scholarship" className="px-5 py-2.5 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Цуцлах</Link>
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#1e3a8a] text-white rounded text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-50 transition">
                {saving ? "Хадгалж байна..." : (isEdit ? "Шинэчлэлт хадгалах" : "Хадгалах")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}