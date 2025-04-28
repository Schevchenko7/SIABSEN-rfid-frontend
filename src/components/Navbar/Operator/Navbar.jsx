import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, LogOut } from "lucide-react";
import api from "../../../utils/axios";

const OperatorNavbar = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [operatorData, setOperatorData] = useState({ name: "Operator", avatar: "", email: "" });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch data operator dari API
  useEffect(() => {
    api.get("/operator/profile")
      .then((response) => {
        setOperatorData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching operator data:", error);
      });
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await api.post("/logout");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  // Menutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm md:px-6">
      {/* Tombol menu untuk toggle sidebar */}
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="mr-2 md:hidden">
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
        <Link to="/operator/dashboard" className="text-xl font-bold text-gray-800">
          SI-Absen Operator
        </Link>
      </div>

      {/* Profil Operator */}
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="h-10 w-10 rounded-full border bg-gray-200">
          {operatorData.avatar ? (
            <img src={operatorData.avatar} alt="Operator" className="h-full w-full rounded-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-gray-600" />
          )}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg">
            <div className="p-3">
              <p className="font-medium">{operatorData.name}</p>
              <p className="text-xs text-gray-500">{operatorData.email}</p>
            </div>
            <hr />
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100">
              <LogOut className="inline-block mr-2 h-4 w-4" /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default OperatorNavbar;