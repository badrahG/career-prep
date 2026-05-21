import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

export default function InterviewStar() {
  var [stage, setStage] = useState("start");
  var [majors, setMajors] = useState([]);
  var [loading, setLoading] = useState(true);
  var [selectedMajor, setSelectedMajor] = useState(null);
  var [limit, setLimit] = useState(5);
  var [questions, setQuestions] = useState([]);
  var [answers, setAnswers] = useState({});
  var [currentIndex, setCurrentIndex] = useState(0);
  var [evaluating, setEvaluating] = useState(false);
  var [result, setResult] = useState(null);
  var [expandedSamples, setExpandedSamples] = useState({});

  useEffect(function () {
    API.get("/interview/open-ended/majors")
      .then(function (res) { setMajors(res.data); })
      .catch(function () { toast.error("Ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }, []);

  function selectMajor(major) {
    setLoading(true);
    API.get("/interview/open-ended/questions", { params: { major_id: major.id, limit: limit } })
      .then(function (res) {
        if (res.data.length === 0) {
          toast.error("Энэ мэргэжилд асуулт байхгүй байна.");
          return;
        }
        setSelectedMajor(major);
        setQuestions(res.data);
        setAnswers({});
        setCurrentIndex(0);
        setStage("answering");
      })
      .catch(function () { toast.error("Ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }

  function updateAnswer(questionId, value) {
    setAnswers(function (p) { return { ...p, [questionId]: value }; });
  }

  async function submitForEvaluation() {
    var filledCount = Object.values(answers).filter(function (a) { return a && a.trim(); }).length;
    if (filledCount === 0) {
      toast.error("Хамгийн багадаа нэг асуултад хариулна уу.");
      return;
    }
    if (filledCount < questions.length) {
      if (!window.confirm("Бүх асуултад хариулаагүй байна (" + filledCount + "/" + questions.length + "). AI дүгнүүлэх үү?")) return;
    }
    setStage("evaluating");
    setEvaluating(true);
    try {
      var payload = {
        major_id: selectedMajor.id,
        answers: questions
          .filter(function (q) { return answers[q.id] && answers[q.id].trim(); })
          .map(function (q) { return { question_id: q.id, answer: answers[q.id] }; }),
      };
      var res = await API.post("/interview/evaluate", payload);
      setResult(res.data);
      setStage("result");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Дүгнэхэд алдаа гарлаа");
      setStage("answering");
    } finally {
      setEvaluating(false);
    }
  }

  function toggleSample(questionId) {
    setExpandedSamples(function (p) { return { ...p, [questionId]: !p[questionId] }; });
  }

  function restart() {
    setStage("start");
    setSelectedMajor(null);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setExpandedSamples({});
    setLimit(5);
  }

  var currentQuestion = questions[currentIndex];
  var answeredCount = Object.values(answers).filter(function (a) { return a && a.trim(); }).length;
  var progress = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <Layout>
      <div className="p-5 md:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-5">
          <Link to="/interview" className="hover:text-violet-600 transition">Ярилцлага</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            {stage === "start" ? "Мэргэжлийн дадлага" : stage === "result" ? "Дүгнэлт" : selectedMajor?.name || "Дадлага"}
          </span>
        </div>

        <div className="mb-5">
          <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">AI шалгалт</p>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Мэргэжлийн ярилцлага</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Мэргэжлээ сонгоод асуулт бүрд хариулж, AI-аар дүгнүүл.</p>
        </div>

        {/* STAGE: start */}
        {stage === "start" && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Ачааллаж байна...</div>
            ) : majors.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl">
                <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="14" height="17" rx="2" stroke="#7c3aed" strokeWidth="1.5"/>
                    <path d="M7 9h7M7 12h7M7 15h5" stroke="#7c3aed" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="19" cy="18" r="4" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.2"/>
                    <path d="M17.5 18l1 1 2-2" stroke="#7c3aed" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm mb-1">Мэргэжил олдсонгүй</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Админ нээлттэй асуулт нэмсний дараа энд харагдана.</p>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm mb-5">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Тохиргоо</h2>
                  </div>
                  <div className="p-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Асуултын тоо</label>
                    <div className="flex gap-2">
                      {[3, 5, 7, 10].map(function (n) {
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
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Мэргэжлээ сонгоно уу — асуулт бүрд хариулж, AI дүгнэлт авна.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {majors.map(function (m) {
                    return (
                      <button key={m.id} onClick={function () { selectMajor(m); }} disabled={loading}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500 rounded-2xl p-6 text-left transition hover:shadow-md group disabled:opacity-50 disabled:cursor-not-allowed">
                        <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-200 dark:group-hover:bg-violet-800/50 transition">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="2" y="3" width="12" height="14" rx="2" stroke="#7c3aed" strokeWidth="1.4" fill="none"/>
                            <path d="M5 7h6M5 10h6M5 13h4" stroke="#7c3aed" strokeWidth="1.2" strokeLinecap="round"/>
                            <circle cx="16" cy="15" r="3" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.2"/>
                            <path d="M15 15l.7.7 1.3-1.3" stroke="#7c3aed" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">{m.name}</h3>
                        {m.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">{m.description}</p>}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800 px-2.5 py-1 rounded-lg font-semibold">
                            {m.question_count} асуулт
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition font-medium">
                            Эхлэх →
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* STAGE: answering */}
        {stage === "answering" && currentQuestion && (
          <>
            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5 text-xs text-gray-400 dark:text-gray-500">
                <span>Асуулт {currentIndex + 1} / {questions.length}</span>
                <span>Хариулсан: <span className="font-semibold text-violet-600">{answeredCount}</span> / {questions.length}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full h-1.5 transition-all duration-300" style={{ width: progress + "%" }} />
              </div>
            </div>

            {/* Question */}
            <div className="bg-white dark:bg-gray-800 border-2 border-violet-300 dark:border-violet-700 rounded-2xl mb-4">
              <div className="px-5 py-3 border-b border-violet-100 dark:border-violet-800 flex items-center gap-3">
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">{selectedMajor?.name}</span>
                {currentQuestion.difficulty && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    · {currentQuestion.difficulty === "easy" ? "Хялбар" : currentQuestion.difficulty === "hard" ? "Хүнд" : "Дундаж"}
                  </span>
                )}
              </div>
              <div className="p-5 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 leading-relaxed">{currentQuestion.question_mn}</h2>
              </div>
            </div>

            {/* Answer textarea */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl mb-4">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Таны хариулт</p>
                <span className="text-xs text-gray-400 dark:text-gray-500">{(answers[currentQuestion.id] || "").length} тэмдэгт</span>
              </div>
              <div className="p-4">
                <textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={function (e) { updateAnswer(currentQuestion.id, e.target.value); }}
                  placeholder="Хариултаа энд бичнэ үү. Дэлгэрэнгүй байх тусам AI дүгнэлт нарийн гарна..."
                  rows={7}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <button
                onClick={function () { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); }}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                ← Өмнөх
              </button>
              <div className="flex gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={function () { setCurrentIndex(currentIndex + 1); }}
                    className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full text-sm font-semibold hover:shadow-md transition">
                    Дараах →
                  </button>
                ) : (
                  <button onClick={submitForEvaluation}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">
                    AI дүгнүүлэх ✓
                  </button>
                )}
              </div>
            </div>

            {/* Question navigator */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 mb-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Асуулт сонгох</p>
              <div className="flex flex-wrap gap-2">
                {questions.map(function (q, i) {
                  var isAnswered = answers[q.id] && answers[q.id].trim();
                  var isCurrent = i === currentIndex;
                  return (
                    <button key={q.id} onClick={function () { setCurrentIndex(i); }}
                      className={"w-9 h-9 rounded-lg text-xs font-semibold transition " + (
                        isCurrent ? "bg-violet-600 text-white" :
                        isAnswered ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700" :
                        "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                      )}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-4 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-violet-600 rounded-sm" />Одоо</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 rounded-sm" />Хариулсан</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-sm" />Хоосон</span>
              </div>
            </div>

            {answeredCount > 0 && (
              <div className="flex justify-center">
                <button onClick={submitForEvaluation}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">
                  AI дүгнүүлэх ({answeredCount}/{questions.length} хариулт) ✓
                </button>
              </div>
            )}

            <div className="mt-4 flex justify-center">
              <button onClick={restart} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition">
                ← Мэргэжил сонгох хуудас руу буцах
              </button>
            </div>
          </>
        )}

        {/* STAGE: evaluating */}
        {stage === "evaluating" && (
          <div className="flex flex-col items-center justify-center py-28 gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-violet-100 dark:border-violet-900/40 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-violet-600 rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">AI дүгнэж байна...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Хариулт бүрийг нарийн шинжилж байна. Түр хүлээнэ үү.</p>
            </div>
          </div>
        )}

        {/* STAGE: result */}
        {stage === "result" && result && (
          <>
            {/* Overall score card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className={"h-1.5 " + (result.overall_score >= 70 ? "bg-emerald-500" : result.overall_score >= 50 ? "bg-amber-500" : "bg-red-500")} />
              <div className="p-8 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">{selectedMajor?.name} · Нийт оноо</p>
                <div className={"inline-flex items-end gap-1 text-6xl font-bold px-6 py-3 rounded-2xl mb-4 " +
                  (result.overall_score >= 70
                    ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                    : result.overall_score >= 50
                    ? "text-amber-700 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                    : "text-red-700 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800")}>
                  {result.overall_score}
                  <span className="text-2xl text-gray-400 dark:text-gray-500 font-normal mb-2">/100</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">{result.overall_advice}</p>
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

            {/* Per-question feedback */}
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Асуулт бүрийн дүгнэлт</h2>
            <div className="space-y-4">
              {result.results.map(function (r, i) {
                var scoreColor = r.score >= 7
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : r.score >= 5
                  ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                  : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
                return (
                  <div key={r.question_id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="w-7 h-7 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">{r.question_mn}</p>
                      </div>
                      <span className={"flex-shrink-0 text-sm font-bold px-3 py-1 rounded-xl border " + scoreColor}>
                        {r.score}/10
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      {r.user_answer && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-3">
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Таны хариулт</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{r.user_answer}</p>
                        </div>
                      )}
                      {r.strengths && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5">Зөв талууд</p>
                          <p className="text-sm text-emerald-900 dark:text-emerald-300 leading-relaxed">{r.strengths}</p>
                        </div>
                      )}
                      {r.missing && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                          <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1.5">Дутуу зүйлс</p>
                          <p className="text-sm text-red-900 dark:text-red-300 leading-relaxed">{r.missing}</p>
                        </div>
                      )}
                      {r.suggestion && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1.5">Зөвлөмж</p>
                          <p className="text-sm text-amber-900 dark:text-amber-300 leading-relaxed">{r.suggestion}</p>
                        </div>
                      )}
                      {r.open_ended_sample && (
                        <div>
                          <button
                            onClick={function () { toggleSample(r.question_id); }}
                            className="flex items-center gap-2 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-semibold transition py-1">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                              <rect x="1" y="1.5" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                              <path d="M3.5 5h5M3.5 7h4M3.5 9h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                              <rect x="5" y="0.5" width="7.5" height="9" rx="1.5" fill="white" stroke="currentColor" strokeWidth="1.2"/>
                              <path d="M7 3h3.5M7 5h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                            </svg>
                            Дэлгэрэнгүй жишээ хариулт харах
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                              className={"transition-transform " + (expandedSamples[r.question_id] ? "rotate-180" : "")}>
                              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          {expandedSamples[r.question_id] && (
                            <div className="mt-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
                              <p className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-2">Дэлгэрэнгүй жишээ хариулт</p>
                              <p className="text-sm text-violet-900 dark:text-violet-200 leading-relaxed whitespace-pre-wrap">{r.open_ended_sample}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
