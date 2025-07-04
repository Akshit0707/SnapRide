import React, { useState } from "react"; // Import useState
import { useNavigate, Link, NavLink, useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Nav,
  Navbar,
  Col,
  Button,
  Dropdown,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

// Icons
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import { LiaCarSideSolid, LiaHandsHelpingSolid } from "react-icons/lia";
import { FaUser, FaUserPlus } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";

import useAuthentication from "../hooks/useAuthentication";
import { isAdmin } from "../config/general";
import ThemeToggle from "./ThemeToogle";
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const location = useLocation();
  const user = useSelector(({ UserSlice }) => UserSlice.user);
  const { signOutCall } = useAuthentication();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State to manage hover for NavLinks (since inline styles don't support :hover)
  const [hoveredNav, setHoveredNav] = useState(null);
  // State for dropdown button hover
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  // State for login/signup/help buttons hover
  const [hoveredAuthLink, setHoveredAuthLink] = useState(null);


  const handleLogout = async () => {
    await signOutCall();
  };

  const handleHelpButtonClick = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Need Assistance?",
      text: "Our support team is available 24/7 to help you. Feel free to reach out!",
      icon: "question",
      confirmButtonText: "Got It",
      // Inline style for Swal popup for dark mode
      customClass: {
        popup: isDark ? 'swal2-dark-mode-popup' : '',
        title: isDark ? 'swal2-dark-mode-title' : '',
        htmlContainer: isDark ? 'swal2-dark-mode-text' : '',
        confirmButton: isDark ? 'swal2-dark-mode-confirm-button' : '',
      },
      // You'd typically need to inject these global styles for Swal to truly work via JS
      didOpen: (popup) => {
        if (isDark) {
            popup.style.backgroundColor = '#333';
            popup.style.color = '#eee';
            popup.querySelector('.swal2-title').style.color = '#ADD8E6';
            popup.querySelector('.swal2-html-container').style.color = '#ccc';
            popup.querySelector('.swal2-confirm').style.backgroundColor = '#20C997';
            popup.querySelector('.swal2-confirm').style.color = 'white';
            popup.querySelector('.swal2-confirm').style.border = 'none';
        }
      }
    });
  };

  // Define dynamic styles based on theme
  const headerStyles = {
    topBarBg: isDark ? '#1a1a1a' : '#EAF4FF',
    topBarText: isDark ? '#B0B0B0' : '#495057',
    topBarLinkHoverColor: isDark ? '#20C997' : '#0056b3',

    navbarBg: isDark ? '#121212' : '#FFFFFF',
    navbarBorderBottom: isDark ? '1px solid #333' : '1px solid #EEEEEE',
    brandColor: isDark ? '#20C997' : '#007bff',
    navLinkColor: isDark ? '#D0D0D0' : '#555555',
    navLinkHoverColor: isDark ? '#20C997' : '#007bff',
    navLinkActiveBg: isDark ? 'rgba(32, 201, 151, 0.1)' : 'rgba(0, 123, 255, 0.08)',
    navLinkPadding: '0.75rem 1rem',

    dropdownToggleBg: isDark ? '#2C2C2C' : '#F0F0F0',
    dropdownToggleBorder: isDark ? '#444444' : '#DDDDDD',
    dropdownToggleColor: isDark ? '#E0E0E0' : '#333333',
    dropdownMenuBg: isDark ? '#222222' : '#FFFFFF',
    dropdownItemColor: isDark ? '#E0E0E0' : '#333333',
    dropdownItemHoverBg: isDark ? '#20C997' : '#EAF4FF',
    dropdownItemHoverColor: isDark ? '#FFFFFF' : '#007bff',
    dropdownHeaderColor: isDark ? '#BBBBBB' : '#6C757D',

    adminBadgeBg: isDark ? '#20C997' : '#FFC107',
    adminBadgeColor: isDark ? '#FFFFFF' : '#212529',
    adminBadgeBorder: isDark ? '1px solid #1AA07B' : '1px solid #e0a800',

    // Transition variable for consistency
    transition: 'all 0.3s ease-in-out',
  };


  return (
    <>
      {!location.pathname.includes("admin") && (
        <header id="header">
          {/* Top Contact Info Bar */}
          <Container fluid
            className="d-none d-md-block py-2"
            style={{
              backgroundColor: headerStyles.topBarBg,
              color: headerStyles.topBarText,
              fontSize: '0.875rem',
              transition: headerStyles.transition,
            }}
          >
            <Row className="justify-content-center">
              <Col xs={12} md={8} lg={6}>
                <Row className="align-items-center justify-content-around text-center">
                  <Col>
                    <a
                      href="https://www.google.com/maps/place/New+Delhi"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: headerStyles.topBarText,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: headerStyles.transition,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = headerStyles.topBarLinkHoverColor}
                      onMouseLeave={(e) => e.currentTarget.style.color = headerStyles.topBarText}
                    >
                      <FiMapPin className="me-2" />
                      New Delhi, India
                    </a>
                  </Col>
                  <Col className="d-none d-lg-block">
                    <a href="tel:+918851131176"
                      style={{
                        color: headerStyles.topBarText,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: headerStyles.transition,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = headerStyles.topBarLinkHoverColor}
                      onMouseLeave={(e) => e.currentTarget.style.color = headerStyles.topBarText}
                    >
                      <FiPhone className="me-2" />
                      +91 8851131176
                    </a>
                  </Col>
                  <Col>
                    <a
                      href="mailto:snapride@rental.com"
                      style={{
                        color: headerStyles.topBarText,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: headerStyles.transition,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = headerStyles.topBarLinkHoverColor}
                      onMouseLeave={(e) => e.currentTarget.style.color = headerStyles.topBarText}
                    >
                      <FiMail className="me-2" />
                      snapride@rental.com
                    </a>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>

          {/* Main Navigation Bar */}
          <Navbar
            expand="lg"
            className="py-3" // Remove Bootstrap shadow class
            style={{
              backgroundColor: headerStyles.navbarBg,
              borderBottom: headerStyles.navbarBorderBottom,
              transition: headerStyles.transition,
              boxShadow: isDark ? '0 5px 20px rgba(0,0,0,0.4)' : '0 5px 20px rgba(0,0,0,0.1)',
            }}
          >
            <Container fluid className="px-4">
              <Navbar.Brand as={Link} to="/" className="fw-bold fs-3"
                style={{
                  color: headerStyles.brandColor,
                  transition: headerStyles.transition,
                  letterSpacing: '-0.5px',
                  textShadow: isDark ? '0 0 10px rgba(32, 201, 151, 0.4)' : '0 0 5px rgba(0, 123, 255, 0.2)',
                }}
              >
                SnapRide
              </Navbar.Brand>

              <Navbar.Toggle aria-controls="basic-navbar-nav" >
                {/* Custom toggler icon to handle dark mode visibility */}
                <span className="navbar-toggler-icon" style={{filter: isDark ? 'invert(1)' : 'none'}}></span>
              </Navbar.Toggle>

              <Navbar.Collapse id="basic-navbar-nav">
                {/* Left-side navigation */}
                <Nav className="ms-auto me-auto gap-1 gap-lg-3 flex-column flex-lg-row align-items-stretch align-items-lg-center">
                  {[
                    { path: "/", name: "Home" },
                    { path: "/about", name: "About" },
                    { path: "/vehicles", name: "Vehicles" },
                    { path: "/my-rentals", name: "My Rentals" },
                    { path: "/contact", name: "Contact" },
                  ].map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className="text-decoration-none py-2 px-3 text-center text-lg-start" // Remove rounded-pill here, apply via style
                      style={({ isActive }) => ({
                        color: (isActive || hoveredNav === item.path) ? headerStyles.navLinkHoverColor : headerStyles.navLinkColor,
                        transition: headerStyles.transition,
                        fontSize: '1.0rem',
                        fontWeight: 500,
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '50px', // Apply border-radius here
                        backgroundColor: isActive ? headerStyles.navLinkActiveBg : 'transparent',
                        // Underline effect
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '0',
                            left: '50%',
                            transform: `translateX(-50%) scaleX(${isActive || hoveredNav === item.path ? 1 : 0})`,
                            height: '2px',
                            width: 'calc(100% - 1.5rem)',
                            backgroundColor: headerStyles.navLinkHoverColor,
                            transition: 'transform 0.3s ease',
                            opacity: '0.8',
                        }
                      })}
                      onMouseEnter={() => setHoveredNav(item.path)}
                      onMouseLeave={() => setHoveredNav(null)}
                    >
                      {item.name}
                      {/* Manual underline for hover/active state */}
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '50%',
                          transform: `translateX(-50%) scaleX(${hoveredNav === item.path || location.pathname === item.path ? 1 : 0})`,
                          height: '2px',
                          width: 'calc(100% - 1.5rem)',
                          backgroundColor: headerStyles.navLinkHoverColor,
                          transition: 'transform 0.3s ease',
                          opacity: '0.8',
                        }}
                      ></span>
                    </NavLink>
                  ))}
                </Nav>

                {/* Right-side controls */}
                <Nav className="align-items-center gap-3 mt-3 mt-lg-0 flex-column flex-lg-row">
                  {user && user.email ? (
                    <>
                      {/* Help Button */}
                      <Button
                        variant="link"
                        onClick={handleHelpButtonClick}
                        style={{
                          textDecoration: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '50px', // rounded-pill style
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: hoveredAuthLink === 'help' ? headerStyles.navLinkHoverColor : headerStyles.navLinkColor,
                          backgroundColor: hoveredAuthLink === 'help' ? headerStyles.navLinkActiveBg : 'transparent',
                          border: 'none',
                          fontSize: '1.0rem',
                          fontWeight: 500,
                          transition: headerStyles.transition,
                        }}
                        onMouseEnter={() => setHoveredAuthLink('help')}
                        onMouseLeave={() => setHoveredAuthLink(null)}
                      >
                        Help <LiaHandsHelpingSolid className="ms-2" size={18} />
                      </Button>

                      {/* Admin Panel Badge */}
                      {isAdmin(user.role) && (
                        <NavLink
                          to="/admin"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '50px', // rounded-pill style
                            fontWeight: 600,
                            backgroundColor: headerStyles.adminBadgeBg,
                            color: headerStyles.adminBadgeColor,
                            fontSize: "0.85rem",
                            border: headerStyles.adminBadgeBorder,
                            transition: headerStyles.transition,
                            textDecoration: 'none',
                            boxShadow: isDark ? '0 4px 15px rgba(32, 201, 151, 0.2)' : '0 4px 15px rgba(255, 193, 7, 0.2)', // Initial shadow
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.filter = 'brightness(1.1)';
                            e.currentTarget.style.boxShadow = isDark ? '0 4px 15px rgba(32, 201, 151, 0.4)' : '0 4px 15px rgba(255, 193, 7, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.filter = 'none';
                            e.currentTarget.style.boxShadow = isDark ? '0 4px 15px rgba(32, 201, 151, 0.2)' : '0 4px 15px rgba(255, 193, 7, 0.2)';
                          }}
                        >
                          <MdAdminPanelSettings className="me-2" size={18} />
                          Admin Panel
                        </NavLink>
                      )}

                      {/* Profile Dropdown */}
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          as={Button} // Use Button as a toggle to allow hover events
                          variant="link"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            backgroundColor: isDropdownHovered ? headerStyles.navLinkActiveBg : headerStyles.dropdownToggleBg,
                            border: `1px solid ${isDropdownHovered ? headerStyles.navLinkHoverColor : headerStyles.dropdownToggleBorder}`,
                            color: isDropdownHovered ? headerStyles.navLinkHoverColor : headerStyles.dropdownToggleColor,
                            transition: headerStyles.transition,
                            fontSize: '1.0rem',
                            fontWeight: 500,
                          }}
                          onMouseEnter={() => setIsDropdownHovered(true)}
                          onMouseLeave={() => setIsDropdownHovered(false)}
                        >
                          <FaUser size={16} />
                          <span className="d-none d-lg-block">{user.name || user.email.split("@")[0]}</span>
                          
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          className="shadow-lg rounded-3"
                          style={{
                            backgroundColor: headerStyles.dropdownMenuBg,
                            border: `1px solid ${headerStyles.dropdownToggleBorder}`,
                            transition: headerStyles.transition,
                          }}
                        >
                          <Dropdown.Header style={{ color: headerStyles.dropdownHeaderColor }}>
                            <strong>{user.name || "Guest"}</strong><br />
                            <small>{user.email}</small>
                          </Dropdown.Header>

                          

                          <Dropdown.Item as={Link} to="/my-rentals"
                            style={{
                              color: headerStyles.dropdownItemColor,
                              transition: headerStyles.transition,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = headerStyles.dropdownItemHoverBg;
                                e.currentTarget.style.color = headerStyles.dropdownItemHoverColor;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = headerStyles.dropdownItemColor;
                            }}
                          >
                            My Rentals <LiaCarSideSolid className="ms-1 mb-1" />
                          </Dropdown.Item>
                          <Dropdown.Divider style={{ borderColor: headerStyles.dropdownToggleBorder }} />
                          <Dropdown.Item onClick={handleLogout}
                            style={{
                              color: isDark ? '#FF6B6B' : '#DC3545',
                              transition: headerStyles.transition,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? '#3D0000' : '#FFDDDD';
                                e.currentTarget.style.color = isDark ? '#FFDDDD' : '#DC3545';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = isDark ? '#FF6B6B' : '#DC3545';
                            }}
                          >
                            Logout
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </>
                  ) : (
                    <>
                      <Button
                        as={Link} to="/login"
                        variant="link"
                        style={{
                            textDecoration: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: hoveredAuthLink === 'login' ? headerStyles.navLinkHoverColor : headerStyles.navLinkColor,
                            backgroundColor: hoveredAuthLink === 'login' ? headerStyles.navLinkActiveBg : 'transparent',
                            border: 'none',
                            fontSize: '1.0rem',
                            fontWeight: 500,
                            transition: headerStyles.transition,
                        }}
                        onMouseEnter={() => setHoveredAuthLink('login')}
                        onMouseLeave={() => setHoveredAuthLink(null)}
                      >
                        Login <FaUser className="ms-2" size={16} />
                      </Button>
                      <Button
                        as={Link} to="/sign-up"
                        style={{
                          padding: '0.6rem 1.5rem',
                          borderRadius: '50px',
                          fontWeight: 600,
                          backgroundColor: headerStyles.brandColor,
                          borderColor: headerStyles.brandColor,
                          color: 'white',
                          transition: headerStyles.transition,
                          fontSize: '1.0rem',
                          // Custom hover
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? '#1AA07B' : '#0056b3';
                            e.currentTarget.style.borderColor = isDark ? '#1AA07B' : '#0056b3';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = headerStyles.brandColor;
                            e.currentTarget.style.borderColor = headerStyles.brandColor;
                        }}
                      >
                        Sign Up <FaUserPlus className="ms-2" size={16} />
                      </Button>
                      <Button
                        variant="link"
                        onClick={handleHelpButtonClick}
                        style={{
                          textDecoration: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '50px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: hoveredAuthLink === 'help2' ? headerStyles.navLinkHoverColor : headerStyles.navLinkColor, // Different key if multiple help buttons
                          backgroundColor: hoveredAuthLink === 'help2' ? headerStyles.navLinkActiveBg : 'transparent',
                          border: 'none',
                          fontSize: '1.0rem',
                          fontWeight: 500,
                          transition: headerStyles.transition,
                        }}
                        onMouseEnter={() => setHoveredAuthLink('help2')}
                        onMouseLeave={() => setHoveredAuthLink(null)}
                      >
                        Help <LiaHandsHelpingSolid className="ms-2" size={18} />
                      </Button>
                    </>
                  )}
                  <ThemeToggle />
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
      )}
    </>
  );
};

export default Header;