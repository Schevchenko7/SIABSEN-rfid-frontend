import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import attendancesService from '../../../services/Admin/attendancesService';
import Button from '../../../components/UI/Button';

const AttendancesForm = ({ attendance, onSubmit, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Present',
    rfid_scan_time: format(new Date(), 'HH:mm:ss'),
    class_id: ''
  });
  
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');

  // Status options
  const statusOptions = ['Present', 'Late', 'Absent', 'Sick', 'Leave'];

  // Load classes, majors, and all students on component mount
  useEffect(() => {
    fetchMajors();
    fetchClasses();

    // If editing existing attendance
    if (attendance) {
      try {
        // Format date and time
        const formattedDate = attendance.date 
          ? format(new Date(attendance.date), 'yyyy-MM-dd')
          : format(new Date(), 'yyyy-MM-dd');

        let formattedTime = format(new Date(), 'HH:mm:ss');
        if (attendance.rfid_scan_time) {
          if (attendance.rfid_scan_time.includes('T')) {
            formattedTime = format(new Date(attendance.rfid_scan_time), 'HH:mm:ss');
          } else if (attendance.rfid_scan_time.includes(' ')) {
            formattedTime = attendance.rfid_scan_time.split(' ')[1];
          } else {
            formattedTime = attendance.rfid_scan_time;
          }
        }

        setFormData({
          id: attendance.id,
          student_id: attendance.student_id || (attendance.student ? attendance.student.id : ''),
          date: formattedDate,
          status: attendance.status || 'Present',
          rfid_scan_time: formattedTime,
          class_id: attendance.class_id || (attendance.student && attendance.student.class_id ? attendance.student.class_id : '')
        });

        if (attendance.student && attendance.student.class && attendance.student.class.school_major_id) {
          setSelectedMajor(attendance.student.class.school_major_id.toString());
        }
        
        if (attendance.class_id || (attendance.student && attendance.student.class_id)) {
          const classId = attendance.class_id || attendance.student.class_id;
          setSelectedClass(classId.toString());
          // Muat siswa untuk kelas tersebut
          fetchStudentsForClass(classId.toString());
        }
      } catch (error) {
        console.error('Error formatting attendance data:', error);
        toast.error('Error menyiapkan data formulir');
      }
    }
  }, [attendance]);

  // Fetch majors
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
      toast.error('Gagal mengambil data jurusan');
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

  // Effect to fetch students when selected class changes
  useEffect(() => {
    if (selectedClass) {
      fetchStudentsForClass(selectedClass);
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  // Function to fetch all classes
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
      toast.error('Gagal mengambil data kelas');
    } finally {
      setIsLoading(false);
    }
  };

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
      toast.error('Gagal mengambil data kelas untuk jurusan yang dipilih');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch students for a specific class
  const fetchStudentsForClass = async (classId) => {
    if (!classId) return;
    
    setIsLoading(true);
    try {
      const result = await attendancesService.getStudentsForAttendance(classId);
      
      if (result && Array.isArray(result.data)) {
        setStudents(result.data);
      } else if (Array.isArray(result)) {
        setStudents(result);
      } else {
        setStudents([]);
        console.error('Unexpected students response format:', result);
      }
    } catch (error) {
      console.error('Failed to fetch students for class:', error);
      toast.error('Gagal mengambil data siswa untuk kelas yang dipilih');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMajorChange = (e) => {
    const majorId = e.target.value;
    setSelectedMajor(majorId);
    setSelectedClass('');
    setFormData(prev => ({ ...prev, class_id: '', student_id: '' }));
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setFormData(prev => ({ ...prev, class_id: classId, student_id: '' }));
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setFormData(prev => ({ ...prev, student_id: studentId }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.student_id || !formData.date || !formData.status || !formData.class_id) {
        toast.error('Mohon isi semua field yang wajib diisi');
        setIsLoading(false);
        return;
      }
      
      // Prepare the data in the format expected by the server
      const dataToSubmit = {
        ...formData,
        // Pastikan student_id adalah integer (bukan string)
        student_id: parseInt(formData.student_id, 10),
        // Tidak perlu mengirim class_id ke API karena tidak ada di response contoh
        date: format(new Date(formData.date), 'yyyy-MM-dd')
        // rfid_scan_time akan diformat di service
      };
      
      // Submit to parent component
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Error saat mengirim formulir');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Major Selection */}
        <div>
          <label htmlFor="school_major_id" className="block text-sm font-medium text-gray-700 mb-1">
            Jurusan
          </label>
          <select
            id="school_major_id"
            name="school_major_id"
            value={selectedMajor}
            onChange={handleMajorChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Semua Jurusan</option>
            {majors.map(major => (
              <option key={major.id} value={major.id}>
                {major.major_name}
              </option>
            ))}
          </select>
          {isLoading && <p className="text-sm text-gray-500 mt-1">Memuat jurusan...</p>}
        </div>

        {/* Class Selection */}
        <div>
          <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-1">
            Kelas <span className="text-red-500">*</span>
          </label>
          <select
            id="class_id"
            name="class_id"
            value={formData.class_id}
            onChange={handleClassChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoading}
          >
            <option value="">Pilih Kelas</option>
            {classes.map(classItem => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.class_name || classItem.name}
                {classItem.school_major && ` - ${classItem.school_major.major_name}`}
              </option>
            ))}
          </select>
          {isLoading && <p className="text-sm text-gray-500 mt-1">Memuat kelas...</p>}
        </div>

        {/* Student Selection */}
        <div>
          <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">
            Siswa <span className="text-red-500">*</span>
          </label>
          <select
            id="student_id"
            name="student_id"
            value={formData.student_id}
            onChange={handleStudentChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoading || !selectedClass}
          >
            <option value="">Pilih Siswa</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.full_name || student.name} - {student.nisn || student.nis || 'N/A'} 
                {student.class ? ` (${student.class.class_name})` : student.class_name ? ` (${student.class_name})` : ''}
              </option>
            ))}
          </select>
          {isLoading && <p className="text-sm text-gray-500 mt-1">Memuat siswa...</p>}
          {selectedClass && students.length === 0 && !isLoading && (
            <p className="text-sm text-red-500 mt-1">Tidak ada siswa yang ditemukan untuk kelas ini</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Scan Time */}
        <div>
          <label htmlFor="rfid_scan_time" className="block text-sm font-medium text-gray-700 mb-1">
            Waktu Scan
          </label>
          <input
            type="time"
            id="rfid_scan_time"
            name="rfid_scan_time"
            value={formData.rfid_scan_time.split(':').slice(0, 2).join(':')}
            onChange={(e) => {
              // Append seconds to maintain consistency with API format
              setFormData(prev => ({ ...prev, rfid_scan_time: `${e.target.value}:00` }));
            }}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isLoading ? 'Menyimpan...' : attendance ? 'Perbarui' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
};

export default AttendancesForm;