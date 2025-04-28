import { NavLink } from "react-router-dom";
import { Home, Calendar, Menu, Users } from "lucide-react";
import { useEffect, useState } from "react";

const OperatorSidebar = ({ isOpen, toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Handle perubahan ukuran layar
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  return (
    <>
      {/* Overlay di mode mobile - tidak diubah */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative h-screen bg-white border-r shadow-lg transition-all z-50
          ${isOpen ? "w-64" : "w-20"}
          ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}`}
      >
        {/* Container untuk konten sidebar */}
        <div className="flex flex-col h-full">
          {/* Header sidebar dengan judul dan tombol toggle */}
          <div className="p-4 border-b flex items-center justify-between">
            {isOpen ? (
              <div className="flex items-center">
                <h2 className="font-semibold text-lg">SI-Absen</h2>
              </div>
            ) : (
              <div className="mx-auto"></div>
            )}
            <button 
              onClick={toggleSidebar} 
              className={`p-2 rounded-lg hover:bg-gray-100 focus:outline-none ${!isOpen ? "hidden md:block absolute right-2 top-4" : ""}`}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Menu navigasi */}
          <nav className="flex-1 py-6 px-3 overflow-y-auto">
            <div className="flex flex-col space-y-2">
              <NavLink
                to="/operator/dashboard"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <div className={`flex items-center ${!isOpen ? "mx-auto" : ""}`}>
                  <Home size={20} />
                  {isOpen && <span className="ml-3">Dashboard</span>}
                </div>
              </NavLink>

              {/* Data Siswa */}
              <NavLink
                to="/operator/students"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <div className={`flex items-center ${!isOpen ? "mx-auto" : ""}`}>
                  <Users size={20} />
                  {isOpen && <span className="ml-3">Data Siswa</span>}
                </div>
              </NavLink>

              {/* Data Kehadiran */}
              <NavLink
                to="/operator/attendances"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <div className={`flex items-center ${!isOpen ? "mx-auto" : ""}`}>
                  <Calendar size={20} />
                  {isOpen && <span className="ml-3">Data Kehadiran</span>}
                </div>
              </NavLink>
            </div>
          </nav>
          
          {/* Footer sidebar */}
          <div className="p-4 border-t">
            {isOpen && <p className="text-xs text-gray-500">SI-Absen © 2025</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default OperatorSidebar;