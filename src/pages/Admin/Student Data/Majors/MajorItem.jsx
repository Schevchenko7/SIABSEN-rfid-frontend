import React from 'react';
import { ChevronRight, Edit, Trash2 } from 'lucide-react';

const MajorItem = ({ major, onSelect, onEdit, onDelete, isSelected }) => {
  const handleItemClick = () => {
    onSelect(major);
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer
        ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
      onClick={handleItemClick}
    >
      <div className="flex items-center space-x-2 flex-grow">
        <div className="flex-grow">
          <h3 className="font-medium">{major.major_name}</h3>
        </div>
        <ChevronRight className="text-gray-400" size={20} />
      </div>
      <div className="flex space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
        <button
          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(major);
          }}
          title="Edit major"
        >
          <Edit size={18} />
        </button>
        <button
          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(major.id);
          }}
          title="Delete major"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default MajorItem;