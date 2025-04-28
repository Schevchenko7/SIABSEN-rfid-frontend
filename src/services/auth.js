// utils/auth.js
// Fungsi utilitas untuk mengelola autentikasi dan manajemen role

/**
 * Mendapatkan role pengguna dari localStorage
 * @returns {string} Role pengguna ('admin', 'operator', atau '')
 */
export const getUserRole = () => {
  return localStorage.getItem('role') || '';
};

/**
 * Memeriksa apakah pengguna sudah terautentikasi
 * @returns {boolean} Status autentikasi
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Memeriksa apakah pengguna memiliki role tertentu
 * @param {string|array} roles - Role atau array role yang diizinkan
 * @returns {boolean} Apakah pengguna memiliki role tersebut
 */
export const hasRole = (roles) => {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  } else {
    return roles === userRole;
  }
};

/**
 * Menyimpan data autentikasi ke localStorage
 * @param {string} token - Token autentikasi
 * @param {string} role - Role pengguna
 * @param {object} userData - Data pengguna tambahan (opsional)
 */
export const setAuthData = (token, role, userData = null) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }
};

/**
 * Menghapus data autentikasi dari localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
};

/**
 * Mendapatkan data pengguna dari localStorage
 * @returns {object|null} Data pengguna atau null
 */
export const getUserData = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export default {
  getUserRole,
  isAuthenticated,
  hasRole,
  setAuthData,
  clearAuthData,
  getUserData
};