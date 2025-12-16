import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "react-toastify/dist/ReactToastify.css";
import { EMP_API } from "../config.js";

const token = localStorage.getItem("token");
const axiosAuth = axios.create({
  headers: { Authorization: `Bearer ${token}` },
});

const EmployeeProfile = () => {
  const queryClient = useQueryClient();
  const [previewImage, setPreviewImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "" });

  // Fetch Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axiosAuth.get(`${EMP_API}/profile`);
      const data = res.data.data;
      setFormData({ name: data.name || "" });
      return data;
    },
  });

  // Update Profile
  const updateMutation = useMutation({
    mutationFn: async (body) => {
      const fd = new FormData();
      if (body.name) fd.append("name", body.name);
      if (previewImage) fd.append("profileImage", previewImage);
      return axiosAuth.put(`${EMP_API}/update-profile`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      toast.success("Profile updated successfully!");
      setEditMode(false);
      setPreviewImage(null);

      const updatedProfile = res.data.data;
      queryClient.setQueryData(["profile"], (oldData) => ({
        ...oldData,
        name: updatedProfile.name,
        profileImage: updatedProfile.profileImage,
      }));
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error updating profile"),
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!previewImage && formData.name === profile?.name) {
      toast.info("No changes to update");
      return;
    }
    updateMutation.mutate(formData);
  };

  if (isLoading) return <p className="text-center">Loading profile...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6 mt-10">
      <ToastContainer />
      <h2 className="text-2xl font-bold text-center mb-4">Employee Profile</h2>

      {/* Profile Image */}
      <div className="flex justify-center mb-4">
        <img
          src={previewImage ? URL.createObjectURL(previewImage) : profile?.profileImage}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover shadow"
        />
      </div>

      {/* Image Upload */}
      {editMode && (
        <div className="text-center mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPreviewImage(e.target.files[0])}
          />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          disabled={!editMode}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Name"
        />
        <input
          type="email"
          value={profile?.email || ""}
          disabled
          className="w-full border p-2 rounded bg-gray-100"
        />
        <input
          type="number"
          value={profile?.salary || ""}
          disabled
          className="w-full border p-2 rounded bg-gray-100"
        />
        <input
          type="text"
          value={profile?.role || ""}
          disabled
          className="w-full border p-2 rounded bg-gray-100"
        />

        {/* All Departments */}
        <div className="border p-2 rounded bg-gray-100">
          <h3 className="font-semibold mb-1">Departments:</h3>
          <p>{profile.departments.join(", ") || "No departments"}</p>
        </div>

        {/* Head Departments */}
        <div className="border p-2 rounded bg-gray-100">
          <h3 className="font-semibold mb-1">Head of Departments:</h3>
          <p>{profile.headDepartments.join(", ") || "Not a head of any department"}</p>
        </div>

        <div className="flex justify-between mt-4">
          {!editMode ? (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setPreviewImage(null);
                  setFormData({ name: profile?.name || "" });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default EmployeeProfile;
