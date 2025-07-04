import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Spinner, Card } from "react-bootstrap";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import Swal from "sweetalert2";
import { useTheme } from '../context/ThemeContext';

const ContactSection = () => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    const uiColors = {
        sectionBg: isDark ? "#0A0A0A" : "#F8F8F8",
        headingPrimary: isDark ? "#E0E6F0" : "#1A202C",
        headingSecondary: isDark ? "#AABBCD" : "#4A5568",
        headingGradientStart: '#6A11CB',
        headingGradientEnd: '#2575FC',

        formCardBg: isDark ? "#1C1C1C" : "#FFFFFF",
        formCardBorder: isDark ? "1px solid #333333" : "1px solid #E0E0E0",
        formCardShadow: isDark ? "0 8px 25px rgba(0,0,0,0.5)" : "0 8px 25px rgba(0,0,0,0.1)",

        formControlBg: isDark ? "#2A2A2A" : "#F8F8F8",
        formControlColor: isDark ? "#E0E0E0" : "#333333",
        // Placeholder color is now primarily handled by SCSS, but keeping this for consistency if SCSS is not applied
        formControlPlaceholderColor: isDark ? "#D0D0D0" : "#888888",
        formControlBorder: isDark ? "1px solid #4A4A4A" : "1px solid #D0D0D0",
        formControlFocusShadow: isDark ? '0 0 0 0.25rem rgba(32, 201, 151, 0.25)' : '0 0 0 0.25rem rgba(0, 123, 255, 0.25)',

        buttonBg: isDark ? "#20C997" : "#007bff",
        buttonBorder: isDark ? "#20C997" : "#007bff",
        buttonText: "#FFFFFF",
        buttonHoverBg: isDark ? "#1AA07B" : "#0056b3",
        buttonHoverBorder: isDark ? "#1AA07B" : "#0056b3",
        buttonShadow: isDark ? '0 3px 9px rgba(0,0,0,0.15)' : '0 3px 9px rgba(0,0,0,0.15)',
        buttonHoverShadow: isDark ? '0 7px 18px rgba(0,0,0,0.3)' : '0 7px 18px rgba(0,0,0,0.3)',

        transition: 'all 0.3s ease-in-out',
    };

    const loadingContent = (
        <div className="text-center py-5">
            <Spinner animation="border" role="status" variant={isDark ? 'info' : 'primary'}>
                <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3" style={{ color: uiColors.formControlColor }}>Sending message...</p>
        </div>
    );

    const handleFormChange = e => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleContactSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            await addDoc(collection(db, "forms"), formData);
            setIsLoading(false);
            Swal.fire({
                title: "Message Sent!",
                text: "Your message has been successfully delivered.",
                icon: "success",
                customClass: {
                    popup: isDark ? 'swal2-dark-mode-popup' : '', // This class needs to be defined in your CSS/SCSS
                    title: isDark ? 'swal2-dark-mode-title' : '',
                    htmlContainer: isDark ? 'swal2-dark-mode-text' : '',
                    confirmButton: isDark ? 'swal2-dark-mode-confirm-button' : '',
                },
                 didOpen: (popup) => { // This part is still needed for runtime styling if customClass isn't fully supported
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
            setFormData({});
            event.target.reset();
        } catch (err) {
            console.error("Error sending message:", err);
            setIsLoading(false);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong! Please try again.",
                customClass: {
                    popup: isDark ? 'swal2-dark-mode' : '',
                },
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
        }
    };

    return (
        <div
            id="contact-section"
            className="py-6" // Use Bootstrap's py-6 for internal padding
            style={{
                backgroundColor: uiColors.sectionBg,
                transition: uiColors.transition,
                marginTop: '8rem', // Increased margin-top for more separation from the section above
                paddingBottom: '8rem', // *** FIX: Explicitly increased padding-bottom for space above footer ***
            }}
        >
            <Container>
                <Row className="justify-content-center mb-5">
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
                            <span style={{ display: 'block' }}>Get In Touch</span>
                            
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
                            We'd love to hear from you! Send us a message and we'll get back to you as soon as possible.
                        </p>
                    </Col>
                </Row>

                <Row className="justify-content-center">
                    <Col lg={7} xl={6}>
                        <Card
                            className="p-4 p-md-5 rounded-4 shadow-lg"
                            style={{
                                backgroundColor: uiColors.formCardBg,
                                border: uiColors.formCardBorder,
                                boxShadow: uiColors.formCardShadow,
                                transition: uiColors.transition,
                            }}
                        >
                            <Card.Body className="p-0">
                                {!isLoading ? (
                                    <Form onSubmit={handleContactSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                placeholder="Your Name"
                                                onChange={handleFormChange}
                                                required={true}
                                                size="lg"
                                                style={{
                                                    backgroundColor: uiColors.formControlBg,
                                                    color: uiColors.formControlColor,
                                                    borderColor: uiColors.formControlBorder,
                                                    borderRadius: '8px',
                                                    padding: '0.75rem 1rem',
                                                    transition: uiColors.transition,
                                                }}
                                                value={formData.name || ''}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                placeholder="Your Email"
                                                onChange={handleFormChange}
                                                required={true}
                                                size="lg"
                                                style={{
                                                    backgroundColor: uiColors.formControlBg,
                                                    color: uiColors.formControlColor,
                                                    borderColor: uiColors.formControlBorder,
                                                    borderRadius: '8px',
                                                    padding: '0.75rem 1rem',
                                                    transition: uiColors.transition,
                                                }}
                                                value={formData.email || ''}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                type="tel"
                                                name="phone"
                                                placeholder="Your Phone Number"
                                                onChange={handleFormChange}
                                                required={true}
                                                size="lg"
                                                style={{
                                                    backgroundColor: uiColors.formControlBg,
                                                    color: uiColors.formControlColor,
                                                    borderColor: uiColors.formControlBorder,
                                                    borderRadius: '8px',
                                                    padding: '0.75rem 1rem',
                                                    transition: uiColors.transition,
                                                }}
                                                value={formData.phone || ''}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-4">
                                            <Form.Control
                                                as="textarea"
                                                name="message"
                                                rows={5}
                                                placeholder="Your Message"
                                                onChange={handleFormChange}
                                                required={true}
                                                size="lg"
                                                style={{
                                                    backgroundColor: uiColors.formControlBg,
                                                    color: uiColors.formControlColor,
                                                    borderColor: uiColors.formControlBorder,
                                                    borderRadius: '8px',
                                                    padding: '0.75rem 1rem',
                                                    transition: uiColors.transition,
                                                }}
                                                value={formData.message || ''}
                                            />
                                        </Form.Group>
                                        <div className="d-grid mt-3">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="py-3 fw-bold"
                                                style={{
                                                    backgroundColor: isButtonHovered ? uiColors.buttonHoverBg : uiColors.buttonBg,
                                                    color: uiColors.buttonText,
                                                    border: `2px solid ${isButtonHovered ? uiColors.buttonHoverBorder : uiColors.buttonBorder}`,
                                                    borderRadius: '10px',
                                                    transition: uiColors.transition,
                                                    boxShadow: isButtonHovered ? uiColors.buttonHoverShadow : uiColors.buttonShadow,
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={() => setIsButtonHovered(true)}
                                                onMouseLeave={() => setIsButtonHovered(false)}
                                            >
                                                SEND MESSAGE
                                            </Button>
                                        </div>
                                    </Form>
                                ) : (
                                    loadingContent
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ContactSection;