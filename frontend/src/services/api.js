import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api";

const API = axios.create({
  baseURL: BASE,
});

let csrfToken = sessionStorage.getItem("csrfToken") || null;

export async function refreshCsrfToken() {
  try {
    const res = await axios.get(`${BASE}/auth/csrf-token`);
    csrfToken = res.data.csrf_token;
    sessionStorage.setItem("csrfToken", csrfToken);
  } catch {
    // dev орчинд тайван алдагдуулна
  }
}

export function clearCsrfToken() {
  csrfToken = null;
  sessionStorage.removeItem("csrfToken");
}

const MUTATING = new Set(["post", "put", "delete", "patch"]);

API.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = "Bearer " + token;
    if (MUTATING.has(config.method?.toLowerCase())) {
      if (!csrfToken) await refreshCsrfToken();
      if (csrfToken) config.headers["X-CSRF-Token"] = csrfToken;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Dispatch limit exceeded event for AI/TR limit errors
    if (error.response?.status === 403) {
      const detail = error.response.data?.detail;
      if (detail && typeof detail === "object" && (detail.code === "ai_limit_exceeded" || detail.code === "tr_limit_exceeded")) {
        window.dispatchEvent(new CustomEvent("limitExceeded", { detail }));
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && !original._retry && !original.url?.includes("/auth/refresh")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers["Authorization"] = "Bearer " + token;
          return API(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }
      try {
        const res = await axios.post(`${BASE}/auth/refresh`, { refresh_token: refreshToken });
        const { access_token, refresh_token } = res.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        processQueue(null, access_token);
        original.headers["Authorization"] = "Bearer " + access_token;
        return API(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        clearCsrfToken();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default API;
