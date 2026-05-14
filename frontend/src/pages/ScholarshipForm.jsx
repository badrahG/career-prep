import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import OrgLogo from "../components/OrgLogo";
import Layout from "../components/Layout";

export default function ScholarshipForm() {
  var navigate = useNavigate();
  var params = useParams();
  var editId = params.id;
  var isEdit = Boolean(editId);

  var [saving, setSaving] = useState(false);
  var [loading, setLoading] = useState(isEdit);
  var [notFound, setNotFound] = useState(false);
  var [form, setForm] = useState({
    name: "", organization: "", target: "Бакалавр", requirements: "",
    deadline: "", website_url: "", description: "", gpa: "", duration: "", image_url: "",
  });

  useEffect(function () {
    if (!isEdit) return;
    API.get("/scholarship/" + editId)
      .then(function (res) {
        var s = res.data;
        setForm({
          name: s.name || "", organization: s.organization || "", target: s.target || "Бакалавр",
          requirements: s.requirements || "", deadline: s.deadline || "", website_url: s.website_url || "",
          description: s.description || "", gpa: s.gpa || "", duration: s.duration || "", image_url: s.image_url || "",
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

  var inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  var labelCls = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

  if (loading) {
    return <Layout><div className="p-5 md:p-6 flex items-center justify-center min-h-[60vh]"><div className="text-gray-400 dark:text-gray-500 text-sm">Ачааллаж байна...</div></div></Layout>;
  }
  if (notFound) {
    return <Layout><div className="p-5 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4"><p className="text-gray-500 dark:text-gray-400 text-sm">Тэтгэлэг олдсонгүй.</p><Link to="/scholarship" className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition">← Жагсаалт руу буцах</Link></div></Layout>;
  }

  var logoSource = "fallback";
  if (form.image_url) logoSource = "custom";
  else if (form.website_url) logoSource = "clearbit";

  return (
    <Layout>
      <div className="p-5 md:p-6 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-5">
          <Link to="/scholarship" className="hover:text-violet-600 transition">Тэтгэлэг</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 font-medium">{isEdit ? "Засах" : "Шинээр нэмэх"}</span>
          {isEdit && <span className="ml-auto text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-lg font-medium">Засварлах горим</span>}
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
            {isEdit ? "Мэдээллийг шинэчилнэ үү." : "Мэдээллийг бүрэн оруулна уу."}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className={labelCls}>Нэр <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={function (e) { upd("name", e.target.value); }} placeholder="Жишээ: MCS Internship 2026" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Байгууллага <span className="text-red-500">*</span></label>
                <input value={form.organization} onChange={function (e) { upd("organization", e.target.value); }} placeholder="MCS Group" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Төрөл</label>
                <select value={form.target} onChange={function (e) { upd("target", e.target.value); }} className={inputCls}>
                  <option value="Бакалавр">Бакалавр</option>
                  <option value="Магистр">Магистр</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Дэлгэрэнгүй тайлбар</label>
              <textarea value={form.description} onChange={function (e) { upd("description", e.target.value); }} placeholder="Хөтөлбөрийн тухай дэлгэрэнгүй мэдээлэл..." rows={4} className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Шаардлага</label>
                <input value={form.requirements} onChange={function (e) { upd("requirements", e.target.value); }} placeholder="3,4-р курс, GPA 2.8+" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Голч дүн (GPA)</label>
                <input value={form.gpa} onChange={function (e) { upd("gpa", e.target.value); }} placeholder="2.8+" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Хугацаа (Deadline)</label>
                <input type="date" value={form.deadline} onChange={function (e) { upd("deadline", e.target.value); }} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Дадлагын хугацаа</label>
                <input value={form.duration} onChange={function (e) { upd("duration", e.target.value); }} placeholder="2026.06.02-08.31" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Бүртгүүлэх линк</label>
              <input value={form.website_url} onChange={function (e) { upd("website_url", e.target.value); }} placeholder="https://careers.mcs.mn/" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">Энэ линкээс байгууллагын лого автоматаар татагдах боломжтой.</p>
            </div>

            {/* Logo section */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls} style={{ marginBottom: 0 }}>Байгууллагын лого</label>
                <span className={"text-xs px-2 py-0.5 rounded-lg font-medium border " +
                  (logoSource === "custom" ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-800" :
                   logoSource === "clearbit" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" :
                   "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600")}>
                  {logoSource === "custom" ? "Гараар оруулсан" : logoSource === "clearbit" ? "Автомат (Clearbit)" : "Эхний үсэг"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mt-2">
                <div className="md:col-span-2">
                  <input value={form.image_url} onChange={function (e) { upd("image_url", e.target.value); }} placeholder="https://example.com/logo.png" className={inputCls} />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Хоосон үлдээвэл бүртгүүлэх линкээс <span className="font-semibold">Clearbit</span>-ээр автоматаар татна.</p>
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
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium text-center line-clamp-1">{form.organization || "Байгууллагын нэр"}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-5 border-t border-gray-100 dark:border-gray-700">
              <Link to="/scholarship" className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Цуцлах</Link>
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md disabled:opacity-50 transition">
                {saving ? "Хадгалж байна..." : (isEdit ? "Шинэчлэлт хадгалах" : "Хадгалах")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
