import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getMajors, createMajor, updateMajor, deleteMajor, exportMajors, importMajors, getMajorById } from '../../../../services/Admin/majorsService';
import { useAppContext } from '../../../../context/AppContext';
import Card from '../../../../components/UI/Card';
import Button from '../../../../components/UI/Button';
import Modal from '../../../../components/UI/Modal';
import { ChevronDown, Search, Edit, Trash2, Eye, Plus, ArrowLeft, GraduationCap, Menu } from 'lucide-react';
import MajorForm from './MajorForm';
import ExportToExcel from '../../../../components/ImportExport/ExportToExcel';
import ImportFromExcel from '../../../../components/ImportExport/ImportFromExcel';

const MajorsList = () => {
  const { selectedMajor, setSelectedMajor, setSelectedClass } = useAppContext();
  const [majors, setMajors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMajor, setCurrentMajor] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [majorToDelete, setMajorToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Detail view state
  const [showDetailView, setShowDetailView] = useState(false);
  const [majorDetail, setMajorDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetchMajors();
  }, []);

  useEffect(() => {
    // Add null checks to prevent toLowerCase() errors
    if (majors && majors.length > 0) {
      const filtered = majors.filter(major => {
        if (!major || !major.major_name) return false;
        return major.major_name.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setEntries(filtered);
    }
  }, [searchTerm, majors]);

  const fetchMajors = async () => {
    setIsLoading(true);
    try {
      const data = await getMajors();
      // Ensure data is an array before setting state
      const majorsArray = Array.isArray(data) ? data : [];
      setMajors(majorsArray);
      setEntries(majorsArray);
      setError(null);
    } catch (err) {
      setError('Failed to fetch majors');
      toast.error('Failed to fetch majors');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMajor = async (major) => {
    setIsDetailLoading(true);
    try {
      const response = await getMajorById(major.id);
      setMajorDetail(response);
      setShowDetailView(true);
      setSelectedMajor(major);
      setSelectedClass(null);
    } catch (err) {
      toast.error('Failed to fetch major details');
      console.error('Error fetching major details:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleBackToList = () => {
    setShowDetailView(false);
    setMajorDetail(null);
  };

  const handleAddMajor = () => {
    setCurrentMajor(null);
    setIsModalOpen(true);
  };

  const handleEditMajor = (major) => {
    setCurrentMajor(major);
    setIsModalOpen(true);
  };

  const handleDeleteMajor = (id) => {
    setMajorToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteMajor = async () => {
    try {
      await deleteMajor(majorToDelete);
      // Refresh the entire data after successful deletion
      await fetchMajors();
      if (selectedMajor && selectedMajor.id === majorToDelete) {
        setSelectedMajor(null);
        setSelectedClass(null);
      }
      toast.success('Major deleted successfully');
      setError(null);
    } catch (err) {
      setError('Failed to delete major');
      toast.error('Failed to delete major');
      console.error(err);
    } finally {
      setDeleteConfirmOpen(false);
      setMajorToDelete(null);
    }
  };

  const handleSubmitMajor = async (majorData) => {
    try {
      if (majorData.id) {
        // Update
        await updateMajor(majorData.id, majorData);
        toast.success('Major updated successfully');
      } else {
        // Create
        await createMajor(majorData);
        toast.success('Major created successfully');
      }
      
      // Close the modal first to prevent any state issues
      setIsModalOpen(false);
      
      // Then refresh the data completely
      await fetchMajors();
      
      // Reset to first page to make sure user can see the new/updated major
      setCurrentPage(1);
      
      setError(null);
    } catch (err) {
      const errorMessage = majorData.id ? 'Failed to update major' : 'Failed to create major';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    }
  };

  const handleImport = async (data) => {
    try {
      await importMajors({ majors: data });
      // Refresh all data after import
      await fetchMajors();
      toast.success('Majors imported successfully');
    } catch (err) {
      setError('Failed to import majors');
      toast.error('Failed to import majors');
      console.error(err);
    }
  };

  // Get current entries for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEntries = entries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(entries.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If detail view is active, show the major detail page
  if (showDetailView) {
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
                <h2 className="text-lg md:text-xl font-semibold">Major Details</h2>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">{majorDetail?.major_name}</h3>
                <p className="text-gray-500">ID-{String(majorDetail?.id).padStart(4, '0')}</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold mb-4 text-gray-700">Major Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Major Name</p>
                        <p className="font-medium">{majorDetail?.major_name}</p>
                      </div>
                      {majorDetail?.description && (
                        <div>
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="break-words">{majorDetail.description}</p>
                        </div>
                      )}
                      {majorDetail?.created_at && (
                        <div>
                          <p className="text-sm text-gray-500">Created At</p>
                          <p>{new Date(majorDetail.created_at).toLocaleString()}</p>
                        </div>
                      )}
                      {majorDetail?.updated_at && (
                        <div>
                          <p className="text-sm text-gray-500">Updated At</p>
                          <p>{new Date(majorDetail.updated_at).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
                
                {majorDetail?.classes && majorDetail.classes.length > 0 && (
                  <Card>
                    <div className="p-4">
                      <h4 className="text-lg font-semibold mb-4 text-gray-700">Classes</h4>
                      <ul className="divide-y divide-gray-200">
                        {majorDetail.classes.map(cls => (
                          <li key={cls.id} className="py-2">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{cls.class_name}</p>
                                <p className="text-sm text-gray-500">ID: {cls.id}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                )}
                
                {majorDetail?.students && majorDetail.students.length > 0 && (
                  <Card className="lg:col-span-2">
                    <div className="p-4">
                      <h4 className="text-lg font-semibold mb-4 text-gray-700">Students</h4>
                      <p className="mb-2">Total Students: {majorDetail.students.length}</p>
                      <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                        {majorDetail.students.map(student => (
                          <li key={student.id} className="py-2">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">NIS: {student.nis}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-center">
          <GraduationCap className="mr-2" size={24} />
          <h1 className="text-xl font-semibold">Majors</h1>
        </div>
        <Button 
          variant="primary" 
          onClick={handleAddMajor} 
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
        >
          <Plus size={18} className="mr-1" /> Add Major
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
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
              
              {majors.length > 0 && (
                <ExportToExcel 
                  data={majors} 
                  filename="majors_list"
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
                  
                  {majors.length > 0 && (
                    <ExportToExcel 
                      data={majors} 
                      filename="majors_list"
                      buttonText="Export" 
                      className="text-sm w-1/2"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 md:w-16">
                  No.
                </th>
                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Major
                  <ChevronDown className="inline ml-1" size={14} />
                </th>
                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Major Name
                  <ChevronDown className="inline ml-1" size={14} />
                </th>
                <th className="px-2 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries && currentEntries.length > 0 ? (
                currentEntries.map((major, index) => (
                  <tr key={major?.id || index} className="hover:bg-gray-50">
                    <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                      ID-{String(major?.id || '0').padStart(4, '0')}
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                      {major?.major_name || ''}
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                      <div className="flex justify-end space-x-1 md:space-x-2">
                        <button
                          onClick={() => handleSelectMajor(major)}
                          className="text-amber-500 hover:text-amber-700 p-1 rounded hover:bg-amber-50"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditMajor(major)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                          title="Edit major"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => major?.id ? handleDeleteMajor(major.id) : null}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          title="Delete major"
                          disabled={!major?.id}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-2 md:px-6 py-4 text-center text-xs md:text-sm text-gray-500">
                    No majors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-2 md:px-6 py-3 flex flex-col md:flex-row items-center justify-between border-t border-gray-200 space-y-2 md:space-y-0">
          <div className="text-xs md:text-sm text-gray-700">
            Showing {entries.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, entries.length)} of {entries.length} entries
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium rounded-md ${
                currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
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
              
              // Add key to each mapped element, even when returning null
              return pageNum > 0 && pageNum <= totalPages ? (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => paginate(pageNum)}
                  className={`relative inline-flex items-center px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium rounded-md ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ) : <span key={`placeholder-${i}`}></span>;  // Add key to null case
            })}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`relative inline-flex items-center px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium rounded-md ${
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
        title={currentMajor ? 'Edit Major' : 'Add Major'}
      >
        <MajorForm
          major={currentMajor}
          onSubmit={handleSubmitMajor}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Delete"
      >
        <p className="mb-4">Are you sure you want to delete this major?</p>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteMajor}>
            Delete
          </Button>
        </div>
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

export default MajorsList;