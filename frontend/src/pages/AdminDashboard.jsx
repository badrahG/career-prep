import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

var CATEGORY_MN = {
  general: "Ерөнхий",
  technical: "Техникийн",
  behavioral: "Зан төлөвийн",
  cv: "CV зөвлөмж",
  interview: "Ярилцлага",
  job_search: "Ажил хайлт",
  career: "Карьер",
  modern: "Монгол хэв маяг",
  classic: "Ази хэв маяг",
  minimal: "Европ хэв маяг",
};

var ACTION_MN = {
  login: "Нэвтэрсэн",
  password_change: "Нууц үг солисон",
  profile_update: "Профайл шинэчилсэн",
  account_delete: "Бүртгэл устгасан",
  register: "Бүртгүүлсэн",
};

var ACTION_COLOR = {
  login: "bg-emerald-50 text-emerald-700 border-emerald-200",
  register: "bg-blue-50 text-blue-700 border-blue-200",
  password_change: "bg-amber-50 text-amber-700 border-amber-200",
  account_delete: "bg-red-50 text-red-700 border-red-200",
  profile_update: "bg-gray-50 text-gray-700 border-gray-200",
};

var ADMIN_TABS = [
  { to: "/admin/dashboard", label: "Самбар" },
  { to: "/admin/users",     label: "Хэрэглэгчид" },
  { to: "/admin/interview", label: "Ярилцлага" },
  { to: "/admin/advice",    label: "Зөвлөмж" },
  { to: "/admin/scholarship", label: "Тэтгэлэг" },
  { to: "/admin/feedback",  label: "CV Үнэлгээ" },
];

var ADMIN_LINKS = [
  { to: "/admin/users",       label: "Хэрэглэгчид",       desc: "Эрх, төлөв удирдах" },
  { to: "/admin/interview",   label: "Ярилцлагын асуулт", desc: "Асуулт нэмэх, засах" },
  { to: "/admin/advice",      label: "Зөвлөмжүүд",        desc: "Нийтлэл удирдах" },
  { to: "/admin/scholarship", label: "Тэтгэлгүүд",        desc: "Тэтгэлэг нэмэх, засах" },
  { to: "/admin/feedback",    label: "CV Үнэлгээ",        desc: "Загварын үнэлгээ, санал" },
];

function BarChart({ data, color }) {
  if (!data || data.length === 0) return null;
  var max = Math.max.apply(null, data.map(function (d) { return d.count; }));
  if (max === 0) max = 1;
  var W = 600, H = 64, gap = 2;
  var barW = (W - (data.length - 1) * gap) / data.length;
  return (
    <svg viewBox={"0 0 " + W + " " + H} className="w-full" style={{ height: 64 }}>
      {data.map(function (d, i) {
        var h = d.count > 0 ? Math.max((d.count / max) * (H - 4), 3) : 0;
        return (
          <rect key={i} x={i * (barW + gap)} y={H - h}
            width={barW} height={h || 1}
            fill={color} opacity={d.count > 0 ? 0.72 : 0.1} rx={1} />
        );
      })}
    </svg>
  );
}

function StatItem({ label, value, sub, color }) {
  return (
    <div className="min-w-[56px]">
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-0.5 whitespace-nowrap">{label}</p>
      <p className={"text-xl font-medium leading-none " + (color || "text-gray-500 dark:text-gray-400")}>{value ?? "—"}</p>
      {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniDonut({ items }) {
  if (!items || items.length === 0) return <p className="text-sm text-gray-400 dark:text-gray-500">Өгөгдөл байхгүй</p>;
  var total = items.reduce(function (s, x) { return s + x.count; }, 0);
  if (total === 0) return <p className="text-sm text-gray-400 dark:text-gray-500">Өгөгдөл байхгүй</p>;
  return (
    <div className="space-y-2.5">
      {items.map(function (item, i) {
        var pct = Math.round((item.count / total) * 100);
        return (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400">{CATEGORY_MN[item.category || item.template] || item.category || item.template}</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{item.count} <span className="text-gray-400 font-normal">· {pct}%</span></span>
            </div>
            <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: pct + "%", backgroundColor: "#7c3aed", opacity: 0.7 + i * 0.1 > 1 ? 1 : 0.7 + i * 0.1 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  var location = useLocation();
  var [data, setData] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(function () {
    API.get("/admin/dashboard")
      .then(function (res) { setData(res.data); })
      .catch(function () { toast.error("Dashboard ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }, []);

  var c = data?.counts;

  return (
    <Layout>
      <div className="p-5 md:p-6 space-y-6">

        {/* Admin tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mx-5 px-5 md:-mx-6 md:px-6 mb-2 overflow-x-auto scrollbar-hide">
          {ADMIN_TABS.map(function (tab) {
            var active = location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
            return (
              <Link key={tab.to} to={tab.to}
                className={"px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap flex-shrink-0 " +
                  (active ? "border-violet-600 text-violet-700" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200")}>
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Систем хяналтын самбар</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">CareerPrep платформын нэгдсэн статистик</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map(function (_, i) {
              return <div key={i} className="h-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl animate-pulse" />;
            })}
          </div>
        ) : (
          <>
            {/* Stats — нэгдсэн нягт card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="px-4 py-3">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Хэрэглэгчид</p>
                <div className="grid grid-cols-5 gap-3">
                  <StatItem label="Нийт" value={c?.users} />
                  <StatItem label="Идэвхтэй" value={c?.active_users}
                    sub={c ? Math.round(c.active_users / (c.users || 1) * 100) + "%" : ""} />
                  <StatItem label="Хаагдсан" value={c?.suspended_users} color="text-red-600" />
                  <StatItem label="Баталгааж." value={c?.unverified} />
                  <StatItem label="Админ" value={c?.admins} />
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Агуулга</p>
                <div className="grid grid-cols-5 gap-3">
                  <StatItem label="CV нийт" value={c?.cvs}
                    sub={c && c.users > 0 ? (c.cvs / c.users).toFixed(1) + " / хэрэглэгч" : ""} />
                  <StatItem label="PDF таталт" value={data?.total_pdf_exports}
                    sub={c && data?.total_pdf_exports && c.cvs ? (data.total_pdf_exports / c.cvs).toFixed(1) + " / CV" : ""} />
                  <StatItem label="Тэтгэлэг" value={c?.scholarships} />
                  <StatItem label="Ярилцлага" value={c?.interview_questions} />
                  <StatItem label="Зөвлөмж" value={c?.published_advice}
                    sub={c ? "Нийт " + c.advice : ""} />
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Идэвхжилт</p>
                <div className="grid grid-cols-3 gap-3">
                  <StatItem label="Quiz дүн" value={c?.quiz_results} />
                  <StatItem label="Тэтгэлэг хадгалсан" value={c?.bookmarks} />
                  <StatItem label="30 хоногт бүртгэл"
                    value={data?.daily_registrations?.reduce(function (s, d) { return s + d.count; }, 0)} />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Шинэ бүртгэл</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Сүүлийн 30 хоног</span>
                </div>
                <BarChart data={data?.daily_registrations} color="#7C3AED" />
                <div className="flex justify-between text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  <span>{data?.daily_registrations?.[0]?.date?.slice(5)}</span>
                  <span>{data?.daily_registrations?.[29]?.date?.slice(5)}</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Шинэ CV</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Сүүлийн 30 хоног</span>
                </div>
                <BarChart data={data?.daily_cvs} color="#7c3aed" />
                <div className="flex justify-between text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  <span>{data?.daily_cvs?.[0]?.date?.slice(5)}</span>
                  <span>{data?.daily_cvs?.[29]?.date?.slice(5)}</span>
                </div>
              </div>
            </div>

            {/* Breakdown cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">CV загварчлал</p>
                <MiniDonut items={data?.cv_by_template?.map(function (x) { return { category: x.template, count: x.count }; })} />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">PDF таталт загваргаар</p>
                <MiniDonut items={data?.pdf_by_template?.map(function (x) { return { category: x.template, count: x.count }; })} />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Ярилцлагын асуулт</p>
                <MiniDonut items={data?.questions_by_category} />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Зөвлөмж ангилал</p>
                <MiniDonut items={data?.advice_by_category} />
              </div>
            </div>

            {/* Ярилцлагын горимын хэрэглээ + Мэргэжлийн рейтинг + Зөвлөмж */}
            <div className="grid md:grid-cols-3 gap-4">

              {/* Горимын хэрэглээ */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Ярилцлагын горим</p>
                <div className="space-y-3">
                  {[
                    { label: "Flashcard", key: "flashcard", color: "bg-violet-500", sub: "үзэлт", val: data?.mode_usage?.flashcard?.views, users: data?.mode_usage?.flashcard?.users },
                    { label: "Quiz", key: "quiz", color: "bg-blue-500", sub: "тоглолт", val: data?.mode_usage?.quiz?.sessions, users: data?.mode_usage?.quiz?.users },
                    { label: "Дадлага горим", key: "star", color: "bg-emerald-500", sub: "дадлага", val: data?.mode_usage?.star?.sessions, users: data?.mode_usage?.star?.users },
                  ].map(function (m) {
                    var total = (data?.mode_usage?.flashcard?.views || 0) + (data?.mode_usage?.quiz?.sessions || 0) + (data?.mode_usage?.star?.sessions || 0);
                    var pct = total > 0 ? Math.round(((m.val || 0) / total) * 100) : 0;
                    return (
                      <div key={m.key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{m.label}</span>
                          <span className="text-gray-900 dark:text-gray-100 font-semibold">{m.val || 0} <span className="text-gray-400 font-normal">{m.sub} · {m.users || 0} хэрэглэгч</span></span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={"h-full rounded-full " + m.color} style={{ width: pct + "%" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Мэргэжлийн рейтинг */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Мэргэжлийн рейтинг</p>
                {!data?.top_majors?.length ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500">Өгөгдөл байхгүй</p>
                ) : (
                  <div className="space-y-2.5">
                    {(function () {
                      var max = Math.max.apply(null, data.top_majors.map(function (m) { return m.views; }));
                      return data.top_majors.map(function (m, i) {
                        var pct = max > 0 ? Math.round((m.views / max) * 100) : 0;
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400 truncate max-w-[130px]">{m.name}</span>
                              <span className="text-gray-900 dark:text-gray-100 font-semibold flex-shrink-0 ml-2">{m.views}</span>
                            </div>
                            <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-violet-500" style={{ width: pct + "%", opacity: 0.6 + i * 0.05 > 1 ? 1 : 0.6 }} />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Хамгийн их үзэгдсэн зөвлөмж */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Их уншигдсан зөвлөмж</p>
                {!data?.top_advice?.length ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500">Өгөгдөл байхгүй</p>
                ) : (
                  <div className="space-y-2">
                    {data.top_advice.map(function (a) {
                      return (
                        <div key={a.id} className="flex items-center justify-between gap-2">
                          <p className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">{a.title}</p>
                          <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex-shrink-0">{a.view_count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom row */}
            <div className="grid md:grid-cols-3 gap-5">

              {/* Recent users */}
              <div className="md:col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Сүүлийн бүртгэл</p>
                  <Link to="/admin/users" className="text-xs text-violet-600 hover:underline">Бүгдийг харах →</Link>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data?.recent_users?.map(function (u) {
                    return (
                      <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{(u.name || "U").charAt(0)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.email}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {u.role === "admin" && (
                            <span className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-1.5 py-0.5 rounded font-medium">Админ</span>
                          )}
                          {!u.is_verified && (
                            <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">Баталгааж.</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity feed */}
              <div className="md:col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Сүүлийн үйлдэл</p>
                  <Link to="/admin/users" className="text-xs text-violet-600 hover:underline">Бүгдийг харах →</Link>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
                  {data?.recent_logs?.map(function (log) {
                    return (
                      <div key={log.id} className="flex items-start gap-3 px-5 py-2.5">
                        <span className={"text-xs px-1.5 py-0.5 rounded border font-medium flex-shrink-0 mt-0.5 " + (ACTION_COLOR[log.action] || "bg-gray-50 text-gray-600 border-gray-200")}>
                          {ACTION_MN[log.action] || log.action}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{log.user_name || "Устгагдсан"}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{log.created_at ? new Date(log.created_at).toLocaleString("mn-MN") : "—"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming scholarships */}
              <div className="md:col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Ойрын тэтгэлэг</p>
                  <Link to="/admin/scholarship" className="text-xs text-violet-600 hover:underline">Бүгдийг харах →</Link>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {!data?.upcoming_scholarships?.length ? (
                    <p className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">Ойрын тэтгэлэг байхгүй</p>
                  ) : data.upcoming_scholarships.map(function (s) {
                    var deadline = new Date(s.deadline);
                    var today = new Date();
                    var daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                    var urgent = daysLeft <= 7;
                    return (
                      <Link key={s.id} to={"/scholarship/" + s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <div className="flex-shrink-0 text-right w-8">
                          <p className={"text-sm font-bold leading-none " + (urgent ? "text-red-500" : "text-gray-700 dark:text-gray-300")}>{daysLeft}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">хоног</p>
                        </div>
                        <div className={"w-px h-6 flex-shrink-0 " + (urgent ? "bg-red-200" : "bg-gray-200 dark:bg-gray-600")} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{s.organization || "—"} · {s.deadline}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 overflow-x-auto scrollbar-hide">
              <div className="flex items-center justify-between min-w-max w-full gap-2">
                {ADMIN_LINKS.map(function (link, i) {
                  return (
                    <span key={link.to} className="flex items-center gap-2">
                      {i > 0 && <span className="text-gray-200 dark:text-gray-700 select-none text-xs">|</span>}
                      <Link to={link.to}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-700 dark:hover:text-violet-400 transition font-medium whitespace-nowrap">
                        {link.label}
                      </Link>
                    </span>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
