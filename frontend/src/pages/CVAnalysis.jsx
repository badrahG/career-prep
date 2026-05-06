import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/Layout";

const SECTION_LABELS = {
  contact: "Холбоо барих",
  summary: "Товч танилцуулга",
  experience: "Ажлын туршлага",
  education: "Боловсрол",
  skills: "Ур чадвар",
};

const GRADE_COLOR = {
  "Маш муу": "#ef4444",
  Муу: "#f97316",
  Дунд: "#eab308",
  Сайн: "#22c55e",
  "Маш сайн": "#10b981",
};

function ScoreCircle({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#22c55e" : score >= 40 ? "#eab308" : score >= 20 ? "#f97316" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="130" height="130" className="-rotate-90">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-800">{score}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

function SectionBar({ label, data }) {
  const pct = (data.score / 10) * 100;
  const color = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-400" : "bg-red-400";

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          {!data.present && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Дутуу</span>
          )}
          <span className="text-sm text-gray-500">{data.score}/10</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {data.feedback && <p className="mt-1 text-xs text-gray-500">{data.feedback}</p>}
    </div>
  );
}

export default function CVAnalysis() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  function handleFile(f) {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Зөвхөн PDF файл оруулна уу");
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/cv-analysis/analyze", formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Анализ хийхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <Layout>
      <div className="p-5 md:p-6 max-w-3xl">
        <div className="mb-6">
          <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">AI Шинжилгээ</p>
          <h1 className="text-2xl font-bold text-gray-800">CV Анализ</h1>
          <p className="text-sm text-gray-500 mt-1">AI-ийн тусламжтайгаар CV-ийгээ сайжруул</p>
        </div>
        {!result ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">CV-ийгээ оруулна уу</h2>
              <p className="text-sm text-gray-500">Claude AI таны CV-г задлан шинжилж, Монгол хэлээр зөвлөгөө өгнө</p>
            </div>

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-xs text-red-500 hover:text-red-700 mt-1"
                  >
                    Устгах
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-500 text-sm">PDF файлаа энд чирж оруулна уу</p>
                  <p className="text-xs text-gray-400">эсвэл дарж сонгоно уу (макс. 10MB)</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={analyze}
              disabled={!file || loading}
              className="mt-6 w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Анализ хийж байна...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Анализ хийх
                </>
              )}
            </button>

            {loading && (
              <p className="text-center text-xs text-gray-400 mt-3">
                Claude AI таны CV-г уншиж байна... 10-20 секунд хүлээнэ үү
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Score card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreCircle score={result.score} />
                <div className="flex-1 text-center sm:text-left">
                  <div
                    className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2"
                    style={{
                      backgroundColor: (GRADE_COLOR[result.grade] || "#6366f1") + "20",
                      color: GRADE_COLOR[result.grade] || "#6366f1",
                    }}
                  >
                    {result.grade}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{result.summary}</p>
                </div>
              </div>
            </div>

            {/* Missing sections */}
            {result.missing_sections?.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Дутуу хэсгүүд
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missing_sections.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Давуу талууд
                </h3>
                <ul className="space-y-2">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Сул талууд
                </h3>
                <ul className="space-y-2">
                  {result.weaknesses?.map((w, i) => (
                    <li key={i} className="text-sm text-orange-800 flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section breakdown */}
            {result.sections && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Хэсэг бүрийн үнэлгээ</h3>
                {Object.entries(result.sections).map(([key, val]) => (
                  <SectionBar key={key} label={SECTION_LABELS[key] || key} data={val} />
                ))}
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                <h3 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Зөвлөмжүүд
                </h3>
                <ol className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-indigo-800 flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      {r}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Дахин анализ хийх
              </button>
              <Link
                to="/cv/new"
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors text-center"
              >
                CV үүсгэх
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
