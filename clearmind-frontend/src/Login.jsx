import { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Image } from "react-bootstrap";
import logo_login from "./assets/CMPS_Logo.png";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Login() {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed,       setAgreed]       = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const navigate = useNavigate();

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      showError("Please enter both email and password");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Please enter a valid email address");
      return;
    }
    if (!agreed) {
      showError("You must agree to the Terms & Conditions");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept":       "application/json",
          },
        }
      );

      // ── Your Laravel returns: ──────────────────────────────────────
      // { success: true, data: { token, role, user } }
      const { success, data } = response.data;

      if (success && data?.token) {
        const { token, role, user } = data;

        // Store auth keys
        localStorage.setItem("token", token);
        localStorage.setItem("role",  role);

        // Store full user object so profile fields survive logout/login
        localStorage.setItem("user", JSON.stringify(user));

        // Store profile image URL from backend (real URL, not base64)
        if (user?.profilePictureUrl) {
          localStorage.setItem("profile_image", user.profilePictureUrl);
        } else {
          localStorage.removeItem("profile_image");
        }

        // Tell sidebar to refresh immediately
        window.dispatchEvent(new Event("profileUpdated"));

        toast.success("Login Successful!", {
          duration: 1500,
          style: {
            background:   "#E2F7E3",
            border:       "1px solid #91C793",
            color:        "#2E7D32",
            fontWeight:   600,
            fontSize:     "0.95rem",
            textAlign:    "center",
            maxWidth:     "320px",
            borderRadius: "10px",
            boxShadow:    "0 3px 10px rgba(0, 0, 0, 0.15)",
          },
          iconTheme: { primary: "#2E7D32", secondary: "#E2F7E3" },
        });

        setTimeout(() => {
          switch (role) {
            case "Admin":  navigate("/admin/dashboard");  break;
            case "Doctor": navigate("/doctor/dashboard"); break;
            case "Client": navigate("/client/home");      break;
            default:       navigate("/");
          }
        }, 1500);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 422) {
          const firstError = Object.values(err.response.data.errors)?.[0]?.[0];
          showError(firstError || "Validation failed.");
        } else {
          showError(err.response.data?.message || "Login failed.");
        }
      } else {
        showError("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="login-container bg-transparent">
      <Row className="justify-content-center align-items-center min-vh-100 g-0 mx-0">
        <Col xs={11} sm={10} md={7} lg={5} xl={4} xxl={3} className="login-col">
          <Card className="card-custom">
            <Card.Body className="card-body-responsive">
              <Row className="g-0">
                <Col xs={12} className="text-center logo-section">
                  <Image src={logo_login} fluid className="logo-img d-block mx-auto" />
                </Col>
                <Col xs={12} className="text-center">
                  <p className="tagline-text">
                    Log in to continue your journey toward a clearer, healthier mind.
                  </p>
                </Col>
              </Row>

              <Form onSubmit={handleLogin} className="login-form" noValidate>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label className="form-label-custom">
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="input-icon-wrapper">
                    <MdEmail className="input-icon-left" />
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="input-field"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label className="form-label-custom">
                    Password <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="input-icon-wrapper">
                    <FaLock className="input-icon-left" />
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="input-field"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="input-icon-right"
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === "Enter" && setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3" controlId="termsCheck">
                  <Form.Check
                    type="checkbox"
                    label={
                      <>
                        I agree to the{" "}
                        <a className="terms-link" href="/terms">Terms & Conditions</a>{" "}
                        <span className="text-danger">*</span>
                      </>
                    }
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="terms-checkbox"
                  />
                </Form.Group>

                {error && (
                  <Row className="mb-2">
                    <Col>
                      <small className="text-danger d-block text-center">{error}</small>
                    </Col>
                  </Row>
                )}

                <Button
                  variant="primary"
                  type="submit"
                  className="login-button w-100"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "LOG IN"}
                </Button>

                <p className="register-text text-center mb-0">
                  Don't have an account?{" "}
                  <a className="register-link" href="/register">Register.</a>
                </p>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;