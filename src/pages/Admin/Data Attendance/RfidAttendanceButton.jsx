import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Loader, UserCheck, Clock } from 'lucide-react';
import Button from '../../../components/UI/Button';
import Modal from '../../../components/UI/Modal';
import attendancesService from '../../../services/Admin/attendancesService';

const RfidAttendanceButton = ({ onAttendanceMarked }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [status, setStatus] = useState('Present');
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  const statusOptions = ['Present', 'Late', 'Absent', 'Sick', 'Leave'];
  
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await attendancesService.getClasses();
        if (response && (Array.isArray(response) || Array.isArray(response.data))) {
          const classesData = Array.isArray(response) ? response : response.data;
          setClasses(classesData);
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        toast.error('Failed to load classes');
      }
    };
    
    fetchClasses();
  }, []);
  
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await attendancesService.getStudentsForAttendance(selectedClass);
        if (response && (Array.isArray(response) || Array.isArray(response.data))) {
          const studentsData = Array.isArray(response) ? response : response.data;
          setStudents(studentsData);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
        toast.error('Failed to load students');
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudents();
  }, [selectedClass]);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent('');
    setStatus('Present');
  };
  
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  };
  
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0]; // HH:MM:SS
  };
  
  const handleMarkAttendance = async () => {
    if (!selectedStudent) {
      toast.warn('Please select a student');
      return;
    }
    
    setIsLoading(true);
    try {
      const currentDate = getCurrentDate();
      const currentTime = getCurrentTime();
      
      const attendanceData = {
        student_id: selectedStudent,
        date: currentDate,
        status: status,
        rfid_scan_time: currentTime
      };
      
      await attendancesService.createAttendance(attendanceData);
      toast.success('Attendance marked successfully');
      
      if (onAttendanceMarked && typeof onAttendanceMarked === 'function') {
        onAttendanceMarked();
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      toast.error('Failed to mark attendance');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Button
        variant="success"
        onClick={handleOpenModal}
        className="flex items-center bg-green-600 hover:bg-green-700"
      >
        <UserCheck size={18} className="mr-1" /> Manual RFID
      </Button>
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Manual RFID Attendance"
      >
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">Select Class</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
              disabled={isLoading || !selectedClass || students.length === 0}
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} ({student.nisn || 'No NISN'})
                </option>
              ))}
            </select>
            {isLoading && (
              <div className="flex items-center mt-1 text-gray-500 text-sm">
                <Loader size={14} className="animate-spin mr-1" /> Loading students...
              </div>
            )}
            {!isLoading && selectedClass && students.length === 0 && (
              <p className="text-orange-500 text-sm mt-1">No students found in this class</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
            <div className="flex items-center p-2 bg-gray-50 border rounded text-gray-700">
              <Clock size={16} className="mr-2" />
              <span>
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Current date and time will be used for attendance
            </p>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="secondary" onClick={handleCloseModal} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleMarkAttendance} 
              disabled={isLoading || !selectedStudent}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" /> Processing
                </>
              ) : (
                'Mark Attendance'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RfidAttendanceButton;