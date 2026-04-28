import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import { ListSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

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
          <rect
            key={i}
            x={i * (barW + gap)}
            y={H - h}
            width={barW}
            height={h || 2}
            fill={color}
            opacity={d.count > 0 ? 0.75 : 0.12}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={"text-2xl font-bold " + (color || "text-slate-900")}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminUsers() {
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

  // ── Bulk selection ───────────────────────────────────────────────────────────

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

  // ── Bulk delete ──────────────────────────────────────────────────────────────

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

  // ── CSV export ───────────────────────────────────────────────────────────────

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

  // ── Single-row actions ───────────────────────────────────────────────────────

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

  // ── Render ───────────────────────────────────────────────────────────────────

  var allSelected = users.length > 0 && selected.size === users.length;
  var someSelected = selected.size > 0 && !allSelected;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
      </div>

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900">CareerPrep</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <Link to="/admin/dashboard" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Dashboard</Link>
            <Link to="/admin/users" className="px-3 py-2 text-slate-900 font-medium border-b-2 border-[#1e3a8a]">Хэрэглэгчид</Link>
          </div>
          <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 font-medium">← Буцах</Link>
        </div>
      </nav>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">Админ — Хэрэглэгчид</span>
          </div>
          <span className="text-xs bg-[#1e3a8a]/5 text-[#1e3a8a] border border-[#1e3a8a]/20 px-2 py-0.5 rounded font-medium">Админ горим</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Хэрэглэгчдийн удирдлага</h1>
          <p className="text-sm text-slate-600 mt-1">Бүх хэрэглэгчдийг харах, эрх өөрчлөх, түр хаах, устгах.</p>
          <div className="flex gap-1 mt-4">
            {["users", "analytics", "logs"].map(function (tab) {
              var labels = { users: "Хэрэглэгчид", analytics: "Аналитик", logs: "Хандалтын лог" };
              return (
                <button
                  key={tab}
                  onClick={function () { setActiveTab(tab); }}
                  className={"px-4 py-2 text-sm font-medium rounded-t border-b-2 transition " + (activeTab === tab ? "border-[#1e3a8a] text-[#1e3a8a] bg-[#1e3a8a]/5" : "border-transparent text-slate-500 hover:text-slate-800")}
                >
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
              <StatCard label="Нийт хэрэглэгч" value={stats?.total_users ?? "—"} color="text-slate-900" />
              <StatCard label="Идэвхтэй" value={stats?.active_users ?? "—"} color="text-emerald-700" />
              <StatCard label="Түр хаагдсан" value={stats?.suspended_users ?? "—"} color="text-red-600" />
              <StatCard label="Админ" value={stats?.total_admins ?? "—"} color="text-[#1e3a8a]" />
              <StatCard label="Нийт CV" value={stats?.total_cvs ?? "—"} color="text-purple-700" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-800">Шинэ бүртгэл</p>
                  <p className="text-xs text-slate-400">Сүүлийн 30 хоног</p>
                </div>
                <p className="text-2xl font-bold text-[#1e3a8a] mb-3">
                  {stats?.daily_registrations ? stats.daily_registrations.reduce(function (s, d) { return s + d.count; }, 0) : "—"}
                </p>
                <BarChart data={stats?.daily_registrations} color="#1e3a8a" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  {stats?.daily_registrations && (
                    <>
                      <span>{stats.daily_registrations[0]?.date?.slice(5)}</span>
                      <span>{stats.daily_registrations[29]?.date?.slice(5)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-800">Шинэ CV</p>
                  <p className="text-xs text-slate-400">Сүүлийн 30 хоног</p>
                </div>
                <p className="text-2xl font-bold text-purple-700 mb-3">
                  {stats?.daily_cvs ? stats.daily_cvs.reduce(function (s, d) { return s + d.count; }, 0) : "—"}
                </p>
                <BarChart data={stats?.daily_cvs} color="#7c3aed" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
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
            {/* Summary cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="Нийт" value={stats.total_users} />
                <StatCard label="Идэвхтэй" value={stats.active_users} color="text-emerald-700" />
                <StatCard label="Түр хаагдсан" value={stats.suspended_users} color="text-red-600" />
                <StatCard label="Нийт CV" value={stats.total_cvs} color="text-[#1e3a8a]" />
              </div>
            )}

            {/* Search + filters + actions */}
            <div className="bg-white border border-slate-200 rounded p-4 mb-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  value={search}
                  onChange={function (e) { setSearch(e.target.value); }}
                  placeholder="Нэр, и-мэйлээр хайх..."
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition"
                />
                <select value={roleFilter} onChange={function (e) { setRoleFilter(e.target.value); }} className="px-4 py-2.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:border-[#1e3a8a]">
                  <option value="all">Бүх эрх</option>
                  <option value="user">Хэрэглэгч</option>
                  <option value="admin">Админ</option>
                </select>
                <select value={statusFilter} onChange={function (e) { setStatusFilter(e.target.value); }} className="px-4 py-2.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:border-[#1e3a8a]">
                  <option value="all">Бүх төлөв</option>
                  <option value="active">Идэвхтэй</option>
                  <option value="inactive">Түр хаагдсан</option>
                </select>
                <button
                  onClick={exportCsv}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50 transition whitespace-nowrap"
                >
                  CSV татах
                </button>
              </div>
            </div>

            {/* Bulk action toolbar */}
            {selected.size > 0 && (
              <div className="flex items-center gap-3 bg-[#1e3a8a]/5 border border-[#1e3a8a]/20 rounded px-4 py-2.5 mb-4">
                <span className="text-sm font-medium text-[#1e3a8a]">{selected.size} сонгогдсон</span>
                <button
                  onClick={bulkDelete}
                  disabled={bulkDeleting}
                  className="ml-auto px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition disabled:opacity-50"
                >
                  {bulkDeleting ? "Устгаж байна..." : "Сонгосныг устгах"}
                </button>
                <button
                  onClick={function () { setSelected(new Set()); }}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-medium rounded hover:bg-slate-50 transition"
                >
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
              <div className="bg-white border border-slate-200 rounded overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 w-8">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={function (el) { if (el) el.indeterminate = someSelected; }}
                            onChange={toggleSelectAll}
                            className="rounded border-slate-300 accent-[#1e3a8a]"
                          />
                        </th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">Хэрэглэгч</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3 hidden md:table-cell">И-мэйл</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Утас</th>
                        <th className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">CV</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">Эрх</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">Төлөв</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Бүртгэсэн</th>
                        <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {users.map(function (u) {
                        var isMe = u.id === me?.id;
                        var isSelected = selected.has(u.id);
                        return (
                          <tr key={u.id} className={"transition " + (isSelected ? "bg-[#1e3a8a]/5" : "hover:bg-slate-50")}>
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={function () { toggleSelect(u.id); }}
                                disabled={isMe}
                                className="rounded border-slate-300 accent-[#1e3a8a] disabled:opacity-30"
                              />
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 bg-[#1e3a8a] rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-bold text-xs">{(u.first_name || "U").charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 truncate">
                                    {u.last_name} {u.first_name}
                                    {isMe && <span className="ml-2 text-xs text-slate-400">(Та)</span>}
                                  </p>
                                  <p className="text-xs text-slate-500 md:hidden truncate">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 hidden md:table-cell">{u.email}</td>
                            <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">{u.phone || "—"}</td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className="inline-block min-w-[24px] px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold text-slate-700">{u.cv_count}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={"text-xs px-2 py-0.5 rounded font-medium border " + (u.role === "admin" ? "bg-[#1e3a8a]/5 text-[#1e3a8a] border-[#1e3a8a]/20" : "bg-slate-50 text-slate-700 border-slate-200")}>
                                {u.role === "admin" ? "Админ" : "Хэрэглэгч"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={"text-xs px-2 py-0.5 rounded font-medium border inline-flex items-center gap-1.5 " + (u.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>
                                <span className={"w-1.5 h-1.5 rounded-full " + (u.is_active ? "bg-emerald-500" : "bg-red-500")}></span>
                                {u.is_active ? "Идэвхтэй" : "Хаагдсан"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell whitespace-nowrap">
                              {new Date(u.created_at).toLocaleDateString("mn-MN")}
                            </td>
                            <td className="px-4 py-3">
                              {isMe ? (
                                <span className="text-xs text-slate-400 italic">—</span>
                              ) : (
                                <div className="flex justify-end flex-wrap gap-1">
                                  <button onClick={function () { toggleRole(u); }} className="text-xs px-2 py-1 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded font-medium transition whitespace-nowrap">
                                    {u.role === "admin" ? "Хэрэглэгч" : "Админ"}
                                  </button>
                                  <button onClick={function () { toggleActive(u); }} className={"text-xs px-2 py-1 border rounded font-medium transition whitespace-nowrap " + (u.is_active ? "border-amber-300 text-amber-700 hover:bg-amber-50" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50")}>
                                    {u.is_active ? "Хаах" : "Нээх"}
                                  </button>
                                  <button onClick={function () { deleteUser(u); }} className="text-xs px-2 py-1 border border-red-300 text-red-600 hover:bg-red-50 rounded font-medium transition">
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
            <p className="text-xs text-slate-400 mt-3">Нийт {users.length} хэрэглэгч харагдаж байна.</p>
          </>
        )}

        {/* ── Audit logs tab ────────────────────────────────────────────────── */}
        {activeTab === "logs" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">Сүүлийн 100 хандалтын бүртгэл</p>
              <button onClick={loadLogs} className="text-xs px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50 transition">Шинэчлэх</button>
            </div>
            {logsLoading ? (
              <ListSkeleton count={6} />
            ) : logs.length === 0 ? (
              <EmptyState illustration="inbox" title="Лог байхгүй" description="Одоогоор хандалтын бүртгэл алга байна." />
            ) : (
              <div className="bg-white border border-slate-200 rounded overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">Огноо / Цаг</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">Хэрэглэгч</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">Үйлдэл</th>
                        <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3 hidden md:table-cell">IP хаяг</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {logs.map(function (log) {
                        return (
                          <tr key={log.id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString("mn-MN")}</td>
                            <td className="px-4 py-3">
                              {log.user ? (
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{log.user.name}</p>
                                  <p className="text-xs text-slate-500">{log.user.email}</p>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Устгагдсан хэрэглэгч</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={"text-xs px-2 py-0.5 rounded font-medium border " + (
                                log.action === "login" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                log.action === "password_change" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                log.action === "account_delete" ? "bg-red-50 text-red-700 border-red-200" :
                                "bg-slate-50 text-slate-700 border-slate-200"
                              )}>
                                {ACTION_LABELS[log.action] || log.action}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell font-mono">{log.ip_address || "—"}</td>
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
    </div>
  );
}
