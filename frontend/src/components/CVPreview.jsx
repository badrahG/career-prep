export default function CVPreview({ cv, info, template }) {
  var educations = Array.isArray(cv.educations) ? cv.educations : [];
  var experiences = Array.isArray(cv.experiences) ? cv.experiences : [];
  var skills = Array.isArray(cv.skills) ? cv.skills : [];
  var props = { cv, info, educations, experiences, skills };
  if (template === "classic") return <AsianTemplate {...props} />;
  if (template === "minimal") return <MinimalTemplate {...props} />;
  return <ModernMongolianTemplate {...props} />;
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

function ModernMongolianTemplate({ info, educations, experiences, skills }) {
  var { personalSkills, techSkills, profSkills, artSkills, sportSkills, languages, certs, internships, awards } = parseSkillsFromInfo(info);
  var fullName = [info.lastName, info.firstName].filter(Boolean).join(" ");
  var fallbackSkills = skills.map(function (s) { return s.skill_name; }).filter(Boolean);
  var hasSkillSections = personalSkills.length > 0 || techSkills.length > 0 || profSkills.length > 0 || artSkills.length > 0 || sportSkills.length > 0 || languages.length > 0;
  var contactItems = [
    info.phone ? { label: "Утас", value: info.phone + (info.phone2 ? ", " + info.phone2 : "") } : null,
    info.email ? { label: "И-мэйл", value: info.email } : null,
    info.address ? { label: "Хаяг", value: info.address } : null,
    info.linkedin ? { label: "LinkedIn / холбоос", value: info.linkedin } : null,
  ].filter(Boolean);
  var personalInfo = [
    info.birthDate ? { label: "Төрсөн огноо", value: info.birthDate } : null,
    info.gender ? { label: "Хүйс", value: info.gender } : null,
    info.marital ? { label: "Гэрлэлтийн байдал", value: info.marital } : null,
    info.regNo ? { label: "Регистрийн дугаар", value: info.regNo } : null,
    info.license ? { label: "Жолооны үнэмлэх", value: info.license } : null,
    info.salaryExpect ? { label: "Цалингийн хүлээлт", value: info.salaryExpect } : null,
  ].filter(Boolean);

  return (
    <div className="cv-print-document" style={{ background: "#fff", fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", color: "#162033", minHeight: "297mm", borderTop: "7px solid #0f2f55" }}>
      <div className="cv-print-section" style={{ padding: "26px 34px 20px", borderBottom: "1px solid #d8e1ec", background: "#f8fafc" }}>
        <div style={{ display: "grid", gridTemplateColumns: "112px 1fr 210px", gap: "20px", alignItems: "center" }}>
          <div style={{ width: "104px", height: "128px", background: "#e8eef5", border: "1px solid #cbd7e5", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {info.photoUrl ? <img src={info.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <span style={{ fontSize: "10px", color: "#7c8aa0", fontWeight: "700", textTransform: "uppercase" }}>Зураг</span>}
          </div>
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "1.7px", textTransform: "uppercase", color: "#526276", fontWeight: "800", margin: "0 0 7px" }}>Монгол стандарт CV</p>
            <h1 style={{ fontSize: "29px", fontWeight: "850", letterSpacing: 0, margin: 0, lineHeight: 1.08, color: "#0f172a", textTransform: "uppercase" }}>{fullName || "Овог нэр"}</h1>
            <div style={{ width: "74px", height: "3px", background: "#b38b2e", margin: "11px 0 10px" }} />
            <p style={{ fontSize: "12.2px", lineHeight: 1.55, color: "#46566b", margin: 0, maxWidth: "420px", whiteSpace: "pre-line" }}>{info.about || "Ажил горилогчийн товч танилцуулга"}</p>
          </div>
          <div style={{ borderLeft: "1px solid #d5dfeb", paddingLeft: "15px" }}>
            <p style={{ fontSize: "10px", fontWeight: "850", color: "#0f2f55", textTransform: "uppercase", letterSpacing: "0.9px", margin: "0 0 8px" }}>Холбоо барих</p>
            {contactItems.length > 0 ? contactItems.map(function (item, i) {
              return <ModernMiniInfo key={i} label={item.label} value={item.value} />;
            }) : <p style={{ fontSize: "10.5px", color: "#64748b", margin: 0 }}>Утас, и-мэйл, хаягаа оруулна уу</p>}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "31% 1fr", alignItems: "stretch" }}>
        <aside style={{ background: "#eef3f8", borderRight: "1px solid #d8e1ec", padding: "18px 17px 24px 24px", minHeight: "218mm", boxSizing: "border-box" }}>
          {personalInfo.length > 0 && (
            <ModernSideSection title="Ерөнхий мэдээлэл">
              {personalInfo.map(function (item, i) { return <ModernMiniInfo key={i} label={item.label} value={item.value} dark />; })}
            </ModernSideSection>
          )}
          {languages.length > 0 && (
            <ModernSideSection title="Гадаад хэлний мэдлэг">
              {languages.map(function (l, i) { return <ModernLevelRow key={i} name={l.name} level={l.level} />; })}
            </ModernSideSection>
          )}
          {techSkills.length > 0 && <ModernSideSection title="Компьютерын ур чадвар"><ModernBulletList items={techSkills} /></ModernSideSection>}
          {personalSkills.length > 0 && <ModernSideSection title="Хувийн ур чадвар"><ModernBulletList items={personalSkills} /></ModernSideSection>}
          {profSkills.length > 0 && <ModernSideSection title="Мэргэжлийн ур чадвар"><ModernBulletList items={profSkills} /></ModernSideSection>}
          {(artSkills.length > 0 || sportSkills.length > 0) && <ModernSideSection title="Нэмэлт чадвар"><ModernBulletList items={artSkills.concat(sportSkills)} /></ModernSideSection>}
          {!hasSkillSections && fallbackSkills.length > 0 && <ModernSideSection title="Ур чадвар"><ModernBulletList items={fallbackSkills} /></ModernSideSection>}
        </aside>

        <main style={{ padding: "20px 34px 24px 28px", boxSizing: "border-box" }}>
          {experiences.length > 0 && (
            <ModernMongolianSection title="Ажлын туршлага">
              {experiences.map(function (exp, i) {
                return <ModernTimelineItem key={i} title={exp.position} subtitle={exp.company} date={exp.start_date ? exp.start_date + " - " + (exp.end_date || "Одоо") : ""} description={exp.description} last={i === experiences.length - 1} />;
              })}
            </ModernMongolianSection>
          )}
          {educations.length > 0 && (
            <ModernMongolianSection title="Боловсрол">
              {educations.map(function (edu, i) {
                return <ModernTimelineItem key={i} title={edu.school} subtitle={[edu.level || edu.degree, edu.major, edu.gpa ? "Голч: " + edu.gpa : ""].filter(Boolean).join(" | ")} date={edu.start_year ? edu.start_year + " - " + (edu.end_year || "Одоо") : ""} last={i === educations.length - 1} />;
              })}
            </ModernMongolianSection>
          )}
          {internships.length > 0 && (
            <ModernMongolianSection title="Дадлага">
              {internships.map(function (n, i) {
                return <ModernTimelineItem key={i} title={n.title} subtitle={n.company} date={n.start_date ? n.start_date + " - " + (n.end_date || "") : ""} description={n.description} last={i === internships.length - 1} />;
              })}
            </ModernMongolianSection>
          )}
          {certs.length > 0 && (
            <ModernMongolianSection title="Сургалт, сертификат">
              {certs.map(function (c, i) {
                return (
                  <div key={i} style={{ marginBottom: i < certs.length - 1 ? "11px" : 0, paddingBottom: i < certs.length - 1 ? "11px" : 0, borderBottom: i < certs.length - 1 ? "1px solid #e8eef5" : "none", pageBreakInside: "avoid" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "14px" }}>
                      <div>
                        <p style={{ fontWeight: "800", fontSize: "12.3px", color: "#142033", margin: 0 }}>{c.name}</p>
                        {c.organization && <p style={{ fontSize: "11.1px", color: "#526276", margin: "2px 0 0" }}>{c.organization}</p>}
                      </div>
                      <p style={{ fontSize: "10.5px", color: "#7b8aa1", whiteSpace: "nowrap", margin: 0 }}>{c.start_date ? c.start_date + (c.end_date ? " - " + c.end_date : "") : ""}</p>
                    </div>
                    <CertFilePreview url={c.file_url} />
                  </div>
                );
              })}
            </ModernMongolianSection>
          )}
          {awards.length > 0 && (
            <ModernMongolianSection title="Шагнал, амжилт">
              {awards.map(function (a, i) {
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "14px", padding: "5px 0", borderBottom: i < awards.length - 1 ? "1px solid #e8eef5" : "none" }}>
                    <p style={{ fontSize: "11.8px", fontWeight: "750", color: "#142033", margin: 0 }}>{a.name}</p>
                    {a.year && <p style={{ fontSize: "10.5px", color: "#7b8aa1", margin: 0, whiteSpace: "nowrap" }}>{a.year}</p>}
                  </div>
                );
              })}
            </ModernMongolianSection>
          )}
          {experiences.length === 0 && educations.length === 0 && (
            <ModernMongolianSection title="Үндсэн мэдээлэл">
              <p style={{ fontSize: "11.5px", color: "#526276", lineHeight: 1.65, margin: 0 }}>Боловсрол, ажлын туршлага, ур чадвараа бөглөснөөр Монголын компаниудад илгээхэд бэлэн CV автоматаар бүрдэнэ.</p>
            </ModernMongolianSection>
          )}
        </main>
      </div>
    </div>
  );
}

function ModernMiniInfo({ label, value, dark }) {
  return (
    <div style={{ marginBottom: "7px", pageBreakInside: "avoid" }}>
      <p style={{ fontSize: "8.8px", color: dark ? "#64748b" : "#708096", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 1px" }}>{label}</p>
      <p style={{ fontSize: "10.8px", color: dark ? "#182235" : "#1f2a3d", lineHeight: 1.35, fontWeight: "650", margin: 0, wordBreak: "break-word" }}>{value}</p>
    </div>
  );
}

function ModernLevelRow({ name, level }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "10.8px", lineHeight: 1.35, marginBottom: "5px", color: "#1f2a3d" }}>
      <b>{name}</b>
      {level && <span style={{ color: "#64748b", textAlign: "right" }}>{level}</span>}
    </div>
  );
}

function ModernBulletList({ items }) {
  return (
    <div style={{ display: "grid", gap: "4px" }}>
      {items.map(function (s, i) {
        return (
          <div key={i} style={{ position: "relative", paddingLeft: "10px", fontSize: "10.8px", lineHeight: 1.45, color: "#263449" }}>
            <span style={{ position: "absolute", left: 0, top: "0.48em", width: "4px", height: "4px", background: "#b38b2e" }} />
            {s}
          </div>
        );
      })}
    </div>
  );
}

function ModernSideSection({ title, children }) {
  return (
    <div className="cv-print-section" style={{ marginBottom: "16px" }}>
      <p style={{ fontSize: "9.4px", fontWeight: "850", textTransform: "uppercase", letterSpacing: "0.9px", color: "#0f2f55", margin: "0 0 8px", paddingBottom: "4px", borderBottom: "1.5px solid #b9c7d6" }}>{title}</p>
      {children}
    </div>
  );
}

function ModernTimelineItem({ title, subtitle, date, description, last }) {
  return (
    <div style={{ position: "relative", paddingLeft: "16px", paddingBottom: last ? 0 : "13px", marginBottom: last ? 0 : "13px", borderBottom: last ? "none" : "1px solid #e8eef5", pageBreakInside: "avoid" }}>
      <span style={{ position: "absolute", left: 0, top: "4px", width: "7px", height: "7px", background: "#0f2f55" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px" }}>
        <div>
          <p style={{ fontWeight: "820", fontSize: "13px", color: "#111827", margin: 0, lineHeight: 1.25 }}>{title}</p>
          {subtitle && <p style={{ fontSize: "11.6px", color: "#0f4f82", margin: "2px 0 0", lineHeight: 1.35, fontWeight: "650" }}>{subtitle}</p>}
        </div>
        {date && <p style={{ fontSize: "10.5px", color: "#7b8aa1", whiteSpace: "nowrap", margin: 0, fontWeight: "650" }}>{date}</p>}
      </div>
      {description && <p style={{ fontSize: "11.2px", color: "#46566b", margin: "6px 0 0", lineHeight: 1.62, whiteSpace: "pre-line" }}>{description}</p>}
    </div>
  );
}

function ModernMongolianSection({ title, children }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <h2 className="cv-print-section" style={{ fontSize: "12.4px", fontWeight: "850", color: "#0f2f55", textTransform: "uppercase", letterSpacing: "0.9px", margin: "0 0 10px", paddingBottom: "5px", borderBottom: "2px solid #0f2f55", pageBreakAfter: "avoid" }}>{title}</h2>
      {children}
    </div>
  );
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

function AsianTemplate({ info, educations, experiences, skills }) {
  var { personalSkills, techSkills, profSkills, artSkills, sportSkills, languages, certs, internships, awards } = parseSkillsFromInfo(info);
  var fullName = [info.lastName, info.firstName].filter(Boolean).join(" ");
  var fallbackSkills = skills.map(function (s) { return s.skill_name; }).filter(Boolean);
  var coreSkills = personalSkills.length > 0 ? personalSkills : fallbackSkills;
  var additionalSkills = artSkills.concat(sportSkills);
  var contactItems = [
    info.phone ? { label: "Утас", value: info.phone + (info.phone2 ? ", " + info.phone2 : "") } : null,
    info.email ? { label: "И-мэйл", value: info.email } : null,
    info.address ? { label: "Хаяг", value: info.address } : null,
    info.linkedin ? { label: "LinkedIn", value: info.linkedin } : null,
  ].filter(Boolean);
  var hasPersonalInfo = info.birthDate || info.gender || info.marital || info.regNo || info.license || info.salaryExpect;

  return (
    <div className="cv-print-document" style={{ background: "#fff", fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", color: "#172033", minHeight: "297mm" }}>
      <div className="cv-print-section" style={{ display: "grid", gridTemplateColumns: "96px 1fr 190px", gap: "18px", alignItems: "center", background: "#12233f", color: "#fff", padding: "22px 30px 18px", borderBottom: "5px solid #5d7899" }}>
        <div style={{ width: "92px", height: "116px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {info.photoUrl ? <img src={info.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Зураг</span>}
        </div>
        <div>
          <h1 style={{ fontSize: "27px", lineHeight: 1.08, fontWeight: "800", letterSpacing: "0.4px", textTransform: "uppercase", margin: 0 }}>{fullName || "Овог нэр"}</h1>
          <div style={{ width: "68px", height: "2px", background: "#8ea9c6", margin: "9px 0 8px" }} />
          <p style={{ fontSize: "12px", lineHeight: 1.45, color: "#dbe7f4", margin: 0, fontWeight: "600" }}>{info.position || "Анкет / CV"}</p>
          {info.about && <p style={{ fontSize: "10.5px", lineHeight: 1.5, color: "#c8d6e6", margin: "7px 0 0", maxHeight: "32px", overflow: "hidden" }}>{info.about}</p>}
        </div>
        <div style={{ borderLeft: "1px solid rgba(255,255,255,0.22)", paddingLeft: "14px" }}>
          {contactItems.map(function (item, i) {
            return (
              <div key={i} style={{ marginBottom: i < contactItems.length - 1 ? "6px" : 0 }}>
                <p style={{ fontSize: "8.5px", color: "#9fb5cc", textTransform: "uppercase", letterSpacing: "0.7px", margin: "0 0 1px", fontWeight: "700" }}>{item.label}</p>
                <p style={{ fontSize: "10.2px", lineHeight: 1.35, color: "#fff", margin: 0, wordBreak: "break-word" }}>{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <aside style={{ width: "31%", background: "#f2f5f8", padding: "18px 16px 20px 22px", borderRight: "1px solid #d8e0e9", minHeight: "210mm", boxSizing: "border-box" }}>
          {hasPersonalInfo && (
            <AsianSideSection title="Хувийн мэдээлэл">
              <AsianInfoList>
                {info.birthDate && <AsianInfoItem label="Төрсөн огноо" value={info.birthDate} />}
                {info.gender && <AsianInfoItem label="Хүйс" value={info.gender} />}
                {info.marital && <AsianInfoItem label="Гэрлэлтийн байдал" value={info.marital} />}
                {info.regNo && <AsianInfoItem label="Регистрийн дугаар" value={info.regNo} />}
                {info.license && <AsianInfoItem label="Жолооны үнэмлэх" value={info.license} />}
                {info.salaryExpect && <AsianInfoItem label="Цалингийн хүлээлт" value={info.salaryExpect} />}
              </AsianInfoList>
            </AsianSideSection>
          )}
          {languages.length > 0 && <AsianSideSection title="Гадаад хэл">{languages.map(function (l, i) { return <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "10.8px", marginBottom: "5px", lineHeight: 1.35 }}><b>{l.name}</b>{l.level ? <span style={{ color: "#64748b", textAlign: "right" }}>{l.level}</span> : ""}</div>; })}</AsianSideSection>}
          {coreSkills.length > 0 && <AsianSideSection title="Хувийн ур чадвар"><AsianBulletList items={coreSkills} /></AsianSideSection>}
          {techSkills.length > 0 && <AsianSideSection title="Компьютерын ур чадвар"><AsianBulletList items={techSkills} /></AsianSideSection>}
          {profSkills.length > 0 && <AsianSideSection title="Мэргэжлийн ур чадвар"><AsianBulletList items={profSkills} /></AsianSideSection>}
          {additionalSkills.length > 0 && <AsianSideSection title="Нэмэлт ур чадвар"><AsianBulletList items={additionalSkills} /></AsianSideSection>}
        </aside>
        <main style={{ flex: 1, padding: "18px 28px 22px 24px", boxSizing: "border-box" }}>
          {info.about && <AsianMainSection title="Товч танилцуулга / Зорилго"><p style={{ fontSize: "11.2px", lineHeight: 1.65, color: "#334155", margin: 0, whiteSpace: "pre-line" }}>{info.about}</p></AsianMainSection>}
          {educations.length > 0 && (
            <AsianMainSection title="Боловсрол">
              {educations.map(function (edu, i) {
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 96px", gap: "12px", marginBottom: i < educations.length - 1 ? "11px" : 0, paddingBottom: i < educations.length - 1 ? "10px" : 0, borderBottom: i < educations.length - 1 ? "1px solid #e8edf3" : "none", pageBreakInside: "avoid" }}>
                    <div><p style={{ fontWeight: "800", fontSize: "12.5px", margin: 0, color: "#172033" }}>{edu.school}</p><p style={{ fontSize: "10.8px", color: "#526176", margin: "3px 0 0", lineHeight: 1.45 }}>{[edu.level || edu.degree, edu.major, edu.gpa ? "GPA " + edu.gpa : ""].filter(Boolean).join(" / ")}</p></div>
                    <p style={{ fontSize: "10.5px", color: "#64748b", whiteSpace: "nowrap", textAlign: "right", margin: 0 }}>{edu.start_year ? edu.start_year + " - " + (edu.end_year || "Одоо") : ""}</p>
                  </div>
                );
              })}
            </AsianMainSection>
          )}
          {experiences.length > 0 && (
            <AsianMainSection title="Ажлын туршлага">
              {experiences.map(function (exp, i) {
                return (
                  <div key={i} style={{ marginBottom: i < experiences.length - 1 ? "13px" : 0, paddingBottom: i < experiences.length - 1 ? "12px" : 0, borderBottom: i < experiences.length - 1 ? "1px solid #e8edf3" : "none", pageBreakInside: "avoid" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 112px", gap: "12px" }}>
                      <div><p style={{ fontWeight: "800", fontSize: "12.5px", margin: 0, color: "#172033" }}>{exp.position}</p><p style={{ fontSize: "11.2px", color: "#335f8f", margin: "2px 0 0", fontWeight: "700" }}>{exp.company}</p></div>
                      <p style={{ fontSize: "10.5px", color: "#64748b", whiteSpace: "nowrap", textAlign: "right", margin: 0 }}>{exp.start_date ? exp.start_date + " - " + (exp.end_date || "Одоо") : ""}</p>
                    </div>
                    {exp.description && <p style={{ fontSize: "11px", color: "#3f4d63", margin: "6px 0 0", lineHeight: 1.55, whiteSpace: "pre-line" }}>{exp.description}</p>}
                  </div>
                );
              })}
            </AsianMainSection>
          )}
          {internships.length > 0 && (
            <AsianMainSection title="Дадлага / Төсөл">
              {internships.map(function (n, i) {
                return (
                  <div key={i} style={{ marginBottom: i < internships.length - 1 ? "11px" : 0, pageBreakInside: "avoid" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 112px", gap: "12px" }}><div><p style={{ fontWeight: "800", fontSize: "12px", margin: 0 }}>{n.title}</p><p style={{ fontSize: "10.8px", color: "#526176", margin: "2px 0 0" }}>{n.company}</p></div><p style={{ fontSize: "10.5px", color: "#64748b", whiteSpace: "nowrap", textAlign: "right", margin: 0 }}>{n.start_date ? n.start_date + " - " + (n.end_date || "") : ""}</p></div>
                    {n.description && <p style={{ fontSize: "10.8px", color: "#3f4d63", marginTop: "5px", lineHeight: 1.55, whiteSpace: "pre-line" }}>{n.description}</p>}
                  </div>
                );
              })}
            </AsianMainSection>
          )}
          {certs.length > 0 && (
            <AsianMainSection title="Сургалт / Сертификат">
              {certs.map(function (c, i) {
                return (
                  <div key={i} style={{ marginBottom: i < certs.length - 1 ? "11px" : 0, pageBreakInside: "avoid" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 112px", gap: "12px" }}>
                      <div>
                        <p style={{ fontWeight: "800", fontSize: "12px", margin: 0 }}>{c.name}</p>
                        {c.organization && <p style={{ fontSize: "10.8px", color: "#526176", margin: "2px 0 0" }}>{c.organization}</p>}
                      </div>
                      <p style={{ fontSize: "10.5px", color: "#64748b", whiteSpace: "nowrap", textAlign: "right", margin: 0 }}>{c.start_date ? c.start_date + (c.end_date ? " - " + c.end_date : "") : ""}</p>
                    </div>
                    <CertFilePreview url={c.file_url} />
                  </div>
                );
              })}
            </AsianMainSection>
          )}
          {awards.length > 0 && (
            <AsianMainSection title="Шагнал / Нэмэлт мэдээлэл">
              {awards.map(function (a, i) {
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 72px", gap: "12px", marginBottom: i < awards.length - 1 ? "8px" : 0, paddingBottom: i < awards.length - 1 ? "8px" : 0, borderBottom: i < awards.length - 1 ? "1px solid #e8edf3" : "none", pageBreakInside: "avoid" }}>
                    <p style={{ fontWeight: "400", fontSize: "11.2px", color: "#3f4d63", margin: 0, lineHeight: 1.5 }}>{a.name}</p>
                    {a.year && <p style={{ fontSize: "10.5px", color: "#64748b", whiteSpace: "nowrap", textAlign: "right", margin: 0 }}>{a.year}</p>}
                  </div>
                );
              })}
            </AsianMainSection>
          )}
        </main>
      </div>
    </div>
  );
}

function AsianSideSection({ title, children }) {
  return <div className="cv-print-section" style={{ marginBottom: "15px" }}><p style={{ fontSize: "9px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px", color: "#12233f", marginBottom: "7px", paddingBottom: "4px", borderBottom: "1.5px solid #93a8bd" }}>{title}</p>{children}</div>;
}

function AsianMainSection({ title, children }) {
  return <div style={{ marginBottom: "16px" }}><h2 className="cv-print-section" style={{ fontSize: "11.2px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: "#12233f", marginBottom: "9px", padding: "0 0 5px", borderBottom: "2px solid #5d7899", pageBreakAfter: "avoid" }}>{title}</h2>{children}</div>;
}

function AsianInfoList({ children }) {
  return <div style={{ display: "grid", gap: "6px" }}>{children}</div>;
}

function AsianInfoItem({ label, value }) {
  return <div style={{ fontSize: "10.6px", lineHeight: 1.35 }}><span style={{ display: "block", color: "#64748b", fontSize: "8.5px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700" }}>{label}</span><b style={{ color: "#172033", fontWeight: "700" }}>{value}</b></div>;
}

function AsianBulletList({ items }) {
  return (
    <div style={{ display: "grid", gap: "4px" }}>
      {items.map(function (s, i) {
        return <div key={i} style={{ position: "relative", paddingLeft: "10px", fontSize: "10.8px", lineHeight: 1.45, color: "#263449" }}><span style={{ position: "absolute", left: 0, top: "0.48em", width: "4px", height: "4px", background: "#5d7899" }} />{s}</div>;
      })}
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
  var contactItems = [info.address, info.phone, info.email].filter(Boolean);
  var skillColumns = [];
  if (techSkills.length > 0) skillColumns.push({ title: "Компьютер", items: techSkills });
  if (profSkills.length > 0) skillColumns.push({ title: "Мэргэжлийн", items: profSkills });
  if (personalSkills.length > 0) skillColumns.push({ title: "Хувийн", items: personalSkills });
  if (skillColumns.length === 0 && allSkills.length > 0) skillColumns.push({ title: "Үндсэн", items: allSkills });
  if (skillColumns.length === 0 && skills.length > 0) {
    skillColumns.push({ title: "Үндсэн", items: skills.map(function (s) { return s.skill_name; }) });
  }
  var extraSkills = [];
  if (artSkills.length > 0) extraSkills = extraSkills.concat(artSkills);
  if (sportSkills.length > 0) extraSkills = extraSkills.concat(sportSkills);
  return (
    <div className="cv-print-document" style={{ background: "#fff", fontFamily: "'Georgia', 'Times New Roman', serif", color: "#222", minHeight: "297mm", padding: "34px 38px 30px" }}>
      <div className="cv-print-section" style={{ marginBottom: "20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "29px", fontWeight: "700", letterSpacing: "0.2px", margin: 0, color: "#171717", lineHeight: 1.05 }}>{fullName || "Нэр оруулаагүй"}</h1>
        {info.position && <p style={{ fontSize: "13px", color: "#404040", margin: "7px 0 0", fontWeight: "400" }}>{info.position}</p>}
        {contactItems.length > 0 && <p style={{ fontSize: "10.5px", color: "#525252", margin: "8px 0 0", lineHeight: 1.6 }}>{contactItems.join("  •  ")}</p>}
        {info.linkedin && <p style={{ fontSize: "10.5px", color: "#525252", margin: "2px 0 0" }}>{info.linkedin}</p>}
      </div>
      {info.about && (
        <MinimalSection title="ТОВЧ ТАНИЛЦУУЛГА">
          <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "14px" }}>
            <div style={{ fontSize: "10px", color: "#666" }}></div>
            <p style={{ fontSize: "11px", color: "#3d3d3d", margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>{info.about}</p>
          </div>
        </MinimalSection>
      )}
      {educations.length > 0 && (
        <MinimalSection title="БОЛОВСРОЛ">
          {educations.map(function (edu, i) {
            return (
              <div key={i} className="cv-print-section" style={{ display: "grid", gridTemplateColumns: "96px 1fr 110px", gap: "14px", marginBottom: i < educations.length - 1 ? "12px" : 0 }}>
                <div style={{ fontSize: "10px", color: "#5f5f5f", lineHeight: 1.5 }}>{edu.start_year ? edu.start_year + (edu.end_year ? " – " + edu.end_year : " – Одоо") : ""}</div>
                <div>
                  <p style={{ fontSize: "12.5px", color: "#222", fontWeight: "700", margin: 0 }}>{edu.school}</p>
                  <p style={{ fontSize: "10.5px", color: "#666", margin: "2px 0 0" }}>{[edu.level || edu.degree, edu.major].filter(Boolean).join(", ")}</p>
                  {edu.gpa ? <p style={{ fontSize: "10.5px", color: "#777", margin: "4px 0 0" }}>GPA: {edu.gpa}</p> : null}
                </div>
                <div style={{ fontSize: "10px", color: "#5f5f5f", textAlign: "right" }}>{info.address || ""}</div>
              </div>
            );
          })}
        </MinimalSection>
      )}
      {experiences.length > 0 && (
        <MinimalSection title="АЖЛЫН ТУРШЛАГА">
          {experiences.map(function (exp, i) {
            return (
              <div key={i} className="cv-print-section" style={{ display: "grid", gridTemplateColumns: "96px 1fr 110px", gap: "14px", marginBottom: i < experiences.length - 1 ? "14px" : 0 }}>
                <div style={{ fontSize: "10px", color: "#5f5f5f", lineHeight: 1.5 }}>{exp.start_date ? exp.start_date + " – " + (exp.end_date || "Одоо") : ""}</div>
                <div>
                  <p style={{ fontSize: "12.5px", color: "#222", fontWeight: "700", margin: 0 }}>{exp.position}{exp.company ? ", " + exp.company : ""}</p>
                  {exp.description && <div style={{ fontSize: "10.8px", color: "#4a4a4a", marginTop: "5px", lineHeight: 1.7, whiteSpace: "pre-line" }}>{exp.description}</div>}
                </div>
                <div style={{ fontSize: "10px", color: "#5f5f5f", textAlign: "right" }}>{info.address || ""}</div>
              </div>
            );
          })}
        </MinimalSection>
      )}
      {(skillColumns.length > 0 || extraSkills.length > 0) && (
        <MinimalSection title="УР ЧАДВАР">
          <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "14px" }}>
            <div style={{ fontSize: "10px", color: "#5f5f5f" }}>Төрлөөр</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 18px" }}>
              {skillColumns.map(function (group, i) {
                return (
                  <div key={i} style={{ fontSize: "10.8px", color: "#3d3d3d", lineHeight: 1.8 }}>
                    {group.items.slice(0, 4).map(function (item, idx) {
                      return <div key={idx}>{item}</div>;
                    })}
                  </div>
                );
              })}
              {extraSkills.length > 0 && (
                <div style={{ fontSize: "10.8px", color: "#3d3d3d", lineHeight: 1.8 }}>
                  {extraSkills.slice(0, 4).map(function (item, idx) {
                    return <div key={idx}>{item}</div>;
                  })}
                </div>
              )}
            </div>
          </div>
        </MinimalSection>
      )}
      {languages.length > 0 && (
        <MinimalSection title="ГАДААД ХЭЛ">
          <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "14px" }}>
            <div style={{ fontSize: "10px", color: "#5f5f5f" }}>Түвшин</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 18px" }}>
              {languages.map(function (l, i) {
                return <div key={i} style={{ fontSize: "10.8px", color: "#3d3d3d" }}>{l.name}{l.level ? <span style={{ color: "#777" }}> {l.level}</span> : ""}</div>;
              })}
            </div>
          </div>
        </MinimalSection>
      )}
      {(certs.length > 0 || internships.length > 0 || awards.length > 0) && (
        <MinimalSection title="НЭМЭЛТ МЭДЭЭЛЭЛ">
          <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "14px" }}>
            <div style={{ fontSize: "10px", color: "#5f5f5f" }}>Нэмэлт</div>
            <div style={{ fontSize: "10.8px", color: "#3d3d3d", lineHeight: 1.8 }}>
              {certs.length > 0 && <div><b>Сертификат:</b> {certs.map(function (c) { return c.name; }).join(", ")}</div>}
              {internships.length > 0 && <div><b>Дадлага:</b> {internships.map(function (n) { return [n.title, n.company].filter(Boolean).join(" - "); }).join(", ")}</div>}
              {awards.length > 0 && <div><b>Шагнал:</b> {awards.map(function (a) { return a.name + (a.year ? " (" + a.year + ")" : ""); }).join(", ")}</div>}
            </div>
          </div>
        </MinimalSection>
      )}
      {(info.birthDate || info.marital || info.gender || info.address || info.regNo) && (
        <div className="cv-print-section" style={{ marginTop: "18px", borderTop: "1px solid #bdbdbd", paddingTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
          {info.birthDate && <div style={{ fontSize: "10.5px", color: "#444" }}><span style={{ color: "#777" }}>Төрсөн огноо / Хаяг</span><span style={{ marginLeft: "10px" }}>{info.birthDate}{info.address ? " / " + info.address : ""}</span></div>}
          {info.marital && <div style={{ fontSize: "10.5px", color: "#444", textAlign: "right" }}><span style={{ color: "#777" }}>Гэрлэлтийн байдал</span><span style={{ marginLeft: "10px" }}>{info.marital}</span></div>}
          {(info.regNo || info.gender) && <div style={{ fontSize: "10.5px", color: "#444" }}><span style={{ color: "#777" }}>Регистр / Хүйс</span><span style={{ marginLeft: "10px" }}>{info.regNo ? info.regNo + " / " : ""}{info.gender || ""}</span></div>}
        </div>
      )}
    </div>
  );
}

function MinimalSection({ title, children }) {
  return <div style={{ marginBottom: "18px", borderTop: "1px solid #bdbdbd", paddingTop: "8px" }}><div className="cv-print-section" style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "14px" }}><p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.2px", color: "#3f3f46", margin: 0, pageBreakAfter: "avoid" }}>{title}</p><div>{children}</div></div></div>;
}
