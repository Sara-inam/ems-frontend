import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DEPT_API, EMP_API } from "../config.js";
import AsyncSelect from 'react-select/async';

const token = localStorage.getItem("token");

const axiosAuth = axios.create({
  headers: { Authorization: `Bearer ${token}` },
});

const ManageDepartment = () => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    discription: "",
    head: "",
  });
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // FETCH EMPLOYEES
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await axiosAuth.get(`${EMP_API}/get`);
      return res.data.employees || [];
    },
  });

  // FETCH DEPARTMENTS
  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await axiosAuth.get(`${DEPT_API}/get`);
      return res.data.departments || [];
    },
  });

  const departments = data || [];

  // CREATE / UPDATE DEPARTMENT
  const createMutation = useMutation({
    mutationFn: (body) => axiosAuth.post(`${DEPT_API}/create`, body),
    onSuccess: () => {
      toast.success("Department created");
      queryClient.invalidateQueries(["departments"]);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => axiosAuth.put(`${DEPT_API}/update-department/${id}`, body),
    onSuccess: () => {
      toast.success("Department updated");
      queryClient.invalidateQueries(["departments"]);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Error"),
  });

  // DELETE DEPARTMENT (Fix)
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosAuth.delete(`${DEPT_API}/delete/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Department deleted");
      queryClient.invalidateQueries(["departments"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error deleting department");
    },
  });

  // FORM HANDLERS
  const openModal = (dept = null) => {
    if (dept) {
      setEditId(dept._id);
      setFormData({
        name: dept.name,
        discription: dept.discription || "",
        head: dept.head?._id || "",
      });
    } else {
      setEditId(null);
      setFormData({ name: "", discription: "", head: "" });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Department name is required");
      return;
    }
    editId
      ? updateMutation.mutate({ id: editId, body: formData })
      : createMutation.mutate(formData);
    closeModal();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Departments</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Department
        </button>
      </div>

      {isLoading && <p className="text-center">Loading departments...</p>}
      {!isLoading && departments.length === 0 && <p className="text-center text-gray-500">No departments found</p>}

      {!isLoading && departments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Name</th>
                <th className="p-3">Description</th>
                <th className="p-3">Head</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={dept._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{dept.name}</td>
                  <td className="p-3">{dept.discription}</td>
                  <td className="p-3">{dept.head?.email || "N/A"}</td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button onClick={() => openModal(dept)} className="text-blue-600">Edit</button>
                    <button
                      onClick={() => deleteMutation.mutate(dept._id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 w-full max-w-lg rounded shadow">
            <h2 className="text-xl font-semibold mb-4">{editId ? "Edit Department" : "Add Department"}</h2>
            {errorMsg && <p className="text-red-600 text-sm text-center pb-4">{errorMsg}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Department Name"
                className="border p-2 rounded"
                required
              />
              <input
                name="discription"
                value={formData.discription}
                onChange={handleChange}
                placeholder="Description"
                className="border p-2 rounded"
              />
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={async (inputValue) => {
                  if (!inputValue) return [];
                  try {
                    const res = await axiosAuth.get(`${EMP_API}/search?query=${inputValue}`);
                    return res.data.employees.map(emp => ({
                      value: emp._id,
                      label: emp.email,
                    }));
                  } catch (err) {
                    console.error(err);
                    return [];
                  }
                }}
                onChange={(selected) => setFormData({ ...formData, head: selected?.value || "" })}
                placeholder="Select Head"
              />
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

export default ManageDepartment;
