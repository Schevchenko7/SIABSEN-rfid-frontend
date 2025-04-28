import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../../components/Navbar/Admin/Sidebar"; // Pastikan path ini sesuai
import AdminNavbar from "../../../components/Navbar/Admin/Navbar"; // Pastikan path ini sesuai
import Footer from "../../Footer"; // Pastikan path ini sesuai

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex">
      {/* Sidebar yang bisa dibuka/tutup */}
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {/* Area konten utama */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
        {/* Navbar bisa mengontrol sidebar */}
        <AdminNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Konten halaman */}
        <div className="p-6 flex-1">
          <Outlet /> {/* Ini akan digantikan oleh halaman yang sesuai (Dashboard, Students, Users) */}
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;