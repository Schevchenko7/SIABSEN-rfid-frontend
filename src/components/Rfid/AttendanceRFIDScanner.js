import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRFIDScanner } from '../../contexts/RFIDScannerContext';
import AttendanceRecordsList from './AttendanceRecordsList';

const AttendanceRFIDScanner = () => {
  const { scanning, startScanning, stopScanning, lastScannedTag, setLastScannedTag } = useRFIDScanner();
  const [processing, setProcessing] = useState(false);
  const [scannedAttendance, setScannedAttendance] = useState(null);
  const [error, setError] = useState(null);
  const [continuousScan, setContinuousScan] = useState(false);

  // Proses pemindaian saat tag baru terdeteksi
  useEffect(() => {
    if (lastScannedTag && scanning) {
      processAttendanceScan();
    }
  }, [lastScannedTag]);

  // Lanjutkan pemindaian setelah pemrosesan jika mode berkelanjutan aktif
  useEffect(() => {
    if (continuousScan && !processing && !scanning) {
      const timer = setTimeout(() => {
        startScanning();
      }, 3000); // Tunggu 3 detik sebelum memulai pemindaian berikutnya
      
      return () => clearTimeout(timer);
    }
  }, [continuousScan, processing, scanning]);

  const processAttendanceScan = async () => {
    if (!lastScannedTag) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      // Cari siswa berdasarkan tag RFID
      const studentResponse = await axios.get(`/api/admin/students`, {
        params: { rfid_tag: lastScannedTag }
      });
      
      if (!studentResponse.data.data || studentResponse.data.data.length === 0) {
        throw new Error('Tidak ada siswa dengan tag RFID ini');
      }
      
      const student = studentResponse.data.data[0];
      
      // Dapatkan tanggal hari ini dalam format YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      
      // Catat kehadiran
      const attendanceResponse = await axios.post('/api/admin/attendances', {
        student_id: student.id,
        date: today,
        status: determineAttendanceStatus(new Date()),
        rfid_scan_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
      
      setScannedAttendance({
        student: student,
        attendance: attendanceResponse.data
      });
      
    } catch (error) {
      console.error('Error memproses kehadiran:', error);
      setError(error.message || 'Gagal memproses kehadiran');
    } finally {
      setProcessing(false);
      if (!continuousScan) {
        stopScanning();
      }
      // Bersihkan tag yang terakhir dipindai untuk mempersiapkan pemindaian berikutnya
      setLastScannedTag('');
    }
  };

  // Tentukan status kehadiran berdasarkan waktu
  const determineAttendanceStatus = (dateTime) => {
    const hour = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    
    // Contoh: Sekolah dimulai pada pukul 7:30 pagi
    if (hour < 7 || (hour === 7 && minutes < 30)) {
      return 'Present';
    } else if (hour < 8) {
      return 'Late';
    } else {
      return 'Absent';
    }
  };

  const handleStartScan = () => {
    setScannedAttendance(null);
    setError(null);
    startScanning();
  };

  const toggleContinuousScan = () => {
    const newValue = !continuousScan;
    setContinuousScan(newValue);
    
    if (newValue && !scanning && !processing) {
      startScanning();
    }
  };

  // Untuk tujuan demonstrasi - mensimulasikan pemindaian RFID dengan tag acak
  const simulateRFIDScan = () => {
    if (!scanning) return;
    
    // Dalam aplikasi nyata, Anda akan menggunakan tag RFID aktual dari database Anda
    const demoTags = ['ABC123XYZ789', 'DEF456UVW123', 'GHI789RST456'];
    const randomTag = demoTags[Math.floor(Math.random() * demoTags.length)];
    setLastScannedTag(randomTag);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Pemindai RFID Kehadiran</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleStartScan}
          disabled={scanning || processing}
          className={`px-4 py-2 rounded ${
            scanning || processing ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {scanning ? 'Memindai...' : 'Mulai Pemindaian'}
        </button>
        
        <button
          onClick={stopScanning}
          disabled={!scanning || processing}
          className={`px-4 py-2 rounded ${
            !scanning || processing ? 'bg-gray-300' : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          Hentikan Pemindaian
        </button>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="continuousScan"
            checked={continuousScan}
            onChange={toggleContinuousScan}
            className="h-4 w-4"
          />
          <label htmlFor="continuousScan" className="text-sm">
            Pemindaian Berkelanjutan
          </label>
        </div>
        
        {/* Tombol demo - hapus pada produksi */}
        {scanning && (
          <button
            onClick={simulateRFIDScan}
            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
          >
            Simulasi Pindai
          </button>
        )}
      </div>
      
      {scanning && (
        <div className="animate-pulse bg-blue-100 p-3 rounded text-blue-800 mb-4">
          Silakan pindai kartu identitas siswa...
        </div>
      )}
      
      {processing && (
        <div className="bg-yellow-100 p-3 rounded text-yellow-800 mb-4">
          Memproses pemindaian...
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 p-3 rounded text-red-800 mb-4">
          Error: {error}
        </div>
      )}
      
      {scannedAttendance && (
        <div className="bg-green-100 p-3 rounded mb-4">
          <h4 className="font-medium text-green-800">Kehadiran Berhasil Dicatat</h4>
          <div className="mt-2">
            <p><span className="font-medium">Nama:</span> {scannedAttendance.student.full_name}</p>
            <p><span className="font-medium">NISN:</span> {scannedAttendance.student.nisn}</p>
            <p><span className="font-medium">Status:</span> {scannedAttendance.attendance.status}</p>
            <p><span className="font-medium">Waktu:</span> {scannedAttendance.attendance.rfid_scan_time}</p>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <h4 className="font-medium mb-2">Catatan Kehadiran Terbaru</h4>
        <AttendanceRecordsList />
      </div>
    </div>
  );
};

export default AttendanceRFIDScanner;