import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Registration.css";
import logo_registration from "../assets/CMPS_Logo.png";

function Registration() {
  const navigate = useNavigate();

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
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.sex) newErrors.sex = "Sex is required";
    if (!formData.contactNo.trim())
      newErrors.contactNo = "Contact number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      alert("Registration successful!");
      navigate("/");
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-wrapper row g-0  w-100">
        {/* Left Panel - Hidden on mobile, visible on lg+ */}
        <div className="col-lg-6 d-none d-lg-block left-panel">
          <h2>Welcome To ClearMind Psychological Services</h2>
          <p className="mt-5">
            Register to begin your journey toward emotional wellness and a
            clearer mind. We are here to support you with compassionate,
            professional care in a safe and secure environment.
          </p>
        </div>

        {/* Right Panel - Full width on mobile, half on lg+ */}
        <div className="col-12 col-lg-6 right-panel">
          <div className="logo-container">
            <img src={logo_registration} alt="ClearMind Logo" />
          </div>

          <h3 className="form-title">REGISTRATION</h3>

          <form onSubmit={handleSubmit} noValidate>
            <input
              type="text"
              name="firstName"
              className={`form-input ${errors.firstName ? "error" : ""}`}
              placeholder="First Name *"
              value={formData.firstName}
              onChange={handleChange}
            />
            {errors.firstName && (
              <span className="error-text">{errors.firstName}</span>
            )}

            <input
              type="text"
              name="lastName"
              className={`form-input ${errors.lastName ? "error" : ""}`}
              placeholder="Last Name *"
              value={formData.lastName}
              onChange={handleChange}
            />
            {errors.lastName && (
              <span className="error-text">{errors.lastName}</span>
            )}

            <input
              type="date"
              name="dob"
              className={`form-input ${errors.dob ? "error" : ""}`}
              placeholder="Date of Birth *"
              value={formData.dob}
              onChange={handleChange}
            />
            {errors.dob && <span className="error-text">{errors.dob}</span>}

            <select
              name="sex"
              className={`form-input ${errors.sex ? "error" : ""}`}
              value={formData.sex}
              onChange={handleChange}
            >
              <option value="">Sex *</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.sex && <span className="error-text">{errors.sex}</span>}

            <input
              type="tel"
              name="contactNo"
              className={`form-input ${errors.contactNo ? "error" : ""}`}
              placeholder="Contact No. *"
              value={formData.contactNo}
              onChange={handleChange}
            />
            {errors.contactNo && (
              <span className="error-text">{errors.contactNo}</span>
            )}

            <input
              type="email"
              name="email"
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}

            <input
              type="password"
              name="password"
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="Password *"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}

            <input
              type="password"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? "error" : ""}`}
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}

            <div className="checkbox-container">
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
            {errors.agreeTerms && (
              <span className="error-text">{errors.agreeTerms}</span>
            )}

            <button type="submit" className="submit-btn">
              REGISTER
            </button>

            <p className="login-link">
              Already have account?{" "}
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
