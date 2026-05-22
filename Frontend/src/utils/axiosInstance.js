import axios from "axios";
import { store } from "../store/store.js";
import { setCredentials, clearCredentials } from "../slices/mydetails.slice.js";

const axiosInstance = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
});


// প্রতিটা request এ accessToken auto attach
axiosInstance.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 401 হলে auto refresh করে retry
axiosInstance.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axios.post(
                    "/api/v1/users/refresh-token",
                    {},
                    { withCredentials: true }
                );

                const { accessToken, user } = res.data.data;
                store.dispatch(setCredentials({ user, accessToken }));

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch {
                store.dispatch(clearCredentials());
                window.location.href = "/login";
            }
        }

        return Promise.reject(err);
    }
);

export default axiosInstance;