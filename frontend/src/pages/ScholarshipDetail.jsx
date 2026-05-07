import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import OrgLogo from "../components/OrgLogo";
import Layout from "../components/Layout";

export default function ScholarshipDetail() {
  var params = useParams();
  var id = params.id;
  var { user } = useAuth();
  var isAdmin = user?.role === "admin";

  var [item, setItem] = useState(null);
  var [loading, setLoading] = useState(true);
  var [notFound, setNotFound] = useState(false);
  var [checklist, setChecklist] = useState([]);
  var [checklistLoading, setChecklistLoading] = useState(false);

  useEffect(function () {
    API.get("/scholarship/" + id)
      .then(function (res) { setItem(res.data); })
      .catch(function () { setNotFound(true); })
      .finally(function () { setLoading(false); });
  }, [id]);

  useEffect(function () {
    if (!id || !user) { setChecklist(getDefaultChecklist()); return; }
    setChecklistLoading(true);
    API.get("/scholarship/" + id + "/checklist")
      .then(function (res) { setChecklist(res.data.items || getDefaultChecklist()); })
      .catch(function () { setChecklist(getDefaultChecklist()); })
      .finally(function () { setChecklistLoading(false); });
  }, [id, user?.id]);

  function getDefaultChecklist() {
    return [
      { label: "Голч дүнгээ шалгах", done: false },
      { label: "CV бэлтгэх, засварлах", done: false },
      { label: "Тодорхойлолт, бичиг баримт бэлдэх", done: false },
      { label: "Мотивацын захидал бичих", done: false },
      { label: "Deadline-ыг календарт тэмдэглэх", done: false },
      { label: "Онлайн бүртгэлийн маягт бөглөх", done: false },
    ];
  }

  function saveChecklist(items) {
    if (!user) return;
    API.put("/scholarship/" + id + "/checklist", { items: items }).catch(function () {});
  }

  function toggleItem(i) {
    var updated = checklist.map(function (c, idx) { return idx === i ? { ...c, done: !c.done } : c; });
    setChecklist(updated);
    saveChecklist(updated);
  }

  function resetChecklist() {
    if (!window.confirm("Checklist-ыг анх байсан хэвийн байдалд нь оруулах уу?")) return;
    var defaults = getDefaultChecklist();
    setChecklist(defaults);
    saveChecklist(defaults);
    toast.success("Checklist шинэчлэгдлээ");
  }

  async function handleDelete() {
    if (!window.confirm("Энэ тэтгэлгийн мэдээллийг устгах уу?")) return;
    try {
      await API.delete("/scholarship/" + id);
      toast.success("Устгагдлаа");
      window.location.href = "/scholarship";
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа гарлаа");
    }
  }

  function daysLeft(deadline) {
    if (!deadline) return null;
    var diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: "Хугацаа дууссан", color: "red", expired: true };
    if (diff === 0) return { text: "Өнөөдөр дуусна", color: "red", expired: false };
    if (diff <= 7) return { text: diff + " хоног үлдсэн", color: "amber", expired: false };
    return { text: diff + " хоног үлдсэн", color: "emerald", expired: false };
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-5 md:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-400 text-sm">Ачааллаж байна...</div>
        </div>
      </Layout>
    );
  }
  if (notFound || !item) {
    return (
      <Layout>
        <div className="p-5 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-gray-500 text-sm">Тэтгэлэг олдсонгүй.</p>
          <Link to="/scholarship" className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition">← Жагсаалт руу буцах</Link>
        </div>
      </Layout>
    );
  }

  var days = daysLeft(item.deadline);
  var doneCount = checklist.filter(function (c) { return c.done; }).length;
  var checklistProgress = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0;

  return (
    <Layout>
      <div className="p-5 md:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
          <Link to="/scholarship" className="hover:text-violet-600 transition">Тэтгэлэг</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate">{item.name}</span>
        </div>

        {/* Hero card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-5">
          <div className={"h-1 " + (days && days.expired ? "bg-gray-300" : "bg-gradient-to-r from-violet-600 to-indigo-600")} />
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-5">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <OrgLogo name={item.organization || item.name} imageUrl={item.image_url} websiteUrl={item.website_url} size="lg" />
                <div className="flex-1 min-w-0">
                  {item.target && (
                    <span className="inline-block text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-lg font-medium mb-2">
                      {item.target}
                    </span>
                  )}
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">{item.name}</h1>
                  <p className="text-sm text-violet-600 font-semibold mt-1">{item.organization}</p>
                </div>
              </div>
              {days && (
                <div className={"text-right rounded-xl border px-4 py-3 flex-shrink-0 " +
                  (days.color === "red" ? "bg-red-50 border-red-200" :
                   days.color === "amber" ? "bg-amber-50 border-amber-200" :
                   "bg-emerald-50 border-emerald-200")}>
                  <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">Хугацаа</p>
                  <p className={"text-base font-bold mt-0.5 " +
                    (days.color === "red" ? "text-red-700" : days.color === "amber" ? "text-amber-700" : "text-emerald-700")}>
                    {days.text}
                  </p>
                  {item.deadline && <p className="text-xs text-gray-400 mt-0.5">{item.deadline}</p>}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {item.website_url && !days?.expired && (
                <a href={item.website_url} target="_blank" rel="noreferrer"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition inline-flex items-center gap-2">
                  Албан ёсны сайтаар бүртгүүлэх →
                </a>
              )}
              {item.website_url && days?.expired && (
                <span className="bg-gray-100 text-gray-400 px-6 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed">Хугацаа дууссан</span>
              )}
              {isAdmin && (
                <>
                  <Link to={"/scholarship/" + id + "/edit"} className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Засах</Link>
                  <button onClick={handleDelete} className="border border-red-200 text-red-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition">Устгах</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-4">
            {item.description && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-800">Тайлбар</h2>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>
                </div>
              </div>
            )}

            {(item.requirements || item.gpa) && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-800">Шаардлага</h2>
                </div>
                <div className="p-5 space-y-3">
                  {item.requirements && (
                    <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <span className="text-violet-600 font-bold text-sm mt-0.5">›</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Ерөнхий шаардлага</p>
                        <p className="text-sm text-gray-700">{item.requirements}</p>
                      </div>
                    </div>
                  )}
                  {item.gpa && (
                    <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <span className="text-violet-600 font-bold text-sm mt-0.5">›</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Голч дүн (GPA)</p>
                        <p className="text-sm text-gray-700 font-semibold">{item.gpa}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Бүртгүүлэх заавар</h2>
                <p className="text-xs text-gray-400 mt-0.5">Ерөнхий алхам дараалал.</p>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { num: 1, title: "Шаардлага шалгах", desc: "Дээрх шаардлагыг хангаж байгаа эсэхээ нягтлана уу." },
                  { num: 2, title: "Баримт бичиг бэлдэх", desc: "CV, тодорхойлолт, голч дүнгийн хуулбар болон шаардагдах баримтуудыг бэлдэнэ." },
                  { num: 3, title: "Маягт бөглөх", desc: "Албан ёсны сайт дээр бүртгэлийн маягтыг бөглөнө." },
                  { num: 4, title: "Илгээх, хянах", desc: "Deadline-аас өмнө илгээж, и-мэйлээ шалгаж байгаарай." },
                ].map(function (step) {
                  return (
                    <div key={step.num} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-violet-50 border border-violet-100 text-violet-600 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {step.num}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-amber-900 mb-2">⚠ Нийтлэг алдаа</h3>
              <ul className="space-y-1.5">
                {[
                  "Deadline-ыг хойшлуулах — хугацаа дуусахаас хэдэн өдөр өмнө илгээгээрэй.",
                  "Бичиг баримтын хуулбар муу чанартай байх.",
                  "Мотивацын захидлыг сүүлийн мөчид бичих.",
                  "И-мэйл хаягаа шалгахгүй байх.",
                ].map(function (m, i) {
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs text-amber-900">
                      <span>•</span><span>{m}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Мэдээлэл</h2>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Байгууллага</p>
                  <p className="text-gray-800">{item.organization || "—"}</p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Төрөл</p>
                  <p className="text-gray-800">{item.target || "—"}</p>
                </div>
                {item.duration && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Хугацаа</p>
                    <p className="text-gray-800">{item.duration}</p>
                  </div>
                )}
                {item.deadline && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Эцсийн хугацаа</p>
                    <p className="text-gray-800">{item.deadline}</p>
                  </div>
                )}
                {item.website_url && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Линк</p>
                    <a href={item.website_url} target="_blank" rel="noreferrer" className="text-xs text-violet-600 hover:underline break-all">{item.website_url}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-800">Миний checklist</h2>
                  {!checklistLoading && <span className="text-xs text-violet-600 font-semibold">{doneCount}/{checklist.length}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{user ? "Бэлдэх алхмуудаа тэмдэглэнэ үү." : "Checklist хадгалахын тулд нэвтэрнэ үү."}</p>
              </div>
              <div className="px-5 pt-4">
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full h-1.5 transition-all duration-300" style={{ width: checklistProgress + "%" }} />
                </div>
              </div>
              <div className="p-3">
                {checklist.map(function (c, i) {
                  return (
                    <label key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                      <input type="checkbox" checked={c.done} onChange={function () { toggleItem(i); }}
                        className="mt-0.5 w-4 h-4 accent-violet-600 cursor-pointer flex-shrink-0" />
                      <span className={"text-sm flex-1 " + (c.done ? "text-gray-400 line-through" : "text-gray-700")}>{c.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                <button onClick={resetChecklist} className="text-xs text-gray-400 hover:text-gray-700 font-medium">Шинэчлэх</button>
              </div>
            </div>

            <Link to="/scholarship" className="block text-center text-sm text-violet-600 hover:underline font-medium">
              ← Бүх тэтгэлгийг харах
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
