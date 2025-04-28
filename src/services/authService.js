// services/authService.js
import api from "../utils/axios";
import { setAuthData, clearAuthData } from "../services/auth";

export const login = async (email, password) => {
  try {
    const response = await api.post("/login", { email, password });
    const { token, user } = response.data;

    if (token && user) {
      // Simpan token, role, dan data pengguna
      setAuthData(token, user.role, user);
    }

    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post("/logout");
    clearAuthData(); // Hapus semua data autentikasi
  } catch (error) {
    console.error("Logout failed:", error.response?.data || error.message);
    // Tetap hapus data lokal meskipun ada error dari server
    clearAuthData();
    throw error;
  }
};

// Mendapatkan informasi pengguna yang sedang login
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/user");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error.response?.data || error.message);
    throw error;
  }
};

export default {
  login,
  logout,
  getCurrentUser
};