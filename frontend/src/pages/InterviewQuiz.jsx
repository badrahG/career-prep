import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function InterviewQuiz() {
  var [stage, setStage] = useState("start"); // "start" | "quiz" | "result"
  var [category, setCategory] = useState("all");
  var [limit, setLimit] = useState(10);
  var [questions, setQuestions] = useState([]);
  var [loading, setLoading] = useState(false);
  var [currentIndex, setCurrentIndex] = useState(0);
  var [answers, setAnswers] = useState({}); // { question_id: "a"|"b"|"c"|"d" }
  var [result, setResult] = useState(null);
  var [submitting, setSubmitting] = useState(false);

  function startQuiz() {
    setLoading(true);
    var params = { limit: limit };
    if (category !== "all") params.category = category;

    API.get("/interview/quiz/questions", { params: params })
      .then(function (res) {
        if (res.data.length === 0) {
          toast.error("Quiz асуулт олдсонгүй. Админ үүсгэхийг хүлээнэ үү.");
          setLoading(false);
          return;
        }
        setQuestions(res.data);
        setCurrentIndex(0);
        setAnswers({});
        setResult(null);
        setStage("quiz");
      })
      .catch(function () { toast.error("Ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }

  function selectAnswer(questionId, option) {
    setAnswers({ ...answers, [questionId]: option });
  }

  function goNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function goPrev() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  async function submitQuiz() {
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm("Бүх асуултад хариулаагүй байна. Илгээх үү?")) return;
    }
    setSubmitting(true);
    try {
      var payload = {
        answers: questions.map(function (q) {
          return {
            question_id: q.id,
            selected_option: answers[q.id] || "a", // default if not answered
          };
        }).filter(function (a) { return answers[a.question_id]; }),
      };
      var res = await API.post("/interview/quiz/submit", payload);
      setResult(res.data);
      setStage("result");
    } catch (err) {
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
  }

  var categoryLabels = { general: "Ерөнхий", technical: "Техникийн", behavioral: "Зан үйлийн", all: "Бүгд" };

  var currentQuestion = questions[currentIndex];
  var answeredCount = Object.keys(answers).length;
  var progress = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900">CareerPrep</span>
          </Link>
          <Link to="/interview" className="text-sm text-slate-600 hover:text-slate-900 font-medium">← Горимууд</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-3 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
          <span className="mx-2">/</span>
          <Link to="/interview" className="hover:text-slate-900">Ярилцлага</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">Quiz</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* STAGE: Start — choose category + count */}
        {stage === "start" && (
          <>
            <div className="mb-6 pb-6 border-b border-slate-200">
              <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-1">Шалгах горим</p>
              <h1 className="text-2xl font-bold text-slate-900">Quiz</h1>
              <p className="text-sm text-slate-600 mt-1">Олон сонголттой тестээр мэдлэгээ шалгаж дадлагажна.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded mb-6">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-900">Quiz-ийн тохиргоо</h2>
              </div>
              <div className="p-6 space-y-5">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Категори</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["all", "general", "technical", "behavioral"].map(function (c) {
                      return (
                        <button
                          key={c}
                          onClick={function () { setCategory(c); }}
                          className={"px-3 py-2 rounded text-sm font-medium transition " + (category === c ? "bg-[#1e3a8a] text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")}
                        >
                          {categoryLabels[c]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Асуултын тоо</label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20].map(function (n) {
                      return (
                        <button
                          key={n}
                          onClick={function () { setLimit(n); }}
                          className={"flex-1 px-3 py-2 rounded text-sm font-medium transition " + (limit === n ? "bg-[#1e3a8a] text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")}
                        >
                          {n} асуулт
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded p-4">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Quiz-ийн дүрэм:</p>
                  <ul className="text-xs text-slate-600 space-y-0.5">
                    <li>• Асуулт бүрд 4 хариултын нэгийг сонгоно</li>
                    <li>• Дуусах хүртэл хариултаа харахгүй</li>
                    <li>• Дуусахад оноо, зөв/буруу хариулт харагдана</li>
                  </ul>
                </div>

                <button
                  onClick={startQuiz}
                  disabled={loading}
                  className="w-full bg-[#1e3a8a] text-white py-3 rounded text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-50 transition"
                >
                  {loading ? "Ачаалж байна..." : "Quiz эхлүүлэх →"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* STAGE: Quiz in progress */}
        {stage === "quiz" && currentQuestion && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">Асуулт {currentIndex + 1} / {questions.length}</span>
                <span className="text-xs text-slate-500">Хариулсан: <span className="font-semibold text-[#1e3a8a]">{answeredCount}</span></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-[#1e3a8a] rounded-full h-1.5 transition-all duration-300" style={{ width: progress + "%" }}></div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded mb-6">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 px-2 py-0.5 rounded font-semibold">
                    {categoryLabels[currentQuestion.category] || currentQuestion.category}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed mb-6">
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
                      <button
                        key={opt.key}
                        onClick={function () { selectAnswer(currentQuestion.id, opt.key); }}
                        className={"w-full text-left px-4 py-3 rounded border-2 transition " + (selected ? "bg-[#1e3a8a]/5 border-[#1e3a8a]" : "bg-white border-slate-200 hover:border-slate-400")}
                      >
                        <div className="flex items-start gap-3">
                          <span className={"w-8 h-8 rounded flex items-center justify-center font-bold text-sm flex-shrink-0 " + (selected ? "bg-[#1e3a8a] text-white" : "bg-slate-100 text-slate-500")}>
                            {opt.key.toUpperCase()}
                          </span>
                          <span className="text-sm text-slate-800 leading-relaxed pt-1">{opt.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 border border-slate-300 bg-white rounded text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Өмнөх
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={submitQuiz}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {submitting ? "Илгээж байна..." : "Quiz дуусгах ✓"}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="px-6 py-2.5 bg-[#1e3a8a] text-white rounded text-sm font-semibold hover:bg-[#1e40af] transition"
                >
                  Дараах →
                </button>
              )}
            </div>

            {/* Question dots navigation */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {questions.map(function (q, i) {
                var isAnswered = answers[q.id];
                var isCurrent = i === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={function () { setCurrentIndex(i); }}
                    className={"w-8 h-8 rounded text-xs font-semibold transition " + (
                      isCurrent ? "bg-[#1e3a8a] text-white" :
                      isAnswered ? "bg-emerald-100 text-emerald-700 border border-emerald-300" :
                      "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                    )}
                  >
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
            <div className="bg-white border border-slate-200 rounded mb-6 overflow-hidden">
              <div className={"h-2 " + (result.percentage >= 70 ? "bg-emerald-500" : result.percentage >= 50 ? "bg-amber-500" : "bg-red-500")}></div>
              <div className="p-8 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Таны оноо</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-6xl font-bold text-slate-900">{result.correct}</span>
                  <span className="text-3xl text-slate-400 font-light">/ {result.total}</span>
                </div>
                <div className={"inline-block text-lg font-bold px-4 py-1.5 rounded " + (result.percentage >= 70 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : result.percentage >= 50 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-red-50 text-red-700 border border-red-200")}>
                  {result.percentage}%
                </div>
                <p className="text-sm text-slate-600 mt-5 max-w-lg mx-auto leading-relaxed">{result.advice}</p>

                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={restart}
                    className="px-5 py-2.5 bg-[#1e3a8a] text-white rounded text-sm font-semibold hover:bg-[#1e40af] transition"
                  >
                    Дахин хийх
                  </button>
                  <Link to="/interview" className="px-5 py-2.5 border border-slate-300 bg-white rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                    Горимууд
                  </Link>
                </div>
              </div>
            </div>

            {/* Detailed results */}
            <h2 className="text-base font-semibold text-slate-900 mb-4">Дэлгэрэнгүй үр дүн</h2>
            <div className="space-y-3">
              {result.results.map(function (r, i) {
                return (
                  <div key={r.question_id} className={"bg-white border rounded p-5 " + (r.is_correct ? "border-emerald-200" : "border-red-200")}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className={"w-7 h-7 rounded flex items-center justify-center font-bold text-xs flex-shrink-0 " + (r.is_correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                        {r.is_correct ? "✓" : "✗"}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">Асуулт {i + 1}: {r.question_mn}</p>
                      </div>
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
                        var cls = "bg-slate-50 border-slate-200 text-slate-600";
                        if (isCorrect) cls = "bg-emerald-50 border-emerald-300 text-emerald-900";
                        else if (isSelected && !isCorrect) cls = "bg-red-50 border-red-300 text-red-900";

                        return (
                          <div key={opt.key} className={"flex items-start gap-2 border rounded px-3 py-2 text-sm " + cls}>
                            <span className="font-bold text-xs uppercase flex-shrink-0 mt-0.5">{opt.key}</span>
                            <span className="flex-1">{opt.text}</span>
                            {isCorrect && <span className="text-xs font-semibold flex-shrink-0">✓ Зөв</span>}
                            {isSelected && !isCorrect && <span className="text-xs font-semibold flex-shrink-0">Таны сонголт</span>}
                          </div>
                        );
                      })}
                    </div>

                    {r.explanation && (
                      <div className="mt-3 ml-10 bg-amber-50 border border-amber-200 rounded p-3">
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">💡 Тайлбар</p>
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
    </div>
  );
}