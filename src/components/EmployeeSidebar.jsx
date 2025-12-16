import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Home, Users, LogOut } from "lucide-react";

const EmployeeSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const menus = [
    { name: "My Dashboard", path: "/employee-dashboard", Icon: <Home size={20} /> },
    { name: "My Profile", path: "/employee-profile", Icon: <Users size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <>
      {/* mobile header */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-gray-900 text-white flex justify-between items-center p-4 z-50">
        <h1 className="text-lg font-semibold">EMS</h1>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <aside
        className={`fixed top-0 left-0 h-screen bg-gray-900 text-white flex flex-col justify-between transition-all duration-300 z-40 
        ${isOpen ? "w-64" : "w-16"} 
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* toggle button */}
        <div className="hidden md:flex justify-end p-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded hover:bg-gray-800 transition"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* menu items */}
        <div className="flex-1 flex flex-col mt-10 space-y-3 overflow-y-auto">
          {menus.map((menu, index) => (
            <Link
              key={index}
              to={menu.path}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 mt-5 px-3 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white transition"
            >
              {menu.Icon}
              {(isOpen || mobileOpen) && <span className="text-sm font-medium">{menu.name}</span>}
            </Link>
          ))}
        </div>

        {/* logout button */}
        {(isOpen || mobileOpen) && (
          <div className="px-3 mb-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-red-600 text-gray-300 hover:text-white transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}

        {(isOpen || mobileOpen) && (
          <p className="text-xs text-gray-400 text-center mb-4">
            EMS Employee Panel © 2025
          </p>
        )}
      </aside>

      {/* overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}
    </>
  );
};

export default EmployeeSidebar;
