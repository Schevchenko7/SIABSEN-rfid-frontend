import React, { createContext, useContext, useState, useEffect } from 'react';

const RFIDScannerContext = createContext();

export const RFIDScannerProvider = ({ children }) => {
  const [scanning, setScanning] = useState(false);
  const [lastScannedTag, setLastScannedTag] = useState('');
  const [error, setError] = useState(null);
  
  const startScanning = () => {
    setScanning(true);
    setError(null);
    
    // Dalam implementasi nyata, ini akan menghubungkan ke perangkat keras RFID
    console.log('RFID Scanner diaktifkan');
  };
  
  const stopScanning = () => {
    setScanning(false);
    console.log('RFID Scanner dinonaktifkan');
  };
  
  // Simulasi pemindaian tag RFID (dalam aplikasi nyata, ini akan dipicu oleh perangkat keras)
  const simulateScan = (tagId) => {
    if (!scanning) return;
    
    setLastScannedTag(tagId);
    console.log(`Tag RFID terbaca: ${tagId}`);
    
    // Dalam implementasi nyata, Anda akan memproses hasil pemindaian di sini
    // atau meneruskannya ke komponen yang membutuhkan data tersebut
  };
  
  useEffect(() => {
    // Pembersihan saat komponen di-unmount
    return () => {
      if (scanning) {
        stopScanning();
      }
    };
  }, []);
  
  return (
    <RFIDScannerContext.Provider 
      value={{ 
        scanning, 
        startScanning, 
        stopScanning, 
        lastScannedTag, 
        setLastScannedTag,
        simulateScan,
        error, 
        setError 
      }}
    >
      {children}
    </RFIDScannerContext.Provider>
  );
};

export const useRFIDScanner = () => useContext(RFIDScannerContext);