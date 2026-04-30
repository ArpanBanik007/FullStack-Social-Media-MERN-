// src/utils/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL 
    ? `${import.meta.env.VITE_BACKEND_URL}/api/v1` 
    : (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"),
  withCredentials: true
});

export default API;
