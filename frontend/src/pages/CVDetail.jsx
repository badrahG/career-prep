import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import CVPreview from "../components/CVPreview";

export default function CVDetail() {
  var params = useParams();
  var navigate = useNavigate();
  var id = params.id;

  var [cv, setCv] = useState(null);
  var [loading, setLoading] = useState(true);
  var [downloading, setDownloading] = useState(false);
  var [notFound, setNotFound] = useState(false);
  var printRef = useRef(null);
  var defaultTitleRef = useRef(typeof document !== "undefined" ? document.title : "CareerPrep");

  useEffect(function () {
    API.get("/cv/" + id)
      .then(function (res) { setCv(res.data); })
      .catch(function () { setNotFound(true); })
      .finally(function () { setLoading(false); });
  }, [id]);

  useEffect(function () {
    if (!cv) return;

    function getPrintableName() {
      var baseName = (cv.name || "CV").trim() || "CV";
      return "CV_" + baseName.replace(/[\\/:*?\"<>|]/g, "_");
    }

    function applyPrintTitle() { document.title = getPrintableName(); }
    function restoreTitle() { document.title = defaultTitleRef.current; }

    applyPrintTitle();
    window.addEventListener("beforeprint", applyPrintTitle);
    window.addEventListener("afterprint", restoreTitle);

    return function () {
      window.removeEventListener("beforeprint", applyPrintTitle);
      window.removeEventListener("afterprint", restoreTitle);
      restoreTitle();
    };
  }, [cv]);

  async function handleDelete() {
    if (!window.confirm("Энэ CV-г устгах уу?")) return;
    try {
      await API.delete("/cv/" + id);
      toast.success("CV устгагдлаа");
      navigate("/cv");
    } catch {
      toast.error("Устгахад алдаа");
    }
  }

  async function handleDownloadPDF() {
    if (!printRef.current) { toast.error("CV агуулга ачаалагдаагүй"); return; }
    if (downloading) return;
    setDownloading(true);
    try {
      var baseName = (cv.name || "CV").trim() || "CV";
      document.title = "CV_" + baseName.replace(/[\\/:*?\"<>|]/g, "_");
      window.print();
    } catch (err) {
      console.error(err);
      toast.error("PDF бэлтгэх үед алдаа гарлаа");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm text-center">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }
  if (notFound || !cv) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-500 text-sm mb-4">CV олдсонгүй.</p>
          <Link to="/cv" className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition">← CV жагсаалт</Link>
        </div>
      </div>
    );
  }

  var info = {};
  try { info = cv.personal_info ? JSON.parse(cv.personal_info) : {}; } catch { info = {}; }

  var template = cv.template_type || "modern";
  var TEMPLATE_LABELS = { modern: "Modern", classic: "Classic", minimal: "European CV" };

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* Nav */}
      <nav className="cv-screen-only bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center rounded-lg shadow-sm">
              <span className="text-white font-bold text-xs">CP</span>
            </div>
            <span className="text-base font-semibold text-gray-900">CareerPrep</span>
          </Link>
          <Link to="/cv" className="text-sm text-gray-500 hover:text-violet-600 font-medium transition">← CV жагсаалт</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Action bar */}
        <div className="cv-screen-only bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">CV дэлгэрэнгүй</p>
            <h1 className="text-xl font-bold text-gray-800">{cv.name}</h1>
            <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">
              {TEMPLATE_LABELS[template] || template}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md disabled:opacity-60 transition flex items-center gap-2"
            >
              {downloading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Бэлтгэж байна...</>
              ) : "⬇ PDF татах"}
            </button>
            <Link to={"/cv/" + cv.id + "/edit"} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Засах
            </Link>
            <button onClick={handleDelete} className="px-5 py-2.5 border border-red-200 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition">
              Устгах
            </button>
          </div>
        </div>

        {/* CV preview */}
        <div className="cv-print-shell shadow-xl rounded-2xl overflow-hidden">
          <div ref={printRef} className="cv-print-root" style={{ width: "210mm", maxWidth: "100%", margin: "0 auto" }}>
            <CVPreview cv={cv} info={info} template={template} />
          </div>
        </div>

        <p className="cv-screen-only text-center text-xs text-gray-400 mt-4">
          PDF татахын өмнө мэдээллээ шалгана уу.
        </p>
      </div>
    </div>
  );
}
