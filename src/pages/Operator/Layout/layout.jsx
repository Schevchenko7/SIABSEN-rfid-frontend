import { useState } from "react";
import { Outlet } from "react-router-dom";
import OperatorSidebar from "../../../components/Navbar/Operator/Sidebar";
import OperatorNavbar from "../../../components/Navbar/Operator/Navbar";
import Footer from "../../Footer"; // Pastikan path ini sesuai

const OperatorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex">
      {/* Sidebar yang bisa dibuka/tutup */}
      <OperatorSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {/* Area konten utama */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
        {/* Navbar bisa mengontrol sidebar */}
        <OperatorNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Konten halaman */}
        <div className="p-6 flex-1">
          <Outlet /> {/* Ini akan digantikan oleh halaman yang sesuai (Dashboard, Attendances, dll) */}
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default OperatorLayout;