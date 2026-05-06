import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import Layout from "../components/Layout";

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
    <Layout>
      <div className="p-5 md:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">Карьерын зөвлөмж</p>
            <h1 className="text-2xl font-bold text-gray-800">Ажил мэргэжлийн замд тань туслах</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats ? stats.total : "..."} зөвлөмж 4 гол сэдвээр.
            </p>
          </div>
          {isAdmin && <Link to="/admin/advice" className="text-sm text-violet-600 font-semibold hover:underline whitespace-nowrap">Удирдах →</Link>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {categories.map(function (c) {
            var count = stats ? stats[c.key] || 0 : 0;
            return (
              <Link key={c.key} to={c.link}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md hover:border-violet-200 transition group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={"w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 " + c.color}>
                    <span className="text-white font-bold text-lg">{c.title.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{c.subtitle}</p>
                      <span className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-lg font-semibold whitespace-nowrap">
                        {count} зөвлөмж
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-violet-700 transition">{c.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{c.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.examples.map(function (e, i) {
                    return (
                      <span key={i} className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1 rounded-lg">{e}</span>
                    );
                  })}
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-sm text-violet-600 font-semibold group-hover:underline">Зөвлөмж унших →</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6">
          <h3 className="text-base font-bold text-gray-800 mb-3">Хэрхэн хамгийн үр дүнтэй ашиглах вэ?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {["Өөрт тохирох сэдвээс эхэл — CV бичих гэж байвал эхлээд CV хэсэг.",
              "Нэг зөвлөмжийг уншаад шууд ажлын практикт тусга.",
              "Видео хавсралттай зөвлөмжүүд — илүү гүн сурах боломж."].map(function (t, i) {
              return (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-violet-600 font-bold">{i + 1}.</span>
                  <span>{t}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Layout>
  );
}