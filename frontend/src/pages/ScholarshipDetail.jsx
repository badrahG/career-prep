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
          <div className="text-gray-400 dark:text-gray-500 text-sm">Ачааллаж байна...</div>
        </div>
      </Layout>
    );
  }
  if (notFound || !item) {
    return (
      <Layout>
        <div className="p-5 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Тэтгэлэг олдсонгүй.</p>
          <Link to="/scholarship" className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition">← Жагсаалт руу буцах</Link>
        </div>
      </Layout>
    );
  }

  var days = daysLeft(item.deadline);
  var isExpired = days?.expired || false;
  var doneCount = checklist.filter(function (c) { return c.done; }).length;
  var checklistProgress = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0;

  var STEPS = [
    { num: 1, title: "Шаардлага шалгах", desc: "Дээрх шаардлагыг хангаж байгаа эсэхээ нягтлана уу." },
    { num: 2, title: "Баримт бичиг бэлдэх", desc: "CV, тодорхойлолт, голч дүнгийн хуулбар болон шаардагдах баримтуудыг бэлдэнэ." },
    { num: 3, title: "Маягт бөглөх", desc: "Албан ёсны сайт дээр бүртгэлийн маягтыг бөглөнө." },
    { num: 4, title: "Илгээх, хянах", desc: "Deadline-аас өмнө илгээж, и-мэйлээ шалгаж байгаарай." },
  ];

  var INFO_ROWS = [
    { label: "Байгууллага", value: item.organization },
    { label: "Төрөл", value: item.target },
    { label: "Хугацаа", value: item.duration },
    { label: "Эцсийн хугацаа", value: item.deadline },
  ].filter(function (r) { return r.value; });

  return (
    <Layout>
      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden" style={{ background: isExpired ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)" : "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #4338ca 100%)" }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 10% 90%, white 0%, transparent 55%), radial-gradient(circle at 90% 10%, white 0%, transparent 55%)" }} />
        <div className="relative px-5 pt-5 pb-7 md:px-8 md:pt-6 md:pb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-white/50 mb-5">
            <Link to="/scholarship" className="hover:text-white/80 transition">Тэтгэлэг</Link>
            <span>/</span>
            <span className="text-white/75 truncate max-w-[200px]">{item.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Logo */}
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl shadow-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
              <OrgLogo name={item.organization || item.name} imageUrl={item.image_url} websiteUrl={item.website_url} size="lg" />
            </div>

            {/* Title block */}
            <div className="flex-1 min-w-0">
              {item.target && (
                <span className="inline-block text-[11px] bg-white/15 text-white/90 px-2.5 py-0.5 rounded-full font-medium mb-2 tracking-wide">
                  {item.target}
                </span>
              )}
              <h1 className="text-xl md:text-2xl font-bold text-white leading-snug">{item.name}</h1>
              {item.organization && <p className="text-white/65 text-sm mt-1">{item.organization}</p>}
            </div>

            {/* Deadline badge */}
            {days && (
              <div className={"flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold border " +
                (days.color === "red" ? "bg-red-500/25 border-red-400/30 text-red-100" :
                 days.color === "amber" ? "bg-amber-400/25 border-amber-300/30 text-amber-100" :
                 "bg-emerald-500/25 border-emerald-400/30 text-emerald-100")}>
                <p>{days.text}</p>
                {item.deadline && <p className="text-white/45 text-xs font-normal mt-0.5">{item.deadline}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 py-5 md:px-6 md:py-6 pb-24 sm:pb-6">
        {/* Quick chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {item.target && (
            <span className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-800 px-3 py-1 rounded-full font-medium">
              {item.target}
            </span>
          )}
          {item.deadline && (
            <span className={"text-xs px-3 py-1 rounded-full font-medium border " +
              (isExpired
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600")}>
              {item.deadline}
            </span>
          )}
          {item.duration && (
            <span className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-full font-medium">
              {item.duration}
            </span>
          )}
          {item.gpa && (
            <span className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-full font-medium">
              GPA {item.gpa}+
            </span>
          )}
        </div>

        {/* Desktop apply + admin buttons */}
        <div className="hidden sm:flex flex-wrap gap-2 mb-5">
          {item.website_url && !isExpired && (
            <a href={item.website_url} target="_blank" rel="noreferrer"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition">
              Бүртгүүлэх →
            </a>
          )}
          {item.website_url && isExpired && (
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 px-6 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed">
              Хугацаа дууссан
            </span>
          )}
          {isAdmin && (
            <>
              <Link to={"/scholarship/" + id + "/edit"}
                className="border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Засах
              </Link>
              <button onClick={handleDelete}
                className="border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                Устгах
              </button>
            </>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left column — shows second on mobile ── */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">

            {/* Description */}
            {item.description && (
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">Тайлбар</h2>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{item.description}</p>
                </div>
              </div>
            )}

            {/* Requirements */}
            {(item.requirements || item.gpa) && (
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">Шаардлага</h2>
                </div>
                <div className="p-5 space-y-3">
                  {item.requirements && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl p-4">
                      <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Ерөнхий шаардлага</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.requirements}</p>
                    </div>
                  )}
                  {item.gpa && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl p-4">
                      <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Голч дүн (GPA)</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.gpa}+</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Steps — vertical timeline */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">Бүртгүүлэх алхмууд</h2>
              </div>
              <div className="p-5">
                {STEPS.map(function (step, idx) {
                  var isLast = idx === STEPS.length - 1;
                  return (
                    <div key={step.num} className="flex gap-3">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">
                          {step.num}
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-gray-100 dark:bg-gray-700 my-1.5" />}
                      </div>
                      <div className={"flex-1 " + (isLast ? "" : "pb-5")}>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-none mt-1">{step.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-3">Нийтлэг алдаа</h3>
              <ul className="space-y-2">
                {[
                  "Deadline-ыг хойшлуулах — хэдэн өдөр өмнө илгээгээрэй.",
                  "Бичиг баримтын хуулбар муу чанартай байх.",
                  "Мотивацын захидлыг сүүлийн мөчид бичих.",
                  "И-мэйл хаягаа шалгахгүй байх.",
                ].map(function (m, i) {
                  return (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                      <span>{m}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* ── Right column — shows first on mobile ── */}
          <div className="space-y-4 order-1 lg:order-2">

            {/* Checklist */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">Бэлдэх жагсаалт</h2>
                  {!checklistLoading && (
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{doneCount}/{checklist.length}</span>
                  )}
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: checklistProgress + "%" }} />
                </div>
                {!user && (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">Хадгалахын тулд нэвтэрнэ үү.</p>
                )}
              </div>
              <div className="p-3">
                {checklist.map(function (c, i) {
                  return (
                    <label key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition">
                      <input type="checkbox" checked={c.done} onChange={function () { toggleItem(i); }}
                        className="w-4 h-4 accent-violet-600 cursor-pointer flex-shrink-0" />
                      <span className={"text-sm " + (c.done ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-700 dark:text-gray-300")}>
                        {c.label}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button onClick={resetChecklist} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  Шинэчлэх
                </button>
              </div>
            </div>

            {/* Info card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">Мэдээлэл</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {INFO_ROWS.map(function (row) {
                  return (
                    <div key={row.label} className="px-5 py-3.5">
                      <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{row.label}</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{row.value}</p>
                    </div>
                  );
                })}
                {item.website_url && (
                  <div className="px-5 py-3.5">
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Линк</p>
                    <a href={item.website_url} target="_blank" rel="noreferrer"
                      className="text-xs text-violet-600 hover:underline break-all">
                      {item.website_url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Admin buttons */}
            {isAdmin && (
              <div className="flex gap-2">
                <Link to={"/scholarship/" + id + "/edit"}
                  className="flex-1 text-center border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Засах
                </Link>
                <button onClick={handleDelete}
                  className="flex-1 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  Устгах
                </button>
              </div>
            )}

            <Link to="/scholarship" className="block text-center text-sm text-violet-600 hover:underline font-medium">
              ← Бүх тэтгэлгийг харах
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky apply button ── */}
      {item.website_url && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700">
          {isExpired ? (
            <div className="w-full text-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 py-3 rounded-xl text-sm font-semibold">
              Хугацаа дууссан
            </div>
          ) : (
            <a href={item.website_url} target="_blank" rel="noreferrer"
              className="block w-full text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl text-sm font-semibold active:opacity-90 transition">
              Бүртгүүлэх →
            </a>
          )}
        </div>
      )}
    </Layout>
  );
}
