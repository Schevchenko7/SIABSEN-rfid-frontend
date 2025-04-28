import React from 'react';
import { format } from 'date-fns';
import { User, Calendar, Clock, Tag, Eye } from 'lucide-react';

const AttendancesItem = ({ attendance, index, onView }) => {
  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Sick':
        return 'bg-blue-100 text-blue-800';
      case 'Leave':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {attendance.student?.full_name || 'Unknown Student'}
          </h3>
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(attendance.status)}`}>
            {attendance.status || '-'}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <User size={16} className="mr-2 text-gray-400" />
            <span>NISN: {attendance.student?.nisn || '-'}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2 text-gray-400" />
            <span>Date: {formatDate(attendance.date)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2 text-gray-400" />
            <span>Scan Time: {formatTime(attendance.rfid_scan_time)}</span>
          </div>
          
          {attendance.student?.class_id && (
            <div className="flex items-center text-sm text-gray-600">
              <Tag size={16} className="mr-2 text-gray-400" />
              <span>Class ID: {attendance.student.class_id}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 mt-3 pt-3 border-t">
          <button
            onClick={() => onView(attendance)}
            className="text-amber-500 hover:text-amber-700 p-1 rounded hover:bg-amber-50 flex items-center"
            title="View details"
            aria-label="View details"
          >
            <Eye size={16} className="mr-1" />
            <span className="text-sm">View</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendancesItem;