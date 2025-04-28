// MajorSelector.jsx
import React, { useState, useEffect } from 'react';
import { getMajors } from '../../../services/Admin/majorsService';

const MajorSelector = ({ value, onChange }) => {
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        setLoading(true);
        const data = await getMajors();
        setMajors(data);
      } catch (err) {
        console.error('Failed to fetch majors:', err);
        setError('Failed to load majors');
      } finally {
        setLoading(false);
      }
    };

    fetchMajors();
  }, []);

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
      <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Jurusan:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Semua Jurusan</option>
        {majors.map((major) => (
          <option key={major.id} value={major.id}>
            {major.major_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MajorSelector;