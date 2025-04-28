// services/usersService.js
import api from '../../utils/axios';
import { getUserRole, hasRole } from '../auth';

// Function untuk mendapatkan endpoint berdasarkan role user
const getEndpoint = (adminPath) => {
  // Untuk manajemen user, hanya admin yang memiliki akses
  return adminPath;
};

// Memeriksa apakah user memiliki akses
const checkAccess = () => {
  if (!hasRole('admin')) {
    throw new Error('Unauthorized: Only admin can manage users');
  }
};

// Get all users
export const getUsers = async () => {
  try {
    // Pemeriksaan akses - hanya admin yang bisa mengelola users
    checkAccess();
    
    const endpoint = getEndpoint('/admin/users');
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    // Handle 404 error by returning an empty array instead of throwing an error
    if (error.response && error.response.status === 404) {
      console.warn('Users API endpoint not found. Returning empty array.');
      return [];
    }
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    // Pemeriksaan akses - hanya admin yang bisa mengelola users
    checkAccess();
    
    const endpoint = getEndpoint('/admin/users');
    const response = await api.post(endpoint, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user by ID
export const updateUser = async (id, userData) => {
  try {
    // Pemeriksaan akses - hanya admin yang bisa mengelola users
    checkAccess();
    
    const endpoint = getEndpoint(`/admin/users/${id}`);
    const response = await api.post(endpoint, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

// Delete user by ID
export const deleteUser = async (id) => {
  try {
    // Pemeriksaan akses - hanya admin yang bisa mengelola users
    checkAccess();
    
    const endpoint = getEndpoint(`/admin/users/${id}`);
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
};

export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};