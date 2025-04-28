import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardCard from './DashboardCard';
import AttendanceStatistics from './AttendanceStatistics';
import RecentActivities from './RecentActivities';
import AttendanceDashboardChart from './AttendanceDashboardChart';
import { getDashboardSummary } from '../../../services/Admin/dashboardService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalClasses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk waktu yang akan diperbarui
  const [time, setTime] = useState(new Date());
  
  // Format waktu saat ini
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Format tanggal saat ini
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = time.toLocaleDateString('id-ID', options);
  const academicYear = `${time.getFullYear()}/${time.getFullYear() + 1}`;
  
  // Effect untuk memperbarui waktu setiap detik
  useEffect(() => {
    const timerID = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    // Cleanup timer saat komponen unmount
    return () => {
      clearInterval(timerID);
    };
  }, []);
  
  // Effect untuk mengambil data dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardSummary();
        setSummary(data);
        
        // Show success toast when data is loaded
        toast.success('Data dashboard berhasil dimuat', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        
        // Show error toast
        toast.error('Gagal memuat data dashboard. Silakan coba lagi nanti.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleRetry = () => {
    // Show info toast for retry
    toast.info('Memuat ulang data dashboard...', {
      position: "top-right",
      autoClose: 2000,
    });
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ToastContainer />
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* ToastContainer for showing notifications */}
      <ToastContainer />
      
      <DashboardHeader />
      
      <div className="mt-4 text-gray-600">
        Selamat datang di Sistem Informasi Absensi Sekolah
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <DashboardCard 
          title="Total Siswa" 
          value={summary.totalStudents} 
          icon="users"
          message={summary.totalStudents > 0 ? "" : "Data tidak tersedia"}
        />
        
        <DashboardCard 
          title="Total Kelas" 
          value={summary.totalClasses} 
          icon="school"
          message={summary.totalClasses > 0 ? "" : "Data tidak tersedia"}
        />
        
        <DashboardCard 
          title="Waktu Saat Ini" 
          value={formattedTime} 
          icon="clock"
          message="Waktu Server"
        />
        
        <DashboardCard 
          title="Tanggal" 
          value={formattedDate.split(',')[1]} 
          icon="calendar"
          message={`Tahun Ajaran ${academicYear}`}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2">
          <AttendanceDashboardChart />
        </div>
        
        <div className="lg:col-span-1">
          <RecentActivities />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;