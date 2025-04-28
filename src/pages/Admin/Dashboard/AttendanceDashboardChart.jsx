import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dashboardService from '../../../services/Admin/dashboardService';
import attendancesService from '../../../services/Admin/attendancesService';

const AttendanceDashboardChart = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [majors, setMajors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [totalStudents, setTotalStudents] = useState(0);

  // Fetch majors on component mount
  useEffect(() => {
    fetchMajors();
    fetchClasses();
  }, []);

  // Fetch majors function
  const fetchMajors = async () => {
    setIsLoading(true);
    try {
      const result = await attendancesService.getMajors();
      if (result && Array.isArray(result.data)) {
        setMajors(result.data);
      } else if (result && Array.isArray(result)) {
        setMajors(result);
      } else {
        setMajors([]);
        console.error('Unexpected majors response format:', result);
      }
    } catch (error) {
      console.error('Failed to fetch majors:', error);
      setError('Gagal mengambil data jurusan');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch classes function
  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const result = await attendancesService.getClasses();
      
      if (result && Array.isArray(result.data)) {
        setClasses(result.data);
      } else if (result && Array.isArray(result)) {
        setClasses(result);
      } else {
        setClasses([]);
        console.error('Unexpected classes response format:', result);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setError('Gagal mengambil data kelas');
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch classes when selected major changes
  useEffect(() => {
    if (selectedMajor) {
      fetchClassesForMajor(selectedMajor);
    } else {
      fetchClasses(); // Fetch all classes if no major is selected
    }
  }, [selectedMajor]);

  // Function to fetch classes filtered by major
  const fetchClassesForMajor = async (majorId) => {
    setIsLoading(true);
    try {
      // Using getClasses since there's no specific endpoint for filtering by major
      const result = await attendancesService.getClasses();
      
      let filteredClasses = [];
      if (result && Array.isArray(result.data)) {
        filteredClasses = result.data.filter(classItem => 
          String(classItem.school_major_id) === String(majorId)
        );
        setClasses(filteredClasses);
      } else if (result && Array.isArray(result)) {
        filteredClasses = result.filter(classItem => 
          String(classItem.school_major_id) === String(majorId)
        );
        setClasses(filteredClasses);
      } else {
        setClasses([]);
        console.error('Unexpected classes response format:', result);
      }
    } catch (error) {
      console.error('Failed to fetch classes for major:', error);
      setError('Gagal mengambil data kelas untuk jurusan yang dipilih');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attendance data based on filters
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        
        const statistics = await dashboardService.getAttendanceStatistics(
          selectedMajor || null,
          selectedClass || null
        );
        
        setAttendanceData(statistics);
        
        // If a class is selected, fetch student count for that class
        if (selectedClass) {
          fetchStudentsCountForClass(selectedClass);
        } else {
          // Set default maximum value for total students
          setTotalStudents(1000);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Gagal mengambil data kehadiran');
        setIsLoading(false);
        console.error('Error fetching attendance data:', err);
      }
    };

    fetchAttendanceData();
  }, [selectedMajor, selectedClass]);

  // Function to fetch students count for a specific class
  const fetchStudentsCountForClass = async (classId) => {
    if (!classId) return;
    
    try {
      const result = await attendancesService.getStudentsForAttendance(classId);
      
      let studentsCount = 0;
      if (result && Array.isArray(result.data)) {
        studentsCount = result.data.length;
      } else if (Array.isArray(result)) {
        studentsCount = result.length;
      }
      
      // Ensure we never exceed 1000 for the maximum count
      setTotalStudents(Math.min(studentsCount || 1, 1000));
    } catch (error) {
      console.error('Failed to fetch students count for class:', error);
      // Set to default max value in case of error
      setTotalStudents(1000);
    }
  };

  // Handle major selection change
  const handleMajorChange = (e) => {
    const majorId = e.target.value;
    setSelectedMajor(majorId);
    setSelectedClass(''); // Reset selected class when major changes
  };

  // Handle class selection change
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
  };

  // Custom tooltip to display information when hovering over data points
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="text-red-500 text-center py-6">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-bold mb-2 md:mb-0">Statistik Kehadiran (7 Hari Terakhir)</h2>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {/* Major Selection */}
          <select
            value={selectedMajor}
            onChange={handleMajorChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Semua Jurusan</option>
            {majors.map((major) => (
              <option key={major.id} value={major.id}>
                {major.major_name || major.name}
              </option>
            ))}
          </select>
          
          {/* Class Selection */}
          <select
            value={selectedClass}
            onChange={handleClassChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Semua Kelas</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.class_name || classItem.name}
                {classItem.school_major && ` - ${classItem.school_major.major_name}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Memuat data kehadiran...</div>
        </div>
      ) : attendanceData.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Tidak ada data kehadiran untuk ditampilkan</div>
        </div>
      ) : (
        <div className="h-64 md:h-80 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={attendanceData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="dayName" 
                tick={{ fontSize: 12 }}
                height={50}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="present"
                name="Hadir"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="late"
                name="Terlambat"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="absent"
                name="Tidak Hadir"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-gray-500">
        <div>
          Total Maksimum Siswa: {totalStudents}
        </div>
        <div>
          {selectedMajor && classes.find(c => c.id.toString() === selectedClass)?.name ? 
            `Filter: ${majors.find(m => m.id.toString() === selectedMajor)?.major_name || majors.find(m => m.id.toString() === selectedMajor)?.name} - ${classes.find(c => c.id.toString() === selectedClass).class_name || classes.find(c => c.id.toString() === selectedClass).name}` : 
            selectedMajor ? 
              `Filter: ${majors.find(m => m.id.toString() === selectedMajor)?.major_name || majors.find(m => m.id.toString() === selectedMajor)?.name}` : 
              'Menampilkan semua data'
          }
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboardChart;