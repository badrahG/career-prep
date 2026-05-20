import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { ListSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";

var ADMIN_TABS = [
  { to: "/admin/dashboard",   label: "Самбар" },
  { to: "/admin/users",       label: "Хэрэглэгчид" },
  { to: "/admin/interview",   label: "Ярилцлага" },
  { to: "/admin/advice",      label: "Зөвлөмж" },
  { to: "/admin/scholarship", label: "Тэтгэлэг" },
  { to: "/admin/feedback",    label: "CV Үнэлгээ" },
];

export default function AdminInterview() {
  var location = useLocation();
  var [activeTab, setActiveTab] = useState("questions");

  var [questions, setQuestions] = useState([]);
  var [qLoading, setQLoading] = useState(true);
  var [search, setSearch] = useState("");
  var [categoryFilter, setCategoryFilter] = useState("all");
  var [typeFilter, setTypeFilter] = useState("all");
  var [showQModal, setShowQModal] = useState(false);
  var [editingQId, setEditingQId] = useState(null);
  var [qForm, setQForm] = useState(emptyQForm());

  var [cases, setCases] = useState([]);
  var [cLoading, setCLoading] = useState(false);
  var [showCModal, setShowCModal] = useState(false);
  var [editingCId, setEditingCId] = useState(null);
  var [cForm, setCForm] = useState(emptyCForm());

  var [majors, setMajors] = useState([]);
  var [mLoading, setMLoading] = useState(false);
  var [showMModal, setShowMModal] = useState(false);
  var [editingMId, setEditingMId] = useState(null);
  var [mForm, setMForm] = useState(emptyMForm());

  function emptyQForm() {
    return {
      question_mn: "",
      category: "general",
      sample_answer: "",
      advice: "",
      difficulty: "medium",
      tags: "",
      case_id: null,
      major_id: null,
      is_quiz: false,
      is_open_ended: false,
      open_ended_sample: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "a",
      explanation: "",
    };
  }

  function emptyCForm() {
    return { title: "", case_text: "", difficulty: "medium" };
  }

  function emptyMForm() {
    return { name: "", description: "", is_active: true };
  }

  function loadQuestions() {
    setQLoading(true);
    var params = {};
    if (categoryFilter !== "all") params.category = categoryFilter;
    if (search) params.search = search;

    API.get("/interview/questions", { params: params })
      .then(function (res) {
        var data = res.data;
        if (typeFilter === "flashcard") data = data.filter(function (q) { return !q.is_quiz && !q.is_open_ended; });
        else if (typeFilter === "quiz") data = data.filter(function (q) { return q.is_quiz; });
        else if (typeFilter === "open_ended") data = data.filter(function (q) { return q.is_open_ended; });
        setQuestions(data);
      })
      .catch(function () { toast.error("Ачаалахад алдаа"); })
      .finally(function () { setQLoading(false); });
  }

  useEffect(function () {
    var timer = setTimeout(loadQuestions, 300);
    return function () { clearTimeout(timer); };
  }, [search, categoryFilter, typeFilter]);

  function loadCases() {
    setCLoading(true);
    API.get("/interview/cases")
      .then(function (res) { setCases(res.data); })
      .catch(function () { toast.error("Кейс ачаалахад алдаа"); })
      .finally(function () { setCLoading(false); });
  }

  useEffect(function () {
    loadCases();
    loadMajors();
  }, []);

  function loadMajors() {
    setMLoading(true);
    API.get("/interview/majors", { params: { active_only: false } })
      .then(function (res) { setMajors(res.data); })
      .catch(function () { toast.error("Мэргэжил ачаалахад алдаа"); })
      .finally(function () { setMLoading(false); });
  }

  function openCreateQ() {
    setEditingQId(null);
    setQForm(emptyQForm());
    setShowQModal(true);
  }

  function openEditQ(q) {
    setEditingQId(q.id);
    setQForm({
      question_mn: q.question_mn || "",
      category: q.category || "general",
      sample_answer: q.sample_answer || "",
      advice: q.advice || "",
      difficulty: q.difficulty || "medium",
      tags: q.tags || "",
      case_id: q.case_id || null,
      major_id: q.major_id || null,
      is_quiz: q.is_quiz || false,
      is_open_ended: q.is_open_ended || false,
      open_ended_sample: q.open_ended_sample || "",
      option_a: q.option_a || "",
      option_b: q.option_b || "",
      option_c: q.option_c || "",
      option_d: q.option_d || "",
      correct_option: q.correct_option || "a",
      explanation: q.explanation || "",
    });
    setShowQModal(true);
  }

  function updQ(field, value) {
    setQForm(function (p) { return { ...p, [field]: value }; });
  }

  async function handleSaveQ() {
    if (!qForm.question_mn.trim()) { toast.error("Асуулт заавал бичих ёстой"); return; }
    if (qForm.category === "case" && !qForm.case_id) {
      toast.error("Кейс асуулт үүсгэхдээ кейс сонгоно уу"); return;
    }
    if (qForm.is_open_ended && !qForm.major_id) {
      toast.error("Нээлттэй асуултад мэргэжил заавал шаардлагатай"); return;
    }
    if (qForm.is_quiz) {
      if (!qForm.option_a || !qForm.option_b || !qForm.option_c || !qForm.option_d) {
        toast.error("Quiz-д 4 сонголт заавал шаардлагатай"); return;
      }
      if (!qForm.correct_option) { toast.error("Зөв хариулт сонгоно уу"); return; }
    }
    try {
      var payload = { ...qForm };
      if (editingQId) {
        await API.put("/interview/questions/" + editingQId, payload);
        toast.success("Шинэчлэгдлээ");
      } else {
        await API.post("/interview/questions", payload);
        toast.success("Нэмэгдлээ");
      }
      setShowQModal(false);
      setEditingQId(null);
      loadQuestions();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа гарлаа");
    }
  }

  async function handleDeleteQ(q) {
    if (!window.confirm('"' + q.question_mn.substring(0, 50) + '..." асуултыг устгах уу?')) return;
    try {
      await API.delete("/interview/questions/" + q.id);
      toast.success("Устгагдлаа");
      setQuestions(questions.filter(function (x) { return x.id !== q.id; }));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа");
    }
  }

  function openCreateC() {
    setEditingCId(null);
    setCForm(emptyCForm());
    setShowCModal(true);
  }

  function openEditC(c) {
    setEditingCId(c.id);
    setCForm({ title: c.title || "", case_text: c.case_text || "", difficulty: c.difficulty || "medium" });
    setShowCModal(true);
  }

  function updC(field, value) {
    setCForm(function (p) { return { ...p, [field]: value }; });
  }

  async function handleSaveC() {
    if (!cForm.title.trim()) { toast.error("Гарчиг заавал бичих ёстой"); return; }
    if (!cForm.case_text.trim()) { toast.error("Кейсийн текст заавал бичих ёстой"); return; }
    try {
      if (editingCId) {
        await API.put("/interview/cases/" + editingCId, cForm);
        toast.success("Кейс шинэчлэгдлээ");
      } else {
        await API.post("/interview/cases", cForm);
        toast.success("Кейс нэмэгдлээ");
      }
      setShowCModal(false);
      setEditingCId(null);
      loadCases();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа гарлаа");
    }
  }

  async function handleDeleteC(c) {
    if (!window.confirm('"' + c.title + '" кейсийг устгах уу? Холбоотой асуултуудын кейс холбоос арилна.')) return;
    try {
      await API.delete("/interview/cases/" + c.id);
      toast.success("Устгагдлаа");
      setCases(cases.filter(function (x) { return x.id !== c.id; }));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа");
    }
  }

  function openCreateM() { setEditingMId(null); setMForm(emptyMForm()); setShowMModal(true); }
  function openEditM(m) {
    setEditingMId(m.id);
    setMForm({ name: m.name || "", description: m.description || "", is_active: m.is_active !== false });
    setShowMModal(true);
  }
  function updM(field, value) { setMForm(function (p) { return { ...p, [field]: value }; }); }

  async function handleSaveM() {
    if (!mForm.name.trim()) { toast.error("Мэргэжлийн нэр заавал бичих ёстой"); return; }
    try {
      if (editingMId) {
        await API.put("/interview/majors/" + editingMId, mForm);
        toast.success("Шинэчлэгдлээ");
      } else {
        await API.post("/interview/majors", mForm);
        toast.success("Нэмэгдлээ");
      }
      setShowMModal(false);
      setEditingMId(null);
      loadMajors();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа гарлаа");
    }
  }

  async function handleDeleteM(m) {
    if (!window.confirm('"' + m.name + '" мэргэжлийг устгах уу?')) return;
    try {
      await API.delete("/interview/majors/" + m.id);
      toast.success("Устгагдлаа");
      setMajors(majors.filter(function (x) { return x.id !== m.id; }));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа");
    }
  }

  var categoryLabels = { general: "Ерөнхий", technical: "Техникийн", behavioral: "Зан үйлийн", case: "Кейс асуулт" };
  var difficultyLabels = { easy: "Хялбар", medium: "Дундаж", hard: "Хүнд" };
  var inputCls = "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100";
  var labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide";

  return (
    <Layout>
      <div className="p-5 md:p-6 space-y-6">

        {/* Admin tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mx-5 px-5 md:-mx-6 md:px-6 mb-2">
          {ADMIN_TABS.map(function (tab) {
            var active = location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
            return (
              <Link key={tab.to} to={tab.to}
                className={"px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition " +
                  (active ? "border-violet-600 text-violet-700" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200")}>
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ярилцлагын удирдлага</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Flashcard, Quiz асуулт болон Кейс удирдана.</p>
          </div>
          <button
            onClick={activeTab === "questions" ? openCreateQ : activeTab === "cases" ? openCreateC : openCreateM}
            className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition flex-shrink-0">
            {activeTab === "questions" ? "+ Асуулт" : activeTab === "cases" ? "+ Кейс" : "+ Мэргэжил"}
          </button>
        </div>

        {/* Inner tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: "questions", label: "Асуултууд" },
            { key: "cases", label: "Кейсүүд" },
            { key: "majors", label: "Мэргэжлүүд" },
          ].map(function (t) {
            return (
              <button key={t.key} onClick={function () { setActiveTab(t.key); }}
                className={"px-5 py-2 text-sm font-medium border-b-2 -mb-px transition " +
                  (activeTab === t.key ? "border-violet-600 text-violet-700 dark:text-violet-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200")}>
                {t.label}
                {t.key === "cases" && cases.length > 0 && (
                  <span className="ml-1.5 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full">{cases.length}</span>
                )}
                {t.key === "majors" && majors.length > 0 && (
                  <span className="ml-1.5 text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">{majors.length}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* QUESTIONS TAB */}
        {activeTab === "questions" && (
          <>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input value={search} onChange={function (e) { setSearch(e.target.value); }}
                  placeholder="Асуулт хайх..." className={"flex-1 " + inputCls} />
                <select value={categoryFilter} onChange={function (e) { setCategoryFilter(e.target.value); }} className={inputCls + " md:w-48"}>
                  <option value="all">Бүх категори</option>
                  <option value="general">Ерөнхий</option>
                  <option value="technical">Техникийн</option>
                  <option value="behavioral">Зан үйлийн</option>
                  <option value="case">Кейс асуулт</option>
                </select>
                <select value={typeFilter} onChange={function (e) { setTypeFilter(e.target.value); }} className={inputCls + " md:w-44"}>
                  <option value="all">Бүх төрөл</option>
                  <option value="flashcard">Flashcard</option>
                  <option value="quiz">Quiz</option>
                  <option value="open_ended">Нээлттэй (AI)</option>
                </select>
              </div>
            </div>

            {qLoading ? (
              <ListSkeleton count={8} />
            ) : questions.length === 0 ? (
              <EmptyState illustration="interview" title="Асуулт олдсонгүй" description="Шинэ асуулт нэмэхийн тулд дээрх товч дарна уу." />
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {questions.map(function (q) {
                    var caseInfo = q.case_id ? cases.find(function (c) { return c.id === q.case_id; }) : null;
                    return (
                      <div key={q.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={"text-xs border px-2 py-0.5 rounded-full font-semibold " +
                                (q.category === "case"
                                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700"
                                  : "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700")}>
                                {categoryLabels[q.category] || q.category}
                              </span>
                              {q.is_quiz && (
                                <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-700 px-2 py-0.5 rounded-full font-medium">Quiz</span>
                              )}
                              {q.is_open_ended && (
                                <span className="text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-700 px-2 py-0.5 rounded-full font-medium">AI шалгалт</span>
                              )}
                              {q.difficulty && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">{difficultyLabels[q.difficulty] || q.difficulty}</span>
                              )}
                              {q.tags && <span className="text-xs text-gray-400 dark:text-gray-500 italic">#{q.tags}</span>}
                            </div>

                            {(q.major_name || caseInfo) && (
                              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                {caseInfo && (
                                  <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-700 px-2 py-0.5 rounded-lg font-medium">
                                    Кейс: {caseInfo.title}
                                  </span>
                                )}
                                {q.major_name && (
                                  <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-700 px-2 py-0.5 rounded-lg font-medium">
                                    {q.major_name}
                                  </span>
                                )}
                              </div>
                            )}

                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5">{q.question_mn}</p>

                            {q.is_quiz ? (
                              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 mt-2">
                                <p>A. {q.option_a}</p>
                                <p>B. {q.option_b}</p>
                                <p>C. {q.option_c}</p>
                                <p>D. {q.option_d}</p>
                                <p className="text-emerald-700 dark:text-emerald-400 font-semibold mt-1">Зөв: {(q.correct_option || "").toUpperCase()}</p>
                              </div>
                            ) : (
                              q.sample_answer && <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{q.sample_answer}</p>
                            )}
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={function () { openEditQ(q); }}
                              className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition">
                              Засах
                            </button>
                            <button onClick={function () { handleDeleteQ(q); }}
                              className="text-xs px-3 py-1.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition">
                              Устгах
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500">Нийт {questions.length} асуулт харагдаж байна.</p>
          </>
        )}

        {/* CASES TAB */}
        {activeTab === "cases" && (
          <>
            {cLoading ? (
              <ListSkeleton count={4} />
            ) : cases.length === 0 ? (
              <EmptyState illustration="interview" title="Кейс олдсонгүй" description='Кейс бол нэг нөхцөл байдлаас олон асуулт гарах үед ашигладаг. "+ Кейс" товчоор нэмнэ үү.' />
            ) : (
              <div className="space-y-3">
                {cases.map(function (c) {
                  return (
                    <div key={c.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-200 dark:hover:border-blue-600 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 px-2 py-0.5 rounded-full font-semibold">Кейс</span>
                            {c.difficulty && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">{difficultyLabels[c.difficulty] || c.difficulty}</span>
                            )}
                            <span className="text-xs text-gray-400 dark:text-gray-500">{c.question_count} асуулт</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">{c.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{c.case_text}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={function () { openEditC(c); }}
                            className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition">
                            Засах
                          </button>
                          <button onClick={function () { handleDeleteC(c); }}
                            className="text-xs px-3 py-1.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition">
                            Устгах
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500">Нийт {cases.length} кейс байна.</p>
          </>
        )}

        {/* MAJORS TAB */}
        {activeTab === "majors" && (
          <>
            {mLoading ? (
              <ListSkeleton count={4} />
            ) : majors.length === 0 ? (
              <EmptyState illustration="interview" title="Мэргэжил олдсонгүй" description='Техникийн болон кейс асуултыг мэргэжилээр ангилахын тулд "+ Мэргэжил" товчоор нэмнэ үү.' />
            ) : (
              <div className="space-y-3">
                {majors.map(function (m) {
                  return (
                    <div key={m.id} className={"bg-white dark:bg-gray-800 border rounded-xl p-5 transition " +
                      (m.is_active ? "border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700" : "border-gray-200 dark:border-gray-700 opacity-60")}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{m.name}</p>
                            <span className={"text-xs px-2 py-0.5 rounded-full font-medium border " +
                              (m.is_active
                                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600")}>
                              {m.is_active ? "Идэвхтэй" : "Идэвхгүй"}
                            </span>
                          </div>
                          {m.description && <p className="text-xs text-gray-500 dark:text-gray-400">{m.description}</p>}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={function () { openEditM(m); }}
                            className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition">
                            Засах
                          </button>
                          <button onClick={function () { handleDeleteM(m); }}
                            className="text-xs px-3 py-1.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition">
                            Устгах
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500">Нийт {majors.length} мэргэжил байна.</p>
          </>
        )}
      </div>

      {/* Question Modal */}
      {showQModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editingQId ? "Асуулт засах" : "Шинэ асуулт нэмэх"}
              </h3>
              <button onClick={function () { setShowQModal(false); setEditingQId(null); }} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className={labelCls}>Асуулт <span className="text-red-500">*</span></label>
                <textarea value={qForm.question_mn} onChange={function (e) { updQ("question_mn", e.target.value); }}
                  rows={2} placeholder="Ярилцлагад асуух асуулт..." className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Категори <span className="text-red-500">*</span></label>
                  <select value={qForm.category} onChange={function (e) { updQ("category", e.target.value); }} className={inputCls}>
                    <option value="general">Ерөнхий</option>
                    <option value="technical">Техникийн</option>
                    <option value="behavioral">Зан үйлийн</option>
                    <option value="case">Кейс асуулт</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Хүндрэл</label>
                  <select value={qForm.difficulty} onChange={function (e) { updQ("difficulty", e.target.value); }} className={inputCls}>
                    <option value="easy">Хялбар</option>
                    <option value="medium">Дундаж</option>
                    <option value="hard">Хүнд</option>
                  </select>
                </div>
              </div>

              {qForm.category === "case" && (
                <div className="border-l-4 border-blue-500 pl-4 bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-r-lg">
                  <label className={labelCls}>Кейс сонгох <span className="text-red-500">*</span></label>
                  {cases.length === 0 ? (
                    <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
                      Кейс байхгүй байна. Эхлээд "Кейсүүд" tab-д кейс үүсгэнэ үү.
                    </div>
                  ) : (
                    <select
                      value={qForm.case_id || ""}
                      onChange={function (e) { updQ("case_id", e.target.value ? parseInt(e.target.value) : null); }}
                      className={inputCls}>
                      <option value="">— Кейс сонгоно уу —</option>
                      {cases.map(function (c) {
                        return (
                          <option key={c.id} value={c.id}>{c.title} ({c.question_count} асуулт)</option>
                        );
                      })}
                    </select>
                  )}
                </div>
              )}

              {(
                <div className="border-l-4 border-emerald-500 pl-4 bg-emerald-50/30 dark:bg-emerald-900/10 p-4 rounded-r-lg">
                  <label className={labelCls}>Мэргэжил <span className="text-red-500">*</span></label>
                  {majors.filter(function (m) { return m.is_active; }).length === 0 ? (
                    <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
                      Мэргэжил байхгүй байна. Эхлээд "Мэргэжлүүд" tab-д мэргэжил үүсгэнэ үү.
                    </div>
                  ) : (
                    <select
                      value={qForm.major_id || ""}
                      onChange={function (e) { updQ("major_id", e.target.value ? parseInt(e.target.value) : null); }}
                      className={inputCls}>
                      <option value="">— Мэргэжил сонгоно уу —</option>
                      {majors.filter(function (m) { return m.is_active; }).map(function (m) {
                        return <option key={m.id} value={m.id}>{m.name}</option>;
                      })}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className={labelCls}>Tags (таслалаар тусгаарлана)</label>
                <input value={qForm.tags} onChange={function (e) { updQ("tags", e.target.value); }}
                  placeholder="javascript, react, frontend" className={inputCls} />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={qForm.is_quiz}
                    onChange={function (e) { updQ("is_quiz", e.target.checked); if (e.target.checked) updQ("is_open_ended", false); }}
                    className="w-4 h-4 accent-violet-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Quiz асуулт болгох</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Идэвхтэй бол 4 сонголт + зөв хариулт бөглөнө үү.</p>
                  </div>
                </label>
              </div>

              <div className="bg-teal-50/50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={qForm.is_open_ended}
                    onChange={function (e) { updQ("is_open_ended", e.target.checked); if (e.target.checked) updQ("is_quiz", false); }}
                    className="w-4 h-4 accent-teal-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI шалгалтын нээлттэй асуулт болгох</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Хэрэглэгч гараар хариулж, AI дүгнэнэ. Мэргэжил заавал шаардлагатай.</p>
                  </div>
                </label>
              </div>

              {qForm.is_quiz && (
                <div className="border-l-4 border-violet-500 pl-4 space-y-3 bg-violet-50/30 dark:bg-violet-900/10 p-4 rounded-r-lg">
                  {["a", "b", "c", "d"].map(function (letter) {
                    var key = "option_" + letter;
                    var isCorrect = qForm.correct_option === letter;
                    return (
                      <div key={letter}>
                        <label className={labelCls + " flex items-center justify-between"}>
                          <span>Сонголт {letter.toUpperCase()} <span className="text-red-500">*</span></span>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="correct" checked={isCorrect}
                              onChange={function () { updQ("correct_option", letter); }}
                              className="w-3 h-3 accent-emerald-600" />
                            <span className={"text-xs " + (isCorrect ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-gray-500 dark:text-gray-400")}>
                              {isCorrect ? "✓ Зөв хариулт" : "Зөв болгох"}
                            </span>
                          </label>
                        </label>
                        <input value={qForm[key]} onChange={function (e) { updQ(key, e.target.value); }}
                          placeholder={"Сонголт " + letter.toUpperCase()}
                          className={inputCls + (isCorrect ? " border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20" : "")} />
                      </div>
                    );
                  })}
                  <div>
                    <label className={labelCls}>Тайлбар (яагаад энэ хариулт зөв вэ)</label>
                    <textarea value={qForm.explanation} onChange={function (e) { updQ("explanation", e.target.value); }}
                      rows={2} placeholder="Зөв хариулт яагаад зөв бэ?..." className={inputCls} />
                  </div>
                </div>
              )}

              <div>
                <label className={labelCls}>Жишээ хариулт <span className="text-gray-400 dark:text-gray-500 font-normal">(Flashcard горимд харагдана)</span></label>
                <textarea value={qForm.sample_answer} onChange={function (e) { updQ("sample_answer", e.target.value); }}
                  rows={4} placeholder="Flashcard горимын жишээ хариулт..." className={inputCls} />
              </div>

              {qForm.is_open_ended && (
                <div className="border-l-4 border-teal-500 pl-4 bg-teal-50/30 dark:bg-teal-900/10 p-4 rounded-r-lg">
                  <label className={labelCls}>AI горимын жишээ хариулт <span className="text-teal-600 dark:text-teal-400 font-normal normal-case">(Мэргэжлийн дадлага горимд харагдана)</span></label>
                  <textarea value={qForm.open_ended_sample} onChange={function (e) { updQ("open_ended_sample", e.target.value); }}
                    rows={5} placeholder="Мэргэжлийн дадлага горимын дэлгэрэнгүй жишээ хариулт. Хэрэглэгч AI дүгнэлтийн хажууд харна..." className={inputCls} />
                  <p className="text-xs text-teal-700 dark:text-teal-400 mt-1.5">AI-д жишиг болгон дамжуулах тул дэлгэрэнгүй бичих нь дүгнэлтийн чанарыг нэмэгдүүлнэ.</p>
                </div>
              )}

              <div>
                <label className={labelCls}>Зөвлөмж</label>
                <textarea value={qForm.advice} onChange={function (e) { updQ("advice", e.target.value); }}
                  rows={2} placeholder="Хариулахад анхаарах зүйлс..." className={inputCls} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
              <button onClick={function () { setShowQModal(false); setEditingQId(null); }}
                className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition">
                Цуцлах
              </button>
              <button onClick={handleSaveQ}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition">
                {editingQId ? "Шинэчлэх" : "Үүсгэх"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Modal */}
      {showCModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full my-8 flex flex-col border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editingCId ? "Кейс засах" : "Шинэ кейс нэмэх"}
              </h3>
              <button onClick={function () { setShowCModal(false); setEditingCId(null); }} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Гарчиг <span className="text-red-500">*</span></label>
                <input value={cForm.title} onChange={function (e) { updC("title", e.target.value); }}
                  placeholder="Жишээ: Багийн зөрчлийн нөхцөл байдал" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Кейсийн текст <span className="text-red-500">*</span></label>
                <textarea value={cForm.case_text} onChange={function (e) { updC("case_text", e.target.value); }}
                  rows={6}
                  placeholder="Хэрэглэгч уншиж, асуултад хариулах нөхцөл байдлыг дэлгэрэнгүй бичнэ үү..."
                  className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Хүндрэл</label>
                <select value={cForm.difficulty} onChange={function (e) { updC("difficulty", e.target.value); }} className={inputCls}>
                  <option value="easy">Хялбар</option>
                  <option value="medium">Дундаж</option>
                  <option value="hard">Хүнд</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
              <button onClick={function () { setShowCModal(false); setEditingCId(null); }}
                className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition">
                Цуцлах
              </button>
              <button onClick={handleSaveC}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                {editingCId ? "Шинэчлэх" : "Кейс үүсгэх"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Major Modal */}
      {showMModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full flex flex-col border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editingMId ? "Мэргэжил засах" : "Шинэ мэргэжил нэмэх"}
              </h3>
              <button onClick={function () { setShowMModal(false); setEditingMId(null); }} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Мэргэжлийн нэр <span className="text-red-500">*</span></label>
                <input value={mForm.name} onChange={function (e) { updM("name", e.target.value); }}
                  placeholder="Жишээ: Мэдээллийн технологи" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Тайлбар</label>
                <textarea value={mForm.description} onChange={function (e) { updM("description", e.target.value); }}
                  rows={2} placeholder="Мэргэжлийн товч тайлбар..." className={inputCls} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="m-active" checked={mForm.is_active}
                  onChange={function (e) { updM("is_active", e.target.checked); }}
                  className="w-4 h-4 accent-violet-600" />
                <label htmlFor="m-active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Идэвхтэй (хэрэглэгчид харагдана)</label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
              <button onClick={function () { setShowMModal(false); setEditingMId(null); }}
                className="px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition">
                Цуцлах
              </button>
              <button onClick={handleSaveM}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
                {editingMId ? "Шинэчлэх" : "Нэмэх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
