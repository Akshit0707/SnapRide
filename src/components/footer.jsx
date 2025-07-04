import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { IoLocationSharp } from "react-icons/io5";
import { BsTelephoneFill } from "react-icons/bs";
import { GrMail } from "react-icons/gr";

// --- FIX START: Corrected icon imports ---
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaTwitter } from "react-icons/fa"; // All from Font Awesome (fa)
// --- FIX END ---

import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Footer = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const uiColors = {
    footerBg: isDark ? "#121212" : "#2b3036",
    footerText: isDark ? "#B0B0B0" : "#E0E0E0",
    footerHeading: isDark ? "#E0E0E0" : "#FFFFFF",
    footerLink: isDark ? "#A0A0A0" : "#C0C0C0",
    footerLinkHover: isDark ? "#FFFFFF" : "#FE5B29",
    brandText: isDark ? "#FE5B29" : "#FE5B29",
    inputBg: isDark ? "#2A2A2A" : "#F8F8F8",
    inputColor: isDark ? "#E0E0E0" : "#333333",
    inputBorder: isDark ? "1px solid #444444" : "1px solid #D0D0D0",
    buttonBg: "#FE5B29",
    buttonHoverBg: "#cf4419",
    iconColor: isDark ? "#B0B0B0" : "#C0C0C0",
    iconHoverBg: "#FE5B29",
    iconHoverColor: "#FFFFFF",
    dividerColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    copyrightText: isDark ? "#707070" : "#888888",
    transition: 'all 0.3s ease-in-out',
  };

  return (
    <>
      {!location.pathname.includes("admin") && (
        <footer
          id="footer"
          className="py-5"
          style={{
            backgroundColor: uiColors.footerBg,
            color: uiColors.footerText,
            transition: uiColors.transition,
            borderTop: isDark ? '1px solid #333' : '1px solid #ddd',
          }}
        >
          <Container>
            <Row className="justify-content-center mb-5">
              <Col lg={8} className="text-center">
                <h1
                  className="fw-extrabold"
                  style={{
                    fontSize: '3.5rem',
                    color: uiColors.brandText,
                    fontFamily: '"Montserrat", sans-serif',
                    textShadow: isDark ? '0 0 10px rgba(254, 91, 41, 0.5)' : '2px 2px 5px rgba(0,0,0,0.2)',
                    transition: uiColors.transition,
                  }}
                >
                  Rent Amazing Vehicles
                </h1>
                <p className="fs-6" style={{ color: uiColors.footerText, transition: uiColors.transition }}>
                  Your journey, our priority. Experience seamless rentals.
                </p>
              </Col>
            </Row>

            <Row className="gy-4 mb-5">
              <Col md={6} lg={3}>
                <h4
                  className="fs-5 fw-bold mb-3"
                  style={{ color: uiColors.footerHeading, transition: uiColors.transition }}
                >
                  Subscribe Now
                </h4>
                <p className="fs-6 mb-3" style={{ color: uiColors.footerText, transition: uiColors.transition }}>
                  Stay updated with our latest offers and news directly to your inbox.
                </p>
                <Form>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="email"
                      placeholder="Enter Your Email"
                      size="lg"
                      style={{
                        backgroundColor: uiColors.inputBg,
                        color: uiColors.inputColor,
                        borderColor: uiColors.inputBorder,
                        borderRadius: '0.5rem',
                        padding: '0.75rem 1rem',
                        transition: uiColors.transition,
                      }}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    className="w-100 fw-bold py-2"
                    style={{
                      backgroundColor: uiColors.buttonBg,
                      borderColor: uiColors.buttonBg,
                      color: '#FFFFFF',
                      borderRadius: '0.5rem',
                      transition: uiColors.transition,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = uiColors.buttonHoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = uiColors.buttonBg}
                  >
                    Subscribe
                  </Button>
                </Form>
              </Col>

              <Col md={6} lg={3}>
                <h4
                  className="fs-5 fw-bold mb-3"
                  style={{ color: uiColors.footerHeading, transition: uiColors.transition }}
                >
                  Information
                </h4>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <Link to="/about" className="text-decoration-none"
                      style={{ color: uiColors.footerLink, transition: uiColors.transition }}
                      onMouseEnter={(e) => e.currentTarget.style.color = uiColors.footerLinkHover}
                      onMouseLeave={(e) => e.currentTarget.style.color = uiColors.footerLink}
                    >
                      About Us
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/services" className="text-decoration-none"
                      style={{ color: uiColors.footerLink, transition: uiColors.transition }}
                      onMouseEnter={(e) => e.currentTarget.style.color = uiColors.footerLinkHover}
                      onMouseLeave={(e) => e.currentTarget.style.color = uiColors.footerLink}
                    >
                      Our Services
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/vehicles" className="text-decoration-none"
                      style={{ color: uiColors.footerLink, transition: uiColors.transition }}
                      onMouseEnter={(e) => e.currentTarget.style.color = uiColors.footerLinkHover}
                      onMouseLeave={(e) => e.currentTarget.style.color = uiColors.footerLink}
                    >
                      Vehicle Fleet
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/client" className="text-decoration-none"
                      style={{ color: uiColors.footerLink, transition: uiColors.transition }}
                      onMouseEnter={(e) => e.currentTarget.style.color = uiColors.footerLinkHover}
                      onMouseLeave={(e) => e.currentTarget.style.color = uiColors.footerLink}
                    >
                      Client Testimonials
                    </Link>
                  </li>
                </ul>
              </Col>

              <Col md={6} lg={3}>
                <h4
                  className="fs-5 fw-bold mb-3"
                  style={{ color: uiColors.footerHeading, transition: uiColors.transition }}
                >
                  Helpful Links
                </h4>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <Link to="/faq" className="text-decoration-none"
                      style={{ color: uiColors.footerLink, transition: uiColors.transition }}
                      onMouseEnter={(e) => e.currentTarget.style.color = uiColors.footerLinkHover}
                      onMouseLeave={(e) => e.currentTarget.style.color = uiColors.footerLink}
                    >
                      FAQs
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/privacy-policy" className="text-decoration-none"
                      style={{ color: uiColors.footerLink, transition: uiColors.transition }}
                      onMouseEnter={(e) => e.currentTarget.style.color = uiColors.footerLinkHover}
                      onMouseLeave={(e) => e.currentTarget.style.color = uiColors.footerLink}
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/terms-conditions" className="text-decoration-none"
                      style={{ color: uiColors.footerLink, transition: uiColors.transition }}
                      onMouseEnter={(e) => e.currentTarget.style.color = uiColors.footerLinkHover}
                      onMouseLeave={(e) => e.currentTarget.style.color = uiColors.footerLink}
                    >
                      Terms & Conditions
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/careers" className="text-decoration-none"
                      style={{ color: uiColors.footerLink, transition: uiColors.transition }}
                      onMouseEnter={(e) => e.currentTarget.style.color = uiColors.footerLinkHover}
                      onMouseLeave={(e) => e.currentTarget.style.color = uiColors.footerLink}
                    >
                      Careers
                    </Link>
                  </li>
                </ul>
              </Col>

              <Col md={6} lg={3}>
                <h4
                  className="fs-5 fw-bold mb-3"
                  style={{ color: uiColors.footerHeading, transition: uiColors.transition }}
                >
                  Contact Us
                </h4>
                <div className="d-flex align-items-center mb-2">
                  <IoLocationSharp size="1.2em" style={{ color: uiColors.brandText, marginRight: '0.5rem', flexShrink: 0 }} />
                  <a
                    href="https://www.google.com/maps/search/New+Delhi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none"
                    style={{ color: uiColors.footerLink, transition: uiColors.transition }}
                    onMouseEnter={(e) => e.currentTarget.style.color = uiColors.footerLinkHover}
                    onMouseLeave={(e) => e.currentTarget.style.color = uiColors.footerLink}
                  >
                    New Delhi, India
                  </a>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <BsTelephoneFill size="1.1em" style={{ color: uiColors.brandText, marginRight: '0.5rem', flexShrink: 0 }} />
                  <a
                    href="tel:+918851131176"
                    className="text-decoration-none"
                    style={{ color: uiColors.footerLink, transition: uiColors.transition }}
                    onMouseEnter={(e) => e.currentTarget.style.color = uiColors.footerLinkHover}
                    onMouseLeave={(e) => e.currentTarget.style.color = uiColors.footerLink}
                  >
                    +91 8851131176
                  </a>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <GrMail size="1.2em" style={{ color: uiColors.brandText, marginRight: '0.5rem', flexShrink: 0 }} />
                  <a
                    href="mailto:snapride@rental.com"
                    className="text-decoration-none"
                    style={{ color: uiColors.footerLink, transition: uiColors.transition }}
                    onMouseEnter={(e) => e.currentTarget.style.color = uiColors.footerLinkHover}
                    onMouseLeave={(e) => e.currentTarget.style.color = uiColors.footerLink}
                  >
                    snapride@rental.com
                  </a>
                </div>

                <div className="mt-4 d-flex">
                  {[
                    { Icon: FaFacebookF, url: "https://facebook.com/yourcompany" },
                    { Icon: FaInstagram, url: "https://instagram.com/yourcompany" }, // Changed from AiFillInstagram
                    { Icon: FaTwitter, url: "https://twitter.com/yourcompany" },     // Changed from AiOutlineTwitter
                    { Icon: FaLinkedinIn, url: "https://linkedin.com/company/yourcompany" }, // Changed from BiLogoLinkedin
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex align-items-center justify-content-center me-3 rounded-circle"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${uiColors.iconColor}`,
                        color: uiColors.iconColor,
                        transition: uiColors.transition,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = uiColors.iconHoverBg;
                        e.currentTarget.style.borderColor = uiColors.iconHoverBg;
                        e.currentTarget.style.color = uiColors.iconHoverColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = uiColors.iconColor;
                        e.currentTarget.style.color = uiColors.iconColor;
                      }}
                    >
                      <social.Icon size="1.2em" />
                    </a>
                  ))}
                </div>
              </Col>
            </Row>

            <Row className="mt-4 pt-3 border-top" style={{ borderColor: uiColors.dividerColor }}>
              <Col className="text-center">
                <p className="fs-7 mb-0" style={{ color: uiColors.copyrightText, transition: uiColors.transition }}>
                  © {new Date().getFullYear()} SnapRide. All Rights Reserved. Developed & Designed by{" "}
                  <a
                    href="https://github.com/Akshit0707"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none fw-bold"
                    style={{ color: uiColors.brandText, transition: uiColors.transition }}
                    onMouseEnter={(e) => e.currentTarget.style.color = uiColors.footerLinkHover}
                    onMouseLeave={(e) => e.currentTarget.style.color = uiColors.brandText}
                  >
                    Akshit Arora
                  </a>
                </p>
              </Col>
            </Row>
          </Container>
        </footer>
      )}
    </>
  );
};
export default Footer;