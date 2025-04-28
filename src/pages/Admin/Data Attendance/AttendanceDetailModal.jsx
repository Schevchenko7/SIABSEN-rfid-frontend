import React from 'react';
import { format } from 'date-fns';
import Modal from '../../../components/UI/Modal';
import { ArrowLeft } from 'lucide-react';

const AttendanceDetailModal = ({ isOpen, onClose, attendance }) => {
  // Format date safely
  const formatDate = (dateString) => {
    try {
      return dateString ? format(new Date(dateString), 'dd-MM-yyyy') : '-';
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString || '-';
    }
  };

  // Format time safely
  const formatTime = (timeString) => {
    try {
      if (!timeString) return '-';
      
      // Handle different time formats
      if (timeString.includes('T')) {
        return format(new Date(timeString), 'HH:mm:ss');
      } else if (timeString.includes(' ')) {
        // Extract just the time part if it's in format "2025-04-10 07:45:00"
        return timeString.split(' ')[1];
      }
      return timeString;
    } catch (error) {
      console.error("Time formatting error:", error);
      return timeString || '-';
    }
  };

  // Determine status color
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Sick': return 'bg-blue-100 text-blue-800';
      case 'Leave': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!attendance) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="md">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="md"
    >
      <div className="bg-white overflow-hidden rounded-lg">
        {/* Header with back button */}
        <div className="bg-indigo-600 text-white p-4">
          <div className="flex items-center">
            
            <h2 className="text-xl font-semibold">Student Details</h2>
          </div>
        </div>
        
        {/* Student Basic Info */}
        <div className="p-5 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            {attendance.student?.full_name || '-'}
          </h3>
          <p className="text-gray-500">NISN: {attendance.student?.nisn || '-'}</p>
        </div>
        
        {/* Student Information */}
        <div className="p-5 border-b">
          <h4 className="text-base font-semibold mb-3 text-gray-700">Student Information</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Class</p>
              <p className="font-medium">{attendance.student?.class?.class_name || attendance.student?.class_name || '-'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">RFID Tag</p>
              <p className="font-medium">{attendance.student?.rfid_tag || '-'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium">{attendance.student?.gender || '-'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Class ID</p>
              <p className="font-medium">{attendance.student?.class_id || '-'}</p>
            </div>
          </div>
        </div>
        
        {/* Attendance Information */}
        <div className="p-5">
          <h4 className="text-base font-semibold mb-3 text-gray-700">Attendance Information</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{formatDate(attendance.date)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Scan Time</p>
              <p className="font-medium">{formatTime(attendance.rfid_scan_time)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(attendance.status)}`}>
                {attendance.status || '-'}
              </span>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">{formatTime(attendance.created_at)}</p>
            </div>
            
            <div className="sm:col-span-2">
              <p className="text-sm text-gray-500">Updated At</p>
              <p className="font-medium">{formatTime(attendance.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AttendanceDetailModal;