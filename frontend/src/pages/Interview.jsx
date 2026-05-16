import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import Layout from "../components/Layout";

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
      description: "Зан төлөвийн асуултуудад STAR аргаар (Situation, Task, Action, Result) бүтэцтэй хариулт бичих дадлага.",
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
    { key: "behavioral", label: "Зан төлөвийн", desc: "Багаар ажиллах, шийдвэр гаргах" },
  ];

  var tips = [
    "Ярилцлагын 1-2 өдрийн өмнө сайн унтах, хоол хүнсээ цагтаа идэх.",
    "Ярилцлагаас 10-15 минутын өмнө ирэх. Онлайн бол 5 минут өмнө холбогдох.",
    "Ажил олгогчийн тухай судалж, 2-3 асуулт бэлдэж ирэх.",
    "Бие хэлний зөв байдал: нүдний контакт, шулуун суух, мэнд мэдэхдээ цайвар инээмсэглэл.",
    "Хариулж чадахгүй бол 'надад мэдэгдэлтэй бодоод хариулья' гэж цаг гуйх боломжтой.",
  ];

  return (
    <Layout>
      <div className="p-5 md:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">Ярилцлагын бэлтгэл</p>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Ярилцлагад бэлтгэцгээе</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stats ? stats.total : "..."} асуултын санг 3 өөр горимоор судалж, ярилцлагад өөртөө итгэлтэй орох боломжтой.
            </p>
          </div>
          {isAdmin && <Link to="/admin/interview" className="text-sm text-violet-600 font-semibold hover:underline whitespace-nowrap">Асуулт удирдах →</Link>}
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {categories.map(function (c) {
              return (
                <div key={c.key} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{c.label}</p>
                    <span className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800 px-2 py-0.5 rounded-lg font-semibold">
                      {stats[c.key]} асуулт
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">Горимуудаас сонгоно уу</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {modes.map(function (m) {
            var card = (
              <div className={"bg-white dark:bg-gray-800 border rounded-2xl h-full flex flex-col shadow-sm transition " +
                (m.available ? "border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-600 hover:shadow-md cursor-pointer" : "border-gray-100 dark:border-gray-700 opacity-60")}>
                <div className={"h-1.5 rounded-t-2xl " + (m.available ? "bg-gradient-to-r from-violet-500 to-indigo-500" : "bg-gray-200 dark:bg-gray-600")} />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">{m.subtitle}</p>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-0.5">{m.title}</h3>
                    </div>
                    {!m.available && (
                      <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-lg font-medium">Удахгүй</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1">{m.description}</p>
                  <ul className="space-y-1.5 mb-4">
                    {m.features.map(function (f, i) {
                      return (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className={m.available ? "text-emerald-500" : "text-gray-300 dark:text-gray-600"}>✓</span>
                          <span>{f}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className={"text-center py-2 rounded-xl text-sm font-semibold transition " +
                    (m.available ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed")}>
                    {m.available ? "Эхлэх →" : "Удахгүй нээгдэнэ"}
                  </div>
                </div>
              </div>
            );
            return m.available ? <Link key={m.id} to={m.link}>{card}</Link> : <div key={m.id}>{card}</div>;
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Ярилцлагын ерөнхий зөвлөмж</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {tips.map(function (tip, i) {
                return (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{tip}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-2">STAR арга гэж юу вэ?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">Зан төлөвийн асуултад бүтэцтэй хариулт өгөх арга. Дөрвөн хэсэгтэй:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { letter: "S", name: "Situation", desc: "Ямар нөхцөл байсан" },
              { letter: "T", name: "Task", desc: "Таны үүрэг, зорилт юу байсан" },
              { letter: "A", name: "Action", desc: "Юу хийсэн, яаж шийдсэн" },
              { letter: "R", name: "Result", desc: "Ямар үр дүн гарсан (тоо баримттай)" },
            ].map(function (item, i) {
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 flex items-start gap-3 shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {item.letter}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
