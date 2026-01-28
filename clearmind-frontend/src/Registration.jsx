import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./Registration.css";
import logo_registration from "./assets/CMPS_Logo.png";

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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.sex) newErrors.sex = "Sex is required";
    if (!formData.contactNo.trim()) newErrors.contactNo = "Contact number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Here you would normally send data to backend
      console.log("Form submitted:", formData);

      // Example: redirect to login after success
      alert("Registration successful! (demo)");
      navigate("/"); // or "/login"
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
        {/* Logo */}
        <div className="text-center mb-4">
          <img
            src={logo_registration}
            alt="ClearMind Logo"
            className="img-fluid"
            style={{ maxWidth: "280px" }}
          />
        </div>

        {/* Card */}
        <div className="card registration-card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="card-body p-4 p-md-5">
            <h3 className="text-center fw-bold mb-4" style={{ color: "#4E237C" }}>
              REGISTRATION
            </h3>

            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <input
                    type="text"
                    name="firstName"
                    className={`form-control custom-input ${errors.firstName ? "is-invalid" : ""}`}
                    placeholder="First Name *"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <input
                    type="text"
                    name="lastName"
                    className={`form-control custom-input ${errors.lastName ? "is-invalid" : ""}`}
                    placeholder="Last Name *"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <input
                    type="date"
                    name="dob"
                    className={`form-control custom-input ${errors.dob ? "is-invalid" : ""}`}
                    value={formData.dob}
                    onChange={handleChange}
                  />
                  {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <select
                    name="sex"
                    className={`form-select custom-input ${errors.sex ? "is-invalid" : ""}`}
                    value={formData.sex}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Sex *</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.sex && <div className="invalid-feedback">{errors.sex}</div>}
                </div>
              </div>

              <div className="mb-3">
                <input
                  type="tel"
                  name="contactNo"
                  className={`form-control custom-input ${errors.contactNo ? "is-invalid" : ""}`}
                  placeholder="Contact No. *"
                  value={formData.contactNo}
                  onChange={handleChange}
                />
                {errors.contactNo && <div className="invalid-feedback">{errors.contactNo}</div>}
              </div>

              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  className={`form-control custom-input ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  name="password"
                  className={`form-control custom-input ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Password *"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              <div className="mb-4">
                <input
                  type="password"
                  name="confirmPassword"
                  className={`form-control custom-input ${errors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="mb-4 d-flex align-items-center justify-content-center gap-2">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  className={`form-check-input custom-checkbox ${errors.agreeTerms ? "is-invalid" : ""}`}
                  id="terms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <label className="form-check-label small-text mb-0" htmlFor="terms">
                  I agree to the{" "}
                  <a href="#" className="purple-link text-decoration-underline">
                    Terms and Conditions
                  </a>
                </label>
              </div>
              {errors.agreeTerms && (
                <div className="text-danger text-center small mb-3">{errors.agreeTerms}</div>
              )}

              {/* Submit Button */}
              <div className="d-grid mb-4">
                <button
                  type="submit"
                  className="btn btn-register shadow-sm"
                  style={{
                    backgroundColor: "#4E237C",
                    color: "white",
                    fontWeight: 600,
                    padding: "12px",
                    borderRadius: "10px",
                  }}
                >
                  REGISTRATION
                </button>
              </div>

              {/* Login link */}
              <div className="text-center small-text">
                Already have an account?{" "}
                <button
                  type="button"
                  className="btn btn-link purple-link fw-bold p-0 text-decoration-none"
                  onClick={() => navigate("/")}
                >
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;