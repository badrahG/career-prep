import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../services/api";
import toast from "react-hot-toast";
import CVPreview from "../components/CVPreview";

var SAMPLE_CV = {
  educations: [
    { school: "Монгол Улсын Их Сургууль", level: "Бакалавр", major: "Компьютерын ухаан", gpa: "3.7", start_year: "2018", end_year: "2022" },
  ],
  experiences: [
    { position: "Frontend Developer", company: "Tech Solutions LLC", start_date: "2022-06", end_date: "", description: "React, JavaScript ашиглан веб аппликейшн хөгжүүлэлт хийсэн." },
    { position: "Дадлагажигч", company: "DataMon ХХК", start_date: "2021-06", end_date: "2021-12", description: "" },
  ],
  skills: [],
};

var SAMPLE_INFO = {
  lastName: "Батбаяр", firstName: "Нарантуяа",
  email: "n.batbayar@email.com", phone: "9911-2233", address: "Улаанбаатар хот",
  about: "Туршлагатай програм хөгжүүлэгч. Баг хамт олонтой нягт хамтран ажиллах дуртай.",
  personalSkills: ["Багаар ажиллах", "Цагийн менежмент", "Харилцааны чадвар"],
  techSkills: ["JavaScript", "React", "Python", "SQL"],
  profSkills: ["Бичиг баримт боловсруулах"],
  artSkills: [], sportSkills: [],
  languages: [{ name: "Англи хэл", level: "Ахисан дунд шат" }],
  certs: [{ name: "AWS Certified Cloud Practitioner", organization: "Amazon", start_date: "2023" }],
  internships: [],
  awards: [{ name: "Оны шилдэг ажилтан — 2023", year: "2023" }],
};

var TEMPLATES = [
  { id: "modern", label: "Монгол хэв маяг", desc: "Монголын компаниудад хамгийн тохиромжтой" },
  { id: "classic", label: "Ази хэв маяг", desc: "Бүтцийг тодорхой харуулсан мэргэжлийн загвар" },
  { id: "minimal", label: "Европ хэв маяг", desc: "Энгийн, цэвэр, орчин үеийн дизайн" },
];

function StarDisplay({ avg, count }) {
  if (!count) return <span className="text-xs text-gray-400">Үнэлгээ алга</span>;
  var full = Math.round(avg);
  return (
    <span className="flex items-center gap-1">
      <span className="text-sm leading-none" style={{ letterSpacing: "-1px" }}>
        {[1,2,3,4,5].map(function (n) {
          return <span key={n} style={{ color: n <= full ? "#f59e0b" : "#d1d5db" }}>★</span>;
        })}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{avg.toFixed(1)} ({count})</span>
    </span>
  );
}

export default function CVStart() {
  var navigate = useNavigate();
  var [uploading, setUploading] = useState(false);
  var [step, setStep] = useState(1);
  var [parsedData, setParsedData] = useState(null);
  var fileRef = useRef(null);
  var [ratings, setRatings] = useState({});

  useEffect(function () {
    API.get("/feedback/cv-template/summary")
      .then(function (res) { setRatings(res.data); })
      .catch(function () {});
  }, []);

  function handleFile(e) {
    var file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Зөвхөн PDF файл зөвшөөрнө");
      e.target.value = "";
      return;
    }
    setUploading(true);
    var form = new FormData();
    form.append("file", file);
    API.post("/cv/parse-upload", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then(function (res) {
        toast.success("CV-ийн мэдээлэл амжилттай уншигдлаа!");
        setParsedData(res.data);
        setStep(2);
      })
      .catch(function (err) {
        toast.error(err.response?.data?.detail || "CV уншиж чадсангүй");
        if (fileRef.current) fileRef.current.value = "";
      })
      .finally(function () { setUploading(false); });
  }

  function handlePickTemplate(templateId) {
    navigate("/cv/new", { state: { template: templateId, prefilled: parsedData } });
  }

  // Step 2: Template picker
  if (step === 2) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-5 md:p-8">
          <div className="w-full max-w-6xl">
            <button
              onClick={function () { setStep(1); setParsedData(null); }}
              className="mb-6 text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-1 transition font-medium"
            >
              ← Буцах
            </button>
            <div className="text-center mb-8">
              <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">CV загвараа үүсгэ</p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">Загвар сонгоно уу</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Загвар дээр дарж CV хийж эхэлнэ үү</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TEMPLATES.map(function (t) {
                return (
                  <div
                    key={t.id}
                    onClick={function () { handlePickTemplate(t.id); }}
                    className="cursor-pointer group flex flex-col"
                  >
                    <div
                      className="relative rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-md group-hover:border-violet-400 group-hover:shadow-xl transition-all duration-200"
                      style={{ height: "420px" }}
                    >
                      {/* Scaled CV preview */}
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "210mm",
                        transformOrigin: "top left",
                        transform: "scale(0.385)",
                        pointerEvents: "none",
                      }}>
                        <CVPreview cv={SAMPLE_CV} info={SAMPLE_INFO} template={t.id} />
                      </div>

                      {/* Hover overlay with CTA */}
                      <div className="absolute inset-0 bg-violet-600/0 group-hover:bg-violet-600/8 transition-all duration-200 flex items-end justify-center pb-5">
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-violet-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg">
                          Энэ загварыг сонгох →
                        </span>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-base">{t.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t.desc}</p>
                      <div className="flex justify-center mt-2">
                        <StarDisplay avg={ratings[t.id]?.avg || 0} count={ratings[t.id]?.count || 0} />
                      </div>
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

  // Step 1: Choose method
  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-5 md:p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-5xl">
          <div className="mb-10 text-center">
            <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-2">CV Builder</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">Хэрхэн эхлэх вэ?</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Эхлэх аргаа сонгоно уу</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Scholarship CV — featured */}
            <div className="bg-white dark:bg-gray-800 border-2 border-violet-400 dark:border-violet-500 rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl transition relative">
              <span className="absolute top-4 right-4 text-xs bg-violet-600 text-white px-2.5 py-1 rounded-full font-bold">New</span>
              <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Scholarship Apply CV</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 flex-1">
                АНУ, Австрали, Япон руу тэтгэлэгт apply хийх CV болон motivation letter бэлдэх.
              </p>
              <p className="text-xs text-violet-500 font-medium mb-6">US · Australia · Japan</p>
              <button
                onClick={function () { navigate("/cv/scholarship/new"); }}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Эхлэх →
              </button>
            </div>

            {/* Card 2: Start fresh */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-8 flex flex-col items-center text-center hover:shadow-md transition">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Шинээр үүсгэх</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex-1">
                Эхнээс мэдээллээ алхам алхмаар оруулж, CareerPrep системийн загвар дээр CV үүсгэнэ үү.
              </p>
              <button
                onClick={function () { setParsedData(null); setStep(2); }}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Эхнээс эхлэх →
              </button>
            </div>

            {/* Card 3: Upload existing */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-8 flex flex-col items-center text-center hover:shadow-md transition">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Бэлэн CV байршуулах</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex-1">
                Өмнө нь хийж байсан CV загвараа байршуулж, мэдээллийг автоматаар уншиж CareerPrep системийн загвар дээр CV үүсгэнэ.
              </p>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
              <button
                onClick={function () { if (!uploading) fileRef.current?.click(); }}
                disabled={uploading}
                className="w-full border-2 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-400 py-3 rounded-xl text-sm font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20 transition disabled:opacity-60"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".3" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    AI уншиж байна...
                  </span>
                ) : "PDF байршуулах →"}
              </button>
              {!uploading && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Зөвхөн PDF • Хамгийн ихдээ 20MB</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
