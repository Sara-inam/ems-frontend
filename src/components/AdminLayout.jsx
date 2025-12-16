// src/layouts/AdminLayout.jsx
import React from "react";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
     
      <AdminSidebar />

      
      <div className="flex-1 p-6 md:ml-64 mt-16 md:mt-0 transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
