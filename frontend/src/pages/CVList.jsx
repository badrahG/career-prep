import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { CardSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import CVPreview from "../components/CVPreview";

var TEMPLATE_LABELS = { modern: "Modern", classic: "Classic", minimal: "Minimal" };

export default function CVList() {
  var [cvs, setCvs] = useState([]);
  var [loading, setLoading] = useState(true);
  var [previewCv, setPreviewCv] = useState(null);
  var [previewLoading, setPreviewLoading] = useState(false);

  useEffect(function () {
    API.get("/cv")
      .then(function (res) { setCvs(res.data); })
      .catch(function () { toast.error("Ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }, []);

  async function handleDelete(cv) {
    if (!window.confirm('"' + cv.name + '" CV-г устгах уу?')) return;
    try {
      await API.delete("/cv/" + cv.id);
      toast.success("Устгагдлаа");
      setCvs(cvs.filter(function (x) { return x.id !== cv.id; }));
    } catch {
      toast.error("Алдаа гарлаа");
    }
  }

  function openPreview(cv) {
    setPreviewLoading(true);
    setPreviewCv({ ...cv, _loading: true });
    API.get("/cv/" + cv.id)
      .then(function (res) { setPreviewCv(res.data); })
      .catch(function () { toast.error("CV ачаалахад алдаа"); setPreviewCv(null); })
      .finally(function () { setPreviewLoading(false); });
  }

  function closePreview() { setPreviewCv(null); }

  var previewInfo = {};
  if (previewCv && !previewCv._loading) {
    try { previewInfo = previewCv.personal_info ? JSON.parse(previewCv.personal_info) : {}; } catch { previewInfo = {}; }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl" />
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900">CareerPrep</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <Link to="/dashboard" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Нүүр</Link>
            <Link to="/cv" className="px-3 py-2 text-slate-900 font-medium border-b-2 border-[#1e3a8a]">CV</Link>
            <Link to="/interview" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Ярилцлага</Link>
            <Link to="/advice" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Зөвлөмж</Link>
            <Link to="/scholarship" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Тэтгэлэг</Link>
          </div>
          <Link to="/cv/new" className="bg-[#1e3a8a] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#1e40af] transition">
            + Шинэ CV
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">Миний CV</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-6 pb-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-1">CV цуглуулга</p>
            <h1 className="text-2xl font-bold text-slate-900">Миний CV</h1>
            <p className="text-sm text-slate-600 mt-1">
              {loading ? "Ачааллаж байна..." : cvs.length + " CV үүсгэсэн"}
            </p>
          </div>
          <Link to="/cv/new" className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition whitespace-nowrap">
            + Шинэ CV
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : cvs.length === 0 ? (
          <EmptyState
            illustration="cv"
            title="CV үүсгээгүй байна"
            description="Эхний CV-гээ үүсгэж, ажилд орох бэлтгэлээ эхлүүлцгээе."
            actionLabel="Шинэ CV үүсгэх"
            actionLink="/cv/new"
            secondaryLabel="Зөвлөмж унших"
            secondaryLink="/advice/cv"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cvs.map(function (cv) {
              return (
                <div key={cv.id} className="bg-white border border-slate-200 rounded-lg hover:border-[#1e3a8a]/40 hover:shadow-md transition group overflow-hidden">
                  {/* Template color strip */}
                  <div className={"h-1.5 " + (cv.template_type === "classic" ? "bg-gradient-to-r from-slate-600 to-slate-800" : cv.template_type === "minimal" ? "bg-gradient-to-r from-slate-300 to-slate-400" : "bg-gradient-to-r from-[#1e3a8a] to-[#1e40af]")} />

                  <Link to={"/cv/" + cv.id} className="block p-5 pb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 bg-[#1e3a8a]/8 border border-[#1e3a8a]/15 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-[#1e3a8a] font-bold text-xs">CV</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate group-hover:text-[#1e3a8a] transition">{cv.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {TEMPLATE_LABELS[cv.template_type] || cv.template_type}
                          </span>
                          <span className="text-xs text-slate-400">{new Date(cv.created_at).toLocaleDateString("mn-MN")}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Action buttons */}
                  <div className="px-5 py-3 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={function () { openPreview(cv); }}
                      className="flex-1 text-center text-xs py-1.5 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded font-medium text-[#1e3a8a] hover:bg-[#1e3a8a]/10 transition"
                    >
                      👁 Харах
                    </button>
                    <Link to={"/cv/" + cv.id + "/edit"}
                      className="flex-1 text-center text-xs py-1.5 border border-slate-300 rounded font-medium text-slate-700 hover:bg-slate-50 transition">
                      Засах
                    </Link>
                    <button
                      onClick={function () { handleDelete(cv); }}
                      className="flex-1 text-xs py-1.5 border border-red-300 rounded font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      Устгах
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {previewCv && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closePreview}
        >
          <div
            className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            style={{ width: "min(900px, 95vw)", maxHeight: "92vh" }}
            onClick={function (e) { e.stopPropagation(); }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 flex-shrink-0">
              <div>
                <p className="font-semibold text-slate-900 text-sm">{previewCv.name}</p>
                <p className="text-xs text-slate-400">{TEMPLATE_LABELS[previewCv.template_type] || previewCv.template_type} загвар</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={"/cv/" + previewCv.id}
                  className="text-xs px-3 py-1.5 bg-[#1e3a8a] text-white rounded font-medium hover:bg-[#1e40af] transition"
                  onClick={closePreview}
                >
                  Дэлгэрэнгүй →
                </Link>
                <Link
                  to={"/cv/" + previewCv.id + "/edit"}
                  className="text-xs px-3 py-1.5 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50 transition"
                  onClick={closePreview}
                >
                  Засах
                </Link>
                <button
                  onClick={closePreview}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition text-lg"
                >
                  ×
                </button>
              </div>
            </div>

            {/* CV preview content */}
            <div className="overflow-y-auto flex-1 bg-slate-100 p-4">
              {previewCv._loading || previewLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div
                  className="bg-white shadow-lg mx-auto origin-top"
                  style={{
                    width: "210mm",
                    maxWidth: "100%",
                    transform: "scale(0.72)",
                    transformOrigin: "top center",
                    marginBottom: "calc((0.72 - 1) * 100%)",
                  }}
                >
                  <CVPreview cv={previewCv} info={previewInfo} template={previewCv.template_type || "modern"} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
