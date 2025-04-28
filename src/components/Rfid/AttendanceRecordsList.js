import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceRecordsList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAttendanceRecords();
  }, []);
  
  const fetchAttendanceRecords = async () => {
    try {
      // Dapatkan tanggal hari ini dalam format YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      
      const response = await axios.get('/api/admin/attendances', {
        params: { date: today, limit: 5 }
      });
      
      setRecords(response.data.data || []);
    } catch (error) {
      console.error('Error mengambil catatan kehadiran:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <p className="text-gray-500">Memuat catatan terbaru...</p>;
  }
  
  if (records.length === 0) {
    return <p className="text-gray-500">Tidak ada catatan kehadiran untuk hari ini.</p>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 text-left">Siswa</th>
            <th className="py-2 px-4 text-left">Waktu</th>
            <th className="py-2 px-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id} className="border-t">
              <td className="py-2 px-4">{record.student.full_name}</td>
              <td className="py-2 px-4">{record.rfid_scan_time.split(' ')[1]}</td>
              <td className="py-2 px-4">
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(record.status)}`}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Fungsi helper untuk mendapatkan warna berdasarkan status kehadiran
const getStatusColor = (status) => {
  switch (status) {
    case 'Present':
      return 'bg-green-100 text-green-800';
    case 'Late':
      return 'bg-yellow-100 text-yellow-800';
    case 'Absent':
      return 'bg-red-100 text-red-800';
    case 'Sick':
      return 'bg-orange-100 text-orange-800';
    case 'Leave':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default AttendanceRecordsList;