// AttendanceStatistics.jsx
import React, { useState, useEffect } from 'react';
import MajorSelector from './MajorSelector';
import ClassSelector from './ClassSelector';
import StatisticsChart from './StatisticsChart';
import { getAttendanceStatistics } from '../../../services/Admin/dashboardService';

const AttendanceStatistics = () => {
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const data = await getAttendanceStatistics(
          selectedMajor || null,
          selectedClass || null
        );
        setStatistics(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch attendance statistics:', err);
        setError('Failed to load attendance statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedMajor, selectedClass]);

  const handleMajorChange = (majorId) => {
    setSelectedMajor(majorId);
    setSelectedClass(''); // Reset class selection when major changes
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Statistik Kehadiran</h2>
      <p className="text-sm text-gray-500 mb-4">Persentase kehadiran siswa dalam 7 hari terakhir</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <MajorSelector value={selectedMajor} onChange={handleMajorChange} />
        <ClassSelector 
          value={selectedClass} 
          onChange={handleClassChange} 
          majorId={selectedMajor} 
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <StatisticsChart data={statistics} />
      )}
    </div>
  );
};

export default AttendanceStatistics;