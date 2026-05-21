import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import CVPreview from "../components/CVPreview";
import TemplateFeedbackModal from "../components/TemplateFeedbackModal";
import PDFDownloadSheet from "../components/PDFDownloadSheet";

export default function CVDetail() {
  var params = useParams();
  var navigate = useNavigate();
  var id = params.id;

  var [cv, setCv] = useState(null);
  var [loading, setLoading] = useState(true);
  var [notFound, setNotFound] = useState(false);
  var [translating, setTranslating] = useState(false);
  var [translatedCv, setTranslatedCv] = useState(null);
  var [showTranslateModal, setShowTranslateModal] = useState(false);
  var [translatingJa, setTranslatingJa] = useState(false);
  var [translatedCvJa, setTranslatedCvJa] = useState(null);
  var [showTranslateModalJa, setShowTranslateModalJa] = useState(false);
  var [showFeedback, setShowFeedback] = useState(false);
  var [showPDFSheet, setShowPDFSheet] = useState(false);
  var [pdfSheetAction, setPdfSheetAction] = useState(null);
  var [cvScale, setCvScale] = useState(1);
  var [cvHeight, setCvHeight] = useState(1123);
  var [translatedCvScale, setTranslatedCvScale] = useState(1);
  var [translatedCvHeight, setTranslatedCvHeight] = useState(1123);
  var [translatedCvJaScale, setTranslatedCvJaScale] = useState(1);
  var [translatedCvJaHeight, setTranslatedCvJaHeight] = useState(1123);
  var cvContainerRef = useRef(null);
  var cvInnerRef = useRef(null);
  var translatedCvContainerRef = useRef(null);
  var translatedCvInnerRef = useRef(null);
  var translatedCvJaContainerRef = useRef(null);
  var translatedCvJaInnerRef = useRef(null);

  useEffect(function () {
    API.get("/cv/" + id)
      .then(function (res) { setCv(res.data); })
      .catch(function () { setNotFound(true); })
      .finally(function () { setLoading(false); });
  }, [id]);

  useEffect(function () {
    if (!cv) return;
    function calcCvScale() {
      if (!cvContainerRef.current) return;
      var newScale = Math.min(1, cvContainerRef.current.clientWidth / 794);
      setCvScale(newScale);
      if (cvInnerRef.current) {
        setCvHeight(cvInnerRef.current.scrollHeight);
      }
    }
    var t = setTimeout(calcCvScale, 100);
    window.addEventListener("resize", calcCvScale);
    return function () { clearTimeout(t); window.removeEventListener("resize", calcCvScale); };
  }, [cv]);

  useEffect(function () {
    if (!showTranslateModal) return;
    function calc() {
      if (!translatedCvContainerRef.current) return;
      var s = Math.min(1, translatedCvContainerRef.current.clientWidth / 794);
      setTranslatedCvScale(s);
      if (translatedCvInnerRef.current) setTranslatedCvHeight(translatedCvInnerRef.current.scrollHeight);
    }
    var t = setTimeout(calc, 100);
    window.addEventListener("resize", calc);
    return function () { clearTimeout(t); window.removeEventListener("resize", calc); };
  }, [showTranslateModal]);

  useEffect(function () {
    if (!showTranslateModalJa) return;
    function calc() {
      if (!translatedCvJaContainerRef.current) return;
      var s = Math.min(1, translatedCvJaContainerRef.current.clientWidth / 794);
      setTranslatedCvJaScale(s);
      if (translatedCvJaInnerRef.current) setTranslatedCvJaHeight(translatedCvJaInnerRef.current.scrollHeight);
    }
    var t = setTimeout(calc, 100);
    window.addEventListener("resize", calc);
    return function () { clearTimeout(t); window.removeEventListener("resize", calc); };
  }, [showTranslateModalJa]);

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

  var isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  var defaultTitleRef = useRef(typeof document !== "undefined" ? document.title : "CareerPrep");

  function triggerWindowPrint(lang, title) {
    document.title = title || " ";
    document.body.dataset.printLang = lang;
    window.print();
    setTimeout(function () {
      document.title = defaultTitleRef.current;
      delete document.body.dataset.printLang;
    }, 1500);
  }

  function handlePDFSheetConfirm() {
    if (pdfSheetAction) pdfSheetAction();
    setShowPDFSheet(false);
  }

  async function handleDownloadTranslatedPDF() {
    setShowTranslateModal(false);
    API.post("/cv/" + id + "/track-pdf").catch(function () {});
    setTimeout(function () {
      triggerWindowPrint("en", (cv?.name || "cv") + " EN");
    }, 80);
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
    API.post("/cv/" + id + "/track-pdf").catch(function () {});
    setTimeout(function () {
      triggerWindowPrint("ja", (cv?.name || "cv") + " JA");
    }, 80);
  }

  function handleDownloadPDF() {
    if (!cv) { toast.error("CV агуулга ачаалагдаагүй"); return; }
    // PDF таталт бүртгэх (fire-and-forget)
    API.post("/cv/" + cv.id + "/track-pdf").catch(function () {});
    if (isMobile) {
      setPdfSheetAction(function () { return function () { triggerWindowPrint("original", cv.name); }; });
      setShowPDFSheet(true);
    } else {
      triggerWindowPrint("original", cv.name);
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
    <>
    {/* Хэвлэх контент — DOM-д эхэлж байна, wrapper-г гадуур */}
    <div className="cv-print-version" data-lang="original">
      <CVPreview cv={cv} info={info} template={template} printStamp="" />
    </div>
    {translatedCv && (
      <div className="cv-print-version" data-lang="en">
        <CVPreview cv={translatedCv} info={translatedCv._parsedInfo} template={template} printStamp="" lang="en" />
      </div>
    )}
    {translatedCvJa && (
      <div className="cv-print-version" data-lang="ja">
        <CVPreview cv={translatedCvJa} info={translatedCvJa._parsedInfo} template={template} printStamp="" lang="ja" />
      </div>
    )}

    <div className="min-h-screen bg-[#f3f4f6] dark:bg-gray-950 cv-screen-layout">
      {/* Nav */}
      <nav className="cv-screen-only bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="CareerPrep" className="w-8 h-8 flex-shrink-0 drop-shadow-sm" />
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">CareerPrep</span>
          </Link>
          <Link to="/cv" className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 font-medium transition">← CV жагсаалт</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col">

        {/* Action bar — mobile дээр CV-ийн доор харагдана */}
        <div className="cv-screen-only bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm px-6 py-4 order-2 md:order-1 mt-4 md:mt-0 mb-0 md:mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">CV дэлгэрэнгүй</p>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">{cv.name}</h1>
              <span className="inline-block mt-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-lg font-medium">
                {TEMPLATE_LABELS[template] || template}
              </span>
            </div>
          </div>
          {/* Mobile: horizontal scroll, Desktop: wrap */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-x-visible md:pb-0 -mx-1 px-1">
            <button
              onClick={handleDownloadPDF}
              className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition"
            >
              ⬇ PDF татах
            </button>
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="flex-shrink-0 px-5 py-2.5 border border-indigo-200 dark:border-indigo-700 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-60 transition flex items-center gap-2"
            >
              {translating ? (
                <><span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> Орчуулж байна...</>
              ) : "🌐 Англи орчуулга"}
            </button>
            <button
              onClick={handleTranslateJa}
              disabled={translatingJa}
              className="flex-shrink-0 px-5 py-2.5 border border-rose-200 dark:border-rose-800 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-60 transition flex items-center gap-2"
            >
              {translatingJa ? (
                <><span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" /> Орчуулж байна...</>
              ) : "🇯🇵 Япон орчуулга"}
            </button>
            <Link
              to={"/cv/" + cv.id + "/edit"}
              className="flex-shrink-0 px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Засах
            </Link>
            <button
              onClick={function () { setShowFeedback(true); }}
              className="flex-shrink-0 px-5 py-2.5 border border-amber-200 dark:border-amber-700 rounded-xl text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition flex items-center gap-1.5"
            >
              ★ Үнэлгээ өгөх
            </button>
            <button
              onClick={handleDelete}
              className="flex-shrink-0 px-5 py-2.5 border border-red-200 dark:border-red-800 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Устгах
            </button>
          </div>
        </div>

        {/* CV preview — дэлгэцэнд харагдана, хэвлэхэд нуугдана */}
        <div ref={cvContainerRef} className="cv-print-shell cv-screen-only shadow-xl rounded-2xl overflow-hidden order-1 md:order-2">
          <div
            className="cv-print-root"
            style={{
              width: Math.round(794 * cvScale) + "px",
              paddingBottom: Math.round(cvHeight * cvScale) + "px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <div
              ref={cvInnerRef}
              className="cv-print-inner"
              style={{
                width: "794px",
                transform: "scale(" + cvScale + ")",
                transformOrigin: "top left",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              <CVPreview cv={cv} info={info} template={template} printStamp="" />
            </div>
          </div>
        </div>

        <p className="cv-screen-only text-center text-xs text-gray-400 mt-4 order-3">
          PDF татахын өмнө мэдээллээ шалгана уу.
        </p>
      </div>

      {/* Япон орчуулга modal */}
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
            <div ref={translatedCvJaContainerRef} style={{ width: "100%" }}>
              <div style={{
                width: Math.round(794 * translatedCvJaScale) + "px",
                paddingBottom: Math.round(translatedCvJaHeight * translatedCvJaScale) + "px",
                margin: "0 auto",
                position: "relative",
              }}>
                <div
                  ref={translatedCvJaInnerRef}
                  style={{
                    width: "794px",
                    transform: "scale(" + translatedCvJaScale + ")",
                    transformOrigin: "top left",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                >
                  <CVPreview cv={translatedCvJa} info={translatedCvJa._parsedInfo} template={template} printStamp="" lang="ja" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Англи орчуулга modal */}
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
            <div ref={translatedCvContainerRef} style={{ width: "100%" }}>
              <div style={{
                width: Math.round(794 * translatedCvScale) + "px",
                paddingBottom: Math.round(translatedCvHeight * translatedCvScale) + "px",
                margin: "0 auto",
                position: "relative",
              }}>
                <div
                  ref={translatedCvInnerRef}
                  style={{
                    width: "794px",
                    transform: "scale(" + translatedCvScale + ")",
                    transformOrigin: "top left",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                >
                  <CVPreview cv={translatedCv} info={translatedCv._parsedInfo} template={template} printStamp="" lang="en" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {showFeedback && (
      <TemplateFeedbackModal
        templateType={template}
        onClose={function () { setShowFeedback(false); }}
      />
    )}

    {showPDFSheet && (
      <PDFDownloadSheet
        onConfirm={handlePDFSheetConfirm}
        onClose={function () { setShowPDFSheet(false); }}
      />
    )}
    </>
  );
}
