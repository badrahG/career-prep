import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

export default function Profile() {
  var { user, logout } = useAuth();
  var navigate = useNavigate();

  var [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
  });
  var [saving, setSaving] = useState(false);

  var [pwForm, setPwForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  var [pwSaving, setPwSaving] = useState(false);

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
  var inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100";
  var labelCls = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <Layout>
      <div className="p-5 md:p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Миний профайл</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Хувийн мэдээллээ харах, засах.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm mb-5">
          <div className="p-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow">
              <span className="text-white font-bold text-2xl">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{user?.last_name} {user?.first_name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              <span className={"text-xs px-2 py-0.5 rounded-full font-medium mt-1.5 inline-block " + (user?.role === "admin" ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400")}>
                {user?.role === "admin" ? "Админ" : "Хэрэглэгч"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm mb-5">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Профайл засах</h2>
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
              <input value={user?.email || ""} disabled className="w-full px-4 py-2.5 border border-gray-100 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed" />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">И-мэйл хаягийг өөрчлөх боломжгүй.</p>
            </div>
            <div>
              <label className={labelCls}>Утас</label>
              <input value={form.phone} onChange={function (e) { upd("phone", e.target.value); }} placeholder="9999-9999" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Бүртгүүлсэн огноо</label>
              <input value={user?.created_at ? new Date(user.created_at).toLocaleDateString("mn-MN") : ""} disabled className="w-full px-4 py-2.5 border border-gray-100 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed" />
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md disabled:opacity-50 transition">
                {saving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm mb-5">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Нууц үг солих</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
            <div>
              <label className={labelCls}>Хуучин нууц үг <span className="text-red-500">*</span></label>
              <input type="password" value={pwForm.old_password} onChange={function (e) { updPw("old_password", e.target.value); }} placeholder="Одоогийн нууц үг" className={inputCls} autoComplete="current-password" />
            </div>
            <div>
              <label className={labelCls}>Шинэ нууц үг <span className="text-red-500">*</span></label>
              <input type="password" value={pwForm.new_password} onChange={function (e) { updPw("new_password", e.target.value); }} placeholder="8+ тэмдэгт" className={inputCls} autoComplete="new-password" />
            </div>
            <div>
              <label className={labelCls}>Шинэ нууц үг давтах <span className="text-red-500">*</span></label>
              <input type="password" value={pwForm.confirm_password} onChange={function (e) { updPw("confirm_password", e.target.value); }} placeholder="Дахин оруулна уу" className={inputCls} autoComplete="new-password" />
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
              <button type="submit" disabled={pwSaving} className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md disabled:opacity-50 transition">
                {pwSaving ? "Солиж байна..." : "Нууц үг солих"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/50 rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-t-2xl">
            <h2 className="text-base font-semibold text-red-700 dark:text-red-400">Аюултай үйлдэл</h2>
          </div>
          <div className="p-6 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Бүртгэл устгах</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Таны бүх өгөгдөл бүрмөсөн устгагдана. Буцаах боломжгүй.</p>
            </div>
            <button type="button" onClick={function () { setShowDeleteModal(true); }}
              className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition whitespace-nowrap">
              Бүртгэл устгах
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Бүртгэл устгахдаа итгэлтэй байна уу?</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4">
                <p className="text-sm text-red-700 dark:text-red-400"><strong>Анхааруулга:</strong> Таны бүх CV, профайл, өгөгдөл бүрмөсөн устгагдана.</p>
              </div>
              <div>
                <label className={labelCls}>Баталгаажуулахын тулд <span className="font-bold text-red-600">УСТГАХ</span> гэж бичнэ үү:</label>
                <input value={deleteConfirm} onChange={function (e) { setDeleteConfirm(e.target.value); }} placeholder="УСТГАХ" className={inputCls} autoFocus />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button type="button" onClick={function () { setShowDeleteModal(false); setDeleteConfirm(""); }} disabled={deleting}
                className="px-5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Цуцлах
              </button>
              <button type="button" onClick={handleDeleteAccount} disabled={deleting || deleteConfirm !== "УСТГАХ"}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                {deleting ? "Устгаж байна..." : "Бүрмөсөн устгах"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
