import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';

const ClassItem = ({ classItem, onSelect, onEdit, onDelete, isSelected }) => {
  const handleSelect = () => {
    onSelect(classItem);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(classItem);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(classItem.id);
  };

  return (
    <div
      onClick={handleSelect}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900">{classItem.class_name}</h3>
          <p className="text-sm text-gray-500">ID-{String(classItem.id).padStart(4, '0')}</p>
          
          {/* Display major name if available */}
          {classItem.major_name && (
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium">Major:</span> {classItem.major_name}
            </p>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(classItem);
            }}
            className="text-amber-500 hover:text-amber-700 p-1 rounded hover:bg-amber-50"
            title="View details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={handleEdit}
            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
            title="Edit class"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
            title="Delete class"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassItem;