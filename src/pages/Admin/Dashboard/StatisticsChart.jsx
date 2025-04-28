import React from 'react';

const StatisticsChart = ({ data }) => {
  // Debugging - log data yang diterima
  console.log('Data yang diterima StatisticsChart:', data);
  
  // Cek apakah data valid dan tidak kosong
  const isValidData = Array.isArray(data) && data.length > 0;
  
  // Cek apakah semua data memiliki nilai nol
  const hasNonZeroData = isValidData && data.some(day => 
    (parseInt(day.present) || 0) > 0 || 
    (parseInt(day.late) || 0) > 0 || 
    (parseInt(day.absent) || 0) > 0
  );
  
  // Jika tidak ada data, tampilkan pesan "tidak ada data"
  if (!isValidData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-medium">Tidak ada data tersedia</p>
      </div>
    );
  }
  
  // Jika semua nilai nol, tampilkan pesan "tidak ada aktivitas"
  if (!hasNonZeroData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-medium">Tidak ada aktivitas kehadiran untuk periode ini</p>
      </div>
    );
  }
  
  // Hitung nilai maksimum untuk skala
  let maxValue = 1;
  if (hasNonZeroData) {
    maxValue = Math.max(
      ...data.map(day => 
        Math.max(
          parseInt(day.present) || 0, 
          parseInt(day.late) || 0, 
          parseInt(day.absent) || 0, 
          1
        )
      )
    );
  }
  
  // Pindahkan dari nol untuk membantu visualisasi
  maxValue = Math.ceil(maxValue * 1.2);
  
  // Fungsi untuk mendapatkan tinggi bar yang proporsional
  const getBarHeight = (value) => {
    const numValue = parseInt(value) || 0;
    if (numValue <= 0) return 0;
    
    // Hitung persentase tinggi
    const percentage = (numValue / maxValue) * 100;
    // Minimal tinggi batang 5%
    return Math.max(percentage, 5);
  };
  
  // Label untuk sumbu Y
  const yAxisLabels = [];
  for (let i = 0; i <= 4; i++) {
    yAxisLabels.push(Math.round(maxValue * (i / 4)));
  }
  
  return (
    <div className="flex flex-col h-64 w-full">
      <div className="flex flex-grow">
        {/* Label sumbu Y */}
        <div className="flex flex-col justify-between pr-2 text-xs text-gray-500 font-medium">
          {yAxisLabels.reverse().map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
        
        {/* Area grafik */}
        <div className="flex-1 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`w-full ${i === 0 || i === 4 ? 'border-t border-gray-300' : 'border-t border-dashed border-gray-200'}`}
              />
            ))}
          </div>
          
          {/* Kelompok batang */}
          <div className="flex h-full justify-between relative z-10 pb-8">
            {data.map((day, index) => (
              <div key={index} className="flex flex-col h-full justify-end items-center flex-1">
                {/* Group of 3 bars */}
                <div className="flex space-x-1 md:space-x-2 items-end justify-center w-full">
                  {/* Batang hadir */}
                  <div 
                    className="w-2 md:w-3 bg-blue-500 rounded-t transition-all duration-300" 
                    style={{ height: `${getBarHeight(day.present)}%` }}
                    title={`Hadir: ${day.present || 0}`}
                  />
                  
                  {/* Batang sakit/izin */}
                  <div 
                    className="w-2 md:w-3 bg-yellow-400 rounded-t transition-all duration-300" 
                    style={{ height: `${getBarHeight(day.late)}%` }}
                    title={`Sakit/Izin: ${day.late || 0}`}
                  />
                  
                  {/* Batang tanpa keterangan */}
                  <div 
                    className="w-2 md:w-3 bg-red-500 rounded-t transition-all duration-300" 
                    style={{ height: `${getBarHeight(day.absent)}%` }}
                    title={`Tanpa Keterangan: ${day.absent || 0}`}
                  />
                </div>
                
                {/* Label hari */}
                <div className="absolute bottom-0 text-xs text-gray-600 font-medium">
                  {day.dayName.substring(0, 3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legenda */}
      <div className="flex justify-center mt-4 gap-5 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-1.5"></div>
          <span className="font-medium">Hadir</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-400 rounded mr-1.5"></div>
          <span className="font-medium">Sakit/Izin</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-1.5"></div>
          <span className="font-medium">Tanpa Keterangan</span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsChart;