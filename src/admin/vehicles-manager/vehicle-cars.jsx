import React, { useEffect, useState } from 'react';
import { Accordion, Button, Form, InputGroup, Nav, Tab, Container, Row, Col, Spinner, Card } from "react-bootstrap";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import Swal from "sweetalert2";
import Select from "react-select"; // Make sure react-select is installed: npm install react-select
import { FaCar, FaMotorcycle, FaPlus, FaTrashAlt, FaSave, FaEye } from "react-icons/fa"; // Make sure react-icons is installed: npm install react-icons

// IMPORTANT: Ensure this import path is correct for your project ---
import { fetchBrands, fetchModels, fetchVehicles, fetchLocations } from "../../hooks/useFetchData";

// Reusable Loading Spinner Component (can be moved to a shared file if desired)
const LoadingSpinner = ({ message = "Loading data..." }) => (
    <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" variant="success">
            <span className="visually-hidden">{message}</span>
        </Spinner>
        <p className="ms-3 mb-0 text-muted">{message}</p>
    </div>
);

const VehicleManagement = () => {

    const [category, setCategory] = useState("cars"); // State to track the active tab
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // New state for save button loading
    const [vehicles, setVehicles] = useState(null); // This state will hold either 'cars' or 'bikes' data
    const [isChangesCompleted, setIsChangesCompleted] = useState(false); // Renamed from isChangesSaved
    const [brands, setBrands] = useState(null);
    const [models, setModels] = useState(null);
    const [modelsByBrandId, setModelsByBrandId] = useState(null); // Models filtered by selected brand in "Add New" form
    const [selectedNewVehicleModel, setSelectedNewVehicleModel] = useState(""); // Selected model ID for "Add New" form
    const [locations, setLocations] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    // This useEffect will re-fetch all data whenever the 'category' state changes.
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setVehicles(null); // Clear previous data
            setBrands(null);
            setModels(null);
            setModelsByBrandId(null);
            setSelectedNewVehicleModel(""); // Reset selected model
            setFetchError(null);

            try {
                // Fetch data based on the current category
                const [fetchedBrands, fetchedModels, fetchedVehicles, fetchedLocations] = await Promise.all([
                    fetchBrands(category),
                    fetchModels(category),
                    fetchVehicles(category),
                    fetchLocations() // Assuming locations are universal and fetched once
                ]);

                // console.log(`Fetched Brands for ${category}:`, fetchedBrands);
                // console.log(`Fetched Models for ${category}:`, fetchedModels);
                // console.log(`Fetched Vehicles for ${category}:`, fetchedVehicles);
                // console.log("Fetched Locations:", fetchedLocations);

                setBrands(fetchedBrands || {}); // Ensure it's an object
                setModels(fetchedModels || {}); // Ensure it's an object
                setVehicles(fetchedVehicles || {}); // Ensure it's an object
                setLocations(fetchedLocations || {}); // Ensure it's an object

            } catch (error) {
                console.error("Error fetching data:", error);
                setFetchError("Failed to load data. Please check your internet connection or try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [category]); // Re-run effect when category changes

    // Effect to trigger Firebase upload when changes are completed
    useEffect(() => {
        if (isChangesCompleted && vehicles) {
            uploadDocToFirebase();
            setIsChangesCompleted(false); // Reset the flag
        }
    }, [vehicles, isChangesCompleted]); // Depend on vehicles and isChangesCompleted

    const handleBrandChange = (e) => {
        const selectedBrandId = parseInt(e.target.value); // Convert to number to match Firebase data type
        setSelectedNewVehicleModel(""); // Clear selected model when brand changes

        if (!isNaN(selectedBrandId) && models) {
            // Find the correct model group by brandId from the fetched 'models' state
            // Use String() for comparison as keys from objects can be strings
            const modelGroup = Object.values(models).find(group => String(group.brandId) === String(selectedBrandId));
            if (modelGroup && modelGroup.models) {
                setModelsByBrandId(modelGroup.models);
            } else {
                setModelsByBrandId(null); // No models for this brand
            }
        } else {
            setModelsByBrandId(null); // No brand selected or models not loaded
        }
    };

    const handleSaveChangesButton = async event => {
        event.preventDefault();
        setIsSaving(true); // Indicate saving is in progress
        setIsChangesCompleted(true); // Trigger the useEffect to upload
    };

    const uploadDocToFirebase = async () => {
        const docId = category === "bikes" ? "bikes" : "cars";
        try {
            await setDoc(doc(db, "vehicle", docId), vehicles);
            Swal.fire({
                title: "Good job!",
                text: `All ${category} data saved successfully!`,
                icon: "success"
            });
        } catch (err) {
            console.error("Error saving document to Firebase:", err);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong while saving changes! " + err.message
            });
        } finally {
            setIsSaving(false); // End saving state
        }
    };

    const handleAddNewSubmit = async event => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const newVehicle = {};
        const selectedLocations = [];

        // Basic validation for new vehicle form
        if (!selectedNewVehicleModel || !formData.get("image") || !formData.get("vehicleCount") || !formData.get("year") || !formData.get("pricePerDay")) {
            Swal.fire({
                icon: "warning",
                title: "Missing Info",
                text: "Please fill in all required fields (Model, Image, Count, Year, Price Per Day)."
            });
            return;
        }

        for (let [name, value] of formData.entries()) {
            if (name === "availableLocations") {
                selectedLocations.push(value);
            } else if (["brandId", "vehicleCount", "year"].includes(name)) { // modelId handled separately below
                newVehicle[name] = value ? parseInt(value) || 0 : "";
            } else if (["pricePerDay"].includes(name)) {
                newVehicle[name] = value ? parseFloat(value) || 0 : "";
            } else {
                newVehicle[name] = value;
            }
        }
        newVehicle.availableLocations = selectedLocations;
        newVehicle.modelId = selectedNewVehicleModel ? parseInt(selectedNewVehicleModel) || 0 : ""; // Use state for modelId

        // Determine the next available numerical index for the new vehicle
        const existingVehicleKeys = vehicles ? Object.keys(vehicles).map(Number).filter(key => !isNaN(key)) : [];
        const newVehicleIndex = existingVehicleKeys.length > 0
            ? Math.max(...existingVehicleKeys) + 1
            : 0;

        setVehicles((prevState) => ({
            ...prevState,
            [newVehicleIndex]: newVehicle,
        }));

        form.reset();
        setModelsByBrandId(null); // Reset model dropdown
        setSelectedNewVehicleModel(""); // Reset selected model
        Swal.fire("Added!", "New vehicle added to list. Don't forget to save changes!", "success");
    };

    const handleRemoveButton = (keyToRemove) => {
        Swal.fire({
            title: "Are you sure?",
            text: `This ${category.slice(0, -1)} will be removed from the list. You must save changes to apply.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, remove it!"
        }).then((result) => {
            if (result.isConfirmed) {
                setVehicles(current => {
                    const copy = { ...current };
                    delete copy[keyToRemove];
                    // Optional: Re-index keys if you need them to be sequential after deletion
                    const reindexedCopy = {};
                    Object.values(copy).forEach((item, idx) => {
                        reindexedCopy[idx] = item;
                    });
                    return reindexedCopy;
                });
                Swal.fire("Removed!", `${category.slice(0, -1)} removed from list. Don't forget to save changes!`, "success");
            }
        });
    };

    const handleInputChange = (event, index) => {
        let name;
        let value;

        if (Array.isArray(event)) { // Case for react-select (multi-select)
            name = "availableLocations";
            value = event.map(option => option.value);
        } else if (event && event.target) { // Case for standard input/select
            name = event.target.name;
            value = event.target.value;
        } else {
            return; // Invalid event
        }

        setVehicles(current => ({
            ...current,
            [index]: {
                ...current[index],
                [name]: (["brandId", "modelId", "vehicleCount", "year"].includes(name))
                    ? (value ? parseInt(value) || 0 : '') // Convert to int or empty string
                    : (name === "pricePerDay" ? parseFloat(value) || 0 : value) // Convert to float or empty string
            }
        }));
    };

    const handleDisplayImage = imgUrl => {
        Swal.fire({
            imageUrl: imgUrl,
            imageWidth: "100%", // Adjust as needed
            imageAlt: `${category} Image`,
            customClass: {
                popup: 'swal2-image-popup' // Add a custom class for potential CSS overrides
            }
        });
    };

    const isDataLoaded = vehicles !== null && brands !== null && models !== null && locations !== null && !isLoading;

    return (
        <Container fluid className="admin-panel-container py-5">
            <Row className="justify-content-center">
                <Col xs={12} md={10} lg={9} xl={8}>
                    <h1 className="mb-4 text-center admin-panel-heading">Vehicle Management</h1>

                    {/* Category Toggle Buttons */}
                    <Card className="mb-4 shadow-sm vehicle-manager-card">
                        <Card.Body className="d-flex justify-content-center p-3">
                            <Nav
                                variant="tabs"
                                activeKey={category}
                                onSelect={(selectedKey) => setCategory(selectedKey)}
                                className="category-toggle-group" // Custom class for styling
                            >
                                <Nav.Item>
                                    <Nav.Link eventKey="cars" className="vehicle-tab-link rounded-start-pill d-flex align-items-center gap-2 px-4 py-2">
                                        <FaCar /> Car Management
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="bikes" className="vehicle-tab-link rounded-end-pill d-flex align-items-center gap-2 px-4 py-2">
                                        <FaMotorcycle /> Bike Management
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Body>
                    </Card>

                    {fetchError ? (
                        <div className="alert alert-danger text-center p-3 shadow-sm">{fetchError}</div>
                    ) : isLoading || !isDataLoaded ? (
                        <LoadingSpinner message={`Loading ${category} data...`} />
                    ) : (
                        <Tab.Content className="p-0"> {/* No extra padding as Card.Body handles it */}
                            <Tab.Pane eventKey={category} className="fade show active">
                                {/* Existing Vehicles Section */}
                                <Card className="shadow-sm p-3 p-md-4 mb-4 vehicle-manager-card">
                                    <Card.Body>
                                        <Card.Title as="h2" className="mb-4 text-center admin-sub-heading">
                                            Edit Existing {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </Card.Title>
                                        {Object.keys(vehicles).length === 0 ? (
                                            <div className="alert alert-info text-center py-3">
                                                No existing {category} found. Please use the form below to add one!
                                            </div>
                                        ) : (
                                            <Accordion alwaysOpen className="vehicle-accordion">
                                                {Object.entries(vehicles).map(([key, item]) => {
                                                    const currBrandName = brands[item.brandId] || 'Unknown Brand';

                                                    let currModelName = 'Unknown Model';
                                                    const modelGroup = Object.values(models).find(group => String(group.brandId) === String(item.brandId));
                                                    if (modelGroup && modelGroup.models) {
                                                        // Ensure modelId is treated as a string for lookup if model keys are strings
                                                        currModelName = modelGroup.models[String(item.modelId)] || 'Unknown Model';
                                                    }

                                                    return (
                                                        <Accordion.Item key={key} eventKey={key} className="mb-3 border rounded accordion-item-custom">
                                                            <Accordion.Header className="accordion-header-custom">
                                                                <h3 className="fs-5 fw-bold mb-0 text-truncate">
                                                                    {currBrandName} / {currModelName}
                                                                </h3>
                                                            </Accordion.Header>
                                                            <Accordion.Body>
                                                                {/* Vehicle Properties */}
                                                                <Form.Group className="mb-3">
                                                                    <InputGroup className="my-1">
                                                                        <InputGroup.Text className="form-label-fixed-width">Brand</InputGroup.Text>
                                                                        <Form.Select
                                                                            name="brandId"
                                                                            value={item.brandId}
                                                                            onChange={event => handleInputChange(event, key)}
                                                                            className="form-control-custom"
                                                                        >
                                                                            <option value="">Select a Brand...</option>
                                                                            {brands && Object.entries(brands).map(([brandKey, brandValue]) =>
                                                                                <option value={brandKey} key={brandKey}>{brandValue}</option>
                                                                            )}
                                                                        </Form.Select>
                                                                    </InputGroup>
                                                                    <InputGroup className="my-1">
                                                                        <InputGroup.Text className="form-label-fixed-width">Model</InputGroup.Text>
                                                                        <Form.Select
                                                                            name="modelId"
                                                                            value={item.modelId}
                                                                            onChange={event => handleInputChange(event, key)}
                                                                            className="form-control-custom"
                                                                        >
                                                                            <option value="">Select a Model...</option>
                                                                            {
                                                                                modelGroup && modelGroup.models && Object.entries(modelGroup.models).map(([modelId, modelName]) =>
                                                                                    <option value={modelId} key={`${item.brandId}-${modelId}`}>{modelName}</option>
                                                                                )
                                                                            }
                                                                        </Form.Select>
                                                                    </InputGroup>
                                                                    <InputGroup className="my-1">
                                                                        <InputGroup.Text className="form-label-fixed-width">Image URL</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="text"
                                                                            name="image"
                                                                            value={item.image || ''}
                                                                            onChange={event => handleInputChange(event, key)}
                                                                            className="form-control-custom"
                                                                        />
                                                                        {item.image && (
                                                                            <Button variant="outline-info" onClick={() => handleDisplayImage(item.image)} className="image-preview-button">
                                                                                <FaEye className="me-1" /> See
                                                                            </Button>
                                                                        )}
                                                                    </InputGroup>
                                                                    <InputGroup className="my-1">
                                                                        <InputGroup.Text className="form-label-fixed-width">Power</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="text"
                                                                            name="power"
                                                                            value={item.power || ''}
                                                                            onChange={event => handleInputChange(event, key)}
                                                                            className="form-control-custom"
                                                                        />
                                                                    </InputGroup>
                                                                    <InputGroup className="my-1">
                                                                        <InputGroup.Text className="form-label-fixed-width">Engine</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="text"
                                                                            name="engineSize"
                                                                            value={item.engineSize || ''}
                                                                            onChange={event => handleInputChange(event, key)}
                                                                            className="form-control-custom"
                                                                        />
                                                                    </InputGroup>
                                                                    <InputGroup className="my-1">
                                                                        <InputGroup.Text className="form-label-fixed-width">Gearbox</InputGroup.Text>
                                                                        <Form.Select
                                                                            name="gearbox"
                                                                            value={item.gearbox || ''}
                                                                            onChange={event => handleInputChange(event, key)}
                                                                            className="form-control-custom"
                                                                        >
                                                                            <option value="">Select Gearbox...</option>
                                                                            <option value="Manual">Manual</option>
                                                                            <option value="Automatic">Automatic</option>
                                                                        </Form.Select>
                                                                    </InputGroup>
                                                                    {/* Body Type only for Cars, not Bikes, so conditional render */}
                                                                    {category === "cars" && (
                                                                        <InputGroup className="my-1">
                                                                            <InputGroup.Text className="form-label-fixed-width">Body</InputGroup.Text>
                                                                            <Form.Select name="bodyType" value={item.bodyType || ''} onChange={event => handleInputChange(event, key)} className="form-control-custom">
                                                                                <option value="">Select Body Type...</option>
                                                                                <option value="Sedan">Sedan</option>
                                                                                <option value="Hatchback">Hatchback</option>
                                                                                <option value="Convertible">Convertible</option>
                                                                                <option value="SUV">SUV</option>
                                                                                <option value="Coupe">Coupe</option>
                                                                                <option value="Station Wagon">Station Wagon</option>
                                                                            </Form.Select>
                                                                        </InputGroup>
                                                                    )}
                                                                    {/* Body Type options for Bikes */}
                                                                    {category === "bikes" && (
                                                                        <InputGroup className="my-1">
                                                                            <InputGroup.Text className="form-label-fixed-width">Type</InputGroup.Text>
                                                                            <Form.Select name="bodyType" value={item.bodyType || ''} onChange={event => handleInputChange(event, key)} className="form-control-custom">
                                                                                <option value="">Select Bike Type...</option>
                                                                                <option value="Regular">Regular</option>
                                                                                <option value="Cruiser">Cruiser</option>
                                                                                <option value="Sports">Sports</option>
                                                                                <option value="Scooty">Scooty</option>
                                                                            </Form.Select>
                                                                        </InputGroup>
                                                                    )}
                                                                    <InputGroup className="my-1">
                                                                        <InputGroup.Text className="form-label-fixed-width">Fuel</InputGroup.Text>
                                                                        <Form.Select
                                                                            name="fuelType"
                                                                            value={item.fuelType || ''}
                                                                            onChange={event => handleInputChange(event, key)}
                                                                            className="form-control-custom"
                                                                        >
                                                                            <option value="">Select Fuel Type...</option>
                                                                            <option value="Gas">Gas</option>
                                                                            <option value="Diesel">Diesel</option>
                                                                            <option value="Hybrid">Hybrid</option>
                                                                            <option value="Electric">Electric</option> {/* Added Electric */}
                                                                        </Form.Select>
                                                                    </InputGroup>
                                                                    <InputGroup className="my-1">
                                                                        <InputGroup.Text className="form-label-fixed-width">Count</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            name="vehicleCount"
                                                                            value={item.vehicleCount || 0}
                                                                            onChange={event => handleInputChange(event, key)}
                                                                            className="form-control-custom"
                                                                        />
                                                                    </InputGroup>
                                                                    <InputGroup className="my-1">
                                                                        <InputGroup.Text className="form-label-fixed-width">Locations</InputGroup.Text>
                                                                        <Select
                                                                            isMulti
                                                                            name="availableLocations"
                                                                            value={item.availableLocations && locations ?
                                                                                item.availableLocations.map(locKey => ({ label: locations[locKey], value: locKey })) : []
                                                                            }
                                                                            options={Object.entries(locations).map(([key, value]) => ({ label: value, value: key }))}
                                                                            className="react-select-container flex-grow-1" // Use flex-grow-1 to fill space
                                                                            classNamePrefix="react-select"
                                                                            onChange={event => handleInputChange(event, key)}
                                                                        />
                                                                    </InputGroup>
                                                                    <InputGroup className="my-1">
                                                                        <InputGroup.Text className="form-label-fixed-width">Year</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            name="year"
                                                                            value={item.year || ''}
                                                                            onChange={event => handleInputChange(event, key)}
                                                                            className="form-control-custom"
                                                                        />
                                                                    </InputGroup>
                                                                    <InputGroup className="my-1">
                                                                        <InputGroup.Text className="form-label-fixed-width">Price/Day (₹)</InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            step="0.01"
                                                                            name="pricePerDay"
                                                                            value={item.pricePerDay || ''}
                                                                            onChange={event => handleInputChange(event, key)}
                                                                            className="form-control-custom"
                                                                        />
                                                                    </InputGroup>
                                                                </Form.Group>
                                                                <Button variant="danger" className="w-100 mt-2 d-flex align-items-center justify-content-center gap-2" onClick={() => handleRemoveButton(key)}>
                                                                    <FaTrashAlt /> Remove {category.slice(0, -1)}
                                                                </Button>
                                                            </Accordion.Body>
                                                        </Accordion.Item>
                                                    );
                                                })}
                                            </Accordion>
                                        )}
                                    </Card.Body>
                                </Card>

                                {/* Add New Vehicle Section */}
                                <Card className="shadow-sm p-3 p-md-4 mb-5 vehicle-manager-card">
                                    <Card.Body>
                                        <Card.Title as="h2" className="mb-4 text-center admin-sub-heading">
                                            Add a New {category.charAt(0).toUpperCase() + category.slice(1, -1)}
                                        </Card.Title>
                                        <Form onSubmit={handleAddNewSubmit}>
                                            <Form.Group className="mb-3">
                                                <InputGroup className="my-1">
                                                    <InputGroup.Text className="form-label-fixed-width">Brand <span className="text-danger">*</span></InputGroup.Text>
                                                    <Form.Select name="brandId" onChange={handleBrandChange} required defaultValue="" className="form-control-custom">
                                                        <option value="">Select a Brand...</option>
                                                        {brands && Object.entries(brands).map(([key, value]) =>
                                                            <option value={key} key={key}>{value}</option>
                                                        )}
                                                    </Form.Select>
                                                </InputGroup>
                                                <InputGroup className="my-1">
                                                    <InputGroup.Text className="form-label-fixed-width">Model <span className="text-danger">*</span></InputGroup.Text>
                                                    <Form.Select name="modelId" required value={selectedNewVehicleModel} onChange={e => setSelectedNewVehicleModel(e.target.value)} className="form-control-custom">
                                                        <option value="">Select a Model...</option>
                                                        {
                                                            modelsByBrandId && Object.entries(modelsByBrandId).map(([key, value]) =>
                                                                <option value={key} key={key}>{value}</option>
                                                            )
                                                        }
                                                    </Form.Select>
                                                </InputGroup>
                                                <InputGroup className="my-1">
                                                    <InputGroup.Text className="form-label-fixed-width">Image URL <span className="text-danger">*</span></InputGroup.Text>
                                                    <Form.Control type="text" name="image" required className="form-control-custom" />
                                                </InputGroup>
                                                <InputGroup className="my-1">
                                                    <InputGroup.Text className="form-label-fixed-width">Engine</InputGroup.Text>
                                                    <Form.Control type="text" name="engineSize" className="form-control-custom" />
                                                </InputGroup>

                                                <InputGroup className="my-1">
                                                    <InputGroup.Text className="form-label-fixed-width">Gearbox</InputGroup.Text>
                                                    <Form.Select name="gearbox" defaultValue="" className="form-control-custom">
                                                        <option value="">Select Gearbox...</option>
                                                        <option value="Manual">Manual</option>
                                                        <option value="Automatic">Automatic</option>
                                                    </Form.Select>
                                                </InputGroup>

                                                {/* Conditional Body Type for Cars */}
                                                {category === "cars" && (
                                                    <InputGroup className="my-1">
                                                        <InputGroup.Text className="form-label-fixed-width">Body</InputGroup.Text>
                                                        <Form.Select name="bodyType" defaultValue="" className="form-control-custom">
                                                            <option value="">Select Body Type...</option>
                                                            <option value="Sedan">Sedan</option>
                                                            <option value="Hatchback">Hatchback</option>
                                                            <option value="Convertible">Convertible</option>
                                                            <option value="SUV">SUV</option>
                                                            <option value="Coupe">Coupe</option>
                                                            <option value="Station Wagon">Station Wagon</option>
                                                        </Form.Select>
                                                    </InputGroup>
                                                )}
                                                {/* Conditional Body Type for Bikes */}
                                                {category === "bikes" && (
                                                    <InputGroup className="my-1">
                                                        <InputGroup.Text className="form-label-fixed-width">Type</InputGroup.Text>
                                                        <Form.Select name="bodyType" defaultValue="" className="form-control-custom">
                                                            <option value="">Select Bike Type...</option>
                                                            <option value="Regular">Regular</option>
                                                            <option value="Cruiser">Cruiser</option>
                                                            <option value="Sports">Sports</option>
                                                            <option value="Scooty">Scooty</option>
                                                        </Form.Select>
                                                    </InputGroup>
                                                )}

                                                <InputGroup className="my-1">
                                                    <InputGroup.Text className="form-label-fixed-width">Fuel</InputGroup.Text>
                                                    <Form.Select name="fuelType" defaultValue="" className="form-control-custom">
                                                        <option value="">Select Fuel Type...</option>
                                                        <option value="Gas">Gas</option>
                                                        <option value="Diesel">Diesel</option>
                                                        <option value="Hybrid">Hybrid</option>
                                                        <option value="Electric">Electric</option>
                                                    </Form.Select>
                                                </InputGroup>
                                                <InputGroup className="my-1">
                                                    <InputGroup.Text className="form-label-fixed-width">Count <span className="text-danger">*</span></InputGroup.Text>
                                                    <Form.Control type="number" name="vehicleCount" required className="form-control-custom" />
                                                </InputGroup>
                                                <InputGroup className="my-1">
                                                    <InputGroup.Text className="form-label-fixed-width">Locations <span className="text-danger">*</span></InputGroup.Text>
                                                    <Select
                                                        isMulti
                                                        name="availableLocations"
                                                        options={locations && Object.entries(locations).map(([key, value]) => ({ label: value, value: key }))}
                                                        className="react-select-container flex-grow-1"
                                                        classNamePrefix="react-select"
                                                        required
                                                    />
                                                </InputGroup>
                                                <InputGroup className="my-1">
                                                    <InputGroup.Text className="form-label-fixed-width">Year <span className="text-danger">*</span></InputGroup.Text>
                                                    <Form.Control type="number" name="year" required className="form-control-custom" />
                                                </InputGroup>

                                                <InputGroup className="my-1">
                                                    <InputGroup.Text className="form-label-fixed-width">Price/Day (₹) <span className="text-danger">*</span></InputGroup.Text>
                                                    <Form.Control type="number" name="pricePerDay" step="0.01" required className="form-control-custom" />
                                                </InputGroup>
                                            </Form.Group>
                                            <Button className="w-100 mt-3 d-flex align-items-center justify-content-center gap-2" variant="primary" type="submit">
                                                <FaPlus /> Add New {category.slice(0, -1)}
                                            </Button>
                                        </Form>
                                    </Card.Body>
                                </Card>

                                {/* Save All Changes Button */}
                                <div className="text-center mt-5 mb-4">
                                    <Button
                                        variant="success"
                                        type="button"
                                        onClick={handleSaveChangesButton}
                                        className="px-5 py-2 fw-bold save-changes-button"
                                        disabled={isLoading || isSaving} // Disable while loading data or saving
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
                            </Tab.Pane>
                        </Tab.Content>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default VehicleManagement;