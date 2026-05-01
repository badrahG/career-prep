export default function CVPreview({ cv, info, template }) {
  var educations = Array.isArray(cv.educations) ? cv.educations : [];
  var experiences = Array.isArray(cv.experiences) ? cv.experiences : [];
  var skills = Array.isArray(cv.skills) ? cv.skills : [];
  var props = { cv, info, educations, experiences, skills };
  if (template === "classic") return <ClassicTemplate {...props} />;
  if (template === "minimal") return <MinimalTemplate {...props} />;
  return <ModernTemplate {...props} />;
}

var skillTagBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "24px",
  padding: "3px 10px",
  borderRadius: "999px",
  lineHeight: 1.25,
  verticalAlign: "middle",
  textAlign: "center",
  whiteSpace: "normal",
  wordBreak: "break-word",
};

function CertFilePreview({ url }) {
  if (!url) return null;
  var lower = url.toLowerCase();
  var isImage = lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: "6px" }}>
        <img src={url} alt="Гэрчилгээ" style={{ width: "130px", height: "92px", objectFit: "cover", borderRadius: "4px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.10)", display: "block" }} />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "6px", padding: "5px 10px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "4px", textDecoration: "none" }}>
      <span style={{ fontSize: "15px" }}>📄</span>
      <span style={{ fontSize: "10.5px", color: "#c2410c", fontWeight: "600" }}>Гэрчилгээ нээх</span>
    </a>
  );
}

function parseSkillsFromInfo(info) {
  return {
    personalSkills: info.personalSkills || [],
    techSkills: info.techSkills || [],
    profSkills: info.profSkills || [],
    artSkills: info.artSkills || [],
    sportSkills: info.sportSkills || [],
    languages: info.languages || [],
    certs: info.certs || [],
    internships: info.internships || [],
    awards: info.awards || [],
  };
}

function ModernTemplate({ info, educations, experiences, skills }) {
  var { personalSkills, techSkills, profSkills, artSkills, sportSkills, languages, certs, internships, awards } = parseSkillsFromInfo(info);
  var fullName = [info.lastName, info.firstName].filter(Boolean).join(" ");
  var hasSkillSections = personalSkills.length > 0 || techSkills.length > 0 || profSkills.length > 0 || artSkills.length > 0 || sportSkills.length > 0 || languages.length > 0;
  return (
    <div className="cv-print-document" style={{ background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif", color: "#1f2937", minHeight: "297mm" }}>
      <div className="cv-print-section" style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)", color: "#fff", padding: "28px 36px 24px" }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
          {info.photoUrl && <img src={info.photoUrl} alt="" style={{ width: "100px", height: "124px", objectFit: "cover", borderRadius: "4px", border: "3px solid rgba(255,255,255,0.3)", flexShrink: 0 }} />}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px", margin: 0, lineHeight: 1.1 }}>{fullName || "Нэр оруулаагүй"}</h1>
            {info.about && <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.85, lineHeight: 1.5, maxWidth: "480px" }}>{info.about}</p>}
          </div>
          <div style={{ textAlign: "right", fontSize: "11px", lineHeight: 2, opacity: 0.9, flexShrink: 0 }}>
            {info.phone && <div>☎ {info.phone}{info.phone2 ? ", " + info.phone2 : ""}</div>}
            {info.email && <div>✉ {info.email}</div>}
            {info.address && <div>📍 {info.address}</div>}
            {info.linkedin && <div>🔗 {info.linkedin}</div>}
          </div>
        </div>
      </div>
      <div style={{ padding: "24px 36px" }}>
        {(info.birthDate || info.gender || info.marital || info.regNo || info.license || info.salaryExpect) && (
          <ModernSection title="Ерөнхий мэдээлэл">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 24px", fontSize: "11.5px" }}>
              {info.birthDate && <div><span style={{ color: "#6b7280" }}>Төрсөн огноо: </span><b>{info.birthDate}</b></div>}
              {info.gender && <div><span style={{ color: "#6b7280" }}>Хүйс: </span><b>{info.gender}</b></div>}
              {info.marital && <div><span style={{ color: "#6b7280" }}>Гэрлэлт: </span><b>{info.marital}</b></div>}
              {info.regNo && <div><span style={{ color: "#6b7280" }}>Регистр: </span><b>{info.regNo}</b></div>}
              {info.license && <div><span style={{ color: "#6b7280" }}>Жолоо: </span><b>{info.license}</b></div>}
              {info.salaryExpect && <div><span style={{ color: "#6b7280" }}>Цалин: </span><b>{info.salaryExpect}</b></div>}
            </div>
          </ModernSection>
        )}
        {educations.length > 0 && (
          <ModernSection title="Боловсрол">
            {educations.map(function (edu, i) {
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < educations.length - 1 ? "10px" : 0, paddingBottom: i < educations.length - 1 ? "10px" : 0, borderBottom: i < educations.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div>
                    <p style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a", margin: 0 }}>{edu.school}</p>
                    <p style={{ fontSize: "11.5px", color: "#475569", marginTop: "2px" }}>{[edu.level || edu.degree, edu.major, edu.gpa ? edu.gpa + " голч" : ""].filter(Boolean).join(" · ")}</p>
                  </div>
                  <p style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap", marginLeft: "12px" }}>{edu.start_year ? edu.start_year + " – " + (edu.end_year || "одоо") : ""}</p>
                </div>
              );
            })}
          </ModernSection>
        )}
        {experiences.length > 0 && (
          <ModernSection title="Ажлын туршлага">
            {experiences.map(function (exp, i) {
              return (
                <div key={i} style={{ marginBottom: i < experiences.length - 1 ? "12px" : 0, paddingBottom: i < experiences.length - 1 ? "12px" : 0, borderBottom: i < experiences.length - 1 ? "1px solid #f1f5f9" : "none", pageBreakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a", margin: 0 }}>{exp.position}</p>
                      <p style={{ fontSize: "12px", color: "#1e40af", marginTop: "1px" }}>{exp.company}</p>
                    </div>
                    <p style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap", marginLeft: "12px" }}>{exp.start_date ? exp.start_date + " – " + (exp.end_date || "Одоо") : ""}</p>
                  </div>
                  {exp.description && <p style={{ fontSize: "11.5px", color: "#475569", marginTop: "5px", lineHeight: 1.6, whiteSpace: "pre-line" }}>{exp.description}</p>}
                </div>
              );
            })}
          </ModernSection>
        )}
        {internships.length > 0 && (
          <ModernSection title="Дадлага">
            {internships.map(function (n, i) {
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < internships.length - 1 ? "10px" : 0 }}>
                  <div>
                    <p style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a", margin: 0 }}>{n.title}</p>
                    <p style={{ fontSize: "12px", color: "#1e40af" }}>{n.company}</p>
                    {n.description && <p style={{ fontSize: "11.5px", color: "#475569", marginTop: "4px", whiteSpace: "pre-line" }}>{n.description}</p>}
                  </div>
                  <p style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap", marginLeft: "12px" }}>{n.start_date ? n.start_date + " – " + (n.end_date || "") : ""}</p>
                </div>
              );
            })}
          </ModernSection>
        )}
        {certs.length > 0 && (
          <ModernSection title="Сургалт, сертификат">
            {certs.map(function (c, i) {
              return (
                <div key={i} style={{ marginBottom: "10px", pageBreakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontWeight: "700", fontSize: "12.5px", color: "#0f172a", margin: 0 }}>{c.name}</p>
                      {c.organization && <p style={{ fontSize: "11.5px", color: "#475569", margin: "2px 0 0" }}>{c.organization}</p>}
                    </div>
                    <p style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap", marginLeft: "12px" }}>{c.start_date ? c.start_date + (c.end_date ? " – " + c.end_date : "") : ""}</p>
                  </div>
                  <CertFilePreview url={c.file_url} />
                </div>
              );
            })}
          </ModernSection>
        )}
        {awards.length > 0 && (
          <ModernSection title="Шагнал урамшуулал">
            {awards.map(function (a, i) {
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < awards.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <p style={{ fontSize: "12px", fontWeight: "600", color: "#0f172a" }}>{a.name}</p>
                  {a.year && <p style={{ fontSize: "11px", color: "#94a3b8" }}>{a.year}</p>}
                </div>
              );
            })}
          </ModernSection>
        )}
        {hasSkillSections && (
          <ModernSection title="Ур чадвар">
            {personalSkills.length > 0 && <SkillGroup label="Хувийн" items={personalSkills} bg="#eff6ff" color="#1e40af" border="#dbeafe" />}
            {languages.length > 0 && (
              <div className="cv-print-section" style={{ marginBottom: "10px" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>Гадаад хэл</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {languages.map(function (l, i) { return <span key={i} style={{ ...skillTagBaseStyle, fontSize: "11px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>{l.name}{l.level ? " · " + l.level : ""}</span>; })}
                </div>
              </div>
            )}
            {techSkills.length > 0 && <SkillGroup label="Компьютерын программ" items={techSkills} bg="#faf5ff" color="#7c3aed" border="#e9d5ff" />}
            {profSkills.length > 0 && <SkillGroup label="Мэргэжлийн" items={profSkills} bg="#fff7ed" color="#c2410c" border="#fed7aa" />}
            {(artSkills.length > 0 || sportSkills.length > 0) && <SkillGroup label="Бусад" items={artSkills.concat(sportSkills)} bg="#f8fafc" color="#475569" border="#e2e8f0" />}
          </ModernSection>
        )}
        {skills.length > 0 && !hasSkillSections && (
          <ModernSection title="Ур чадвар">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {skills.map(function (s, i) { return <span key={i} style={{ ...skillTagBaseStyle, fontSize: "11px", background: "#eff6ff", color: "#1e40af", border: "1px solid #dbeafe" }}>{s.skill_name}</span>; })}
            </div>
          </ModernSection>
        )}
      </div>
    </div>
  );
}

function SkillGroup({ label, items, bg, color, border }) {
  return (
    <div className="cv-print-section" style={{ marginBottom: "10px" }}>
      <p style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>{label}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {items.map(function (s, i) { return <span key={i} style={{ ...skillTagBaseStyle, fontSize: "11px", background: bg, color: color, border: "1px solid " + border }}>{s}</span>; })}
      </div>
    </div>
  );
}

function ModernSection({ title, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 className="cv-print-section" style={{ fontSize: "13px", fontWeight: "800", color: "#1e3a8a", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px", paddingBottom: "5px", borderBottom: "2px solid #1e3a8a", pageBreakAfter: "avoid" }}>{title}</h2>
      {children}
    </div>
  );
}

function ClassicTemplate({ info, educations, experiences }) {
  var { personalSkills, techSkills, profSkills, artSkills, sportSkills, languages, certs, internships, awards } = parseSkillsFromInfo(info);
  var fullName = [info.lastName, info.firstName].filter(Boolean).join(" ");
  return (
    <div className="cv-print-document" style={{ background: "#fff", fontFamily: "'Georgia', 'Times New Roman', serif", color: "#1a1a1a", minHeight: "297mm" }}>
      <div className="cv-print-section" style={{ background: "#1a1a2e", color: "#fff", padding: "28px 40px 20px", textAlign: "center" }}>
        {info.photoUrl && <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}><img src={info.photoUrl} alt="" style={{ width: "90px", height: "112px", objectFit: "cover", border: "3px solid rgba(255,255,255,0.4)" }} /></div>}
        <h1 style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>{fullName || "НЭР ОРУУЛААГҮЙ"}</h1>
        <div style={{ height: "1px", background: "rgba(255,255,255,0.4)", margin: "12px auto", maxWidth: "200px" }}></div>
        <div style={{ fontSize: "11px", letterSpacing: "0.5px", opacity: 0.85, lineHeight: 1.8 }}>{[info.phone, info.email, info.address, info.linkedin].filter(Boolean).join("  |  ")}</div>
      </div>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{ width: "29%", background: "#f8f8f8", padding: "20px 16px 20px 22px", borderRight: "1px solid #e5e5e5", minHeight: "200mm", boxSizing: "border-box" }}>
          {(info.birthDate || info.gender || info.marital || info.license || info.salaryExpect) && (
            <ClassicSideSection title="Мэдээлэл">
              <div style={{ fontSize: "11px", lineHeight: 1.9 }}>
                {info.birthDate && <div><span style={{ color: "#666", display: "block", fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Төрсөн огноо</span><b>{info.birthDate}</b></div>}
                {info.gender && <div style={{ marginTop: "4px" }}><span style={{ color: "#666", display: "block", fontSize: "9.5px", textTransform: "uppercase" }}>Хүйс</span><b>{info.gender}</b></div>}
                {info.license && <div style={{ marginTop: "4px" }}><span style={{ color: "#666", display: "block", fontSize: "9.5px", textTransform: "uppercase" }}>Жолоо</span><b>{info.license}</b></div>}
                {info.salaryExpect && <div style={{ marginTop: "4px" }}><span style={{ color: "#666", display: "block", fontSize: "9.5px", textTransform: "uppercase" }}>Цалин</span><b>{info.salaryExpect}</b></div>}
              </div>
            </ClassicSideSection>
          )}
          {languages.length > 0 && <ClassicSideSection title="Хэл">{languages.map(function (l, i) { return <div key={i} style={{ fontSize: "11px", marginBottom: "4px" }}><b>{l.name}</b>{l.level ? <span style={{ color: "#666", fontSize: "10px" }}><br />{l.level}</span> : ""}</div>; })}</ClassicSideSection>}
          {personalSkills.length > 0 && <ClassicSideSection title="Хувийн ур чадвар">{personalSkills.map(function (s, i) { return <div key={i} style={{ fontSize: "11px", marginBottom: "3px", paddingLeft: "8px", borderLeft: "2px solid #1a1a2e" }}>· {s}</div>; })}</ClassicSideSection>}
          {techSkills.length > 0 && <ClassicSideSection title="Компьютер">{techSkills.map(function (s, i) { return <div key={i} style={{ fontSize: "11px", marginBottom: "3px" }}>· {s}</div>; })}</ClassicSideSection>}
          {profSkills.length > 0 && <ClassicSideSection title="Мэргэжлийн">{profSkills.map(function (s, i) { return <div key={i} style={{ fontSize: "11px", marginBottom: "3px" }}>· {s}</div>; })}</ClassicSideSection>}
          {(artSkills.length > 0 || sportSkills.length > 0) && <ClassicSideSection title="Бусад">{artSkills.concat(sportSkills).map(function (s, i) { return <div key={i} style={{ fontSize: "11px", marginBottom: "3px" }}>· {s}</div>; })}</ClassicSideSection>}
          {awards.length > 0 && <ClassicSideSection title="Шагнал">{awards.map(function (a, i) { return <div key={i} style={{ fontSize: "11px", marginBottom: "5px" }}><b>{a.name}</b>{a.year ? <span style={{ color: "#888", fontSize: "10px" }}> ({a.year})</span> : ""}</div>; })}</ClassicSideSection>}
        </div>
        <div style={{ flex: 1, padding: "20px 26px 20px 24px", boxSizing: "border-box" }}>
          {info.about && <div style={{ marginBottom: "18px" }}><p style={{ fontSize: "11.5px", lineHeight: 1.7, color: "#333", fontStyle: "italic", borderLeft: "3px solid #1a1a2e", paddingLeft: "10px" }}>{info.about}</p></div>}
          {experiences.length > 0 && (
            <ClassicMainSection title="Ажлын туршлага">
              {experiences.map(function (exp, i) {
                return (
                  <div key={i} style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div><p style={{ fontWeight: "700", fontSize: "13px", margin: 0 }}>{exp.position}</p><p style={{ fontSize: "12px", color: "#444", fontStyle: "italic", margin: "1px 0" }}>{exp.company}</p></div>
                      <p style={{ fontSize: "11px", color: "#777", whiteSpace: "nowrap" }}>{exp.start_date ? exp.start_date + " – " + (exp.end_date || "Одоо") : ""}</p>
                    </div>
                    {exp.description && <p style={{ fontSize: "11.5px", color: "#444", marginTop: "5px", lineHeight: 1.6, whiteSpace: "pre-line" }}>{exp.description}</p>}
                  </div>
                );
              })}
            </ClassicMainSection>
          )}
          {educations.length > 0 && (
            <ClassicMainSection title="Боловсрол">
              {educations.map(function (edu, i) {
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div><p style={{ fontWeight: "700", fontSize: "13px", margin: 0 }}>{edu.school}</p><p style={{ fontSize: "11.5px", color: "#555", margin: "2px 0" }}>{[edu.level || edu.degree, edu.major, edu.gpa ? edu.gpa + " голч" : ""].filter(Boolean).join(" · ")}</p></div>
                    <p style={{ fontSize: "11px", color: "#777", whiteSpace: "nowrap" }}>{edu.start_year ? edu.start_year + " – " + (edu.end_year || "Одоо") : ""}</p>
                  </div>
                );
              })}
            </ClassicMainSection>
          )}
          {internships.length > 0 && (
            <ClassicMainSection title="Дадлага">
              {internships.map(function (n, i) {
                return (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><div><p style={{ fontWeight: "700", fontSize: "12.5px", margin: 0 }}>{n.title}</p><p style={{ fontSize: "11.5px", color: "#555", fontStyle: "italic" }}>{n.company}</p></div><p style={{ fontSize: "11px", color: "#777", whiteSpace: "nowrap" }}>{n.start_date ? n.start_date + " – " + (n.end_date || "") : ""}</p></div>
                    {n.description && <p style={{ fontSize: "11.5px", color: "#444", marginTop: "4px", whiteSpace: "pre-line" }}>{n.description}</p>}
                  </div>
                );
              })}
            </ClassicMainSection>
          )}
          {certs.length > 0 && (
            <ClassicMainSection title="Сургалт, сертификат">
              {certs.map(function (c, i) {
                return (
                  <div key={i} style={{ marginBottom: "10px", pageBreakInside: "avoid" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontWeight: "700", fontSize: "12px", margin: 0 }}>{c.name}</p>
                        {c.organization && <p style={{ fontSize: "11px", color: "#555", fontStyle: "italic", margin: "2px 0 0" }}>{c.organization}</p>}
                      </div>
                      <p style={{ fontSize: "11px", color: "#777", whiteSpace: "nowrap" }}>{c.start_date ? c.start_date + (c.end_date ? " – " + c.end_date : "") : ""}</p>
                    </div>
                    <CertFilePreview url={c.file_url} />
                  </div>
                );
              })}
            </ClassicMainSection>
          )}
        </div>
      </div>
    </div>
  );
}

function ClassicSideSection({ title, children }) {
  return <div className="cv-print-section" style={{ marginBottom: "16px" }}><p style={{ fontSize: "9.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#1a1a2e", marginBottom: "6px", paddingBottom: "3px", borderBottom: "1.5px solid #1a1a2e" }}>{title}</p>{children}</div>;
}

function ClassicMainSection({ title, children }) {
  return <div style={{ marginBottom: "18px" }}><h2 className="cv-print-section" style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: "#1a1a2e", marginBottom: "10px", paddingBottom: "4px", borderBottom: "2px solid #1a1a2e", pageBreakAfter: "avoid" }}>{title}</h2>{children}</div>;
}

function MinimalTemplate({ info, educations, experiences, skills }) {
  var { personalSkills, techSkills, profSkills, artSkills, sportSkills, languages, certs, internships, awards } = parseSkillsFromInfo(info);
  var fullName = [info.lastName, info.firstName].filter(Boolean).join(" ");
  var allSkills = personalSkills.concat(techSkills).concat(profSkills).concat(artSkills).concat(sportSkills);
  return (
    <div className="cv-print-document" style={{ background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif", color: "#111", minHeight: "297mm", padding: "40px 48px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          {info.photoUrl && <img src={info.photoUrl} alt="" style={{ width: "80px", height: "100px", objectFit: "cover", flexShrink: 0, filter: "grayscale(20%)" }} />}
          <div><h1 style={{ fontSize: "24px", fontWeight: "300", letterSpacing: "1px", margin: 0, color: "#111" }}>{fullName || "Нэр оруулаагүй"}</h1>{info.about && <p style={{ fontSize: "11.5px", color: "#555", marginTop: "6px", lineHeight: 1.6, maxWidth: "360px" }}>{info.about}</p>}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: "10.5px", color: "#666", lineHeight: 2 }}>
          {info.phone && <div>{info.phone}{info.phone2 ? " / " + info.phone2 : ""}</div>}
          {info.email && <div>{info.email}</div>}
          {info.address && <div>{info.address}</div>}
          {info.linkedin && <div>{info.linkedin}</div>}
        </div>
      </div>
      <div style={{ height: "2px", background: "#111", marginBottom: "24px" }}></div>
      {(info.birthDate || info.gender || info.marital || info.license || info.salaryExpect) && (
        <MinimalSection title="Ерөнхий мэдээлэл">
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "11px", color: "#444" }}>
            {info.birthDate && <div><span style={{ color: "#999", marginRight: "4px" }}>Төрсөн:</span>{info.birthDate}</div>}
            {info.gender && <div><span style={{ color: "#999", marginRight: "4px" }}>Хүйс:</span>{info.gender}</div>}
            {info.license && <div><span style={{ color: "#999", marginRight: "4px" }}>Жолоо:</span>{info.license}</div>}
            {info.salaryExpect && <div><span style={{ color: "#999", marginRight: "4px" }}>Цалин:</span>{info.salaryExpect}</div>}
          </div>
        </MinimalSection>
      )}
      {educations.length > 0 && (
        <MinimalSection title="Боловсрол">
          {educations.map(function (edu, i) {
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", marginBottom: i < educations.length - 1 ? "8px" : 0, borderBottom: i < educations.length - 1 ? "1px solid #eee" : "none" }}>
                <div><p style={{ fontWeight: "600", fontSize: "12.5px", margin: 0 }}>{edu.school}</p><p style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{[edu.level || edu.degree, edu.major, edu.gpa ? edu.gpa + " голч" : ""].filter(Boolean).join("  ·  ")}</p></div>
                <p style={{ fontSize: "10.5px", color: "#999", whiteSpace: "nowrap", marginLeft: "12px" }}>{edu.start_year ? edu.start_year + " – " + (edu.end_year || "Одоо") : ""}</p>
              </div>
            );
          })}
        </MinimalSection>
      )}
      {experiences.length > 0 && (
        <MinimalSection title="Ажлын туршлага">
          {experiences.map(function (exp, i) {
            return (
              <div key={i} style={{ paddingBottom: "12px", marginBottom: i < experiences.length - 1 ? "12px" : 0, borderBottom: i < experiences.length - 1 ? "1px solid #eee" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div><span style={{ fontWeight: "600", fontSize: "12.5px" }}>{exp.position}</span>{exp.company && <span style={{ fontSize: "11.5px", color: "#666" }}> — {exp.company}</span>}</div>
                  <p style={{ fontSize: "10.5px", color: "#999", whiteSpace: "nowrap", marginLeft: "12px" }}>{exp.start_date ? exp.start_date + " – " + (exp.end_date || "Одоо") : ""}</p>
                </div>
                {exp.description && <p style={{ fontSize: "11px", color: "#555", marginTop: "5px", lineHeight: 1.6, whiteSpace: "pre-line" }}>{exp.description}</p>}
              </div>
            );
          })}
        </MinimalSection>
      )}
      {internships.length > 0 && (
        <MinimalSection title="Дадлага">
          {internships.map(function (n, i) {
            return (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: "600", fontSize: "12px" }}>{n.title}{n.company ? <span style={{ fontWeight: "400", color: "#666" }}> — {n.company}</span> : ""}</span><p style={{ fontSize: "10.5px", color: "#999", whiteSpace: "nowrap", marginLeft: "12px" }}>{n.start_date ? n.start_date + " – " + (n.end_date || "") : ""}</p></div>
                {n.description && <p style={{ fontSize: "11px", color: "#555", marginTop: "4px", whiteSpace: "pre-line" }}>{n.description}</p>}
              </div>
            );
          })}
        </MinimalSection>
      )}
      {certs.length > 0 && (
        <MinimalSection title="Сургалт, сертификат">
          {certs.map(function (c, i) {
            return (
              <div key={i} style={{ marginBottom: "10px", pageBreakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontWeight: "600", fontSize: "12px" }}>{c.name}</span>
                    {c.organization && <span style={{ fontSize: "11px", color: "#666" }}> — {c.organization}</span>}
                  </div>
                  <p style={{ fontSize: "10.5px", color: "#999", whiteSpace: "nowrap", marginLeft: "12px" }}>{c.start_date ? c.start_date + (c.end_date ? " – " + c.end_date : "") : ""}</p>
                </div>
                <CertFilePreview url={c.file_url} />
              </div>
            );
          })}
        </MinimalSection>
      )}
      {awards.length > 0 && <MinimalSection title="Шагнал"><div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>{awards.map(function (a, i) { return <div key={i} style={{ fontSize: "11.5px" }}>{a.name}{a.year ? <span style={{ color: "#999", fontSize: "10.5px" }}> ({a.year})</span> : ""}</div>; })}</div></MinimalSection>}
      {(allSkills.length > 0 || languages.length > 0 || skills.length > 0) && (
        <MinimalSection title="Ур чадвар">
          {languages.length > 0 && <div style={{ marginBottom: "8px" }}><span style={{ fontSize: "10px", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", marginRight: "8px" }}>Гадаад хэл</span><span style={{ fontSize: "11.5px" }}>{languages.map(function (l) { return l.name + (l.level ? " (" + l.level + ")" : ""); }).join(", ")}</span></div>}
          {allSkills.length > 0 && <div style={{ fontSize: "11.5px", color: "#333", lineHeight: 1.8 }}>{allSkills.join("  ·  ")}</div>}
          {skills.length > 0 && allSkills.length === 0 && <div style={{ fontSize: "11.5px", color: "#333", lineHeight: 1.8 }}>{skills.map(function (s) { return s.skill_name; }).join("  ·  ")}</div>}
        </MinimalSection>
      )}
    </div>
  );
}

function MinimalSection({ title, children }) {
  return <div style={{ marginBottom: "20px" }}><p className="cv-print-section" style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px", color: "#888", marginBottom: "8px", pageBreakAfter: "avoid" }}>{title}</p>{children}</div>;
}
