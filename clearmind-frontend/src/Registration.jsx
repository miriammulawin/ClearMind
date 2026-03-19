import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Form, Button, Image, Container } from "react-bootstrap";
import "./Registration.css";
import logo_registration from "./assets/CMPS_Logo.png";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gender options array
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "transgender", label: "Transgender" },
    { value: "trans-woman", label: "Trans woman" },
    { value: "trans-man", label: "Trans man" },
    { value: "non-binary", label: "Non-binary" },
    { value: "genderqueer", label: "Genderqueer" },
    { value: "gender-fluid", label: "Gender fluid" },
    { value: "agender", label: "Agender" },
    { value: "bigender", label: "Bigender" },
    { value: "two-spirit", label: "Two-spirit" },
    { value: "intersex", label: "Intersex" },
    { value: "pangender", label: "Pangender" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
  ];

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Date of Birth validation
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age < 13) {
        newErrors.dob = "You must be at least 13 years old";
      }
    }

    // Sex validation
    if (!formData.sex) {
      newErrors.sex = "Sex is required";
    }

    // Contact Number validation
    if (!formData.contactNo.trim()) {
      newErrors.contactNo = "Contact number is required";
    } else if (!/^[0-9\s\-\+\(\)]+$/.test(formData.contactNo)) {
      newErrors.contactNo = "Invalid contact number format";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[A-Za-z])/.test(formData.password)) {
      newErrors.password = "Password must contain letters";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms validation
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      console.log("Form submitted:", formData);

      // Here you would normally send data to your backend
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // if (response.ok) {
      //   alert('Registration successful!');
      //   navigate('/');
      // }

      // For demo purposes:
      alert("Registration successful! Redirecting to home...");
      
      // Reset form
      setFormData({
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
      setErrors({});

      // Navigate after a short delay
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle login link
  const handleLoginLink = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="registration-container vh-100 d-flex justify-content-center align-items-center p-2">
      <Row
        className="w-100 g-0 mx-auto"
        style={{
          maxWidth: "1400px",
          background: "white",
          borderRadius: "25px",
          border: "3px solid #a276d0",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Left Panel - Hidden on screens smaller than lg */}
        <Col
          lg={6}
          className="d-none d-lg-flex left-panel align-items-start justify-content-center p-5"
          style={{ minHeight: "600px" }}
        >
          <div className="px-4 pt-5">
            <h2
              className="mb-3 fw-bold"
              style={{ fontSize: "30px", lineHeight: "1.3", marginTop: "80px" }}
            >
              Welcome To ClearMind Psychological Services
            </h2>
            <p
              className="lead"
              style={{ fontSize: "20px", lineHeight: "1.6", opacity: "0.95" }}
            >
              Register to begin your journey toward emotional wellness and a
              clearer mind. We are here to support you with compassionate,
              professional care in a safe and secure environment.
            </p>
          </div>
        </Col>

        {/* Right Panel - Full width on mobile, half on lg+ */}
        <Col
          xs={12}
          lg={6}
          className="d-flex align-items-center justify-content-center p-3 p-md-4 p-lg-5"
          style={{ background: "rgba(255, 255, 255, 0.72)" }}
        >
          <Card
            className="registration-card w-100"
            style={{ maxWidth: "500px" }}
          >
            <Card.Body className="p-3 p-sm-4 p-md-5">
              {/* Logo and Title */}
              <div className="text-center mb-4">
                <Image
                  src={logo_registration}
                  alt="ClearMind Logo"
                  fluid
                  className="mb-4"
                  style={{ maxWidth: "200px", width: "100%" }}
                />
                <h3 className="form-title mb-4" style={{ fontSize: "24px" }}>
                  REGISTRATION
                </h3>
              </div>

              <Form onSubmit={handleSubmit} noValidate>
                {/* First Name */}
                <Form.Group className="mb-3">
                  <div className="input-icon-wrapper">
                    <FaUser className="input-icon-left" />
                    <Form.Control
                      type="text"
                      name="firstName"
                      placeholder="First Name *"
                      value={formData.firstName}
                      onChange={handleChange}
                      isInvalid={!!errors.firstName}
                      className="input-with-icon"
                      size="sm"
                      autoComplete="given-name"
                      disabled={isSubmitting}
                    />
                    {errors.firstName && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors.firstName}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Form.Group>

                {/* Last Name */}
                <Form.Group className="mb-3">
                  <div className="input-icon-wrapper">
                    <FaUser className="input-icon-left" />
                    <Form.Control
                      type="text"
                      name="lastName"
                      placeholder="Last Name *"
                      value={formData.lastName}
                      onChange={handleChange}
                      isInvalid={!!errors.lastName}
                      className="input-with-icon"
                      size="sm"
                      autoComplete="family-name"
                      disabled={isSubmitting}
                    />
                    {errors.lastName && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors.lastName}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Form.Group>

                {/* Date of Birth */}
                <Form.Group className="mb-3">
                  <div className="input-icon-wrapper">
                    <FaCalendarAlt className="input-icon-left" />
                    <Form.Control
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      isInvalid={!!errors.dob}
                      className="input-with-icon"
                      size="sm"
                      disabled={isSubmitting}
                    />
                    {errors.dob && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors.dob}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Form.Group>

                {/* Sex - RESPONSIVE DROPDOWN */}
                <Form.Group className="mb-3">
                  <div className="input-icon-wrapper">
                    <FaUser className="input-icon-left" />
                    <Form.Select
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      isInvalid={!!errors.sex}
                      className="input-with-icon"
                      size="sm"
                      disabled={isSubmitting}
                      aria-label="Select your sex/gender"
                    >
                      <option value="">Sex *</option>
                      {genderOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                    {errors.sex && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors.sex}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Form.Group>

                {/* Contact Number */}
                <Form.Group className="mb-3">
                  <div className="input-icon-wrapper">
                    <FaPhone className="input-icon-left" />
                    <Form.Control
                      type="tel"
                      name="contactNo"
                      placeholder="Contact No. *"
                      value={formData.contactNo}
                      onChange={handleChange}
                      isInvalid={!!errors.contactNo}
                      className="input-with-icon"
                      size="sm"
                      autoComplete="tel"
                      disabled={isSubmitting}
                    />
                    {errors.contactNo && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors.contactNo}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Form.Group>

                {/* Email */}
                <Form.Group className="mb-3">
                  <div className="input-icon-wrapper">
                    <FaEnvelope className="input-icon-left" />
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      className="input-with-icon"
                      size="sm"
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors.email}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-3">
                  <div className="input-icon-wrapper">
                    <FaLock className="input-icon-left" />
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password *"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      className="input-with-icon"
                      size="sm"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                    <span
                      onClick={togglePasswordVisibility}
                      className="input-icon-right"
                      style={{ cursor: "pointer" }}
                      role="button"
                      tabIndex="0"
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                    {errors.password && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors.password}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Form.Group>

                {/* Confirm Password */}
                <Form.Group className="mb-3">
                  <div className="input-icon-wrapper">
                    <FaLock className="input-icon-left" />
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password *"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!errors.confirmPassword}
                      className="input-with-icon"
                      size="sm"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                    <span
                      onClick={toggleConfirmPasswordVisibility}
                      className="input-icon-right"
                      style={{ cursor: "pointer" }}
                      role="button"
                      tabIndex="0"
                    >
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                    {errors.confirmPassword && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Form.Group>

                {/* Terms and Conditions */}
                <Form.Group className="mb-3 custom-checkbox">
                  <Form.Check
                    type="checkbox"
                    name="agreeTerms"
                    id="terms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    isInvalid={!!errors.agreeTerms}
                    label={
                      <>
                        I agree to the{" "}
                        <a href="#" onClick={(e) => e.preventDefault()} className="terms-link">
                          Terms and Conditions
                        </a>{" "}
                        <span className="text-danger">*</span>
                      </>
                    }
                    disabled={isSubmitting}
                  />
                  {errors.agreeTerms && (
                    <Form.Control.Feedback type="invalid" className="d-block">
                      {errors.agreeTerms}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                {/* Submit Button */}
                <Button
                  variant="none"
                  type="submit"
                  className="submit-btn w-100 mb-3 fw-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      REGISTERING...
                    </>
                  ) : (
                    "REGISTER"
                  )}
                </Button>

                {/* Login Link */}
                <p className="text-center m-0 small">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={handleLoginLink}
                    disabled={isSubmitting}
                  >
                    Log In
                  </button>
                </p>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Registration;