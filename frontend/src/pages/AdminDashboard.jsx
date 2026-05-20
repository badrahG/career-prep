import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

var CATEGORY_MN = {
  general: "Ерөнхий",
  technical: "Техникийн",
  behavioral: "Зан үйлийн",
  cv: "CV зөвлөмж",
  interview: "Ярилцлага",
  job_search: "Ажил хайлт",
  career: "Карьер",
  modern: "Монгол стандарт",
  classic: "Ази загвар",
  minimal: "Европ загвар",
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
  { to: "/admin/users",       label: "Хэрэглэгчид",        icon: "👥", desc: "Эрх, төлөв удирдах" },
  { to: "/admin/interview",   label: "Ярилцлагын асуулт",  icon: "🎯", desc: "Асуулт нэмэх, засах" },
  { to: "/admin/advice",      label: "Зөвлөмжүүд",         icon: "💡", desc: "Нийтлэл удирдах" },
  { to: "/admin/scholarship", label: "Тэтгэлгүүд",         icon: "🎓", desc: "Тэтгэлэг нэмэх, засах" },
  { to: "/admin/feedback",    label: "CV Үнэлгээ",         icon: "⭐", desc: "Загварын үнэлгээ, санал" },
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

function KpiCard({ label, value, sub, color, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className={"text-3xl font-bold " + (color || "text-gray-900 dark:text-gray-100")}>{value ?? "—"}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  );
}

function MiniDonut({ items, colors }) {
  if (!items || items.length === 0) return <p className="text-sm text-gray-400 dark:text-gray-500">Өгөгдөл байхгүй</p>;
  var total = items.reduce(function (s, x) { return s + x.count; }, 0);
  if (total === 0) return <p className="text-sm text-gray-400 dark:text-gray-500">Өгөгдөл байхгүй</p>;
  return (
    <div className="space-y-2">
      {items.map(function (item, i) {
        var pct = Math.round((item.count / total) * 100);
        return (
          <div key={i}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-gray-700 dark:text-gray-300">{CATEGORY_MN[item.category || item.template] || item.category || item.template}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{item.count} <span className="text-gray-400 dark:text-gray-500 font-normal">({pct}%)</span></span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: pct + "%", background: colors[i % colors.length] }} />
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
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mx-5 px-5 md:-mx-6 md:px-6 mb-2">
          {ADMIN_TABS.map(function (tab) {
            var active = location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
            return (
              <Link key={tab.to} to={tab.to}
                className={"px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition " +
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
            {/* KPI row 1 */}
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Хэрэглэгчид</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <KpiCard label="Нийт" value={c?.users} />
                <KpiCard label="Идэвхтэй" value={c?.active_users} color="text-emerald-700"
                  sub={c ? Math.round(c.active_users / (c.users || 1) * 100) + "%" : ""} />
                <KpiCard label="Түр хаагдсан" value={c?.suspended_users} color="text-red-600" />
                <KpiCard label="Баталгаажаагүй" value={c?.unverified} color="text-amber-600" />
                <KpiCard label="Админ" value={c?.admins} color="text-violet-700" />
              </div>
            </div>

            {/* KPI row 2 */}
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Агуулга</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard label="CV нийт" value={c?.cvs} color="text-purple-700"
                  sub={c ? (c.users > 0 ? (c.cvs / c.users).toFixed(1) + " / хэрэглэгч" : "") : ""} />
                <KpiCard label="Тэтгэлэг" value={c?.scholarships} color="text-blue-700" />
                <KpiCard label="Ярилцлагын асуулт" value={c?.interview_questions} color="text-teal-700" />
                <KpiCard label="Зөвлөмж нийтлэл" value={c?.published_advice} color="text-orange-600"
                  sub={c ? "Нийт " + c.advice : ""} />
              </div>
            </div>

            {/* KPI row 3 */}
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Идэвхжилт</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <KpiCard label="Quiz дүн нийт" value={c?.quiz_results} color="text-indigo-700" icon="" />
                <KpiCard label="Тэтгэлэг хадгалсан" value={c?.bookmarks} color="text-pink-600" icon="" />
                <KpiCard label="30 хоногт бүртгэл" color="text-gray-700" icon=""
                  value={data?.daily_registrations?.reduce(function (s, d) { return s + d.count; }, 0)} />
              </div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Шинэ бүртгэл</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Сүүлийн 30 хоног</span>
                </div>
                <p className="text-2xl font-bold text-violet-700 mb-3">
                  {data?.daily_registrations?.reduce(function (s, d) { return s + d.count; }, 0)}
                </p>
                <BarChart data={data?.daily_registrations} color="#7C3AED" />
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                  <span>{data?.daily_registrations?.[0]?.date?.slice(5)}</span>
                  <span>{data?.daily_registrations?.[29]?.date?.slice(5)}</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Шинэ CV</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Сүүлийн 30 хоног</span>
                </div>
                <p className="text-2xl font-bold text-purple-700 mb-3">
                  {data?.daily_cvs?.reduce(function (s, d) { return s + d.count; }, 0)}
                </p>
                <BarChart data={data?.daily_cvs} color="#7c3aed" />
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                  <span>{data?.daily_cvs?.[0]?.date?.slice(5)}</span>
                  <span>{data?.daily_cvs?.[29]?.date?.slice(5)}</span>
                </div>
              </div>
            </div>

            {/* Breakdown cards */}
            <div className="grid md:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">CV загварчлал</p>
                <MiniDonut items={data?.cv_by_template?.map(function (x) { return { category: x.template, count: x.count }; })}
                  colors={["#7C3AED", "#7c3aed", "#0891b2"]} />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Ярилцлагын асуулт</p>
                <MiniDonut items={data?.questions_by_category}
                  colors={["#0d9488", "#0891b2", "#6366f1"]} />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Зөвлөмж ангилал</p>
                <MiniDonut items={data?.advice_by_category}
                  colors={["#ea580c", "#d97706", "#16a34a", "#7c3aed"]} />
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
                    return (
                      <Link key={s.id} to={"/scholarship/" + s.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition block">
                        <div className={"flex-shrink-0 w-10 text-center rounded-lg py-1 " + (daysLeft <= 7 ? "bg-red-50" : daysLeft <= 30 ? "bg-amber-50" : "bg-blue-50")}>
                          <p className={"text-lg font-bold leading-none " + (daysLeft <= 7 ? "text-red-600" : daysLeft <= 30 ? "text-amber-600" : "text-blue-700")}>{daysLeft}</p>
                          <p className={"text-xs " + (daysLeft <= 7 ? "text-red-400" : daysLeft <= 30 ? "text-amber-400" : "text-blue-400")}>хоног</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{s.organization || "—"} · {s.deadline}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Хурдан холбоос</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ADMIN_LINKS.map(function (link) {
                  return (
                    <Link key={link.to} to={link.to}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition group">
                      <p className="text-2xl mb-2">{link.icon}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-violet-700 dark:group-hover:text-violet-400">{link.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{link.desc}</p>
                    </Link>
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
