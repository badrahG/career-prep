import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function Advice() {
  var { user } = useAuth();
  var isAdmin = user?.role === "admin";

  var [stats, setStats] = useState(null);

  useEffect(function () {
    API.get("/advice/stats")
      .then(function (res) { setStats(res.data); })
      .catch(function () {});
  }, []);

  var categories = [
    {
      key: "cv",
      title: "CV бичих зөвлөмж",
      subtitle: "CV Writing",
      description: "Мэргэжлийн CV үүсгэх, форматлах, ATS-д таних дүрмүүд, нийтлэг алдаанаас зайлсхийх.",
      link: "/advice/cv",
      color: "bg-blue-600",
      examples: ["CV бүтэц", "Нийтлэг алдаа", "ATS-д таних", "Ур чадвар хэсэг"],
    },
    {
      key: "interview",
      title: "Ярилцлагын зөвлөмж",
      subtitle: "Interview Tips",
      description: "Ярилцлагын бэлтгэл, биеийн хэл, хүнд асуултад хариулах, дараах үйлдлүүд.",
      link: "/advice/interview",
      color: "bg-purple-600",
      examples: ["Өмнөх бэлтгэл", "Биеийн хэл", "Хүнд асуулт", "Дараах алхам"],
    },
    {
      key: "job_search",
      title: "Ажил олох",
      subtitle: "Job Search",
      description: "Ажлын сайтууд, networking, cover letter бичих, remote ажил олох арга замууд.",
      link: "/advice/job_search",
      color: "bg-emerald-600",
      examples: ["Ажлын сайтууд", "Networking", "Cover letter", "Remote ажил"],
    },
    {
      key: "career",
      title: "Карьерын зөвлөмж",
      subtitle: "Career Growth",
      description: "Эхний ажил сонгох, карьер ургуулах, цалингийн хэлэлцээ, burnout-аас сэргийлэх.",
      link: "/advice/career",
      color: "bg-amber-600",
      examples: ["Эхний ажил", "7 дадал", "Цалингийн хэлэлцээ", "Burnout"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 relative z-10">
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
            <Link to="/interview" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Ярилцлага</Link>
            <Link to="/advice" className="px-3 py-2 text-slate-900 font-medium border-b-2 border-[#1e3a8a]">Зөвлөмж</Link>
            <Link to="/scholarship" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Тэтгэлэг</Link>
          </div>
          <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 font-medium md:hidden">← Буцах</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">Карьерын зөвлөмж</span>
          </div>
          {isAdmin && <Link to="/admin/advice" className="text-[#1e3a8a] font-medium hover:underline">Удирдах →</Link>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-8 pb-6 border-b border-slate-200">
          <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider mb-2">Карьерын зөвлөмж</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Ажил мэргэжлийн замд тань туслах</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            {stats ? stats.total : "..."} зөвлөмж 4 гол сэдвээр. CV бичиж эхлэхээс амжилттай ажил олох хүртэл бүх шатанд тус болох гарын авлага.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {categories.map(function (c) {
            var count = stats ? stats[c.key] || 0 : 0;
            return (
              <Link
                key={c.key}
                to={c.link}
                className="bg-white border border-slate-200 rounded p-6 hover:border-[#1e3a8a] hover:shadow-sm transition group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={"w-12 h-12 rounded flex items-center justify-center flex-shrink-0 " + c.color}>
                    <span className="text-white font-bold text-lg">{c.title.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{c.subtitle}</p>
                      <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                        {count} зөвлөмж
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1e3a8a] transition">{c.title}</h3>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-4">{c.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {c.examples.map(function (e, i) {
                    return (
                      <span key={i} className="text-xs bg-slate-50 text-slate-700 border border-slate-200 px-2 py-1 rounded">
                        {e}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-[#1e3a8a] font-semibold group-hover:underline">Зөвлөмж унших →</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded p-6">
          <h3 className="text-base font-bold text-slate-900 mb-2">Хэрхэн хамгийн үр дүнтэй ашиглах вэ?</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-[#1e3a8a] font-bold">1.</span>
              <span>Өөрт тохирох сэдвээс эхэл — CV бичих гэж байвал эхлээд CV хэсэг.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1e3a8a] font-bold">2.</span>
              <span>Нэг зөвлөмжийг уншаад шууд ажлын практикт тусга.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1e3a8a] font-bold">3.</span>
              <span>Видео хавсралттай зөвлөмжүүд — илүү гүн сурах боломж.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}