// services/majorsService.js
import api from '../../utils/axios';
import { getUserRole } from '../auth';

// Function untuk mendapatkan endpoint berdasarkan role user
const getEndpoint = (adminPath, operatorPath = null) => {
  const role = getUserRole();
  // Jika operatorPath tidak disediakan, gunakan adminPath untuk operator
  const operatorEndpoint = operatorPath || adminPath.replace('/admin/', '/operator/');
  
  return role === 'admin' ? adminPath : operatorEndpoint;
};

// GET all majors
export const getMajors = async () => {
  try {
    const endpoint = getEndpoint('/admin/school_majors');
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching majors:', error);
    throw error;
  }
};

// GET major by ID
export const getMajorById = async (id) => {
  try {
    const endpoint = getEndpoint(`/admin/school_majors/${id}`);
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching major with id ${id}:`, error);
    throw error;
  }
};

// CREATE major
export const createMajor = async (majorData) => {
  try {
    const endpoint = getEndpoint('/admin/school_majors');
    const response = await api.post(endpoint, majorData);
    return response.data;
  } catch (error) {
    console.error('Error creating major:', error);
    throw error;
  }
};

// UPDATE major
export const updateMajor = async (id, majorData) => {
  try {
    const endpoint = getEndpoint(`/admin/school_majors/${id}`);
    const response = await api.post(endpoint, majorData);
    return response.data;
  } catch (error) {
    console.error(`Error updating major with id ${id}:`, error);
    throw error;
  }
};

// DELETE major
export const deleteMajor = async (id) => {
  try {
    const endpoint = getEndpoint(`/admin/school_majors/${id}`);
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error deleting major with id ${id}:`, error);
    throw error;
  }
};

// IMPORT majors (Excel/File Upload)
export const importMajors = async (file) => {
  try {
    const endpoint = getEndpoint('/admin/school_majors/import');
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing majors:', error);
    throw error;
  }
};

// EXPORT majors (Download Excel)
export const exportMajors = async () => {
  try {
    const endpoint = getEndpoint('/admin/school_majors/export');
    const response = await api.get(endpoint, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting majors:', error);
    throw error;
  }
};

export default {
  getMajors,
  getMajorById,
  createMajor,
  updateMajor,
  deleteMajor,
  importMajors,
  exportMajors
};