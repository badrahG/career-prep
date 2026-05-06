import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { CardSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import CVPreview from "../components/CVPreview";
import Layout from "../components/Layout";

var TEMPLATE_LABELS = { modern: "Modern", classic: "Classic", minimal: "European CV" };

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
    <Layout>
      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">CV цуглуулга</p>
            <h1 className="text-2xl font-bold text-gray-800">Миний CV</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? "Ачааллаж байна..." : cvs.length + " CV үүсгэсэн"}
            </p>
          </div>
          <Link to="/cv/new" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition whitespace-nowrap">
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
                <div key={cv.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-200 transition group overflow-hidden">
                  <div className={"h-1.5 " + (cv.template_type === "classic" ? "bg-gradient-to-r from-slate-500 to-slate-700" : cv.template_type === "minimal" ? "bg-gradient-to-r from-gray-300 to-gray-400" : "bg-gradient-to-r from-violet-500 to-indigo-500")} />

                  <Link to={"/cv/" + cv.id} className="block p-5 pb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-violet-600 font-bold text-xs">CV</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate group-hover:text-violet-700 transition">{cv.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">
                            {TEMPLATE_LABELS[cv.template_type] || cv.template_type}
                          </span>
                          <span className="text-xs text-gray-400">{new Date(cv.created_at).toLocaleDateString("mn-MN")}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={function () { openPreview(cv); }}
                      className="flex-1 text-center text-xs py-1.5 bg-violet-50 border border-violet-200 rounded-lg font-medium text-violet-700 hover:bg-violet-100 transition"
                    >
                      Харах
                    </button>
                    <Link to={"/cv/" + cv.id + "/edit"}
                      className="flex-1 text-center text-xs py-1.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition">
                      Засах
                    </Link>
                    <button
                      onClick={function () { handleDelete(cv); }}
                      className="flex-1 text-xs py-1.5 border border-red-200 rounded-lg font-medium text-red-600 hover:bg-red-50 transition"
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
    </Layout>
  );
}
