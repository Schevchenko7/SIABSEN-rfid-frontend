import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';

const UsersItem = ({ user, index, displayNumber, onView, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
        {displayNumber}
      </td>
      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
        {user?.id || ''}
      </td>
      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {user?.name || ''}
      </td>
      <td className="hidden md:table-cell px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
        {user?.email || ''}
      </td>
      <td className="hidden md:table-cell px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${user?.role === 'admin' ? 'bg-green-100 text-green-800' : 
            user?.role === 'sub-admin' ? 'bg-purple-100 text-purple-800' : 
            'bg-blue-100 text-blue-800'}`}>
          {user?.role || ''}
        </span>
      </td>
      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-1 sm:space-x-2">
          <button
            onClick={() => onView(user)}
            className="text-amber-500 hover:text-amber-700 p-1 rounded hover:bg-amber-50"
            title="View details"
            aria-label="View details"
          >
            <Eye size={16} className="sm:size-18" />
          </button>
          <button
            onClick={() => onEdit(user)}
            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
            title="Edit user"
            aria-label="Edit user"
          >
            <Edit size={16} className="sm:size-18" />
          </button>
          <button
            onClick={() => user?.id ? onDelete(user.id) : null}
            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
            title="Delete user"
            aria-label="Delete user"
            disabled={!user?.id}
          >
            <Trash2 size={16} className="sm:size-18" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UsersItem;