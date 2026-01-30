import { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Image } from "react-bootstrap";
import logo_login from "./assets/CMPS_Logo.png";
import { FaEye, FaEyeSlash, FaLock} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
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
    <Container fluid className="login-container bg-transparent">
      <Row className="justify-content-center align-items-center min-vh-100 g-0 mx-0">
        <Col xs={11} sm={10} md={7} lg={5} xl={4} xxl={3} className="login-col">
          <Card className="card-custom">
            <Card.Body className="card-body-responsive">
              <Row className="g-0">
                <Col xs={12} className="text-center logo-section">
                  <Image 
                    src={logo_login} 
                    fluid 
                    className="logo-img d-block mx-auto" 
                  />
                </Col>
                <Col xs={12} className="text-center">
                  <p className="tagline-text">
                    Log in to continue your journey toward a clearer, healthier mind.
                  </p>
                </Col>
              </Row>
              <Form onSubmit={handleLogin} className="login-form">
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label className="form-label-custom">
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="input-icon-wrapper">
                    <MdEmail className="input-icon-left"/>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="input-field"
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label className="form-label-custom">
                    Password <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="input-icon-wrapper">
                    <FaLock className="input-icon-left"/>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="input-field"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="input-icon-right"
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && setShowPassword(!showPassword)}
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
                        I agree to the{' '}
                        <a className="terms-link" href="/terms">
                          Terms & Conditions
                        </a>{' '}
                        <span className="text-danger">*</span>
                      </>
                    }
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    required
                    className="terms-checkbox"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit"
                  className="login-button w-100"
                >
                  LOG IN
                </Button>
                
                <p className="register-text text-center mb-0">
                  Don't have an account?{' '}
                  <a className="register-link" href="/register">
                    Register.
                  </a>
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