import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const TYPE_STYLES = {
  scholarship_new:      { bg: "#FFFBEB", color: "#F59E0B", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
  scholarship_deadline: { bg: "#FEF2F2", color: "#EF4444", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  interview_new:        { bg: "#ECFEFF", color: "#06B6D4", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  advice_new:           { bg: "#ECFDF5", color: "#10B981", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
};
const DEFAULT_STYLE = { bg: "#EDE9FE", color: "#7C3AED", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" };

function timeAgo(dateStr) {
  if (!dateStr) return "";
  var diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Дөнгөж сая";
  if (diff < 3600) return Math.floor(diff / 60) + " мин өмнө";
  if (diff < 86400) return Math.floor(diff / 3600) + " цаг өмнө";
  if (diff < 604800) return Math.floor(diff / 86400) + " өдөр өмнө";
  return new Date(dateStr).toLocaleDateString("mn-MN");
}

export default function NotificationDropdown({ open, onClose, onUnreadChange }) {
  var [notifications, setNotifications] = useState([]);
  var [unreadCount, setUnreadCount] = useState(0);
  var [loading, setLoading] = useState(false);
  var navigate = useNavigate();

  useEffect(function () {
    if (!open) return;
    setLoading(true);
    API.get("/notifications")
      .then(function (r) {
        setNotifications(r.data.notifications || []);
        var count = r.data.unread_count || 0;
        setUnreadCount(count);
        onUnreadChange(count);
      })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }, [open]);

  function markAllRead() {
    API.post("/notifications/read-all")
      .then(function () {
        setNotifications(function (prev) { return prev.map(function (n) { return { ...n, is_read: true }; }); });
        setUnreadCount(0);
        onUnreadChange(0);
      })
      .catch(function () {});
  }

  function handleClick(notif) {
    if (!notif.is_read) {
      API.post("/notifications/" + notif.id + "/read").catch(function () {});
      setNotifications(function (prev) {
        return prev.map(function (n) { return n.id === notif.id ? { ...n, is_read: true } : n; });
      });
      var newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      onUnreadChange(newCount);
    }
    if (notif.url) {
      navigate(notif.url);
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="absolute right-4 top-16 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        onClick={function (e) { e.stopPropagation(); }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Мэдэгдэл</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium">
              Бүгдийг уншсан
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="text-gray-300 dark:text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">Мэдэгдэл байхгүй байна</p>
            </div>
          ) : (
            notifications.map(function (n) {
              var style = TYPE_STYLES[n.type] || DEFAULT_STYLE;
              return (
                <button key={n.id} onClick={function () { handleClick(n); }}
                  className={"w-full flex items-start gap-3 px-4 py-3 text-left transition border-b border-gray-50 dark:border-gray-700/50 last:border-0 " +
                    (n.is_read
                      ? "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      : "bg-violet-50/40 dark:bg-violet-900/10 hover:bg-violet-50 dark:hover:bg-violet-900/20")}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: style.bg }}>
                    <svg width={16} height={16} fill="none" stroke={style.color} strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={style.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={"text-xs leading-snug " + (n.is_read ? "text-gray-600 dark:text-gray-400" : "text-gray-800 dark:text-gray-100 font-semibold")}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{n.body}</p>
                    )}
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
