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
];

export default function AdminInterview() {
  var location = useLocation();
  var [questions, setQuestions] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState("");
  var [categoryFilter, setCategoryFilter] = useState("all");
  var [typeFilter, setTypeFilter] = useState("all");

  var [showModal, setShowModal] = useState(false);
  var [editingId, setEditingId] = useState(null);
  var [form, setForm] = useState(emptyForm());

  function emptyForm() {
    return {
      question_mn: "",
      category: "general",
      sample_answer: "",
      advice: "",
      difficulty: "medium",
      tags: "",
      is_quiz: false,
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "a",
      explanation: "",
    };
  }

  function loadQuestions() {
    setLoading(true);
    var params = {};
    if (categoryFilter !== "all") params.category = categoryFilter;
    if (search) params.search = search;

    API.get("/interview/questions", { params: params })
      .then(function (res) {
        var data = res.data;
        if (typeFilter === "flashcard") data = data.filter(function (q) { return !q.is_quiz; });
        else if (typeFilter === "quiz") data = data.filter(function (q) { return q.is_quiz; });
        setQuestions(data);
      })
      .catch(function () { toast.error("Ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }

  useEffect(function () {
    var timer = setTimeout(loadQuestions, 300);
    return function () { clearTimeout(timer); };
  }, [search, categoryFilter, typeFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowModal(true);
  }

  function openEdit(q) {
    setEditingId(q.id);
    setForm({
      question_mn: q.question_mn || "",
      category: q.category || "general",
      sample_answer: q.sample_answer || "",
      advice: q.advice || "",
      difficulty: q.difficulty || "medium",
      tags: q.tags || "",
      is_quiz: q.is_quiz || false,
      option_a: q.option_a || "",
      option_b: q.option_b || "",
      option_c: q.option_c || "",
      option_d: q.option_d || "",
      correct_option: q.correct_option || "a",
      explanation: q.explanation || "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
  }

  function upd(field, value) {
    setForm(function (p) { return { ...p, [field]: value }; });
  }

  async function handleSave() {
    if (!form.question_mn.trim()) { toast.error("Асуулт заавал бичих ёстой"); return; }
    if (form.is_quiz) {
      if (!form.option_a || !form.option_b || !form.option_c || !form.option_d) {
        toast.error("Quiz-д 4 сонголт заавал шаардлагатай");
        return;
      }
      if (!form.correct_option) { toast.error("Зөв хариулт сонгоно уу"); return; }
    }

    try {
      var payload = { ...form };
      if (editingId) {
        await API.put("/interview/questions/" + editingId, payload);
        toast.success("Шинэчлэгдлээ");
      } else {
        await API.post("/interview/questions", payload);
        toast.success("Нэмэгдлээ");
      }
      closeModal();
      loadQuestions();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа гарлаа");
    }
  }

  async function handleDelete(q) {
    if (!window.confirm('"' + q.question_mn.substring(0, 50) + '..." асуултыг устгах уу?')) return;
    try {
      await API.delete("/interview/questions/" + q.id);
      toast.success("Устгагдлаа");
      setQuestions(questions.filter(function (x) { return x.id !== q.id; }));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа");
    }
  }

  var categoryLabels = { general: "Ерөнхий", technical: "Техникийн", behavioral: "Зан үйлийн" };
  var difficultyLabels = { easy: "Хялбар", medium: "Дундаж", hard: "Хүнд" };

  var inputCls = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition";
  var labelCls = "block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide";

  return (
    <Layout>
      <div className="p-5 md:p-6 space-y-6">

        {/* Admin tabs */}
        <div className="flex gap-1 border-b border-gray-200 -mx-5 px-5 md:-mx-6 md:px-6 mb-2">
          {ADMIN_TABS.map(function (tab) {
            var active = location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
            return (
              <Link key={tab.to} to={tab.to}
                className={"px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition " +
                  (active ? "border-violet-600 text-violet-700" : "border-transparent text-gray-500 hover:text-gray-800")}>
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ярилцлагын асуултын удирдлага</h1>
            <p className="text-sm text-gray-500 mt-0.5">Flashcard асуулт, Quiz асуулт үүсгэж, засаж, устгана.</p>
          </div>
          <button onClick={openCreate} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition flex-shrink-0">
            + Асуулт
          </button>
        </div>

        {/* Filter panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Асуулт хайх..."
              className={"flex-1 " + inputCls}
            />
            <select value={categoryFilter} onChange={function (e) { setCategoryFilter(e.target.value); }} className={inputCls + " md:w-48"}>
              <option value="all">Бүх категори</option>
              <option value="general">Ерөнхий</option>
              <option value="technical">Техникийн</option>
              <option value="behavioral">Зан үйлийн</option>
            </select>
            <select value={typeFilter} onChange={function (e) { setTypeFilter(e.target.value); }} className={inputCls + " md:w-40"}>
              <option value="all">Бүх төрөл</option>
              <option value="flashcard">Flashcard</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <ListSkeleton count={8} />
        ) : questions.length === 0 ? (
          <EmptyState illustration="interview" title="Асуулт олдсонгүй" description="Шинэ асуулт нэмэхийн тулд дээрх товч дарна уу." />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-200">
              {questions.map(function (q) {
                return (
                  <div key={q.id} className="p-5 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-semibold">
                            {categoryLabels[q.category] || q.category}
                          </span>
                          {q.is_quiz && (
                            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                              Quiz
                            </span>
                          )}
                          {q.difficulty && (
                            <span className="text-xs text-gray-500">{difficultyLabels[q.difficulty] || q.difficulty}</span>
                          )}
                          {q.tags && (
                            <span className="text-xs text-gray-400 italic">#{q.tags}</span>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-gray-900 mb-1.5">{q.question_mn}</p>

                        {q.is_quiz ? (
                          <div className="text-xs text-gray-600 space-y-0.5 mt-2">
                            <p>A. {q.option_a}</p>
                            <p>B. {q.option_b}</p>
                            <p>C. {q.option_c}</p>
                            <p>D. {q.option_d}</p>
                            <p className="text-emerald-700 font-semibold mt-1">Зөв: {(q.correct_option || "").toUpperCase()}</p>
                          </div>
                        ) : (
                          q.sample_answer && <p className="text-xs text-gray-600 line-clamp-2">{q.sample_answer}</p>
                        )}
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={function () { openEdit(q); }}
                          className="text-xs px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
                        >
                          Засах
                        </button>
                        <button
                          onClick={function () { handleDelete(q); }}
                          className="text-xs px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                        >
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

        <p className="text-xs text-gray-400">Нийт {questions.length} асуулт харагдаж байна.</p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? "Асуулт засах" : "Шинэ асуулт нэмэх"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className={labelCls}>Асуулт <span className="text-red-500">*</span></label>
                <textarea
                  value={form.question_mn}
                  onChange={function (e) { upd("question_mn", e.target.value); }}
                  rows={2}
                  placeholder="Ярилцлагад асуух асуулт..."
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Категори <span className="text-red-500">*</span></label>
                  <select value={form.category} onChange={function (e) { upd("category", e.target.value); }} className={inputCls}>
                    <option value="general">Ерөнхий</option>
                    <option value="technical">Техникийн</option>
                    <option value="behavioral">Зан үйлийн</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Хүндрэл</label>
                  <select value={form.difficulty} onChange={function (e) { upd("difficulty", e.target.value); }} className={inputCls}>
                    <option value="easy">Хялбар</option>
                    <option value="medium">Дундаж</option>
                    <option value="hard">Хүнд</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Tags (таслалаар тусгаарлана)</label>
                <input
                  value={form.tags}
                  onChange={function (e) { upd("tags", e.target.value); }}
                  placeholder="javascript, react, frontend"
                  className={inputCls}
                />
              </div>

              {/* Quiz toggle */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_quiz}
                    onChange={function (e) { upd("is_quiz", e.target.checked); }}
                    className="w-4 h-4 accent-violet-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Quiz асуулт болгох</p>
                    <p className="text-xs text-gray-500">Хэрэв идэвхтэй бол 4 сонголт + зөв хариултыг бөглөнө үү. Энэ асуулт Quiz горимд харагдана.</p>
                  </div>
                </label>
              </div>

              {/* Quiz fields */}
              {form.is_quiz && (
                <div className="border-l-4 border-violet-500 pl-4 space-y-3 bg-violet-50/30 p-4 rounded-r-lg">
                  {["a", "b", "c", "d"].map(function (letter) {
                    var key = "option_" + letter;
                    var isCorrect = form.correct_option === letter;
                    return (
                      <div key={letter}>
                        <label className={labelCls + " flex items-center justify-between"}>
                          <span>Сонголт {letter.toUpperCase()} <span className="text-red-500">*</span></span>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="correct"
                              checked={isCorrect}
                              onChange={function () { upd("correct_option", letter); }}
                              className="w-3 h-3 accent-emerald-600"
                            />
                            <span className={"text-xs " + (isCorrect ? "text-emerald-700 font-semibold" : "text-gray-500")}>
                              {isCorrect ? "✓ Зөв хариулт" : "Зөв болгох"}
                            </span>
                          </label>
                        </label>
                        <input
                          value={form[key]}
                          onChange={function (e) { upd(key, e.target.value); }}
                          placeholder={"Сонголт " + letter.toUpperCase()}
                          className={inputCls + (isCorrect ? " border-emerald-400 bg-emerald-50/50" : "")}
                        />
                      </div>
                    );
                  })}

                  <div>
                    <label className={labelCls}>Тайлбар (яагаад энэ хариулт зөв вэ)</label>
                    <textarea
                      value={form.explanation}
                      onChange={function (e) { upd("explanation", e.target.value); }}
                      rows={2}
                      placeholder="Зөв хариулт яагаад зөв бэ?..."
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              {/* Flashcard fields */}
              <div>
                <label className={labelCls}>Жишээ хариулт {!form.is_quiz && <span className="text-gray-400">(Flashcard/STAR горимд харагдана)</span>}</label>
                <textarea
                  value={form.sample_answer}
                  onChange={function (e) { upd("sample_answer", e.target.value); }}
                  rows={5}
                  placeholder="Бодит хариулт, жишээ..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Зөвлөмж</label>
                <textarea
                  value={form.advice}
                  onChange={function (e) { upd("advice", e.target.value); }}
                  rows={2}
                  placeholder="Хариулахад анхаарах зүйлс..."
                  className={inputCls}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition"
              >
                Цуцлах
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition"
              >
                {editingId ? "Шинэчлэх" : "Үүсгэх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
