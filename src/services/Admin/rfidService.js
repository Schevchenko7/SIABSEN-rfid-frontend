// services/rfidService.js
import api from "../../utils/axios";
import { getUserRole } from '../auth';
import { DEFAULT_API } from "../../utils/config";

// Get the ESP8266 API URL from config
const ESP_API = DEFAULT_API; // Using your existing config

// Use the same endpoint pattern as in studentsService
const getEndpoint = (path) => {
  const role = getUserRole();
  return role === 'admin' ? `/admin${path}` : `/operator${path}`;
};

// Start the RFID scanning process
export const startRFIDScan = async () => {
  try {
    const endpoint = getEndpoint('/rfid/start-scan');
    const response = await api.post(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error starting RFID scan:', error);
    throw error;
  }
};

// Get the last scanned RFID tag
export const getLastScannedTag = async () => {
  try {
    const endpoint = getEndpoint('/rfid/last-scan');
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error getting last scanned tag:', error);
    throw error;
  }
};

// Play success tone on the ESP8266 device
export const playSuccessTone = async () => {
  try {
    const endpoint = getEndpoint('/rfid/play-success');
    const response = await api.post(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error playing success tone:', error);
    // Non-critical error, just log
    return { success: false };
  }
};

// Play error tone on the ESP8266 device
export const playErrorTone = async () => {
  try {
    const endpoint = getEndpoint('/rfid/play-error');
    const response = await api.post(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error playing error tone:', error);
    // Non-critical error, just log
    return { success: false };
  }
};

// Cancel the RFID scanning process
export const cancelRFIDScan = async () => {
  try {
    const endpoint = getEndpoint('/rfid/cancel-scan');
    const response = await api.post(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error canceling RFID scan:', error);
    throw error;
  }
};

// Register an RFID tag (link it to a student)
export const registerRFIDTag = async (rfidTag, studentId) => {
  try {
    const endpoint = getEndpoint('/rfid/register');
    const response = await api.post(endpoint, {
      rfid_tag: rfidTag,
      student_id: studentId
    });
    return response.data;
  } catch (error) {
    console.error('Error registering RFID tag:', error);
    throw error;
  }
};

export default {
  startRFIDScan,
  getLastScannedTag,
  playSuccessTone,
  playErrorTone,
  cancelRFIDScan,
  registerRFIDTag
};