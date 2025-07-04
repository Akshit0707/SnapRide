import React, { useEffect, useState } from "react";
import { Button, Form, InputGroup, Card, Spinner, Container, Row, Col } from "react-bootstrap"; // Added Card, Spinner, Container, Row, Col
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import Swal from "sweetalert2";
import { FaPlus, FaTrashAlt, FaSave, FaCar, FaMotorcycle } from "react-icons/fa"; // Added icons

// Reusable Loading Spinner component
const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" variant="success">
            <span className="visually-hidden">{message}</span>
        </Spinner>
        <p className="ms-3 mb-0 text-muted">{message}</p>
    </div>
);

const VehicleBrands = () => {
    const [category, setCategory] = useState("cars");
    const [brands, setBrands] = useState({});
    const [newBrand, setNewBrand] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // New state for save button loading

    useEffect(() => {
        loadBrands(category);
    }, [category]);

    const loadBrands = async (selectedCategory) => {
        setIsLoading(true);
        const docId = selectedCategory === "bikes" ? "bike-brands" : "brands";
        try {
            const docSnap = await getDoc(doc(db, "vehicle", docId));
            if (docSnap.exists()) {
                // Firebase stores data as objects. When retrieving, ensure it's an object.
                // If brands are stored as an array of strings like ["Toyota", "Honda"], you need to convert it to an object {0: "Toyota", 1: "Honda"} for your current state structure.
                // Assuming brands are already stored as { "0": "BrandA", "1": "BrandB" } in Firestore.
                setBrands(docSnap.data().brands || {});
            } else {
                setBrands({});
            }
        } catch (err) {
            console.error("Error loading brands:", err);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Failed to load brands. Please try again."
            });
        }
        setIsLoading(false);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setBrands((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleAddNewButton = () => {
        if (!newBrand.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Empty Field",
                text: "Brand name cannot be empty."
            });
            return;
        }

        const normalizedNewBrand = newBrand.trim().toLowerCase(); // Normalize for existence check

        // Check for duplicates (case-insensitive)
        const isDuplicate = Object.values(brands).some(
            (existingBrand) => existingBrand.toLowerCase() === normalizedNewBrand
        );

        if (isDuplicate) {
            Swal.fire({
                icon: "info",
                title: "Duplicate Brand",
                text: `${newBrand.trim()} already exists in the list.`
            });
            return;
        }

        // Find the next available index
        const existingKeys = Object.keys(brands).map(Number).filter(key => !isNaN(key));
        const nextIndex = existingKeys.length > 0 ? Math.max(...existingKeys) + 1 : 0;

        setBrands((prev) => ({
            ...prev,
            [nextIndex]: newBrand.trim(),
        }));
        setNewBrand(""); // Clear input after adding
    };

    const handleRemoveButton = (keyToRemove) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545", // Danger color
            cancelButtonColor: "#6c757d", // Secondary color
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                setBrands((prev) => {
                    const updated = { ...prev };
                    delete updated[keyToRemove];
                    // Reindex to maintain sequential numeric keys
                    const reindexed = {};
                    Object.values(updated).forEach((name, idx) => {
                        reindexed[idx] = name;
                    });
                    return reindexed;
                });
                Swal.fire("Deleted!", "The brand has been removed from the list. Don't forget to save changes!", "success");
            }
        });
    };

    const handleSaveChangesSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true); // Use isSaving for the button feedback

        const docId = category === "bikes" ? "bike-brands" : "brands";
        try {
            await setDoc(doc(db, "vehicle", docId), { brands });
            Swal.fire("Success!", "All changes saved!", "success");
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong while saving changes!"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Container fluid className="vehicle-brands-manager-container">
            <Row className="justify-content-center">
                <Col xs={12} md={10} lg={8} xl={7}> {/* Centered and width-controlled */}
                    <h1 className="mb-4 text-center admin-panel-heading">Vehicle Brands Management</h1>

                    {/* Category Toggle Buttons */}
                    <Card className="mb-4 shadow-sm vehicle-brands-card">
                        <Card.Body className="d-flex justify-content-center p-3">
                            <div className="btn-group category-toggle-group" role="group">
                                <Button
                                    variant={category === "cars" ? "success" : "outline-secondary"} // Use success for active
                                    onClick={() => setCategory("cars")}
                                    className="d-flex align-items-center justify-content-center gap-2 py-2 px-4"
                                >
                                    <FaCar /> Car Brands
                                </Button>
                                <Button
                                    variant={category === "bikes" ? "success" : "outline-secondary"}
                                    onClick={() => setCategory("bikes")}
                                    className="d-flex align-items-center justify-content-center gap-2 py-2 px-4"
                                >
                                    <FaMotorcycle /> Bike Brands
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Main Brands Management Card */}
                    <Card className="shadow-sm p-3 p-md-4 mb-5 vehicle-brands-card">
                        <Card.Body>
                            <Card.Title as="h2" className="mb-4 text-center admin-sub-heading">
                                Manage {category === "cars" ? "Car" : "Bike"} Brands
                            </Card.Title>

                            {isLoading ? (
                                <LoadingSpinner message={`Loading ${category} brands...`} />
                            ) : (
                                <Form onSubmit={handleSaveChangesSubmit}>
                                    <div className="brands-list-section mb-4">
                                        {Object.keys(brands).length > 0 ? (
                                            Object.entries(brands).map(([key, value]) => (
                                                <InputGroup key={key} className="mb-3 brand-item-input">
                                                    <Form.Control
                                                        type="text"
                                                        name={key}
                                                        value={value}
                                                        onChange={handleInputChange}
                                                        placeholder="Brand Name..."
                                                        className="brand-input-control"
                                                    />
                                                    <Button
                                                        variant="outline-danger" // outline for remove
                                                        type="button"
                                                        onClick={() => handleRemoveButton(key)}
                                                        className="remove-brand-button"
                                                    >
                                                        <FaTrashAlt className="me-2" /> Remove
                                                    </Button>
                                                </InputGroup>
                                            ))
                                        ) : (
                                            <p className="text-center text-muted py-3">No brands available for {category}. Add new ones below!</p>
                                        )}
                                    </div>

                                    <hr className="my-4" /> {/* Separator */}

                                    <Card.Title as="h3" className="mb-3 text-center admin-sub-heading">Add New Brand</Card.Title>
                                    <InputGroup className="mb-4 add-new-brand-input">
                                        <Form.Control
                                            type="text"
                                            value={newBrand}
                                            onChange={(e) => setNewBrand(e.target.value)}
                                            placeholder={`Enter new ${category === "cars" ? "car" : "bike"} brand name...`}
                                            className="new-brand-input-control"
                                        />
                                        <Button
                                            variant="success"
                                            type="button"
                                            onClick={handleAddNewButton}
                                            className="add-brand-button"
                                            disabled={!newBrand.trim()} // Disable if input is empty
                                        >
                                            <FaPlus className="me-2" /> Add Brand
                                        </Button>
                                    </InputGroup>

                                    <div className="text-center">
                                        <Button
                                            variant="primary" // Changed to primary for save
                                            type="submit"
                                            className="px-5 py-2 fw-bold save-changes-button"
                                            disabled={isLoading || isSaving} // Disable while loading or saving
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave className="me-2" /> Save All Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default VehicleBrands;