import { useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Image,
} from "react-bootstrap";
import logo_login from "./assets/CMPS_Logo.png";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const showError = (message) => {
    setError(message);
    setTimeout(() => {
      setError("");
    }, 1500);
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

    try {
      const response = await axios.post(
        "http://localhost/ClearMind/clearmind-backend/login.php",
        { email, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data;

      if (data.success) {
        toast.success(`Login Successful !`, {
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
        setTimeout(() => {
          switch (data.role) {
            case "Admin":
              navigate("/admin-dashboard");
              break;
            case "Doctor":
              navigate("/doctor-dashboard");
              break;
            case "Client":
              navigate("/client-dashboard");
              break;
            default:
              navigate("/");
          }
        }, 1500);
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (error) {
      if (error.response) {
        showError(error.response.data?.message || "Login failed.");
      } else {
        showError("Server error. Please try again later.");
      }
    }
  };

  return (
    <Container
      fluid
      className="vh-100 d-flex justify-content-center align-items-center bg-transparent"
    >
      <Card className="vw-100% card-custom d-flex justify-content-center align-items-center px-4 ">
        <Card.Body>
          <Container>
            <Row>
              <Col>
                <Image
                  src={logo_login}
                  fluid
                  className="logo d-block mx-auto"
                />
              </Col>
              <span className="span-tagline text-center">
                Log in to continue your journey toward a clearer, healthier
                mind.
              </span>
            </Row>
          </Container>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-2" controlId="email">
              <Form.Label className="login-text">
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
                  required
                  size="sm"
                  className="custom-field input-with-icon"
                />
              </div>
            </Form.Group>

            {/* passoword */}
            <Form.Group
              className="mb-2"
              controlId="password"
              style={{ position: "relative" }}
            >
              <Form.Label className="login-text">
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
                  required
                  size="sm"
                  className="custom-field input-with-icon"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-icon-right"
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
            </Form.Group>

            {/* terms check */}
            <Form.Group className="mb-3 custom-checkbox" controlId="termsCheck">
              <Form.Check
                type="checkbox"
                label={
                  <>
                    I agree to the{" "}
                    <a className="terms-condi" href="/terms">
                      Terms & Conditions
                    </a>{" "}
                    <span className="text-danger">*</span>
                  </>
                }
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
                className="terms-check"
              />
            </Form.Group>
            {error && (
              <Row className="mb-2">
                {" "}
                <Col>
                  {" "}
                  <small className="text-danger d-block text-center">
                    {" "}
                    {error}{" "}
                  </small>{" "}
                </Col>{" "}
              </Row>
            )}

            <Button type="submit" variant="none" className="btn-login w-100">
              <b>LOG IN</b>
            </Button>
            <p className="register-text text-center m-2">
              {" "}
              Don’t have an account?{" "}
              <a className="register-link" href="/register">
                Register.
              </a>
            </p>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
