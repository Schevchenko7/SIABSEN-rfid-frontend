import React from 'react';
import { Eye } from 'lucide-react';

const StudentItem = ({ student, onSelect, isSelected }) => {
  return (
    <div
      onClick={() => onSelect(student)}
      className={`border rounded-md p-4 mb-2 shadow-sm transition-all cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-indigo-50 border-indigo-500' : 'bg-white'
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{student.full_name}</h3>
          <p className="text-sm text-gray-600">NISN: {student.nisn}</p>
        </div>
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(student);
            }}
            className="text-indigo-500 hover:text-indigo-700"
            title="View Details"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mt-2 text-gray-700">
        <div>
          <span className="text-gray-500">RFID:</span> {student.rfid_tag || 'N/A'}
        </div>
        <div>
          <span className="text-gray-500">Gender:</span> {student.gender}
        </div>
        <div>
          <span className="text-gray-500">Date of Birth:</span>{' '}
          {new Date(student.date_of_birth).toLocaleDateString()}
        </div>
        <div>
          <span className="text-gray-500">Class ID:</span> {student.class_id}
        </div>
      </div>
    </div>
  );
};

export default StudentItem;