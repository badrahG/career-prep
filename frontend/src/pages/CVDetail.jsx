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
  var [printStamp, setPrintStamp] = useState("");
  var [translating, setTranslating] = useState(false);
  var [translatedCv, setTranslatedCv] = useState(null);
  var [showTranslateModal, setShowTranslateModal] = useState(false);
  var [printingTranslated, setPrintingTranslated] = useState(false);
  var [translatingJa, setTranslatingJa] = useState(false);
  var [translatedCvJa, setTranslatedCvJa] = useState(null);
  var [showTranslateModalJa, setShowTranslateModalJa] = useState(false);
  var [printingTranslatedJa, setPrintingTranslatedJa] = useState(false);
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

    function applyPrintTitle() { document.title = " "; }
    function restoreTitle() {
      document.title = defaultTitleRef.current;
      setPrintingTranslated(false);
      setPrintingTranslatedJa(false);
    }

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

  async function handleTranslate() {
    if (translating) return;
    setTranslating(true);
    try {
      var res = await API.post("/cv/" + id + "/translate");
      var data = res.data;
      var parsedInfo = {};
      try { parsedInfo = data.personal_info ? JSON.parse(data.personal_info) : {}; } catch { parsedInfo = {}; }
      setTranslatedCv({ ...data, _parsedInfo: parsedInfo });
      setShowTranslateModal(true);
    } catch (err) {
      var msg = err?.response?.data?.detail || "Орчуулахад алдаа гарлаа";
      toast.error(msg);
    } finally {
      setTranslating(false);
    }
  }

  function handleDownloadTranslatedPDF() {
    setShowTranslateModal(false);
    setPrintingTranslated(true);
    document.title = " ";
    setTimeout(function () { window.print(); }, 100);
  }

  async function handleTranslateJa() {
    if (translatingJa) return;
    setTranslatingJa(true);
    try {
      var res = await API.post("/cv/" + id + "/translate?lang=ja");
      var data = res.data;
      var parsedInfo = {};
      try { parsedInfo = data.personal_info ? JSON.parse(data.personal_info) : {}; } catch { parsedInfo = {}; }
      setTranslatedCvJa({ ...data, _parsedInfo: parsedInfo });
      setShowTranslateModalJa(true);
    } catch (err) {
      var msg = err?.response?.data?.detail || "Орчуулахад алдаа гарлаа";
      toast.error(msg);
    } finally {
      setTranslatingJa(false);
    }
  }

  function handleDownloadTranslatedJaPDF() {
    setShowTranslateModalJa(false);
    setPrintingTranslatedJa(true);
    document.title = " ";
    setTimeout(function () { window.print(); }, 100);
  }

  async function handleDownloadPDF() {
    if (!printRef.current) { toast.error("CV агуулга ачаалагдаагүй"); return; }
    if (downloading) return;
    setDownloading(true);
    try {
      var stamp = new Date().toLocaleString("mn-MN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
      setPrintStamp(stamp);
      document.title = " ";
      setTimeout(function () { window.print(); }, 0);
    } catch (err) {
      console.error(err);
      toast.error("PDF бэлтгэх үед алдаа гарлаа");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] dark:bg-gray-950 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-12">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-500 text-sm text-center">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }
  if (notFound || !cv) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">CV олдсонгүй.</p>
          <Link to="/cv" className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition">← CV жагсаалт</Link>
        </div>
      </div>
    );
  }

  var info = {};
  try { info = cv.personal_info ? JSON.parse(cv.personal_info) : {}; } catch { info = {}; }

  var template = cv.template_type || "modern";
  var TEMPLATE_LABELS = { modern: "Монгол стандарт", classic: "Ази загвар", minimal: "Европ загвар" };

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-gray-950">
      {/* Nav */}
      <nav className="cv-screen-only bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center rounded-lg shadow-sm">
              <span className="text-white font-bold text-xs">CP</span>
            </div>
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">CareerPrep</span>
          </Link>
          <Link to="/cv" className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 font-medium transition">← CV жагсаалт</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Action bar */}
        <div className="cv-screen-only bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">CV дэлгэрэнгүй</p>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">{cv.name}</h1>
            <span className="inline-block mt-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-lg font-medium">
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
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="px-5 py-2.5 border border-indigo-200 dark:border-indigo-700 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-60 transition flex items-center gap-2"
            >
              {translating ? (
                <><span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> Орчуулж байна...</>
              ) : "🌐 Англи орчуулга"}
            </button>
            <button
              onClick={handleTranslateJa}
              disabled={translatingJa}
              className="px-5 py-2.5 border border-rose-200 dark:border-rose-800 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-60 transition flex items-center gap-2"
            >
              {translatingJa ? (
                <><span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" /> Орчуулж байна...</>
              ) : "🇯🇵 Япон орчуулга"}
            </button>
            <Link to={"/cv/" + cv.id + "/edit"} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Засах
            </Link>
            <button onClick={handleDelete} className="px-5 py-2.5 border border-red-200 dark:border-red-800 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
              Устгах
            </button>
          </div>
        </div>

        {/* CV preview */}
        <div className="cv-print-shell shadow-xl rounded-2xl overflow-hidden">
          <div ref={printRef} className="cv-print-root" style={{ width: "210mm", maxWidth: "100%", margin: "0 auto" }}>
            {printingTranslated && translatedCv
              ? <CVPreview cv={translatedCv} info={translatedCv._parsedInfo} template={template} printStamp="" lang="en" />
              : printingTranslatedJa && translatedCvJa
              ? <CVPreview cv={translatedCvJa} info={translatedCvJa._parsedInfo} template={template} printStamp="" lang="ja" />
              : <CVPreview cv={cv} info={info} template={template} printStamp={printStamp} />
            }
          </div>
        </div>

        <p className="cv-screen-only text-center text-xs text-gray-400 mt-4">
          PDF татахын өмнө мэдээллээ шалгана уу.
        </p>
      </div>

      {showTranslateModalJa && translatedCvJa && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-6 cv-screen-only"
          onClick={function (e) { if (e.target === e.currentTarget) setShowTranslateModalJa(false); }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full mx-4 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">🇯🇵 日本語履歴書プレビュー</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTranslatedJaPDF}
                  className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-md transition flex items-center gap-2"
                >
                  ⬇ PDF татах
                </button>
                <button
                  onClick={function () { setShowTranslateModalJa(false); }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500 text-lg"
                >
                  ✕
                </button>
              </div>
            </div>
            <div style={{ width: "210mm", maxWidth: "100%", margin: "0 auto" }}>
              <CVPreview
                cv={translatedCvJa}
                info={translatedCvJa._parsedInfo}
                template={template}
                printStamp=""
                lang="ja"
              />
            </div>
          </div>
        </div>
      )}

      {showTranslateModal && translatedCv && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-6 cv-screen-only"
          onClick={function (e) { if (e.target === e.currentTarget) setShowTranslateModal(false); }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full mx-4 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">English Translation Preview</p>
                
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTranslatedPDF}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-md transition flex items-center gap-2"
                >
                  ⬇ PDF татах
                </button>
                <button
                  onClick={function () { setShowTranslateModal(false); }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500 text-lg"
                >
                  ✕
                </button>
              </div>
            </div>
            <div style={{ width: "210mm", maxWidth: "100%", margin: "0 auto" }}>
              <CVPreview
                cv={translatedCv}
                info={translatedCv._parsedInfo}
                template={template}
                printStamp=""
                lang="en"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
