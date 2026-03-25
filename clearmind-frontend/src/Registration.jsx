import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Form, Button, Image } from "react-bootstrap";
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
import axios from "axios";
import toast from "react-hot-toast";

function Registration() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    sex: "",
    middleInitial: "",
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

  // Frontend validation (keep as-is for instant feedback)
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.middleInitial.trim())
      newErrors.middleInitial = "Middle Initials is Required";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleInitial: formData.middleInitial,
          address: formData.address,
          dob: formData.dob,
          sex: formData.sex,
          contactNo: formData.contactNo,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      const data = response.data;

      if (data.success) {
        // Save token and user info to localStorage
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("role", data.data.user.role);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        toast.success("Registration Successful!", {
          duration: 1500,
          style: {
            background: "#E2F7E3",
            border: "1px solid #91C793",
            color: "#2E7D32",
            fontWeight: 600,
            fontSize: "0.95rem",
            textAlign: "center",
            maxWidth: "320px",
            borderRadius: "10px",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
          },
          iconTheme: {
            primary: "#2E7D32",
            secondary: "#E2F7E3",
          },
        });

        // All self-registered users are Clients
        setTimeout(() => navigate("/client/home"), 1500);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 422) {
          // Map Laravel validation errors back to form fields
          const laravelErrors = err.response.data.errors || {};
          const mapped = {};

          if (laravelErrors.firstName)
            mapped.firstName = laravelErrors.firstName[0];
          if (laravelErrors.lastName)
            mapped.lastName = laravelErrors.lastName[0];
          if (laravelErrors.dob) mapped.dob = laravelErrors.dob[0];
          if (laravelErrors.sex) mapped.sex = laravelErrors.sex[0];
          if (laravelErrors.contactNo)
            mapped.contactNo = laravelErrors.contactNo[0];
          if (laravelErrors.email) mapped.email = laravelErrors.email[0];
          if (laravelErrors.password)
            mapped.password = laravelErrors.password[0];

          setErrors(mapped);
        } else {
          toast.error(err.response.data?.message || "Registration failed.");
        }
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
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
        {/* Left Panel */}
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

        {/* Right Panel */}
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
              <div className="text-center mb-4">
                <Image
                  src={logo_registration}
                  alt="ClearMind Logo"
                  fluid
                  className="mb-4"
                  style={{ maxWidth: "200px" }}
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
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
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
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                {/* Middle Initial */}
                <Form.Group className="mb-3">
                  <div className="input-icon-wrapper">
                    <FaUser className="input-icon-left" />
                    <Form.Control
                      type="text"
                      name="middleInitial"
                      placeholder="Middle Initial"
                      value={formData.middleInitial}
                      onChange={handleChange}
                      isInvalid={!!errors.middleInitial}
                      className="input-with-icon"
                      size="sm"
                      maxLength={1}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.middleInitial}
                    </Form.Control.Feedback>
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
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.dob}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                {/* Sex */}
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
                    >
                      <option value="">Sex *</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.sex}
                    </Form.Control.Feedback>
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
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.contactNo}
                    </Form.Control.Feedback>
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
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
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
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="input-icon-right"
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
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
                    />
                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="input-icon-right"
                    >
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
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
                        <a href="#" className="terms-link">
                          Terms and Conditions
                        </a>{" "}
                        <span className="text-danger">*</span>
                      </>
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.agreeTerms}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Submit Button */}
                <Button
                  variant="none"
                  type="submit"
                  className="submit-btn w-100 mb-3 fw-bold"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "REGISTER"}
                </Button>

                {/* Login Link */}
                <p className="text-center m-0 small">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => navigate("/login")}
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
