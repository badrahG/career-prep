import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function Interview() {
  var { user } = useAuth();
  var isAdmin = user?.role === "admin";

  var [stats, setStats] = useState(null);

  useEffect(function () {
    API.get("/interview/stats")
      .then(function (res) { setStats(res.data); })
      .catch(function () {});
  }, []);

  var modes = [
    {
      id: "flashcard",
      title: "Судлах горим",
      subtitle: "Flashcard",
      description: "Ярилцлагын нийтлэг асуултуудыг карт эргүүлэх хэлбэрээр судалж, жишээ хариулт, зөвлөмжтэй танилцана.",
      link: "/interview/flashcard",
      available: true,
      features: [
        "Асуулт → хариулт → зөвлөмж",
        "Категориор шүүх",
        "Өөрийн хурдаар судлах",
      ],
    },
    {
      id: "quiz",
      title: "Шалгах горим",
      subtitle: "Quiz",
      description: "Олон сонголттой тестээр мэдлэгээ шалгаж, оноо гарган, сул талаа илрүүлнэ.",
      link: "/interview/quiz",
      available: true,
      features: [
        "Асуулт бүрд 4 хариулт",
        "Дуусахад оноо, хувь",
        "Зөв/буруу тайлбар",
      ],
    },
    {
      id: "star",
      title: "Дадлага горим",
      subtitle: "STAR",
      description: "Зан үйлийн асуултуудад STAR аргаар (Situation, Task, Action, Result) бүтэцтэй хариулт бичих дадлага.",
      link: "/interview/star",
      available: true,
      features: [
        "4 хэсэгт хариулт бичих",
        "Мэргэжилтний жишээтэй харьцуулах",
        "Хариултаа хадгалах",
      ],
    },
  ];

  var categories = [
    { key: "general", label: "Ерөнхий", desc: "Өөрийгөө танилцуулах, компани, карьер" },
    { key: "technical", label: "Техникийн", desc: "Програмчлал, технологийн мэдлэг" },
    { key: "behavioral", label: "Зан үйлийн", desc: "Багаар ажиллах, шийдвэр гаргах" },
  ];

  var tips = [
    "Ярилцлагын 1-2 өдрийн өмнө сайн унтах, хоол хүнсээ цагтаа идэх.",
    "Ярилцлагаас 10-15 минутын өмнө ирэх. Онлайн бол 5 минут өмнө холбогдох.",
    "Ажил олгогчийн тухай судалж, 2-3 асуулт бэлдэж ирэх.",
    "Бие хэлний зөв байдал: нүдний контакт, шулуун суух, мэнд мэдэхдээ цайвар инээмсэглэл.",
    "Хариулж чадахгүй бол 'надад мэдэгдэлтэй бодоод хариулья' гэж цаг гуйх боломжтой.",
  ];

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
          <div className="hidden md:flex items-center gap-1 text-sm">
            <Link to="/dashboard" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Нүүр</Link>
            <Link to="/cv" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">CV</Link>
            <Link to="/interview" className="px-3 py-2 text-slate-900 font-medium border-b-2 border-[#1e3a8a]">Ярилцлага</Link>
            <Link to="/scholarship" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Тэтгэлэг</Link>
          </div>
          <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 font-medium md:hidden">← Буцах</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">Ярилцлагын бэлтгэл</span>
          </div>
          {isAdmin && <Link to="/admin/interview" className="text-[#1e3a8a] font-medium hover:underline">Асуулт удирдах →</Link>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero header */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">Ярилцлагын бэлтгэл</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Ярилцлагад бэлтгэцгээе</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            {stats ? stats.total : "..."} асуултын санг 3 өөр горимоор судалж, ярилцлагад өөртөө итгэлтэй орох боломжтой.
          </p>
        </div>

        {/* Category stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {categories.map(function (c) {
              return (
                <div key={c.key} className="bg-white border border-slate-200 rounded p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-900">{c.label}</p>
                    <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 px-2 py-0.5 rounded font-semibold">
                      {stats[c.key]} асуулт
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Mode cards */}
        <h2 className="text-base font-semibold text-slate-900 mb-4">Горимуудаас сонгоно уу</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {modes.map(function (m) {
            var card = (
              <div className={"bg-white border rounded h-full flex flex-col transition " +
                (m.available ? "border-slate-200 hover:border-[#1e3a8a] hover:shadow-sm cursor-pointer" : "border-slate-200 opacity-70")}>
                <div className={"h-1 " + (m.available ? "bg-[#1e3a8a]" : "bg-slate-300")}></div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">{m.subtitle}</p>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{m.title}</h3>
                    </div>
                    {!m.available && (
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                        Удахгүй
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 flex-1">{m.description}</p>

                  <ul className="space-y-1.5 mb-4">
                    {m.features.map(function (f, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className={m.available ? "text-emerald-600" : "text-slate-300"}>✓</span>
                          <span>{f}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className={"text-center py-2 rounded text-sm font-semibold transition " +
                    (m.available ? "bg-[#1e3a8a] text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed")}>
                    {m.available ? "Эхлэх →" : "Удахгүй нээгдэнэ"}
                  </div>
                </div>
              </div>
            );
            return m.available ? (
              <Link key={m.id} to={m.link}>{card}</Link>
            ) : (
              <div key={m.id}>{card}</div>
            );
          })}
        </div>

        {/* Tips section */}
        <div className="bg-white border border-slate-200 rounded mb-8">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Ярилцлагын ерөнхий зөвлөмж</h2>
            <p className="text-xs text-slate-500 mt-0.5">Мэргэжлийн сайн харагдахад тус болох зөвлөгөөнүүд.</p>
          </div>
          <div className="p-6">
            <ul className="space-y-2.5">
              {tips.map(function (tip, i) {
                return (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 text-[#1e3a8a] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* STAR intro */}
        <div className="bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 mb-2">STAR арга гэж юу вэ?</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                Зан үйлийн асуултад бүтэцтэй хариулт өгөх арга. Дөрвөн хэсэгтэй:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { letter: "S", name: "Situation", desc: "Ямар нөхцөл байсан" },
                  { letter: "T", name: "Task", desc: "Таны үүрэг, зорилт юу байсан" },
                  { letter: "A", name: "Action", desc: "Юу хийсэн, яаж шийдсэн" },
                  { letter: "R", name: "Result", desc: "Ямар үр дүн гарсан (тоо баримттай)" },
                ].map(function (item, i) {
                  return (
                    <div key={i} className="bg-white border border-slate-200 rounded p-3 flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#1e3a8a] text-white rounded flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {item.letter}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}