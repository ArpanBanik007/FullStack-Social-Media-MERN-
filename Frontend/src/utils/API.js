// src/utils/axios.js
import axios from "axios";
import { store } from "../store/store.js";
import { setCredentials, clearCredentials } from "../slices/mydetails.slice.js";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api/v1`
    : (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"),
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
          `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/v1/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { user, accessToken } = res.data.data;

        store.dispatch(setCredentials({ user, accessToken }));

        // original request এ নতুন token দিয়ে retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);

      } catch {
        store.dispatch(clearCredentials());
        window.location.href = "/"; // login page এ পাঠাও
      }
    }

    return Promise.reject(err);
  }
);

export default API;