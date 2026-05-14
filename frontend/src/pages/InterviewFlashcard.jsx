import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { QuestionSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";

export default function InterviewFlashcard() {
  var { user, loading: authLoading } = useAuth();
  var [questions, setQuestions] = useState([]);
  var [loading, setLoading] = useState(true);
  var [category, setCategory] = useState("all");
  var [search, setSearch] = useState("");
  var [currentIndex, setCurrentIndex] = useState(0);
  var [flipped, setFlipped] = useState(false);
  var [studied, setStudied] = useState(new Set());

  useEffect(function () {
    if (authLoading) return;
    if (user) {
      API.get("/interview/progress")
        .then(function (res) { setStudied(new Set(res.data.studied_ids)); })
        .catch(function () {
          var saved = localStorage.getItem("interview_studied");
          if (saved) { setStudied(new Set(JSON.parse(saved))); }
        });
    } else {
      var saved = localStorage.getItem("interview_studied");
      if (saved) { setStudied(new Set(JSON.parse(saved))); }
    }
  }, [authLoading, user?.id]);

  useEffect(function () {
    setLoading(true);
    var params = {};
    if (category !== "all") params.category = category;
    if (search.trim()) params.search = search.trim();
    API.get("/interview/questions", { params: params })
      .then(function (res) {
        setQuestions(res.data.filter(function (q) { return q.category !== "case"; }));
        setCurrentIndex(0); setFlipped(false);
      })
      .catch(function () { toast.error("Ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }, [category]);

  useEffect(function () {
    var timer = setTimeout(function () {
      setLoading(true);
      var params = {};
      if (category !== "all") params.category = category;
      if (search.trim()) params.search = search.trim();
      API.get("/interview/questions", { params: params })
        .then(function (res) {
          setQuestions(res.data.filter(function (q) { return q.category !== "case"; }));
          setCurrentIndex(0); setFlipped(false);
        })
        .catch(function () { toast.error("Ачаалахад алдаа"); })
        .finally(function () { setLoading(false); });
    }, 350);
    return function () { clearTimeout(timer); };
  }, [search]);

  useEffect(function () {
    function handleKey(e) {
      if (questions.length === 0) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleFlip(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    }
    window.addEventListener("keydown", handleKey);
    return function () { window.removeEventListener("keydown", handleKey); };
  });

  function markStudied(id) {
    if (studied.has(id)) return;
    var newSet = new Set(studied);
    newSet.add(id);
    setStudied(newSet);
    if (user) {
      API.post("/interview/questions/" + id + "/viewed").catch(function () {});
    } else {
      localStorage.setItem("interview_studied", JSON.stringify(Array.from(newSet)));
    }
  }

  function handleFlip() {
    var next = !flipped;
    setFlipped(next);
    if (next && currentQuestion) markStudied(currentQuestion.id);
  }

  function goNext() {
    if (currentIndex < questions.length - 1) { setCurrentIndex(currentIndex + 1); setFlipped(false); }
  }

  function goPrev() {
    if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); setFlipped(false); }
  }

  function resetProgress() {
    if (!window.confirm("Судалсан картуудын түүхийг цэвэрлэх үү?")) return;
    setStudied(new Set());
    if (user) { API.delete("/interview/progress").catch(function () {}); }
    else { localStorage.removeItem("interview_studied"); }
    toast.success("Түүх цэвэрлэгдлээ");
  }

  var categories = [
    { key: "all", label: "Бүгд" },
    { key: "general", label: "Ерөнхий" },
    { key: "technical", label: "Техникийн" },
    { key: "behavioral", label: "Зан үйлийн" },
  ];
  var categoryLabels = { general: "Ерөнхий", technical: "Техникийн", behavioral: "Зан үйлийн" };

  var currentQuestion = questions[currentIndex];
  var studiedCount = studied.size;
  var progress = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;
  var isStudied = currentQuestion && studied.has(currentQuestion.id);

  return (
    <Layout>
      <div className="p-5 md:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-5">
          <Link to="/interview" className="hover:text-violet-600 transition">Ярилцлага</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 font-medium">Flashcard</span>
          <span className="ml-auto text-gray-400 dark:text-gray-500">Судалсан: <span className="font-semibold text-violet-600">{studiedCount}</span> / {questions.length}</span>
        </div>

        {/* Header */}
        <div className="mb-5">
          <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">Судлах горим</p>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Flashcard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Карт дарж эсвэл Space/Enter товчоор эргүүлнэ үү.</p>
        </div>

        {/* Search + filter */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-4 mb-5">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Асуулт хайх..."
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="flex gap-1 flex-wrap">
              {categories.map(function (c) {
                return (
                  <button key={c.key} onClick={function () { setCategory(c.key); }}
                    className={"px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap " +
                      (category === c.key ? "bg-violet-600 text-white" : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600")}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {questions.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
              <span>Асуулт {currentIndex + 1} / {questions.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full h-1.5 transition-all duration-300" style={{ width: progress + "%" }} />
            </div>
          </div>
        )}

        {loading ? (
          <QuestionSkeleton />
        ) : questions.length === 0 ? (
          <EmptyState illustration="interview" title="Асуулт олдсонгүй" description="Шүүлтүүрийг өөрчилж үзнэ үү." />
        ) : currentQuestion ? (
          <>
            <div className="mb-5" style={{ perspective: "1000px" }}>
              <div
                onClick={handleFlip}
                className="relative cursor-pointer transition-transform duration-500"
                style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "380px" }}
              >
                {/* Front */}
                <div className="absolute inset-0 w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-6 md:p-8 flex flex-col shadow-sm"
                  style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800 px-2 py-0.5 rounded-lg font-semibold">
                      {categoryLabels[currentQuestion.category] || currentQuestion.category}
                    </span>
                    {isStudied && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg font-medium flex items-center gap-1">
                        ✓ Судалсан
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Асуулт</p>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 leading-relaxed max-w-2xl">
                      {currentQuestion.question_mn}
                    </h2>
                  </div>
                  <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                    Карт дарж хариултыг харах
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 w-full bg-white dark:bg-gray-800 border-2 border-violet-400 rounded-2xl p-6 md:p-8 flex flex-col shadow-sm"
                  style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-lg font-semibold">Хариулт</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 max-w-[60%] text-right">{currentQuestion.question_mn}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4">
                    {currentQuestion.sample_answer && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Жишээ хариулт</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{currentQuestion.sample_answer}</p>
                      </div>
                    )}
                    {currentQuestion.advice && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">💡 Зөвлөмж</p>
                        <p className="text-sm text-amber-900 leading-relaxed">{currentQuestion.advice}</p>
                      </div>
                    )}
                    {!currentQuestion.sample_answer && !currentQuestion.advice && (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">Хариулт оруулаагүй байна.</p>
                    )}
                  </div>
                  <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                    Карт дарж буцаж асуултыг харах
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button onClick={goPrev} disabled={currentIndex === 0}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
                ← Өмнөх
              </button>
              <button onClick={handleFlip}
                className="px-5 py-2.5 border border-violet-400 text-violet-600 dark:text-violet-400 rounded-xl text-sm font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20 transition">
                {flipped ? "Асуулт" : "Хариулт"}
              </button>
              <button onClick={goNext} disabled={currentIndex === questions.length - 1}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition">
                Дараах →
              </button>
            </div>

            {studiedCount > 0 && (
              <div className="text-center mt-6">
                <button onClick={resetProgress} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
                  Судалсан түүхийг цэвэрлэх
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </Layout>
  );
}
