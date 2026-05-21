import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

var ADMIN_TABS = [
  { to: "/admin/dashboard",   label: "Самбар" },
  { to: "/admin/users",       label: "Хэрэглэгчид" },
  { to: "/admin/interview",   label: "Ярилцлага" },
  { to: "/admin/advice",      label: "Зөвлөмж" },
  { to: "/admin/scholarship", label: "Тэтгэлэг" },
  { to: "/admin/feedback",    label: "CV Үнэлгээ" },
];

var TEMPLATE_LABELS = {
  modern:          "Монгол стандарт",
  classic:         "Ази загвар",
  minimal:         "Европ загвар",
  "United States": "🇺🇸 АНУ тэтгэлгийн CV",
  "Australia":     "🇦🇺 Австрали тэтгэлгийн CV",
  "Japan":         "🇯🇵 Япон тэтгэлгийн CV",
};

var TEMPLATES = Object.keys(TEMPLATE_LABELS);
var STAR_LABELS = ["", "Муу", "Дунд", "Сайн", "Маш сайн", "Гайхалтай"];

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(function (s) {
        return (
          <span key={s} style={{ color: s <= rating ? "#f59e0b" : "#d1d5db" }}>★</span>
        );
      })}
    </span>
  );
}

var INNER_TABS = ["CV Загварын үнэлгээ", "Системийн санал"];

export default function AdminFeedback() {
  var location = useLocation();
  var [innerTab, setInnerTab] = useState("CV Загварын үнэлгээ");

  // CV template feedback state
  var [summary, setSummary] = useState({});
  var [selectedTemplate, setSelectedTemplate] = useState(null);
  var [feedbacks, setFeedbacks] = useState([]);
  var [loadingList, setLoadingList] = useState(false);

  // System feedback state
  var [sysData, setSysData] = useState(null);
  var [sysLoading, setSysLoading] = useState(false);

  useEffect(function () {
    API.get("/feedback/cv-template/summary")
      .then(function (res) { setSummary(res.data); })
      .catch(function () { toast.error("Мэдээлэл ачаалахад алдаа"); });
  }, []);

  useEffect(function () {
    if (innerTab !== "Системийн санал") return;
    setSysLoading(true);
    API.get("/feedback/system/admin")
      .then(function (res) { setSysData(res.data); })
      .catch(function () { toast.error("Системийн санал ачаалахад алдаа"); })
      .finally(function () { setSysLoading(false); });
  }, [innerTab]);

  function handleSelectTemplate(tmpl) {
    if (selectedTemplate === tmpl) { setSelectedTemplate(null); return; }
    setSelectedTemplate(tmpl);
    setLoadingList(true);
    API.get("/feedback/cv-template/list", { params: { template_type: tmpl } })
      .then(function (res) { setFeedbacks(res.data); })
      .catch(function () { toast.error("Feedback ачаалахад алдаа"); })
      .finally(function () { setLoadingList(false); });
  }

  var starLabels = ["", "Муу", "Дунд", "Сайн", "Маш сайн", "Гайхалтай"];

  return (
    <Layout>
      <div className="p-5 md:p-6 space-y-6">

        {/* Admin tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mx-5 px-5 md:-mx-6 md:px-6 overflow-x-auto scrollbar-hide">
          {ADMIN_TABS.map(function (tab) {
            var active = location.pathname === tab.to;
            return (
              <Link key={tab.to} to={tab.to}
                className={"flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap " +
                  (active
                    ? "border-violet-600 text-violet-700 dark:text-violet-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200")}>
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Үнэлгээ &amp; Санал хүсэлт</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Хэрэглэгчдийн өгсөн үнэлгээ болон санал хүсэлт</p>
        </div>

        {/* Inner tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {INNER_TABS.map(function (tab) {
            var active = innerTab === tab;
            return (
              <button key={tab} onClick={function () { setInnerTab(tab); }}
                className={"flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap " +
                  (active
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600")}>
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── CV Template Feedback ─────────────────────────────── */}
        {innerTab === "CV Загварын үнэлгээ" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TEMPLATES.map(function (tmpl) {
                var info = summary[tmpl];
                var isSelected = selectedTemplate === tmpl;
                return (
                  <button
                    key={tmpl}
                    onClick={function () { handleSelectTemplate(tmpl); }}
                    className={"text-left p-4 rounded-xl border-2 transition " + (isSelected
                      ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-700")}
                  >
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 leading-tight">
                      {TEMPLATE_LABELS[tmpl]}
                    </p>
                    {info ? (
                      <>
                        <Stars rating={Math.round(info.avg)} />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {info.avg.toFixed(1)} / 5 · {info.count} үнэлгээ
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Үнэлгээ байхгүй</p>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedTemplate && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {TEMPLATE_LABELS[selectedTemplate]} — дэлгэрэнгүй санал
                  </h2>
                  <button
                    onClick={function () { setSelectedTemplate(null); }}
                    className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition text-base"
                  >✕</button>
                </div>
                {loadingList ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 dark:text-gray-500 text-sm">Санал байхгүй байна</div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {feedbacks.map(function (fb, i) {
                      return (
                        <div key={i} className="px-5 py-4">
                          <div className="flex items-start justify-between gap-4 mb-1">
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{fb.user_name || "—"}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{fb.user_email}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <Stars rating={fb.rating} />
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{STAR_LABELS[fb.rating]}</p>
                            </div>
                          </div>
                          {fb.created_at && (
                            <p className="text-xs text-gray-300 dark:text-gray-600 mb-2">
                              {new Date(fb.created_at).toLocaleString("mn-MN")}
                            </p>
                          )}
                          {(fb.pros || fb.cons) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                              {fb.pros && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg px-3 py-2">
                                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">👍 Сайн тал</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{fb.pros}</p>
                                </div>
                              )}
                              {fb.cons && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-3 py-2">
                                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">👎 Сайжруулах тал</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{fb.cons}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── System Feedback ──────────────────────────────────── */}
        {innerTab === "Системийн санал" && (
          <>
            {sysLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !sysData ? null : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Нийт санал</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sysData.total}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Дундаж үнэлгээ</p>
                    <p className="text-2xl font-bold text-amber-500">
                      {sysData.avg_rating ? sysData.avg_rating.toFixed(1) : "—"}
                      <span className="text-sm text-gray-400 ml-1">/ 5</span>
                    </p>
                  </div>
                  {Object.entries(sysData.by_category || {}).map(function (entry) {
                    var catLabels = { general: "Ерөнхий", cv: "CV", interview: "Ярилцлага", scholarship: "Тэтгэлэг", other: "Бусад" };
                    return (
                      <div key={entry[0]} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{catLabels[entry[0]] || entry[0]}</p>
                        <p className="text-2xl font-bold text-violet-600">{entry[1]}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Feedback list */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Саналын жагсаалт</h2>
                  </div>
                  {sysData.items.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm">Санал хүсэлт байхгүй байна</div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {sysData.items.map(function (fb) {
                        return (
                          <div key={fb.id} className="px-5 py-4">
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{fb.user_name || "—"}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{fb.user_email || "нэвтрээгүй"}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <Stars rating={fb.rating} />
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{starLabels[fb.rating]}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-block px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs rounded-full font-medium">
                                {fb.category_label}
                              </span>
                              {fb.created_at && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {new Date(fb.created_at).toLocaleString("mn-MN")}
                                </span>
                              )}
                            </div>
                            {fb.message && (
                              <p className="text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 whitespace-pre-line">
                                {fb.message}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

      </div>
    </Layout>
  );
}
