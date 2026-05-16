import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={function () { onChange(!checked); }}
      className={"relative w-11 h-6 rounded-full transition-colors flex-shrink-0 " + (checked ? "bg-violet-500" : "bg-gray-200 dark:bg-gray-700")}
    >
      <span className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform " + (checked ? "translate-x-5" : "translate-x-0")} />
    </button>
  );
}

const TABS = [
  { id: "notifications", label: "Мэдэгдэл",    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { id: "app",           label: "Апп",          icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "privacy",       label: "Нууцлал",      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
  { id: "account",       label: "Бүртгэл",      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const NOTIF_ITEMS = [
  { key: "scholarship_new",      label: "Шинэ тэтгэлэг",        desc: "Шинэ тэтгэлэг нэмэгдэх үед мэдэгдэх" },
  { key: "scholarship_deadline", label: "Тэтгэлгийн хугацаа",   desc: "Дуусах хугацаанаас 7 хоногийн өмнө сануулах" },
  { key: "interview_new",        label: "Ярилцлагын асуулт",    desc: "Шинэ асуулт нэмэгдэх үед мэдэгдэх" },
  { key: "advice_new",           label: "Шинэ зөвлөмж",         desc: "Шинэ зөвлөмж нэмэгдэх үед мэдэгдэх" },
];

function timeAgo(dateStr) {
  if (!dateStr) return "";
  var diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Дөнгөж сая";
  if (diff < 3600) return Math.floor(diff / 60) + " мин өмнө";
  if (diff < 86400) return Math.floor(diff / 3600) + " цаг өмнө";
  if (diff < 604800) return Math.floor(diff / 86400) + " өдөр өмнө";
  return new Date(dateStr).toLocaleDateString("mn-MN");
}

export default function Settings() {
  var [tab, setTab] = useState("notifications");
  var [prefs, setPrefs] = useState({ scholarship_new: true, scholarship_deadline: true, interview_new: true, advice_new: true });
  var [prefsSaving, setPrefsSaving] = useState(false);
  var [loginHistory, setLoginHistory] = useState([]);
  var [historyLoading, setHistoryLoading] = useState(false);
  var [deleteConfirm, setDeleteConfirm] = useState(false);
  var { theme, toggle } = useTheme();
  var { logout } = useAuth();

  useEffect(function () {
    API.get("/auth/settings")
      .then(function (r) { if (r.data.notification_prefs) setPrefs(r.data.notification_prefs); })
      .catch(function () {});
  }, []);

  useEffect(function () {
    if (tab !== "account") return;
    setHistoryLoading(true);
    API.get("/auth/login-history")
      .then(function (r) { setLoginHistory(r.data || []); })
      .catch(function () {})
      .finally(function () { setHistoryLoading(false); });
  }, [tab]);

  function savePrefs() {
    setPrefsSaving(true);
    API.put("/auth/settings", prefs)
      .then(function () { toast.success("Хадгалагдлаа"); })
      .catch(function () { toast.error("Алдаа гарлаа"); })
      .finally(function () { setPrefsSaving(false); });
  }

  function deleteAccount() {
    API.delete("/auth/me")
      .then(function () { logout(); window.location.href = "/login"; })
      .catch(function () { toast.error("Алдаа гарлаа"); });
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Тохиргоо</h1>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {TABS.map(function (t) {
            var active = tab === t.id;
            return (
              <button key={t.id} onClick={function () { setTab(t.id); }}
                className={"flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition " +
                  (active
                    ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")}>
                <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                </svg>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Мэдэгдлийн тохиргоо */}
        {tab === "notifications" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Мэдэгдлийн тохиргоо</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Ямар мэдэгдэл хүлээн авахаа сонгоно уу</p>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {NOTIF_ITEMS.map(function (item) {
                return (
                  <div key={item.key} className="flex items-center justify-between px-5 py-4 gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={!!prefs[item.key]}
                      onChange={function (val) { setPrefs(function (p) { return { ...p, [item.key]: val }; }); }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={savePrefs}
                disabled={prefsSaving}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60"
              >
                {prefsSaving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </div>
        )}

        {/* Апп тохиргоо */}
        {tab === "app" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Апп тохиргоо</h2>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Дэлгэцийн горим</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {theme === "dark" ? "Шөнийн горим идэвхтэй байна" : "Өдрийн горим идэвхтэй байна"}
                  </p>
                </div>
                <button
                  onClick={toggle}
                  className={"flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition " +
                    (theme === "dark"
                      ? "border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100")}
                >
                  {theme === "dark" ? (
                    <>
                      <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Өдрийн горим
                    </>
                  ) : (
                    <>
                      <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Шөнийн горим
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Нууцлал */}
        {tab === "privacy" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Нууцлалын мэдээлэл</h2>
            </div>
            <div className="px-5 py-5 space-y-5">
              {[
                {
                  color: "#3B82F6", bg: "#EFF6FF", dbg: "#1E3A5F",
                  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                  label: "Өгөгдлийн аюулгүй байдал",
                  desc: "Таны мэдээлэл шифрлэгдсэн байдлаар хадгалагдах бөгөөд гуравдагч этгээдтэй хуваалцагддаггүй.",
                },
                {
                  color: "#7C3AED", bg: "#EDE9FE", dbg: "#2E1065",
                  icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
                  label: "Хадгалагдах мэдээлэл",
                  desc: "CV, Quiz дүн, Flashcard, тэтгэлгийн checklist болон нэвтрэлтийн түүх хадгалагддаг.",
                },
                {
                  color: "#10B981", bg: "#ECFDF5", dbg: "#064E3B",
                  icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                  label: "И-мэйл харилцаа",
                  desc: "Зөвхөн хугацаа дуусах сануулга болон системийн чухал мэдэгдэл илгээгдэнэ.",
                },
              ].map(function (item) {
                return (
                  <div key={item.label} className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                      <svg width={17} height={17} fill="none" stroke={item.color} strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Бүртгэл */}
        {tab === "account" && (
          <div className="space-y-4">
            {/* Login history */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Нэвтрэлтийн түүх</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Сүүлийн 10 нэвтрэлт</p>
              </div>
              {historyLoading ? (
                <div className="flex items-center justify-center h-20">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : loginHistory.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">Нэвтрэлтийн түүх байхгүй байна</div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {loginHistory.map(function (log, i) {
                    return (
                      <div key={i} className="flex items-center justify-between px-5 py-3 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="text-gray-400 dark:text-gray-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{log.ip_address || "Тодорхойгүй"}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">IP хаяг</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">{timeAgo(log.created_at)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Danger zone */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900/40 overflow-hidden">
              <div className="px-5 py-4 border-b border-red-100 dark:border-red-900/40">
                <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Аюултай бүс</h2>
              </div>
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Бүртгэл устгах</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Бүртгэл устгасан тохиолдолд бүх мэдээлэл устна. Буцааж сэргээх боломжгүй.</p>
                </div>
                <button
                  onClick={function () { setDeleteConfirm(true); }}
                  className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  Устгах
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete account confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={function () { setDeleteConfirm(false); }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-xs p-6"
            onClick={function (e) { e.stopPropagation(); }}>
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 text-center mb-1">Бүртгэл устгах уу?</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center mb-6">Энэ үйлдлийг буцааж болохгүй. Таны бүх мэдээлэл бүрмөсөн устна.</p>
            <div className="flex gap-2">
              <button
                onClick={function () { setDeleteConfirm(false); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Буцах
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition"
              >
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
