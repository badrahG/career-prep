import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function CVDetail() {
  var params = useParams();
  var navigate = useNavigate();
  var id = params.id;

  var [cv, setCv] = useState(null);
  var [loading, setLoading] = useState(true);
  var [downloading, setDownloading] = useState(false);
  var [notFound, setNotFound] = useState(false);
  var printRef = useRef(null);

  useEffect(function () {
    API.get("/cv/" + id)
      .then(function (res) { setCv(res.data); })
      .catch(function () { setNotFound(true); })
      .finally(function () { setLoading(false); });
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Энэ CV-г устгах уу?")) return;
    try {
      await API.delete("/cv/" + id);
      toast.success("CV устгагдлаа");
      navigate("/cv");
    } catch (err) {
      toast.error("Устгахад алдаа");
    }
  }

  async function handleDownloadPDF() {
    if (!printRef.current) { toast.error("CV агуулга ачаалагдаагүй"); return; }
    if (downloading) return;
    setDownloading(true);
    var tid = toast.loading("PDF бэлтгэж байна...");
    try {
      var jsPDFModule = await import("jspdf");
      var html2canvasModule = await import("html2canvas");
      var jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      var html2canvas = html2canvasModule.default || html2canvasModule;

      var canvas = await html2canvas(printRef.current, {
        scale: 2, useCORS: true, backgroundColor: "#ffffff",
      });
      var pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      var pdfWidth = pdf.internal.pageSize.getWidth();
      var pdfHeight = pdf.internal.pageSize.getHeight();
      var imgWidth = pdfWidth;
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      var imgData = canvas.toDataURL("image/png");
      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        var heightLeft = imgHeight;
        var position = 0;
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      }
      var safeName = (cv.name || "CV").replace(/[^\w\u0400-\u04FF-]/g, "_");
      pdf.save("CV_" + safeName + ".pdf");
      toast.success("PDF татагдлаа!", { id: tid });
    } catch (err) {
      console.error(err);
      toast.dismiss(tid);
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-12">
          <p className="text-slate-400 text-sm">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }
  if (notFound || !cv) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-12 text-center">
          <p className="text-slate-600 text-sm mb-4">CV олдсонгүй.</p>
          <Link to="/cv" className="inline-block bg-[#1e3a8a] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition">← CV жагсаалт</Link>
        </div>
      </div>
    );
  }

  // Parse personal_info
  var info = {};
  try { info = cv.personal_info ? JSON.parse(cv.personal_info) : {}; } catch (e) { info = {}; }

  var fullName = [info.lastName, info.firstName].filter(Boolean).join(" ");
  var educations = Array.isArray(cv.educations) ? cv.educations : [];
  var experiences = Array.isArray(cv.experiences) ? cv.experiences : [];
  var skills = Array.isArray(cv.skills) ? cv.skills : [];

  // Info-оос ирэх list-уудыг авах
  var personalSkills = info.personalSkills || [];
  var techSkills = info.techSkills || [];
  var profSkills = info.profSkills || [];
  var artSkills = info.artSkills || [];
  var sportSkills = info.sportSkills || [];
  var languages = info.languages || [];
  var certs = info.certs || [];
  var internships = info.internships || [];
  var awards = info.awards || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
      </div>

      {/* Top bar */}
      <div className="bg-[#1e3a8a] text-white text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-2">
          Залуучуудын ажилд орох бэлтгэлийг дэмжих платформ
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-sm tracking-wide">CP</span>
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 leading-none">CareerPrep</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Career Platform</div>
            </div>
          </Link>
          <Link to="/cv" className="text-sm text-slate-600 hover:text-[#1e3a8a] font-medium transition">← CV жагсаалт</Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 px-4 py-8 relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* Header card */}
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-8 py-6 shadow-lg mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">CV дэлгэрэнгүй</p>
              <h1 className="text-2xl font-bold text-slate-900">{cv.name}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-60 transition"
              >
                {downloading ? "Бэлтгэж байна..." : "⬇ PDF татах"}
              </button>
              <Link to={"/cv/" + cv.id + "/edit"} className="px-5 py-2.5 border border-slate-300 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Засах</Link>
              <button onClick={handleDelete} className="px-5 py-2.5 border border-red-300 rounded text-sm font-semibold text-red-600 hover:bg-red-50 transition">Устгах</button>
            </div>
          </div>

          {/* PRINTABLE CV */}
          <div
            ref={printRef}
            className="bg-white shadow-lg mx-auto"
            style={{
              width: "210mm",
              minHeight: "297mm",
              maxWidth: "100%",
              color: "#1f2937",
              padding: "36px 44px",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {/* ========== HEADER (photo + name + contacts) ========== */}
            <div style={{ display: "flex", gap: "24px", marginBottom: "20px" }}>
              {info.photoUrl && (
                <img
                  src={info.photoUrl}
                  alt=""
                  style={{ width: "130px", height: "160px", objectFit: "cover", borderRadius: "2px", flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px" }}>
                <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#1e3a8a", lineHeight: 1.1 }}>
                  {fullName || "Нэр оруулаагүй"}
                </h1>
                <div style={{ fontSize: "12px", color: "#475569", textAlign: "right", lineHeight: 1.8 }}>
                  {info.phone && <div>☎ {info.phone}{info.phone2 ? ", " + info.phone2 : ""}</div>}
                  {info.email && <div>✉ {info.email}</div>}
                  {info.address && <div>📍 {info.address}</div>}
                  {info.linkedin && <div>🔗 {info.linkedin}</div>}
                </div>
              </div>
            </div>

            {/* About */}
            {info.about && (
              <p style={{ fontSize: "12px", lineHeight: 1.6, color: "#475569", marginBottom: "20px", whiteSpace: "pre-line" }}>
                {info.about}
              </p>
            )}

            {/* Ерөнхий мэдээлэл */}
            {(info.birthDate || info.gender || info.marital || info.regNo || info.license || info.salaryExpect) && (
              <Section title="Ерөнхий мэдээлэл">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 24px", fontSize: "12px" }}>
                  {info.birthDate && <Field label="Төрсөн огноо" value={info.birthDate} />}
                  {info.gender && <Field label="Хүйс" value={info.gender} />}
                  {info.marital && <Field label="Гэрлэлтийн байдал" value={info.marital} />}
                  {info.regNo && <Field label="Регистрийн дугаар" value={info.regNo} />}
                  {info.license && <Field label="Жолооны үнэмлэх" value={info.license} />}
                  {info.salaryExpect && <Field label="Цалингийн хүлээлт" value={info.salaryExpect} />}
                </div>
              </Section>
            )}

            {/* Боловсрол */}
            {educations.length > 0 && (
              <Section title="Боловсрол">
                {educations.map(function (edu, i) {
                  var period = edu.start_year ? edu.start_year + " - " + (edu.end_year || "Суралцаж байгаа") : "";
                  return (
                    <div key={i} style={{ marginBottom: i < educations.length - 1 ? "10px" : "0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "bold", color: "#0f172a" }}>
                          {edu.school}
                        </p>
                        <p style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>{period}</p>
                      </div>
                      <p style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>
                        {[edu.level || edu.degree, edu.major, edu.gpa ? edu.gpa + " голч" : "", edu.country].filter(Boolean).join(" | ")}
                      </p>
                    </div>
                  );
                })}
              </Section>
            )}

            {/* Ажлын туршлага */}
            {experiences.length > 0 && (
              <Section title="Ажлын туршлага">
                {experiences.map(function (exp, i) {
                  var period = exp.start_date ? exp.start_date + " - " + (exp.end_date || "Одоо") : "";
                  return (
                    <div key={i} style={{ marginBottom: i < experiences.length - 1 ? "10px" : "0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: "bold", color: "#0f172a" }}>{exp.position}</p>
                          <p style={{ fontSize: "12px", color: "#1e3a8a", marginTop: "1px" }}>{exp.company}</p>
                        </div>
                        <p style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>{period}</p>
                      </div>
                      {exp.description && (
                        <p style={{ fontSize: "12px", color: "#475569", marginTop: "4px", whiteSpace: "pre-line" }}>{exp.description}</p>
                      )}
                    </div>
                  );
                })}
              </Section>
            )}

            {/* Дадлага */}
            {internships.length > 0 && (
              <Section title="Дадлага">
                {internships.map(function (n, i) {
                  var period = n.start_date ? n.start_date + " - " + (n.end_date || "") : "";
                  return (
                    <div key={i} style={{ marginBottom: i < internships.length - 1 ? "10px" : "0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: "bold", color: "#0f172a" }}>{n.title}</p>
                          <p style={{ fontSize: "12px", color: "#1e3a8a", marginTop: "1px" }}>{n.company}</p>
                        </div>
                        <p style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>{period}</p>
                      </div>
                      {n.description && <p style={{ fontSize: "12px", color: "#475569", marginTop: "4px", whiteSpace: "pre-line" }}>{n.description}</p>}
                    </div>
                  );
                })}
              </Section>
            )}

            {/* Сургалт, сертификат */}
            {certs.length > 0 && (
              <Section title="Сургалт, сертификат">
                {certs.map(function (c, i) {
                  var period = c.start_date ? c.start_date + (c.end_date ? " - " + c.end_date : "") : "";
                  return (
                    <div key={i} style={{ marginBottom: i < certs.length - 1 ? "8px" : "0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "bold", color: "#0f172a" }}>{c.name}</p>
                        <p style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>{period}</p>
                      </div>
                      {c.organization && <p style={{ fontSize: "12px", color: "#475569" }}>{c.organization}</p>}
                    </div>
                  );
                })}
              </Section>
            )}

            {/* Шагнал */}
            {awards.length > 0 && (
              <Section title="Шагнал урамшуулал">
                {awards.map(function (a, i) {
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingTop: "4px", paddingBottom: "4px", borderBottom: i < awards.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                      <p style={{ fontSize: "12px", fontWeight: "600", color: "#0f172a" }}>{a.name}</p>
                      {a.year && <p style={{ fontSize: "11px", color: "#64748b" }}>{a.year}</p>}
                    </div>
                  );
                })}
              </Section>
            )}

            {/* Ур чадвар (all sub-sections) */}
            {(personalSkills.length > 0 || techSkills.length > 0 || profSkills.length > 0 || artSkills.length > 0 || sportSkills.length > 0 || languages.length > 0) && (
              <Section title="Ур чадвар">
                {personalSkills.length > 0 && <SkillGroup title="Хувийн ур чадвар:" items={personalSkills} bullets />}
                {languages.length > 0 && (
                  <SkillGroup title="Гадаад хэлний мэдлэг:" items={languages.map(function (l) { return l.name + (l.level ? " (" + l.level + ")" : ""); })} />
                )}
                {techSkills.length > 0 && <SkillGroup title="Компьютерын программын мэдлэг:" items={techSkills.map(function (s) { return s + " (70%)"; })} columns={3} />}
                {profSkills.length > 0 && <SkillGroup title="Мэргэжлийн ур чадвар:" items={profSkills} bullets />}
                {artSkills.length > 0 && <SkillGroup title="Урлагийн ур чадвар:" items={[artSkills.join(", ")]} />}
                {sportSkills.length > 0 && <SkillGroup title="Спортын ур чадвар:" items={[sportSkills.join(", ")]} />}
              </Section>
            )}

            {/* Skills from skills array (fallback — if backend нь skill-үүдийг массивт хадгалсан бол) */}
            {skills.length > 0 && personalSkills.length === 0 && techSkills.length === 0 && (
              <Section title="Ур чадвар">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {skills.map(function (s, i) {
                    return (
                      <span key={i} style={{
                        fontSize: "11px",
                        backgroundColor: "#eff6ff",
                        color: "#1e3a8a",
                        border: "1px solid #dbeafe",
                        padding: "3px 8px",
                        borderRadius: "3px",
                      }}>
                        {s.skill_name}{s.level ? " · " + s.level : ""}
                      </span>
                    );
                  })}
                </div>
              </Section>
            )}
          </div>

          <p className="text-center text-xs text-slate-500 mt-6 mb-4">
            PDF татахын өмнө мэдээллээ шалгана уу.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ Helper components ============

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <h2 style={{
        fontSize: "15px",
        fontWeight: "bold",
        color: "#1e3a8a",
        marginBottom: "8px",
        paddingBottom: "4px",
        borderBottom: "2px solid #1e3a8a",
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span style={{ color: "#64748b" }}>{label}: </span>
      <span style={{ fontWeight: "600", color: "#0f172a" }}>{value}</span>
    </div>
  );
}

function SkillGroup({ title, items, bullets, columns }) {
  var cols = columns || 3;
  return (
    <div style={{ marginBottom: "10px" }}>
      <p style={{ fontSize: "12px", fontWeight: "bold", color: "#0f172a", marginBottom: "4px" }}>{title}</p>
      {bullets ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(" + cols + ", 1fr)",
          gap: "2px 16px",
          fontSize: "12px",
          color: "#334155",
        }}>
          {items.map(function (s, i) { return <div key={i}>• {s}</div>; })}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(" + cols + ", 1fr)",
          gap: "2px 16px",
          fontSize: "12px",
          color: "#475569",
        }}>
          {items.map(function (s, i) { return <div key={i}>{s}</div>; })}
        </div>
      )}
    </div>
  );
}