import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import API, { refreshCsrfToken, clearCsrfToken } from "../services/api";

const INACTIVITY_MS = 15 * 60 * 1000;        // 15 минут — хуудас нээлттэй үед
const TAB_CLOSE_MS  = 2 * 60 * 60 * 1000;   // 2 цаг   — tab хааж буцаж орвол
const LAST_ACTIVE_KEY = "lastActiveAt";
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const fetchUser = async (t) => {
    try {
      const res = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      });
      setUser(res.data);
      await refreshCsrfToken();
    } catch {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      // Tab хааж буцаж орвол 2 цаг өнгөрсөн эсэх шалгана
      const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
      if (lastActive && Date.now() - parseInt(lastActive, 10) > TAB_CLOSE_MS) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem(LAST_ACTIVE_KEY);
        clearCsrfToken();
        window.location.href = "/login?reason=timeout";
        return;
      }
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const newToken = res.data.access_token;
    localStorage.setItem("token", newToken);
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    if (res.data.refresh_token) {
      localStorage.setItem("refreshToken", res.data.refresh_token);
    }
    setToken(newToken);
    await fetchUser(newToken);
    return res.data;
  };

  const register = async (data) => {
    const res = await API.post("/auth/register", data);
    return res.data;
  };

  const logout = useCallback(() => {
    clearTimeout(timerRef.current);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem(LAST_ACTIVE_KEY);
    clearCsrfToken();
    setToken(null);
    setUser(null);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    timerRef.current = setTimeout(() => {
      logout();
      window.location.href = "/login?reason=timeout";
    }, INACTIVITY_MS);
  }, [logout]);

  // Inactivity timer — зөвхөн нэвтэрсэн үед ажиллана
  useEffect(() => {
    if (!token) {
      clearTimeout(timerRef.current);
      return;
    }
    resetTimer();
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    return () => {
      clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [token, resetTimer]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);