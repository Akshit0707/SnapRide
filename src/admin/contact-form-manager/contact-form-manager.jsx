import React, { useEffect, useState } from 'react';
import { Accordion, Button, Spinner, Container, Row, Col, Card } from "react-bootstrap";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";
import Swal from "sweetalert2";
import { FaEnvelope, FaUser, FaPhone, FaTrashAlt, FaExclamationCircle } from "react-icons/fa";
import { BiMessageAltDetail } from "react-icons/bi";

import { fetchContactForms } from "../../hooks/useFetchData";
import { loadingContent } from "../../components/general/general-components";

const ContactFormManager = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [contactForms, setContactForms] = useState({});

    useEffect(() => {
        const loadForms = async () => {
            try {
                const response = await fetchContactForms();

                let formatted = {};
                if (Array.isArray(response)) {
                    response.forEach(doc => {
                        formatted[doc.id] = doc;
                    });
                } else {
                    formatted = response || {};
                }

                setContactForms(formatted);
            } catch (error) {
                console.error("Failed to fetch contact forms:", error);
                Swal.fire("Error", "Unable to load contact forms.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadForms();
    }, []);

    const handleDeleteMessage = async (documentId) => {
        const result = await Swal.fire({
            title: "Do you want to delete this message?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No"
        });

        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, "forms", documentId));
                Swal.fire("Deleted!", "The message has been deleted.", "success");

                setContactForms(prev => {
                    const updated = { ...prev };
                    delete updated[documentId];
                    return updated;
                });
            } catch (error) {
                console.error("Error deleting message:", error);
                Swal.fire("Error", "Could not delete the message.", "error");
            }
        }
    };

    return (
        <Container fluid className="admin-panel-container py-5">
            <Row className="justify-content-center">
                <Col xs={12} md={10} lg={9} xl={8}>
                    {/* Page Heading - Moved outside the conditional loading block */}
                    <h1 className="mb-4 text-center admin-panel-heading">Contact Form Management</h1>

                    <Card className="shadow-sm admin-card-custom">
                        <Card.Header as="h2" className="text-center py-3 admin-card-header-custom">
                            Incoming Messages
                        </Card.Header>
                        <Card.Body className="p-4">
                            {isLoading ? (
                                <div className="d-flex justify-content-center align-items-center py-5">
                                    {loadingContent}
                                </div>
                            ) : Object.keys(contactForms).length > 0 ? (
                                <Accordion alwaysOpen className="contact-form-accordion">
                                    {Object.entries(contactForms)
                                        .sort(([, a], [, b]) => new Date(b.timestamp && b.timestamp.toDate ? b.timestamp.toDate() : 0) - new Date(a.timestamp && a.timestamp.toDate ? a.timestamp.toDate() : 0)) // Added || 0 for safer date conversion
                                        .map(([key, form]) => (
                                        <Accordion.Item key={key} eventKey={key} className="mb-2 border rounded">
                                            <Accordion.Header>
                                                <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                                                    <span className="fw-bold text-truncate me-2">
                                                        <FaUser className="me-2 text-primary" />
                                                        {form.name || 'N/A'}
                                                    </span>
                                                    
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <p className="mb-2">
                                                    <strong><FaEnvelope className="me-2 text-info" />Email:</strong> {form.email || 'N/A'}
                                                </p>
                                                <p className="mb-2">
                                                    <strong><FaPhone className="me-2 text-success" />Phone:</strong> {form.phone || 'N/A'}
                                                </p>
                                                <p className="mb-4">
                                                    <strong><BiMessageAltDetail className="me-2 text-secondary" />Message:</strong> {form.message || 'N/A'}
                                                </p>
                                                <Button
                                                    variant="danger"
                                                    className="w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                                                    onClick={() => handleDeleteMessage(key)}
                                                >
                                                    <FaTrashAlt /> Delete Message
                                                </Button>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="alert alert-info text-center py-4 shadow-sm">
                                    <FaExclamationCircle className="mb-2" size="2em" /><br/>
                                    No contact forms found.
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style jsx>{`
                .admin-panel-container {
                    background-color: #212529; /* Very dark background */
                    min-height: 100vh;
                    padding-top: 50px;
                    padding-bottom: 50px;
                }
                .admin-panel-heading {
                    color: #ffffff; /* White text for heading */
                    font-weight: 700;
                    font-size: 2.5rem;
                    margin-bottom: 40px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                }
                .admin-card-custom {
                    border-radius: 0.75rem;
                    overflow: hidden;
                    background-color: #ffffff; /* Keep card background white */
                    color: #343a40; /* Dark text for card content */
                    border: none;
                }
                .admin-card-header-custom {
                    background-color: #e9ecef;
                    color: #495057;
                    font-weight: 600;
                    border-bottom: 1px solid #dee2e6;
                }
                .contact-form-accordion .accordion-button {
                    background-color: #ffffff;
                    color: #343a40;
                    font-weight: 500;
                    border-bottom: 1px solid rgba(0,0,0,.125);
                }
                .contact-form-accordion .accordion-button:not(.collapsed) {
                    background-color: #e2f0d9;
                    color: #28a745;
                    border-color: #28a745;
                }
                .contact-form-accordion .accordion-button:focus {
                    box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
                }
                .contact-form-accordion .accordion-body {
                    background-color: #f8f9fa;
                    border-top: 1px solid rgba(0,0,0,.125);
                }
            `}</style>
        </Container>
    );
};

export default ContactFormManager;