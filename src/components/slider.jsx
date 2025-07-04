import React, { useState, useContext, useEffect } from "react";
import { Container, Row, Col, Carousel, Button } from "react-bootstrap";
import { GrNext, GrPrevious } from "react-icons/gr";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

// Ensure Montserrat or any other custom font is imported in your main CSS or SCSS
// e.g., @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap');

const slides = [
  {
    image: "/bike.jpg",
    title: "Unleash Your Ride",
    tagline: "Experience the thrill of the open road with our premium bikes.",
    buttonText: "Discover Bikes",
    bgClass: "slide-orange",
  },
  {
    image: "/car.jpg",
    title: "Drive in Style",
    tagline: "Your journey, your rules – explore with our luxury and economical cars.",
    buttonText: "Explore Cars",
    bgClass: "slide-dark",
  },
  {
    image: "/scooter.jpg",
    title: "Effortless City Rides",
    tagline: "Navigate urban landscapes with ease on our agile scooters.",
    buttonText: "Find Scooters",
    bgClass: "slide-light",
  },
];

const Slider = () => {
  const [index, setIndex] = useState(0);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const onPrevClick = () => {
    setIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const onNextClick = () => {
    setIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  };

  const isDark = theme === "dark";

  return (
    <div id="slider">
      <Container>
        <Row className="justify-content-center">
          <Col lg={11}> {/* Increased column size for more visual impact */}
            <Carousel
              activeIndex={index}
              onSelect={handleSelect}
              controls={false} // Custom controls handled below
              indicators={false}
              pause="hover"
              fade // Keep fade for smooth transition between slides
              className="slider-carousel" // Add a class for specific carousel styling
            >
              {slides.map((slide, idx) => (
                <Carousel.Item key={idx}>
                  <div
                    className={`slide-content-wrapper d-flex flex-column flex-md-row align-items-center gap-4 p-4 ${slide.bgClass}`}
                    // Background images are set directly in SCSS using the theme classes for more dynamic backgrounds
                  >
                    <div className="col-md-6 text-center slide-image-container">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="img-fluid"
                        style={{ maxHeight: "400px", objectFit: "contain" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder.jpg"; // Fallback image
                        }}
                      />
                    </div>
                    <div className="col-md-6 slide-text-content">
                      <h2 className="slide-title">{slide.title}</h2>
                      <p className="slide-tagline">{slide.tagline}</p>
                      <Button
                        onClick={() => navigate("/vehicles")}
                        className="rent-btn"
                      >
                        {slide.buttonText}
                      </Button>
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>

            {/* Custom Arrows below slider */}
            <div className="d-flex justify-content-center gap-3 mt-5"> {/* Increased margin-top */}
              <Button
                onClick={onPrevClick}
                className="arrow-button"
              >
                <GrPrevious />
              </Button>
              <Button
                onClick={onNextClick}
                className="arrow-button"
              >
                <GrNext />
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Slider;