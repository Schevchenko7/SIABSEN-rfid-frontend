import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../../../../components/UI/Button';
import RFIDScannerModal from '../../../../components/Rfid/RFIDScannerModal';
import api from '../../../../utils/axios';
import { getClasses } from '../../../../services/Admin/classesService';

const StudentsForm = ({ student, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nisn: '',
    full_name: '',
    rfid_tag: '',
    date_of_birth: '',
    gender: 'Male',
    class_id: ''
  });
  
  const [classes, setClasses] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiErrors, setApiErrors] = useState({});
  const [showRFIDScanner, setShowRFIDScanner] = useState(false);
  const [isScanningDirect, setIsScanningDirect] = useState(false);
  const [directScanTimer, setDirectScanTimer] = useState(null);
  const [directScanCountdown, setDirectScanCountdown] = useState(0);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (student) {
      const dateOfBirth = student.date_of_birth 
        ? new Date(student.date_of_birth).toISOString().split('T')[0]
        : '';
        
      setFormData({
        nisn: student.nisn || '',
        full_name: student.full_name || '',
        rfid_tag: student.rfid_tag || '',
        date_of_birth: dateOfBirth,
        gender: student.gender || 'Male',
        class_id: student.class_id || student.class?.id || ''
      });
    } else {
      setFormData({
        nisn: '',
        full_name: '',
        rfid_tag: '',
        date_of_birth: '',
        gender: 'Male',
        class_id: ''
      });
    }
    // Clear any previous errors
    setErrors({});
    setApiErrors({});
  }, [student]);

  // Clean up direct scanning timer on unmount
  useEffect(() => {
    return () => {
      if (directScanTimer) {
        clearInterval(directScanTimer);
      }
    };
  }, [directScanTimer]);

  const fetchClasses = async () => {
    setIsLoadingClasses(true);
    try {
      const data = await getClasses();
      // Ensure data is an array before setting state
      const classesArray = Array.isArray(data) ? data : [];
      setClasses(classesArray);
    } catch (err) {
      toast.error('Failed to fetch classes');
      console.error(err);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
    
    if (apiErrors[name]) {
      setApiErrors({
        ...apiErrors,
        [name]: null
      });
    }
  };

  const handleRFIDDetection = (rfidTag) => {
    setFormData({
      ...formData,
      rfid_tag: rfidTag
    });
    
    // Clear any errors for rfid_tag field
    if (errors.rfid_tag) {
      setErrors({
        ...errors,
        rfid_tag: null
      });
    }
    
    if (apiErrors.rfid_tag) {
      setApiErrors({
        ...apiErrors,
        rfid_tag: null
      });
    }
    
    // Show toast notification that RFID was detected
    toast.success(`RFID tag detected: ${rfidTag}`);
  };

  // Start direct ESP8266 scanning mode
  const startDirectScanning = () => {
    setIsScanningDirect(true);
    setDirectScanCountdown(30); // 30 seconds timeout
    
    toast.info('ESP8266 RFID scanner activated. Tap your card on the scanner.');
    
    // Start polling for direct ESP8266 scans using the ESP8266's direct endpoint
    const tempRfidEndpoint = '/api/temp-rfid-scan';
    
    // Set up countdown timer
    const timer = setInterval(() => {
      setDirectScanCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsScanningDirect(false);
          toast.info('Direct ESP8266 scanning timed out. Please try again.');
          return 0;
        }
        
        // Poll for RFID tag from ESP8266 using the exact endpoint the ESP8266 posts to
        api.get(tempRfidEndpoint)
          .then(response => {
            if (response.data && response.data.rfid_tag && response.data.status === "success") {
              const tag = response.data.rfid_tag.toUpperCase();
              handleRFIDDetection(tag);
              clearInterval(timer);
              setIsScanningDirect(false);
              setDirectScanCountdown(0);
              
              // Optionally play success tone if available
              try {
                // Use the beeper on the ESP8266 if there's an endpoint for it
                fetch('/api/play-success-tone', { method: 'POST' }).catch(() => {
                  // Silently fail if endpoint doesn't exist
                });
              } catch (err) {
                // Ignore errors with tone playing
              }
            }
          })
          .catch(error => {
            console.error('Error polling ESP8266:', error);
            // Don't stop polling on transient errors
          });
        
        return prev - 1;
      });
    }, 1000);
    
    setDirectScanTimer(timer);
  };

  // Cancel direct ESP8266 scanning
  const cancelDirectScanning = () => {
    if (directScanTimer) {
      clearInterval(directScanTimer);
      setDirectScanTimer(null);
    }
    setIsScanningDirect(false);
    
    toast.info('ESP8266 scanning cancelled.');
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.nisn.trim()) {
      newErrors.nisn = 'NISN is required';
    } else if (!/^\d{1,20}$/.test(formData.nisn)) {
      newErrors.nisn = 'NISN must be numeric and maximum 20 digits';
    }
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.class_id) {
      newErrors.class_id = 'Class is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Format data for submission
      const submissionData = {
        nisn: formData.nisn,
        full_name: formData.full_name,
        rfid_tag: formData.rfid_tag || null, // Handle empty string as null
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        class_id: parseInt(formData.class_id) // Ensure class_id is sent as a number
      };
      
      // Only include ID for updates
      if (student?.id) {
        submissionData.id = student.id;
      }
      
      toast.info(student ? 'Updating student...' : 'Creating student...');
      onSubmit(submissionData);
    } else {
      toast.error('Please fill in all required fields correctly.');
    }
  };

  // Display API errors when they come back from the server
  const showError = (fieldName) => {
    return errors[fieldName] || apiErrors[fieldName];
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 mb-1">
              NISN
            </label>
            <input
              type="text"
              id="nisn"
              name="nisn"
              value={formData.nisn}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                showError('nisn') ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
              maxLength={20}
            />
            {showError('nisn') && (
              <p className="mt-1 text-sm text-red-600">{showError('nisn')}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                showError('full_name') ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
              maxLength={100}
            />
            {showError('full_name') && (
              <p className="mt-1 text-sm text-red-600">{showError('full_name')}</p>
            )}
          </div>
        </div>
        
        {/* Enhanced RFID Tag section with ESP8266 direct scan option */}
        <div>
          <label htmlFor="rfid_tag" className="block text-sm font-medium text-gray-700 mb-1">
            RFID Tag (Optional)
          </label>
          <div className="flex flex-col space-y-2">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                id="rfid_tag"
                name="rfid_tag"
                value={formData.rfid_tag}
                onChange={handleChange}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  showError('rfid_tag') ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                maxLength={50}
                placeholder="Enter or scan an RFID tag"
              />
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setShowRFIDScanner(true)}
                className="whitespace-nowrap w-full sm:w-auto"
                disabled={isScanningDirect}
              >
                <span className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Scanner
                </span>
              </Button>
            </div>
          
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {isScanningDirect ? (
                <>
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={cancelDirectScanning}
                    className="flex-1 w-full"
                  >
                    <span className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel ESP8266 Scan ({directScanCountdown}s)
                    </span>
                  </Button>
                </>
              ) : (
                <Button 
                  type="button" 
                  variant="primary"
                  onClick={startDirectScanning}
                  className="flex-1 w-full"
                >
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Tap ESP8266 RFID Card
                  </span>
                </Button>
              )}
            </div>
          </div>
          
          {showError('rfid_tag') && (
            <p className="mt-1 text-sm text-red-600">{showError('rfid_tag')}</p>
          )}
          
          {formData.rfid_tag && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                RFID tag detected: {formData.rfid_tag}
              </p>
            </div>
          )}
          
          {isScanningDirect && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md animate-pulse">
              <p className="text-sm text-yellow-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Waiting for ESP8266 card scan... Please tap your card on the physical scanner.
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                showError('date_of_birth') ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
            />
            {showError('date_of_birth') && (
              <p className="mt-1 text-sm text-red-600">{showError('date_of_birth')}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                showError('gender') ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {showError('gender') && (
              <p className="mt-1 text-sm text-red-600">{showError('gender')}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            id="class_id"
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              showError('class_id') ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
            }`}
            disabled={isLoadingClasses}
          >
            <option value="">Select a class</option>
            {classes.map(classItem => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.class_name}
              </option>
            ))}
          </select>
          {isLoadingClasses && (
            <p className="mt-1 text-sm text-gray-500">Loading classes...</p>
          )}
          {showError('class_id') && (
            <p className="mt-1 text-sm text-red-600">{showError('class_id')}</p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onCancel} type="button" className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button variant="primary" type="submit" className="w-full sm:w-auto" disabled={isScanningDirect}>
            {student ? 'Update' : 'Create'} Student
          </Button>
        </div>

        {/* RFID Scanner Modal */}
        <RFIDScannerModal
          isOpen={showRFIDScanner}
          onClose={() => setShowRFIDScanner(false)}
          onDetect={handleRFIDDetection}
        />
      </form>
    </>
  );
};

export default StudentsForm;