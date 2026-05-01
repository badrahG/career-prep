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

    function applyPrintTitle() {
      document.title = getPrintableName();
    }

    function restoreTitle() {
      document.title = defaultTitleRef.current;
    }

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-lg shadow p-12">
          <div className="w-8 h-8 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm text-center">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }
  if (notFound || !cv) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-lg shadow p-12 text-center">
          <p className="text-slate-600 text-sm mb-4">CV олдсонгүй.</p>
          <Link to="/cv" className="inline-block bg-[#1e3a8a] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition">← CV жагсаалт</Link>
        </div>
      </div>
    );
  }

  var info = {};
  try { info = cv.personal_info ? JSON.parse(cv.personal_info) : {}; } catch { info = {}; }

  var template = cv.template_type || "modern";
  var TEMPLATE_LABELS = { modern: "Modern", classic: "Classic", minimal: "Minimal" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="cv-screen-only bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900">CareerPrep</span>
          </Link>
          <Link to="/cv" className="text-sm text-slate-600 hover:text-[#1e3a8a] font-medium transition">← CV жагсаалт</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 relative z-10">
        {/* Action bar */}
        <div className="cv-screen-only bg-white border border-slate-200 rounded-lg px-6 py-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-1">CV дэлгэрэнгүй</p>
            <h1 className="text-xl font-bold text-slate-900">{cv.name}</h1>
            <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
              {TEMPLATE_LABELS[template] || template}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-60 transition flex items-center gap-2"
            >
              {downloading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Бэлтгэж байна...</>
              ) : "⬇ PDF татах"}
            </button>
            <Link to={"/cv/" + cv.id + "/edit"} className="px-5 py-2.5 border border-slate-300 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
               Засах
            </Link>
            <button onClick={handleDelete} className="px-5 py-2.5 border border-red-300 rounded text-sm font-semibold text-red-600 hover:bg-red-50 transition">
              Устгах
            </button>
          </div>
        </div>

        {/* CV preview */}
        <div className="cv-print-shell shadow-xl rounded-lg overflow-hidden">
          <div ref={printRef} className="cv-print-root" style={{ width: "210mm", maxWidth: "100%", margin: "0 auto" }}>
            <CVPreview cv={cv} info={info} template={template} />
          </div>
        </div>

        <p className="cv-screen-only text-center text-xs text-slate-400 mt-4">
          PDF татахын өмнө мэдээллээ шалгана уу.
        </p>
      </div>
    </div>
  );
}
