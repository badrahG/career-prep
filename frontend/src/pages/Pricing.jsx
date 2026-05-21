import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

function Check() {
  return (
    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Cross() {
  return (
    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function Pricing() {
  var { user } = useAuth();
  var navigate = useNavigate();
  var [usage, setUsage] = useState(null);
  var [invoice, setInvoice] = useState(null);
  var [buyType, setBuyType] = useState(null);
  var [loading, setLoading] = useState(false);

  var isAdmin = user?.role === "admin";
  var isPro = usage?.plan === "pro";

  useEffect(function () {
    if (user && !isAdmin) {
      API.get("/subscription/usage").then(function (r) { setUsage(r.data); }).catch(function () {});
    }
  }, [user, isAdmin]);

  async function handleBuy(type) {
    if (!user) { navigate("/login"); return; }
    setLoading(true);
    setBuyType(type);
    try {
      var res = await API.post("/subscription/create-invoice", { type });
      setInvoice(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "QPay холбогдоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  var currentPlan = isAdmin ? "admin" : (usage?.plan || "free");

  return (
    <Layout>
      <div className="p-5 md:p-6 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Үнийн мэдээлэл</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Хэрэгцээндээ тохирсон эрхийг сонгоорой</p>
          {currentPlan !== "free" && (
            <span className={"mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold " + (isAdmin ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400" : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400")}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {isAdmin ? "Админ — хязгааргүй" : "Pro эрхтэй"}
              {usage?.plan_expires && !isAdmin && (
                <span className="text-xs font-normal opacity-70 ml-1">· {new Date(usage.plan_expires).toLocaleDateString("mn-MN")} хүртэл</span>
              )}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Free card */}
          <div className={"bg-white dark:bg-gray-800 border rounded-2xl shadow-sm overflow-hidden " + (currentPlan === "free" ? "border-violet-300 dark:border-violet-700 ring-2 ring-violet-200 dark:ring-violet-900" : "border-gray-100 dark:border-gray-700")}>
            <div className="p-6">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Үнэгүй</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold text-gray-800 dark:text-gray-200">₮0</span>
                <span className="text-gray-400 text-sm">/ сар</span>
              </div>
              {currentPlan === "free" && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                  Одоогийн эрх
                </span>
              )}
            </div>
            <div className="px-6 pb-6 space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2"><Check /><span>CV үүсгэх — хязгааргүй</span></div>
              <div className="flex items-start gap-2"><Check /><span>AI ашиглалт — 15 удаа/сар</span></div>
              <div className="flex items-start gap-2"><Check /><span>Орчуулга — 5 удаа/сар</span></div>
              <div className="flex items-start gap-2"><Cross /><span className="text-gray-400 dark:text-gray-500">Cover letter</span></div>
              <div className="flex items-start gap-2"><Cross /><span className="text-gray-400 dark:text-gray-500">Watermark-гүй PDF</span></div>
            </div>
            <div className="px-6 pb-6">
              <div className="w-full py-2.5 border border-gray-200 dark:border-gray-600 text-center text-sm text-gray-400 dark:text-gray-500 rounded-xl cursor-default">
                {currentPlan === "free" ? "Идэвхтэй" : "Үнэгүй эхлэх"}
              </div>
            </div>
          </div>

          {/* Pro card */}
          <div className={"bg-white dark:bg-gray-800 border rounded-2xl shadow-sm overflow-hidden relative " + (currentPlan === "pro" ? "border-violet-400 dark:border-violet-600 ring-2 ring-violet-200 dark:ring-violet-900" : "border-violet-200 dark:border-violet-800")}>
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Санал болгох</span>
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Pro</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold text-gray-800 dark:text-gray-200">₮5,900</span>
                <span className="text-gray-400 text-sm">/ сар</span>
              </div>
              {currentPlan === "pro" && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                  Одоогийн эрх
                </span>
              )}
            </div>
            <div className="px-6 pb-6 space-y-2.5 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2"><Check /><span>CV үүсгэх — хязгааргүй</span></div>
              <div className="flex items-start gap-2"><Check /><span><strong>AI ашиглалт — 80 удаа/сар</strong></span></div>
              <div className="flex items-start gap-2"><Check /><span><strong>Орчуулга — 40 удаа/сар</strong></span></div>
              <div className="flex items-start gap-2"><Check /><span><strong>Cover letter</strong></span></div>
              <div className="flex items-start gap-2"><Check /><span><strong>Watermark-гүй PDF</strong></span></div>
            </div>
            <div className="px-6 pb-6">
              {isAdmin ? (
                <div className="w-full py-2.5 border border-violet-200 dark:border-violet-700 text-center text-sm text-violet-400 rounded-xl">Админ — хязгааргүй</div>
              ) : currentPlan === "pro" ? (
                <button
                  onClick={function () { handleBuy("pro"); }}
                  disabled={loading && buyType === "pro"}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full text-sm font-semibold hover:shadow-md disabled:opacity-50 transition"
                >
                  {loading && buyType === "pro" ? "Холбогдож байна..." : "Сунгах — QPay"}
                </button>
              ) : (
                <button
                  onClick={function () { handleBuy("pro"); }}
                  disabled={loading && buyType === "pro"}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full text-sm font-semibold hover:shadow-md disabled:opacity-50 transition"
                >
                  {loading && buyType === "pro" ? "Холбогдож байна..." : "Pro авах — QPay"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Extra Pack — Pro users only */}
        {(isPro || isAdmin) && !isAdmin && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-base font-bold text-amber-800 dark:text-amber-300">Extra Pack</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">Энэ сарын лимит дуусвал нэмж авах боломжтой</p>
                <div className="flex gap-4 mt-3 text-sm text-gray-700 dark:text-gray-300">
                  <span>✓ +20 AI генерац</span>
                  <span>✓ +10 орчуулга</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-2xl font-bold text-amber-800 dark:text-amber-300">₮3,900</span>
                <button
                  onClick={function () { handleBuy("extra_pack"); }}
                  disabled={loading && buyType === "extra_pack"}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-semibold hover:shadow-md disabled:opacity-50 transition whitespace-nowrap"
                >
                  {loading && buyType === "extra_pack" ? "Холбогдож байна..." : "Авах — QPay"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI credit explanation */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">AI кредит яаж тооцогдох вэ?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="font-semibold text-gray-700 dark:text-gray-300">CV / Тэтгэлэг AI</p>
              <p className="mt-1">1 секц = <strong>1 кредит</strong></p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="font-semibold text-gray-700 dark:text-gray-300">CV Анализ</p>
              <p className="mt-1">1 PDF = <strong>1 кредит</strong></p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Ярилцлага AI</p>
              <p className="mt-1">1 сессэ = <strong>3 кредит</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* QPay QR Modal */}
      {invoice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 text-center">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                {invoice.type === "pro" ? "Pro эрх" : "Extra Pack"} — ₮{invoice.amount?.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">QPay апп-аар QR уншуулна уу</p>
            </div>
            <div className="p-6 text-center space-y-4">
              {invoice.qr_image ? (
                <img src={`data:image/png;base64,${invoice.qr_image}`} alt="QPay QR" className="w-48 h-48 mx-auto rounded-xl border border-gray-200 dark:border-gray-600" />
              ) : (
                <div className="w-48 h-48 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <p className="text-xs text-gray-400 px-3 text-center break-all">{invoice.qr_text || "QR код байхгүй"}</p>
                </div>
              )}
              {invoice.urls?.length > 0 && (
                <div className="flex gap-2">
                  {invoice.urls.map(function (u, i) {
                    return (
                      <a key={i} href={u.link} target="_blank" rel="noreferrer"
                        className="flex-1 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-600 dark:text-gray-400 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        {u.name || "Апп нээх"}
                      </a>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-gray-400">Төлбөр амжилттай болсны дараа хуудсыг шинэчилнэ үү.</p>
              <button onClick={function () { setInvoice(null); setBuyType(null); }}
                className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
