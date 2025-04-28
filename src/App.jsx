import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Footer from "./pages/Footer"; // Pastikan path footer yang benar

// Admin imports
import AdminLayout from "./pages/Admin/Layout/layout";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import AdminMajorsList from "./pages/Admin/Student Data/Majors/MajorsList";
import AdminClassesList from "./pages/Admin/Student Data/Classes/ClassesList";
import AdminStudentsList from "./pages/Admin/Student Data/Students/StudentsList";
import AdminAttendancesList from "./pages/Admin/Data Attendance/AttendancesList";
import UsersList from "./pages/Admin/Users/UsersList";

// Operator imports
import OperatorLayout from "./pages/Operator/Layout/layout";
import OperatorDashboard from "./pages/Operator/Dashboard/Dashboard";
import OperatorStudentsList from "./pages/Operator/Student Data/Students/StudentsList";
import OperatorAttendancesList from "./pages/Operator/Student Data/Attendances/AttendancesList";

import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";
import { AppProvider } from "./context/AppContext";

// Layout dasar dengan footer untuk halaman yang tidak memiliki layout khusus
const BaseLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Login dengan footer */}
          <Route path="/login" element={
            <BaseLayout>
              <Login />
            </BaseLayout>
          } />
          
          {/* Admin routes - AdminLayout sudah menyertakan Footer */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="majors" element={<AdminMajorsList />} />
            <Route path="classes" element={<AdminClassesList />} />
            <Route path="students" element={<AdminStudentsList />} />
            <Route path="attendances" element={<AdminAttendancesList />} />
            <Route path="users" element={<UsersList />} />
          </Route>

          {/* Operator routes - OperatorLayout sudah menyertakan Footer */}
          <Route
            path="/operator"
            element={
              <ProtectedRoute requiredRole="operator">
                <OperatorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<OperatorDashboard />} />
            <Route path="students" element={<OperatorStudentsList />} />
            <Route path="attendances" element={<OperatorAttendancesList />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;