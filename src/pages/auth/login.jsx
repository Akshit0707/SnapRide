import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa"; // Using FaEnvelope for email
import useAuthentication from "../../hooks/useAuthentication";

const Login = () => {
  const navigate = useNavigate();
  const { isLoading, message, signInCall } = useAuthentication();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInCall({ email, password });

      // Redirect on successful login
      if ((result && result.success) || (message && !message.isError)) {
        navigate("/"); // Change to dashboard/home route as needed
      }
    } catch (error) {
      console.error("Login error:", error);
      // The useAuthentication hook should ideally set 'message' here too
    }
  };

  return (
    <div className="login-page-wrapper">
      <Container className="login-container">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} xl={5}>
            <div className="login-card">
              <h1 className="login-title">Welcome Back!</h1>
              <p className="login-subtitle">Sign in to your SnapRide account</p>

              {message && (
                <Alert variant={message.isError ? "danger" : "success"} className="mb-4">
                  {message.content}
                </Alert>
              )}

              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-white-50">Logging in...</p>
                </div>
              ) : (
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className="form-label-custom">
                      <FaEnvelope className="me-2" /> Email address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-control-custom"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formBasicPassword">
                    <Form.Label className="form-label-custom">
                      <FaLock className="me-2" /> Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="form-control-custom"
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="login-submit-button w-100 py-2 fw-bold"
                  >
                    <FaSignInAlt className="me-2" /> Login
                  </Button>
                </Form>
              )}

              <p className="text-center mt-4 text-white-50">
                Don't have an account?{" "}
                <NavLink to="/sign-up" className="signup-link">
                  Sign Up
                </NavLink>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;