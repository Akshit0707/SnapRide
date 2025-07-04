import React, { useState } from "react";
import { reviewsData } from "../DATA/data.jsx";
import { Button, Card, Carousel, Col, Container, Row } from "react-bootstrap";
import { GrNext, GrPrevious } from "react-icons/gr";
import { AiFillStar } from "react-icons/ai";
import { useTheme } from '../context/ThemeContext'; // Import the useTheme hook

const CustomerReview = () => {
  const { theme } = useTheme(); // Use the theme from context
  const isDark = theme === 'dark';

  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  // Adjusting navigation logic for correct index calculation with pairs
  const totalSlides = Math.ceil(reviewsData.length / 2);

  const onPrevClick = () => {
    setIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const onNextClick = () => {
    setIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  // Define comprehensive UI colors based on the theme
  const uiColors = {
    sectionBg: isDark ? "#0A0A0A" : "#F8F8F8",
    // Heading colors (consistent with CarSearch and FeaturesSection)
    headingPrimary: isDark ? "#E0E6F0" : "#1A202C",
    headingSecondary: isDark ? "#AABBCD" : "#4A5568",
    headingGradientStart: '#6A11CB', // Deep Violet
    headingGradientEnd: '#2575FC',   // Bright Blue

    cardBg: isDark ? "#1C1C1C" : "#FFFFFF", // Background of each review card
    cardBorder: isDark ? "1px solid #333333" : "1px solid #E0E0E0", // Border of each review card
    cardShadow: isDark ? "0 5px 15px rgba(0,0,0,0.4)" : "0 5px 15px rgba(0,0,0,0.1)", // Card shadow
    cardHoverShadow: isDark ? "0 10px 25px rgba(32, 201, 151, 0.2), 0 0 15px rgba(32, 201, 151, 0.1)" : "0 10px 25px rgba(0,0,0,0.2)", // Card hover shadow

    customerNameColor: isDark ? "#ADD8E6" : "#333333", // Color for customer names
    reviewTextColor: isDark ? "#E0E0E0" : "#555555", // Color for review text
    starColor: "#f5b50a", // Consistent star color

    // Carousel Navigation Button Colors
    navButtonBg: isDark ? '#2A2A2A' : '#EAF4FF', // Subtle background for buttons
    navButtonBorder: isDark ? '1px solid #444444' : '1px solid #D0D0D0',
    navButtonIconColor: isDark ? '#20C997' : '#007bff', // Accent color for icons
    navButtonHoverBg: isDark ? '#3A3A3A' : '#DDEEFF',
    navButtonHoverShadow: isDark ? '0 0 10px rgba(32, 201, 151, 0.3)' : '0 0 10px rgba(0, 123, 255, 0.2)',

    transition: "all 0.3s ease-in-out",
  };

  // Prepare carousel items in pairs
  const resultsRender = [];
  for (let i = 0; i < reviewsData.length; i += 2) {
    resultsRender.push(
      <Carousel.Item key={`review_carousel_${i}`} interval={99999}>
        <Row className="g-4 px-2 justify-content-center">
          {reviewsData.slice(i, i + 2).map((review, idx) => (
            <Col xs={12} md={6} key={`review_${i + idx}`}>
              <Card
                className="h-100 p-3 rounded-4"
                style={{
                  backgroundColor: uiColors.cardBg,
                  border: uiColors.cardBorder,
                  color: uiColors.reviewTextColor,
                  boxShadow: uiColors.cardShadow,
                  transition: uiColors.transition,
                }}
              >
                <Card.Body className="d-flex flex-column align-items-center text-center">
                  <div
                    className="mb-3 rounded-circle overflow-hidden d-flex align-items-center justify-content-center"
                    style={{
                      width: '100px',
                      height: '100px',
                      border: `3px solid ${uiColors.navButtonIconColor}`,
                      boxShadow: isDark ? '0 0 15px rgba(32, 201, 151, 0.4)' : '0 0 15px rgba(0, 123, 255, 0.2)',
                      backgroundColor: isDark ? '#222' : '#F0F0F0',
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={review.customerImageUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      alt={review.customerName}
                    />
                  </div>

                  <Card.Title
                    className="fw-bold mb-2"
                    style={{ color: uiColors.customerNameColor, fontSize: '1.4rem' }}
                  >
                    {review.customerName}
                  </Card.Title>
                  <Card.Text className="mb-3" style={{ color: uiColors.reviewTextColor, lineHeight: '1.6' }}>
                    "{review.customerReview}"
                  </Card.Text>
                  <div className="review-star d-flex justify-content-center align-items-center gap-1">
                    {Array.from({ length: review.customerStar }).map((_, starIdx) => (
                      <AiFillStar key={`star_${starIdx}`} size={20} color={uiColors.starColor} />
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Carousel.Item>
    );
  }

  return (
    <div
      id="customer-reviews"
      className="py-6"
      style={{
        backgroundColor: uiColors.sectionBg,
        transition: uiColors.transition,
      }}
    >
      <Container>
        {/* Heading Section */}
        <Row
          className="justify-content-center mb-5"
          style={{
            marginTop: '2rem', // Added margin-top to push the heading down
          }}
        >
          <Col lg={8} className="text-center">
            <h1
              className="p-0 fw-extrabold mb-3"
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: '3.2rem',
                lineHeight: '1.2',
                letterSpacing: '0.02em',
                color: isDark ? uiColors.headingPrimary : 'inherit',
                background: !isDark
                  ? `linear-gradient(90deg, ${uiColors.headingGradientStart}, ${uiColors.headingGradientEnd})`
                  : 'none',
                WebkitBackgroundClip: !isDark ? "text" : 'unset',
                WebkitTextFillColor: !isDark ? "transparent" : 'inherit',
                textShadow: isDark ? '0 0 15px rgba(224, 230, 240, 0.3)' : '2px 2px 5px rgba(0,0,0,0.15)',
                transition: uiColors.transition,
                textTransform: 'uppercase',
              }}
            >
              <span style={{ display: 'block' }}>What Our</span>
              <span style={{ display: 'block', whiteSpace: 'nowrap', marginTop: '-0.1em' }}>CUSTOMERS SAY</span>
            </h1>
            <p
              className="fs-5 mb-0"
              style={{
                fontFamily: '"Roboto", sans-serif',
                color: uiColors.headingSecondary,
                lineHeight: '1.6',
                maxWidth: '700px',
                margin: '0 auto',
                transition: uiColors.transition,
                fontWeight: '400',
              }}
            >
              Hear directly from our satisfied clients about their <span style={{ fontWeight: '600' }}>SnapRide</span> experience.
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center align-items-center">
          <Col xs="auto" className="d-none d-md-block">
            <Button
              onClick={onPrevClick}
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '50px',
                height: '50px',
                backgroundColor: uiColors.navButtonBg,
                border: uiColors.navButtonBorder,
                transition: uiColors.transition,
                boxShadow: uiColors.cardShadow,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = uiColors.navButtonHoverBg;
                e.currentTarget.style.boxShadow = uiColors.navButtonHoverShadow;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = uiColors.navButtonBg;
                e.currentTarget.style.boxShadow = uiColors.cardShadow;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <GrPrevious size={24} style={{ color: uiColors.navButtonIconColor }} />
            </Button>
          </Col>
          <Col xs={12} md={8}>
            <Carousel activeIndex={index} onSelect={handleSelect} indicators={false} controls={false}>
              {resultsRender}
            </Carousel>
          </Col>
          <Col xs="auto" className="d-none d-md-block">
            <Button
              onClick={onNextClick}
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '50px',
                height: '50px',
                backgroundColor: uiColors.navButtonBg,
                border: uiColors.navButtonBorder,
                transition: uiColors.transition,
                boxShadow: uiColors.cardShadow,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = uiColors.navButtonHoverBg;
                e.currentTarget.style.boxShadow = uiColors.navButtonHoverShadow;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = uiColors.navButtonBg;
                e.currentTarget.style.boxShadow = uiColors.cardShadow;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <GrNext size={24} style={{ color: uiColors.navButtonIconColor }} />
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CustomerReview;