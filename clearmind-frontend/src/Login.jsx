import { useState } from "react";
import { Container, Row, Col, Form, Button, Image } from "react-bootstrap";
import logo_login from "./assets/CMPS_Logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <Container fluid className="vh-100 d-flex justify-content-center align-items-center">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <div className="card p-4 rounded-5" style={{ border: "3px solid #A276D0", borderRadius: "2rem" }}>
            {/* logo */}
            <div className="text-center mb-4">
              <Image src={logo_login} alt="Logo" fluid style={{ maxWidth: "100%", height: "auto" }} />
            </div>
            {/* header login */}
            <h2 className="text-center mb-2" style={{color: "#542982" }}>LOG IN</h2>
            <p className="text-center mb-4" style={{color: "#542982" }}>
              Log in to continue your journey toward a clearer, healthier mind.
            </p>

            <Form onSubmit={handleLogin}>
              {/* Email */}
              <Form.Group className="mb-3" controlId="email">
                <Form.Label className="fs-5" style={{color: "#542982" }}>Email <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  size="md"
                  style={{ border: "2px solid #542982" }} 
                />
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-3" controlId="password" style={{ position: "relative" }}>
                <Form.Label style={{ fontSize: "25px", color: "#542982" }}>Password <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  size="lg"
                  style={{ border: "2px solid #542982" }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    top: "70%",
                    right: "15px",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    userSelect: "none",
                    fontSize: "1.2rem"
                  }}
                >
                   {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </Form.Group>

              <Form.Group className="mb-3 custom-checkbox" controlId="termsCheck">
                <Form.Check 
                  type="checkbox"
                  label={<>I agree to the <a href="/terms"  style={{ color: "#542982"}}>Terms & Conditions</a> <span className="text-danger">*</span></>}
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required
                  
                />
              </Form.Group>

              {/* Login button */}
              <Button type="submit" variant="primary" size="lg" className="w-100 rounded-4" style={{ backgroundColor: "#542982", border:"none"}}>
                LOG IN
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
