import React, { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { AiOutlineSafety } from "react-icons/ai";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { BiSolidOffer } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext";

const FeaturesSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [hoveredFeature, setHoveredFeature] = useState(null);

  const uiColors = {
    sectionBg: isDark ? "#0A0A0A" : "#F8F8F8",
    // Keep these general heading colors, but override for the specific parts below
    headingPrimary: isDark ? "#E0E6F0" : "#1A202C",
    headingSecondary: isDark ? "#AABBCD" : "#4A5568",
    headingGradientStart: '#6A11CB',
    headingGradientEnd: '#2575FC',

    // Specific colors for the heading parts
    whyChooseColor: isDark ? '#AABBCD' : '#4A5568', // A softer, subtle color for "Why Choose"
    snapRideColor: '#20C997', // Your accent green for "SNAPRIDE"

    cardBg: isDark ? "#1C1C1C" : "#FFFFFF",
    cardBorder: isDark ? "1px solid #333333" : "1px solid #E0E0E0",
    cardShadow: isDark ? "0 5px 15px rgba(0,0,0,0.4)" : "0 5px 15px rgba(0,0,0,0.1)",
    cardHoverShadow: isDark ? "0 10px 25px rgba(32, 201, 151, 0.2), 0 0 15px rgba(32, 201, 151, 0.1)" : "0 10px 25px rgba(0,0,0,0.2)",

    iconContainerBg: isDark ? "linear-gradient(135deg, #20C997, #1AA07B)" : "linear-gradient(135deg, #007bff, #0056b3)",
    iconColor: "#FFFFFF",
    iconShadow: isDark ? "0 0 20px rgba(32, 201, 151, 0.6)" : "0 0 20px rgba(0, 123, 255, 0.4)",

    featureTitleColor: isDark ? "#ADD8E6" : "#333333",
    textColor: isDark ? "#E0E0E0" : "#555555",

    transition: "all 0.3s ease-in-out",
  };

  const features = [
    {
      id: "safety",
      icon: <AiOutlineSafety size="2.5em" />,
      title: "Reliable & Secure",
      description: "SnapRide ensures your journey is safe and secure with meticulously verified vehicles and smart tracking features.",
    },
    {
      id: "booking",
      icon: <HiOutlineStatusOnline size="2.5em" />,
      title: "Instant Online Booking",
      description: "Book your ideal ride anytime, anywhere with our seamless 24/7 online booking system and intuitive interface.",
    },
    {
      id: "offers",
      icon: <BiSolidOffer size="2.5em" />,
      title: "Unbeatable Offers",
      description: "Access competitive pricing, exclusive member deals, and unparalleled value for every adventure you plan.",
    },
  ];

  return (
    <div
      id="features-section"
      className="py-6"
      style={{
        backgroundColor: uiColors.sectionBg,
        transition: uiColors.transition,
      }}
    >
      <Container>
        {/* Heading Section */}
        <Row className="justify-content-center mb-5">
          <Col lg={8} className="text-center">
            <h1
              className="p-0 fw-extrabold mb-3"
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: '3.8rem',
                lineHeight: '1.05',
                letterSpacing: '0.05em',
                textShadow: isDark
                  ? '0 0 15px rgba(32, 201, 151, 0.6), 0 0 25px rgba(32, 201, 151, 0.4)'
                  : '0 0 10px rgba(106, 17, 203, 0.3), 0 0 20px rgba(37, 117, 252, 0.2)', // Accent shadows for light mode
                transition: uiColors.transition,
                textTransform: 'uppercase', // This will make "Why Choose" uppercase
              }}
            >
              <span style={{ display: 'block', color: uiColors.whyChooseColor }}>Why Choose</span>
              <span
                style={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  marginTop: '-0.1em',
                  color: uiColors.snapRideColor, // Apply the green color
                  // Add subtle shadow to the green text
                  textShadow: isDark
                    ? '0 0 10px rgba(32, 201, 151, 0.8), 0 0 20px rgba(32, 201, 151, 0.6)'
                    : '0 0 8px rgba(32, 201, 151, 0.5), 0 0 15px rgba(32, 201, 151, 0.3)',
                  textTransform: 'none', // Override parent's uppercase for this span
                }}
              >
                SnapRide {/* Changed to SnapRide with S and R capitalized, rest lowercase */}
              </span>
            </h1>
            <p
              className="fs-5 mb-0"
              style={{
                fontFamily: '"Roboto", sans-serif',
                color: uiColors.headingSecondary,
                lineHeight: '1.7',
                maxWidth: '800px',
                margin: '0 auto',
                transition: uiColors.transition,
                fontWeight: '400',
              }}
            >
              Discover the unparalleled advantages that make <span style={{ fontWeight: '700', color: isDark ? '#FFF' : '#000' }}>SnapRide</span> your ultimate choice for seamless and exceptional vehicle rentals.
            </p>
          </Col>
        </Row>

        {/* Features Grid */}
        <Row className="text-center justify-content-center g-4">
          {features.map((feature) => (
            <Col xs={12} md={6} lg={4} key={feature.id}>
              <Card
                className="h-100 p-4 rounded-4"
                style={{
                  backgroundColor: uiColors.cardBg,
                  border: uiColors.cardBorder,
                  boxShadow: hoveredFeature === feature.id ? uiColors.cardHoverShadow : uiColors.cardShadow,
                  transition: uiColors.transition,
                  transform: hoveredFeature === feature.id ? 'translateY(-5px)' : 'translateY(0)',
                  cursor: 'default',
                }}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  <div
                    className="mb-4 d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: '90px',
                      height: '90px',
                      background: uiColors.iconContainerBg,
                      color: uiColors.iconColor,
                      transition: uiColors.transition,
                      boxShadow: uiColors.iconShadow,
                      border: `2px solid ${isDark ? '#20C997' : '#007bff'}`,
                    }}
                  >
                    {React.cloneElement(feature.icon, { size: "2.8em" })}
                  </div>

                  <h4 className="fs-4 fw-bold mb-3" style={{ color: uiColors.featureTitleColor, transition: uiColors.transition }}>
                    {feature.title}
                  </h4>
                  <p className="fs-6 mb-0" style={{ color: uiColors.textColor, transition: uiColors.transition }}>
                    {feature.description}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default FeaturesSection;