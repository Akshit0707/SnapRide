import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import AboutImage from "../assets/images/about-image.png";

const AboutSection = () => {
  return (
    <div id="about-section">
      <Container>
        <Row className="mt-1 mb-2">
          <Col
            xs={{ span: 12, order: "last" }}
            md={{ span: 6, order: "first" }}
          >
            <div className="image_iman">
              <img src={AboutImage} className="about_img" />
            </div>
          </Col>
          <Col
            xs={{ span: 12, order: "first" }}
            md={{ span: 6, order: "last" }}
          >
            <div className="mt-2 mb-5">
              <h1 className="text-uppercase fs-1 fw-600">
                About <span className="primary-color">Us</span>
              </h1>
              <p className="about-text fs-5 m-0">
                Welcome to our Car/Bike Rentals Application, designed for easy
                booking and seamless browsing on any device. Our user-friendly
                interface allows you to effortlessly find and reserve vehicles,
                specify rental durations, and complete transactions securely
                with multiple payment options. Access your booking history
                anytime to review past rentals and enjoy dedicated customer
                support for any assistance you may need.
              </p>
              <div className="mt-3">
                <a href="#" className="readmore-btn fs-5 px-3 py-2">
                  Read More
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
export default AboutSection;
