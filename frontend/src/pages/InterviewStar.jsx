import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

export default function InterviewStar() {
  var [questions, setQuestions] = useState([]);
  var [loading, setLoading] = useState(true);
  var [currentIndex, setCurrentIndex] = useState(0);
  var [star, setStar] = useState({ situation: "", task: "", action: "", result: "" });
  var [showSample, setShowSample] = useState(false);
  var [savedAnswers, setSavedAnswers] = useState({});

  useEffect(function () {
    API.get("/interview/behavioral")
      .then(function (res) { setQuestions(res.data); })
      .catch(function () { toast.error("Ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }, []);

  useEffect(function () {
    var saved = localStorage.getItem("star_answers");
    if (saved) {
      try { setSavedAnswers(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(function () {
    var q = questions[currentIndex];
    if (!q) return;
    var saved = savedAnswers[q.id];
    if (saved) {
      setStar(saved);
    } else {
      setStar({ situation: "", task: "", action: "", result: "" });
    }
    setShowSample(false);
  }, [currentIndex, questions]);

  function updStar(field, value) {
    setStar(function (p) { return { ...p, [field]: value }; });
  }

  function saveAnswer() {
    var q = questions[currentIndex];
    if (!q) return;
    var updated = { ...savedAnswers, [q.id]: star };
    setSavedAnswers(updated);
    localStorage.setItem("star_answers", JSON.stringify(updated));
    toast.success("Хадгалагдлаа");
  }

  function clearAnswer() {
    if (!window.confirm("Энэ хариултыг цэвэрлэх үү?")) return;
    var q = questions[currentIndex];
    var updated = { ...savedAnswers };
    delete updated[q.id];
    setSavedAnswers(updated);
    localStorage.setItem("star_answers", JSON.stringify(updated));
    setStar({ situation: "", task: "", action: "", result: "" });
    toast.success("Цэвэрлэгдлээ");
  }

  function goNext() {
    if (Object.values(star).some(function (v) { return v.trim(); })) saveAnswer();
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  }

  function goPrev() {
    if (Object.values(star).some(function (v) { return v.trim(); })) saveAnswer();
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  var currentQuestion = questions[currentIndex];
  var totalChars = star.situation.length + star.task.length + star.action.length + star.result.length;
  var filledParts = [star.situation, star.task, star.action, star.result].filter(function (s) { return s.trim(); }).length;
  var progress = currentQuestion ? Math.round((filledParts / 4) * 100) : 0;
  var answeredCount = Object.keys(savedAnswers).length;

  var starFields = [
    { key: "situation", letter: "S", name: "Situation (Нөхцөл байдал)", placeholder: "Ямар нөхцөлд байсан бэ? Хаана, хэзээ, ямар орчин байсан...", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { key: "task",      letter: "T", name: "Task (Үүрэг)",              placeholder: "Таны даалгавар, үүрэг, зорилт юу байсан бэ?...",               color: "bg-purple-50 border-purple-200 text-purple-700" },
    { key: "action",    letter: "A", name: "Action (Хийсэн үйлдэл)",    placeholder: "Та тодорхой юу хийсэн бэ? Яаж шийдсэн бэ?...",                color: "bg-amber-50 border-amber-200 text-amber-700" },
    { key: "result",    letter: "R", name: "Result (Үр дүн)",            placeholder: "Ямар үр дүн гарсан бэ? Тоон үзүүлэлт оруулж чадвал сайн...", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="p-5 md:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-400 text-sm">Ачааллаж байна...</div>
        </div>
      </Layout>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout>
        <div className="p-5 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-gray-500 text-sm">Зан үйлийн асуулт олдсонгүй.</p>
          <Link to="/interview" className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition">← Горимууд руу буцах</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-5 md:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
          <Link to="/interview" className="hover:text-violet-600 transition">Ярилцлага</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">STAR дадлага</span>
          <span className="ml-auto text-gray-400">Дуусгасан: <span className="font-semibold text-violet-600">{answeredCount}</span> / {questions.length}</span>
        </div>

        {/* Header */}
        <div className="mb-5">
          <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">Дадлага горим</p>
          <h1 className="text-xl font-bold text-gray-800">STAR арга</h1>
          <p className="text-sm text-gray-500 mt-1">Зан үйлийн асуултад 4 хэсэгт хариулж, мэргэжилтний жишээтэй харьцуулна уу.</p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
            <span>Асуулт {currentIndex + 1} / {questions.length}</span>
            <span>{progress}% бөглөсөн</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full h-1.5 transition-all duration-300" style={{ width: progress + "%" }} />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white border-2 border-violet-400 rounded-2xl mb-5">
          <div className="p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Асуулт</p>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-relaxed">{currentQuestion.question_mn}</h2>
          </div>
        </div>

        {/* STAR form */}
        <div className="space-y-4 mb-5">
          {starFields.map(function (field) {
            return (
              <div key={field.key} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className={"px-5 py-3 border-b border-gray-100 flex items-center gap-3 " + field.color}>
                  <div className="w-8 h-8 bg-white border-2 border-current rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {field.letter}
                  </div>
                  <p className="text-sm font-semibold flex-1">{field.name}</p>
                  <span className="text-xs opacity-75">{star[field.key].length} тэмдэгт</span>
                </div>
                <div className="p-4">
                  <textarea
                    value={star[field.key]}
                    onChange={function (e) { updStar(field.key, e.target.value); }}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition resize-vertical"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex gap-2 flex-wrap">
            <button onClick={saveAnswer}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition">
              Хадгалах
            </button>
            <button onClick={function () { setShowSample(!showSample); }}
              className="px-5 py-2.5 border border-amber-300 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-50 transition">
              {showSample ? "Жишээг нуух" : "💡 Мэргэжилтний жишээ харах"}
            </button>
            {totalChars > 0 && (
              <button onClick={clearAnswer}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Цэвэрлэх
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={goPrev} disabled={currentIndex === 0}
              className="px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              ← Өмнөх
            </button>
            <button onClick={goNext} disabled={currentIndex === questions.length - 1}
              className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition">
              Дараах →
            </button>
          </div>
        </div>

        {/* Expert sample */}
        {showSample && currentQuestion.sample_answer && (
          <div className="bg-white border-2 border-amber-300 rounded-2xl shadow-sm mb-5 overflow-hidden">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
              <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
                <span>💡</span>
                <span>Мэргэжилтний жишээ хариулт</span>
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">Өөрийн хариулттайгаа харьцуулж, сайжруулах боломжоо ол.</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{currentQuestion.sample_answer}</p>
              {currentQuestion.advice && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">Зөвлөмж</p>
                  <p className="text-sm text-amber-900 leading-relaxed">{currentQuestion.advice}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question selector grid */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Асуулт сонгох</p>
          <div className="flex flex-wrap gap-2">
            {questions.map(function (q, i) {
              var isAnswered = savedAnswers[q.id];
              var isCurrent = i === currentIndex;
              return (
                <button key={q.id} onClick={function () { setCurrentIndex(i); }} title={q.question_mn}
                  className={"w-9 h-9 rounded-lg text-xs font-semibold transition " + (
                    isCurrent ? "bg-violet-600 text-white" :
                    isAnswered ? "bg-emerald-100 text-emerald-700 border border-emerald-300" :
                    "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                  )}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-violet-600 rounded-sm" />Одоо</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded-sm" />Хадгалсан</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-sm" />Хоосон</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
