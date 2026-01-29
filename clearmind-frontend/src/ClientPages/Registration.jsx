import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "./Registration.css";
import logo_registration from "../assets/CMPS_Logo.png";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

function Registration() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState(null); // success or error from backend

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    sex: "",
    contactNo: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    // Optional fields present in your DB — add inputs if needed
    middleInitial: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Clear server message on any input change
    setServerMessage(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.sex) newErrors.sex = "Sex is required";
    if (!formData.contactNo.trim()) newErrors.contactNo = "Contact number is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage(null);

    if (!validateForm()) return;

    setLoading(true);

    // Map React field names → PHP expected names
    const payload = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      middle_initial: formData.middleInitial.trim() || null,
      sex: formData.sex,
      date_of_birth: formData.dob,                 // expects YYYY-MM-DD from <input type="date">
      email_address: formData.email.trim(),
      phone: formData.contactNo.trim(),
      address: formData.address.trim() || null,
      password: formData.password,
    };

    try {
      const response = await axiosClient.post(
        "registration.php",   // ← CHANGE TO YOUR ACTUAL ENDPOINT
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setServerMessage({ type: "success", text: response.data.message || "Registration successful!" });
      setTimeout(() => {
        navigate("/"); // or "/login" or "/dashboard"
      }, 1500);

    } catch (error) {
      let errorMsg = "Something went wrong. Please try again.";

      if (error.response) {
        if (error.response.status === 409) {
          errorMsg = "This email is already registered.";
        } else if (error.response.data?.error) {
          errorMsg = error.response.data.error;
        }
      } else if (error.request) {
        errorMsg = "No response from server. Check your network or backend.";
      }

      setServerMessage({ type: "error", text: errorMsg });
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-wrapper row g-0 w-100">
        {/* Left Panel */}
        <div className="col-lg-6 d-none d-lg-block left-panel">
          <h2>Welcome To ClearMind Psychological Services</h2>
          <p className="mt-5">
            Register to begin your journey toward emotional wellness and a
            clearer mind. We are here to support you with compassionate,
            professional care in a safe and secure environment.
          </p>
        </div>

        {/* Right Panel - Form */}
        <div className="col-12 col-lg-6 right-panel">
          <div className="logo-container">
            <img src={logo_registration} alt="ClearMind Logo" />
          </div>

          <h3 className="form-title">REGISTRATION</h3>

          {serverMessage && (
            <div className={`alert mb-3 ${serverMessage.type === "success" ? "alert-success" : "alert-danger"}`}>
              {serverMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* First Name */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 input-icon"><FaUser /></span>
                <input
                  type="text"
                  name="firstName"
                  className={`form-control border-start-0 ${errors.firstName ? "is-invalid" : ""}`}
                  placeholder="First Name *"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName}</div>}
            </div>

            {/* Last Name */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 input-icon"><FaUser /></span>
                <input
                  type="text"
                  name="lastName"
                  className={`form-control border-start-0 ${errors.lastName ? "is-invalid" : ""}`}
                  placeholder="Last Name *"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName}</div>}
            </div>

            {/* Date of Birth */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 input-icon"><FaCalendarAlt /></span>
                <input
                  type="date"
                  name="dob"
                  className={`form-control border-start-0 ${errors.dob ? "is-invalid" : ""}`}
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
              {errors.dob && <div className="invalid-feedback d-block">{errors.dob}</div>}
            </div>

            {/* Sex */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 input-icon"><FaUser /></span>
                <select
                  name="sex"
                  className={`form-select border-start-0 ${errors.sex ? "is-invalid" : ""}`}
                  value={formData.sex}
                  onChange={handleChange}
                >
                  <option value="">Sex *</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              {errors.sex && <div className="invalid-feedback d-block">{errors.sex}</div>}
            </div>

            {/* Contact No */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 input-icon"><FaPhone /></span>
                <input
                  type="tel"
                  name="contactNo"
                  className={`form-control border-start-0 ${errors.contactNo ? "is-invalid" : ""}`}
                  placeholder="Contact No. *"
                  value={formData.contactNo}
                  onChange={handleChange}
                />
              </div>
              {errors.contactNo && <div className="invalid-feedback d-block">{errors.contactNo}</div>}
            </div>

            {/* Email */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 input-icon"><FaEnvelope /></span>
                <input
                  type="email"
                  name="email"
                  className={`form-control border-start-0 ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 input-icon"><FaLock /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`form-control border-start-0 border-end-0 ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Password *"
                  value={formData.password}
                  onChange={handleChange}
                />
                <span
                  className="input-group-text bg-white border-start-0 input-icon"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 input-icon"><FaLock /></span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`form-control border-start-0 border-end-0 ${errors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <span
                  className="input-group-text bg-white border-start-0 input-icon"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
            </div>

            {/* Checkbox */}
            <div className="checkbox-container mb-3">
              <input
                type="checkbox"
                name="agreeTerms"
                id="terms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <label htmlFor="terms">
                I agree to the <a href="#">Terms and Conditions</a>
              </label>
            </div>
            {errors.agreeTerms && <span className="error-text d-block mb-3">{errors.agreeTerms}</span>}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Registering..." : "REGISTER"}
            </button>

            <p className="login-link mt-3">
              Already have an account?{" "}
              <button type="button" onClick={() => navigate("/")}>
                Log In
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Registration;