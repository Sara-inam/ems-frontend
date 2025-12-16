import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_API, DEPT_API, EMP_API } from "../config.js";

// const BASE_URL = "http://localhost:3000";
const token = localStorage.getItem("token");

const axiosAuth = axios.create({
  headers: { Authorization: `Bearer ${token}` },
});

const ManageEmployee = () => {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    departments: [],
    salary: "",
    profileImage: null,
    existingImage: null,
  });

  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ----------- Fetch Departments -----------
  const { data: allDepartmentsData = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await axiosAuth.get(`${DEPT_API}/get`);
      return res.data.departments || [];
    },
  });

  // ----------- Fetch Employees -----------
  const { data: employeesData = [], isLoading } = useQuery({
    queryKey: ["employees", pagination.currentPage],
    queryFn: async () => {
      const res = await axiosAuth.get(
        `${EMP_API}/get?page=${pagination.currentPage}&limit=${pagination.perPage}&sort=-createdAt`
      );
      setPagination({
        currentPage: res.data.pagination.currentPage,
        totalPages: res.data.pagination.totalPages,
        perPage: res.data.pagination.perPage,
      });
      return res.data.users || [];
    },
    keepPreviousData: true,
  });

  // ----------- Mutations -----------
  const createMutation = useMutation({
    mutationFn: (body) =>
      axiosAuth.post(`${EMP_API}/create`, body, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", pagination.currentPage] });
      toast.success("Employee created successfully");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error creating employee"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) =>
      axiosAuth.put(`${EMP_API}/update-employee/${id}`, body, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", pagination.currentPage] });
      toast.success("Employee updated successfully");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error updating employee"),
  });

  const softDeleteMutation = useMutation({
    mutationFn: (id) => axiosAuth.patch(`${EMP_API}/soft-delete/${id}`),
    onSuccess: () => {
      toast.success("Employee soft deleted");
      queryClient.invalidateQueries({ queryKey: ["employees", pagination.currentPage] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id) => axiosAuth.patch(`${EMP_API}/restore/${id}`),
    onSuccess: () => {
      toast.success("Employee restored");
      queryClient.invalidateQueries({ queryKey: ["employees", pagination.currentPage] });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id) => axiosAuth.delete(`${EMP_API}/delete/${id}`),
    onSuccess: () => {
      toast.success("Employee permanently deleted");
      queryClient.invalidateQueries({ queryKey: ["employees", pagination.currentPage] });
    },
  });

  // ----------- Modal Handling -----------
  const openModal = (emp = null) => {
    if (emp) {
      setEditId(emp._id);
      setFormData({
        name: emp.name,
        email: emp.email,
        password: "",
        role: emp.role,
        departments: emp.departments ? emp.departments.map((d) => String(d._id)) : [],
        salary: emp.salary || "",
        profileImage: null,
        existingImage: emp.profileImage || null,
      });
    } else {
      setEditId(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "employee",
        departments: [],
        salary: "",
        profileImage: null,
        existingImage: null,
      });
    }
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorMsg("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profileImage: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("email", formData.email);
    fd.append("salary", formData.salary);
    fd.append("role", formData.role);
    formData.departments.forEach((dep) => fd.append("departments[]", dep));
    if (!editId) fd.append("password", formData.password);
    if (formData.profileImage instanceof File) fd.append("profileImage", formData.profileImage);

    editId ? updateMutation.mutate({ id: editId, body: fd }) : createMutation.mutate(fd);

    closeModal();
  };

  const getPreview = (file, existingPath = null) => {
    if (file instanceof File) return URL.createObjectURL(file);
    if (existingPath) return existingPath.startsWith("/") ? `${BASE_API}${existingPath}` : existingPath;
    return null;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Employees</h1>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Employee
        </button>
      </div>

      {isLoading && <p className="text-center">Loading employees...</p>}
      {!isLoading && employeesData.length === 0 && <p className="text-center text-gray-500">No employees found</p>}

      {!isLoading && employeesData.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Profile</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Salary</th>
                  <th className="p-3">Departments</th>
                  <th className="p-3">Head of Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employeesData.map((emp, index) => (
                  <tr
                    key={emp._id}
                    className={`border-b ${emp.isDeleted ? "bg-gray-100 italic text-gray-500" : "hover:bg-gray-50"}`}
                  >
                    <td className="p-3">{(pagination.currentPage - 1) * pagination.perPage + index + 1}</td>
                    <td className="p-3">
                      {emp.profileImage ? (
                        <img
                          src={emp.profileImage.startsWith("/") ? `${BASE_URL}${emp.profileImage}` : emp.profileImage}
                          alt={emp.name}
                          className={`w-10 h-10 rounded-full object-cover ${emp.isDeleted ? "opacity-50" : ""}`}
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className={`p-3 ${emp.isDeleted ? "line-through" : ""}`}>{emp.name}</td>
                    <td className={`p-3 ${emp.isDeleted ? "line-through" : ""}`}>{emp.email}</td>
                    <td className={`p-3 capitalize ${emp.isDeleted ? "line-through" : ""}`}>{emp.role}</td>
                    <td className={`p-3 ${emp.isDeleted ? "line-through" : ""}`}>{emp.salary || "-"}</td>
                    <td className={`p-3 ${emp.isDeleted ? "line-through" : ""}`}>{emp.departments?.map((d) => d.name).join(", ") || "-"}</td>
                    <td className={`p-3 ${emp.isDeleted ? "line-through" : ""}`}>
                      {emp.departments?.some(d => d.head?._id === emp._id)
                        ? emp.departments
                          .filter(d => d.head?._id === emp._id)
                          .map(d => d.name)
                          .join(", ")
                        : "-"
                      }
                    </td>
                    <td className={`p-3 font-semibold ${emp.isDeleted ? "text-red-600" : "text-green-600"}`}>
                      {emp.isDeleted ? "Deleted" : "Active"}
                    </td>
                    <td className="p-3 flex gap-2 justify-center">
                      {!emp.isDeleted ? (
                        <>
                          <button onClick={() => openModal(emp)} className="text-blue-600">Edit</button>
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this employee?")) {
                                softDeleteMutation.mutate(emp._id);
                              }
                            }}
                            className="text-red-600"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => restoreMutation.mutate(emp._id)}
                            className="text-green-600"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to permanently delete this employee?")) {
                                permanentDeleteMutation.mutate(emp._id);
                              }
                            }}
                            className="text-red-800"
                          >
                            Permanent Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>


            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => setPagination(p => ({ ...p, currentPage: 1 }))}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >First</button>
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >Prev</button>
            <span className="font-semibold">Page {pagination.currentPage} / {pagination.totalPages}</span>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >Next</button>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, currentPage: pagination.totalPages }))}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >Last</button>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 w-full max-w-lg rounded shadow">
            <h2 className="text-xl font-semibold mb-4">{editId ? "Edit Employee" : "Add Employee"}</h2>
            {errorMsg && <p className="text-red-600 text-sm text-center pb-4">{errorMsg}</p>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block mb-1 font-medium">Profile Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {getPreview(formData.profileImage, formData.existingImage) && (
                  <img src={getPreview(formData.profileImage, formData.existingImage)} alt="Profile" className="w-20 h-20 mt-2 rounded-full object-cover" />
                )}
              </div>

              <input name="name" value={formData.name} onChange={handleChange} placeholder="Employee Name" className="border p-2 rounded" required />
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Employee Email" className="border p-2 rounded" required />
              {!editId && <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" className="border p-2 rounded" required />}
              <input name="role" value={formData.role} readOnly className="border p-2 rounded" />
              <input name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="Employee Salary" className="border p-2 rounded" required />

              <div>
                <label className="block mb-1 font-medium">Departments</label>
                <div className="flex flex-col max-h-40 overflow-y-auto border p-2 rounded">
                  {allDepartmentsData.map(dep => (
                    <label key={dep._id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={String(dep._id)}
                        checked={formData.departments.includes(String(dep._id))}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            departments: prev.departments.includes(value)
                              ? prev.departments.filter(d => d !== value)
                              : [...prev.departments, value],
                          }));
                        }}
                      />
                      {dep.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{editId ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployee;
