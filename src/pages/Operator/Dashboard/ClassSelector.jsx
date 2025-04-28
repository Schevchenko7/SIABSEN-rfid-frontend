// ClassSelector.jsx
import React, { useState, useEffect } from 'react';
import { getClasses, getClassesByMajor } from '../../../services/Admin/classesService';

const ClassSelector = ({ value, onChange, majorId }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        let data;
        
        if (majorId) {
          data = await getClassesByMajor(majorId);
        } else {
          data = await getClasses();
        }
        
        setClasses(data);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
        setError('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [majorId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-sm">{error}</p>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Semua Kelas</option>
        {classes.map((classItem) => (
          <option key={classItem.id} value={classItem.id}>
            {classItem.class_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ClassSelector;