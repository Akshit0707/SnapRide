import React, { useEffect, useState, useRef } from "react";
import { Button, Form, InputGroup, Card, Spinner, Container, Row, Col, ListGroup } from "react-bootstrap";
import { doc, setDoc, getDoc } from "firebase/firestore"; // getDoc is needed for fetchBrands/Models within useFetchData.js
import { db } from "../../config/firebase";
import Swal from "sweetalert2";
import { FaCar, FaMotorcycle, FaPlus, FaTrashAlt, FaSave } from "react-icons/fa";

// IMPORTANT: Ensure this import path is correct for your project ---
import { fetchBrands, fetchModels } from "../../hooks/useFetchData";

// Reusable Loading Spinner Component (can be moved to a shared file if desired)
const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" variant="success">
            <span className="visually-hidden">{message}</span>
        </Spinner>
        <p className="ms-3 mb-0 text-muted">{message}</p>
    </div>
);

const VehicleModels = () => {
    const [category, setCategory] = useState("cars"); // "cars" or "bikes"
    const [isLoading, setIsLoading] = useState(true); // Start as true to show spinner on initial load
    const [isSaving, setIsSaving] = useState(false); // State for save button loading
    const [brands, setBrands] = useState({}); // Stores { brandId: "BrandName" }
    const [models, setModels] = useState({}); // Stores { parentKey: { brandId: "...", models: { 0: "ModelA" } } }

    const [newModelBrandId, setNewModelBrandId] = useState(""); // For "Create New Brand Group" section
    const [newModelNameForNewBrand, setNewModelNameForNewBrand] = useState(""); // For "Create New Brand Group" section

    const addModelRefs = useRef({}); // Refs for "Add Model" input fields for existing brands

    useEffect(() => {
        setIsLoading(true);
        Promise.all([fetchBrands(category), fetchModels(category)])
            .then(([brandsData, modelsData]) => {
                setBrands(brandsData || {}); // Ensure brandsData is an object
                setModels(modelsData || {}); // Ensure modelsData is an object
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to load brands and models. Please try again."
                });
            })
            .finally(() => setIsLoading(false));
    }, [category]);

    // Handles changes to existing model names
    const handleExistingModelInputChange = (event, parentKey, modelKey) => {
        const { value } = event.target;
        setModels(prev => ({
            ...prev,
            [parentKey]: {
                ...prev[parentKey],
                models: {
                    ...prev[parentKey].models,
                    [modelKey]: value // Update specific model by its key
                }
            }
        }));
    };

    // Handles adding a new model to an EXISTING brand group
    const handleAddNewModelToExistingBrand = (parentKey) => {
        const inputRef = addModelRefs.current[parentKey];
        const newModelValue = inputRef ? inputRef.value.trim() : "";

        if (!newModelValue) {
            Swal.fire({ icon: "warning", title: "Empty Field", text: "Model name cannot be empty." });
            return;
        }

        // --- FIXED: Replaced optional chaining with logical AND ---
        const currentModels = (models[parentKey] && models[parentKey].models) || {};
        const normalizedNewModel = newModelValue.toLowerCase();

        // Check for duplicates within this brand's models (case-insensitive)
        const isDuplicate = Object.values(currentModels).some(
            (existingModel) => existingModel.toLowerCase() === normalizedNewModel
        );

        if (isDuplicate) {
            Swal.fire({ icon: "info", title: "Duplicate Model", text: `'${newModelValue}' already exists for this brand.` });
            return;
        }

        // Find the next available numerical index for the new model within this brand's models
        const existingModelKeys = Object.keys(currentModels).map(Number).filter(key => !isNaN(key));
        const nextModelIndex = existingModelKeys.length > 0
            ? Math.max(...existingModelKeys) + 1
            : 0;

        setModels(prev => ({
            ...prev,
            [parentKey]: {
                ...prev[parentKey],
                models: {
                    ...currentModels,
                    [nextModelIndex]: newModelValue
                }
            }
        }));

        if (inputRef) inputRef.value = ""; // Clear the input field after adding
    };

    // Handles removing a model from an existing brand group
    const handleRemoveModel = (parentKey, modelKey) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This model will be removed from the list. You must save changes to apply.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545", // Bootstrap danger red
            cancelButtonColor: "#6c757d", // Bootstrap secondary gray
            confirmButtonText: "Yes, remove it!"
        }).then((result) => {
            if (result.isConfirmed) {
                setModels(prev => {
                    const updatedModels = { ...prev };
                    // --- FIXED: Replaced optional chaining with logical AND ---
                    const modelGroup = (updatedModels[parentKey] && updatedModels[parentKey].models);

                    if (!modelGroup) return updatedModels; // Should not happen, but for safety

                    // Delete the specific model
                    delete modelGroup[modelKey];

                    // If no models left for this brand, remove the entire brand group (top-level key)
                    if (Object.keys(modelGroup).length === 0) {
                        delete updatedModels[parentKey];
                    } else {
                        // Reindex models within this brand group to maintain sequential numeric keys
                        const reindexedModels = {};
                        Object.values(modelGroup).forEach((modelName, i) => {
                            reindexedModels[i] = modelName;
                        });
                        updatedModels[parentKey] = { ...updatedModels[parentKey], models: reindexedModels };
                    }
                    return updatedModels;
                });
                Swal.fire("Removed!", "Model removed from list. Don't forget to save changes!", "success");
            }
        });
    };

    // Handles creating a new brand entry with its first model
    const handleCreateNewBrandModelGroup = () => {
        if (!newModelBrandId || !newModelNameForNewBrand.trim()) {
            Swal.fire({ icon: "warning", title: "Missing Info", text: "Please select a brand and enter a model name." });
            return;
        }

        // Check if this brand already exists in the models structure (to avoid duplicate brand groups)
        const brandAlreadyHasModels = Object.values(models).some(
            (modelGroup) => String(modelGroup.brandId) === String(newModelBrandId)
        );

        if (brandAlreadyHasModels) {
            Swal.fire({
                icon: "info",
                title: "Brand Exists",
                text: "Models for this brand are already listed above. Please use the 'Add' button for that brand."
            });
            return;
        }

        // Find the next available numerical parent key for the new brand group
        const existingParentKeys = Object.keys(models).map(Number).filter(key => !isNaN(key));
        const nextParentKey = existingParentKeys.length > 0 ? Math.max(...existingParentKeys) + 1 : 0;

        setModels(prev => ({
            ...prev,
            [nextParentKey]: {
                brandId: newModelBrandId,
                models: {
                    0: newModelNameForNewBrand.trim() // First model gets key 0
                }
            }
        }));

        setNewModelBrandId("");
        setNewModelNameForNewBrand("");
        Swal.fire("Added!", "New brand group created. Don't forget to save changes!", "success");
    };

    const handleSaveChangesSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const docId = category === "bikes" ? "bike-models" : "models";
        try {
            await setDoc(doc(db, "vehicle", docId), { models });
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

    // Filter brands that don't yet have a model group in the current 'models' state
    const availableBrandsForNewGroup = Object.entries(brands).filter(([brandKey]) =>
        !Object.values(models).some(modelGroup => String(modelGroup.brandId) === String(brandKey))
    );


    return (
        <Container fluid className="vehicle-models-manager-container">
            <Row className="justify-content-center">
                <Col xs={12} md={10} lg={9} xl={8}>
                    <h1 className="mb-4 text-center admin-panel-heading">Vehicle Models Management</h1>

                    {/* Category Toggle Buttons */}
                    <Card className="mb-4 shadow-sm vehicle-models-card">
                        <Card.Body className="d-flex justify-content-center p-3">
                            <div className="btn-group category-toggle-group" role="group">
                                <Button
                                    variant={category === "cars" ? "success" : "outline-secondary"}
                                    onClick={() => setCategory("cars")}
                                    className="d-flex align-items-center justify-content-center gap-2 py-2 px-4"
                                >
                                    <FaCar /> Car Models
                                </Button>
                                <Button
                                    variant={category === "bikes" ? "success" : "outline-secondary"}
                                    onClick={() => setCategory("bikes")}
                                    className="d-flex align-items-center justify-content-center gap-2 py-2 px-4"
                                >
                                    <FaMotorcycle /> Bike Models
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {isLoading ? (
                        <LoadingSpinner message={`Loading ${category} models...`} />
                    ) : (
                        <Form onSubmit={handleSaveChangesSubmit}>
                            {/* Display Existing Models by Brand */}
                            <Card className="shadow-sm p-3 p-md-4 mb-4 vehicle-models-card">
                                <Card.Body>
                                    <Card.Title as="h2" className="mb-4 text-center admin-sub-heading">
                                        Edit Existing Models
                                    </Card.Title>
                                    {Object.keys(models).length > 0 ? (
                                        // Sort models by brand name for a more organized display
                                        Object.entries(models)
                                            .sort(([, a], [, b]) => {
                                                const brandNameA = brands[String(a.brandId)] || "Unknown Brand";
                                                const brandNameB = brands[String(b.brandId)] || "Unknown Brand";
                                                return brandNameA.localeCompare(brandNameB);
                                            })
                                            .map(([parentKey, modelGroup]) => {
                                            // Basic validation for modelGroup structure
                                            if (!modelGroup || typeof modelGroup !== "object" || !modelGroup.models) return null;

                                            const brandId = String(modelGroup.brandId);
                                            const brandName = brands[brandId] || "Unknown Brand";

                                            return (
                                                <div key={parentKey} className="mb-4 p-3 border rounded model-group-item">
                                                    <h3 className="fs-5 fw-bold mb-3 d-flex align-items-center">
                                                        <FaCar className="me-2 text-primary" /> {brandName} Models
                                                    </h3>
                                                    <ListGroup variant="flush">
                                                        {/* Sort individual models alphabetically for a clean list */}
                                                        {Object.entries(modelGroup.models)
                                                            .sort(([, a], [, b]) => a.localeCompare(b))
                                                            .map(([modelKey, modelName]) => (
                                                            <ListGroup.Item key={modelKey} className="d-flex align-items-center p-0 mb-2 model-list-item">
                                                                <InputGroup className="flex-grow-1">
                                                                    <Form.Control
                                                                        type="text"
                                                                        name={modelKey}
                                                                        value={modelName}
                                                                        onChange={(e) => handleExistingModelInputChange(e, parentKey, modelKey)}
                                                                        placeholder="Model Name..."
                                                                        className="model-input-control"
                                                                    />
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        type="button"
                                                                        onClick={() => handleRemoveModel(parentKey, modelKey)}
                                                                        className="remove-model-button"
                                                                    >
                                                                        <FaTrashAlt />
                                                                    </Button>
                                                                </InputGroup>
                                                            </ListGroup.Item>
                                                        ))}
                                                    </ListGroup>
                                                    <InputGroup className="mt-3 add-model-input-group">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={`Add new model for ${brandName}...`}
                                                            ref={(el) => (addModelRefs.current[parentKey] = el)}
                                                            className="new-model-input-control"
                                                        />
                                                        <Button
                                                            variant="success"
                                                            type="button"
                                                            onClick={() => handleAddNewModelToExistingBrand(parentKey)}
                                                            className="add-model-button"
                                                            // --- FIXED: Replaced optional chaining with logical AND ---
                                                            disabled={!(addModelRefs.current[parentKey] && addModelRefs.current[parentKey].value && addModelRefs.current[parentKey].value.trim())}
                                                        >
                                                            <FaPlus className="me-2" /> Add
                                                        </Button>
                                                    </InputGroup>
                                                </div>
                                            );
                                        })// The semicolon at the end of map call, as requested by previous error
                                    ) : (
                                        <p className="text-center text-muted py-3">No models found for {category}. You can create new groups below!</p>
                                    )}
                                </Card.Body>
                            </Card>

                            <hr className="my-5" /> {/* Separator */}

                            {/* Create New Brand Group with First Model */}
                            <Card className="shadow-sm p-3 p-md-4 mb-5 vehicle-models-card">
                                <Card.Body>
                                    <Card.Title as="h2" className="mb-4 text-center admin-sub-heading">
                                        Create New Brand Group
                                    </Card.Title>
                                    
                                    <InputGroup className="mb-3 create-new-group-input">
                                        <Form.Select
                                            value={newModelBrandId}
                                            onChange={(e) => setNewModelBrandId(e.target.value)}
                                            className="brand-select-control"
                                        >
                                            <option value="">Select a brand...</option>
                                            {availableBrandsForNewGroup.length > 0 ? (
                                                availableBrandsForNewGroup.map(([key, name]) => (
                                                    <option key={key} value={key}>
                                                        {name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option disabled>No new brands available</option>
                                            )}
                                        </Form.Select>
                                        <Form.Control
                                            type="text"
                                            value={newModelNameForNewBrand}
                                            onChange={(e) => setNewModelNameForNewBrand(e.target.value)}
                                            placeholder="Enter first model name..."
                                            className="new-model-name-input-control"
                                        />
                                        <Button
                                            variant="primary"
                                            type="button"
                                            onClick={handleCreateNewBrandModelGroup}
                                            className="create-group-button"
                                            disabled={!newModelBrandId || !newModelNameForNewBrand.trim()}
                                        >
                                            <FaPlus className="me-2" /> Create Group
                                        </Button>
                                    </InputGroup>
                                </Card.Body>
                            </Card>

                            {/* Save All Changes Button */}
                            <div className="text-center mt-5 mb-4">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="px-5 py-2 fw-bold save-changes-button"
                                    disabled={isLoading || isSaving}
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
                </Col>
            </Row>
        </Container>
    );
};

export default VehicleModels;