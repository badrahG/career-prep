import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { CardSkeleton } from "../components/Skeleton";
import CVPreview from "../components/CVPreview";
import ScholarshipCVPreview from "../components/ScholarshipCVPreview";
import Layout from "../components/Layout";

var TEMPLATE_LABELS = { modern: "Монгол хэв маяг", classic: "Ази хэв маяг", minimal: "Европ хэв маяг" };

var COUNTRY_FLAG = { "United States": "🇺🇸", "Australia": "🇦🇺", "Japan": "🇯🇵" };

export default function CVList() {
  var [cvs, setCvs] = useState([]);
  var [loading, setLoading] = useState(true);
  var [previewCv, setPreviewCv] = useState(null);
  var [previewLoading, setPreviewLoading] = useState(false);
  var [uploading, setUploading] = useState(false);

  var [scholPreview, setScholPreview] = useState(null);
  var [scholPreviewLoading, setScholPreviewLoading] = useState(false);

  var fileRef = useRef(null);
  var navigate = useNavigate();
  var [modalScale, setModalScale] = useState(0.72);
  var modalContentRef = useRef(null);
  var scholModalRef = useRef(null);
  var [scholModalScale, setScholModalScale] = useState(0.72);

  function handleUploadFile(e) {
    var file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Зөвхөн PDF файл зөвшөөрнө");
      e.target.value = "";
      return;
    }
    setUploading(true);
    var form = new FormData();
    form.append("file", file);
    API.post("/cv/parse-upload", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then(function (res) {
        toast.success("CV-ийн мэдээлэл амжилттай уншигдлаа!");
        navigate("/cv/new", { state: { prefilled: res.data } });
      })
      .catch(function (err) {
        toast.error(err.response?.data?.detail || "CV уншиж чадсангүй");
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      });
  }

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

  function openScholPreview(cv) {
    setScholPreviewLoading(true);
    setScholPreview({ _loading: true, id: cv.id, name: cv.name });
    API.get("/cv/scholarship/" + cv.id)
      .then(function (res) { setScholPreview(res.data); })
      .catch(function () { toast.error("CV ачаалахад алдаа"); setScholPreview(null); })
      .finally(function () { setScholPreviewLoading(false); });
  }

  function closeScholPreview() { setScholPreview(null); }

  useEffect(function () {
    if (!previewCv || previewCv._loading || previewLoading) return;
    function calcScale() {
      if (!modalContentRef.current) return;
      var el = modalContentRef.current;
      var style = window.getComputedStyle(el);
      var padH = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      var available = el.clientWidth - padH;
      setModalScale(Math.min(0.72, available / 794));
    }
    var t = setTimeout(calcScale, 50);
    window.addEventListener("resize", calcScale);
    return function () { clearTimeout(t); window.removeEventListener("resize", calcScale); };
  }, [previewCv, previewLoading]);

  useEffect(function () {
    if (!scholPreview || scholPreview._loading || scholPreviewLoading) return;
    function calcScale() {
      if (!scholModalRef.current) return;
      var el = scholModalRef.current;
      var style = window.getComputedStyle(el);
      var padH = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      var available = el.clientWidth - padH;
      setScholModalScale(Math.min(0.72, available / 794));
    }
    var t = setTimeout(calcScale, 50);
    window.addEventListener("resize", calcScale);
    return function () { clearTimeout(t); window.removeEventListener("resize", calcScale); };
  }, [scholPreview, scholPreviewLoading]);

  var previewInfo = {};
  if (previewCv && !previewCv._loading) {
    try { previewInfo = previewCv.personal_info ? JSON.parse(previewCv.personal_info) : {}; } catch { previewInfo = {}; }
  }

  var jobCvs = cvs.filter(function (c) { return c.cv_type !== "scholarship"; });
  var scholarshipCvs = cvs.filter(function (c) { return c.cv_type === "scholarship"; });

  function JobCVCard({ cv }) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-600 transition group overflow-hidden">
        <div className={"h-1.5 " + (cv.template_type === "classic" ? "bg-gradient-to-r from-slate-500 to-slate-700" : cv.template_type === "minimal" ? "bg-gradient-to-r from-gray-300 to-gray-400" : "bg-gradient-to-r from-violet-500 to-indigo-500")} />
        <Link to={"/cv/" + cv.id} className="block p-5 pb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-11 h-11 bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-violet-600 font-bold text-xs">CV</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-violet-700 dark:group-hover:text-violet-400 transition">{cv.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-lg font-medium">
                  {TEMPLATE_LABELS[cv.template_type] || cv.template_type}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(cv.created_at).toLocaleDateString("mn-MN")}</span>
              </div>
            </div>
          </div>
        </Link>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
          <button
            onClick={function () { openPreview(cv); }}
            className="flex-1 text-center text-xs py-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-lg font-medium text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition"
          >
            Харах
          </button>
          <Link to={"/cv/" + cv.id + "/edit"}
            className="flex-1 text-center text-xs py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Засах
          </Link>
          <button
            onClick={function () { handleDelete(cv); }}
            className="flex-1 text-xs py-1.5 border border-red-200 dark:border-red-800 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            Устгах
          </button>
        </div>
      </div>
    );
  }

  function ScholCVCard({ cv }) {
    var countryStr = cv.name ? cv.name.split(" — ")[1]?.replace(" CV", "") : "";
    var flag = COUNTRY_FLAG[countryStr] || "🎓";
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-600 transition group overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
        <div className="block p-5 pb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
              {flag}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition">{cv.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-lg font-medium">
                  Тэтгэлгийн CV
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(cv.created_at).toLocaleDateString("mn-MN")}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
          <Link to={"/cv/scholarship/" + cv.id}
            className="flex-1 text-center text-xs py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
          >
            Харах
          </Link>
          <Link to={"/cv/scholarship/" + cv.id + "/edit"}
            className="flex-1 text-center text-xs py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Засах
          </Link>
          <button
            onClick={function () { handleDelete(cv); }}
            className="flex-1 text-xs py-1.5 border border-red-200 dark:border-red-800 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            Устгах
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">CV цуглуулга</p>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Миний CV</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {loading ? "Ачааллаж байна..." : cvs.length + " CV үүсгэсэн"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleUploadFile} />
            <button
              onClick={function () { if (!uploading) fileRef.current?.click(); }}
              disabled={uploading}
              className="border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-400 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20 transition whitespace-nowrap disabled:opacity-60 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".3" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Уншиж байна...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  CV байршуулах
                </>
              )}
            </button>
            <Link to="/cv/start" className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-md transition whitespace-nowrap">
              + Шинэ CV
            </Link>
          </div>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : cvs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-12 flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-6 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-violet-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">CV үүсгээгүй байна</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs">Эхний CV-гээ үүсгэж, ажилд орох бэлтгэлээ эхлүүлцгааe.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/cv/start" className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full text-sm font-semibold hover:shadow-md transition">
                + Шинэ CV үүсгэх
              </Link>
              <button
                onClick={function () { if (!uploading) fileRef.current?.click(); }}
                disabled={uploading}
                className="px-6 py-2.5 border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-400 rounded-xl text-sm font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Бэлэн CV байршуулах
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">

            {/* Ажлын CV хэсэг */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-violet-500 rounded-full" />
                  <h2 className="text-base font-bold text-gray-800 dark:text-gray-200">Ажлын CV</h2>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">{jobCvs.length}</span>
                </div>
                <Link to="/cv/new" className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline">+ Нэмэх</Link>
              </div>
              {jobCvs.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Ажлын CV үүсгээгүй байна</p>
                  <Link to="/cv/start" className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline">Шинэ ажлын CV үүсгэх →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobCvs.map(function (cv) { return <JobCVCard key={cv.id} cv={cv} />; })}
                </div>
              )}
            </div>

            {/* Тэтгэлгийн CV хэсэг */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                  <h2 className="text-base font-bold text-gray-800 dark:text-gray-200">Тэтгэлгийн CV</h2>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">{scholarshipCvs.length}</span>
                </div>
                <Link to="/cv/scholarship/new" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">+ Нэмэх</Link>
              </div>
              {scholarshipCvs.length === 0 ? (
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl p-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Тэтгэлгийн CV үүсгээгүй байна</p>
                  <Link to="/cv/scholarship/new" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Scholarship CV үүсгэх →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scholarshipCvs.map(function (cv) { return <ScholCVCard key={cv.id} cv={cv} />; })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Ажлын CV Preview modal */}
      {previewCv && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
          onClick={closePreview}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-none md:rounded-xl shadow-2xl overflow-hidden flex flex-col w-screen h-dvh md:h-auto md:max-h-[92vh] md:w-auto"
            style={{ maxWidth: "min(900px, 100vw)" }}
            onClick={function (e) { e.stopPropagation(); }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-gray-700 flex-shrink-0">
              <div>
                <p className="font-semibold text-slate-900 dark:text-gray-100 text-sm">{previewCv.name}</p>
                <p className="text-xs text-slate-400 dark:text-gray-500">{TEMPLATE_LABELS[previewCv.template_type] || previewCv.template_type} загвар</p>
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
                  className="text-xs px-3 py-1.5 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition"
                  onClick={closePreview}
                >
                  Засах
                </Link>
                <button
                  onClick={closePreview}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400 transition text-lg"
                >
                  ×
                </button>
              </div>
            </div>
            <div
              className="overflow-y-auto flex-1 bg-slate-100 dark:bg-gray-900 p-2 md:p-4"
              ref={modalContentRef}
            >
              {previewCv._loading || previewLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div
                  style={{
                    width: Math.round(794 * modalScale) + "px",
                    paddingBottom: Math.round(1123 * modalScale) + "px",
                    margin: "0 auto",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "794px",
                      transform: "scale(" + modalScale + ")",
                      transformOrigin: "top left",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  >
                    <CVPreview cv={previewCv} info={previewInfo} template={previewCv.template_type || "modern"} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Тэтгэлгийн CV Preview modal */}
      {scholPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
          onClick={closeScholPreview}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-none md:rounded-xl shadow-2xl overflow-hidden flex flex-col w-screen h-dvh md:h-auto md:max-h-[92vh] md:w-auto"
            style={{ maxWidth: "min(900px, 100vw)" }}
            onClick={function (e) { e.stopPropagation(); }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-gray-700 flex-shrink-0">
              <div>
                <p className="font-semibold text-slate-900 dark:text-gray-100 text-sm">{scholPreview.name}</p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400">Тэтгэлгийн CV</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={"/cv/scholarship/" + scholPreview.id}
                  className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition"
                  onClick={closeScholPreview}
                >
                  Дэлгэрэнгүй →
                </Link>
                <Link
                  to={"/cv/scholarship/" + scholPreview.id + "/edit"}
                  className="text-xs px-3 py-1.5 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition"
                  onClick={closeScholPreview}
                >
                  Засах
                </Link>
                <button
                  onClick={closeScholPreview}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-500 dark:text-gray-400 transition text-lg"
                >
                  ×
                </button>
              </div>
            </div>
            <div
              className="overflow-y-auto flex-1 bg-slate-100 dark:bg-gray-900 p-2 md:p-4"
              ref={scholModalRef}
            >
              {scholPreview._loading || scholPreviewLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div
                  style={{
                    width: Math.round(794 * scholModalScale) + "px",
                    paddingBottom: Math.round(1123 * scholModalScale) + "px",
                    margin: "0 auto",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "794px",
                      transform: "scale(" + scholModalScale + ")",
                      transformOrigin: "top left",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  >
                    <ScholarshipCVPreview data={scholPreview.cvData || {}} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
