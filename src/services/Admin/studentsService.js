// services/studentsService.js
import api from "../../utils/axios";
import { getUserRole } from '../auth';

// Function untuk mendapatkan endpoint berdasarkan role user
const getEndpoint = (adminPath, operatorPath = null) => {
  const role = getUserRole();
  // Jika operatorPath tidak disediakan, gunakan adminPath untuk operator
  const operatorEndpoint = operatorPath || adminPath.replace('/admin/', '/operator/');
  
  return role === 'admin' ? adminPath : operatorEndpoint;
};

// Ambil semua siswa
export const getStudents = async () => {
  try {
    const endpoint = getEndpoint('/admin/students');
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Ambil siswa berdasarkan class_id
export const getStudentsByClassId = async (classId) => {
  try {
    const baseEndpoint = getEndpoint('/admin/students');
    // Coba gunakan query parameter jika API mendukung
    const response = await api.get(`${baseEndpoint}?class_id=${classId}`);
    
    // Jika API tidak mendukung query parameter, filter manual
    if (!response.data || response.data.length === 0) {
      const allStudents = await getStudents();
      // Filter data berdasarkan class_id
      const filtered = Array.isArray(allStudents) 
        ? allStudents.filter(student => student.class_id == classId)
        : allStudents.data.filter(student => student.class_id == classId);
      return filtered;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error filtering students for class ${classId}:`, error);
    throw error;
  }
};

// Ambil satu siswa berdasarkan ID
export const getStudentById = async (id) => {
  try {
    const endpoint = getEndpoint(`/admin/students/${id}`);
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student with id ${id}:`, error);
    throw error;
  }
};

// Tambah siswa baru
export const createStudent = async (studentData) => {
  try {
    const endpoint = getEndpoint('/admin/students');
    const response = await api.post(endpoint, studentData);
    return response.data;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

// Update siswa
export const updateStudent = async (id, studentData) => {
  try {
    const endpoint = getEndpoint(`/admin/students/${id}`);
    const response = await api.post(endpoint, studentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating student with id ${id}:`, error);
    throw error;
  }
};

// Hapus siswa
export const deleteStudent = async (id) => {
  try {
    const endpoint = getEndpoint(`/admin/students/${id}`);
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error deleting student with id ${id}:`, error);
    throw error;
  }
};

// Import data siswa
export const importStudents = async (file) => {
  try {
    const endpoint = getEndpoint('/admin/STD/import');
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing students:', error);
    throw error;
  }
};

// Export data siswa
export const exportStudents = async () => {
  try {
    const endpoint = getEndpoint('/admin/STD/export');
    const response = await api.get(endpoint, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting students:', error);
    throw error;
  }
};

export default {
  getStudents,
  getStudentsByClassId,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudents,
  exportStudents
};