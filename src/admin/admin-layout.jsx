import React from 'react';
import { Container, Row, Col, Card } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AdminHeader from "./admin-header";
import { useTheme } from '../context/ThemeContext'; // Assuming you have this context for theming

const AdminLayout = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark'; // Admin panel typically dark, but make it theme-aware

    // Define UI colors for the admin layout
    const uiColors = {
        layoutBg: isDark ? "#0A0A0A" : "#F0F2F5", // Very dark for dark mode, light gray for light mode
        contentCardBg: isDark ? "#1C1C1C" : "#FFFFFF", // Slightly lighter dark for dark mode, white for light
        contentCardBorder: isDark ? "1px solid #333333" : "1px solid #E0E0E0",
        contentCardShadow: isDark ? "0 8px 25px rgba(0,0,0,0.5)" : "0 8px 25px rgba(0,0,0,0.1)",
        contentTextColor: isDark ? "#E0E0E0" : "#333333",
        transition: 'all 0.3s ease-in-out',
    };

    return (
        <>
            {/* Admin Header is rendered here, outside the main fluid container */}
            <AdminHeader />

            {/* Main Admin Content Area */}
            <Container fluid
                className="py-5" // Generous vertical padding for the entire layout
                style={{
                    backgroundColor: uiColors.layoutBg,
                    minHeight: 'calc(100vh - 120px)', // Adjust min-height to account for header's height
                    transition: uiColors.transition,
                }}
            >
                <Row className="justify-content-center"> {/* This row centers its columns */}
                    {/* Wider content area for dashboard feel, responsive sizing */}
                    <Col xs={12} md={10} lg={9} xl={8}>
                        <Card
                            className="p-4 p-md-5 rounded-4" // Increased padding, more rounded corners
                            style={{
                                backgroundColor: uiColors.contentCardBg,
                                border: uiColors.contentCardBorder,
                                boxShadow: uiColors.contentCardShadow,
                                color: uiColors.contentTextColor,
                                transition: uiColors.transition,
                            }}
                        >
                            <Card.Body className="p-0"> {/* Remove default Card.Body padding */}
                                <Outlet /> {/* Renders the nested admin routes/content */}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default AdminLayout;