import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
// Make sure the path to your Image2 is correct, including its extension if it has one (e.g., Image2.png)
import Image2 from "../assets/images/image2.png";
import { useTheme } from '../context/ThemeContext'; // Import useTheme hook

const AboutSection = () => {
  const { theme } = useTheme(); // Get the current theme

  // Define dynamic styles based on the theme
  const sectionBgColor = theme === 'dark' ? '#000000' : '#FFFFFF'; // Black background for dark mode
  const headingColorDark = '#20C997'; // A vibrant green for dark mode heading
  const textColor = theme === 'dark' ? '#E0E0E0' : '#555555'; // Light grey for dark mode text, dark grey for light mode
  const buttonBgColor = theme === 'dark' ? '#6A5ACD' : '#007bff'; // Purple for dark, blue for light
  const buttonHoverColor = theme === 'dark' ? '#7B68EE' : '#0056b3'; // Lighter purple for dark hover, darker blue for light hover
  const buttonBorderColor = theme === 'dark' ? '#7B68EE' : '#007bff'; // Border color for button

  return (
    <div
      id="about-section"
      style={{
        padding: "80px 0", // Slightly increased padding for more breathing room
        backgroundColor: sectionBgColor,
        transition: 'background-color 0.3s ease-in-out', // Smooth transition for theme change
      }}
    >
      <Container>
        <Row className="align-items-center flex-column-reverse flex-md-row"> {/* Reversed order for mobile first */}
          {/* Image Column */}
          <Col xs={12} md={6}>
            <div className="image_iman text-center text-md-start mb-4 mb-md-0">
              <img
                src={Image2} // Using Image2 as specified
                className="about_img img-fluid"
                alt="About SnapRide"
                style={{
                  filter: theme === 'dark' ? 'brightness(0.8) contrast(1.2)' : 'none', // Subtle filter for dark mode image
                  width: '100%', // Makes the image fill the column width
                  height: 'auto', // Keeps the aspect ratio
                  maxWidth: '550px', // Set a maximum width for larger screens
                  maxHeight: '400px', // Set a maximum height
                  objectFit: 'cover' // Ensures the image covers the area without distortion, cropping if necessary
                }}
              />
            </div>
          </Col>

          {/* Text Column */}
          <Col xs={12} md={6}>
            <div className="py-4"> {/* Added vertical padding for content */}
              <h2
                className="text-uppercase fs-1 fw-bold mb-4" // Larger heading, more bottom margin
                style={{
                  background: theme === 'dark'
                    ? 'none' // No gradient, solid color for dark mode
                    : "linear-gradient(to right, #ff512f, #dd2476)", // Original gradient for light mode
                  WebkitBackgroundClip: theme === 'dark' ? 'unset' : "text",
                  WebkitTextFillColor: theme === 'dark' ? headingColorDark : "transparent", // Vibrant green for dark mode
                  color: theme === 'dark' ? headingColorDark : 'inherit', // Fallback for browsers
                  textShadow: "1px 1px 3px rgba(0,0,0,0.2)", // More prominent shadow
                }}
              >
                About SnapRide
              </h2>
              <p className="fs-5 mb-4" style={{ color: textColor }}> {/* Adjusted font size and margin */}
                Welcome to **SnapRide**, where your journey begins with a tap! We've revolutionized the way you experience car and bike rentals, making it incredibly **fast, secure, and stress-free**. Whether you're planning an epic road trip, a quick city commute, or just need wheels for the day, our intuitive platform offers a **diverse fleet** to suit every adventure.
              </p>
              <p className="fs-5 mb-4" style={{ color: textColor }}>
                Browse seamlessly through our wide selection, choose **flexible rental periods** that fit your schedule, and complete your booking with **effortless, secure payments**. With SnapRide, you're always in control – access your **complete booking history** anytime and enjoy peace of mind with our **dedicated 24/7 customer support**. Discover the freedom of the open road with SnapRide!
              </p>

              {/* Developer Projects Link Section */}
              <div className="mt-4"> {/* More top margin for button */}
                <p className="fs-6 mb-3" style={{ color: textColor }}>
                  To see more projects by the developer, click on this link:
                </p>
                <Button
                  as="a" // Render as an anchor tag
                  href="https://github.com/Akshit0707" // Your GitHub Link
                  target="_blank" // Opens in a new tab
                  rel="noopener noreferrer" // Recommended for security with target="_blank"
                  className="readmore-btn fs-5 px-5 py-3 rounded-pill fw-bold shadow-lg" // Larger padding, rounded, bold, strong shadow
                  style={{
                    backgroundColor: buttonBgColor,
                    borderColor: buttonBorderColor,
                    color: '#FFFFFF', // White text for the button
                    transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, transform 0.2s ease-in-out',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = buttonHoverColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = buttonBgColor}
                >
                  View More Projects
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutSection;