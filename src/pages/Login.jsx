import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const Login = () => {
  const [formData, setFormData] = useState({
    // name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  // const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    // debugger
    e.preventDefault();
    // setMessage("");

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        // name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      // debugger

      // setMessage(response.data.message);

       if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", response.data.user.role);

        toast.success("Login successful ");

        
        if (response.data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/employee-dashboard");
        }
      } else {
        toast.error("Token not received from server!");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Server not responding. Please try again later.");
      }
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4 rounded-4" style={{ width: "100%", maxWidth: "400px" }}>
        <h3 className="text-center mb-4 text-primary fw-bold">Login</h3>

        <form onSubmit={handleSubmit}>
         

          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
            Login
          </button>

     
          <div className="text-center mt-3">
            <Link to="/forget-password" className="text-decoration-none text-info fw-semibold">
              Forgot Password?
            </Link>
          </div>
        </form>

    
      </div>
    </div>
  );
};

export default Login;
