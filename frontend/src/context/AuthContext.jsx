import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import API, { refreshCsrfToken, clearCsrfToken } from "../services/api";

const INACTIVITY_MS = 15 * 60 * 1000; // 15 минут
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
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const newToken = res.data.access_token;
    localStorage.setItem("token", newToken);
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
    clearCsrfToken();
    setToken(null);
    setUser(null);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
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