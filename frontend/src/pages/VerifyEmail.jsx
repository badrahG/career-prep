import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../services/api";

export default function VerifyEmail() {
  var [searchParams] = useSearchParams();
  var token = searchParams.get("token");

  var [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  var [message, setMessage] = useState("");

  useEffect(function () {
    if (!token) {
      setStatus("error");
      setMessage("Линк буруу байна");
      return;
    }
    API.post("/auth/verify-email", { token: token })
      .then(function (res) {
        setStatus("success");
        setMessage(res.data.message || "И-мэйл хаяг амжилттай баталгаажлаа!");
      })
      .catch(function (err) {
        setStatus("error");
        setMessage(err.response?.data?.detail || "Баталгаажуулах явцад алдаа гарлаа");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-indigo-400/15 to-violet-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-violet-400/10 to-indigo-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex items-center h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center rounded-xl shadow-sm">
              <span className="text-white font-bold text-sm tracking-wide">CP</span>
            </div>
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">CareerPrep</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Career Platform</div>
            </div>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 md:p-10 shadow-sm text-center">

            {status === "loading" && (
              <>
                <div className="w-16 h-16 mx-auto mb-5 bg-violet-50 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center">
                  <svg className="animate-spin w-7 h-7 text-violet-600" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Баталгаажуулж байна...</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Түр хүлээнэ үү.</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 mx-auto mb-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg text-xs font-semibold mb-4">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Амжилттай
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Баталгаажлаа!</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
                <Link to="/login" className="block bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-3 rounded-full text-sm font-semibold hover:shadow-md transition">
                  Нэвтрэх →
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 mx-auto mb-5 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-1 rounded-lg text-xs font-semibold mb-4">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Алдаа гарлаа
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Баталгаажуулж чадсангүй</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
                <div className="space-y-3">
                  <Link to="/login" className="block bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-3 rounded-full text-sm font-semibold hover:shadow-md transition">
                    Нэвтрэх хуудас руу очих
                  </Link>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Шинэ линк авахын тулд нэвтрэх оролдлого хийхэд автоматаар санал болгогдоно.
                  </p>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
