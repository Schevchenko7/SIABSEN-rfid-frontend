import React, { useState, useEffect, useRef } from 'react';
import Button from '../../../../components/UI/Button';

// Modified StudentForm with viewing capabilities only
const StudentForm = ({ student, classId, onCancel }) => {
  const [formData, setFormData] = useState({
    nisn: '',
    full_name: '',
    rfid_tag: '',
    date_of_birth: '',
    gender: 'Male',
    class_id: classId || ''
  });
  
  useEffect(() => {
    if (student) {
      const dateOfBirth = student.date_of_birth 
        ? new Date(student.date_of_birth).toISOString().split('T')[0]
        : '';
        
      setFormData({
        nisn: student.nisn || '',
        full_name: student.full_name || '',
        rfid_tag: student.rfid_tag || '',
        date_of_birth: dateOfBirth,
        gender: student.gender || 'Male',
        class_id: student.class_id || classId || ''
      });
    } else {
      setFormData({
        nisn: '',
        full_name: '',
        rfid_tag: '',
        date_of_birth: '',
        gender: 'Male',
        class_id: classId || ''
      });
    }
  }, [student, classId]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 mb-1">
          NISN
        </label>
        <input
          type="text"
          id="nisn"
          name="nisn"
          value={formData.nisn}
          readOnly
          className="w-full px-3 py-2 border rounded-md focus:outline-none bg-gray-50 border-gray-300 text-gray-500"
        />
      </div>
      
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          readOnly
          className="w-full px-3 py-2 border rounded-md focus:outline-none bg-gray-50 border-gray-300 text-gray-500"
        />
      </div>
      
      <div>
        <label htmlFor="rfid_tag" className="block text-sm font-medium text-gray-700 mb-1">
          RFID Tag
        </label>
        <input
          type="text"
          id="rfid_tag"
          name="rfid_tag"
          value={formData.rfid_tag || 'Not assigned'}
          readOnly
          className="w-full px-3 py-2 border rounded-md focus:outline-none bg-gray-50 border-gray-300 text-gray-500"
        />
      </div>
      
      <div>
        <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth
        </label>
        <input
          type="date"
          id="date_of_birth"
          name="date_of_birth"
          value={formData.date_of_birth}
          readOnly
          className="w-full px-3 py-2 border rounded-md focus:outline-none bg-gray-50 border-gray-300 text-gray-500"
        />
      </div>
      
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
          Gender
        </label>
        <input
          type="text"
          id="gender"
          name="gender"
          value={formData.gender}
          readOnly
          className="w-full px-3 py-2 border rounded-md focus:outline-none bg-gray-50 border-gray-300 text-gray-500"
        />
      </div>
      
      <div>
        <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-1">
          Class ID
        </label>
        <input
          type="text"
          id="class_id"
          name="class_id"
          value={formData.class_id}
          readOnly
          className="w-full px-3 py-2 border rounded-md focus:outline-none bg-gray-50 border-gray-300 text-gray-500"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="secondary" onClick={onCancel} type="button">
          Close
        </Button>
      </div>
    </div>
  );
};

export default StudentForm;