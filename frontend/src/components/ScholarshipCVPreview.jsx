export default function ScholarshipCVPreview({ data, innerRef }) {
  var country = data?.country || "";
  var profile = data?.profile || {};
  var edu = data?.edu || {};
  var ach = data?.ach || {};
  var ldr = data?.ldr || {};
  var goals = data?.goals || {};

  var name = profile.fullName || "YOUR FULL NAME";

  function SecTitle({ children }) {
    return (
      <div className="mb-1.5">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-800">{children}</div>
        <div className="border-b border-gray-400 mt-0.5" />
      </div>
    );
  }

  function Lines({ text }) {
    if (!text || !text.trim()) return null;
    var ls = text.split("\n").filter(Boolean);
    return (
      <div className="space-y-0.5">
        {ls.map(function (l, i) {
          return (
            <div key={i} className="flex gap-1.5 leading-snug">
              <span className="shrink-0 mt-0.5">•</span>
              <span>{l}</span>
            </div>
          );
        })}
      </div>
    );
  }

  var hasContact = profile.email || profile.phone || profile.location;
  var hasLinks = profile.linkedin || profile.portfolio;
  var hasEdu = edu.school || edu.degree;
  var hasLang = ach.langScores && ach.langScores.some(function (ls) { return ls.type && ls.score; });
  var hasAch = ach.awards || ach.competitions || ach.certificates || hasLang;
  var hasLdr = ldr.leadership || ldr.volunteer || ldr.extracurricular;
  var hasGoals = goals.careerGoal || goals.whyScholarship || goals.impactPlan || goals.howContribute;
  var hasStudyPlan = country === "Japan" && goals.studyPlan;

  return (
    <div
      ref={innerRef}
      className="bg-white text-gray-800 px-8 py-7 text-xs leading-relaxed sc-preview-root"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif", width: "794px", minHeight: "1123px" }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-base font-bold text-gray-900 uppercase tracking-widest mb-1">{name}</h1>
        {hasContact ? (
          <div className="text-gray-600">
            {[profile.email, profile.phone, profile.location].filter(Boolean).join(" | ")}
          </div>
        ) : (
          <div className="text-gray-300 italic">email | phone | city, country</div>
        )}
        {hasLinks && (
          <div className="text-gray-500 mt-0.5">
            {[profile.linkedin, profile.portfolio].filter(Boolean).join("  |  ")}
          </div>
        )}
        {country === "Japan" && (
          <div className="text-gray-400 italic mt-1">
            Photo: Attach passport-size photo if required by scholarship
          </div>
        )}
      </div>

      <div className="border-b-2 border-gray-800 mb-3" />

      {/* Education */}
      <div className="mb-3">
        <SecTitle>Education</SecTitle>
        {hasEdu ? (
          <div>
            <div className="flex justify-between items-start">
              <span className="font-bold text-gray-900">{edu.school || "University Name"}</span>
              {edu.graduationYear && <span className="text-gray-500 shrink-0 ml-4">{edu.graduationYear}</span>}
            </div>
            <div className="text-gray-700">
              {[edu.degree, edu.major].filter(Boolean).join(", ")}
              {edu.gpa && (
                <span className="ml-2 text-gray-500">
                  — GPA: {edu.gpa} / {edu.gpaScale || "4.00"}
                </span>
              )}
            </div>
            {edu.coursework && (
              <div className="text-gray-500 mt-0.5">Relevant Coursework: {edu.coursework}</div>
            )}
          </div>
        ) : (
          <div className="text-gray-300 italic">University Name, Degree, Major — GPA: x.xx / 4.00</div>
        )}
      </div>

      {/* Achievements */}
      {hasAch && (
        <div className="mb-3">
          <SecTitle>Academic Achievements &amp; Awards</SecTitle>
          <div className="space-y-0.5">
            {ach.awards && ach.awards.split("\n").filter(Boolean).map(function (a, i) {
              return <div key={i}>• {a}</div>;
            })}
            {ach.competitions && ach.competitions.split("\n").filter(Boolean).map(function (c, i) {
              return <div key={`c${i}`}>• {c}</div>;
            })}
            {ach.certificates && ach.certificates.split("\n").filter(Boolean).map(function (c, i) {
              return <div key={`cert${i}`}>• {c}</div>;
            })}
            {ach.langScores && ach.langScores.filter(function (ls) { return ls.type && ls.score; }).map(function (ls, i) {
              return <div key={`lang${i}`}>• {ls.type}: {ls.score}</div>;
            })}
          </div>
        </div>
      )}

      {/* Leadership & Volunteer */}
      {(hasLdr || ldr.extracurricular) && (
        <div className="mb-3">
          <SecTitle>Leadership &amp; Volunteer Experience</SecTitle>
          <div className="space-y-1">
            {ldr.leadership && <Lines text={ldr.leadership} />}
            {ldr.volunteer && <Lines text={ldr.volunteer} />}
            {ldr.extracurricular && <Lines text={ldr.extracurricular} />}
          </div>
        </div>
      )}

      {/* Projects / Research */}
      {ldr.projects && (
        <div className="mb-3">
          <SecTitle>Research &amp; Projects</SecTitle>
          <Lines text={ldr.projects} />
        </div>
      )}

      {/* Work Experience */}
      {ldr.work && (
        <div className="mb-3">
          <SecTitle>Work &amp; Internship Experience</SecTitle>
          <Lines text={ldr.work} />
        </div>
      )}

      {/* Goals & Motivation */}
      {hasGoals && (
        <div className="mb-3">
          <SecTitle>Goals &amp; Future Contribution</SecTitle>
          <div className="space-y-1">
            {goals.careerGoal && (
              <div>
                <span className="font-semibold" style={{ fontStyle: "normal" }}>Career Goal: </span>
                {goals.careerGoal}
              </div>
            )}
            {goals.whyScholarship && (
              <div>
                <span className="font-semibold">Why This Scholarship: </span>
                {goals.whyScholarship}
              </div>
            )}
            {goals.howContribute && (
              <div>
                <span className="font-semibold">Contribution Plan: </span>
                {goals.howContribute}
              </div>
            )}
            {goals.impactPlan && (
              <div>
                <span className="font-semibold">Post-Scholarship Impact: </span>
                {goals.impactPlan}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Japan: Study Plan summary */}
      {hasStudyPlan && (
        <div className="mb-3">
          <SecTitle>Study Plan — 研究計画書</SecTitle>
          <div className="text-gray-700">{goals.studyPlan}</div>
          {goals.whyCountry && (
            <div className="mt-1">
              <span className="font-semibold">Why Japan / Target Lab: </span>
              {goals.whyCountry}
            </div>
          )}
        </div>
      )}

      {/* Country-specific footer note */}
      {country && (
        <div className="mt-6 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-400 italic text-center">
            {country === "United States" && "US Scholarship CV — No photo, age, gender, or marital status included"}
            {country === "Australia" && "Australia Scholarship CV — Evidence-based, selection criteria focused"}
            {country === "Japan" && "Japan Scholarship CV — Formal academic style · Attach photo if required"}
          </div>
        </div>
      )}

      {!country && (
        <div className="mt-6 pt-3 border-t border-gray-200 text-center text-gray-300 italic text-xs">
          Улс сонгох үед CV загвар тохируулагдана
        </div>
      )}
    </div>
  );
}
