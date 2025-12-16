import React from "react";
import EmployeeSidebar from "./EmployeeSidebar";
import { Outlet } from "react-router-dom";

const EmployeeLayout = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      
      {/* Employee Sidebar */}
      <EmployeeSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 md:ml-64 mt-16 md:mt-0 transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
};

export default EmployeeLayout;
