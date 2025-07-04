import React, { useEffect, useState } from 'react';
import { Accordion, Button, Card, Col, Form, InputGroup, ListGroup, Row, Container, Spinner } from "react-bootstrap";
import {
    fetchVehicles,
    fetchLocations,
    fetchReservations,
    fetchBrands,
    fetchModels,
} from "../../hooks/useFetchData";
import { BsCarFront, BsFillCarFrontFill, BsFillFuelPumpFill } from "react-icons/bs";
import { TbEngine, TbManualGearbox } from "react-icons/tb";
import { PiEngineFill } from "react-icons/pi";
import { MdOutlineAirlineSeatReclineExtra } from "react-icons/md";
import { FaUser, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign, FaTrashAlt, FaMotorcycle, FaInfoCircle, FaRupeeSign } from "react-icons/fa";
import { doc, getDocs, deleteDoc, query, collection, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import Swal from "sweetalert2";

// Reusable Loading Spinner Component (moved here for consistency)
const LoadingSpinner = ({ message = "Loading data..." }) => (
    <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" variant="success">
            <span className="visually-hidden">{message}</span>
        </Spinner>
        <p className="ms-3 mb-0 text-muted">{message}</p>
    </div>
);

const RentalsManager = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [cars, setCars] = useState({});
    const [bikes, setBikes] = useState({});
    const [locations, setLocations] = useState({});
    const [brands, setBrands] = useState({});
    const [models, setModels] = useState({});
    const [reservations, setReservations] = useState(null);

    // Helper function to group reservations by owner's email
    const groupReservationsWithSameOwner = (allReservations) => {
        return allReservations.reduce((acc, curr) => {
            let key = curr["reservationOwner"];
            if (!acc[key]) acc[key] = [];
            acc[key].push(curr);
            return acc;
        }, {});
    }

    // ---
    // Fetch all necessary data for the component
    // ---
    useEffect(() => {
        setIsLoading(true); // Start loading when component mounts or re-fetches
        Promise.all([
            fetchVehicles("cars"),
            fetchVehicles("bikes"),
            fetchLocations(),
            fetchReservations(),
            fetchBrands("cars"),
            fetchBrands("bikes"),
            fetchModels("cars"),
            fetchModels("bikes"),
        ])
        .then(responses => {
            const [carsData, bikesData, locationsData, reservationsData, carBrandsData, bikeBrandsData, carModelsRawData, bikeModelsRawData] = responses;

            setCars(carsData || {});
            setBikes(bikesData || {});
            setLocations(locationsData || {});

            // Process and combine brands using plural category names as prefixes
            const allFetchedBrands = {};
            const processBrands = (brandsData, prefix) => {
                if (brandsData) {
                    Object.entries(brandsData).forEach(([k, v]) => {
                        allFetchedBrands[`${prefix}-${String(k)}`] = v;
                    });
                }
            };
            processBrands(carBrandsData, "cars");
            processBrands(bikeBrandsData, "bikes");
            setBrands(allFetchedBrands);

            // Process and combine models using plural category names as prefixes
            const combinedModels = {};
            const processModelsData = (rawModelsData, prefix, targetObj) => {
                if (!rawModelsData || typeof rawModelsData !== 'object') {
                    return;
                }
                for (const [internalKey, brandModelGroup] of Object.entries(rawModelsData)) {
                    let actualBrandId;
                    let modelsContent;
                    if (brandModelGroup && typeof brandModelGroup === 'object' && brandModelGroup.brandId !== undefined && brandModelGroup.models !== undefined) {
                        actualBrandId = String(brandModelGroup.brandId);
                        modelsContent = brandModelGroup.models;
                    } else { // Handle older structure where models might be directly under an internalKey
                        actualBrandId = String(internalKey);
                        modelsContent = brandModelGroup;
                    }
                    let processedModelsForBrand = {};
                    if (Array.isArray(modelsContent)) {
                        modelsContent.forEach((modelName, index) => {
                            processedModelsForBrand[String(index)] = modelName;
                        });
                    } else if (modelsContent && typeof modelsContent === 'object') {
                        processedModelsForBrand = modelsContent;
                    }
                    // Use a unique key for the combinedModels object
                    const combinedKey = `${prefix}-${actualBrandId}`;
                    targetObj[combinedKey] = {
                        ...(targetObj[combinedKey] || {}), // Preserve existing models if any
                        ...processedModelsForBrand,
                    };
                }
            };
            processModelsData(carModelsRawData, "cars", combinedModels);
            processModelsData(bikeModelsRawData, "bikes", combinedModels);
            setModels(combinedModels);

            // Group reservations if data exists
            if (reservationsData && reservationsData.length > 0) {
                setReservations(groupReservationsWithSameOwner(reservationsData));
            } else {
                setReservations({}); // Set to empty object if no reservations
            }

            setIsLoading(false);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            setIsLoading(false);
            setReservations({});
            Swal.fire({
                icon: "error",
                title: "Data Load Error",
                text: "Failed to load rental data. Please check your connection."
            });
        });
    }, []);

    // ---
    // Firestore and data manipulation functions
    // ---
    const handleCancelUserReservations = async (owner) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will cancel ALL reservations for this user and cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33", // Red for destructive action
            cancelButtonColor: "#6c757d", // Grey for cancel
            confirmButtonText: "Yes, cancel all!",
            cancelButtonText: "No, keep them"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const q = query(collection(db, "rentals"), where("reservationOwner", "==", owner));
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                        Swal.fire("No Reservations", "No reservations found for this user.", "info");
                        return;
                    }

                    await Promise.all(querySnapshot.docs.map(doc => deleteDoc(doc.ref)));

                    Swal.fire(
                        "All Reservations Cancelled!",
                        "User's reservations have been successfully removed.",
                        'success'
                    ).then(() => {
                        // Refresh state after deletion for immediate UI update
                        setReservations(prevReservations => {
                            const newReservations = { ...prevReservations };
                            delete newReservations[owner]; // Remove the entire group for this owner
                            return newReservations;
                        });
                    });
                } catch (err) {
                    console.error("Error cancelling user reservations:", err);
                    Swal.fire({
                        icon: "error",
                        title: "Cancellation Failed",
                        text: "Something went wrong while cancelling reservations! " + err.message
                    });
                }
            }
        });
    }

    const handleCancelSpecificReservation = async documentId => {
        Swal.fire({
            title: "Are you sure?",
            text: "This reservation will be cancelled and cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33", // Red for destructive action
            cancelButtonColor: "#6c757d", // Grey for cancel
            confirmButtonText: "Yes, cancel it!",
            cancelButtonText: "No"
        }).then((result) => {
            if (result.isConfirmed) {
                deleteDoc(doc(db, "rentals", documentId))
                    .then(() => {
                        Swal.fire(
                            'Reservation Cancelled!',
                            'The selected reservation has been successfully removed.',
                            'success'
                        ).then(() => {
                            // Update state to remove the specific reservation without full reload
                            setReservations(prevReservations => {
                                const newReservations = { ...prevReservations };
                                // Find the owner group containing this reservation
                                for (const ownerEmail in newReservations) {
                                    const filteredReservations = newReservations[ownerEmail].filter(
                                        (res) => res.documentId !== documentId
                                    );
                                    if (filteredReservations.length === 0) {
                                        delete newReservations[ownerEmail]; // Remove owner group if no reservations left
                                    } else {
                                        newReservations[ownerEmail] = filteredReservations;
                                    }
                                }
                                return newReservations;
                            });
                        });
                    })
                    .catch(err => {
                        console.error("Error cancelling specific reservation:", err);
                        Swal.fire({
                            icon: "error",
                            title: "Cancellation Failed",
                            text: "Something went wrong! " + err.message
                        });
                    });
            }
        });
    }

    // Helper function to resolve brand and model names with robust lookup
    const resolveBrandAndModelNames = (reserveData) => {
        let brandName = "Unknown Brand";
        let modelName = "Unknown Model";

        // 1. Prioritize direct brand/model names from reservation data if available
        //    (This handles cases where the reservation document itself contains these names)
        if (reserveData.vehicleBrand) { // Check if vehicleBrand exists in the reservation data
            brandName = reserveData.vehicleBrand;
        }
        if (reserveData.vehicleModel) { // Check if vehicleModel exists in the reservation data
            modelName = reserveData.vehicleModel;
        }

        // 2. Fallback to lookup using vehicleId, brandId, modelId if direct names are not set
        //    or are still "Unknown" (meaning they weren't directly provided in the reservation)
        if (brandName === "Unknown Brand" || modelName === "Unknown Model") {
            // FIX: Normalize category to match state keys ('cars', 'bikes') from fetchVehicles
            const normalizedCategory = reserveData.category === 'car' ? 'cars' : reserveData.category;
            const sourceCollection = normalizedCategory === 'cars' ? cars : bikes;

            // Ensure vehicleId from reservation is converted to String for lookup in cars/bikes state keys
            const vehicleData = sourceCollection[String(reserveData.vehicleId)];

            if (vehicleData) {
                const categoryPrefix = normalizedCategory; // Use normalized category for prefix
                const prefixedBrandId = `${categoryPrefix}-${String(vehicleData.brandId)}`; // `brandId` is numeric
                const modelId = String(vehicleData.modelId); // `modelId` is numeric

                // Look up the brand name
                if (brands[prefixedBrandId]) {
                    brandName = brands[prefixedBrandId];
                } else {
                    // console.warn(`WARN: Brand name not found for prefixedId: ${prefixedBrandId}`);
                }

                // Look up the model name
                if (models[prefixedBrandId] && models[prefixedBrandId][modelId]) {
                    modelName = models[prefixedBrandId][modelId];
                } else {
                    // console.warn(`WARN: Model name not found for prefixedId: ${prefixedBrandId} and modelId: ${modelId}`);
                }
            } else {
                 // console.warn(`WARN: Vehicle data not found for ID: ${reserveData.vehicleId} in category: ${reserveData.category}`);
            }
        }

        return { brandName, modelName };
    };

    // Helper function to resolve vehicle details from fetched data
    const resolveVehicleDetails = (reserveData) => {
        // FIX: Normalize category to match state keys ('cars', 'bikes')
        const normalizedCategory = reserveData.category === 'car' ? 'cars' : reserveData.category;
        const sourceCollection = normalizedCategory === 'cars' ? cars : bikes;
        // Ensure vehicleId from reservation is converted to String for lookup
        const vehicleData = sourceCollection[String(reserveData.vehicleId)];

        if (!vehicleData) {
            console.warn(`WARN: Vehicle data not found for ID: ${reserveData.vehicleId} in category: ${reserveData.category}`);
            return { // Return default placeholder data
                image: "/no-image.png",
                power: "N/A",
                engineSize: "N/A",
                gearbox: "N/A",
                bodyType: "N/A",
                fuelType: "N/A",
                year: "N/A"
            };
        }
        return vehicleData;
    };

    const isDataReady = reservations !== null && !isLoading;

    return (
        <Container fluid className="admin-panel-container py-5">
            <Row className="justify-content-center">
                <Col xs={12} md={10} lg={9} xl={8}>
                    <h1 className="mb-4 text-center admin-panel-heading">Rentals Management</h1>

                    <Card className="mb-4 shadow-sm vehicle-manager-card">
                        <Card.Body>
                            <Card.Title as="h2" className="mb-4 text-center admin-sub-heading">
                                View Customer Reservations
                            </Card.Title>

                            {
                                isLoading ? (
                                    <LoadingSpinner message="Fetching reservations..." />
                                ) : (
                                    isDataReady && Object.keys(reservations).length > 0 ? (
                                        <Accordion alwaysOpen className="rentals-accordion">
                                            {
                                                Object.entries(reservations)
                                                    .sort(([emailA], [emailB]) => emailA.localeCompare(emailB)) // Sort by user email
                                                    .map(([groupKey, reserveGroup], index) => (
                                                        <Accordion.Item key={index} eventKey={`${index}`} className="mb-3 border rounded shadow-sm accordion-item-custom">
                                                            <Accordion.Header className="accordion-header-custom">
                                                                <h3 className="fs-5 fw-bold mb-0 text-truncate d-flex align-items-center">
                                                                    <FaUser className="me-2 text-primary" />
                                                                    <span>User: </span>
                                                                    <span className="ms-2">{groupKey}</span>
                                                                </h3>
                                                            </Accordion.Header>
                                                            <Accordion.Body>
                                                                <Accordion className="my-2 nested-accordion">
                                                                    {
                                                                        reserveGroup
                                                                            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) // Sort reservations by start date
                                                                            .map((reserveData, subIndex) => {
                                                                            const vehicleDetails = resolveVehicleDetails(reserveData);
                                                                            const { brandName, modelName } = resolveBrandAndModelNames(reserveData);
                                                                            const categoryText = reserveData.category === "cars" || reserveData.category === "car" ? "Car" : "Bike"; // More robust category display

                                                                            return (
                                                                                <Accordion.Item key={reserveData.documentId || `${index}-${subIndex}`} eventKey={`${index}-${subIndex}`} className="mb-2 border rounded sub-accordion-item">
                                                                                    <Accordion.Header className="accordion-header-custom">
                                                                                        <h4 className="fs-6 fw-bold mb-0 text-truncate d-flex align-items-center">
                                                                                            {reserveData.category === "cars" || reserveData.category === "car" ? <BsFillCarFrontFill className="me-2 text-success" /> : <FaMotorcycle className="me-2 text-info" />}
                                                                                            <span>{`${brandName} ${modelName} (${categoryText})`}</span>
                                                                                        </h4>
                                                                                    </Accordion.Header>
                                                                                    <Accordion.Body>
                                                                                        <Row className="g-3"> {/* Use Bootstrap gutter classes */}
                                                                                            <Col xs={12} md={5} className="d-flex justify-content-center align-items-center">
                                                                                                <img src={vehicleDetails.image || "/no-image.png"} alt={`${brandName} ${modelName}`} className="img-fluid rounded shadow-sm vehicle-image-preview" />
                                                                                            </Col>
                                                                                            <Col xs={12} md={7}>
                                                                                                <ListGroup variant="flush" className="vehicle-details-list">
                                                                                                    <ListGroup.Item className="d-flex align-items-center py-2">
                                                                                                        <TbEngine size="1.5em" className="me-3 text-secondary" /><span className="fw-semibold">HP:</span> <span className="ms-auto fw-bold">{vehicleDetails.power}</span>
                                                                                                    </ListGroup.Item>
                                                                                                    <ListGroup.Item className="d-flex align-items-center py-2">
                                                                                                        <PiEngineFill size="1.5em" className="me-3 text-secondary" /><span className="fw-semibold">Engine Size:</span> <span className="ms-auto fw-bold">{vehicleDetails.engineSize}</span>
                                                                                                    </ListGroup.Item>
                                                                                                    <ListGroup.Item className="d-flex align-items-center py-2">
                                                                                                        <TbManualGearbox size="1.5em" className="me-3 text-secondary" /><span className="fw-semibold">Gearbox:</span> <span className="ms-auto fw-bold">{vehicleDetails.gearbox}</span>
                                                                                                    </ListGroup.Item>
                                                                                                    {reserveData.category === 'cars' || reserveData.category === 'car' ? (
                                                                                                        <ListGroup.Item className="d-flex align-items-center py-2">
                                                                                                            <BsCarFront size="1.5em" className="me-3 text-secondary" /><span className="fw-semibold">Body Type:</span> <span className="ms-auto fw-bold">{vehicleDetails.bodyType}</span>
                                                                                                        </ListGroup.Item>
                                                                                                    ) : (
                                                                                                        <ListGroup.Item className="d-flex align-items-center py-2">
                                                                                                            <MdOutlineAirlineSeatReclineExtra size="1.5em" className="me-3 text-secondary" /><span className="fw-semibold">Type:</span> <span className="ms-auto fw-bold">{vehicleDetails.bodyType}</span> {/* 'Body Type' might be 'Bike Type' for bikes */}
                                                                                                        </ListGroup.Item>
                                                                                                    )}
                                                                                                    <ListGroup.Item className="d-flex align-items-center py-2">
                                                                                                        <BsFillFuelPumpFill size="1.5em" className="me-3 text-secondary" /><span className="fw-semibold">Fuel Type:</span> <span className="ms-auto fw-bold">{vehicleDetails.fuelType}</span>
                                                                                                    </ListGroup.Item>
                                                                                                    <ListGroup.Item className="d-flex align-items-center py-2">
                                                                                                        <FaCalendarAlt size="1.5em" className="me-3 text-secondary" /><span className="fw-semibold">Year:</span> <span className="ms-auto fw-bold">{vehicleDetails.year}</span>
                                                                                                    </ListGroup.Item>
                                                                                                </ListGroup>
                                                                                            </Col>
                                                                                        </Row>
                                                                                        <hr className="my-4" />
                                                                                        <Row className="g-3 reservation-details-row">
                                                                                            <Col xs={12} md={6}>
                                                                                                <InputGroup className="my-2">
                                                                                                    <InputGroup.Text className="form-label-fixed-width-lg"><FaMapMarkerAlt className="me-2" />Pick-up Location</InputGroup.Text>
                                                                                                    <Form.Control value={locations[reserveData.pickupLocation] || 'N/A'} disabled className="form-control-custom-disabled" />
                                                                                                </InputGroup>
                                                                                            </Col>
                                                                                            <Col xs={12} md={6}>
                                                                                                <InputGroup className="my-2">
                                                                                                    <InputGroup.Text className="form-label-fixed-width-lg"><FaCalendarAlt className="me-2" />Start Date</InputGroup.Text>
                                                                                                    <Form.Control type="date" value={reserveData.startDate} disabled className="form-control-custom-disabled" />
                                                                                                </InputGroup>
                                                                                            </Col>
                                                                                            <Col xs={12} md={6}>
                                                                                                <InputGroup className="my-2">
                                                                                                    <InputGroup.Text className="form-label-fixed-width-lg"><FaMapMarkerAlt className="me-2" />Drop-off Location</InputGroup.Text>
                                                                                                    <Form.Control value={locations[reserveData.dropoffLocation] || 'N/A'} disabled className="form-control-custom-disabled" />
                                                                                                </InputGroup>
                                                                                            </Col>
                                                                                            <Col xs={12} md={6}>
                                                                                                <InputGroup className="my-2">
                                                                                                    <InputGroup.Text className="form-label-fixed-width-lg"><FaCalendarAlt className="me-2" />End Date</InputGroup.Text>
                                                                                                    <Form.Control type="date" value={reserveData.endDate} disabled className="form-control-custom-disabled" />
                                                                                                </InputGroup>
                                                                                            </Col>
                                                                                            <Col xs={12}>
                                                                                                <InputGroup className="my-2">
                                                                                                    {/* MODIFIED: Changed label to "Price per Day" */}
                                                                                                    <InputGroup.Text className="form-label-fixed-width-lg"><FaRupeeSign className="me-2" />Price per Day</InputGroup.Text>
                                                                                                    {/* MODIFIED: Changed value to reserveData.pricePerDay and currency to "Rs" */}
                                                                                                    <Form.Control value={`Rs ${vehicleDetails.pricePerDay || '0.00'}`} disabled className="form-control-custom-disabled text-success fw-bold" />
                                                                                                </InputGroup>
                                                                                            </Col>
                                                                                        </Row>
                                                                                        <div className="mt-4">
                                                                                            <Button variant="danger" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2" type="button"
                                                                                                onClick={() => handleCancelSpecificReservation(reserveData.documentId)}
                                                                                            >
                                                                                                <FaTrashAlt /> Cancel This Reservation
                                                                                            </Button>
                                                                                        </div>
                                                                                    </Accordion.Body>
                                                                                </Accordion.Item>
                                                                            );
                                                                        })
                                                                    }
                                                                </Accordion>

                                                                <div className="mt-3">
                                                                    <Button variant="danger" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2" type="button"
                                                                        onClick={() => handleCancelUserReservations(groupKey)}
                                                                    >
                                                                        <FaTrashAlt /> Cancel All Reservations for This User
                                                                    </Button>
                                                                </div>
                                                            </Accordion.Body>
                                                        </Accordion.Item>
                                                    ))
                                            }
                                        </Accordion>
                                    ) : (
                                        <div className="alert alert-info text-center py-4 shadow-sm">
                                            <FaInfoCircle className="mb-2" size="2em" /><br/>
                                            No reservations have been made by users yet.
                                        </div>
                                    )
                                )
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RentalsManager;