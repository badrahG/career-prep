import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../services/api";
import toast from "react-hot-toast";
import ScholarshipCVPreview from "../components/ScholarshipCVPreview";

var COUNTRY_CONFIG = {
  "United States": {
    dot: "bg-blue-500",
    ring: "ring-blue-500 border-blue-500",
    bgSel: "bg-blue-50 dark:bg-blue-900/20",
    badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    sub: "АНУ",
    focus: "Leadership, community impact, personal story",
    note: "No photo required",
    steps: ["Requirement", "Profile", "Education", "Activities", "Essays", "Preview"],
    stepKeys: ["requirement", "profile", "education", "activities", "essays", "preview"],
    extraLabel: "Activities & Leadership Summary",
  },
  "Australia": {
    dot: "bg-emerald-500",
    ring: "ring-emerald-500 border-emerald-500",
    bgSel: "bg-emerald-50 dark:bg-emerald-900/20",
    badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    sub: "Австрали",
    focus: "Academic excellence, selection criteria",
    note: "No photo required",
    steps: ["Requirement", "Profile", "Academic", "Leadership", "Criteria", "Preview"],
    stepKeys: ["requirement", "profile", "academic", "leadership", "criteria", "preview"],
    extraLabel: "Selection Criteria Response",
  },
  "Japan": {
    dot: "bg-rose-500",
    ring: "ring-rose-500 border-rose-500",
    bgSel: "bg-rose-50 dark:bg-rose-900/20",
    badge: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
    sub: "Япон",
    focus: "Study plan, academic record, why Japan",
    note: "Photo if required",
    steps: ["Requirement", "Profile", "Academic", "Study Plan", "Motivation", "Preview"],
    stepKeys: ["requirement", "profile", "academic", "studyplan", "motivation", "preview"],
    extraLabel: "Study Plan Draft (研究計画書)",
  },
};

var LANG_TYPES = ["IELTS", "TOEFL", "Duolingo", "JLPT", "GRE", "GMAT", "Other"];
var DEFAULT_STEPS = ["Country", "Requirement", "Profile", "Education", "Step 5", "Step 6", "Preview"];

var iCls = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition";
var tCls = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition resize-none";
var sCls = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition";

function Lbl({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function SectionHead({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 bg-violet-500 rounded-full" />
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">{children}</h3>
    </div>
  );
}

function StepIndicator({ steps, current, maxReached, onStepClick }) {
  return (
    <div className="flex items-center justify-center overflow-x-auto pb-1 gap-0">
      {steps.map(function (s, i) {
        var num = i + 1;
        var done = num < current;
        var active = num === current;
        var clickable = num >= 2 && num <= maxReached && num !== current;
        return (
          <div key={i} className="flex items-center shrink-0">
            <div className="flex flex-col items-center">
              <div
                onClick={clickable ? function () { onStepClick(num); } : undefined}
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  done ? "bg-violet-600 text-white" :
                  active ? "bg-violet-600 text-white ring-4 ring-violet-100 dark:ring-violet-900/40" :
                  "bg-gray-100 dark:bg-gray-700 text-gray-400",
                  clickable ? "cursor-pointer hover:opacity-80" : "cursor-default",
                ].join(" ")}
              >
                {done ? "✓" : num}
              </div>
              <span className={[
                "text-xs mt-1 hidden md:block font-medium whitespace-nowrap",
                active ? "text-violet-600" : "text-gray-400",
              ].join(" ")}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={[
                "w-5 md:w-8 h-0.5 mx-1 mb-5 transition-all shrink-0",
                done ? "bg-violet-500" : "bg-gray-200 dark:bg-gray-700",
              ].join(" ")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ScholarshipCVBuilder() {
  var navigate = useNavigate();
  var { id } = useParams();

  var [step, setStep] = useState(1);
  var [maxStep, setMaxStep] = useState(1);
  var [country, setCountry] = useState("");
  var [req, setReq] = useState({ text: "", name: "", org: "", deadline: "", program: "" });
  var [profile, setProfile] = useState({ fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" });
  var [edu, setEdu] = useState({ school: "", degree: "", major: "", gpa: "", gpaScale: "4.00", graduationYear: "", coursework: "" });
  var [ach, setAch] = useState({ awards: "", competitions: "", certificates: "", langScores: [] });
  var [ldr, setLdr] = useState({ leadership: "", volunteer: "", extracurricular: "", projects: "", work: "", background: "" });
  var [goals, setGoals] = useState({ careerGoal: "", whyScholarship: "", whyCountry: "", howContribute: "", impactPlan: "", studyPlan: "" });
  var [cvList, setCvList] = useState([]);
  var [showImport, setShowImport] = useState(false);
  var [savedCvId, setSavedCvId] = useState(id ? parseInt(id) : null);
  var [saving, setSaving] = useState(false);
  var [cvLoading, setCvLoading] = useState(!!id);
  var [showFullPreview, setShowFullPreview] = useState(false);
  var [previewScale, setPreviewScale] = useState(0.55);
  var [modalScale, setModalScale] = useState(1);
  var rightPanelRef = useRef(null);
  var [enData, setEnData] = useState(null);
  var [jaData, setJaData] = useState(null);
  var [showEnModal, setShowEnModal] = useState(false);
  var [showJaModal, setShowJaModal] = useState(false);
  var [translatingEn, setTranslatingEn] = useState(false);
  var [translatingJa, setTranslatingJa] = useState(false);
  var [ratings, setRatings] = useState({});
  var [certFiles, setCertFiles] = useState([]);
  var [aiLoading, setAiLoading] = useState(false);
  var [aiResult, setAiResult] = useState(null);
  var [showAiModal, setShowAiModal] = useState(false);
  var [aiTab, setAiTab] = useState("cv");

  var cfg = country ? COUNTRY_CONFIG[country] : null;
  var allSteps = cfg ? ["Country", ...cfg.steps] : DEFAULT_STEPS;
  var isLastStep = step === allSteps.length;

  useEffect(function () {
    function cleanup() { delete document.body.dataset.printLang; }
    window.addEventListener("afterprint", cleanup);
    return function () { window.removeEventListener("afterprint", cleanup); };
  }, []);

  useEffect(function () {
    API.get("/cv").then(function (res) {
      if (res.data && res.data.length > 0) setCvList(res.data.filter(function(c) { return c.cv_type !== "scholarship"; }));
    }).catch(function () {});
  }, []);

  useEffect(function () {
    API.get("/feedback/cv-template/summary").then(function (res) { setRatings(res.data); }).catch(function () {});
  }, []);

  useEffect(function () {
    if (!id) return;
    setCvLoading(true);
    API.get("/cv/scholarship/" + id).then(function (res) {
      var d = res.data.cvData || {};
      if (d.country) setCountry(d.country);
      if (d.req) setReq(d.req);
      if (d.profile) setProfile(d.profile);
      if (d.edu) setEdu(d.edu);
      if (d.ach) setAch({ awards: "", competitions: "", certificates: "", langScores: [], ...d.ach });
      if (d.ldr) setLdr(d.ldr);
      if (d.goals) setGoals(d.goals);
      setMaxStep(99);
    }).catch(function () {
      toast.error("CV ачаалахад алдаа гарлаа");
    }).finally(function () {
      setCvLoading(false);
    });
  }, [id]);

  useEffect(function () {
    function calcScale() {
      var available = Math.min(860, window.innerWidth * 0.95) - 32;
      setModalScale(Math.min(1, available / 794));
    }
    calcScale();
    window.addEventListener("resize", calcScale);
    return function () { window.removeEventListener("resize", calcScale); };
  }, []);

  useEffect(function () {
    if (!rightPanelRef.current) return;
    var obs = new ResizeObserver(function (entries) {
      for (var entry of entries) {
        var w = entry.contentRect.width;
        setPreviewScale(Math.max(0.25, Math.min(0.9, (w - 24) / 794)));
      }
    });
    obs.observe(rightPanelRef.current);
    return function () { obs.disconnect(); };
  }, []);

  async function importFromCV(cvId) {
    try {
      var res = await API.get("/cv/" + cvId);
      var cv = res.data;
      var info = {};
      try { info = JSON.parse(cv.personal_info || "{}"); } catch {}
      setProfile({
        fullName: ((info.firstName || "") + " " + (info.lastName || "")).trim(),
        email: info.email || "",
        phone: info.phone || "",
        location: info.address || "",
        linkedin: info.linkedin || "",
        portfolio: info.portfolio || "",
      });
      if (cv.educations && cv.educations.length > 0) {
        var e0 = cv.educations[0];
        setEdu(function (p) {
          return { ...p, school: e0.school || "", degree: e0.level || "", major: e0.major || "", gpa: e0.gpa || "", graduationYear: e0.end_year || "" };
        });
      }
      var awards = (info.awards || []).map(function (a) { return a.name || ""; }).filter(Boolean).join("\n");
      var certs = (info.certs || []).map(function (c) { return c.name + (c.organization ? " — " + c.organization : ""); }).filter(Boolean).join("\n");
      setAch(function (p) { return { ...p, awards, certificates: certs }; });
      if (cv.experiences && cv.experiences.length > 0) {
        var workText = cv.experiences.slice(0, 3).map(function (ex) {
          return (ex.position || "") + " at " + (ex.company || "") +
            (ex.start_date ? " (" + ex.start_date + (ex.end_date ? " - " + ex.end_date : " - Present") + ")" : "") +
            (ex.description ? "\n" + ex.description : "");
        }).join("\n\n");
        setLdr(function (p) { return { ...p, work: workText }; });
      }
      setShowImport(false);
      toast.success("Мэдээлэл татагдлаа! Монгол текстийг англи болгон засна уу.");
    } catch {
      toast.error("CV татахад алдаа гарлаа");
    }
  }

  function addLangScore() {
    setAch(function (p) { return { ...p, langScores: [...p.langScores, { type: "IELTS", score: "", file: null }] }; });
  }

  function updateLangScore(i, field, val) {
    setAch(function (p) {
      return { ...p, langScores: p.langScores.map(function (ls, idx) { return idx === i ? { ...ls, [field]: val } : ls; }) };
    });
  }

  function removeLangScore(i) {
    setAch(function (p) { return { ...p, langScores: p.langScores.filter(function (_, idx) { return idx !== i; }) }; });
  }

  function addCertFile(e) {
    var files = Array.from(e.target.files || []);
    if (!files.length) return;
    setCertFiles(function (prev) { return [...prev, ...files.map(function (f) { return { name: f.name }; })]; });
    e.target.value = "";
  }

  function removeCertFile(idx) {
    setCertFiles(function (prev) { return prev.filter(function (_, i) { return i !== idx; }); });
  }

  function setLangScoreFile(idx, e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    updateLangScore(idx, "file", { name: file.name });
    e.target.value = "";
  }

  function getChecklist() {
    var items = [];
    if (!country) return items;
    if (!profile.fullName) items.push("Бүтэн нэр (англиар) оруулаагүй байна");
    if (!profile.email) items.push("И-мэйл хаяг оруулаагүй байна");
    if (!edu.school) items.push("Сургуулийн нэр оруулаагүй байна");
    if (!edu.major) items.push("Мэргэжил (major) оруулаагүй байна");
    if (!edu.gpa) items.push("GPA оруулаагүй байна");
    var hasLang = ach.langScores && ach.langScores.some(function (ls) { return ls.type && ls.score; });
    if (!hasLang) {
      if (country === "Japan") items.push("JLPT зэрэглэл оруулаагүй байна — Япон тэтгэлэгт шаардлагатай байж болно");
      else items.push("Хэлний шалгалтын оноо (IELTS эсвэл TOEFL) оруулаагүй байна");
    }
    var hasActivity = ldr.leadership || ldr.volunteer || ldr.extracurricular;
    if (!hasActivity) items.push("Манлайлал эсвэл сайн дурын ажлын туршлага оруулаагүй байна");
    if (!goals.careerGoal) items.push("Карьерын зорилго оруулаагүй байна");
    if (!goals.whyScholarship) items.push("Яагаад энэ тэтгэлэгт apply хийж байгаагаа тайлбарлаагүй байна");
    if (!goals.whyCountry) items.push("Яагаад " + country + "-д суралцахыг хүсч байгаагаа оруулаагүй байна");
    if (!goals.impactPlan) items.push("Тэтгэлгийн дараах impact plan оруулаагүй байна");
    if (country === "Japan" && !goals.studyPlan) {
      items.push("Study Plan (研究計画書) оруулаагүй байна — Япон тэтгэлэгт маш чухал");
    }
    if (!req.name && !req.text) items.push("Тэтгэлгийн нэр эсвэл шаардлагын мэдээлэл оруулаагүй байна");
    return items;
  }

  async function buildTranslatedData(targetLang) {
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
      country,
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
      var data = await buildTranslatedData("EN");
      setEnData(data);
      setShowEnModal(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Орчуулахад алдаа гарлаа");
    } finally {
      setTranslatingEn(false);
    }
  }

  async function handleTranslateJa() {
    if (translatingJa) return;
    setTranslatingJa(true);
    try {
      var data = await buildTranslatedData("JA");
      setJaData(data);
      setShowJaModal(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Орчуулахад алдаа гарлаа");
    } finally {
      setTranslatingJa(false);
    }
  }

  async function handleAiGenerate() {
    if (aiLoading) return;
    if (!country) { toast.error("Эхлээд улс сонгоно уу"); return; }
    if (!profile.fullName) { toast.error("Бүтэн нэрээ оруулна уу"); return; }
    setAiLoading(true);
    try {
      var res = await API.post("/cv/scholarship-generate", {
        country: country || "",
        scholarshipName: req.name || "",
        organization: req.org || "",
        deadline: req.deadline || "",
        program: req.program || "",
        requirementText: req.text || "",
        profile: {
          fullName: profile.fullName || "",
          email: profile.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
          linkedin: profile.linkedin || "",
          portfolio: profile.portfolio || "",
        },
        education: {
          school: edu.school || "",
          degree: edu.degree || "",
          major: edu.major || "",
          gpa: String(edu.gpa || ""),
          gpaScale: edu.gpaScale || "4.00",
          graduationYear: String(edu.graduationYear || ""),
          coursework: edu.coursework || "",
        },
        achievements: {
          awards: ach.awards || "",
          competitions: ach.competitions || "",
          certificates: ach.certificates || "",
          languageScores: (ach.langScores || []).map(function (ls) {
            return { type: ls.type || "", score: ls.score || "" };
          }),
        },
        leadershipExperience: ldr.leadership || "",
        volunteerWork: ldr.volunteer || "",
        extracurricular: ldr.extracurricular || "",
        projects: ldr.projects || "",
        workExperience: ldr.work || "",
        personalBackground: ldr.background || "",
        careerGoal: goals.careerGoal || "",
        whyScholarship: goals.whyScholarship || "",
        whyCountry: goals.whyCountry || "",
        howContribute: goals.howContribute || "",
        impactPlan: goals.impactPlan || "",
        studyPlan: goals.studyPlan || "",
      });
      setAiResult(res.data);
      setAiTab("cv");
      setShowAiModal(true);
    } catch (err) {
      var detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "AI генерац хийхэд алдаа гарлаа");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      var cvName = (req.name || profile.fullName || "Scholarship") + (country ? " — " + country : "") + " CV";
      var cvData = { country, req, profile, edu, ach, ldr, goals };
      var res;
      if (savedCvId) {
        res = await API.put("/cv/scholarship-save/" + savedCvId, { name: cvName, cvData });
      } else {
        res = await API.post("/cv/scholarship-save", { name: cvName, cvData });
        setSavedCvId(res.data.id);
      }
      toast.success("CV амжилттай хадгалагдлаа");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  }

  function exportPDF(lang) {
    var l = lang || "original";
    document.title = (profile.fullName || "Scholarship").replace(/\s+/g, "_") + "_CV";
    document.body.dataset.printLang = l === "en" ? "sc-en" : l === "ja" ? "sc-ja" : "sc-original";
    window.print();
  }

  function goNext() {
    if (step === 1 && !country) { toast.error("Улс сонгоно уу"); return; }
    setStep(function (s) { return s + 1; });
    setMaxStep(function (m) { return Math.max(m, step + 1); });
  }

  function goPrev() {
    if (step <= 1) { navigate("/cv/start"); return; }
    setStep(function (s) { return s - 1; });
  }

  /* ─────── Step renderers ─────── */

  function renderCountry() {
    var cards = ["United States", "Australia", "Japan"].map(function (k) {
      return { id: k, ...COUNTRY_CONFIG[k] };
    });
    return (
      <div>
        <SectionHead>Тэтгэлэг авах улсаа сонгоно уу</SectionHead>
        <div className="grid grid-cols-1 gap-3">
          {cards.map(function (c) {
            var sel = country === c.id;
            return (
              <button
                key={c.id}
                onClick={function () { setCountry(c.id); }}
                className={[
                  "w-full text-left rounded-2xl border-2 p-4 transition-all",
                  sel ? c.ring + " " + c.bgSel : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={"w-3 h-3 rounded-full " + c.dot} />
                    <div>
                      <div className="font-bold text-gray-800 dark:text-gray-200 text-sm">{c.id}</div>
                      <div className="text-xs text-gray-500">{c.sub}</div>
                    </div>
                  </div>
                  {sel && (
                    <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + c.badge}>{c.focus}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">{c.note}</span>
                  </div>
                  {ratings[c.id] ? (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <span style={{ color: "#f59e0b" }}>{"★".repeat(Math.round(ratings[c.id].avg))}</span>
                      <span style={{ color: "#d1d5db" }}>{"★".repeat(5 - Math.round(ratings[c.id].avg))}</span>
                      <span className="ml-0.5">{ratings[c.id].avg.toFixed(1)} ({ratings[c.id].count})</span>
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderRequirement() {
    return (
      <div className="space-y-5">
        <SectionHead>Тэтгэлгийн мэдээлэл</SectionHead>
        <div>
          <Lbl>Тэтгэлгийн шаардлагыг paste хийнэ үү</Lbl>
          <textarea
            rows={6}
            className={tCls}
            placeholder={"Тэтгэлгийн website-аас selection criteria, зорилго, шаардлагыг copy хийж энд paste хийнэ үү...\n\n(Хоосон орхиж болно — AI-д мэдээлэл дамжуулах зориулалттай)"}
            value={req.text}
            onChange={function (e) { setReq(function (p) { return { ...p, text: e.target.value }; }); }}
          />
          <div className="text-right text-xs text-gray-400 mt-1">{req.text.length} тэмдэгт</div>
        </div>
        <div>
          <Lbl>Тэтгэлгийн нэр</Lbl>
          <input className={iCls} placeholder="e.g. Fulbright Scholarship, MEXT, Australia Awards..." value={req.name} onChange={function (e) { setReq(function (p) { return { ...p, name: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Их сургууль / Байгууллага</Lbl>
          <input className={iCls} placeholder="e.g. University of Melbourne, JASSO, IIE..." value={req.org} onChange={function (e) { setReq(function (p) { return { ...p, org: e.target.value }; }); }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Lbl>Хаалтын хугацаа</Lbl>
            <input className={iCls} placeholder="e.g. 2025-03-31" value={req.deadline} onChange={function (e) { setReq(function (p) { return { ...p, deadline: e.target.value }; }); }} />
          </div>
          <div>
            <Lbl>Хөтөлбөр / Major</Lbl>
            <input className={iCls} placeholder="e.g. Computer Science, MBA..." value={req.program} onChange={function (e) { setReq(function (p) { return { ...p, program: e.target.value }; }); }} />
          </div>
        </div>
      </div>
    );
  }

  function renderProfile() {
    return (
      <div className="space-y-4">
        <SectionHead>Хувийн мэдээлэл</SectionHead>

        {cvList.length > 0 && (
          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">Байгаа CV-аас мэдээлэл татах</p>
                <p className="text-xs text-violet-500 mt-0.5">Нэр, сургууль, туршлагыг автоматаар дүүргэнэ</p>
              </div>
              <button
                onClick={function () { setShowImport(function (v) { return !v; }); }}
                className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ml-2"
              >
                {showImport ? "Хаах" : "Татах"}
              </button>
            </div>
            {showImport && (
              <div className="mt-3 space-y-1">
                {cvList.map(function (cv) {
                  return (
                    <button
                      key={cv.id}
                      onClick={function () { importFromCV(cv.id); }}
                      className="w-full text-left text-xs bg-white dark:bg-gray-800 border border-violet-200 dark:border-violet-700 rounded-lg px-3 py-2 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-700 dark:text-gray-300">{cv.name}</span>
                      <span className="text-violet-500">Сонгох →</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div>
          <Lbl required>Бүтэн нэр (Англиар)</Lbl>
          <input className={iCls} placeholder="e.g. Naranjargal Batbayar" value={profile.fullName} onChange={function (e) { setProfile(function (p) { return { ...p, fullName: e.target.value }; }); }} />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Lbl>И-мэйл</Lbl>
            <input type="email" className={iCls} placeholder="your@email.com" value={profile.email} onChange={function (e) { setProfile(function (p) { return { ...p, email: e.target.value }; }); }} />
          </div>
          <div>
            <Lbl>Утасны дугаар</Lbl>
            <input className={iCls} placeholder="+976 9911-XXXX" value={profile.phone} onChange={function (e) { setProfile(function (p) { return { ...p, phone: e.target.value }; }); }} />
          </div>
          <div>
            <Lbl>Хот / Улс</Lbl>
            <input className={iCls} placeholder="e.g. Ulaanbaatar, Mongolia" value={profile.location} onChange={function (e) { setProfile(function (p) { return { ...p, location: e.target.value }; }); }} />
          </div>
        </div>
        <div className="border-t dark:border-gray-700 pt-4">
          <p className="text-xs text-gray-500 mb-3">Нэмэлт холбоосууд (заавал биш)</p>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Lbl>LinkedIn</Lbl>
              <input className={iCls} placeholder="linkedin.com/in/yourname" value={profile.linkedin} onChange={function (e) { setProfile(function (p) { return { ...p, linkedin: e.target.value }; }); }} />
            </div>
            <div>
              <Lbl>Portfolio / GitHub</Lbl>
              <input className={iCls} placeholder="github.com/yourname" value={profile.portfolio} onChange={function (e) { setProfile(function (p) { return { ...p, portfolio: e.target.value }; }); }} />
            </div>
          </div>
        </div>
        {country === "Japan" ? (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3">
            <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">Japan: Тэтгэлгийн шаардлагаас хамааран паспорт зургаа хавсаргана уу.</p>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">US / Australia: Зураг, хүйс, нас, гэрлэлтийн байдлыг CV-д оруулахгүй.</p>
          </div>
        )}
      </div>
    );
  }

  function renderEducation() {
    return (
      <div className="space-y-5">
        <SectionHead>Боловсрол</SectionHead>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Lbl>Сургуулийн нэр</Lbl>
            <input className={iCls} placeholder="e.g. National University of Mongolia" value={edu.school} onChange={function (e) { setEdu(function (p) { return { ...p, school: e.target.value }; }); }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Lbl>Зэрэг</Lbl>
              <input className={iCls} placeholder="e.g. Bachelor of Science" value={edu.degree} onChange={function (e) { setEdu(function (p) { return { ...p, degree: e.target.value }; }); }} />
            </div>
            <div>
              <Lbl>Мэргэжил</Lbl>
              <input className={iCls} placeholder="e.g. Computer Science" value={edu.major} onChange={function (e) { setEdu(function (p) { return { ...p, major: e.target.value }; }); }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Lbl>GPA</Lbl>
              <input className={iCls} placeholder="3.85" value={edu.gpa} onChange={function (e) { setEdu(function (p) { return { ...p, gpa: e.target.value }; }); }} />
            </div>
            <div>
              <Lbl>Scale</Lbl>
              <input className={iCls} placeholder="4.00" value={edu.gpaScale} onChange={function (e) { setEdu(function (p) { return { ...p, gpaScale: e.target.value }; }); }} />
            </div>
            <div>
              <Lbl>Төгсөх он</Lbl>
              <input className={iCls} placeholder="2025" value={edu.graduationYear} onChange={function (e) { setEdu(function (p) { return { ...p, graduationYear: e.target.value }; }); }} />
            </div>
          </div>
          <div>
            <Lbl>Холбогдох хичээлүүд</Lbl>
            <input className={iCls} placeholder="e.g. Data Structures, Machine Learning, Statistics..." value={edu.coursework} onChange={function (e) { setEdu(function (p) { return { ...p, coursework: e.target.value }; }); }} />
          </div>
        </div>

        <div className="border-t dark:border-gray-700 pt-4">
          <SectionHead>Амжилт & Шагнал</SectionHead>
          <div className="space-y-4">
            <div>
              <Lbl>Академик шагнал / Awards</Lbl>
              <textarea rows={3} className={tCls} placeholder={"Dean's List — 2023, 2024\nNational Academic Excellence Award 2022"} value={ach.awards} onChange={function (e) { setAch(function (p) { return { ...p, awards: e.target.value }; }); }} />
              <p className="text-xs text-gray-400 mt-1">Нэг мөрт нэг шагнал бичнэ үү</p>
            </div>
            <div>
              <Lbl>Тэмцээн / Олимпиад</Lbl>
              <textarea rows={2} className={tCls} placeholder="1st Place, National Programming Competition 2023" value={ach.competitions} onChange={function (e) { setAch(function (p) { return { ...p, competitions: e.target.value }; }); }} />
            </div>
            <div>
              <Lbl>Гэрчилгээ / Certificates</Lbl>
              <textarea rows={2} className={tCls} placeholder={"Google Data Analytics Certificate — 2024\nAWS Cloud Practitioner — 2023"} value={ach.certificates} onChange={function (e) { setAch(function (p) { return { ...p, certificates: e.target.value }; }); }} />
              <div className="mt-2">
                <label className="inline-flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold cursor-pointer">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Гэрчилгээ файл хавсаргах (PDF / JPG / PNG)
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={addCertFile} />
                </label>
                {certFiles.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    {certFiles.map(function (f, i) {
                      return (
                        <div key={i} className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-lg px-2.5 py-1.5">
                          <svg className="w-3.5 h-3.5 text-violet-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{f.name}</span>
                          <button onClick={function () { removeCertFile(i); }} className="text-gray-400 hover:text-red-500 transition shrink-0 text-base leading-none">×</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Lbl>Хэлний шалгалт</Lbl>
                <button onClick={addLangScore} className="text-xs text-violet-600 hover:text-violet-700 font-semibold">+ Нэмэх</button>
              </div>
              {ach.langScores.length === 0 && (
                <div className="text-xs text-gray-400 italic mb-2">IELTS, TOEFL, JLPT гэх мэт онооноо нэмнэ үү</div>
              )}
              <div className="space-y-2">
                {ach.langScores.map(function (ls, i) {
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex gap-2 items-center">
                        <select className={sCls} value={ls.type} onChange={function (e) { updateLangScore(i, "type", e.target.value); }}>
                          {LANG_TYPES.map(function (t) { return <option key={t} value={t}>{t}</option>; })}
                        </select>
                        <input className={iCls} placeholder="Score, e.g. 7.0, 105, N2..." value={ls.score} onChange={function (e) { updateLangScore(i, "score", e.target.value); }} />
                        <label className="cursor-pointer text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 transition shrink-0" title="Оноо батлах баримт хавсаргах">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={function (e) { setLangScoreFile(i, e); }} />
                        </label>
                        <button onClick={function () { removeLangScore(i); }} className="text-gray-400 hover:text-red-500 transition shrink-0 text-xl leading-none">×</button>
                      </div>
                      {ls.file && (
                        <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-lg px-2.5 py-1.5">
                          <svg className="w-3.5 h-3.5 text-violet-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{ls.file.name}</span>
                          <button onClick={function () { updateLangScore(i, "file", null); }} className="text-gray-400 hover:text-red-500 transition shrink-0 text-base leading-none">×</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* US: Activities & Leadership */
  function renderActivities() {
    return (
      <div className="space-y-4">
        <SectionHead>Үйл ажиллагаа & Манлайлал</SectionHead>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
          <p className="text-xs text-blue-700 dark:text-blue-300">US тэтгэлэгт тоо баримттай, нөлөөний жишээтэй бичнэ үү. "Led 20+ members", "organized 10+ events" гэх мэт.</p>
        </div>
        <div>
          <Lbl>Манлайллын туршлага</Lbl>
          <textarea rows={3} className={tCls} placeholder={"President, CS Students Association — led 20+ members, organized 10+ technical workshops\nDebate Club Captain — competed in 5 national tournaments"} value={ldr.leadership} onChange={function (e) { setLdr(function (p) { return { ...p, leadership: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Сайн дурын / Олон нийтийн ажил</Lbl>
          <textarea rows={3} className={tCls} placeholder={"Volunteer Tutor, Local Community Center — taught programming to 30+ high school students\nFood Bank Volunteer — 100+ service hours"} value={ldr.volunteer} onChange={function (e) { setLdr(function (p) { return { ...p, volunteer: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Extracurricular / Дугуйлан</Lbl>
          <textarea rows={2} className={tCls} placeholder={"Robotics Team Member, Orchestra Pianist, Model UN Delegate..."} value={ldr.extracurricular} onChange={function (e) { setLdr(function (p) { return { ...p, extracurricular: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Судалгаа & Төсөл</Lbl>
          <textarea rows={3} className={tCls} placeholder={"AI-Powered Study Assistant (Python, NLP) — helped 200+ students improve study efficiency\nUndergraduate Research under Prof. Smith — Machine Learning in Healthcare"} value={ldr.projects} onChange={function (e) { setLdr(function (p) { return { ...p, projects: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Ажил / Дадлага (заавал биш)</Lbl>
          <textarea rows={2} className={tCls} placeholder={"Software Engineering Intern, ABC Tech — Jun 2023 – Aug 2023"} value={ldr.work} onChange={function (e) { setLdr(function (p) { return { ...p, work: e.target.value }; }); }} />
        </div>
      </div>
    );
  }

  /* US: Essays & Goals */
  function renderEssays() {
    return (
      <div className="space-y-4">
        <SectionHead>Essays & Goals</SectionHead>
        <div>
          <Lbl>Хувийн түүх / Personal hook</Lbl>
          <textarea rows={3} className={tCls} placeholder={"Motivation letter-д ашиглах хамгийн сонирхолтой хувийн түүх эсвэл туршлага...\ne.g. Growing up in rural Mongolia with limited internet access, I decided to build tools that would reach everyone..."} value={ldr.background} onChange={function (e) { setLdr(function (p) { return { ...p, background: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Карьерын зорилго</Lbl>
          <textarea rows={2} className={tCls} placeholder="Ирээдүйд яг юу хийхийг хүсч байна вэ? Тодорхой, бодит зорилго бичнэ үү." value={goals.careerGoal} onChange={function (e) { setGoals(function (p) { return { ...p, careerGoal: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Яагаад энэ тэтгэлэг?</Lbl>
          <textarea rows={2} className={tCls} placeholder="Энэ тэтгэлэг таны зорилготой хэрхэн нийцэж байна вэ?" value={goals.whyScholarship} onChange={function (e) { setGoals(function (p) { return { ...p, whyScholarship: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Яагаад АНУ-д суралцах вэ?</Lbl>
          <textarea rows={2} className={tCls} placeholder="АНУ-д суралцах нь таны зорилгод хэрхэн тус болох вэ?" value={goals.whyCountry} onChange={function (e) { setGoals(function (p) { return { ...p, whyCountry: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Хэрхэн хувь нэмэр оруулах вэ?</Lbl>
          <textarea rows={2} className={tCls} placeholder="Тэтгэлгийн дараа Монгол болон дэлхийн нийгэмд хэрхэн хувь нэмэр оруулах вэ?" value={goals.howContribute} onChange={function (e) { setGoals(function (p) { return { ...p, howContribute: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Impact plan</Lbl>
          <textarea rows={2} className={tCls} placeholder="Буцаж ирсний дараа тодорхой юу хийх вэ? Нийгэмд хэрхэн нөлөөлөх вэ?" value={goals.impactPlan} onChange={function (e) { setGoals(function (p) { return { ...p, impactPlan: e.target.value }; }); }} />
        </div>
      </div>
    );
  }

  /* Australia: Leadership step */
  function renderLeadership() {
    return (
      <div className="space-y-4">
        <SectionHead>Манлайлал & Туршлага</SectionHead>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Australia тэтгэлэгт evidence-based туршлага маш чухал. STAR format (Situation, Task, Action, Result) хэлбэрт бичнэ үү.</p>
        </div>
        <div>
          <Lbl>Манлайллын туршлага</Lbl>
          <textarea rows={3} className={tCls} placeholder={"President, Student Union — managed AUD 50K budget, led 15-member team\nProject Lead, Tech for Good Initiative — delivered 3 community projects"} value={ldr.leadership} onChange={function (e) { setLdr(function (p) { return { ...p, leadership: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Олон нийтийн ажил / Community service</Lbl>
          <textarea rows={3} className={tCls} placeholder={"Community Tutor — 200+ hours teaching underprivileged youth coding\nFood Bank Volunteer Coordinator — organized 20+ fundraising events"} value={ldr.volunteer} onChange={function (e) { setLdr(function (p) { return { ...p, volunteer: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Extracurricular / Дугуйлан</Lbl>
          <textarea rows={2} className={tCls} placeholder="Model UN, Student Research Club, Sports Team Captain..." value={ldr.extracurricular} onChange={function (e) { setLdr(function (p) { return { ...p, extracurricular: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Судалгаа & Төсөл</Lbl>
          <textarea rows={2} className={tCls} placeholder="Research topic, supervisor name, key findings and outcomes..." value={ldr.projects} onChange={function (e) { setLdr(function (p) { return { ...p, projects: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Ажил / Дадлага (заавал биш)</Lbl>
          <textarea rows={2} className={tCls} placeholder="Position, Company — dates, key responsibilities..." value={ldr.work} onChange={function (e) { setLdr(function (p) { return { ...p, work: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Хувийн суурь (заавал биш)</Lbl>
          <textarea rows={2} className={tCls} placeholder="Australia тэтгэлэгт хамааралтай хувийн нөхцөл байдал эсвэл түүх..." value={ldr.background} onChange={function (e) { setLdr(function (p) { return { ...p, background: e.target.value }; }); }} />
        </div>
      </div>
    );
  }

  /* Australia: Criteria & Goals */
  function renderCriteria() {
    return (
      <div className="space-y-4">
        <SectionHead>Selection Criteria & Goals</SectionHead>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Australia тэтгэлэгт selection criteria-ийг шууд хариулах нь маш чухал. Тус бүрт тодорхой жишээ бичнэ үү.</p>
        </div>
        <div>
          <Lbl>Карьерын зорилго</Lbl>
          <textarea rows={2} className={tCls} placeholder="Ирээдүйн тодорхой зорилго, мэргэжлийн чиглэл..." value={goals.careerGoal} onChange={function (e) { setGoals(function (p) { return { ...p, careerGoal: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Яагаад энэ тэтгэлэг?</Lbl>
          <textarea rows={2} className={tCls} placeholder="Энэ тэтгэлэг таны карьерын зорилгод яаж нийцэж байна вэ?" value={goals.whyScholarship} onChange={function (e) { setGoals(function (p) { return { ...p, whyScholarship: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Яагаад Австрали?</Lbl>
          <textarea rows={2} className={tCls} placeholder="Австралид суралцах нь таны зорилгод хэрхэн тус болох вэ? Тодорхой их сургуулийн давуу талыг дурдаж болно." value={goals.whyCountry} onChange={function (e) { setGoals(function (p) { return { ...p, whyCountry: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Хувь нэмэр оруулах төлөвлөгөө</Lbl>
          <textarea rows={2} className={tCls} placeholder="Тэтгэлгийн дараа Монголд болон дэлхийд хэрхэн хувь нэмэр оруулах вэ?" value={goals.howContribute} onChange={function (e) { setGoals(function (p) { return { ...p, howContribute: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Impact plan</Lbl>
          <textarea rows={2} className={tCls} placeholder="Буцаж ирсний дараах тодорхой төлөвлөгөө..." value={goals.impactPlan} onChange={function (e) { setGoals(function (p) { return { ...p, impactPlan: e.target.value }; }); }} />
        </div>
      </div>
    );
  }

  /* Japan: Study Plan */
  function renderStudyPlan() {
    return (
      <div className="space-y-4">
        <SectionHead>Судалгааны төлөвлөгөө — Study Plan</SectionHead>
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">Маш чухал</span>
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">研究計画書</span>
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400">Япон тэтгэлэгт Study Plan нь хамгийн чухал бичиг баримт. Судалгааны сэдэв, яагаад Япон, аль профессор, буцаж ирсний дараах төлөвлөгөөг тодорхой бичнэ үү.</p>
        </div>
        <div>
          <Lbl>Судалгааны сэдэв & Зорилго</Lbl>
          <textarea rows={5} className={tCls} placeholder={"Юу судлах вэ? Яагаад энэ сэдэв чухал вэ? Ямар асуудлыг шийдвэрлэх вэ?\n\ne.g. AI-д суурилсан байгалийн гамшгийн урьдчилсан мэдэгдлийн систем хөгжүүлэх — Монгол дахь байгалийн гамшгийн ихэсч буй тохиолдлыг шийдвэрлэх зорилготой..."} value={goals.studyPlan} onChange={function (e) { setGoals(function (p) { return { ...p, studyPlan: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Судалгааны арга / Methodology</Lbl>
          <textarea rows={3} className={tCls} placeholder={"Ямар аргачлал ашиглах вэ? Ямар software, equipment?\ne.g. Machine learning (deep neural networks), satellite imagery analysis, field data collection in 3 Mongolian provinces..."} value={ldr.projects} onChange={function (e) { setLdr(function (p) { return { ...p, projects: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Хувийн суурь / Яагаад та энэ судалгааг хийх таарамжтай вэ?</Lbl>
          <textarea rows={2} className={tCls} placeholder={"e.g. Undergraduate thesis on climate data analysis, 2 years as research assistant at National Meteorological Institute..."} value={ldr.background} onChange={function (e) { setLdr(function (p) { return { ...p, background: e.target.value }; }); }} />
        </div>
      </div>
    );
  }

  /* Japan: Motivation & Goals */
  function renderMotivation() {
    return (
      <div className="space-y-4">
        <SectionHead>Урам зориг & Зорилго</SectionHead>
        <div>
          <Lbl>Карьерын зорилго</Lbl>
          <textarea rows={2} className={tCls} placeholder="Ирээдүйн мэргэжлийн зорилго — тодорхой, бодит байдлаар бичнэ үү." value={goals.careerGoal} onChange={function (e) { setGoals(function (p) { return { ...p, careerGoal: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Яагаад энэ тэтгэлэг?</Lbl>
          <textarea rows={2} className={tCls} placeholder="Яагаад энэ тэтгэлэгт apply хийж байна вэ?" value={goals.whyScholarship} onChange={function (e) { setGoals(function (p) { return { ...p, whyScholarship: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Яагаад Япон? — Тодорхой их сургууль / профессор</Lbl>
          <textarea rows={3} className={tCls} placeholder={"Яагаад Японд суралцах вэ? Аль их сургуульд, аль профессорын удирдлаганд суралцах вэ?\n\ne.g. Prof. Yamada's Disaster Prevention AI Lab at University of Tokyo — world leader in the exact field of my research..."} value={goals.whyCountry} onChange={function (e) { setGoals(function (p) { return { ...p, whyCountry: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Монголд буцаж ирсний дараа хэрхэн хувь нэмэр оруулах вэ?</Lbl>
          <textarea rows={2} className={tCls} placeholder="Японд суралцсаныхаа дараа Монголд тодорхой юу хийх вэ?" value={goals.howContribute} onChange={function (e) { setGoals(function (p) { return { ...p, howContribute: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Impact plan — Нийгэмд нөлөөлөх байдал</Lbl>
          <textarea rows={2} className={tCls} placeholder="Судалгааны үр дүнг Монгол болон дэлхийд хэрхэн хэрэглэх вэ?" value={goals.impactPlan} onChange={function (e) { setGoals(function (p) { return { ...p, impactPlan: e.target.value }; }); }} />
        </div>
        <div>
          <Lbl>Японы хэлний мэдлэг (хэрэв байвал)</Lbl>
          <textarea rows={1} className={tCls} placeholder="e.g. JLPT N3 — intermediate level, actively studying N2..." value={ldr.leadership} onChange={function (e) { setLdr(function (p) { return { ...p, leadership: e.target.value }; }); }} />
          <p className="text-xs text-gray-400 mt-1">JLPT онооноо Education хэсэгт нэмсэн байх ёстой</p>
        </div>
      </div>
    );
  }

  function renderPreviewStep() {
    var items = getChecklist();
    var isReady = items.length === 0;
    return (
      <div className="space-y-5">
        <SectionHead>CV Урьдчилан харах & Татах</SectionHead>

        {/* Auto-checklist */}
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
            {isReady ? "Мэдээлэл бүрэн байна" : "Дутуу мэдээлэл — " + items.length + " зүйл"}
          </p>
          {!isReady ? (
            <div className="space-y-1.5">
              {items.map(function (item, i) {
                return (
                  <div key={i} className="flex gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-2.5">
                    <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
              <span>✓</span>
              <span>Мэдээлэл бүрэн бичигдсэн байна. PDF татаж авах боломжтой.</span>
            </div>
          )}
        </div>

        {/* PDF Export */}
        <button
          onClick={function () { exportPDF("original"); }}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          PDF татаж авах
        </button>

        {/* Translation buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleTranslateEn}
            disabled={translatingEn}
            className="flex-1 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-60 transition flex items-center justify-center gap-1.5"
          >
            {translatingEn ? (
              <><span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block" /> Орчуулж байна...</>
            ) : "🌐 Англи орчуулга"}
          </button>
          {country === "Japan" && (
            <button
              onClick={handleTranslateJa}
              disabled={translatingJa}
              className="flex-1 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-60 transition flex items-center justify-center gap-1.5"
            >
              {translatingJa ? (
                <><span className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin inline-block" /> Орчуулж байна...</>
              ) : "🇯🇵 Япон орчуулга"}
            </button>
          )}
        </div>

        {/* AI Premium */}
        <div className="border border-dashed border-violet-300 dark:border-violet-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">Premium</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">AI-assisted Generation</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            AI тань CV-г мэргэжлийн түвшинд сайжруулна. Motivation Letter, {cfg?.extraLabel}, дутуу мэдээллийн checklist автоматаар үүснэ.
          </p>
          <button
            onClick={handleAiGenerate}
            disabled={aiLoading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
          >
            {aiLoading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> AI боловсруулж байна...</>
            ) : (
              <><span>✨</span> AI Generate</>
            )}
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 space-y-1.5">
          {[
            { l: "Улс", v: country },
            { l: "Тэтгэлэг", v: req.name || "—" },
            { l: "Байгууллага", v: req.org || "—" },
            { l: "Нэр", v: profile.fullName || "—" },
            { l: "Сургууль", v: edu.school || "—" },
            { l: "GPA", v: edu.gpa ? edu.gpa + " / " + (edu.gpaScale || "4.00") : "—" },
          ].map(function (row) {
            return (
              <div key={row.l} className="flex justify-between text-xs">
                <span className="text-gray-500">{row.l}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 text-right ml-4">{row.v}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderStepContent() {
    if (step === 1) return renderCountry();
    if (!cfg) return renderCountry();
    var key = cfg.stepKeys[step - 2];
    if (key === "requirement") return renderRequirement();
    if (key === "profile") return renderProfile();
    if (key === "education" || key === "academic") return renderEducation();
    if (key === "activities") return renderActivities();
    if (key === "essays") return renderEssays();
    if (key === "leadership") return renderLeadership();
    if (key === "criteria") return renderCriteria();
    if (key === "studyplan") return renderStudyPlan();
    if (key === "motivation") return renderMotivation();
    if (key === "preview") return renderPreviewStep();
    return null;
  }

  var previewData = { country, profile, edu, ach, ldr, goals };

  var scaledW = Math.round(794 * previewScale);

  return (
    <>
    <div className="scholarship-cv-print" data-lang="original">
      <ScholarshipCVPreview data={previewData} />
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
    <Layout rootClassName="scholarship-cv-screen">
      <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b dark:border-gray-700 bg-white dark:bg-gray-800 py-3 px-4 md:px-6 shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="min-w-0">
                <button
                  onClick={function () { navigate("/cv/start"); }}
                  className="text-xs text-gray-400 hover:text-violet-600 transition flex items-center gap-1"
                >
                  ← CV Builder
                </button>
                <h1 className="text-base font-bold text-gray-800 dark:text-gray-200 truncate">Scholarship Apply CV</h1>
              </div>
              <div className="text-xs text-gray-400 hidden sm:block shrink-0">
                {country ? country + " · " + step + "/" + allSteps.length : "US / AU / JP"}
              </div>
            </div>
            <StepIndicator steps={allSteps} current={step} maxReached={maxStep} onStepClick={function (s) { setStep(s); }} />
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Left: Form */}
          <div className="w-full md:w-[55%] border-r dark:border-gray-700 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              {cvLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : renderStepContent()}
            </div>
            {/* Sticky nav — always visible at bottom */}
            <div className="shrink-0 border-t dark:border-gray-700 px-5 md:px-6 py-3 flex items-center justify-between bg-white dark:bg-gray-800 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
              <button
                onClick={goPrev}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ← Буцах
              </button>
              <div className="flex items-center gap-2">
                {/* Preview button — mobile only */}
                <button
                  onClick={function () { setShowFullPreview(true); }}
                  className="md:hidden flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 font-semibold px-2.5 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Preview
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 disabled:opacity-60 transition"
                >
                  {saving ? (
                    <><span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin inline-block" /> Хадгалж байна...</>
                  ) : "Хадгалах"}
                </button>
                <span className="text-xs text-gray-400 font-medium">{step} / {allSteps.length}</span>
              </div>
              {!isLastStep ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 text-xs md:px-5 md:py-2 md:text-sm rounded-xl font-semibold transition shadow-sm"
                >
                  Дараах →
                </button>
              ) : (
                <div className="w-24" />
              )}
            </div>
          </div>

          {/* Right: A4 Paper Preview — hidden on mobile */}
          <div className="hidden md:flex md:w-[45%] flex-col min-h-0 bg-slate-200 dark:bg-gray-900">
            {/* Label */}
            <div className="shrink-0 pt-3 pb-1 px-4 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">Урьдчилан харах</p>
            </div>

            {/* Paper area — ResizeObserver target, scrollable */}
            <div ref={rightPanelRef} className="flex-1 overflow-y-auto mx-4 mb-1">
              <div style={{ width: scaledW + "px", margin: "12px auto" }}>
                <div style={{ width: "794px", zoom: previewScale, pointerEvents: "none" }}
                  className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18)]">
                  <ScholarshipCVPreview data={previewData} />
                </div>
              </div>
            </div>

            {/* Preview card frame + buttons */}
            <div className="shrink-0 mx-4 mb-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-300 dark:border-gray-600 shadow-sm px-3 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                <button
                  onClick={function () { setShowFullPreview(true); }}
                  className="flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Бүтнээр харах
                </button>
                {country && (
                  <button
                    onClick={handleTranslateEn}
                    disabled={translatingEn}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition disabled:opacity-50"
                  >
                    {translatingEn ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : "🌐"}
                    EN
                  </button>
                )}
                {country === "Japan" && (
                  <button
                    onClick={handleTranslateJa}
                    disabled={translatingJa}
                    className="flex items-center gap-1 text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 transition disabled:opacity-50"
                  >
                    {translatingJa ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : "🇯🇵"}
                    JA
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* English Translation Modal */}
      {showEnModal && enData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={function () { setShowEnModal(false); }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ width: "min(860px, 95vw)", maxHeight: "92vh" }}
            onClick={function (e) { e.stopPropagation(); }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">🌐 English Translation — DeepL</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={function () { exportPDF("en"); }}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PDF татах
                </button>
                <button onClick={function () { setShowEnModal(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition text-xl">×</button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 bg-slate-100 dark:bg-gray-900 p-4">
              <div style={{ width: Math.round(794 * modalScale) + "px", margin: "0 auto" }}>
                <div style={{ width: "794px", zoom: modalScale }}>
                  <ScholarshipCVPreview data={enData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Japanese Translation Modal */}
      {showJaModal && jaData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={function () { setShowJaModal(false); }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ width: "min(860px, 95vw)", maxHeight: "92vh" }}
            onClick={function (e) { e.stopPropagation(); }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">🇯🇵 日本語翻訳 — DeepL</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={function () { exportPDF("ja"); }}
                  className="text-xs bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PDF татах
                </button>
                <button onClick={function () { setShowJaModal(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition text-xl">×</button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 bg-slate-100 dark:bg-gray-900 p-4">
              <div style={{ width: Math.round(794 * modalScale) + "px", margin: "0 auto" }}>
                <div style={{ width: "794px", zoom: modalScale }}>
                  <ScholarshipCVPreview data={jaData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {showFullPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={function () { setShowFullPreview(false); }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ width: "min(860px, 95vw)", maxHeight: "92vh" }}
            onClick={function (e) { e.stopPropagation(); }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                CV урьдчилан харах
                {profile.fullName ? " — " + profile.fullName : ""}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportPDF}
                  className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={function () { setShowFullPreview(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition text-xl"
                >×</button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 bg-slate-100 dark:bg-gray-900 p-4">
              <div style={{ width: Math.round(794 * modalScale) + "px", margin: "0 auto" }}>
                <div style={{ width: "794px", zoom: modalScale }}>
                  <ScholarshipCVPreview data={previewData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* AI Generate Result Modal */}
      {showAiModal && aiResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={function () { setShowAiModal(false); }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ width: "min(760px, 95vw)", maxHeight: "90vh" }}
            onClick={function (e) { e.stopPropagation(); }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">AI Generated Content</p>
                <span className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-medium">{country}</span>
              </div>
              <button onClick={function () { setShowAiModal(false); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition text-xl">×</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 px-4 overflow-x-auto scrollbar-hide shrink-0">
              {[
                { key: "cv", label: "📄 CV", show: !!aiResult.cv },
                { key: "motivationLetter", label: "✉️ Motivation Letter", show: !!aiResult.motivationLetter },
                { key: "extraDraft", label: "📝 " + (cfg?.extraLabel || "Extra"), show: !!aiResult.extraDraft },
                { key: "checklist", label: "✅ Checklist", show: !!(aiResult.checklist && aiResult.checklist.length) },
              ].filter(function (t) { return t.show; }).map(function (t) {
                return (
                  <button key={t.key} onClick={function () { setAiTab(t.key); }}
                    className={"px-3 py-2.5 text-xs font-semibold border-b-2 -mb-px transition whitespace-nowrap " +
                      (aiTab === t.key ? "border-violet-600 text-violet-700 dark:text-violet-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")}>
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {aiTab === "checklist" ? (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Дараах мэдээллийг нэмбэл илүү хүчтэй материал болно:</p>
                  {(aiResult.checklist || []).length === 0 ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                      <span>✓</span> Мэдээлэл бүрэн гүйцэт байна!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(aiResult.checklist || []).map(function (item, i) {
                        return (
                          <div key={i} className="flex gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                            <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={function () {
                      navigator.clipboard.writeText(aiResult[aiTab] || "").then(function () { toast.success("Хуулагдлаа"); });
                    }}
                    className="absolute top-2 right-2 text-xs px-2.5 py-1 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium z-10">
                    Хуулах
                  </button>
                  <textarea
                    readOnly
                    value={aiResult[aiTab] || ""}
                    className="w-full h-[400px] border border-gray-200 dark:border-gray-600 rounded-xl p-4 pr-24 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none font-mono leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
              <p className="text-xs text-gray-400 dark:text-gray-500">✨ AI-ийн үүсгэсэн контентийг шалгаж, өөрийн мэдээллээр нийцүүлнэ үү.</p>
            </div>
          </div>
        </div>
      )}

    </Layout>
    </>
  );
}
