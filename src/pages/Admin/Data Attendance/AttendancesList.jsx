import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import { useAppContext } from '../../../context/AppContext';
import attendancesService from '../../../services/Admin/attendancesService';
import ExportToExcel from '../../../components/ImportExport/ExportToExcel';
import ImportFromExcel from '../../../components/ImportExport/ImportFromExcel';
import Button from '../../../components/UI/Button';
import Card from '../../../components/UI/Card';
import Modal from '../../../components/UI/Modal';
import AttendancesForm from './AttendancesForm';
import AttendancesItem from './AttendancesItem';
import AttendanceDetailModal from './AttendanceDetailModal';
import { ChevronDown, Search, Edit, Eye, Trash2, Plus, BookOpen, Calendar, ArrowLeft, Menu } from 'lucide-react';

const AttendancesList = () => {
  const { setLoading } = useAppContext();
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [totalItems, setTotalItems] = useState(0);
  const [entries, setEntries] = useState([]);
  
  // View mode state
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Load attendances with pagination
  const fetchAttendances = async () => {
    setIsLoading(true);
    try {
      const filters = {};
      
      if (dateFilter) filters.date = dateFilter;
      if (statusFilter) filters.status = statusFilter;
      if (studentFilter) filters.student = studentFilter;
      
      const result = await attendancesService.getAttendances(currentPage, itemsPerPage, filters);
      
      if (result && Array.isArray(result)) {
        // If API returns array directly (as shown in the example)
        setAttendances(result);
        setEntries(result);
        setTotalItems(result.length);
        setError(null);
      } else if (result && result.data) {
        // If API returns paginated data object structure
        setAttendances(result.data);
        setEntries(result.data);
        setTotalItems(result.meta?.total || result.data.length);
        setError(null);
      } else {
        setAttendances([]);
        setEntries([]);
        setTotalItems(0);
      }
    } catch (err) {
      setError('Failed to fetch attendance records');
      toast.error('Failed to fetch attendance records');
      console.error(err);
      setAttendances([]);
      setEntries([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, [currentPage, dateFilter, statusFilter, studentFilter]);

  useEffect(() => {
    if (attendances.length > 0) {
      const filtered = attendances.filter(attendance => 
        (attendance.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         attendance.student?.nisn?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setEntries(filtered);
    }
  }, [searchTerm, attendances]);

  const handleAddAttendance = () => {
    setCurrentAttendance(null);
    setIsModalOpen(true);
  };

  const handleEditAttendance = (attendance) => {
    setCurrentAttendance(attendance);
    setIsModalOpen(true);
  };

  const handleViewAttendance = async (attendance) => {
    try {
      // If we need complete details that might not be in the list view
      if (attendance.id) {
        const fullAttendance = await attendancesService.getAttendanceById(attendance.id);
        setSelectedAttendance(fullAttendance.data || fullAttendance);
      } else {
        setSelectedAttendance(attendance);
      }
      setViewModalOpen(true);
    } catch (err) {
      console.error('Error fetching attendance details:', err);
      toast.error('Failed to fetch attendance details');
      // Still show the modal with what we have
      setSelectedAttendance(attendance);
      setViewModalOpen(true);
    }
  };

  const handleDeleteAttendance = (id) => {
    setAttendanceToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteAttendance = async () => {
    try {
      await attendancesService.deleteAttendance(attendanceToDelete);
      // Refresh the entire data after successful deletion
      await fetchAttendances();
      toast.success('Attendance record deleted successfully');
      setError(null);
    } catch (err) {
      setError('Failed to delete attendance record');
      toast.error('Failed to delete attendance record');
      console.error(err);
    } finally {
      setDeleteConfirmOpen(false);
      setAttendanceToDelete(null);
    }
  };

  const handleSubmitAttendance = async (attendanceData) => {
    try {
      if (attendanceData.id) {
        // Update
        await attendancesService.updateAttendance(
          attendanceData.id, 
          attendanceData
        );
        toast.success('Attendance record updated successfully');
      } else {
        // Create
        await attendancesService.createAttendance(attendanceData);
        toast.success('Attendance record created successfully');
      }
      
      // Close the modal first to prevent any state issues
      setIsModalOpen(false);
      
      // Then refresh the data completely
      await fetchAttendances();
      
      // Reset the page to first page to make sure user can see the new/updated attendance
      setCurrentPage(1);
      
      setError(null);
    } catch (err) {
      const errorMessage = attendanceData.id ? 'Failed to update attendance record' : 'Failed to create attendance record';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    }
  };

  const handleImport = async (data) => {
    try {
      await attendancesService.importAttendances({ attendances: data });
      // Refresh all data after import
      await fetchAttendances();
      toast.success('Attendance records imported successfully');
    } catch (err) {
      setError('Failed to import attendance records');
      toast.error('Failed to import attendance records');
      console.error(err);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setDateFilter('');
    setStatusFilter('');
    setStudentFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Pagination logic - only needed if API doesn't provide pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // If API provides pagination, use the entries as is, otherwise slice
  const currentEntries = entries;
  
  // Calculate total pages based on total items and items per page
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const attendanceStatusOptions = ['Present', 'Late', 'Absent', 'Sick', 'Leave'];

  // Format date safely
  const formatDate = (dateString) => {
    try {
      return dateString ? format(new Date(dateString), 'dd-MM-yyyy') : '-';
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString || '-';
    }
  };

  // Format time safely
  const formatTime = (timeString) => {
    try {
      if (!timeString) return '-';
      
      // Handle different time formats
      if (timeString.includes('T')) {
        return format(new Date(timeString), 'HH:mm:ss');
      } else if (timeString.includes(' ')) {
        // Extract just the time part if it's in format "2025-04-10 07:45:00"
        return timeString.split(' ')[1];
      }
      return timeString;
    } catch (error) {
      console.error("Time formatting error:", error);
      return timeString || '-';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center">
          <Calendar className="mr-2" size={24} />
          <h1 className="text-xl font-semibold">Attendance Records</h1>
        </div>
        <Button 
          variant="primary" 
          onClick={handleAddAttendance} 
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
        >
          <Plus size={18} className="mr-1" /> Add Record
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-3 md:p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b space-y-2 md:space-y-0">
          {/* Entries per page selector - visible on all screen sizes */}
          <div className="flex items-center">
            <span className="mr-2 text-sm md:text-base">Show</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
              className="border rounded px-1 md:px-2 py-1 text-sm md:text-base"
            >
              <option value="7">7</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span className="ml-2 text-sm md:text-base">entries</span>
            
            <div className="ml-4 hidden md:flex items-center">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-1 rounded ${viewMode === 'table' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Table view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                </svg>
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Desktop: Search and Import/Export always visible */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-8 pr-4 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            
            <ImportFromExcel onImport={handleImport} buttonText="Import" />
            
            {attendances.length > 0 && (
              <ExportToExcel 
                data={attendances} 
                filename="attendance_records"
                buttonText="Export"
              />
            )}
          </div>
          
          {/* Mobile: Toggle button and expandable menu */}
          <div className="w-full md:hidden">
            <div className="flex justify-between items-center">
              {/* Search input always visible on mobile */}
              <div className="relative flex-grow mr-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-4 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              
              {/* Menu toggle button */}
              <button 
                onClick={toggleMobileMenu}
                className="p-2 bg-gray-100 rounded flex-shrink-0"
                aria-label="Toggle import/export options"
              >
                <Menu size={20} />
              </button>
            </div>
            
            {/* Collapsible import/export and view options */}
            {mobileMenuOpen && (
              <div className="mt-2 space-y-2">
                <div className="flex space-x-2">
                  <ImportFromExcel 
                    onImport={handleImport} 
                    buttonText="Import" 
                    className="text-sm w-1/2" 
                  />
                  
                  {attendances.length > 0 && (
                    <ExportToExcel 
                      data={attendances} 
                      filename="attendance_records"
                      buttonText="Export" 
                      className="text-sm w-1/2"
                    />
                  )}
                </div>
                
                <div className="flex items-center justify-center space-x-2 bg-gray-50 p-1 rounded">
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`p-1 rounded flex-1 flex justify-center ${viewMode === 'table' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Table view"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="3" y1="15" x2="21" y2="15"></line>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                      <line x1="15" y1="3" x2="15" y2="21"></line>
                    </svg>
                    <span className="ml-1 text-xs">Table</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded flex-1 flex justify-center ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Grid view"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    <span className="ml-1 text-xs">Grid</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>


        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 sm:w-16">
                    No.
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                    <ChevronDown className="inline ml-1" size={14} />
                  </th>
                  <th className="hidden sm:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NISN
                    <ChevronDown className="inline ml-1" size={14} />
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                    <ChevronDown className="inline ml-1" size={14} />
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                    <ChevronDown className="inline ml-1" size={14} />
                  </th>
                  <th className="hidden md:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scan Time
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEntries && currentEntries.length > 0 ? (
                  currentEntries.map((attendance, index) => (
                    <tr key={attendance?.id || index} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {attendance?.student?.full_name || '-'}
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance?.student?.nisn || '-'}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(attendance?.date)}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          attendance?.status === 'Present' ? 'bg-green-100 text-green-800' :
                          attendance?.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                          attendance?.status === 'Absent' ? 'bg-red-100 text-red-800' :
                          attendance?.status === 'Sick' ? 'bg-blue-100 text-blue-800' :
                          attendance?.status === 'Leave' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {attendance?.status || '-'}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(attendance?.rfid_scan_time)}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleViewAttendance(attendance)}
                            className="text-amber-500 hover:text-amber-700 p-1 rounded hover:bg-amber-50"
                            title="View details"
                            aria-label="View details"
                          >
                            <Eye size={16} className="sm:size-18" />
                          </button>
                          <button
                            onClick={() => handleEditAttendance(attendance)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                            title="Edit attendance"
                            aria-label="Edit attendance"
                          >
                            <Edit size={16} className="sm:size-18" />
                          </button>
                          <button
                            onClick={() => attendance?.id ? handleDeleteAttendance(attendance.id) : null}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                            title="Delete attendance"
                            aria-label="Delete attendance"
                            disabled={!attendance?.id}
                          >
                            <Trash2 size={16} className="sm:size-18" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentEntries && currentEntries.length > 0 ? (
              currentEntries.map((attendance, index) => (
                <AttendancesItem 
                  key={attendance?.id || index}
                  attendance={attendance}
                  index={indexOfFirstItem + index + 1}
                  onView={() => handleViewAttendance(attendance)}
                  onEdit={() => handleEditAttendance(attendance)}
                  onDelete={() => attendance?.id ? handleDeleteAttendance(attendance.id) : null}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No attendance records found
              </div>
            )}
          </div>
        )}

        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-2">
          <div className="text-sm text-gray-700 w-full sm:w-auto text-center sm:text-left">
            Showing {entries.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, entries.length)} of {entries.length} entries
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-1 w-full sm:w-auto">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
                currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            {/* Enhanced pagination for larger screens */}
            <div className="hidden md:flex">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show pages around current page for better navigation
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={`desktop-page-${pageNum}`}
                    onClick={() => paginate(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-500 z-10'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`relative inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
                currentPage === totalPages || totalPages === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentAttendance ? "Edit Attendance Record" : "Add New Attendance Record"}
      >
        <AttendancesForm
          attendance={currentAttendance}
          onSubmit={handleSubmitAttendance}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Delete"
        maxWidth="md"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">Are you sure you want to delete this attendance record? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteAttendance}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Attendance Details Modal */}
      <AttendanceDetailModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        attendance={selectedAttendance}
      />

      {/* Toast container for notifications */}
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AttendancesList;