import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import { ListSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";

var ADMIN_TABS = [
  { to: "/admin/dashboard",   label: "Самбар" },
  { to: "/admin/users",       label: "Хэрэглэгчид" },
  { to: "/admin/interview",   label: "Ярилцлага" },
  { to: "/admin/advice",      label: "Зөвлөмж" },
  { to: "/admin/scholarship", label: "Тэтгэлэг" },
  { to: "/admin/feedback",    label: "CV Үнэлгээ" },
];

var ACTION_LABELS = {
  login: "Нэвтэрсэн",
  password_change: "Нууц үг солисон",
  profile_update: "Профайл шинэчилсэн",
  account_delete: "Бүртгэл устгасан",
};

function BarChart({ data, color }) {
  if (!data || data.length === 0) return null;
  var max = Math.max.apply(null, data.map(function (d) { return d.count; }));
  if (max === 0) max = 1;
  var W = 600, H = 72, gap = 2;
  var barW = (W - (data.length - 1) * gap) / data.length;
  return (
    <svg viewBox={"0 0 " + W + " " + H} className="w-full" style={{ height: 72 }}>
      {data.map(function (d, i) {
        var h = d.count > 0 ? Math.max((d.count / max) * (H - 6), 3) : 0;
        return (
          <rect key={i} x={i * (barW + gap)} y={H - h} width={barW} height={h || 2}
            fill={color} opacity={d.count > 0 ? 0.75 : 0.12} rx={1} />
        );
      })}
    </svg>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={"text-2xl font-bold " + (color || "text-gray-900 dark:text-gray-100")}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminUsers() {
  var location = useLocation();
  var { user: me } = useAuth();
  var [activeTab, setActiveTab] = useState("users");
  var [users, setUsers] = useState([]);
  var [stats, setStats] = useState(null);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState("");
  var [roleFilter, setRoleFilter] = useState("all");
  var [statusFilter, setStatusFilter] = useState("all");
  var [logs, setLogs] = useState([]);
  var [logsLoading, setLogsLoading] = useState(false);
  var [selected, setSelected] = useState(new Set());
  var [bulkDeleting, setBulkDeleting] = useState(false);
  var [limitModal, setLimitModal] = useState(null);
  var [limitAI, setLimitAI] = useState("");
  var [limitTR, setLimitTR] = useState("");
  var [limitSaving, setLimitSaving] = useState(false);

  function loadUsers() {
    setLoading(true);
    setSelected(new Set());
    var params = {};
    if (search) params.search = search;
    if (roleFilter !== "all") params.role = roleFilter;
    if (statusFilter !== "all") params.is_active = statusFilter === "active";
    API.get("/admin/users", { params: params })
      .then(function (res) { setUsers(res.data); })
      .catch(function () { toast.error("Хэрэглэгчдийг ачаалахад алдаа"); })
      .finally(function () { setLoading(false); });
  }

  function loadStats() {
    API.get("/admin/stats")
      .then(function (res) { setStats(res.data); })
      .catch(function () {});
  }

  function loadLogs() {
    setLogsLoading(true);
    API.get("/admin/audit-logs", { params: { limit: 100 } })
      .then(function (res) { setLogs(res.data); })
      .catch(function () { toast.error("Лог ачаалахад алдаа"); })
      .finally(function () { setLogsLoading(false); });
  }

  useEffect(function () { loadStats(); }, []);

  useEffect(function () {
    if (activeTab === "logs") loadLogs();
    if (activeTab === "analytics") loadStats();
  }, [activeTab]);

  useEffect(function () {
    if (activeTab !== "users") return;
    var timer = setTimeout(function () { loadUsers(); }, 300);
    return function () { clearTimeout(timer); };
  }, [search, roleFilter, statusFilter, activeTab]);

  function toggleSelectAll() {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map(function (u) { return u.id; })));
    }
  }

  function toggleSelect(id) {
    setSelected(function (prev) {
      var next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function bulkDelete() {
    var ids = Array.from(selected).filter(function (id) { return id !== me?.id; });
    if (ids.length === 0) { toast.error("Устгах хэрэглэгч сонгогдоогүй байна"); return; }
    if (!window.confirm(ids.length + " хэрэглэгчийг бүрмөсөн устгах уу?")) return;
    setBulkDeleting(true);
    API.delete("/admin/users/bulk", { data: { user_ids: ids } })
      .then(function (res) {
        toast.success(res.data.deleted + " хэрэглэгч устгагдлаа");
        loadUsers();
        loadStats();
      })
      .catch(function (err) { toast.error(err.response?.data?.detail || "Алдаа гарлаа"); })
      .finally(function () { setBulkDeleting(false); });
  }

  function exportCsv() {
    API.get("/admin/users/export", { responseType: "blob" })
      .then(function (res) {
        var url = URL.createObjectURL(res.data);
        var a = document.createElement("a");
        a.href = url;
        a.download = "users_" + new Date().toISOString().slice(0, 10) + ".csv";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(function () { toast.error("CSV татахад алдаа гарлаа"); });
  }

  function toggleActive(u) {
    var newStatus = !u.is_active;
    if (!window.confirm(u.last_name + " " + u.first_name + "-н бүртгэлийг " + (newStatus ? "идэвхжүүлэх" : "түр хаах") + " үү?")) return;
    API.put("/admin/users/" + u.id, { is_active: newStatus })
      .then(function () {
        toast.success(newStatus ? "Идэвхжүүллээ" : "Түр хаалаа");
        setUsers(users.map(function (x) { return x.id === u.id ? { ...x, is_active: newStatus } : x; }));
        loadStats();
      })
      .catch(function (err) { toast.error(err.response?.data?.detail || "Алдаа"); });
  }

  function toggleRole(u) {
    var newRole = u.role === "admin" ? "user" : "admin";
    if (!window.confirm(u.last_name + " " + u.first_name + "-г " + (newRole === "admin" ? "Админ" : "Хэрэглэгч") + " болгох уу?")) return;
    API.put("/admin/users/" + u.id, { role: newRole })
      .then(function () {
        toast.success("Эрх өөрчлөгдлөө");
        setUsers(users.map(function (x) { return x.id === u.id ? { ...x, role: newRole } : x; }));
        loadStats();
      })
      .catch(function (err) { toast.error(err.response?.data?.detail || "Алдаа"); });
  }

  function openLimitModal(u) {
    setLimitModal(u);
    setLimitAI(u.custom_ai_limit !== null && u.custom_ai_limit !== undefined ? String(u.custom_ai_limit) : "");
    setLimitTR(u.custom_tr_limit !== null && u.custom_tr_limit !== undefined ? String(u.custom_tr_limit) : "");
  }

  function saveLimits() {
    if (!limitModal) return;
    var aiVal = limitAI.trim() === "" ? null : parseInt(limitAI, 10);
    var trVal = limitTR.trim() === "" ? null : parseInt(limitTR, 10);
    if (aiVal !== null && (isNaN(aiVal) || aiVal < 0)) { toast.error("AI лимит зөв тоо оруулна уу"); return; }
    if (trVal !== null && (isNaN(trVal) || trVal < 0)) { toast.error("Орчуулгын лимит зөв тоо оруулна уу"); return; }
    setLimitSaving(true);
    API.patch("/subscription/admin/users/" + limitModal.id + "/limits", { ai_limit: aiVal, tr_limit: trVal })
      .then(function (res) {
        toast.success("Лимит хадгалагдлаа");
        setUsers(users.map(function (x) {
          return x.id === limitModal.id
            ? { ...x, custom_ai_limit: res.data.custom_ai_limit, custom_tr_limit: res.data.custom_tr_limit }
            : x;
        }));
        setLimitModal(null);
      })
      .catch(function (err) { toast.error(err.response?.data?.detail || "Алдаа гарлаа"); })
      .finally(function () { setLimitSaving(false); });
  }

  function deleteUser(u) {
    if (!window.confirm(u.last_name + " " + u.first_name + "-н бүртгэлийг бүрмөсөн устгах уу? Бүх CV болон өгөгдөл нь устана.")) return;
    API.delete("/admin/users/" + u.id)
      .then(function () {
        toast.success("Хэрэглэгч устгагдлаа");
        setUsers(users.filter(function (x) { return x.id !== u.id; }));
        loadStats();
      })
      .catch(function (err) { toast.error(err.response?.data?.detail || "Алдаа"); });
  }

  var allSelected = users.length > 0 && selected.size === users.length;
  var someSelected = selected.size > 0 && !allSelected;

  var inputCls = "px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition bg-white dark:bg-gray-700 dark:text-gray-100";

  return (
    <Layout>
      <div className="p-5 md:p-6 space-y-6">

        {/* Admin tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mx-5 px-5 md:-mx-6 md:px-6">
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
          <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">Админ</p>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Хэрэглэгчдийн удирдлага</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Бүх хэрэглэгчдийг харах, эрх өөрчлөх, түр хаах, устгах.</p>

          {/* Inner tabs */}
          <div className="flex gap-1 mt-4">
            {["users", "analytics", "logs"].map(function (tab) {
              var labels = { users: "Хэрэглэгчид", analytics: "Аналитик", logs: "Хандалтын лог" };
              return (
                <button key={tab} onClick={function () { setActiveTab(tab); }}
                  className={"px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition " +
                    (activeTab === tab ? "border-violet-600 text-violet-700 bg-violet-50 dark:bg-violet-900/30" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200")}>
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Analytics tab ─────────────────────────────────────────────────── */}
        {activeTab === "analytics" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <StatCard label="Нийт хэрэглэгч" value={stats?.total_users ?? "—"} />
              <StatCard label="Идэвхтэй" value={stats?.active_users ?? "—"} color="text-emerald-700" />
              <StatCard label="Түр хаагдсан" value={stats?.suspended_users ?? "—"} color="text-red-600" />
              <StatCard label="Админ" value={stats?.total_admins ?? "—"} color="text-violet-700" />
              <StatCard label="Нийт CV" value={stats?.total_cvs ?? "—"} color="text-purple-700" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Шинэ бүртгэл</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Сүүлийн 30 хоног</p>
                </div>
                <p className="text-2xl font-bold text-violet-700 mb-3">
                  {stats?.daily_registrations ? stats.daily_registrations.reduce(function (s, d) { return s + d.count; }, 0) : "—"}
                </p>
                <BarChart data={stats?.daily_registrations} color="#7c3aed" />
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {stats?.daily_registrations && (
                    <>
                      <span>{stats.daily_registrations[0]?.date?.slice(5)}</span>
                      <span>{stats.daily_registrations[29]?.date?.slice(5)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Шинэ CV</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Сүүлийн 30 хоног</p>
                </div>
                <p className="text-2xl font-bold text-purple-700 mb-3">
                  {stats?.daily_cvs ? stats.daily_cvs.reduce(function (s, d) { return s + d.count; }, 0) : "—"}
                </p>
                <BarChart data={stats?.daily_cvs} color="#7c3aed" />
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {stats?.daily_cvs && (
                    <>
                      <span>{stats.daily_cvs[0]?.date?.slice(5)}</span>
                      <span>{stats.daily_cvs[29]?.date?.slice(5)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Users tab ─────────────────────────────────────────────────────── */}
        {activeTab === "users" && (
          <>
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Нийт" value={stats.total_users} />
                <StatCard label="Идэвхтэй" value={stats.active_users} color="text-emerald-700" />
                <StatCard label="Түр хаагдсан" value={stats.suspended_users} color="text-red-600" />
                <StatCard label="Нийт CV" value={stats.total_cvs} color="text-violet-700" />
              </div>
            )}

            {/* Search + filters */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  value={search}
                  onChange={function (e) { setSearch(e.target.value); }}
                  placeholder="Нэр, и-мэйлээр хайх..."
                  className={"flex-1 " + inputCls}
                />
                <select value={roleFilter} onChange={function (e) { setRoleFilter(e.target.value); }} className={inputCls}>
                  <option value="all">Бүх эрх</option>
                  <option value="user">Хэрэглэгч</option>
                  <option value="admin">Админ</option>
                </select>
                <select value={statusFilter} onChange={function (e) { setStatusFilter(e.target.value); }} className={inputCls}>
                  <option value="all">Бүх төлөв</option>
                  <option value="active">Идэвхтэй</option>
                  <option value="inactive">Түр хаагдсан</option>
                </select>
                <button onClick={exportCsv} className={inputCls + " whitespace-nowrap text-gray-700 cursor-pointer"}>
                  CSV татах
                </button>
              </div>
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
              <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5">
                <span className="text-sm font-medium text-violet-700">{selected.size} сонгогдсон</span>
                <button onClick={bulkDelete} disabled={bulkDeleting}
                  className="ml-auto px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                  {bulkDeleting ? "Устгаж байна..." : "Сонгосныг устгах"}
                </button>
                <button onClick={function () { setSelected(new Set()); }}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition">
                  Цуцлах
                </button>
              </div>
            )}

            {/* Table */}
            {loading ? (
              <ListSkeleton count={8} />
            ) : users.length === 0 ? (
              <EmptyState illustration="inbox" title="Хэрэглэгч олдсонгүй" description="Хайлтын нөхцөл өөрчилж үзнэ үү." />
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 w-8">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={function (el) { if (el) el.indeterminate = someSelected; }}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300 accent-violet-600"
                          />
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Хэрэглэгч</th>
                        <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">И-мэйл</th>
                        <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Утас</th>
                        <th className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">CV</th>
                        <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Эрх</th>
                        <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Төлөв</th>
                        <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Бүртгэсэн</th>
                        <th className="text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {users.map(function (u) {
                        var isMe = u.id === me?.id;
                        var isSelected = selected.has(u.id);
                        return (
                          <tr key={u.id} className={"transition " + (isSelected ? "bg-violet-50 dark:bg-violet-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50")}>
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={function () { toggleSelect(u.id); }}
                                disabled={isMe}
                                className="rounded border-gray-300 accent-violet-600 disabled:opacity-30"
                              />
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-bold text-xs">{(u.first_name || "U").charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {u.last_name} {u.first_name}
                                    {isMe && <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">(Та)</span>}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 md:hidden truncate">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hidden md:table-cell">{u.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">{u.phone || "—"}</td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className="inline-block min-w-[24px] px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300">{u.cv_count}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={"text-xs px-2 py-0.5 rounded-lg font-medium border " +
                                (u.role === "admin" ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800" : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600")}>
                                {u.role === "admin" ? "Админ" : "Хэрэглэгч"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={"text-xs px-2 py-0.5 rounded-lg font-medium border inline-flex items-center gap-1.5 " +
                                (u.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>
                                <span className={"w-1.5 h-1.5 rounded-full " + (u.is_active ? "bg-emerald-500" : "bg-red-500")} />
                                {u.is_active ? "Идэвхтэй" : "Хаагдсан"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell whitespace-nowrap">
                              {new Date(u.created_at).toLocaleDateString("mn-MN")}
                            </td>
                            <td className="px-4 py-3">
                              {isMe ? (
                                <span className="text-xs text-gray-400 italic">—</span>
                              ) : (
                                <div className="flex justify-end flex-wrap gap-1">
                                  <button onClick={function () { toggleRole(u); }}
                                    className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition whitespace-nowrap">
                                    {u.role === "admin" ? "Хэрэглэгч" : "Админ"}
                                  </button>
                                  <button onClick={function () { openLimitModal(u); }}
                                    className="text-xs px-2 py-1 border border-violet-200 text-violet-700 hover:bg-violet-50 rounded-lg font-medium transition whitespace-nowrap">
                                    Лимит{(u.custom_ai_limit !== null && u.custom_ai_limit !== undefined) || (u.custom_tr_limit !== null && u.custom_tr_limit !== undefined) ? " ✦" : ""}
                                  </button>
                                  <button onClick={function () { toggleActive(u); }}
                                    className={"text-xs px-2 py-1 border rounded-lg font-medium transition whitespace-nowrap " +
                                      (u.is_active ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50")}>
                                    {u.is_active ? "Хаах" : "Нээх"}
                                  </button>
                                  <button onClick={function () { deleteUser(u); }}
                                    className="text-xs px-2 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition">
                                    Устгах
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400">Нийт {users.length} хэрэглэгч харагдаж байна.</p>
          </>
        )}

        {/* ── Audit logs tab ────────────────────────────────────────────────── */}
        {activeTab === "logs" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">Сүүлийн 100 хандалтын бүртгэл</p>
              <button onClick={loadLogs} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Шинэчлэх</button>
            </div>
            {logsLoading ? (
              <ListSkeleton count={6} />
            ) : logs.length === 0 ? (
              <EmptyState illustration="inbox" title="Лог байхгүй" description="Одоогоор хандалтын бүртгэл алга байна." />
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Огноо / Цаг</th>
                        <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Хэрэглэгч</th>
                        <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3">Үйлдэл</th>
                        <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">IP хаяг</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {logs.map(function (log) {
                        return (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(log.created_at).toLocaleString("mn-MN")}</td>
                            <td className="px-4 py-3">
                              {log.user ? (
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.user.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{log.user.email}</p>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500 italic">Устгагдсан хэрэглэгч</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={"text-xs px-2 py-0.5 rounded-lg font-medium border " + (
                                log.action === "login" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                log.action === "password_change" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                log.action === "account_delete" ? "bg-red-50 text-red-700 border-red-200" :
                                "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                              )}>
                                {ACTION_LABELS[log.action] || log.action}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 hidden md:table-cell font-mono">{log.ip_address || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Limit modal */}
      {limitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">AI лимит тохируулах</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {limitModal.last_name} {limitModal.first_name} — хоосон орхивол план-ийн үндсэн лимит хэрэглэнэ.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">AI кредит / сар</label>
                <input
                  type="number"
                  min="0"
                  value={limitAI}
                  onChange={function (e) { setLimitAI(e.target.value); }}
                  placeholder="Хоосон = план default"
                  className={inputCls + " w-full"}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Орчуулга / сар</label>
                <input
                  type="number"
                  min="0"
                  value={limitTR}
                  onChange={function (e) { setLimitTR(e.target.value); }}
                  placeholder="Хоосон = план default"
                  className={inputCls + " w-full"}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={function () { setLimitAI(""); setLimitTR(""); }}
                className="text-xs px-3 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Хэвийн болгох
              </button>
              <div className="flex-1" />
              <button
                onClick={function () { setLimitModal(null); }}
                className="text-xs px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Цуцлах
              </button>
              <button
                onClick={saveLimits}
                disabled={limitSaving}
                className="text-xs px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition disabled:opacity-50 font-medium">
                {limitSaving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
