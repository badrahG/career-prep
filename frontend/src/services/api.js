import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8001/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = "Bearer " + token;
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
        const res = await axios.post("http://localhost:8001/api/auth/refresh", { refresh_token: refreshToken });
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