import { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Image } from "react-bootstrap";
import logo_login from "./assets/CMPS_Logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";


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
    <Container fluid className="vh-100 d-flex justify-content-center align-items-center bg-transparent">
      <Card className="vw-100% card-custom d-flex justify-content-center align-items-center p-4 ">
        <Card.Body >
           <Container>
            <Row>
              <Col >
                <Image src={logo_login} fluid className="logo d-block mx-auto" />
              </Col>
              <span className="span-tagline text-center">Log in to continue your journey toward a clearer, healthier mind.</span>
            </Row>
          </Container>
          <Form>
            <Form.Group className="mb-2" controlId="email">
              <Form.Label className="login-text-field" >Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                size="sm"
                className="custom-field"
              />
            </Form.Group>
            
            {/* passoword */}
            <Form.Group className="mb-3" controlId="password" style={{ position: "relative" }}>
              <Form.Label className="login-text-field">Password <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                size="sm"
                className="custom-field"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  top: "74%",
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
            
            {/* terms check */}
            <Form.Group className="mb-3 custom-checkbox" controlId="termsCheck">
              <Form.Check 
                type="checkbox"
                label={<>I agree to the <a className="terms-condi" href="/terms">Terms & Conditions</a> <span className="text-danger">*</span></>}
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
                className="terms-check"
              />
            </Form.Group>

            <Button className="btn-login w-100">
              Login
            </Button>
            <p className="register-text text-center m-2" > Don’t have an account? <a className="register-link" href="/register">Register.</a>
            </p>
          </Form>
        </Card.Body>
      </Card>
   </Container>
  );
}

export default Login;
