import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";

export default function CVDetail() {
  var params = useParams();
  var id = params.id;
  var [cv, setCv] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    API.get("/cv/" + id)
      .then(function(res) { setCv(res.data); })
      .catch(function() { setCv(null); })
      .finally(function() { setLoading(false); });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-400 text-sm">Ачааллаж байна...</div>;
  if (!cv) return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500 text-sm">CV олдсонгүй</div>;

  var p = {};
  try { p = JSON.parse(cv.personal_info || "{}"); } catch(e) { p = {}; }

  var fullName = ((p.lastName || "") + " " + (p.firstName || "")).trim() || "Нэр оруулаагүй";
  var softSkills = p.personalSkills || [];
  var techList = p.techSkills || [];
  var profList = p.profSkills || [];
  var artList = p.artSkills || [];
  var sportList = p.sportSkills || [];
  var langs = p.languages || [];
  var certsList = p.certs || [];
  var internList = p.internships || [];
  var awardsList = p.awards || [];
  var photoUrl = p.photoUrl || "";

  var phones = p.phone || "";
  if (p.phone2) phones = phones + ", " + p.phone2;

  return (
    <div className="min-h-screen bg-slate-200 print-bg-white">
      {/* Top nav (hidden on print) */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 no-print">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/cv" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900">CareerPrep</span>
          </Link>
          <div className="flex gap-2 items-center">
            <Link to="/cv" className="text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-2">← Буцах</Link>
            <Link to={"/cv/" + id + "/edit"} className="text-sm border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium px-4 py-2 rounded transition">Засах</Link>
            <button onClick={function() { window.print(); }} className="bg-[#1e3a8a] text-white px-5 py-2 rounded text-sm font-semibold hover:bg-[#1e40af] transition">
              PDF хэвлэх
            </button>
          </div>
        </div>
      </div>

      <div className="cv-container max-w-[210mm] mx-auto py-6 px-4 print-no-padding">
        <div className="bg-white shadow-sm print-no-shadow cv-page border border-slate-200">
          <div className="cv-content px-10 py-8">

            <div className="flex gap-5 mb-3">
              <div className="w-[90px] h-[110px] bg-slate-100 rounded border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-slate-300">?</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h1 className="text-[22px] font-bold text-gray-900">{fullName}</h1>
                  <div className="text-right space-y-0.5">
                    {phones && <div className="flex items-center gap-1.5 justify-end text-[11px] text-gray-700"><span className="text-[#1e3a8a]">&#9742;</span> {phones}</div>}
                    {p.email && <div className="flex items-center gap-1.5 justify-end text-[11px] text-gray-700"><span className="text-[#1e3a8a]">&#9993;</span> {p.email}</div>}
                    {p.address && <div className="flex items-center gap-1.5 justify-end text-[11px] text-gray-700"><span className="text-[#1e3a8a]">&#9906;</span> {p.address}</div>}
                    {p.linkedin && <div className="flex items-center gap-1.5 justify-end text-[11px] text-gray-700"><span className="text-[#1e3a8a]">&#9741;</span> {p.linkedin}</div>}
                  </div>
                </div>
              </div>
            </div>

            {p.about && (
              <p className="text-[11px] text-gray-600 leading-relaxed mb-2 border-b border-gray-300 pb-3">{p.about}</p>
            )}

            {(p.gender || p.birthDate || p.marital || p.regNo || p.license || p.salaryExpect) && (
              <div className="cv-section">
                <h2 className="cv-heading">Ерөнхий мэдээлэл</h2>
                <div className="grid grid-cols-3 gap-y-1.5 gap-x-4 text-[11px]">
                  {p.birthDate && <div><span className="text-gray-500">Төрсөн огноо: </span><span className="font-medium text-gray-800">{p.birthDate}</span></div>}
                  {p.gender && <div><span className="text-gray-500">Хүйс: </span><span className="font-medium text-gray-800">{p.gender}</span></div>}
                  {p.marital && <div><span className="text-gray-500">Гэрлэлтийн байдал: </span><span className="font-medium text-gray-800">{p.marital}</span></div>}
                  {p.regNo && <div><span className="text-gray-500">Регистрийн дугаар: </span><span className="font-medium text-gray-800">{p.regNo}</span></div>}
                  {p.license && p.license !== "Байхгүй" && <div><span className="text-gray-500">Жолооны үнэмлэх: </span><span className="font-medium text-gray-800">{p.license}</span></div>}
                </div>
                {p.salaryExpect && <p className="text-[11px] text-gray-500 mt-1.5">Цалингийн хүлээлт: <span className="font-medium text-gray-800">{p.salaryExpect}</span></p>}
              </div>
            )}

            {cv.educations && cv.educations.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-heading">Боловсрол</h2>
                {cv.educations.map(function(edu) {
                  return (
                    <div key={edu.id} className="mb-2.5">
                      <div className="flex justify-between items-start">
                        <p className="text-[13px] font-bold text-gray-900">{edu.school}</p>
                        <p className="text-[11px] text-gray-500 whitespace-nowrap ml-4">{edu.start_year} - {edu.end_year || "Суралцаж байгаа"}</p>
                      </div>
                      <p className="text-[11px] text-gray-600">Бакалавр | {edu.major} {edu.gpa ? "| " + edu.gpa + " голч" : ""} | Монгол</p>
                      <div className="border-b border-gray-100 mt-2"></div>
                    </div>
                  );
                })}
              </div>
            )}

            {cv.experiences && cv.experiences.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-heading">Ажлын туршлага</h2>
                {cv.experiences.map(function(exp) {
                  return (
                    <div key={exp.id} className="mb-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[13px] font-bold text-gray-900">{exp.company}</p>
                          <p className="text-[11px] text-gray-600">{exp.position}</p>
                        </div>
                        <p className="text-[11px] text-gray-500 whitespace-nowrap ml-4">{exp.start_date} - {exp.end_date || "Одоо"}</p>
                      </div>
                      {exp.description && <p className="text-[11px] text-gray-500 mt-1">{exp.description}</p>}
                      <div className="border-b border-gray-100 mt-2"></div>
                    </div>
                  );
                })}
              </div>
            )}

            {certsList.length > 0 && certsList.some(function(c) { return c.name; }) && (
              <div className="cv-section">
                <h2 className="cv-heading">Сургалт, сертификат</h2>
                {certsList.filter(function(c) { return c.name; }).map(function(c, i) {
                  return (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[13px] font-bold text-gray-900">{c.name}</p>
                          <p className="text-[11px] text-gray-500">{c.organization}</p>
                        </div>
                        <p className="text-[11px] text-gray-500 whitespace-nowrap ml-4">{c.start_date} - {c.end_date}</p>
                      </div>
                      <div className="border-b border-gray-100 mt-2"></div>
                    </div>
                  );
                })}
              </div>
            )}

            {awardsList.length > 0 && awardsList.some(function(a) { return a.name; }) && (
              <div className="cv-section">
                <h2 className="cv-heading">Шагнал урамшуулал</h2>
                {awardsList.filter(function(a) { return a.name; }).map(function(a, i) {
                  return (
                    <div key={i} className="flex justify-between mb-1.5">
                      <p className="text-[13px] font-bold text-gray-900">{a.name}</p>
                      <p className="text-[11px] text-gray-500">{a.year}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {(softSkills.length > 0 || techList.length > 0 || langs.length > 0 || profList.length > 0 || artList.length > 0 || sportList.length > 0) && (
              <div className="cv-section">
                <h2 className="cv-heading">Ур чадвар</h2>

                {softSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-bold text-gray-800 mb-1.5">Хувийн ур чадвар:</p>
                    <div className="grid grid-cols-3 gap-x-3 gap-y-0.5">
                      {softSkills.map(function(s, i) {
                        return <p key={i} className="text-[11px] text-gray-600">{"• " + s}</p>;
                      })}
                    </div>
                  </div>
                )}

                {langs.length > 0 && langs.some(function(l) { return l.name; }) && (
                  <div className="mb-3">
                    <p className="text-[11px] font-bold text-gray-800 mb-1.5">Гадаад хэлний мэдлэг:</p>
                    {langs.filter(function(l) { return l.name; }).map(function(l, i) {
                      return <p key={i} className="text-[11px] text-gray-600 ml-2">{l.name} ({l.level})</p>;
                    })}
                  </div>
                )}

                {techList.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-bold text-gray-800 mb-1.5">Компьютерын программын мэдлэг:</p>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
                      {techList.map(function(s, i) {
                        return <p key={i} className="text-[11px] text-gray-600">{s} (70%)</p>;
                      })}
                    </div>
                  </div>
                )}

                {artList.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-bold text-gray-800 mb-1.5">Урлагийн ур чадвар:</p>
                    <p className="text-[11px] text-gray-600 ml-2">{artList.join(", ")}</p>
                  </div>
                )}

                {sportList.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-bold text-gray-800 mb-1.5">Спортын ур чадвар:</p>
                    <p className="text-[11px] text-gray-600 ml-2">{sportList.join(", ")}</p>
                  </div>
                )}

                {profList.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-bold text-gray-800 mb-1.5">Мэргэжлийн ур чадвар:</p>
                    <div className="grid grid-cols-3 gap-x-3 gap-y-0.5">
                      {profList.map(function(s, i) {
                        return <p key={i} className="text-[11px] text-gray-600">{"• " + s}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {internList.length > 0 && internList.some(function(n) { return n.company; }) && (
              <div className="cv-section">
                <h2 className="cv-heading">Дадлага</h2>
                {internList.filter(function(n) { return n.company; }).map(function(n, i) {
                  return (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[13px] font-bold text-gray-900">{n.title}</p>
                          <p className="text-[11px] text-gray-500">{n.company}</p>
                        </div>
                        <p className="text-[11px] text-gray-500 whitespace-nowrap ml-4">{n.start_date} - {n.end_date}</p>
                      </div>
                      {n.description && <p className="text-[11px] text-gray-500 mt-1">{n.description}</p>}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
          <div className="px-10 pb-6 flex justify-between items-center border-t border-gray-200 pt-3 mt-8">
            <p className="text-[10px] text-gray-400">CareerPrep | {new Date().toLocaleDateString("mn-MN")}</p>
            <p className="text-[10px] text-gray-400">careerprep.mn</p>
          </div>
        </div>
      </div>

  <style dangerouslySetInnerHTML={{ __html: `
  .cv-heading {
    font-size: 15px;
    font-weight: 700;
    color: #1e3a8a;
    margin-bottom: 6px;
    padding-bottom: 4px;
    border-bottom: 2px solid #1e3a8a;

    /* heading доор ганцаараа үлдэхгүй */
    page-break-after: avoid;
  }

  /*  SECTION-ийг таслахыг зөвшөөрнө */
  .cv-section {
    margin-top: 16px;
    break-inside: auto;
    page-break-inside: auto;
  }

  /*  ITEM бүр тасрахгүй */
  .cv-item {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .no-print { display: block; }
  .print-bg-white { background: #e2e8f0; }

  @media print {
    html, body {
      background: white !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .no-print { display: none !important; }
    .print-bg-white { background: white !important; }

    .cv-container {
      padding: 0 !important;
      max-width: none !important;
    }

    .cv-page {
      box-shadow: none !important;
      border: none !important;
    }

    .cv-content {
      padding: 20px 30px !important;
    }

    /* section тасарч болно */
    .cv-section {
      break-inside: auto;
      page-break-inside: auto;
    }

    /* item тасрахгүй */
    .cv-item {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* A4 тохиргоо */
    @page {
      margin: 15mm;
      size: A4;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
` }} />
    </div>
  );
}