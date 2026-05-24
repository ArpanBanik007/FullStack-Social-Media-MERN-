// src/utils/axios.js
import axios from "axios";
import { store } from "../store/store.js";
import { setCredentials, clearCredentials } from "../slices/mydetails.slice.js";

// ✅ Local এ VITE_BACKEND_URL খালি → "/api/v1" → Vite proxy → localhost:8000
// ✅ Production এ VITE_BACKEND_URL set → direct Render URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api/v1`
  : "/api/v1";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ✅ প্রতিটা request এ accessToken auto attach
API.interceptors.request.use((config) => {
  const token = store.getState().mydetails.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ 401 হলে auto refresh করে original request retry
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${BASE_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { user, accessToken } = res.data.data;
        store.dispatch(setCredentials({ user, accessToken }));

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);

      } catch {
        store.dispatch(clearCredentials());
        window.location.href = "/";
      }
    }

    return Promise.reject(err);
  }
);

export default API;