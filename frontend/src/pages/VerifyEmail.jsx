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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-sm tracking-wide">CP</span>
            </div>
            <span className="text-base font-bold text-slate-900">CareerPrep</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded p-8 md:p-10 shadow-sm text-center">
            {status === "loading" && (
              <>
                <div className="w-16 h-16 mx-auto mb-5 bg-slate-100 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Баталгаажуулж байна...</h1>
                <p className="text-sm text-slate-600">Түр хүлээнэ үү.</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 mx-auto mb-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Баталгаажлаа!</h1>
                <p className="text-sm text-slate-600 mb-6">{message}</p>
                <Link to="/login" className="block bg-[#1e3a8a] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition">
                  Нэвтрэх →
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 mx-auto mb-5 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Баталгаажуулж чадсангүй</h1>
                <p className="text-sm text-slate-600 mb-6">{message}</p>
                <div className="space-y-2">
                  <Link to="/login" className="block bg-[#1e3a8a] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#1e40af] transition">
                    Нэвтрэх хуудас руу очих
                  </Link>
                  <p className="text-xs text-slate-500">
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