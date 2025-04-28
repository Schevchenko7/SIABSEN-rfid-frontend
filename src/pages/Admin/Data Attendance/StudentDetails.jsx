import React from 'react';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

const StudentDetails = ({ student, onClose }) => {
  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString || '-';
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      {/* Purple header with back button */}
      <div className="bg-indigo-600 text-white p-4">
        <div className="flex items-center">
          <button 
            onClick={onClose}
            className="mr-3 text-white hover:text-indigo-100"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">Student Details</h2>
        </div>
      </div>
      
      {/* Student Name and NISN */}
      <div className="p-6 border-b">
        <h3 className="text-2xl font-bold text-gray-800">
          {student?.full_name || '-'}
        </h3>
        <p className="text-gray-500">NISN: {student?.nisn || '-'}</p>
      </div>
      
      {/* Student Information Section */}
      <div className="p-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Student Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InfoField label="Full Name" value={student?.full_name} />
            <InfoField label="NISN" value={student?.nisn} />
            <InfoField label="Gender" value={student?.gender} />
            <InfoField label="Date of Birth" value={formatDate(student?.birth_date)} />
          </div>
          
          <div className="space-y-4">
            <InfoField label="Class" value={student?.class?.class_name || student?.class_name} />
            <InfoField label="RFID Tag" value={student?.rfid_tag} />
            <InfoField label="Class ID" value={student?.class_id} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable information field component
const InfoField = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value || '-'}</p>
  </div>
);

export default StudentDetails;