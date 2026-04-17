import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import OrgLogo from "../components/OrgLogo";

export default function ScholarshipDetail() {
  var params = useParams();
  var id = params.id;
  var { user } = useAuth();
  var isAdmin = user?.role === "admin";

  var [item, setItem] = useState(null);
  var [loading, setLoading] = useState(true);
  var [notFound, setNotFound] = useState(false);

  // Checklist state — stored in localStorage per scholarship
  var [checklist, setChecklist] = useState([]);

  useEffect(function () {
    API.get("/scholarship/" + id)
      .then(function (res) { setItem(res.data); })
      .catch(function () { setNotFound(true); })
      .finally(function () { setLoading(false); });
  }, [id]);

  useEffect(function () {
    // Load checklist from localStorage
    if (!id) return;
    var saved = localStorage.getItem("checklist_" + id);
    if (saved) {
      try { setChecklist(JSON.parse(saved)); } catch (e) { setChecklist(getDefaultChecklist()); }
    } else {
      setChecklist(getDefaultChecklist());
    }
  }, [id]);

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

  function toggleItem(i) {
    var updated = checklist.map(function (c, idx) {
      return idx === i ? { ...c, done: !c.done } : c;
    });
    setChecklist(updated);
    localStorage.setItem("checklist_" + id, JSON.stringify(updated));
  }

  function resetChecklist() {
    if (!window.confirm("Checklist-ыг анх байсан хэвийн байдалд нь оруулах уу?")) return;
    var defaults = getDefaultChecklist();
    setChecklist(defaults);
    localStorage.setItem("checklist_" + id, JSON.stringify(defaults));
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
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Ачааллаж байна...</div>;
  }
  if (notFound || !item) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600 text-sm">Тэтгэлэг олдсонгүй.</p>
        <Link to="/scholarship" className="px-5 py-2.5 bg-[#1e3a8a] text-white rounded text-sm font-semibold hover:bg-[#1e40af] transition">← Жагсаалт руу буцах</Link>
      </div>
    );
  }

  var days = daysLeft(item.deadline);
  var doneCount = checklist.filter(function (c) { return c.done; }).length;
  var checklistProgress = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
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
            <Link to="/cv" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">CV</Link>
            <Link to="/interview" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Ярилцлага</Link>
            <Link to="/scholarship" className="px-3 py-2 text-slate-900 font-medium border-b-2 border-[#1e3a8a]">Тэтгэлэг</Link>
          </div>
          <Link to="/scholarship" className="text-sm text-slate-600 hover:text-slate-900 font-medium">← Буцах</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
          <span className="mx-2">/</span>
          <Link to="/scholarship" className="hover:text-slate-900">Тэтгэлэг</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium truncate">{item.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Hero card */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className={"h-1 " + (days && days.expired ? "bg-slate-300" : "bg-[#1e3a8a]")}></div>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-5">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <OrgLogo
                  name={item.organization || item.name}
                  imageUrl={item.image_url}
                  websiteUrl={item.website_url}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  {item.target && (
                    <span className="inline-block text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 px-2 py-0.5 rounded font-medium mb-2">
                      {item.target}
                    </span>
                  )}
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{item.name}</h1>
                  <p className="text-base text-[#1e3a8a] font-semibold mt-1">{item.organization}</p>
                </div>
              </div>

              {days && (
                <div className={"text-right rounded border px-4 py-3 flex-shrink-0 " +
                  (days.color === "red" ? "bg-red-50 border-red-200" :
                   days.color === "amber" ? "bg-amber-50 border-amber-200" :
                   "bg-emerald-50 border-emerald-200")}>
                  <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Хугацаа</p>
                  <p className={"text-base font-bold mt-0.5 " +
                    (days.color === "red" ? "text-red-700" :
                     days.color === "amber" ? "text-amber-700" :
                     "text-emerald-700")}>
                    {days.text}
                  </p>
                  {item.deadline && <p className="text-xs text-slate-500 mt-0.5">{item.deadline}</p>}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              {item.website_url && !days?.expired && (
                <a
                  href={item.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#1e3a8a] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition inline-flex items-center gap-2"
                >
                  Албан ёсны сайтаар бүртгүүлэх →
                </a>
              )}
              {item.website_url && days?.expired && (
                <span className="bg-slate-100 text-slate-500 px-6 py-2.5 rounded text-sm font-semibold cursor-not-allowed">
                  Хугацаа дууссан
                </span>
              )}
              {isAdmin && (
                <>
                  <Link
                    to={"/scholarship/" + id + "/edit"}
                    className="border border-slate-300 text-slate-700 px-5 py-2.5 rounded text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    Засах
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="border border-red-300 text-red-600 px-5 py-2.5 rounded text-sm font-semibold hover:bg-red-50 transition"
                  >
                    Устгах
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: main info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            {item.description && (
              <div className="bg-white border border-slate-200 rounded">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-base font-semibold text-slate-900">Тайлбар</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{item.description}</p>
                </div>
              </div>
            )}

            {/* Requirements */}
            {(item.requirements || item.gpa) && (
              <div className="bg-white border border-slate-200 rounded">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-base font-semibold text-slate-900">Шаардлага</h2>
                </div>
                <div className="p-6 space-y-3">
                  {item.requirements && (
                    <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded p-3">
                      <span className="text-[#1e3a8a] font-bold text-sm mt-0.5">›</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Ерөнхий шаардлага</p>
                        <p className="text-sm text-slate-700">{item.requirements}</p>
                      </div>
                    </div>
                  )}
                  {item.gpa && (
                    <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded p-3">
                      <span className="text-[#1e3a8a] font-bold text-sm mt-0.5">›</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Голч дүн (GPA)</p>
                        <p className="text-sm text-slate-700 font-semibold">{item.gpa}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bureaucracy guide */}
            <div className="bg-white border border-slate-200 rounded">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-900">Бүртгүүлэх заавар</h2>
                <p className="text-xs text-slate-500 mt-0.5">Ерөнхий алхам дараалал.</p>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { num: 1, title: "Шаардлага шалгах", desc: "Дээрх шаардлагыг хангаж байгаа эсэхээ нягтлана уу." },
                  { num: 2, title: "Баримт бичиг бэлдэх", desc: "CV, тодорхойлолт, голч дүнгийн хуулбар болон шаардагдах баримтуудыг бэлдэнэ." },
                  { num: 3, title: "Маягт бөглөх", desc: "Албан ёсны сайт дээр бүртгэлийн маягтыг бөглөнө." },
                  { num: 4, title: "Илгээх, хянах", desc: "Deadline-аас өмнө илгээж, и-мэйлээ шалгаж байгаарай." },
                ].map(function (step) {
                  return (
                    <div key={step.num} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 text-[#1e3a8a] rounded flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {step.num}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Common mistakes */}
            <div className="bg-amber-50 border border-amber-200 rounded p-5">
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
                      <span>•</span>
                      <span>{m}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Right column: meta + checklist */}
          <div className="space-y-6">
            {/* Meta info */}
            <div className="bg-white border border-slate-200 rounded">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-900">Мэдээлэл</h2>
              </div>
              <div className="p-6 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Байгууллага</p>
                  <p className="text-slate-900">{item.organization || "—"}</p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Төрөл</p>
                  <p className="text-slate-900">{item.target || "—"}</p>
                </div>
                {item.duration && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Хугацаа</p>
                    <p className="text-slate-900">{item.duration}</p>
                  </div>
                )}
                {item.deadline && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Эцсийн хугацаа</p>
                    <p className="text-slate-900">{item.deadline}</p>
                  </div>
                )}
                {item.website_url && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Линк</p>
                    <a
                      href={item.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#1e3a8a] hover:underline break-all"
                    >
                      {item.website_url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white border border-slate-200 rounded">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Миний checklist</h2>
                  <span className="text-xs text-[#1e3a8a] font-semibold">{doneCount}/{checklist.length}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Бэлдэх алхмуудаа тэмдэглэнэ үү.</p>
              </div>
              <div className="px-6 pt-4">
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-[#1e3a8a] rounded-full h-1.5 transition-all duration-300"
                    style={{ width: checklistProgress + "%" }}
                  ></div>
                </div>
              </div>
              <div className="p-3">
                {checklist.map(function (c, i) {
                  return (
                    <label
                      key={i}
                      className="flex items-start gap-3 p-3 rounded hover:bg-slate-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={c.done}
                        onChange={function () { toggleItem(i); }}
                        className="mt-0.5 w-4 h-4 accent-[#1e3a8a] cursor-pointer flex-shrink-0"
                      />
                      <span className={"text-sm flex-1 " + (c.done ? "text-slate-400 line-through" : "text-slate-700")}>
                        {c.label}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="px-6 py-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={resetChecklist}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium"
                >
                  Шинэчлэх
                </button>
              </div>
            </div>

            {/* Share / back */}
            <Link to="/scholarship" className="block text-center text-sm text-[#1e3a8a] hover:underline font-medium">
              ← Бүх тэтгэлгийг харах
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}