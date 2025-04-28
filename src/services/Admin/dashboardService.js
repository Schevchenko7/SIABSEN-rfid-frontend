// services/dashboardService.js
import api from '../../utils/axios';
import { getUserRole } from '../auth';

// Function untuk mendapatkan endpoint berdasarkan role user
const getEndpoint = (adminPath, operatorPath = null) => {
  const role = getUserRole();
  // Jika operatorPath tidak disediakan, gunakan adminPath untuk operator
  const operatorEndpoint = operatorPath || adminPath.replace('/admin/', '/operator/');
  
  return role === 'admin' ? adminPath : operatorEndpoint;
};

// Get dashboard summary data (total students, classes, etc.)
export const getDashboardSummary = async () => {
  try {
    // Fetching students
    const studentsEndpoint = getEndpoint('/admin/students');
    const studentsResponse = await api.get(studentsEndpoint);
    const students = studentsResponse.data;
    
    // Fetching classes
    const classesEndpoint = getEndpoint('/admin/classes');
    const classesResponse = await api.get(classesEndpoint);
    const classes = classesResponse.data;
    
    // Fetching majors
    const majorsEndpoint = getEndpoint('/admin/school_majors');
    const majorsResponse = await api.get(majorsEndpoint);
    const majors = majorsResponse.data;
    
    // Return summary data
    return {
      totalStudents: Array.isArray(students) ? students.length : (students.data ? students.data.length : 0),
      totalClasses: Array.isArray(classes) ? classes.length : (classes.data ? classes.data.length : 0),
      totalMajors: Array.isArray(majors) ? majors.length : (majors.data ? majors.data.length : 0)
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

// Get attendance statistics for the last 7 days
export const getAttendanceStatistics = async (majorId = null, classId = null) => {
  try {
    // Get current date
    const today = new Date();
    
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // Get the last 7 days (including today)
    
    // Format dates for API
    const startDate = formatDate(sevenDaysAgo);
    const endDate = formatDate(today);
    
    // Prepare parameters
    const params = { startDate, endDate };
    
    // Add optional filters if provided
    if (majorId) params.school_major_id = majorId;
    if (classId) params.class_id = classId;
    
    // Fetch attendance data for date range
    const endpoint = getEndpoint('/admin/attendances');
    const response = await api.get(endpoint, { params });
    const attendances = response.data;
    
    // Process data to get statistics by day
    return processAttendanceData(attendances, sevenDaysAgo, today);
  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    throw error;
  }
};

// Get recent attendance activities
export const getRecentActivities = async (limit = 5) => {
  try {
    const endpoint = getEndpoint('/admin/attendances');
    const response = await api.get(endpoint, {
      params: { limit, sort: 'desc' }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

// Helper function to process attendance data into chart format
const processAttendanceData = (attendances, startDate, endDate) => {
  // Create array of dates for the last 7 days
  const dates = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Initialize counters for each status type
  const statistics = dates.map(date => {
    const dayName = getDayName(date);
    return {
      date: formatDate(date),
      dayName,
      present: 0,
      late: 0,
      absent: 0
    };
  });
  
  // Determine if attendances is an array or has a data property
  const attendanceData = Array.isArray(attendances) ? 
    attendances : 
    (attendances.data ? attendances.data : []);
  
  // Count attendance status for each day
  attendanceData.forEach(attendance => {
    const attendanceDate = attendance.date;
    const dayIndex = statistics.findIndex(stat => stat.date === attendanceDate);
    
    if (dayIndex !== -1) {
      // Update the appropriate counter based on status
      const status = attendance.status.toLowerCase();
      if (status === 'present' || status === 'hadir') {
        statistics[dayIndex].present++;
      } else if (status === 'late' || status === 'terlambat') {
        statistics[dayIndex].late++;
      } else if (status === 'absent' || status === 'without explanation' || status === 'tanpa keterangan') {
        statistics[dayIndex].absent++;
      }
    }
  });
  
  return statistics;
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get day name
const getDayName = (date) => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[date.getDay()];
};

export default {
  getDashboardSummary,
  getAttendanceStatistics,
  getRecentActivities
};