import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";

export default function AdminUsers() {
  var { user: me } = useAuth();
  var [users, setUsers] = useState([]);
  var [stats, setStats] = useState(null);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState("");
  var [roleFilter, setRoleFilter] = useState("all");
  var [statusFilter, setStatusFilter] = useState("all");

  function loadUsers() {
    setLoading(true);
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

  useEffect(function () {
    loadStats();
  }, []);

  useEffect(function () {
    var timer = setTimeout(function () { loadUsers(); }, 300);
    return function () { clearTimeout(timer); };
  }, [search, roleFilter, statusFilter]);

  function toggleActive(u) {
    var newStatus = !u.is_active;
    var action = newStatus ? "идэвхжүүлэх" : "түр хаах";
    if (!window.confirm(u.last_name + " " + u.first_name + "-н бүртгэлийг " + action + " үү?")) return;

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
    var label = newRole === "admin" ? "Админ" : "Хэрэглэгч";
    if (!window.confirm(u.last_name + " " + u.first_name + "-г " + label + " болгох уу?")) return;

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900">CareerPrep</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <Link to="/dashboard" className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium">Нүүр</Link>
            <Link to="/admin/users" className="px-3 py-2 text-slate-900 font-medium border-b-2 border-[#1e3a8a]">Админ</Link>
          </div>
          <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 font-medium">← Буцах</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
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
        <div className="mb-6 pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Хэрэглэгчдийн удирдлага</h1>
          <p className="text-sm text-slate-600 mt-1">Бүх хэрэглэгчдийг харах, эрх өөрчлөх, түр хаах, устгах.</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Нийт</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total_users}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Идэвхтэй</p>
              <p className="text-2xl font-bold text-emerald-700">{stats.active_users}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Түр хаагдсан</p>
              <p className="text-2xl font-bold text-red-600">{stats.suspended_users}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Нийт CV</p>
              <p className="text-2xl font-bold text-[#1e3a8a]">{stats.total_cvs}</p>
            </div>
          </div>
        )}

        {/* Search + filters */}
        <div className="bg-white border border-slate-200 rounded p-4 mb-6">
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
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-slate-400 text-sm">Ачааллаж байна...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-sm text-slate-500">Хэрэглэгч олдсонгүй.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
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
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#1e3a8a] rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">{(u.first_name || "U").charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {u.last_name} {u.first_name}
                                {isMe && <span className="ml-2 text-xs text-slate-400">(Та)</span>}
                              </p>
                              <p className="text-xs text-slate-500 md:hidden">{u.email}</p>
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
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={function () { toggleRole(u); }}
                                title={u.role === "admin" ? "Хэрэглэгч болгох" : "Админ болгох"}
                                className="text-xs px-2 py-1 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded font-medium transition whitespace-nowrap"
                              >
                                {u.role === "admin" ? "Хэрэглэгч" : "Админ"}
                              </button>
                              <button
                                onClick={function () { toggleActive(u); }}
                                title={u.is_active ? "Түр хаах" : "Идэвхжүүлэх"}
                                className={"text-xs px-2 py-1 border rounded font-medium transition whitespace-nowrap " + (u.is_active ? "border-amber-300 text-amber-700 hover:bg-amber-50" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50")}
                              >
                                {u.is_active ? "Хаах" : "Нээх"}
                              </button>
                              <button
                                onClick={function () { deleteUser(u); }}
                                title="Устгах"
                                className="text-xs px-2 py-1 border border-red-300 text-red-600 hover:bg-red-50 rounded font-medium transition"
                              >
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
          )}
        </div>

        <p className="text-xs text-slate-400 mt-3">Нийт {users.length} хэрэглэгч харагдаж байна.</p>
      </div>
    </div>
  );
}