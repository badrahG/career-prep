import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import ScholarshipCVPreview from "../components/ScholarshipCVPreview";
import TemplateFeedbackModal from "../components/TemplateFeedbackModal";
import PDFDownloadSheet from "../components/PDFDownloadSheet";

var COUNTRY_FLAG = { "United States": "🇺🇸", "Australia": "🇦🇺", "Japan": "🇯🇵" };

export default function ScholarshipCVDetail() {
  var { id } = useParams();
  var navigate = useNavigate();

  var [cv, setCv] = useState(null);
  var [loading, setLoading] = useState(true);
  var [notFound, setNotFound] = useState(false);
  var [showFeedback, setShowFeedback] = useState(false);
  var [showPDFSheet, setShowPDFSheet] = useState(false);
  var [pdfSheetAction, setPdfSheetAction] = useState(null);

  var [translatingEn, setTranslatingEn] = useState(false);
  var [translatingJa, setTranslatingJa] = useState(false);
  var [enData, setEnData] = useState(null);
  var [jaData, setJaData] = useState(null);
  var [showEnModal, setShowEnModal] = useState(false);
  var [showJaModal, setShowJaModal] = useState(false);

  var cvContainerRef = useRef(null);
  var cvInnerRef = useRef(null);
  var [cvScale, setCvScale] = useState(1);
  var [cvHeight, setCvHeight] = useState(1123);
  var enContainerRef = useRef(null);
  var enInnerRef = useRef(null);
  var [enScale, setEnScale] = useState(1);
  var [enHeight, setEnHeight] = useState(1123);
  var jaContainerRef = useRef(null);
  var jaInnerRef = useRef(null);
  var [jaScale, setJaScale] = useState(1);
  var [jaHeight, setJaHeight] = useState(1123);
  var defaultTitleRef = useRef(typeof document !== "undefined" ? document.title : "CareerPrep");

  useEffect(function () {
    API.get("/cv/scholarship/" + id)
      .then(function (res) { setCv(res.data); })
      .catch(function () { setNotFound(true); })
      .finally(function () { setLoading(false); });
  }, [id]);

  useEffect(function () {
    if (!cv) return;
    function calc() {
      if (!cvContainerRef.current) return;
      var s = Math.min(1, cvContainerRef.current.clientWidth / 794);
      setCvScale(s);
      if (cvInnerRef.current) setCvHeight(cvInnerRef.current.scrollHeight);
    }
    var t = setTimeout(calc, 100);
    window.addEventListener("resize", calc);
    return function () { clearTimeout(t); window.removeEventListener("resize", calc); };
  }, [cv]);

  useEffect(function () {
    if (!showEnModal) return;
    function calc() {
      if (!enContainerRef.current) return;
      var s = Math.min(1, enContainerRef.current.clientWidth / 794);
      setEnScale(s);
      if (enInnerRef.current) setEnHeight(enInnerRef.current.scrollHeight);
    }
    var t = setTimeout(calc, 100);
    window.addEventListener("resize", calc);
    return function () { clearTimeout(t); window.removeEventListener("resize", calc); };
  }, [showEnModal]);

  useEffect(function () {
    if (!showJaModal) return;
    function calc() {
      if (!jaContainerRef.current) return;
      var s = Math.min(1, jaContainerRef.current.clientWidth / 794);
      setJaScale(s);
      if (jaInnerRef.current) setJaHeight(jaInnerRef.current.scrollHeight);
    }
    var t = setTimeout(calc, 100);
    window.addEventListener("resize", calc);
    return function () { clearTimeout(t); window.removeEventListener("resize", calc); };
  }, [showJaModal]);

  async function buildTranslatedData(targetLang, srcData) {
    var profile = srcData.profile || {};
    var edu = srcData.edu || {};
    var ach = srcData.ach || {};
    var ldr = srcData.ldr || {};
    var goals = srcData.goals || {};
    var values = [
      profile.fullName, profile.location,
      edu.school, edu.degree, edu.major, edu.coursework,
      ach.awards, ach.competitions, ach.certificates,
      ldr.leadership, ldr.volunteer, ldr.extracurricular, ldr.projects, ldr.work, ldr.background,
      goals.careerGoal, goals.whyScholarship, goals.whyCountry, goals.howContribute, goals.impactPlan, goals.studyPlan,
    ];
    var res = await API.post("/cv/scholarship-translate-fields", { targetLang, values });
    var t = res.data.translated;
    var i = 0;
    return {
      ...srcData,
      profile: { ...profile, fullName: t[i++], location: t[i++] },
      edu: { ...edu, school: t[i++], degree: t[i++], major: t[i++], coursework: t[i++] },
      ach: { ...ach, awards: t[i++], competitions: t[i++], certificates: t[i++] },
      ldr: { ...ldr, leadership: t[i++], volunteer: t[i++], extracurricular: t[i++], projects: t[i++], work: t[i++], background: t[i++] },
      goals: { ...goals, careerGoal: t[i++], whyScholarship: t[i++], whyCountry: t[i++], howContribute: t[i++], impactPlan: t[i++], studyPlan: t[i++] },
    };
  }

  async function handleTranslateEn() {
    if (translatingEn) return;
    setTranslatingEn(true);
    try {
      var translated = await buildTranslatedData("EN", cv.cvData || {});
      setEnData(translated);
      setShowEnModal(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Орчуулахад алдаа гарлаа");
    } finally {
      setTranslatingEn(false);
    }
  }

  async function handleTranslateJa() {
    if (translatingJa) return;
    setTranslatingJa(true);
    try {
      var translated = await buildTranslatedData("JA", cv.cvData || {});
      setJaData(translated);
      setShowJaModal(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Орчуулахад алдаа гарлаа");
    } finally {
      setTranslatingJa(false);
    }
  }

  var isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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

  function handleDownloadPDF() {
    if (isMobile) {
      setPdfSheetAction(function () { return function () { triggerWindowPrint("sc-original", cv?.name || "Scholarship CV"); }; });
      setShowPDFSheet(true);
    } else {
      triggerWindowPrint("sc-original", cv?.name || "Scholarship CV");
    }
  }

  function handleDownloadEnPDF() {
    setShowEnModal(false);
    setTimeout(function () {
      triggerWindowPrint("sc-en", (cv?.name || "scholarship-cv") + " EN");
    }, 80);
  }

  function handleDownloadJaPDF() {
    setShowJaModal(false);
    setTimeout(function () {
      triggerWindowPrint("sc-ja", (cv?.name || "scholarship-cv") + " JA");
    }, 80);
  }

  async function handleDelete() {
    if (!window.confirm('"' + cv.name + '" CV-г устгах уу?')) return;
    try {
      await API.delete("/cv/" + id);
      toast.success("CV устгагдлаа");
      navigate("/cv");
    } catch {
      toast.error("Устгахад алдаа");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] dark:bg-gray-950 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-12">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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
          <Link to="/cv" className="inline-block bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-md transition">← CV жагсаалт</Link>
        </div>
      </div>
    );
  }

  var data = cv.cvData || {};
  var country = data.country || "";
  var flag = COUNTRY_FLAG[country] || "🎓";

  return (
    <>
    {/* Print version — зөвхөн хэвлэхэд харагдана */}
    <div className="scholarship-cv-print" data-lang="original">
      <ScholarshipCVPreview data={data} />
    </div>
    {enData && (
      <div className="scholarship-cv-print" data-lang="en">
        <ScholarshipCVPreview data={enData} />
      </div>
    )}
    {jaData && (
      <div className="scholarship-cv-print" data-lang="ja">
        <ScholarshipCVPreview data={jaData} />
      </div>
    )}

    <div className="min-h-screen bg-[#f3f4f6] dark:bg-gray-950 scholarship-cv-screen">
      {/* Nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center rounded-lg shadow-sm">
              <span className="text-white font-bold text-xs">CP</span>
            </div>
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">CareerPrep</span>
          </Link>
          <Link to="/cv" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 font-medium transition">← CV жагсаалт</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col">

        {/* Action bar */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm px-6 py-4 order-2 md:order-1 mt-4 md:mt-0 mb-0 md:mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Тэтгэлгийн CV дэлгэрэнгүй</p>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">{cv.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg">{flag}</span>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-lg font-medium">
                  {country || "Тэтгэлгийн CV"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-x-visible md:pb-0 -mx-1 px-1">
            <button
              onClick={handleDownloadPDF}
              className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-md transition"
            >
              ⬇ PDF татах
            </button>
            <button
              onClick={handleTranslateEn}
              disabled={translatingEn}
              className="flex-shrink-0 px-5 py-2.5 border border-indigo-200 dark:border-indigo-700 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-60 transition flex items-center gap-2"
            >
              {translatingEn
                ? <><span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> Орчуулж байна...</>
                : "🌐 Англи орчуулга"}
            </button>
            {country === "Japan" && (
              <button
                onClick={handleTranslateJa}
                disabled={translatingJa}
                className="flex-shrink-0 px-5 py-2.5 border border-rose-200 dark:border-rose-800 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-60 transition flex items-center gap-2"
              >
                {translatingJa
                  ? <><span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" /> Орчуулж байна...</>
                  : "🇯🇵 Япон орчуулга"}
              </button>
            )}
            <Link
              to={"/cv/scholarship/" + id + "/edit"}
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

        {/* CV Preview */}
        <div ref={cvContainerRef} className="cv-print-shell shadow-xl rounded-2xl overflow-hidden order-1 md:order-2">
          <div
            style={{
              width: Math.round(794 * cvScale) + "px",
              paddingBottom: Math.round(cvHeight * cvScale) + "px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <div
              ref={cvInnerRef}
              style={{
                width: "794px",
                transform: "scale(" + cvScale + ")",
                transformOrigin: "top left",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              <ScholarshipCVPreview data={data} />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 order-3">
          PDF татахын өмнө мэдээллээ шалгана уу.
        </p>
      </div>

      {/* Англи орчуулга modal */}
      {showEnModal && enData && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-6"
          onClick={function (e) { if (e.target === e.currentTarget) setShowEnModal(false); }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full mx-4 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">🌐 English Translation Preview</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadEnPDF}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-md transition"
                >
                  ⬇ PDF татах
                </button>
                <button
                  onClick={function () { setShowEnModal(false); }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500 text-lg"
                >✕</button>
              </div>
            </div>
            <div ref={enContainerRef} style={{ width: "100%" }}>
              <div style={{
                width: Math.round(794 * enScale) + "px",
                paddingBottom: Math.round(enHeight * enScale) + "px",
                margin: "0 auto",
                position: "relative",
              }}>
                <div
                  ref={enInnerRef}
                  style={{
                    width: "794px",
                    transform: "scale(" + enScale + ")",
                    transformOrigin: "top left",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                >
                  <ScholarshipCVPreview data={enData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Япон орчуулга modal */}
      {showJaModal && jaData && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-6"
          onClick={function (e) { if (e.target === e.currentTarget) setShowJaModal(false); }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full mx-4 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">🇯🇵 日本語 Translation Preview</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadJaPDF}
                  className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-md transition"
                >
                  ⬇ PDF татах
                </button>
                <button
                  onClick={function () { setShowJaModal(false); }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500 text-lg"
                >✕</button>
              </div>
            </div>
            <div ref={jaContainerRef} style={{ width: "100%" }}>
              <div style={{
                width: Math.round(794 * jaScale) + "px",
                paddingBottom: Math.round(jaHeight * jaScale) + "px",
                margin: "0 auto",
                position: "relative",
              }}>
                <div
                  ref={jaInnerRef}
                  style={{
                    width: "794px",
                    transform: "scale(" + jaScale + ")",
                    transformOrigin: "top left",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                >
                  <ScholarshipCVPreview data={jaData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {showFeedback && country && (
      <TemplateFeedbackModal
        templateType={country}
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
