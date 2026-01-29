import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // make sure axios is installed: npm install axios
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

  // =====================
  // HANDLE INPUT CHANGE
  // =====================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // =====================
  // VALIDATE FORM
  // =====================
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

  // =====================
  // HANDLE SUBMIT
  // =====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      date_of_birth: formData.dob,
      sex: formData.sex,
      phone: formData.contactNo,
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await axios.post(
        "http://localhost/ClearMind/clearmind-backend/registration.php",
        payload,
        {
          withCredentials: true, // allow cookies if needed
          headers: { "Content-Type": "application/json" },
        }
      );

      alert(response.data.message || "Registration successful!");
      navigate("/"); // redirect to login page

    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || "Registration failed");
      } else {
        alert("Server error. Please try again.");
      }
    }
  };

  // =====================
  // JSX
  // =====================
  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">

        <div className="text-center mb-4">
          <img src={logo_registration} alt="ClearMind Logo" className="img-fluid" style={{ maxWidth: "280px" }} />
        </div>

        <div className="card registration-card shadow-lg border-0 rounded-4">
          <div className="card-body p-4 p-md-5">
            <h3 className="text-center fw-bold mb-4" style={{ color: "#4E237C" }}>
              REGISTRATION
            </h3>

            <form onSubmit={handleSubmit} noValidate>

              {/* Name */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <input
                    type="text"
                    name="firstName"
                    className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                    placeholder="First Name *"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.firstName}</div>
                </div>

                <div className="col-md-6 mb-3">
                  <input
                    type="text"
                    name="lastName"
                    className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                    placeholder="Last Name *"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.lastName}</div>
                </div>
              </div>

              {/* DOB & Sex */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <input
                    type="date"
                    name="dob"
                    className={`form-control ${errors.dob ? "is-invalid" : ""}`}
                    value={formData.dob}
                    onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.dob}</div>
                </div>

                <div className="col-md-6 mb-3">
                  <select
                    name="sex"
                    className={`form-select ${errors.sex ? "is-invalid" : ""}`}
                    value={formData.sex}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Sex *</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div className="invalid-feedback">{errors.sex}</div>
                </div>
              </div>

              {/* Contact */}
              <div className="mb-3">
                <input
                  type="tel"
                  name="contactNo"
                  className={`form-control ${errors.contactNo ? "is-invalid" : ""}`}
                  placeholder="Contact No. *"
                  value={formData.contactNo}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.contactNo}</div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.email}</div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <input
                  type="password"
                  name="password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Password *"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.password}</div>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <input
                  type="password"
                  name="confirmPassword"
                  className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              </div>

              {/* Terms */}
              <div className="mb-4 text-center">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />{" "}
                I agree to the Terms and Conditions
                <div className="text-danger small">{errors.agreeTerms}</div>
              </div>

              {/* Submit */}
              <div className="d-grid mb-3">
                <button className="btn btn-register" type="submit">
                  REGISTER
                </button>
              </div>

              <div className="text-center">
                Already have an account?{" "}
                <button type="button" className="btn btn-link" onClick={() => navigate("/")}>
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
