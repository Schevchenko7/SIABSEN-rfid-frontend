import React, { useState, useEffect } from 'react';
import { getRecentActivities } from '../../../services/Admin/dashboardService';

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  
  const itemsPerPage = 4;
  const totalPages = Math.ceil(activities.length / itemsPerPage);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // Increased the number of activities to fetch for pagination
        const data = await getRecentActivities(10);
        setActivities(data);
        setTotalActivities(data.length);
      } catch (err) {
        console.error('Failed to fetch recent activities:', err);
        setError('Failed to load recent activities');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return activities.slice(startIndex, endIndex);
  };

  // Handle page changes
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Function to get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
      case 'without explanation':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
      <p className="text-sm text-gray-500 mb-4">Aktivitas absensi terbaru dalam sistem</p>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-red-500">{error}</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p>Belum ada aktivitas absensi</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {getCurrentPageItems().map((activity) => (
              <div key={activity.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{activity.student?.full_name || 'Siswa tidak ditemukan'}</h3>
                    <p className="text-sm text-gray-600">
                      {activity.student?.class?.class_name || 'Kelas tidak tersedia'} • 
                      {activity.student?.class?.school_major?.major_name && ` ${activity.student?.class?.school_major?.major_name}`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                  <div>
                    <span className="inline-block mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(activity.date)}
                    </span>
                    <span className="inline-block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(activity.rfid_scan_time)}
                    </span>
                  </div>
                  <span className="text-xs italic">
                    NISN: {activity.student?.nisn || '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination controls */}
          {activities.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4 pt-2 border-t">
              <button 
                onClick={goToPreviousPage} 
                disabled={currentPage === 1}
                className={`flex items-center text-sm ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Sebelumnya
              </button>
              
              <div className="text-sm text-gray-600">
                Halaman {currentPage} dari {totalPages}
              </div>
              
              <button 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                className={`flex items-center text-sm ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
              >
                Selanjutnya
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="pt-2 text-center mt-4">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Lihat Semua Aktivitas
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RecentActivities;