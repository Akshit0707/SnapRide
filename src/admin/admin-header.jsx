import React from "react";
import {
  Navbar,
  Container,
  Row,
  Col,
  NavDropdown,
  Nav,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import useAuthentication from "../hooks/useAuthentication"; // Adjust path if necessary
import { Link, useLocation } from "react-router-dom";
import {
  FaUsers,
  FaMapMarkerAlt,
  FaClipboardList,
  FaUserCircle,
  FaCarSide, // FaCarSide is used only for the 'Vehicle' nav item now
} from "react-icons/fa";

const AdminHeader = () => {
  const user = useSelector(({ UserSlice }) => UserSlice.user);
  const { signOutCall } = useAuthentication();
  const location = useLocation();

  const handleLogout = async () => {
    await signOutCall();
  };

  const userName = user && user.name ? user.name : "Admin";
  const userEmail = user && user.email ? user.email : "";
  const userRole = user && user.role ? user.role : "admin";

  const isActive = (path) => {
    if (path.includes("vehicles")) {
      return location.pathname.startsWith("/admin/vehicles");
    }
    return location.pathname.includes(path);
  };

  return (
    <header className="admin-header">
      {/* Top header bar - Branding & User Profile */}
      <div className="admin-header-top">
        <Container fluid className="px-4">
          <Row className="align-items-center">
            {/* Admin Brand (will be visually centered using flexbox tricks on its Col) */}
            <Col xs={12} md={6} className="d-flex justify-content-center justify-content-md-start">
              <h3 className="admin-brand-title mb-0">
                SnapRide Admin Panel
              </h3>
            </Col>

            {/* User Profile Dropdown (aligned to end) */}
            <Col xs={12} md={6} className="d-flex justify-content-center justify-content-md-end mt-3 mt-md-0">
              <Nav className="admin-header-user-nav">
                <NavDropdown
                  align="end"
                  title={
                    <div className="d-flex align-items-center gap-2 text-white">
                      <FaUserCircle size={24} />
                      <span className="fw-semibold">{userName}</span>
                    </div>
                  }
                  id="admin-profile-dropdown"
                  className="admin-profile-dropdown"
                >
                  <NavDropdown.ItemText className="dropdown-item-text">
                    <strong>{userName}</strong>
                    <br />
                    <small>{userEmail}</small>
                    <br />
                    <small className="text-muted-role">Role: {userRole}</small>
                  </NavDropdown.ItemText>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Navigation bar - Main Menu */}
      <Navbar
        expand="lg"
        className="admin-navbar-bottom"
      >
        <Container fluid className="px-4">
          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                as={Link}
                to="users"
                className={`admin-nav-link ${isActive("users") ? "active" : ""}`}
              >
                <FaUsers className="me-2 admin-nav-icon" />
                Users
              </Nav.Link>

              <NavDropdown
                title={
                  // Corrected structure for dropdown arrow on the right
                  <span className="d-flex align-items-center">
                    <FaCarSide className="admin-nav-icon" /> {/* No me-2 here */}
                    <span className="ms-2">Vehicle</span> {/* Text with margin */}
                  </span>
                }
                id="admin-vehicle-dropdown"
                className={`admin-nav-link admin-nav-dropdown ${isActive("vehicles") ? "active" : ""}`}
              >
                <NavDropdown.Item as={Link} to="vehicles/brands">
                  Brands Management
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="vehicles/models">
                  Models Management
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="vehicles/cars">
                  Vehicle Management
                </NavDropdown.Item>
              </NavDropdown>

              <Nav.Link
                as={Link}
                to="locations"
                className={`admin-nav-link ${isActive("locations") ? "active" : ""}`}
              >
                <FaMapMarkerAlt className="me-2 admin-nav-icon" />
                Locations
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="contact-form"
                className={`admin-nav-link ${isActive("contact-form") ? "active" : ""}`}
              >
                <FaClipboardList className="me-2 admin-nav-icon" />
                Contact Forms
              </Nav.Link>
            </Nav>

            <Nav>
              <Nav.Link
                as={Link}
                to="rentals"
                className={`admin-nav-link ${isActive("rentals") ? "active" : ""}`}
              >
                <FaClipboardList className="me-2 admin-nav-icon" />
                User Rentals
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default AdminHeader;