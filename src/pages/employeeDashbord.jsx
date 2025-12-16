import React, { useState, useEffect } from "react";
import axios from "axios";

const EmployeeDashboard = () => {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/employee/total", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalEmployees(res.data.totalEmployees);
      } catch (error) {
        console.error("Error fetching total employees:", error.response?.data || error.message);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">
        Employee Dashboard
      </h1>
      <p className="text-gray-600 mb-6">
        Welcome to your Employee Management System.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-800">Total Employees</h2>
          <p className="text-2xl font-bold text-blue-600 mt-2">{totalEmployees}</p>
        </div>

       

        
      </div>
    </div>
  );
};

export default EmployeeDashboard;
