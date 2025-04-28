import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getClasses, createClass, updateClass, deleteClass, exportClasses, importClasses, getClassById } from '../../../../services/Admin/classesService';
import { useAppContext } from '../../../../context/AppContext';
import Card from '../../../../components/UI/Card';
import Button from '../../../../components/UI/Button';
import Modal from '../../../../components/UI/Modal';
import { ChevronDown, Search, Edit, Trash2, Eye, Plus, ArrowLeft, BookOpen, Menu } from 'lucide-react';
import ClassForm from './ClassForm';
import ExportToExcel from '../../../../components/ImportExport/ExportToExcel';
import ImportFromExcel from '../../../../components/ImportExport/ImportFromExcel';
import ClassItem from './ClassItem';

const ClassesList = () => {
  const { selectedMajor, selectedClass, setSelectedClass } = useAppContext();
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Detail view state
  const [showDetailView, setShowDetailView] = useState(false);
  const [classDetail, setClassDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [entries, setEntries] = useState([]);
  // View state
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const filtered = classes.filter(classItem => 
      classItem.class_name && classItem.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setEntries(filtered);
  }, [searchTerm, classes]);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      // Modify the API call to include related data
      // If your API supports query parameters for relations:
      const data = await getClasses({ include: 'school_major' });
      
      // If you need to process the data to ensure consistent structure
      const processedData = data.map(classItem => {
        // If school_major relation isn't populated, try to find the major name another way
        // This depends on your API structure
        if (!classItem.school_major && classItem.school_major_id) {
          // You could potentially fetch the major separately here
          // or add placeholder text
          classItem.majorName = `${classItem.school_major_id}`;
        } else if (classItem.school_major) {
          classItem.majorName = classItem.school_major.major_name;
        } else {
          classItem.majorName = "Not assigned";
        }
        return classItem;
      });
      
      // For debugging: log the first item to check structure
      if (processedData && processedData.length > 0) {
        console.log('Sample class data:', processedData[0]);
      }
      
      setClasses(processedData);
      setEntries(processedData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch classes');
      toast.error('Failed to fetch classes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClass = async (classItem) => {
    setIsDetailLoading(true);
    try {
      const response = await getClassById(classItem.id);
      
      // Ensure the response has the necessary data
      if (!response.school_major && response.school_major_id) {
        // If we don't have the school_major object but have an ID,
        // we can use the already calculated majorName from our list
        response.school_major = {
          major_name: classItem.majorName || `Major ID: ${response.school_major_id}`
        };
      }
      
      setClassDetail(response);
      setShowDetailView(true);
      setSelectedClass(classItem);
    } catch (err) {
      toast.error('Failed to fetch class details');
      console.error('Error fetching class details:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleBackToList = () => {
    setShowDetailView(false);
    setClassDetail(null);
  };

  const handleAddClass = () => {
    setCurrentClass(null);
    setIsModalOpen(true);
  };

  const handleEditClass = (classItem) => {
    setCurrentClass(classItem);
    setIsModalOpen(true);
  };

  const handleDeleteClass = (id) => {
    setClassToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteClass = async () => {
    try {
      await deleteClass(classToDelete);
      // Refresh the entire data after successful deletion
      await fetchClasses();
      if (selectedClass && selectedClass.id === classToDelete) {
        setSelectedClass(null);
      }
      toast.success('Class deleted successfully');
      setError(null);
    } catch (err) {
      setError('Failed to delete class');
      toast.error('Failed to delete class');
      console.error(err);
    } finally {
      setDeleteConfirmOpen(false);
      setClassToDelete(null);
    }
  };

  const handleSubmitClass = async (classData) => {
    try {
      // Make sure we have school_major_id for new classes
      if (!classData.id && !classData.school_major_id && selectedMajor) {
        classData.school_major_id = selectedMajor.id;
      }
      
      if (classData.id) {
        // Update
        await updateClass(classData.id, classData);
        toast.success('Class updated successfully');
      } else {
        // Create
        await createClass(classData);
        toast.success('Class created successfully');
      }
      
      // Close the modal first to prevent any state issues
      setIsModalOpen(false);
      
      // Then refresh the data completely
      await fetchClasses();
      
      // Reset the page to first page to make sure user can see the new/updated class
      setCurrentPage(1);
      
      setError(null);
    } catch (err) {
      const errorMessage = classData.id ? 'Failed to update class' : 'Failed to create class';
      setError(errorMessage);
      toast.error(`${errorMessage}: ${err.message || 'Unknown error'}`);
      console.error(err);
    }
  };

  const handleImport = async (data) => {
    try {
      await importClasses({ classes: data });
      // Refresh all data after import
      await fetchClasses();
      toast.success('Classes imported successfully');
    } catch (err) {
      setError('Failed to import classes');
      toast.error('Failed to import classes');
      console.error(err);
    }
  };

  // Get current entries for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEntries = entries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(entries.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Helper function to get major name with fallbacks
  const getMajorName = (classItem) => {
    if (classItem.school_major?.major_name) {
      return classItem.school_major.major_name;
    }
    if (classItem.majorName) {
      return classItem.majorName;
    }
    if (classItem.school_major_id) {
      return `Major ID: ${classItem.school_major_id}`;
    }
    return "Not assigned";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If detail view is active, show the class detail page
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
                <h2 className="text-xl font-semibold">Class Details</h2>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">{classDetail?.class_name}</h3>
                <p className="text-gray-500">ID-{String(classDetail?.id).padStart(4, '0')}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold mb-4 text-gray-700">Class Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Class Name</p>
                        <p className="font-medium">{classDetail?.class_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Major</p>
                        <p className="font-medium">{getMajorName(classDetail)}</p>
                      </div>
                      {classDetail?.created_at && (
                        <div>
                          <p className="text-sm text-gray-500">Created At</p>
                          <p>{new Date(classDetail.created_at).toLocaleString()}</p>
                        </div>
                      )}
                      {classDetail?.updated_at && (
                        <div>
                          <p className="text-sm text-gray-500">Updated At</p>
                          <p>{new Date(classDetail.updated_at).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
                
                {classDetail?.students && classDetail.students.length > 0 && (
                  <Card>
                    <div className="p-4">
                      <h4 className="text-lg font-semibold mb-4 text-gray-700">Students</h4>
                      <p className="mb-2">Total Students: {classDetail.students.length}</p>
                      <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                        {classDetail.students.map(student => (
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center">
          <BookOpen className="mr-2" size={24} />
          <h1 className="text-xl font-semibold">Classes</h1>
        </div>
        <Button 
          variant="primary" 
          onClick={handleAddClass} 
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
        >
          <Plus size={18} className="mr-1" /> Add Class
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
            
            {/* View mode toggles */}
            <div className="ml-0 md:ml-4 flex items-center">
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
            
            {classes.length > 0 && (
              <ExportToExcel 
                data={classes} 
                filename="classes_list"
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
                
                {classes.length > 0 && (
                  <ExportToExcel 
                    data={classes} 
                    filename="classes_list"
                    buttonText="Export" 
                    className="text-sm w-1/2"
                  />
                )}
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
                    ID Class
                    <ChevronDown className="inline ml-1" size={14} />
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Name
                    <ChevronDown className="inline ml-1" size={14} />
                  </th>
                  <th className="hidden md:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Major
                    <ChevronDown className="inline ml-1" size={14} />
                  </th>
                  <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEntries.length > 0 ? (
                  currentEntries.map((classItem, index) => (
                    <tr key={classItem.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        ID-{String(classItem.id).padStart(4, '0')}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {classItem.class_name}
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* Use our helper function to get the major name consistently */}
                        {getMajorName(classItem)}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleSelectClass(classItem)}
                            className="text-amber-500 hover:text-amber-700 p-1 rounded hover:bg-amber-50"
                            title="View details"
                            aria-label="View details"
                          >
                            <Eye size={16} className="sm:size-18" />
                          </button>
                          <button
                            onClick={() => handleEditClass(classItem)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                            title="Edit class"
                            aria-label="Edit class"
                          >
                            <Edit size={16} className="sm:size-18" />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(classItem.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                            title="Delete class"
                            aria-label="Delete class"
                          >
                            <Trash2 size={16} className="sm:size-18" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No classes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentEntries.length > 0 ? (
              currentEntries.map((classItem) => (
                <ClassItem 
                  key={classItem.id}
                  classItem={{
                    ...classItem,
                    major_name: getMajorName(classItem)
                  }}
                  onSelect={handleSelectClass}
                  onEdit={handleEditClass}
                  onDelete={handleDeleteClass}
                  isSelected={selectedClass?.id === classItem.id}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No classes found
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
        title={currentClass ? 'Edit Class' : 'Add Class'}
      >
        <ClassForm
          classItem={currentClass}
          majorName={currentClass?.school_major?.major_name || 
                    currentClass?.majorName || 
                    selectedMajor?.major_name || 
                    "PPLG"}
          onSubmit={(formData) => {
            // Ensure school_major_id is set for new classes
            if (!formData.id && selectedMajor && !formData.school_major_id) {
              formData.school_major_id = selectedMajor.id;
            }
            handleSubmitClass(formData);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Delete"
      >
        <p className="mb-4">Are you sure you want to delete this class?</p>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteClass}>
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

export default ClassesList;