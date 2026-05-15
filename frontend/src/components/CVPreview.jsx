var MN = {
  about: "Товч танилцуулга",
  aboutObjective: "Товч танилцуулга / Зорилго",
  experience: "Ажлын туршлага",
  education: "Боловсрол",
  internships: "Дадлага, төсөл",
  internshipsSlash: "Дадлага / Төсөл",
  awards: "Шагнал, амжилт",
  awardsSlash: "Шагнал / Нэмэлт мэдээлэл",
  certificates: "Сертификат",
  certificatesSlash: "Сургалт / Сертификат",
  additionalSkills: "Нэмэлт ур чадвар",
  overview: "Үндсэн мэдээлэл",
  contact: "Холбоо барих",
  personalInfo: "Ерөнхий мэдээлэл",
  personalInfoAlt: "Хувийн мэдээлэл",
  skills: "Ур чадвар",
  languages: "Гадаад хэл",
  info: "Мэдээлэл",
  phone: "Утас",
  email: "И-мэйл",
  address: "Хаяг",
  profile: "Профайл",
  birthDate: "Төрсөн огноо",
  gender: "Хүйс",
  regNo: "Регистр",
  regNoFull: "Регистрийн дугаар",
  marital: "Гэрлэлтийн байдал",
  license: "Жолооны үнэмлэх",
  licenseSt: "Жолоо",
  salary: "Цалингийн хүлээлт",
  salarySt: "Цалин",
  personalSkills: "Хувийн ур чадвар",
  techSkills: "Компьютер",
  techSkillsFull: "Компьютерын ур чадвар",
  profSkills: "Мэргэжлийн ур чадвар",
  profSkillsSt: "Мэргэжлийн",
  artSkills: "Урлагийн чадвар",
  sportSkills: "Спортын чадвар",
  otherSkills: "Бусад",
  mainSkills: "Үндсэн",
  present: "Одоо",
  photo: "Зураг",
  noName: "Овог нэр",
  noNameAlt: "Нэр оруулаагүй",
  gpa: "Голч: ",
  cvTitle: "Монголын компаниудад зориулсан CV",
  byType: "Төрлөөр",
  level: "Түвшин",
  extra: "Нэмэлт",
  langLabel: "Хэл",
  openCert: "Гэрчилгээ нээх",
  certAlt: "Гэрчилгээ",
  cvPositionFallback: "Анкет / CV",
  printed: "Татсан: ",
};

var JA = {
  about: "自己紹介",
  aboutObjective: "プロフィール / 目標",
  experience: "職務経歴",
  education: "学歴",
  internships: "インターンシップ・プロジェクト",
  internshipsSlash: "インターンシップ / プロジェクト",
  awards: "受賞歴・実績",
  awardsSlash: "受賞歴 / その他",
  certificates: "資格・認定",
  certificatesSlash: "研修 / 資格",
  additionalSkills: "その他のスキル",
  overview: "基本情報",
  contact: "連絡先",
  personalInfo: "個人情報",
  personalInfoAlt: "個人情報",
  skills: "スキル",
  languages: "語学力",
  info: "情報",
  phone: "電話番号",
  email: "メール",
  address: "住所",
  profile: "プロフィール",
  birthDate: "生年月日",
  gender: "性別",
  regNo: "ID",
  regNoFull: "ID番号",
  marital: "婚姻状況",
  license: "運転免許",
  licenseSt: "免許",
  salary: "希望年収",
  salarySt: "年収",
  personalSkills: "対人スキル",
  techSkills: "ITスキル",
  techSkillsFull: "コンピュータスキル",
  profSkills: "専門スキル",
  profSkillsSt: "専門",
  artSkills: "芸術・創作",
  sportSkills: "スポーツ",
  otherSkills: "その他",
  mainSkills: "主なスキル",
  present: "現在",
  photo: "写真",
  noName: "氏名",
  noNameAlt: "名前未入力",
  gpa: "GPA: ",
  cvTitle: "履歴書",
  byType: "種類別",
  level: "レベル",
  extra: "追加情報",
  langLabel: "言語",
  openCert: "証明書を開く",
  certAlt: "証明書",
  cvPositionFallback: "履歴書 / CV",
  printed: "印刷日: ",
};

var EN = {
  about: "About Me",
  aboutObjective: "Profile / Objective",
  experience: "Work Experience",
  education: "Education",
  internships: "Internships & Projects",
  internshipsSlash: "Internships / Projects",
  awards: "Awards & Achievements",
  awardsSlash: "Awards / Additional Info",
  certificates: "Certificates",
  certificatesSlash: "Training / Certificates",
  additionalSkills: "Additional Skills",
  overview: "Overview",
  contact: "Contact",
  personalInfo: "Personal Info",
  personalInfoAlt: "Personal Info",
  skills: "Skills",
  languages: "Languages",
  info: "Info",
  phone: "Phone",
  email: "Email",
  address: "Address",
  profile: "Profile",
  birthDate: "Date of Birth",
  gender: "Gender",
  regNo: "ID",
  regNoFull: "ID Number",
  marital: "Marital Status",
  license: "Driver's License",
  licenseSt: "License",
  salary: "Expected Salary",
  salarySt: "Salary",
  personalSkills: "Personal Skills",
  techSkills: "Computer Skills",
  techSkillsFull: "Computer Skills",
  profSkills: "Professional Skills",
  profSkillsSt: "Professional",
  artSkills: "Art Skills",
  sportSkills: "Sports Skills",
  otherSkills: "Other",
  mainSkills: "Main",
  present: "Present",
  photo: "Photo",
  noName: "Full Name",
  noNameAlt: "No Name",
  gpa: "GPA: ",
  cvTitle: "International CV",
  byType: "By Type",
  level: "Level",
  extra: "Additional",
  langLabel: "Languages",
  openCert: "Open certificate",
  certAlt: "Certificate",
  cvPositionFallback: "Resumé / CV",
  printed: "Printed: ",
};

export default function CVPreview({ cv, info, template, printStamp, lang }) {
  var L = lang === "en" ? EN : lang === "ja" ? JA : MN;
  var educations = Array.isArray(cv.educations) ? cv.educations : [];
  var experiences = Array.isArray(cv.experiences) ? cv.experiences : [];
  var skills = Array.isArray(cv.skills) ? cv.skills : [];
  var jaFont = lang === "ja" ? "'Meiryo', 'Yu Gothic', 'MS PGothic', " : "";
  var props = { cv, info, educations, experiences, skills, printStamp, L, jaFont };
  if (template === "classic") return <AsianTemplate {...props} />;
  if (template === "minimal") return <MinimalTemplate {...props} />;
  return <BestMongolianTemplate {...props} />;
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

function CertFilePreview({ url, openLabel, altLabel }) {
  if (!url) return null;
  var lower = url.toLowerCase();
  var isImage = lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: "6px" }}>
        <img src={url} alt={altLabel || "Гэрчилгээ"} style={{ width: "130px", height: "92px", objectFit: "cover", borderRadius: "4px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.10)", display: "block" }} />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "6px", padding: "5px 10px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "4px", textDecoration: "none" }}>
      <span style={{ fontSize: "15px" }}>📄</span>
      <span style={{ fontSize: "10.5px", color: "#c2410c", fontWeight: "600" }}>{openLabel || "Гэрчилгээ нээх"}</span>
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

function BestMongolianTemplate({ info, educations, experiences, skills, printStamp, L, jaFont = "" }) {
  var { personalSkills, techSkills, profSkills, artSkills, sportSkills, languages, certs, internships, awards } = parseSkillsFromInfo(info);
  var fullName = [info.lastName, info.firstName].filter(Boolean).join(" ");
  var fallbackSkills = skills.map(function (s) { return s.skill_name; }).filter(Boolean);
  var leftSkillGroups = [];
  if (personalSkills.length > 0) leftSkillGroups.push({ title: L.personalSkills, items: personalSkills, isTech: false });
  if (techSkills.length > 0) leftSkillGroups.push({ title: L.techSkills, items: techSkills, isTech: true });
  if (leftSkillGroups.length === 0 && fallbackSkills.length > 0) leftSkillGroups.push({ title: L.skills, items: fallbackSkills });
  var rightSkillGroups = [];
  if (profSkills.length > 0) rightSkillGroups.push({ title: L.profSkills, items: profSkills });
  if (artSkills.length > 0) rightSkillGroups.push({ title: L.artSkills, items: artSkills });
  if (sportSkills.length > 0) rightSkillGroups.push({ title: L.sportSkills, items: sportSkills });
  var contactItems = [
    info.phone ? { label: L.phone, value: info.phone + (info.phone2 ? " / " + info.phone2 : "") } : null,
    info.email ? { label: L.email, value: info.email } : null,
    info.address ? { label: L.address, value: info.address } : null,
    info.linkedin ? { label: L.profile, value: info.linkedin } : null,
  ].filter(Boolean);
  var personalInfo = [
    info.birthDate ? { label: L.birthDate, value: info.birthDate } : null,
    info.gender ? { label: L.gender, value: info.gender } : null,
    info.regNo ? { label: L.regNo, value: info.regNo } : null,
    info.marital ? { label: L.marital, value: info.marital } : null,
    info.license ? { label: L.license, value: info.license } : null,
    info.salaryExpect ? { label: L.salary, value: info.salaryExpect } : null,
  ].filter(Boolean);

  return (
    <div className="cv-print-document" style={{ background: "#fff", color: "#283044", fontFamily: jaFont + "'Inter', 'Segoe UI', Arial, sans-serif", minHeight: "297mm", padding: "34px 34px 30px", boxSizing: "border-box" }}>
      <div style={{ display: "grid", gridTemplateColumns: "190px minmax(0, 1fr)", gap: "34px", alignItems: "start" }}>
        <aside>
          {printStamp && <p className="cv-print-section" style={{ fontSize: "9.4px", color: "#98a2b3", lineHeight: 1.35, margin: "0 0 6px", fontWeight: "650" }}>{L.printed}{printStamp}</p>}
          <div className="cv-print-section" style={{ width: "110px", height: "110px", borderRadius: "7px", background: "#eef3f7", overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: "14px" }}>
            {info.photoUrl ? <img src={info.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#8a96a8", fontSize: "10px", fontWeight: "700" }}>{L.photo}</div>}
          </div>

          <BestSideBlock title={L.contact}>
            {contactItems.length > 0 ? contactItems.map(function (item, i) {
              return <BestInfoLine key={i} label={item.label} value={item.value} />;
            }) : <p style={{ fontSize: "10.4px", color: "#7b8494", lineHeight: 1.5, margin: 0 }}>Утас, и-мэйл, хаягаа оруулна уу.</p>}
          </BestSideBlock>

          {personalInfo.length > 0 && (
            <BestSideBlock title={L.personalInfo}>
              {personalInfo.map(function (item, i) {
                return <BestInfoLine key={i} label={item.label} value={item.value} />;
              })}
            </BestSideBlock>
          )}

          {leftSkillGroups.length > 0 && (
            <BestSideBlock title={L.skills}>
              {leftSkillGroups.map(function (group, i) {
                return <BestSkillGroup key={i} title={group.title} items={group.items} compact isTech={group.isTech} />;
              })}
            </BestSideBlock>
          )}

          {languages.length > 0 && (
            <BestSideBlock title={L.languages}>
              {languages.map(function (l, i) {
                return <BestLanguageLine key={i} name={l.name} level={l.level} />;
              })}
            </BestSideBlock>
          )}

        </aside>

        <main>
          <div className="cv-print-section" style={{ marginBottom: "20px" }}>
            <h1 style={{ fontSize: "30px", lineHeight: 1.05, fontWeight: "850", color: "#23283a", margin: 0, letterSpacing: 0 }}>{fullName || L.noName}</h1>
            <p style={{ fontSize: "11px", color: "#1d75b9", fontWeight: "700", margin: "7px 0 0" }}>{L.cvTitle}</p>
          </div>

          <BestSection title={L.about}>
            <p style={{ fontSize: "11.4px", lineHeight: 1.62, color: "#667085", margin: 0, whiteSpace: "pre-line" }}>
              {info.about || "Өөрийн туршлага, зорилго, давуу талаа 3-4 өгүүлбэрээр товч, тодорхой бичнэ үү."}
            </p>
          </BestSection>

          {experiences.length > 0 && (
            <BestSection title={L.experience}>
              {experiences.map(function (exp, i) {
                return (
                  <BestExperienceItem
                    key={i}
                    title={exp.position}
                    company={exp.company}
                    date={exp.start_date ? exp.start_date + " - " + (exp.end_date || L.present) : ""}
                    description={exp.description}
                    last={i === experiences.length - 1}
                  />
                );
              })}
            </BestSection>
          )}

          {educations.length > 0 && (
            <BestSection title={L.education}>
              {educations.map(function (edu, i) {
                return (
                  <BestCompactItem
                    key={i}
                    title={edu.school}
                    subtitle={[edu.level || edu.degree, edu.major, edu.gpa ? L.gpa + edu.gpa : ""].filter(Boolean).join(" | ")}
                    date={edu.start_year ? edu.start_year + " - " + (edu.end_year || L.present) : ""}
                    last={i === educations.length - 1}
                  />
                );
              })}
            </BestSection>
          )}

          {internships.length > 0 && (
            <BestSection title={L.internships}>
              {internships.map(function (n, i) {
                return <BestCompactItem key={i} title={n.title} subtitle={n.company} date={n.start_date ? n.start_date + " - " + (n.end_date || "") : ""} description={n.description} last={i === internships.length - 1} />;
              })}
            </BestSection>
          )}

          {awards.length > 0 && (
            <BestSection title={L.awards}>
              {awards.map(function (a, i) {
                return <BestAwardItem key={i} title={a.name} date={a.year || ""} last={i === awards.length - 1} />;
              })}
            </BestSection>
          )}

          {certs.length > 0 && (
            <BestSection title={L.certificates}>
              {certs.map(function (c, i) {
                return (
                  <BestCompactItem
                    key={i}
                    title={c.name}
                    subtitle={c.organization}
                    date={c.start_date ? c.start_date + (c.end_date ? " - " + c.end_date : "") : ""}
                    last={i === certs.length - 1}
                  />
                );
              })}
            </BestSection>
          )}

          {rightSkillGroups.length > 0 && (
            <BestSection title={L.additionalSkills}>
              <div style={{ display: "grid", gridTemplateColumns: rightSkillGroups.length > 1 ? "1fr 1fr" : "1fr", gap: "12px 18px" }}>
                {rightSkillGroups.map(function (group, i) {
                  return <BestSkillGroup key={i} title={group.title} items={group.items} />;
                })}
              </div>
            </BestSection>
          )}

          {experiences.length === 0 && educations.length === 0 && (
            <BestSection title={L.overview}>
              <p style={{ fontSize: "11.5px", color: "#526276", lineHeight: 1.65, margin: 0 }}>Боловсрол, ажлын туршлага, ур чадвараа бөглөснөөр CV автоматаар бүрдэнэ.</p>
            </BestSection>
          )}
        </main>
      </div>
    </div>
  );
}

function BestSection({ title, children }) {
  return (
    <section style={{ marginBottom: "20px" }}>
      <h2 className="cv-print-section" style={{ fontSize: "15px", color: "#2a3042", margin: "0 0 9px", lineHeight: 1.15, fontWeight: "820", paddingBottom: "7px", borderBottom: "1px solid #d9e0e8", pageBreakAfter: "avoid" }}>{title}</h2>
      {children}
    </section>
  );
}

function BestSideBlock({ title, children }) {
  return (
    <section className="cv-print-section" style={{ marginBottom: "13px" }}>
      <h3 style={{ fontSize: "13.2px", color: "#2a3042", margin: "0 0 7px", lineHeight: 1.15, fontWeight: "820", paddingBottom: "5px", borderBottom: "1px solid #d9e0e8" }}>{title}</h3>
      {children}
    </section>
  );
}

function BestExperienceItem({ title, company, date, description, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : "15px", pageBreakInside: "avoid" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 118px", gap: "14px", alignItems: "start" }}>
        <div>
          <p style={{ fontSize: "12.5px", fontWeight: "820", color: "#293044", margin: 0, lineHeight: 1.25 }}>{title}</p>
          {company && <p style={{ fontSize: "11.2px", color: "#1d75b9", fontWeight: "700", margin: "2px 0 0", lineHeight: 1.25 }}>{company}</p>}
        </div>
        {date && <p style={{ fontSize: "10.2px", color: "#7b8494", margin: 0, textAlign: "right", lineHeight: 1.35 }}>{date}</p>}
      </div>
      {description && <div style={{ fontSize: "10.8px", color: "#667085", marginTop: "7px", lineHeight: 1.55, whiteSpace: "pre-line" }}>{description}</div>}
    </div>
  );
}

function BestCompactItem({ title, subtitle, date, description, last }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 138px", gap: "10px", marginBottom: last ? 0 : "13px", pageBreakInside: "avoid" }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: "12.2px", fontWeight: "820", color: "#293044", margin: 0, lineHeight: 1.3, overflowWrap: "break-word" }}>{title}</p>
        {subtitle && <p style={{ fontSize: "10.8px", color: "#667085", margin: "2px 0 0", lineHeight: 1.4, overflowWrap: "break-word" }}>{subtitle}</p>}
        {description && <p style={{ fontSize: "10.8px", color: "#667085", margin: "5px 0 0", lineHeight: 1.5, whiteSpace: "pre-line", overflowWrap: "break-word" }}>{description}</p>}
      </div>
      {date && <p style={{ fontSize: "10px", color: "#7b8494", margin: 0, textAlign: "right", lineHeight: 1.35, whiteSpace: "nowrap" }}>{date}</p>}
    </div>
  );
}

function BestAwardItem({ title, date, last }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 118px", gap: "14px", marginBottom: last ? 0 : "10px", pageBreakInside: "avoid" }}>
      <p style={{ fontSize: "10.8px", fontWeight: "400", color: "#7b8494", margin: 0, lineHeight: 1.5 }}>{title}</p>
      {date && <p style={{ fontSize: "10px", color: "#a0a8b5", margin: 0, textAlign: "right", lineHeight: 1.35 }}>{date}</p>}
    </div>
  );
}

function BestInfoLine({ label, value }) {
  return (
    <div style={{ marginBottom: "6px", pageBreakInside: "avoid" }}>
      <p style={{ fontSize: "8.8px", color: "#98a2b3", fontWeight: "760", textTransform: "uppercase", letterSpacing: "0.3px", margin: "0 0 1px" }}>{label}</p>
      <p style={{ fontSize: "10.5px", color: "#596579", lineHeight: 1.35, margin: 0, wordBreak: "break-word" }}>{value}</p>
    </div>
  );
}

function BestSkillPill({ text, muted }) {
  return <span style={{ display: "inline-block", maxWidth: "100%", fontSize: "9.6px", lineHeight: 1.22, color: muted ? "#596579" : "#1d75b9", background: muted ? "#f4f6f8" : "#edf7ff", borderRadius: "5px", padding: "4px 6px", fontWeight: "650", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", hyphens: "auto" }}>{text}</span>;
}

function BestSkillGroup({ title, items, compact, isTech = false }) {
  return (
    <div style={{ marginBottom: compact ? "7px" : 0, pageBreakInside: "avoid" }}>
      <p style={{ fontSize: compact ? "8.8px" : "10.4px", color: "#98a2b3", fontWeight: "760", textTransform: "uppercase", letterSpacing: "0.3px", margin: "0 0 4px", overflowWrap: "anywhere", wordBreak: "break-word" }}>{title}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? "4px" : "7px", alignItems: "flex-start" }}>
        {items.map(function (s, i) { return <BestSkillPill key={i} text={s} muted={compact && !isTech} />; })}
      </div>
    </div>
  );
}

function BestLanguageLine({ name, level }) {
  var filled = level === "Бүрэн эзэмшсэн" ? 5 : level === "Ахисан дунд шат" ? 4 : level === "Дунд шат" ? 3 : level ? 2 : 0;
  return (
    <div style={{ marginBottom: "10px", pageBreakInside: "avoid" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
        <p style={{ fontSize: "10.6px", color: "#596579", margin: 0, fontWeight: "650" }}>{name}</p>
        <div style={{ display: "flex", gap: "3px" }}>
          {[1, 2, 3, 4, 5].map(function (n) {
            return <span key={n} style={{ width: "7px", height: "7px", borderRadius: "50%", background: n <= filled ? "#1d75b9" : "#d8e4ef", display: "inline-block" }} />;
          })}
        </div>
      </div>
      {level && <p style={{ fontSize: "9.4px", color: "#98a2b3", margin: "2px 0 0", textAlign: "right" }}>{level}</p>}
    </div>
  );
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
                    <CertFilePreview url={c.file_url} openLabel={L.openCert} altLabel={L.certAlt} />
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
                  <CertFilePreview url={c.file_url} openLabel={L.openCert} altLabel={L.certAlt} />
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

function AsianTemplate({ info, educations, experiences, skills, L, jaFont = "" }) {
  var { personalSkills, techSkills, profSkills, artSkills, sportSkills, languages, certs, internships, awards } = parseSkillsFromInfo(info);
  var fullName = [info.lastName, info.firstName].filter(Boolean).join(" ");
  var fallbackSkills = skills.map(function (s) { return s.skill_name; }).filter(Boolean);
  var coreSkills = personalSkills.length > 0 ? personalSkills : fallbackSkills;
  var additionalSkills = artSkills.concat(sportSkills);
  var contactItems = [
    info.phone ? { label: L.phone, value: info.phone + (info.phone2 ? ", " + info.phone2 : "") } : null,
    info.email ? { label: L.email, value: info.email } : null,
    info.address ? { label: L.address, value: info.address } : null,
    info.linkedin ? { label: "LinkedIn", value: info.linkedin } : null,
  ].filter(Boolean);
  var hasPersonalInfo = info.birthDate || info.gender || info.marital || info.regNo || info.license || info.salaryExpect;

  return (
    <div className="cv-print-document" style={{ background: "#fff", fontFamily: jaFont + "'Inter', 'Segoe UI', Arial, sans-serif", color: "#172033", minHeight: "297mm" }}>
      <div className="cv-print-section" style={{ display: "grid", gridTemplateColumns: "96px 1fr 190px", gap: "18px", alignItems: "center", background: "#12233f", color: "#fff", padding: "22px 30px 18px", borderBottom: "5px solid #5d7899" }}>
        <div style={{ width: "92px", height: "116px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {info.photoUrl ? <img src={info.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{L.photo}</span>}
        </div>
        <div>
          <h1 style={{ fontSize: "27px", lineHeight: 1.08, fontWeight: "800", letterSpacing: "0.4px", textTransform: "uppercase", margin: 0 }}>{fullName || L.noName}</h1>
          <div style={{ width: "68px", height: "2px", background: "#8ea9c6", margin: "9px 0 8px" }} />
          <p style={{ fontSize: "12px", lineHeight: 1.45, color: "#dbe7f4", margin: 0, fontWeight: "600" }}>{info.position || L.cvPositionFallback}</p>
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
            <AsianSideSection title={L.personalInfoAlt}>
              <AsianInfoList>
                {info.birthDate && <AsianInfoItem label={L.birthDate} value={info.birthDate} />}
                {info.gender && <AsianInfoItem label={L.gender} value={info.gender} />}
                {info.marital && <AsianInfoItem label={L.marital} value={info.marital} />}
                {info.regNo && <AsianInfoItem label={L.regNoFull} value={info.regNo} />}
                {info.license && <AsianInfoItem label={L.license} value={info.license} />}
                {info.salaryExpect && <AsianInfoItem label={L.salary} value={info.salaryExpect} />}
              </AsianInfoList>
            </AsianSideSection>
          )}
          {languages.length > 0 && <AsianSideSection title={L.languages}>{languages.map(function (l, i) { return <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "10.8px", marginBottom: "5px", lineHeight: 1.35 }}><b>{l.name}</b>{l.level ? <span style={{ color: "#64748b", textAlign: "right" }}>{l.level}</span> : ""}</div>; })}</AsianSideSection>}
          {coreSkills.length > 0 && <AsianSideSection title={L.personalSkills}><AsianBulletList items={coreSkills} /></AsianSideSection>}
          {techSkills.length > 0 && <AsianSideSection title={L.techSkillsFull}><AsianBulletList items={techSkills} /></AsianSideSection>}
          {profSkills.length > 0 && <AsianSideSection title={L.profSkills}><AsianBulletList items={profSkills} /></AsianSideSection>}
          {additionalSkills.length > 0 && <AsianSideSection title={L.additionalSkills}><AsianBulletList items={additionalSkills} /></AsianSideSection>}
        </aside>
        <main style={{ flex: 1, padding: "18px 28px 22px 24px", boxSizing: "border-box" }}>
          {info.about && <AsianMainSection title={L.aboutObjective}><p style={{ fontSize: "11.2px", lineHeight: 1.65, color: "#334155", margin: 0, whiteSpace: "pre-line" }}>{info.about}</p></AsianMainSection>}
          {educations.length > 0 && (
            <AsianMainSection title={L.education}>
              {educations.map(function (edu, i) {
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 96px", gap: "12px", marginBottom: i < educations.length - 1 ? "11px" : 0, paddingBottom: i < educations.length - 1 ? "10px" : 0, borderBottom: i < educations.length - 1 ? "1px solid #e8edf3" : "none", pageBreakInside: "avoid" }}>
                    <div><p style={{ fontWeight: "800", fontSize: "12.5px", margin: 0, color: "#172033" }}>{edu.school}</p><p style={{ fontSize: "10.8px", color: "#526176", margin: "3px 0 0", lineHeight: 1.45 }}>{[edu.level || edu.degree, edu.major, edu.gpa ? "GPA " + edu.gpa : ""].filter(Boolean).join(" / ")}</p></div>
                    <p style={{ fontSize: "10.5px", color: "#64748b", whiteSpace: "nowrap", textAlign: "right", margin: 0 }}>{edu.start_year ? edu.start_year + " - " + (edu.end_year || L.present) : ""}</p>
                  </div>
                );
              })}
            </AsianMainSection>
          )}
          {experiences.length > 0 && (
            <AsianMainSection title={L.experience}>
              {experiences.map(function (exp, i) {
                return (
                  <div key={i} style={{ marginBottom: i < experiences.length - 1 ? "13px" : 0, paddingBottom: i < experiences.length - 1 ? "12px" : 0, borderBottom: i < experiences.length - 1 ? "1px solid #e8edf3" : "none", pageBreakInside: "avoid" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 112px", gap: "12px" }}>
                      <div><p style={{ fontWeight: "800", fontSize: "12.5px", margin: 0, color: "#172033" }}>{exp.position}</p><p style={{ fontSize: "11.2px", color: "#335f8f", margin: "2px 0 0", fontWeight: "700" }}>{exp.company}</p></div>
                      <p style={{ fontSize: "10.5px", color: "#64748b", whiteSpace: "nowrap", textAlign: "right", margin: 0 }}>{exp.start_date ? exp.start_date + " - " + (exp.end_date || L.present) : ""}</p>
                    </div>
                    {exp.description && <p style={{ fontSize: "11px", color: "#3f4d63", margin: "6px 0 0", lineHeight: 1.55, whiteSpace: "pre-line" }}>{exp.description}</p>}
                  </div>
                );
              })}
            </AsianMainSection>
          )}
          {internships.length > 0 && (
            <AsianMainSection title={L.internshipsSlash}>
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
            <AsianMainSection title={L.certificatesSlash}>
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
                    <CertFilePreview url={c.file_url} openLabel={L.openCert} altLabel={L.certAlt} />
                  </div>
                );
              })}
            </AsianMainSection>
          )}
          {awards.length > 0 && (
            <AsianMainSection title={L.awardsSlash}>
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
                    <CertFilePreview url={c.file_url} openLabel={L.openCert} altLabel={L.certAlt} />
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

function MinimalTemplate({ info, educations, experiences, skills, L, jaFont = "" }) {
  var { personalSkills, techSkills, profSkills, artSkills, sportSkills, languages, certs, internships, awards } = parseSkillsFromInfo(info);
  var fullName = [info.lastName, info.firstName].filter(Boolean).join(" ");
  var allSkills = personalSkills.concat(techSkills).concat(profSkills).concat(artSkills).concat(sportSkills);
  var contactItems = [info.address, info.phone, info.email].filter(Boolean);
  var skillColumns = [];
  if (techSkills.length > 0) skillColumns.push({ title: L.techSkills, items: techSkills });
  if (profSkills.length > 0) skillColumns.push({ title: L.profSkillsSt, items: profSkills });
  if (personalSkills.length > 0) skillColumns.push({ title: L.personalSkills, items: personalSkills });
  if (skillColumns.length === 0 && allSkills.length > 0) skillColumns.push({ title: L.mainSkills, items: allSkills });
  if (skillColumns.length === 0 && skills.length > 0) {
    skillColumns.push({ title: L.mainSkills, items: skills.map(function (s) { return s.skill_name; }) });
  }
  var extraSkills = [];
  if (artSkills.length > 0) extraSkills = extraSkills.concat(artSkills);
  if (sportSkills.length > 0) extraSkills = extraSkills.concat(sportSkills);
  return (
    <div className="cv-print-document" style={{ background: "#fff", fontFamily: jaFont ? jaFont + "sans-serif" : "'Georgia', 'Times New Roman', serif", color: "#222", minHeight: "297mm", padding: "34px 38px 30px" }}>
      <div className="cv-print-section" style={{ marginBottom: "20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "29px", fontWeight: "700", letterSpacing: "0.2px", margin: 0, color: "#171717", lineHeight: 1.05 }}>{fullName || L.noNameAlt}</h1>
        {info.position && <p style={{ fontSize: "13px", color: "#404040", margin: "7px 0 0", fontWeight: "400" }}>{info.position}</p>}
        {contactItems.length > 0 && <p style={{ fontSize: "10.5px", color: "#525252", margin: "8px 0 0", lineHeight: 1.6 }}>{contactItems.join("  •  ")}</p>}
        {info.linkedin && <p style={{ fontSize: "10.5px", color: "#525252", margin: "2px 0 0" }}>{info.linkedin}</p>}
      </div>
      {info.about && (
        <MinimalSection title={L.about}>
          <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "14px" }}>
            <div style={{ fontSize: "10px", color: "#666" }}></div>
            <p style={{ fontSize: "11px", color: "#3d3d3d", margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>{info.about}</p>
          </div>
        </MinimalSection>
      )}
      {educations.length > 0 && (
        <MinimalSection title={L.education}>
          {educations.map(function (edu, i) {
            return (
              <div key={i} className="cv-print-section" style={{ display: "grid", gridTemplateColumns: "96px 1fr 110px", gap: "14px", marginBottom: i < educations.length - 1 ? "12px" : 0 }}>
                <div style={{ fontSize: "10px", color: "#5f5f5f", lineHeight: 1.5 }}>{edu.start_year ? edu.start_year + (edu.end_year ? " – " + edu.end_year : " – " + L.present) : ""}</div>
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
        <MinimalSection title={L.experience}>
          {experiences.map(function (exp, i) {
            return (
              <div key={i} className="cv-print-section" style={{ display: "grid", gridTemplateColumns: "96px 1fr 110px", gap: "14px", marginBottom: i < experiences.length - 1 ? "14px" : 0 }}>
                <div style={{ fontSize: "10px", color: "#5f5f5f", lineHeight: 1.5 }}>{exp.start_date ? exp.start_date + " – " + (exp.end_date || L.present) : ""}</div>
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
        <MinimalSection title={L.skills}>
          <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "14px" }}>
            <div style={{ fontSize: "10px", color: "#5f5f5f" }}>{L.byType}</div>
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
        <MinimalSection title={L.languages}>
          <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "14px" }}>
            <div style={{ fontSize: "10px", color: "#5f5f5f" }}>{L.level}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 18px" }}>
              {languages.map(function (l, i) {
                return <div key={i} style={{ fontSize: "10.8px", color: "#3d3d3d" }}>{l.name}{l.level ? <span style={{ color: "#777" }}> {l.level}</span> : ""}</div>;
              })}
            </div>
          </div>
        </MinimalSection>
      )}
      {(certs.length > 0 || internships.length > 0 || awards.length > 0) && (
        <MinimalSection title={L.extra}>
          <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "14px" }}>
            <div style={{ fontSize: "10px", color: "#5f5f5f" }}>{L.extra}</div>
            <div style={{ fontSize: "10.8px", color: "#3d3d3d", lineHeight: 1.8 }}>
              {certs.length > 0 && <div><b>{L.certificates}:</b> {certs.map(function (c) { return c.name; }).join(", ")}</div>}
              {internships.length > 0 && <div><b>{L.internships}:</b> {internships.map(function (n) { return [n.title, n.company].filter(Boolean).join(" - "); }).join(", ")}</div>}
              {awards.length > 0 && <div><b>{L.awards}:</b> {awards.map(function (a) { return a.name + (a.year ? " (" + a.year + ")" : ""); }).join(", ")}</div>}
            </div>
          </div>
        </MinimalSection>
      )}
      {(info.birthDate || info.marital || info.gender || info.address || info.regNo) && (
        <div className="cv-print-section" style={{ marginTop: "18px", borderTop: "1px solid #bdbdbd", paddingTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
          {info.birthDate && <div style={{ fontSize: "10.5px", color: "#444" }}><span style={{ color: "#777" }}>{L.birthDate} / {L.address}</span><span style={{ marginLeft: "10px" }}>{info.birthDate}{info.address ? " / " + info.address : ""}</span></div>}
          {info.marital && <div style={{ fontSize: "10.5px", color: "#444", textAlign: "right" }}><span style={{ color: "#777" }}>{L.marital}</span><span style={{ marginLeft: "10px" }}>{info.marital}</span></div>}
          {(info.regNo || info.gender) && <div style={{ fontSize: "10.5px", color: "#444" }}><span style={{ color: "#777" }}>{L.regNo} / {L.gender}</span><span style={{ marginLeft: "10px" }}>{info.regNo ? info.regNo + " / " : ""}{info.gender || ""}</span></div>}
        </div>
      )}
    </div>
  );
}

function MinimalSection({ title, children }) {
  return <div style={{ marginBottom: "18px", borderTop: "1px solid #bdbdbd", paddingTop: "8px" }}><div className="cv-print-section" style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: "14px" }}><p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.2px", color: "#3f3f46", margin: 0, pageBreakAfter: "avoid" }}>{title}</p><div>{children}</div></div></div>;
}
