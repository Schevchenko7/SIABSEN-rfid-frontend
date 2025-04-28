import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getStudents, exportStudents, importStudents } from '../../../../services/Admin/studentsService';
import { useAppContext } from '../../../../context/AppContext';
import Card from '../../../../components/UI/Card';
import Button from '../../../../components/UI/Button';
import Modal from '../../../../components/UI/Modal';
import { Users, Search, Eye, Menu, ArrowLeft } from 'lucide-react';
import StudentsForm from './StudentsForm';
import ExportToExcel from '../../../../components/ImportExport/ExportToExcel';
import ImportFromExcel from '../../../../components/ImportExport/ImportFromExcel';

const StudentsList = () => {
  const { selectedStudent, setSelectedStudent } = useAppContext();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Detail view state
  const [showDetailView, setShowDetailView] = useState(false);
  const [studentDetail, setStudentDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [entries, setEntries] = useState([]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Add null checks to prevent toLowerCase() errors
    if (students && students.length > 0) {
      const filtered = students.filter(student => {
        if (!student) return false;
        
        const nisn = student.nisn || '';
        const fullName = student.full_name || '';
        
        return nisn.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
               fullName.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
      setEntries(filtered);
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await getStudents();
      // Ensure data is an array before setting state
      const studentsArray = Array.isArray(data) ? data : [];
      setStudents(studentsArray);
      setEntries(studentsArray);
      setError(null);
    } catch (err) {
      setError('Failed to fetch students');
      toast.error('Failed to fetch students');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStudent = (student) => {
    setStudentDetail(student);
    setShowDetailView(true);
    setSelectedStudent(student);
  };

  const handleBackToList = () => {
    setShowDetailView(false);
    setStudentDetail(null);
  };

  const handleViewDetails = (student) => {
    setCurrentStudent(student);
    setIsModalOpen(true);
  };

  const handleImport = async (data) => {
    try {
      await importStudents({ students: data });
      // Refresh all data after import
      await fetchStudents();
      toast.success('Students imported successfully');
    } catch (err) {
      setError('Failed to import students');
      toast.error('Failed to import students');
      console.error(err);
    }
  };

  // Get current entries for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEntries = entries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(entries.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If detail view is active, show the student detail page
  if (showDetailView && studentDetail) {
    return (
      <div>
        {isDetailLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={handleBackToList}
                  className="mr-3 p-1 rounded hover:bg-indigo-700"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold">Student Details</h2>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">{studentDetail?.full_name}</h3>
                <p className="text-gray-500">NISN: {studentDetail?.nisn}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold mb-4 text-gray-700">Student Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{studentDetail?.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">NISN</p>
                        <p className="font-medium">{studentDetail?.nisn}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">RFID Tag</p>
                        <p className="font-medium">{studentDetail?.rfid_tag || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium">{studentDetail?.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">{studentDetail?.date_of_birth}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Class ID</p>
                        <p className="font-medium">{studentDetail?.class_id}</p>
                      </div>
                      {studentDetail?.created_at && (
                        <div>
                          <p className="text-sm text-gray-500">Created At</p>
                          <p>{new Date(studentDetail.created_at).toLocaleString()}</p>
                        </div>
                      )}
                      {studentDetail?.updated_at && (
                        <div>
                          <p className="text-sm text-gray-500">Updated At</p>
                          <p>{new Date(studentDetail.updated_at).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center">
          <Users className="mr-2" size={24} />
          <h1 className="text-xl font-semibold">Students</h1>
        </div>
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
            
            {students.length > 0 && (
              <ExportToExcel 
                data={students} 
                filename="students_list"
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
            
            {/* Collapsible import/export options */}
            {mobileMenuOpen && (
              <div className="mt-2 flex space-x-2">
                <ImportFromExcel 
                  onImport={handleImport} 
                  buttonText="Import" 
                  className="text-sm w-1/2" 
                />
                
                {students.length > 0 && (
                  <ExportToExcel 
                    data={students} 
                    filename="students_list"
                    buttonText="Export" 
                    className="text-sm w-1/2"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 sm:w-16">
                  No.
                </th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NISN
                </th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="hidden md:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="hidden md:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class ID
                </th>
                <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries && currentEntries.length > 0 ? (
                currentEntries.map((student, index) => (
                  <tr key={student?.id || index} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {student?.nisn || ''}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student?.full_name || ''}
                    </td>
                    <td className="hidden md:table-cell px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {student?.gender || ''}
                    </td>
                    <td className="hidden md:table-cell px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {student?.class_id || ''}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleSelectStudent(student)}
                          className="text-amber-500 hover:text-amber-700 p-1 rounded hover:bg-amber-50"
                          title="View details"
                          aria-label="View details"
                        >
                          <Eye size={16} className="sm:size-18" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
            {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => {
              // Show current page and adjacent pages
              let pageNum;
              if (totalPages <= 3) {
                pageNum = i + 1;
              } else if (currentPage === 1) {
                pageNum = i + 1;
              } else if (currentPage === totalPages) {
                pageNum = totalPages - 2 + i;
              } else {
                pageNum = currentPage - 1 + i;
              }
              
              return pageNum > 0 && pageNum <= totalPages ? (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => paginate(pageNum)}
                  className={`relative inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ) : <span key={`placeholder-${i}`}></span>;
            })}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Student Details"
      >
        <StudentsForm
          student={currentStudent}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default StudentsList;