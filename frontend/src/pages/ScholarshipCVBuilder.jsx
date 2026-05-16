import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center overflow-x-auto pb-1 gap-0">
      {steps.map(function (s, i) {
        var done = i + 1 < current;
        var active = i + 1 === current;
        return (
          <div key={i} className="flex items-center shrink-0">
            <div className="flex flex-col items-center">
              <div className={[
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                done ? "bg-violet-600 text-white" :
                active ? "bg-violet-600 text-white ring-4 ring-violet-100 dark:ring-violet-900/40" :
                "bg-gray-100 dark:bg-gray-700 text-gray-400",
              ].join(" ")}>
                {done ? "✓" : i + 1}
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
  var previewRef = useRef(null);

  var [step, setStep] = useState(1);
  var [country, setCountry] = useState("");
  var [req, setReq] = useState({ text: "", name: "", org: "", deadline: "", program: "" });
  var [profile, setProfile] = useState({ fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" });
  var [edu, setEdu] = useState({ school: "", degree: "", major: "", gpa: "", gpaScale: "4.00", graduationYear: "", coursework: "" });
  var [ach, setAch] = useState({ awards: "", competitions: "", certificates: "", langScores: [] });
  var [ldr, setLdr] = useState({ leadership: "", volunteer: "", extracurricular: "", projects: "", work: "", background: "" });
  var [goals, setGoals] = useState({ careerGoal: "", whyScholarship: "", whyCountry: "", howContribute: "", impactPlan: "", studyPlan: "" });
  var [cvList, setCvList] = useState([]);
  var [showImport, setShowImport] = useState(false);
  var [showFullPreview, setShowFullPreview] = useState(false);
  var [previewScale, setPreviewScale] = useState(0.55);
  var [modalScale, setModalScale] = useState(1);
  var rightPanelRef = useRef(null);
  var modalContentRef = useRef(null);
  var [jaText, setJaText] = useState(null);
  var [translating, setTranslating] = useState(false);
  var [showJaModal, setShowJaModal] = useState(false);

  var cfg = country ? COUNTRY_CONFIG[country] : null;
  var allSteps = cfg ? ["Country", ...cfg.steps] : DEFAULT_STEPS;
  var isLastStep = step === allSteps.length;

  useEffect(function () {
    API.get("/cv").then(function (res) {
      if (res.data && res.data.length > 0) setCvList(res.data);
    }).catch(function () {});
  }, []);

  useEffect(function () {
    if (!showFullPreview) return;
    var t = setTimeout(function () {
      if (!modalContentRef.current) return;
      var available = modalContentRef.current.clientWidth - 32;
      setModalScale(Math.min(1, available / 794));
    }, 0);
    return function () { clearTimeout(t); };
  }, [showFullPreview]);

  useEffect(function () {
    if (!rightPanelRef.current) return;
    var obs = new ResizeObserver(function (entries) {
      for (var entry of entries) {
        var w = entry.contentRect.width;
        var h = entry.contentRect.height;
        var byW = (w - 24) / 794;
        var byH = (h - 24) / 1123;
        setPreviewScale(Math.max(0.25, Math.min(0.9, Math.min(byW, byH))));
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
    setAch(function (p) { return { ...p, langScores: [...p.langScores, { type: "IELTS", score: "" }] }; });
  }

  function updateLangScore(i, field, val) {
    setAch(function (p) {
      return { ...p, langScores: p.langScores.map(function (ls, idx) { return idx === i ? { ...ls, [field]: val } : ls; }) };
    });
  }

  function removeLangScore(i) {
    setAch(function (p) { return { ...p, langScores: p.langScores.filter(function (_, idx) { return idx !== i; }) }; });
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

  async function handleTranslateJa() {
    var lines = [];
    if (profile.fullName) lines.push(profile.fullName);
    var contact = [profile.email, profile.phone, profile.location].filter(Boolean).join(" | ");
    if (contact) lines.push(contact);
    lines.push("");

    lines.push("EDUCATION\n---");
    if (edu.school) lines.push(edu.school);
    if (edu.degree || edu.major) lines.push([edu.degree, edu.major].filter(Boolean).join(", "));
    if (edu.gpa) lines.push("GPA: " + edu.gpa + " / " + (edu.gpaScale || "4.00"));
    if (edu.coursework) lines.push("Relevant Coursework: " + edu.coursework);
    lines.push("");

    var hasAch = ach.awards || ach.competitions || ach.certificates || (ach.langScores && ach.langScores.some(function (ls) { return ls.type && ls.score; }));
    if (hasAch) {
      lines.push("ACADEMIC ACHIEVEMENTS & AWARDS\n---");
      if (ach.awards) lines.push(ach.awards);
      if (ach.competitions) lines.push(ach.competitions);
      if (ach.certificates) lines.push(ach.certificates);
      ach.langScores.filter(function (ls) { return ls.type && ls.score; }).forEach(function (ls) { lines.push(ls.type + ": " + ls.score); });
      lines.push("");
    }

    if (ldr.leadership || ldr.volunteer || ldr.extracurricular) {
      lines.push("LEADERSHIP & VOLUNTEER EXPERIENCE\n---");
      if (ldr.leadership) lines.push(ldr.leadership);
      if (ldr.volunteer) lines.push(ldr.volunteer);
      if (ldr.extracurricular) lines.push(ldr.extracurricular);
      lines.push("");
    }

    if (ldr.projects) {
      lines.push("RESEARCH & PROJECTS\n---");
      lines.push(ldr.projects);
      lines.push("");
    }

    if (ldr.work) {
      lines.push("WORK & INTERNSHIP EXPERIENCE\n---");
      lines.push(ldr.work);
      lines.push("");
    }

    if (goals.studyPlan) {
      lines.push("STUDY PLAN (研究計画書)\n---");
      lines.push(goals.studyPlan);
      lines.push("");
    }

    var hasGoals = goals.careerGoal || goals.whyScholarship || goals.whyCountry || goals.howContribute || goals.impactPlan;
    if (hasGoals) {
      lines.push("GOALS & MOTIVATION\n---");
      if (goals.careerGoal) lines.push("Career Goal: " + goals.careerGoal);
      if (goals.whyScholarship) lines.push("Why This Scholarship: " + goals.whyScholarship);
      if (goals.whyCountry) lines.push("Why Japan / Target Lab: " + goals.whyCountry);
      if (goals.howContribute) lines.push("Contribution Plan: " + goals.howContribute);
      if (goals.impactPlan) lines.push("Post-Scholarship Impact: " + goals.impactPlan);
    }

    var text = lines.join("\n");
    setTranslating(true);
    try {
      var res = await API.post("/cv/scholarship-translate", { text, targetLang: "JA" });
      setJaText(res.data.translatedText);
      setShowJaModal(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Орчуулахад алдаа гарлаа");
    } finally {
      setTranslating(false);
    }
  }

  async function exportPDF() {
    if (!previewRef.current) { toast.error("Preview олдсонгүй"); return; }
    var loadId = toast.loading("PDF үүсгэж байна...");
    try {
      var html2canvas = (await import("html2canvas")).default;
      var { jsPDF } = await import("jspdf");
      var canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      var imgData = canvas.toDataURL("image/png");
      var pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      var pageW = pdf.internal.pageSize.getWidth();
      var pageH = pdf.internal.pageSize.getHeight();
      var imgH = (canvas.height * pageW) / canvas.width;
      var y = 0;
      pdf.addImage(imgData, "PNG", 0, y, pageW, imgH);
      var remaining = imgH - pageH;
      while (remaining > 0) {
        pdf.addPage();
        y -= pageH;
        pdf.addImage(imgData, "PNG", 0, y, pageW, imgH);
        remaining -= pageH;
      }
      var fname = ((profile.fullName || "scholarship").replace(/\s+/g, "_")) + "_" + country.replace(/\s+/g, "_") + "_CV.pdf";
      pdf.save(fname);
      toast.success("PDF татагдлаа!", { id: loadId });
    } catch {
      toast.error("PDF үүсгэхэд алдаа гарлаа", { id: loadId });
    }
  }

  function goNext() {
    if (step === 1 && !country) { toast.error("Улс сонгоно уу"); return; }
    setStep(function (s) { return s + 1; });
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
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + c.badge}>{c.focus}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">{c.note}</span>
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
                    <div key={i} className="flex gap-2 items-center">
                      <select className={sCls} value={ls.type} onChange={function (e) { updateLangScore(i, "type", e.target.value); }}>
                        {LANG_TYPES.map(function (t) { return <option key={t} value={t}>{t}</option>; })}
                      </select>
                      <input className={iCls} placeholder="Score, e.g. 7.0, 105, N2..." value={ls.score} onChange={function (e) { updateLangScore(i, "score", e.target.value); }} />
                      <button onClick={function () { removeLangScore(i); }} className="text-gray-400 hover:text-red-500 transition shrink-0 text-xl leading-none">×</button>
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
          onClick={exportPDF}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          PDF татаж авах
        </button>

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
            onClick={function () { toast("AI Premium удахгүй нэмэгдэнэ! 🚀", { duration: 3000 }); }}
            className="w-full bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 text-violet-700 dark:text-violet-300 py-2.5 rounded-xl text-sm font-semibold border border-violet-200 dark:border-violet-700 hover:from-violet-200 hover:to-indigo-200 dark:hover:from-violet-900/50 dark:hover:to-indigo-900/50 transition"
          >
            AI Generate (Premium) — Удахгүй
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
  var scaledH = Math.round(1123 * previewScale);

  return (
    <Layout>
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
            <StepIndicator steps={allSteps} current={step} />
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Left: Form */}
          <div className="w-full md:w-[55%] border-r dark:border-gray-700 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              {renderStepContent()}
            </div>
            {/* Sticky nav — always visible at bottom */}
            <div className="shrink-0 border-t dark:border-gray-700 px-5 md:px-6 py-3 flex items-center justify-between bg-white dark:bg-gray-800 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
              <button
                onClick={goPrev}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ← Буцах
              </button>
              <div className="flex items-center gap-3">
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
                <span className="text-xs text-gray-400 font-medium">{step} / {allSteps.length}</span>
              </div>
              {!isLastStep ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
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

            {/* Paper area — ResizeObserver target */}
            <div ref={rightPanelRef} className="relative flex-1 overflow-hidden mx-4 mb-1">
              {/* Centered A4 paper with exact scaled dimensions */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: scaledW + "px",
                height: scaledH + "px",
                overflow: "hidden",
              }}>
                <div style={{
                  width: "794px",
                  height: "1123px",
                  transform: "scale(" + previewScale + ")",
                  transformOrigin: "top left",
                  pointerEvents: "none",
                }} className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18)]">
                  <ScholarshipCVPreview data={previewData} innerRef={previewRef} />
                </div>
              </div>
            </div>

            {/* Preview card frame + button — matches CVBuilder */}
            <div className="shrink-0 mx-4 mb-3">
              <div className={["bg-white dark:bg-gray-800 rounded-xl border border-slate-300 dark:border-gray-600 shadow-sm px-3 py-2.5 flex items-center", country === "Japan" ? "justify-between" : "justify-center"].join(" ")}>
                <button
                  onClick={function () { setShowFullPreview(true); }}
                  className="flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Бүтнээр харах
                </button>
                {country === "Japan" && (
                  <button
                    onClick={handleTranslateJa}
                    disabled={translating}
                    className="flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 transition disabled:opacity-50"
                  >
                    {translating ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <span className="text-base leading-none">🇯🇵</span>
                    )}
                    日本語
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Japanese Translation Modal */}
      {showJaModal && jaText && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={function () { setShowJaModal(false); }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ width: "min(720px, 95vw)", maxHeight: "88vh" }}
            onClick={function (e) { e.stopPropagation(); }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-base">🇯🇵</span>
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">日本語翻訳 — DeepL (無料)</p>
                <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-medium">Free</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={function () {
                    navigator.clipboard.writeText(jaText).then(function () {
                      toast.success("Хуулагдлаа!");
                    }).catch(function () {
                      toast.error("Хуулах боломжгүй байна");
                    });
                  }}
                  className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Хуулах
                </button>
                <button
                  onClick={function () { setShowJaModal(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition text-xl"
                >×</button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3 mb-4 text-xs text-rose-600 dark:text-rose-400">
                DeepL үнэгүй орчуулга. AI Premium-д илүү байгалийн, мэргэжлийн орчуулга боломжтой болно.
              </div>
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">{jaText}</pre>
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
            <div className="overflow-y-auto flex-1 bg-slate-100 dark:bg-gray-900 p-4" ref={modalContentRef}>
              <div style={{
                width: Math.round(794 * modalScale) + "px",
                height: Math.round(1123 * modalScale) + "px",
                overflow: "hidden",
                margin: "0 auto",
              }}>
                <div style={{ width: "794px", transform: "scale(" + modalScale + ")", transformOrigin: "top left" }}>
                  <ScholarshipCVPreview data={previewData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
