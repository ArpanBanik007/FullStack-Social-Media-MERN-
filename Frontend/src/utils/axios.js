// src/utils/axios.js
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8000/api/v1";
axios.defaults.withCredentials = true;

export default axios;
