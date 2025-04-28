// services/classesService.js
import api from '../../utils/axios';
import { getUserRole } from '../auth';

// Function untuk mendapatkan endpoint berdasarkan role user
const getEndpoint = (adminPath, operatorPath = null) => {
  const role = getUserRole();
  // Jika operatorPath tidak disediakan, gunakan adminPath untuk operator
  const operatorEndpoint = operatorPath || adminPath.replace('/admin/', '/operator/');
  
  return role === 'admin' ? adminPath : operatorEndpoint;
};

export const getClasses = async () => {
  try {
    const endpoint = getEndpoint('/admin/classes');
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

export const getClassById = async (id) => {
  try {
    const endpoint = getEndpoint(`/admin/classes/${id}`);
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching class with id ${id}:`, error);
    throw error;
  }
};

export const createClass = async (classData) => {
  try {
    const endpoint = getEndpoint('/admin/classes');
    const response = await api.post(endpoint, classData);
    return response.data;
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
};

export const updateClass = async (id, classData) => {
  try {
    const endpoint = getEndpoint(`/admin/classes/${id}`);
    const response = await api.post(endpoint, classData);
    return response.data;
  } catch (error) {
    console.error(`Error updating class with id ${id}:`, error);
    throw error;
  }
};

export const deleteClass = async (id) => {
  try {
    const endpoint = getEndpoint(`/admin/classes/${id}`);
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error deleting class with id ${id}:`, error);
    throw error;
  }
};

export const importClasses = async (file) => {
  try {
    const endpoint = getEndpoint('/admin/classes/import');
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing classes:', error);
    throw error;
  }
};

export const exportClasses = async () => {
  try {
    const endpoint = getEndpoint('/admin/classes/export');
    const response = await api.get(endpoint, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting classes:', error);
    throw error;
  }
};

export const getClassesByMajor = async (majorId) => {
  try {
    const baseEndpoint = getEndpoint('/admin/classes');
    const response = await api.get(`${baseEndpoint}?school_major_id=${majorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching classes for major id ${majorId}:`, error);
    throw error;
  }
};