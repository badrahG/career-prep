import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function CVList() {
  var [cvs, setCvs] = useState([]);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    API.get("/cv")
      .then(function(res) { setCvs(res.data); })
      .catch(function() { toast.error("CV жагсаалт ачаалахад алдаа"); })
      .finally(function() { setLoading(false); });
  }, []);

  function handleDelete(id) {
    if (!window.confirm("Энэ CV-г устгах уу?")) return;
    API.delete("/cv/" + id)
      .then(function() {
        var f = [];
        for (var j = 0; j < cvs.length; j++) {
          if (cvs[j].id !== id) f.push(cvs[j]);
        }
        setCvs(f);
        toast.success("CV устгагдлаа");
      })
      .catch(function() { toast.error("Устгахад алдаа"); });
  }

  var templateLabels = { modern: "Modern", classic: "Classic", minimal: "Minimal" };

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
            <Link to="/cv" className="px-3 py-2 text-slate-900 font-medium border-b-2 border-[#1e3a8a]">CV</Link>
            <Link to="/interview" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Ярилцлага</Link>
            <Link to="/scholarship" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Тэтгэлэг</Link>
          </div>
          <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 font-medium md:hidden">← Буцах</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">Миний CV</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Миний CV</h1>
            <p className="text-sm text-slate-600 mt-1">Нийт {cvs.length} CV үүсгэсэн.</p>
          </div>
          <Link to="/cv/new" className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition">
            + Шинэ CV
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Ачааллаж байна...</div>
        ) : cvs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded p-12 text-center">
            <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded mx-auto mb-4 flex items-center justify-center">
              <span className="text-slate-400 font-bold text-sm">CV</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">CV үүсгээгүй байна</h3>
            <p className="text-sm text-slate-500 mb-5">Эхний CV-гээ үүсгээд эхлээрэй.</p>
            <Link to="/cv/new" className="inline-block bg-[#1e3a8a] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition">
              Эхний CV үүсгэх
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cvs.map(function(cv) {
              var label = templateLabels[cv.template_type] || cv.template_type;
              return (
                <div key={cv.id} className="bg-white rounded border border-slate-200 overflow-hidden hover:border-[#1e3a8a] transition">
                  <div className="h-1 bg-[#1e3a8a]"></div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-[#1e3a8a] font-bold text-xs">CV</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{cv.name}</p>
                          <p className="text-xs text-slate-500">{new Date(cv.created_at).toLocaleDateString("mn-MN")}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-50 text-slate-700 border border-slate-200 ml-2">{label}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={"/cv/" + cv.id} className="flex-1 text-center py-2 bg-[#1e3a8a] text-white rounded text-xs font-medium hover:bg-[#1e40af] transition">
                        Харах
                      </Link>
                      <Link to={"/cv/" + cv.id + "/edit"} className="flex-1 text-center py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
                        Засах
                      </Link>
                      <button onClick={function() { handleDelete(cv.id); }} className="px-3 py-2 border border-slate-300 rounded text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition">
                        Устгах
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}