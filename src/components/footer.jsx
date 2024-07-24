import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { IoLocation } from "react-icons/io5";
import { BsTelephoneFill } from "react-icons/bs";
import { GrMail } from "react-icons/gr";
import { BiLogoFacebook, BiLogoLinkedin } from "react-icons/bi";
import { AiFillInstagram, AiOutlineTwitter } from "react-icons/ai";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  return (
    <>
      {!location.pathname.includes("admin") && (
        <footer id="footer" className="secondary-bg-color">
          <Container className="pt-3 pb-2">
            <Row>
              <Col>
                <h1 className="fs-1 text-center quinary-color">
                  Rent a Vehicles
                </h1>
              </Col>
            </Row>
            <Row>
              <Col>
                <Row>
                  <Col>
                    <h4 className="fs-4 text-white fw-700">Subscribe Now</h4>
                    <p className="fs-6 text-white m-0 mb-1">
                      Stay updated with our latest offers and news.
                    </p>
                    <div className="form-group">
                      <Form.Control
                        as="textarea"
                        rows={1}
                        placeholder="Enter Your Email"
                      />
                      <Button
                        variant="primary"
                        className="primary-bg-color border-0 w-100 mt-1"
                      >
                        Subscribe
                      </Button>
                    </div>
                  </Col>
                  <Col>
                    <h4 className="fs-4 text-white fw-700">Information</h4>
                    <p className="fs-6 text-white m-0">
                      Discover a variety of vehicles available for rent. Choose
                      the one that suits your needs.{" "}
                    </p>
                  </Col>
                  <Col>
                    <h4 className="fs-4 text-white fw-700">Helpful Links</h4>
                    <p className="fs-6 text-white m-0">
                      Explore our services and find the best deals for your next
                      rental.{" "}
                    </p>
                  </Col>
                  <Col>
                    <h4 className="fs-4 text-white fw-700">Contact Us</h4>
                    <p className="fs-6 text-white m-0">
                      <span>
                        <IoLocation className="header-line-2-icon" />
                        &nbsp;
                        <a
                          href="https://www.google.com/maps/place/Bhubaneswar,+Odisha/@20.3008841,85.8204532,12z/data=!3m1!4b1!4m6!3m5!1s0x3a1909d2d5170aa5:0xfc580e2b68b33fa8!8m2!3d20.2960587!4d85.8245398!16zL20vMDNjenFz?entry=ttu"
                          target="_blank"
                          className="text-white"
                        >
                          Bhubaneswar
                        </a>
                      </span>
                      <br />
                      <span>
                        <BsTelephoneFill
                          size="0.9em"
                          className="header-line-2-icon"
                        />
                        &nbsp;
                        <a
                          href="tel:+91 012 345 6789"
                          target="_blank"
                          className="text-white"
                        >
                          +91 012 345 6789
                        </a>
                      </span>
                      <br />
                      <span>
                        <GrMail className="header-line-2-icon" />
                        &nbsp;
                        <a
                          href="mailto:diwakarr956@gmail.com"
                          target="_blank"
                          className="text-white"
                        >
                          diwakarr956@gmail.com
                        </a>
                      </span>
                    </p>
                    <div className="social-icon">
                      <ul>
                        <li>
                          <a href="https://www.facebook.com/" target="_blank">
                            <BiLogoFacebook />
                          </a>
                        </li>
                        <li>
                          <a href="https://twitter.com/" target="_blank">
                            <AiOutlineTwitter />
                          </a>
                        </li>
                        <li>
                          <a href="https://www.linkedin.com/" target="_blank">
                            <BiLogoLinkedin />
                          </a>
                        </li>
                        <li>
                          <a href="https://www.instagram.com/" target="_blank">
                            <AiFillInstagram />
                          </a>
                        </li>
                      </ul>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className="text-white text-center fs-6 mt-2 mb-1">
                  {new Date().getFullYear()} All Rights Reserved. Developed &
                  Designed by &nbsp;
                  <a
                    href="https://github.com/ravikant-diwakar/"
                    target="_blank"
                    className="text-primary"
                  >
                    Ravikant
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
