import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Button from '../../components/UI/Button';
import rfidService from '../../services/Admin/rfidService';

const RFIDScannerModal = ({ isOpen, onClose, onDetect }) => {
  const [scanning, setScanning] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [rfidTag, setRfidTag] = useState('');
  const scanIntervalRef = useRef(null);
  
  // Cleanup when component unmounts or closes
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      // Ensure we cancel any ongoing scans when modal closes
      if (scanning) {
        cancelScanning();
      }
    };
  }, []);

  // Clean up when modal is closed
  useEffect(() => {
    if (!isOpen && scanning) {
      cancelScanning();
    }
  }, [isOpen]);

  // Handle scanning logic
  useEffect(() => {
    if (!scanning) return;
    
    // Set up countdown timer
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setScanning(false);
          setStatus('timeout');
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }
          toast.info('RFID scanning timed out. Please try again.', {
            position: "top-right",
            autoClose: 3000,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start the polling mechanism to check for RFID scans
    startRFIDPolling();
    
    return () => {
      clearInterval(interval);
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      // Cancel scanning on cleanup
      cancelScanning();
    };
  }, [scanning]);

  const startRFIDPolling = () => {
    // Initialize the scanner using the rfidService
    rfidService.startRFIDScan()
      .then(() => {
        console.log('RFID scanner in scanning mode');
        toast.info('RFID scanner ready. Please tap your card.', {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Start polling for RFID detection
        scanIntervalRef.current = setInterval(() => {
          rfidService.getLastScannedTag()
            .then((data) => {
              if (data && data.rfid_tag) {
                const tag = data.rfid_tag.toUpperCase();
                setRfidTag(tag);
                setStatus('detected');
                setScanning(false);
                
                // Play success tone on the device
                rfidService.playSuccessTone();
                
                toast.success(`RFID tag detected: ${tag}`, {
                  position: "top-right",
                  autoClose: 3000,
                });
                
                // Clear the polling interval
                if (scanIntervalRef.current) {
                  clearInterval(scanIntervalRef.current);
                  scanIntervalRef.current = null;
                }
              }
            })
            .catch((err) => {
              console.error('Error polling RFID scanner:', err);
              // Only set error if serious connection issue
              if (err.code === 'ECONNABORTED' || err.message.includes('Network Error')) {
                setError('Connection to RFID scanner lost. Please check the device.');
                setStatus('error');
                setScanning(false);
                
                toast.error('Connection to RFID scanner lost. Please check the device.', {
                  position: "top-right",
                  autoClose: 5000,
                });
                
                if (scanIntervalRef.current) {
                  clearInterval(scanIntervalRef.current);
                  scanIntervalRef.current = null;
                }
              }
            });
        }, 1000); // Poll every second
      })
      .catch((err) => {
        console.error('Failed to initialize scanner:', err);
        setError('Could not initialize scanner. Please check if the device is connected.');
        setStatus('error');
        setScanning(false);
        
        toast.error('Could not initialize RFID scanner. Please check if the device is connected.', {
          position: "top-right",
          autoClose: 5000,
        });
      });
  };

  const startScanning = () => {
    setScanning(true);
    setStatus('scanning');
    setCountdown(30);
    setError(null);
    setRfidTag('');
  };

  const cancelScanning = () => {
    rfidService.cancelRFIDScan().catch((err) => {
      console.error('Error cancelling scan:', err);
    });
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setScanning(false);
    setStatus('cancelled');
  };

  const useDetectedTag = () => {
    onDetect(rfidTag);
    onClose();
    toast.success('RFID tag saved to form. Complete other fields to register.', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">RFID Scanner</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="border rounded-lg p-4 mb-4 bg-gray-50">
          <div className="flex items-center justify-center mb-4">
            {/* RFID Scanner Graphics */}
            <div className="relative flex items-center justify-center">
              <div className="bg-gray-200 rounded-lg p-4 w-64 h-32 flex flex-col items-center justify-center">
                <div className="text-sm text-gray-600 mb-2">ESP8266 with MFRC522</div>
                <div className={`h-4 w-12 rounded-full ${scanning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              </div>
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`text-center mb-4 p-3 rounded-md ${
              status === 'detected' ? 'bg-green-100 text-green-800' :
              status === 'error' ? 'bg-red-100 text-red-800' :
              status === 'scanning' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status === 'idle' && 'Press "Start Scanning" and tap your RFID card on the scanner'}
              {status === 'scanning' && `Scanning for RFID tag... (${countdown}s)`}
              {status === 'detected' && `RFID tag detected: ${rfidTag}`}
              {status === 'timeout' && 'Scanning timed out. Please try again.'}
              {status === 'cancelled' && 'Scanning cancelled.'}
              {status === 'error' && `Error: ${error || 'Unknown error'}`}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center w-full gap-2">
              {status === 'detected' && (
                <Button variant="primary" onClick={useDetectedTag} className="w-full">
                  Use this RFID tag
                </Button>
              )}
              
              {(status === 'idle' || status === 'timeout' || status === 'cancelled' || status === 'error') && (
                <Button 
                  variant="primary" 
                  onClick={startScanning} 
                  className="w-full"
                >
                  Start Scanning
                </Button>
              )}
              
              {status === 'scanning' && (
                <Button 
                  variant="secondary" 
                  onClick={cancelScanning} 
                  className="w-full"
                >
                  Cancel
                </Button>
              )}
              
              {status !== 'scanning' && (
                <Button 
                  variant="secondary" 
                  onClick={onClose} 
                  className="w-full"
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
          <p className="font-medium mb-1">Connected hardware:</p>
          <ul className="list-disc pl-5">
            <li>ESP8266 NodeMCU</li>
            <li>MFRC522 RFID Reader</li>
            <li>LCD I2C Display (16x2)</li>
            <li>Buzzer module</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RFIDScannerModal;