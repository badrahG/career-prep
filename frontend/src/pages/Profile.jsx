import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Profile() {
  var { user, logout } = useAuth();
  var navigate = useNavigate();

  var [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
  });
  var [saving, setSaving] = useState(false);

  // Password change state
  var [pwForm, setPwForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  var [pwSaving, setPwSaving] = useState(false);

  // Delete account state
  var [showDeleteModal, setShowDeleteModal] = useState(false);
  var [deleteConfirm, setDeleteConfirm] = useState("");
  var [deleting, setDeleting] = useState(false);

  function upd(field, value) {
    setForm(function (p) { return { ...p, [field]: value }; });
  }
  function updPw(field, value) {
    setPwForm(function (p) { return { ...p, [field]: value }; });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/auth/profile", form);
      toast.success("Профайл шинэчлэгдлээ!");
      window.location.reload();
    } catch (err) {
      toast.error("Алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (!pwForm.old_password || !pwForm.new_password) {
      toast.error("Бүх талбарыг бөглөнө үү");
      return;
    }
    if (pwForm.new_password.length < 8) {
      toast.error("Шинэ нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой");
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error("Шинэ нууц үг таарахгүй байна");
      return;
    }
    setPwSaving(true);
    try {
      await API.post("/auth/change-password", {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
      toast.success("Нууц үг амжилттай солигдлоо!");
      setPwForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа гарлаа");
    } finally {
      setPwSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "УСТГАХ") {
      toast.error("Зөв бичнэ үү");
      return;
    }
    setDeleting(true);
    try {
      await API.delete("/auth/me");
      toast.success("Бүртгэл устгагдлаа");
      logout();
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Алдаа гарлаа");
      setDeleting(false);
    }
  }

  var initial = (user?.first_name || "U").charAt(0).toUpperCase();
  var inputCls = "w-full px-4 py-2.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition";
  var labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e3a8a] flex items-center justify-center rounded">
              <span className="text-white font-bold text-xs tracking-wide">CP</span>
            </div>
            <span className="text-base font-semibold text-slate-900">CareerPrep</span>
          </Link>
          <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 font-medium">← Dashboard</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-3 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-900">Нүүр</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">Профайл</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6 pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Миний профайл</h1>
          <p className="text-sm text-slate-600 mt-1">Хувийн мэдээллээ харах, засах.</p>
        </div>

        {/* User header card */}
        <div className="bg-white border border-slate-200 rounded mb-6">
          <div className="p-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1e3a8a] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900">{user?.last_name} {user?.first_name}</h2>
              <p className="text-sm text-slate-500 truncate">{user?.email}</p>
              <span className={"text-xs px-2 py-0.5 rounded font-medium mt-1.5 inline-block border " + (user?.role === "admin" ? "bg-[#1e3a8a]/5 text-[#1e3a8a] border-[#1e3a8a]/20" : "bg-slate-50 text-slate-700 border-slate-200")}>
                {user?.role === "admin" ? "Админ" : "Хэрэглэгч"}
              </span>
            </div>
          </div>
        </div>

        {/* Profile edit form */}
        <div className="bg-white border border-slate-200 rounded mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Профайл засах</h2>
            <p className="text-xs text-slate-500 mt-0.5">Өөрийн мэдээллээ шинэчлэх.</p>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Овог</label>
                <input value={form.last_name} onChange={function (e) { upd("last_name", e.target.value); }} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Нэр</label>
                <input value={form.first_name} onChange={function (e) { upd("first_name", e.target.value); }} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>И-мэйл</label>
              <input value={user?.email || ""} disabled className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50 text-slate-500 cursor-not-allowed" />
              <p className="text-xs text-slate-400 mt-1">И-мэйл хаягийг өөрчлөх боломжгүй.</p>
            </div>
            <div>
              <label className={labelCls}>Утас</label>
              <input value={form.phone} onChange={function (e) { upd("phone", e.target.value); }} placeholder="9999-9999" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Бүртгүүлсэн огноо</label>
              <input value={user?.created_at ? new Date(user.created_at).toLocaleDateString("mn-MN") : ""} disabled className="w-full px-4 py-2.5 border border-slate-200 rounded text-sm bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-200">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#1e3a8a] text-white rounded text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-50 transition">
                {saving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </form>
        </div>

        {/* Password change form */}
        <div className="bg-white border border-slate-200 rounded mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Нууц үг солих</h2>
            <p className="text-xs text-slate-500 mt-0.5">Аюулгүй байдлын үүднээс нууц үгээ үе үе сольж байгаарай.</p>
          </div>
          <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
            <div>
              <label className={labelCls}>Хуучин нууц үг <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={pwForm.old_password}
                onChange={function (e) { updPw("old_password", e.target.value); }}
                placeholder="Одоогийн нууц үг"
                className={inputCls}
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className={labelCls}>Шинэ нууц үг <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={pwForm.new_password}
                onChange={function (e) { updPw("new_password", e.target.value); }}
                placeholder="8+ тэмдэгт"
                className={inputCls}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className={labelCls}>Шинэ нууц үг давтах <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={pwForm.confirm_password}
                onChange={function (e) { updPw("confirm_password", e.target.value); }}
                placeholder="Шинэ нууц үгээ дахин оруулна уу"
                className={inputCls}
                autoComplete="new-password"
              />
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-200">
              <button type="submit" disabled={pwSaving} className="px-6 py-2.5 bg-[#1e3a8a] text-white rounded text-sm font-semibold hover:bg-[#1e40af] disabled:opacity-50 transition">
                {pwSaving ? "Солиж байна..." : "Нууц үг солих"}
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white border border-red-200 rounded">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <h2 className="text-base font-semibold text-red-700">Аюултай үйлдэл</h2>
            <p className="text-xs text-red-600 mt-0.5">Доорх үйлдлүүдийг буцаах боломжгүй.</p>
          </div>
          <div className="p-6 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Бүртгэл устгах</p>
              <p className="text-xs text-slate-500 mt-1">
                Таны бүх өгөгдөл (CV, тэмдэглэл) бүрмөсөн устгагдана. Энэ үйлдлийг буцаах боломжгүй.
              </p>
            </div>
            <button
              type="button"
              onClick={function () { setShowDeleteModal(true); }}
              className="px-4 py-2 border border-red-300 text-red-600 rounded text-sm font-semibold hover:bg-red-50 transition whitespace-nowrap"
            >
              Бүртгэл устгах
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Бүртгэл устгахдаа итгэлтэй байна уу?</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-sm text-red-700">
                  <strong>Анхааруулга:</strong> Энэ үйлдэл нь буцаах боломжгүй. Таны бүх CV, профайл, бусад өгөгдөл бүрмөсөн устгагдана.
                </p>
              </div>
              <div>
                <label className={labelCls}>
                  Баталгаажуулахын тулд <span className="font-bold text-red-600">УСТГАХ</span> гэж бичнэ үү:
                </label>
                <input
                  value={deleteConfirm}
                  onChange={function (e) { setDeleteConfirm(e.target.value); }}
                  placeholder="УСТГАХ"
                  className={inputCls}
                  autoFocus
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={function () { setShowDeleteModal(false); setDeleteConfirm(""); }}
                disabled={deleting}
                className="px-5 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Цуцлах
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== "УСТГАХ"}
                className="px-5 py-2 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {deleting ? "Устгаж байна..." : "Бүрмөсөн устгах"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}