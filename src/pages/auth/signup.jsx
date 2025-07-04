import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import {
  FaEnvelope,
  FaLock,
  FaUserCircle,
  FaCalendarAlt, // For Age
  FaMobileAlt, // For Mobile
  FaHome, // For Address
  FaUserPlus, // For Signup Button
  FaUserCog, // For Role select
} from "react-icons/fa"; // Added icons

import useAuthentication from "../../hooks/useAuthentication";

const Signup = () => {
  const navigate = useNavigate();
  const { isLoading, message, signUpCall } = useAuthentication();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    const signupPayload = {
      email,
      password,
      role,
    };

    // Include additional user fields only for 'user' role
    if (role === "user") {
      signupPayload.name = name;
      signupPayload.age = age;
      signupPayload.mobile = mobile;
      signupPayload.address = address;
    }

    const result = await signUpCall(signupPayload);
    if (result && result.success) {
      navigate("/login");
    }
  };

  return (
    <div className="signup-page-wrapper">
      <Container className="signup-container">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={7} xl={6}>
            <div className="signup-card">
              <h1 className="signup-title">Create Your Account</h1>
              <p className="signup-subtitle">Join SnapRide today!</p>

              {message && (
                <Alert variant={message.isError ? "danger" : "success"} className="mb-4">
                  {message.content}
                </Alert>
              )}

              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3 text-white-50">Creating account...</p>
                </div>
              ) : (
                <Form onSubmit={handleSignup}>
                  {/* Role Selection */}
                  <Form.Group className="mb-3" controlId="formRole">
                    <Form.Label className="form-label-custom">
                      <FaUserCog className="me-2" /> Sign up as
                    </Form.Label>
                    <Form.Select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      className="form-control-custom" // Apply custom styling to select
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Conditional User Fields */}
                  {role === "user" && (
                    <>
                      <Form.Group className="mb-3" controlId="formName">
                        <Form.Label className="form-label-custom">
                          <FaUserCircle className="me-2" /> Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="form-control-custom"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formAge">
                        <Form.Label className="form-label-custom">
                          <FaCalendarAlt className="me-2" /> Age
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Your age"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          required
                          className="form-control-custom"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formMobile">
                        <Form.Label className="form-label-custom">
                          <FaMobileAlt className="me-2" /> Mobile Number
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Your mobile number"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          required
                          className="form-control-custom"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4" controlId="formAddress">
                        <Form.Label className="form-label-custom">
                          <FaHome className="me-2" /> Address
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Your address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                          className="form-control-custom"
                        />
                      </Form.Group>
                    </>
                  )}

                  {/* Email */}
                  <Form.Group className="mb-3" controlId="formEmail">
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

                  {/* Password */}
                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="form-label-custom">
                      <FaLock className="me-2" /> Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="form-control-custom"
                    />
                  </Form.Group>

                  {/* Submit Button */}
                  <Button
                    variant="primary"
                    type="submit"
                    className="signup-submit-button w-100 py-2 fw-bold"
                  >
                    <FaUserPlus className="me-2" /> Sign Up
                  </Button>
                </Form>
              )}

              <p className="text-center mt-4 text-white-50">
                Already have an account?{" "}
                <NavLink to="/login" className="login-link">
                  Sign In
                </NavLink>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Signup;