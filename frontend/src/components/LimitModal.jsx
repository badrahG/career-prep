import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function LimitModal() {
  var [visible, setVisible] = useState(false);
  var [info, setInfo] = useState(null);   // { code, plan, used, limit }
  var [invoice, setInvoice] = useState(null);  // { qr_image, qr_text, amount, type }
  var [loading, setLoading] = useState(false);
  var navigate = useNavigate();

  useEffect(function () {
    function onLimit(e) {
      setInfo(e.detail);
      setInvoice(null);
      setVisible(true);
    }
    window.addEventListener("limitExceeded", onLimit);
    return function () { window.removeEventListener("limitExceeded", onLimit); };
  }, []);

  function close() {
    setVisible(false);
    setInfo(null);
    setInvoice(null);
  }

  async function handleBuy(type) {
    setLoading(true);
    try {
      var res = await API.post("/subscription/create-invoice", { type });
      setInvoice({ ...res.data, type });
    } catch (err) {
      toast.error(err.response?.data?.detail || "QPay холбогдоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  function handleGoToPricing() {
    close();
    navigate("/pricing");
  }

  if (!visible) return null;

  var isAi = info?.code === "ai_limit_exceeded";
  var isPro = info?.plan === "pro";
  var title = isAi ? "AI генерацийн лимит дууслаа" : "Орчуулгын лимит дууслаа";
  var subtitle = isAi
    ? `${info?.used || 0}/${info?.limit || 0} ашигласан`
    : `${info?.used || 0}/${info?.limit || 0} орчуулга ашигласан`;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">

        {!invoice ? (
          <>
            <div className="p-6 text-center border-b border-gray-100 dark:border-gray-700">
              <div className="w-14 h-14 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            </div>

            <div className="p-6 space-y-3">
              {!isPro ? (
                <>
                  <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-semibold text-violet-700 dark:text-violet-400 mb-1">Pro эрх авах</p>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>✓ AI ашиглалт: 80 удаа/сар</li>
                      <li>✓ Орчуулга: 40 удаа/сар</li>
                      <li>✓ Cover letter</li>
                      <li>✓ Watermark-гүй PDF</li>
                    </ul>
                    <p className="mt-2 font-bold text-violet-700 dark:text-violet-400 text-base">₮5,900 / сар</p>
                  </div>
                  <button
                    onClick={function () { handleBuy("pro"); }}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full font-semibold text-sm hover:shadow-lg disabled:opacity-50 transition"
                  >
                    {loading ? "Холбогдож байна..." : "Pro авах — QPay"}
                  </button>
                  <button onClick={handleGoToPricing} className="w-full py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
                    Үнийн мэдээлэл харах
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">Extra Pack авах</p>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>✓ +20 AI генерац</li>
                      <li>✓ +10 орчуулга</li>
                      <li>✓ Хэдэн ч удаа авах боломжтой</li>
                    </ul>
                    <p className="mt-2 font-bold text-amber-700 dark:text-amber-400 text-base">₮3,900</p>
                  </div>
                  <button
                    onClick={function () { handleBuy("extra_pack"); }}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold text-sm hover:shadow-lg disabled:opacity-50 transition"
                  >
                    {loading ? "Холбогдож байна..." : "Extra Pack авах — QPay"}
                  </button>
                </>
              )}
              <button onClick={close} className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                Дараа
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 text-center border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                {invoice.type === "pro" ? "Pro эрх" : "Extra Pack"} — ₮{invoice.amount?.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">QPay апп-аар QR уншуулна уу</p>
            </div>
            <div className="p-6 text-center space-y-4">
              {invoice.qr_image ? (
                <img
                  src={`data:image/png;base64,${invoice.qr_image}`}
                  alt="QPay QR"
                  className="w-48 h-48 mx-auto rounded-xl border border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-48 h-48 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <p className="text-xs text-gray-400 px-4 text-center break-all">{invoice.qr_text || "QR код байхгүй"}</p>
                </div>
              )}
              <div className="flex gap-2">
                {invoice.urls?.map(function (u, i) {
                  return (
                    <a key={i} href={u.link} target="_blank" rel="noreferrer"
                      className="flex-1 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-600 dark:text-gray-400 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      {u.name || "Апп нээх"}
                    </a>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400">Төлбөр амжилттай болсны дараа хуудсыг шинэчилнэ үү.</p>
              <button onClick={close} className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                Хаах
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
