import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function InterviewFlashcard() {
  var [questions, setQuestions] = useState([]);
  var [loading, setLoading] = useState(true);
  var [category, setCategory] = useState("all");
  var [search, setSearch] = useState("");
  var [currentIndex, setCurrentIndex] = useState(0);
  var [flipped, setFlipped] = useState(false);
  var [studied, setStudied] = useState(new Set());

  // Load studied set from localStorage
  useEffect(function () {
    var saved = localStorage.getItem("interview_studied");
    if (saved) {
      try {
        var arr = JSON.parse(saved);
        setStudied(new Set(arr));
      } catch (e) {}
    }
  }, []);

  // Fetch questions whenever filters change
  useEffect(function () {
    setLoading(true);
    var params = {};
    if (category !== "all") params.category = category;
    if (search.trim()) params.search = search.trim();

    API.get("/interview/questions", { params: params })
      .then(function (res) {
        setQuestions(res.data);
        setCurrentIndex(0);
        setFlipped(false);
      })
      .catch(function () { toast.error("Ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }, [category]);

  // Debounced search
  useEffect(function () {
    var timer = setTimeout(function () {
      setLoading(true);
      var params = {};
      if (category !== "all") params.category = category;
      if (search.trim()) params.search = search.trim();

      API.get("/interview/questions", { params: params })
        .then(function (res) {
          setQuestions(res.data);
          setCurrentIndex(0);
          setFlipped(false);
        })
        .catch(function () {})
        .finally(function () { setLoading(false); });
    }, 300);
    return function () { clearTimeout(timer); };
  }, [search]);

  // Keyboard shortcuts
  useEffect(function () {
    function handleKey(e) {
      if (questions.length === 0) return;
      // Don't intercept if user is typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped(function (f) { return !f; });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", handleKey);
    return function () { window.removeEventListener("keydown", handleKey); };
  });

  function markStudied(id) {
    var newSet = new Set(studied);
    newSet.add(id);
    setStudied(newSet);
    localStorage.setItem("interview_studied", JSON.stringify(Array.from(newSet)));
  }

  function goNext() {
    if (currentIndex < questions.length - 1) {
      var q = questions[currentIndex];
      if (q && flipped) markStudied(q.id);  // mark studied when moving past a flipped card
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  }

  function resetProgress() {
    if (!window.confirm("Судалсан картуудын түүхийг цэвэрлэх үү?")) return;
    setStudied(new Set());
    localStorage.removeItem("interview_studied");
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
    <div className="min-h-screen bg-slate-50">
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
        <div className="max-w-5xl mx-auto px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
            <span className="mx-2">/</span>
            <Link to="/interview" className="hover:text-slate-900">Ярилцлага</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">Flashcard</span>
          </div>
          <span className="text-slate-500">Судалсан: <span className="font-semibold text-[#1e3a8a]">{studiedCount}</span> / {questions.length}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-1">Судлах горим</p>
              <h1 className="text-2xl font-bold text-slate-900">Flashcard</h1>
              <p className="text-sm text-slate-600 mt-1">Карт дарж эсвэл Space/Enter товчоор эргүүлнэ үү.</p>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono">Space</kbd>
                Эргүүлэх
              </span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-mono">← →</kbd>
                Шилжих
              </span>
            </div>
          </div>
        </div>

        {/* Search + filter */}
        <div className="bg-white border border-slate-200 rounded p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Асуулт хайх..."
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition"
            />
            <div className="flex gap-1 flex-wrap">
              {categories.map(function (c) {
                return (
                  <button
                    key={c.key}
                    onClick={function () { setCategory(c.key); }}
                    className={"px-4 py-2 rounded text-sm font-medium transition whitespace-nowrap " + (category === c.key ? "bg-[#1e3a8a] text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")}
                  >
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
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Асуулт {currentIndex + 1} / {questions.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-[#1e3a8a] rounded-full h-1.5 transition-all duration-300"
                style={{ width: progress + "%" }}
              ></div>
            </div>
          </div>
        )}

        {/* Card area */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Ачааллаж байна...</div>
        ) : questions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded p-12 text-center text-sm text-slate-500">
            Асуулт олдсонгүй. Шүүлтүүрээ өөрчилж үзнэ үү.
          </div>
        ) : currentQuestion ? (
          <>
            {/* Flashcard */}
            <div className="mb-6" style={{ perspective: "1000px" }}>
              <div
                onClick={function () { setFlipped(!flipped); }}
                className="relative cursor-pointer transition-transform duration-500 preserve-3d"
                style={{
                  transformStyle: "preserve-3d",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  minHeight: "420px",
                }}
              >
                {/* Front face — question */}
                <div
                  className="absolute inset-0 w-full bg-white border-2 border-slate-200 rounded p-8 md:p-10 flex flex-col"
                  style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 px-2 py-0.5 rounded font-semibold">
                      {categoryLabels[currentQuestion.category] || currentQuestion.category}
                    </span>
                    {isStudied && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                        <span>✓</span> Судалсан
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Асуулт</p>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed max-w-2xl">
                      {currentQuestion.question_mn}
                    </h2>
                  </div>

                  <div className="text-center text-xs text-slate-400 mt-4 border-t border-slate-100 pt-4">
                    Карт дарж хариултыг харах
                  </div>
                </div>

                {/* Back face — answer + advice */}
                <div
                  className="absolute inset-0 w-full bg-white border-2 border-[#1e3a8a] rounded p-8 md:p-10 flex flex-col"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
                    <span className="text-xs bg-[#1e3a8a] text-white px-2 py-0.5 rounded font-semibold">
                      Хариулт
                    </span>
                    <span className="text-xs text-slate-500 line-clamp-1 max-w-[60%] text-right">
                      {currentQuestion.question_mn}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-5">
                    {currentQuestion.sample_answer && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Жишээ хариулт
                        </p>
                        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                          {currentQuestion.sample_answer}
                        </p>
                      </div>
                    )}

                    {currentQuestion.advice && (
                      <div className="bg-amber-50 border border-amber-200 rounded p-4">
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                          💡 Зөвлөмж
                        </p>
                        <p className="text-sm text-amber-900 leading-relaxed">
                          {currentQuestion.advice}
                        </p>
                      </div>
                    )}

                    {!currentQuestion.sample_answer && !currentQuestion.advice && (
                      <p className="text-sm text-slate-500 italic">Хариулт оруулаагүй байна.</p>
                    )}
                  </div>

                  <div className="text-center text-xs text-slate-400 mt-4 border-t border-slate-100 pt-4">
                    Карт дарж буцаж асуултыг харах
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 border border-slate-300 bg-white rounded text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Өмнөх
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={function () { setFlipped(!flipped); }}
                  className="px-5 py-2.5 border border-[#1e3a8a] text-[#1e3a8a] rounded text-sm font-semibold hover:bg-[#1e3a8a]/5 transition"
                >
                  {flipped ? "Асуулт" : "Хариулт"}
                </button>
              </div>

              <button
                onClick={goNext}
                disabled={currentIndex === questions.length - 1}
                className="px-5 py-2.5 bg-[#1e3a8a] text-white rounded text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Дараах →
              </button>
            </div>

            {/* Reset progress */}
            {studiedCount > 0 && (
              <div className="text-center mt-8">
                <button
                  onClick={resetProgress}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium"
                >
                  Судалсан түүхийг цэвэрлэх
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}