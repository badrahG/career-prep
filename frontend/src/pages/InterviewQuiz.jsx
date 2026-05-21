import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

export default function InterviewQuiz() {
  var [stage, setStage] = useState("start");
  var [category, setCategory] = useState("all");
  var [limit, setLimit] = useState(10);
  var [questions, setQuestions] = useState([]);
  var [loading, setLoading] = useState(false);
  var [currentIndex, setCurrentIndex] = useState(0);
  var [answers, setAnswers] = useState({});
  var [result, setResult] = useState(null);
  var [submitting, setSubmitting] = useState(false);

  var [caseIntro, setCaseIntro] = useState(null);
  var [showCaseRef, setShowCaseRef] = useState(false);
  var [majors, setMajors] = useState([]);
  var [selectedMajorId, setSelectedMajorId] = useState(null);

  useEffect(function () {
    API.get("/interview/majors")
      .then(function (res) { setMajors(res.data); })
      .catch(function () {});
  }, []);

  function getCaseQuestionCount(qs, caseId) {
    return qs.filter(function (q) { return q.case_id === caseId; }).length;
  }

  var needsMajor = true;

  function startQuiz() {
    setLoading(true);
    var params = { limit: limit };
    if (category !== "all") params.category = category;
    if (needsMajor && selectedMajorId) params.major_id = selectedMajorId;
    API.get("/interview/quiz/questions", { params: params })
      .then(function (res) {
        if (res.data.length === 0) {
          toast.error("Quiz асуулт олдсонгүй. Админ үүсгэхийг хүлээнэ үү.");
          setLoading(false);
          return;
        }
        var qs = res.data;
        setQuestions(qs);
        setAnswers({});
        setResult(null);
        setShowCaseRef(false);

        if (qs[0] && qs[0].case_id) {
          setCaseIntro({
            case_id: qs[0].case_id,
            case_title: qs[0].case_title,
            case_text: qs[0].case_text,
            questionCount: getCaseQuestionCount(qs, qs[0].case_id),
            pendingIndex: 0,
          });
          setStage("case_intro");
        } else {
          setCurrentIndex(0);
          setStage("quiz");
        }
      })
      .catch(function () { toast.error("Ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }

  function startFromIntro() {
    setCurrentIndex(caseIntro.pendingIndex);
    setShowCaseRef(false);
    setStage("quiz");
  }

  function selectAnswer(questionId, option) {
    setAnswers({ ...answers, [questionId]: option });
  }

  function goNext() {
    var nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) return;
    var next = questions[nextIndex];
    var cur = questions[currentIndex];
    if (next.case_id && next.case_id !== cur.case_id) {
      setCaseIntro({
        case_id: next.case_id,
        case_title: next.case_title,
        case_text: next.case_text,
        questionCount: getCaseQuestionCount(questions, next.case_id),
        pendingIndex: nextIndex,
      });
      setShowCaseRef(false);
      setStage("case_intro");
    } else {
      setCurrentIndex(nextIndex);
      setShowCaseRef(false);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowCaseRef(false);
    }
  }

  async function submitQuiz() {
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm("Бүх асуултад хариулаагүй байна. Илгээх үү?")) return;
    }
    setSubmitting(true);
    try {
      var payload = {
        answers: questions
          .map(function (q) { return { question_id: q.id, selected_option: answers[q.id] || "a" }; })
          .filter(function (a) { return answers[a.question_id]; }),
      };
      var res = await API.post("/interview/quiz/submit", payload);
      setResult(res.data);
      setStage("result");
    } catch {
      toast.error("Илгээхэд алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setStage("start");
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setCaseIntro(null);
    setShowCaseRef(false);
    setSelectedMajorId(null);
  }

  var categoryLabels = { general: "Ерөнхий", technical: "Техникийн", behavioral: "Зан төлөвийн", case: "Кейс асуулт", all: "Бүгд" };
  var currentQuestion = questions[currentIndex];
  var answeredCount = Object.keys(answers).length;
  var progress = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <Layout>
      <div className="p-5 md:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-5">
          <Link to="/interview" className="hover:text-violet-600 transition">Ярилцлага</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 font-medium">Quiz</span>
        </div>

        <div className="mb-5">
          <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">Шалгах горим</p>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Quiz</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Олон сонголттой тестээр мэдлэгээ шалгаж дадлагажна.</p>
        </div>

        {/* STAGE: Start */}
        {stage === "start" && (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden mb-5">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Quiz-ийн тохиргоо</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Категори</label>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
                  {["all", "general", "technical", "behavioral", "case"].map(function (c) {
                    return (
                      <button key={c} onClick={function () { setCategory(c); setSelectedMajorId(null); }}
                        className={"flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap " +
                          (category === c ? "bg-violet-600 text-white" : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600")}>
                        {categoryLabels[c]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {needsMajor && majors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Мэргэжил сонгох <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">(заавал)</span>
                  </label>
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
                    {majors.map(function (m) {
                      return (
                        <button key={m.id}
                          onClick={function () { setSelectedMajorId(m.id === selectedMajorId ? null : m.id); }}
                          className={"flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap " +
                            (selectedMajorId === m.id
                              ? "bg-violet-600 text-white"
                              : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600")}>
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Асуултын тоо</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map(function (n) {
                    return (
                      <button key={n} onClick={function () { setLimit(n); }}
                        className={"flex-1 px-3 py-2 rounded-xl text-sm font-medium transition " +
                          (limit === n ? "bg-violet-600 text-white" : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600")}>
                        {n} асуулт
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Quiz-ийн дүрэм:</p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                  <li>• Асуулт бүрд 4 хариултын нэгийг сонгоно</li>
                  <li>• Кейс асуулт бол эхлээд нөхцөл байдлыг уншина</li>
                  <li>• Дуусахад оноо, зөв/буруу хариулт харагдана</li>
                </ul>
              </div>
              <button onClick={startQuiz} disabled={loading || (needsMajor && !selectedMajorId)}
                className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-3 rounded-full text-sm font-semibold hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition">
                {loading ? "Ачаалж байна..." : (needsMajor && !selectedMajorId) ? "Мэргэжил сонгоно уу" : "Quiz эхлүүлэх →"}
              </button>
            </div>
          </div>
        )}

        {/* STAGE: Case intro */}
        {stage === "case_intro" && caseIntro && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row">

                {/* Left — text */}
                <div className="flex-1 p-8 md:p-10 flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-violet-500">Кейс</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />
                    <span className="text-xs text-gray-400 dark:text-gray-500">{caseIntro.questionCount} асуулт</span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-snug mb-4">
                    {caseIntro.case_title || "Нөхцөл байдал"}
                  </h2>

                  <div className="h-px bg-gray-100 dark:bg-gray-700 mb-5" />

                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-7 whitespace-pre-wrap flex-1 mb-8">
                    {caseIntro.case_text}
                  </p>

                  <button onClick={startFromIntro}
                    className="w-full md:w-auto px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition shadow-sm hover:shadow-md">
                    Асуултуудыг эхлэх →
                  </button>
                </div>

                {/* Right — illustration */}
                <div className="hidden md:flex md:w-56 bg-gradient-to-b from-violet-50 via-indigo-50 to-purple-50 dark:from-violet-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 flex-col items-center justify-center gap-6 p-8">
                  <svg width="130" height="140" viewBox="0 0 130 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="18" y="28" width="68" height="84" rx="7" fill="#e0e7ff" />
                    <rect x="25" y="18" width="68" height="84" rx="7" fill="#c7d2fe" />
                    <rect x="32" y="8" width="68" height="84" rx="7" fill="white" stroke="#a5b4fc" strokeWidth="1.5" />
                    <rect x="44" y="23" width="44" height="3.5" rx="1.75" fill="#c7d2fe" />
                    <rect x="44" y="33" width="36" height="3" rx="1.5" fill="#ddd6fe" />
                    <rect x="44" y="42" width="40" height="3" rx="1.5" fill="#ddd6fe" />
                    <rect x="44" y="51" width="32" height="3" rx="1.5" fill="#ede9fe" />
                    <circle cx="88" cy="76" r="22" fill="#7c3aed" fillOpacity="0.08" />
                    <circle cx="88" cy="76" r="15" fill="none" stroke="#7c3aed" strokeWidth="2.5" />
                    <line x1="98" y1="87" x2="110" y2="99" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
                    <path d="M82 76 L86 80 L95 70" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="22" cy="118" r="10" fill="#ede9fe" />
                    <circle cx="118" cy="20" r="7" fill="#e0e7ff" />
                  </svg>

                  <div className="text-center">
                    <p className="text-xs text-violet-500 font-semibold leading-relaxed">Нөхцөл байдлыг сайтар уншаад бэлтгэлтэй хариулаарай</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* STAGE: Quiz in progress */}
        {stage === "quiz" && currentQuestion && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2 text-xs text-gray-400 dark:text-gray-500">
                <span>Асуулт {currentIndex + 1} / {questions.length}</span>
                <span>Хариулсан: <span className="font-semibold text-violet-600">{answeredCount}</span></span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full h-1.5 transition-all duration-300" style={{ width: progress + "%" }} />
              </div>
            </div>

            {/* Case reference */}
            {currentQuestion.case_id && currentQuestion.case_text && (
              <div className="mb-4">
                <button onClick={function () { setShowCaseRef(!showCaseRef); }}
                  className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 hover:text-violet-600 transition-colors py-1 group">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-violet-400 transition-colors">
                    <rect x="1" y="2" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M3.5 5.5h5M3.5 7.5h4M3.5 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <rect x="5" y="0.5" width="7.5" height="9.5" rx="1.5" fill="white" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M7 3.5h3.5M7 5.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span className="font-medium">{currentQuestion.case_title || "Кейс"}</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span>{showCaseRef ? "нуух" : "нөхцөл харах"}</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={"transition-transform " + (showCaseRef ? "rotate-180" : "")}>
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {showCaseRef && (
                  <div className="mt-2 border-l-2 border-violet-200 dark:border-violet-700 pl-4 py-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-7 whitespace-pre-wrap">{currentQuestion.case_text}</p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm mb-5">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className={"text-xs border px-2 py-0.5 rounded-lg font-semibold " +
                    (currentQuestion.category === "case"
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800"
                      : "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-800")}>
                    {categoryLabels[currentQuestion.category] || currentQuestion.category}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 leading-relaxed mb-6">
                  {currentQuestion.question_mn}
                </h2>
                <div className="space-y-2">
                  {[
                    { key: "a", text: currentQuestion.option_a },
                    { key: "b", text: currentQuestion.option_b },
                    { key: "c", text: currentQuestion.option_c },
                    { key: "d", text: currentQuestion.option_d },
                  ].map(function (opt) {
                    var selected = answers[currentQuestion.id] === opt.key;
                    return (
                      <button key={opt.key} onClick={function () { selectAnswer(currentQuestion.id, opt.key); }}
                        className={"w-full text-left px-4 py-3 rounded-xl border-2 transition " +
                          (selected ? "bg-violet-50 dark:bg-violet-900/20 border-violet-400" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500")}>
                        <div className="flex items-start gap-3">
                          <span className={"w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 " +
                            (selected ? "bg-violet-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400")}>
                            {opt.key.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed pt-1">{opt.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button onClick={goPrev} disabled={currentIndex === 0}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                ← Өмнөх
              </button>
              {currentIndex === questions.length - 1 ? (
                <button onClick={submitQuiz} disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition">
                  {submitting ? "Илгээж байна..." : "Quiz дуусгах ✓"}
                </button>
              ) : (
                <button onClick={goNext}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full text-sm font-semibold hover:shadow-md transition">
                  Дараах →
                </button>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {questions.map(function (q, i) {
                var isAnswered = answers[q.id];
                var isCurrent = i === currentIndex;
                var isCase = q.category === "case";
                return (
                  <button key={q.id} onClick={function () { setCurrentIndex(i); setShowCaseRef(false); }}
                    className={"w-8 h-8 rounded-lg text-xs font-semibold transition " + (
                      isCurrent ? (isCase ? "bg-blue-600 text-white" : "bg-violet-600 text-white") :
                      isAnswered ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700" :
                      isCase ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30" :
                      "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* STAGE: Results */}
        {stage === "result" && result && (
          <>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden mb-5">
              <div className={"h-1.5 " + (result.percentage >= 70 ? "bg-emerald-500" : result.percentage >= 50 ? "bg-amber-500" : "bg-red-500")} />
              <div className="p-8 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Таны оноо</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-6xl font-bold text-gray-800 dark:text-gray-200">{result.correct}</span>
                  <span className="text-3xl text-gray-300 dark:text-gray-600 font-light">/ {result.total}</span>
                </div>
                <div className={"inline-block text-lg font-bold px-4 py-1.5 rounded-xl " +
                  (result.percentage >= 70 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                  result.percentage >= 50 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                  "bg-red-50 text-red-700 border border-red-200")}>
                  {result.percentage}%
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-5 max-w-lg mx-auto leading-relaxed">{result.advice}</p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <button onClick={restart}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full text-sm font-semibold hover:shadow-md transition">
                    Дахин хийх
                  </button>
                  <Link to="/interview"
                    className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Горимууд
                  </Link>
                </div>
              </div>
            </div>

            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Дэлгэрэнгүй үр дүн</h2>
            <div className="space-y-3">
              {result.results.map(function (r, i) {
                return (
                  <div key={r.question_id} className={"bg-white dark:bg-gray-800 border rounded-2xl p-5 " + (r.is_correct ? "border-emerald-200 dark:border-emerald-800" : "border-red-200 dark:border-red-800")}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className={"w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 " +
                        (r.is_correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                        {r.is_correct ? "✓" : "✗"}
                      </span>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1">Асуулт {i + 1}: {r.question_mn}</p>
                    </div>
                    <div className="space-y-1.5 ml-10">
                      {[
                        { key: "a", text: r.option_a },
                        { key: "b", text: r.option_b },
                        { key: "c", text: r.option_c },
                        { key: "d", text: r.option_d },
                      ].map(function (opt) {
                        var isCorrect = opt.key === r.correct_option;
                        var isSelected = opt.key === r.selected_option;
                        var cls = "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400";
                        if (isCorrect) cls = "bg-emerald-50 border-emerald-300 text-emerald-900";
                        else if (isSelected && !isCorrect) cls = "bg-red-50 border-red-300 text-red-900";
                        return (
                          <div key={opt.key} className={"flex items-start gap-2 border rounded-xl px-3 py-2 text-sm " + cls}>
                            <span className="font-bold text-xs uppercase flex-shrink-0 mt-0.5">{opt.key}</span>
                            <span className="flex-1">{opt.text}</span>
                            {isCorrect && <span className="text-xs font-semibold flex-shrink-0">✓ Зөв</span>}
                            {isSelected && !isCorrect && <span className="text-xs font-semibold flex-shrink-0">Таны сонголт</span>}
                          </div>
                        );
                      })}
                    </div>
                    {r.explanation && (
                      <div className="mt-3 ml-10 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Тайлбар</p>
                        <p className="text-xs text-amber-900 leading-relaxed">{r.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
