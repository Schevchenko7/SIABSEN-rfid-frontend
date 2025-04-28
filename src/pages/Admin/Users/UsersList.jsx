import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUsers, createUser, updateUser, deleteUser} from '../../../services/Admin/usersServices';
import { useAppContext } from '../../../context/AppContext';
import Card from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import Modal from '../../../components/UI/Modal';
import { User, Search, UserPlus, Edit, Trash2, Eye, ArrowLeft, Menu } from 'lucide-react';
import UsersForm from './UsersForm';
import UsersItem from './UsersItem';

const UsersList = () => {
  const { selectedUser, setSelectedUser } = useAppContext();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Detail view state
  const [showDetailView, setShowDetailView] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [entries, setEntries] = useState([]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users && users.length > 0) {
      const filtered = users.filter(user => {
        if (!user) return false;
        
        const name = user.name || '';
        const email = user.email || '';
        const role = user.role || '';
        
        return name.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
               role.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
      setEntries(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      const usersArray = Array.isArray(data) ? data : [];
      setUsers(usersArray);
      setEntries(usersArray);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      toast.error('Failed to fetch users');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setUserDetail(user);
    setShowDetailView(true);
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setShowDetailView(false);
    setUserDetail(null);
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id) => {
    setUserToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await deleteUser(userToDelete);
      await fetchUsers();
      if (selectedUser && selectedUser.id === userToDelete) {
        setSelectedUser(null);
      }
      toast.success('User deleted successfully');
      setError(null);
    } catch (err) {
      setError('Failed to delete user');
      toast.error('Failed to delete user');
      console.error(err);
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSubmitUser = async (userData) => {
    try {
      if (userData.id) {
        await updateUser(userData.id, userData);
        toast.success('User updated successfully');
      } else {
        await createUser(userData);
        toast.success('User created successfully');
      }
      
      setIsModalOpen(false);
      await fetchUsers();
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      const errorMessage = userData.id ? 'Failed to update user' : 'Failed to create user';
      setError(errorMessage);
      toast.error(errorMessage);
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

  // If detail view is active, show the user detail page
  if (showDetailView && userDetail) {
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
                <h2 className="text-xl font-semibold">User Details</h2>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">{userDetail?.name}</h3>
                <p className="text-gray-500">{userDetail?.email}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold mb-4 text-gray-700">User Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{userDetail?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{userDetail?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="font-medium">{userDetail?.role}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email Verified At</p>
                        <p className="font-medium">
                          {userDetail?.email_verified_at 
                            ? new Date(userDetail.email_verified_at).toLocaleString() 
                            : 'Not verified'}
                        </p>
                      </div>
                      {userDetail?.created_at && (
                        <div>
                          <p className="text-sm text-gray-500">Created At</p>
                          <p>{new Date(userDetail.created_at).toLocaleString()}</p>
                        </div>
                      )}
                      {userDetail?.updated_at && (
                        <div>
                          <p className="text-sm text-gray-500">Updated At</p>
                          <p>{new Date(userDetail.updated_at).toLocaleString()}</p>
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
          <User className="mr-2" size={24} />
          <h1 className="text-xl font-semibold">Users</h1>
        </div>
        <Button 
          variant="primary" 
          onClick={handleAddUser} 
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
        >
          <UserPlus size={18} className="mr-1" /> Add User
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
          </div>
          
          {/* Desktop: Search always visible */}
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
          </div>
          
          {/* Mobile: Toggle button and expandable menu */}
          <div className="w-full md:hidden">
            <div className="relative flex-grow">
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
                  ID
                </th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="hidden md:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="hidden md:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries && currentEntries.length > 0 ? (
                currentEntries.map((user, index) => (
                  <tr key={user?.id || index} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {user?.id || ''}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user?.name || ''}
                    </td>
                    <td className="hidden md:table-cell px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {user?.email || ''}
                    </td>
                    <td className="hidden md:table-cell px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user?.role === 'admin' ? 'bg-green-100 text-green-800' : 
                          user?.role === 'sub-admin' ? 'bg-purple-100 text-purple-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {user?.role || ''}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleSelectUser(user)}
                          className="text-amber-500 hover:text-amber-700 p-1 rounded hover:bg-amber-50"
                          title="View details"
                          aria-label="View details"
                        >
                          <Eye size={16} className="sm:size-18" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                          title="Edit user"
                          aria-label="Edit user"
                        >
                          <Edit size={16} className="sm:size-18" />
                        </button>
                        <button
                          onClick={() => user?.id ? handleDeleteUser(user.id) : null}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          title="Delete user"
                          aria-label="Delete user"
                          disabled={!user?.id}
                        >
                          <Trash2 size={16} className="sm:size-18" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found
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
        title={currentUser ? 'Edit User' : 'Add User'}
      >
        <UsersForm
          user={currentUser}
          onSubmit={handleSubmitUser}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Delete"
      >
        <p className="mb-4">Are you sure you want to delete this user?</p>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteUser}>
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

export default UsersList;