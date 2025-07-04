import React, {useEffect, useState} from 'react';
import {Button, Form, InputGroup, Container, Row, Col, Card, Spinner} from "react-bootstrap";
import {collection, doc, getDoc, getDocs, setDoc} from "firebase/firestore";
import {db} from "../../config/firebase";
import Swal from "sweetalert2";
import {FaMapMarkerAlt, FaPlus, FaSave, FaTrashAlt} from "react-icons/fa";

import {fetchLocations} from "../../hooks/useFetchData";
import {loadingContent} from "../../components/general/general-components"; 

const LocationsManager = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [locations, setLocations] = useState(null);
    const [newLocation, setNewLocation] = useState("");
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        setIsInitialLoading(true);
        fetchLocations()
            .then(response => {
                setLocations(response);
                setIsInitialLoading(false);
            })
            .catch(error => {
                console.error("Error fetching locations:", error);
                setIsInitialLoading(false);
                Swal.fire({
                    icon: "error",
                    title: "Fetch Error",
                    text: "Failed to load locations. Please try again."
                });
            });
    }, [])

    const handleAddNewButton = () => {
        if(!newLocation.trim().length) {
            Swal.fire({
                icon: 'warning',
                title: 'Empty Field',
                text: 'Please enter a new location name.'
            });
            return;
        }

        const locationNames = Object.values(locations || {}).map(loc => loc.toLowerCase());
        if (locationNames.includes(newLocation.trim().toLowerCase())) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Location',
                text: 'This location already exists.'
            });
            return;
        }

        let newIndex = Object.keys(locations || {}).length === 0 
                       ? 0 
                       : Math.max(...Object.keys(locations).map(Number)) + 1;

        setLocations((prevState) => ({
            ...(prevState || {}),
            [newIndex]: newLocation.trim(),
        }));

        setNewLocation("");
    }

    const handleRemoveButton = (keyToRemove) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                setLocations(current => {
                    const copy = {...current};
                    delete copy[keyToRemove];

                    const reindexedCopy = {};
                    Object.values(copy).forEach((value, index) => {
                        reindexedCopy[index] = value;
                    });
                    return reindexedCopy;
                });
                Swal.fire(
                    "Deleted!",
                    "The location has been removed (will be saved on 'Save All Changes').",
                    "success"
                );
            }
        });
    }

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setLocations((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSaveChangesSubmit = async e => {
        e.preventDefault();

        const hasEmptyValues = Object.values(locations || {}).some(value => !value.trim().length);
        if (hasEmptyValues) {
            Swal.fire({
                icon: 'warning',
                title: 'Empty Locations',
                text: 'Please ensure all location fields are filled before saving.'
            });
            return;
        }

        setIsLoading(true);

        setDoc(doc(db, "vehicle", "locations"), locations || {})
            .then(() => {
                setIsLoading(false);
                Swal.fire({
                    title: "Good job!",
                    text: "All changes saved successfully!",
                    icon: "success"
                });
            })
            .catch(err => {
                console.error("Error saving locations:", err);
                setIsLoading(false);
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong while saving changes! " + err.message
                });
            });
    }

    return (
        <Container fluid className="admin-panel-container"> {/* Removed py-5 from here, added to specific elements */}
            <Row className="justify-content-center">
                <Col xs={12} md={10} lg={8} xl={7}>
                    {/* Heading for the page */}
                    <h1 className="text-center admin-panel-heading">Locations Management</h1>

                    {isInitialLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                            {loadingContent}
                        </div>
                    ) : (
                        <Form onSubmit={handleSaveChangesSubmit}>
                            <Card className="mb-4 shadow-sm admin-card-custom">
                                <Card.Header as="h2" className="text-center py-3 admin-card-header-custom">
                                    Edit Existing Cities
                                </Card.Header>
                                <Card.Body className="p-4">
                                    {
                                        Object.entries(locations || {}).length > 0 ? (
                                            Object.entries(locations).map(([key, value]) => (
                                                <div key={key} className="mb-3">
                                                    <InputGroup>
                                                        <InputGroup.Text><FaMapMarkerAlt className="text-muted" /></InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            name={key}
                                                            value={value || ''}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter city name..."
                                                            className="form-control-location"
                                                        />
                                                        <Button variant="danger" type="button" onClick={() => handleRemoveButton(key)}>
                                                            <FaTrashAlt /> Remove
                                                        </Button>
                                                    </InputGroup>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="alert alert-info text-center">
                                                No locations to display. Add a new one below!
                                            </div>
                                        )
                                    }
                                </Card.Body>
                            </Card>

                            <Card className="mb-4 shadow-sm admin-card-custom">
                                <Card.Header as="h2" className="text-center py-3 admin-card-header-custom">
                                    Add New City
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text><FaMapMarkerAlt className="text-muted" /></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            value={newLocation}
                                            onChange={e => setNewLocation(e.target.value)}
                                            placeholder="Enter new city name..."
                                            className="form-control-location"
                                        />
                                        <Button variant="primary" type="button" onClick={handleAddNewButton}>
                                            <FaPlus /> Add
                                        </Button>
                                    </InputGroup>
                                   
                                </Card.Body>
                            </Card>

                            <Button 
                                variant="success" 
                                type="submit" 
                                className="w-100 py-3 mt-3 save-button-custom"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        <span className="ms-2">Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="me-2" /> Save All Changes
                                    </>
                                )}
                            </Button>
                        </Form>
                    )}
                </Col>
            </Row>
            {/* Inline CSS for the improved styling */}
            <style jsx>{`
                .admin-panel-container {
                    background-color: #212529; /* Dark background like the admin panel */
                    min-height: 100vh; /* Ensure it fills the viewport */
                    padding-top: 50px; /* Add padding to the top and bottom */
                    padding-bottom: 50px;
                }
                .admin-panel-heading {
                    color: #ffffff; /* White text for heading */
                    font-weight: 700;
                    font-size: 2.5rem; /* Larger font size */
                    margin-bottom: 40px; /* More space below the heading */
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5); /* Subtle shadow for depth */
                }
                .admin-card-custom {
                    border-radius: 0.75rem;
                    overflow: hidden;
                    background-color: #ffffff; /* Keep card background white */
                    color: #343a40; /* Dark text for card content */
                    border: none; /* Remove default card border */
                }
                .admin-card-header-custom {
                    background-color: #e9ecef;
                    color: #495057;
                    font-weight: 600;
                    border-bottom: 1px solid #dee2e6;
                }
                .form-control-location {
                    border-left: none; /* Align with InputGroup.Text */
                }
                .save-button-custom {
                    font-size: 1.1rem;
                    font-weight: 600;
                    border-radius: 0.5rem;
                }
            `}</style>
        </Container>
    );
};

export default LocationsManager;