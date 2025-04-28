// services/attendancesService.js
import api from '../../utils/axios';
import { getUserRole } from '../auth';

// Function untuk mendapatkan endpoint berdasarkan role user
const getEndpoint = (adminPath, operatorPath = null) => {
  const role = getUserRole();
  // Jika operatorPath tidak disediakan, gunakan adminPath untuk operator dengan mengganti path
  const operatorEndpoint = operatorPath || adminPath.replace('/admin/', '/operator/');
  
  return role === 'admin' ? adminPath : operatorEndpoint;
};

// Mendapatkan semua data kehadiran dengan pagination
export const getAttendances = async (page = 1, limit = 7, filters = {}) => {
  try {
    const endpoint = getEndpoint('/admin/attendances', '/operator/attendances');
    const response = await api.get(endpoint, {
      params: { 
        page, 
        limit,
        ...filters
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendances:', error);
    throw error.response?.data || { message: 'Gagal mengambil data kehadiran' };
  }
};

// Mendapatkan data kehadiran berdasarkan ID
export const getAttendanceById = async (id) => {
  try {
    const endpoint = getEndpoint(`/admin/attendances/${id}`, `/operator/attendances/${id}`);
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance by ID:', error);
    throw error.response?.data || { message: 'Gagal mengambil data kehadiran' };
  }
};

// Mendapatkan data kehadiran berdasarkan student ID
export const getAttendancesByStudentId = async (studentId) => {
  try {
    const endpoint = getEndpoint(
      `/admin/attendances/student/${studentId}`,
      `/operator/attendances/student/${studentId}`
    );
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendances by student ID:', error);
    throw error.response?.data || { message: 'Gagal mengambil data kehadiran siswa' };
  }
};

// Mendapatkan data kehadiran berdasarkan rentang tanggal
export const getAttendancesByDateRange = async (startDate, endDate) => {
  try {
    const endpoint = getEndpoint(
      `/admin/attendances/date-range`,
      `/operator/attendances/date-range`
    );
    const response = await api.get(endpoint, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendances by date range:', error);
    throw error.response?.data || { message: 'Gagal mengambil data kehadiran berdasarkan rentang tanggal' };
  }
};

// Membuat data kehadiran baru
export const createAttendance = async (attendanceData) => {
  try {
    const endpoint = getEndpoint('/admin/attendances', '/operator/attendances');
    
    // Format data sesuai dengan yang diharapkan backend
    const formattedData = {
      student_id: attendanceData.student_id,
      date: attendanceData.date,
      status: attendanceData.status,
      rfid_scan_time: `${attendanceData.date} ${attendanceData.rfid_scan_time}`
    };
    
    console.log('Sending attendance data:', formattedData);
    
    const response = await api.post(endpoint, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating attendance:', error);
    console.error('Response data:', error.response?.data);
    throw error.response?.data || { message: 'Gagal membuat data kehadiran' };
  }
};

// Memperbarui data kehadiran
export const updateAttendance = async (id, attendanceData) => {
  try {
    const endpoint = getEndpoint(
      `/admin/attendances/${id}`,
      `/operator/attendances/${id}`
    );
    
    // Format data sesuai dengan yang diharapkan backend
    const formattedData = {
      student_id: attendanceData.student_id,
      date: attendanceData.date,
      status: attendanceData.status,
      rfid_scan_time: `${attendanceData.date} ${attendanceData.rfid_scan_time}`
    };
    
    const response = await api.post(endpoint, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error updating attendance:', error);
    console.error('Response data:', error.response?.data);
    throw error.response?.data || { message: 'Gagal memperbarui data kehadiran' };
  }
};

// Menghapus data kehadiran
export const deleteAttendance = async (id) => {
  try {
    const endpoint = getEndpoint(
      `/admin/attendances/${id}`,
      `/operator/attendances/${id}`
    );
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error deleting attendance:', error);
    throw error.response?.data || { message: 'Gagal menghapus data kehadiran' };
  }
};

// Import data kehadiran dari Excel
export const importAttendances = async (formData) => {
  try {
    const endpoint = getEndpoint(
      '/admin/attendances/import',
      '/operator/attendances/import'
    );
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error importing attendances:', error);
    throw error.response?.data || { message: 'Gagal mengimpor data kehadiran' };
  }
};

// Export data kehadiran ke Excel
export const exportAttendances = async (filters = {}) => {
  try {
    const endpoint = getEndpoint(
      '/admin/attendances/export',
      '/operator/attendances/export'
    );
    const response = await api.get(endpoint, {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting attendances:', error);
    throw error.response?.data || { message: 'Gagal mengekspor data kehadiran' };
  }
};

// Mendapatkan daftar siswa untuk kehadiran berdasarkan class ID
export const getStudentsForAttendance = async (classId) => {
  try {
    const endpoint = getEndpoint(
      '/admin/students',
      '/operator/students'
    );
    // Coba ambil dari endpoint langsung
    const response = await api.get(endpoint, {
      params: { class_id: classId }
    });
    console.log(`Fetching students for class ${classId}:`, response.data);
    
    // Check format response
    if (response.data && Array.isArray(response.data)) {
      // Filter siswa berdasarkan class_id jika response belum difilter oleh server
      const filteredStudents = response.data.filter(student => 
        student.class_id === parseInt(classId) || student.class_id === classId
      );
      
      return { data: filteredStudents };
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // Jika response sudah dalam format data.data
      return response.data;
    } else {
      console.error(`Unexpected response format for students in class ${classId}:`, response.data);
      return { data: [] };
    }
  } catch (error) {
    console.error(`Error fetching students for class ${classId}:`, error);
    throw error.response?.data || { message: 'Gagal mengambil data siswa' };
  }
};

// Mendapatkan daftar kelas untuk dropdown
export const getClasses = async () => {
  try {
    const endpoint = getEndpoint(
      '/admin/classes',
      '/operator/classes'
    );
    const response = await api.get(endpoint);
    console.log('Fetching classes:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error.response?.data || { message: 'Gagal mengambil data kelas' };
  }
};

// Mendapatkan daftar jurusan untuk dropdown
export const getMajors = async () => {
  try {
    const endpoint = getEndpoint(
      '/admin/school_majors',
      '/operator/school_majors'
    );
    const response = await api.get(endpoint);
    console.log('Fetching majors:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching majors:', error);
    throw error.response?.data || { message: 'Gagal mengambil data jurusan' };
  }
};

// Menandai kehadiran beberapa siswa sekaligus
export const markBulkAttendance = async (attendancesData) => {
  try {
    const endpoint = getEndpoint(
      '/admin/attendances/bulk',
      '/operator/attendances/bulk'
    );
    
    // Format data untuk sesuai dengan harapan API
    const formattedData = {
      attendances: attendancesData.map(item => ({
        student_id: item.student_id,
        date: item.date,
        status: item.status,
        rfid_scan_time: `${item.date} ${item.rfid_scan_time}`
      }))
    };
    
    const response = await api.post(endpoint, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    console.error('Response data:', error.response?.data);
    throw error.response?.data || { message: 'Gagal menandai kehadiran massal' };
  }
};

export default {
  getAttendances,
  getAttendanceById,
  getAttendancesByStudentId,
  getAttendancesByDateRange,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  importAttendances,
  exportAttendances,
  getStudentsForAttendance,
  getClasses,
  getMajors,
  markBulkAttendance
};