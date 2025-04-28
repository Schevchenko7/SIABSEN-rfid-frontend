// utils/axios.js
import axios from "axios";
import { DEFAULT_API } from "./config.js"; // Import konfigurasi dari file terpisah

// Menggunakan nilai dari file konfigurasi
const baseURL = DEFAULT_API;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menyertakan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Ambil token dari localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk menangani response error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika error adalah 401 Unauthorized, kemungkinan token sudah expired
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      // Redirect ke halaman login jika diperlukan
      localStorage.removeItem('token'); // Hapus token
      localStorage.removeItem('role'); // Hapus role
      window.location.href = '/login'; // Redirect ke login
    }
    return Promise.reject(error);
  }
);

export default api;