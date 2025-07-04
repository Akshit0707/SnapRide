import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Container, Row, Col, Form, ListGroup, Button, Spinner, Card
} from "react-bootstrap";
import {
  TbEngine, TbManualGearbox,
} from "react-icons/tb";
import {
  BsCarFront, BsFillCarFrontFill, BsFillFuelPumpFill,
} from "react-icons/bs";
import { PiEngineFill } from "react-icons/pi";
import { MdOutlineDateRange } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrands, fetchModels, fetchVehicles, fetchLocations,
} from "../hooks/useFetchData";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { addDoc, collection, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useTheme } from '../context/ThemeContext';

const VehicleDetail = () => {
  const dispatch = useDispatch();
  const user = useSelector(({ UserSlice }) => UserSlice.user);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { category, vehicleBrand, vehicleModel, vehicleId } = useParams();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState(null); // Now holds the specific vehicle data
  const [brands, setBrands] = useState(null);
  const [models, setModels] = useState(null);
  const [locations, setLocations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [selectedLocations, setSelectedLocations] = useState({ pickup: "", dropoff: "" });
  const [rentDate, setRentDate] = useState({
    start: getDateByInputFormat(),
    end: getDateByInputFormat(1),
  });

  const [reservationCompleted, setReservationCompleted] = useState(false);

  function getDateByInputFormat(dayOffset = 0, date = null) {
    const currentDate = date ? new Date(date) : new Date();
    if (dayOffset === 0) return currentDate.toISOString().split("T")[0];
    const offsetDate = new Date(currentDate);
    offsetDate.setDate(currentDate.getDate() + dayOffset);
    return offsetDate.toISOString().split("T")[0];
  }

  function getRentalDays() {
    const start = new Date(rentDate.start);
    const end = new Date(rentDate.end);
    if (start.getTime() > end.getTime()) {
      return 0; // Invalid date range
    }
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const getEffectiveStockCount = (vehicleData) => {
    if (!vehicleData) return 0;
    if (vehicleData.vehicleCount !== undefined) {
        return vehicleData.vehicleCount;
    }
    if (category === 'cars' && vehicleData.carCount !== undefined) {
      return vehicleData.carCount;
    }
    if (category === 'bikes' && vehicleData.bikeCount !== undefined) {
      return vehicleData.bikeCount;
    }
    return vehicleData.stockCount || 0;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const singularCategory = category.slice(0, -1);

        const [fetchedBrands, fetchedModels, fetchedVehiclesCollection, fetchedLocations] = await Promise.all([
          fetchBrands(singularCategory),
          fetchModels(singularCategory),
          fetchVehicles(category),
          fetchLocations(),
        ]);

        const specificVehicle = fetchedVehiclesCollection ? fetchedVehiclesCollection[vehicleId] : null;

        setBrands(fetchedBrands);
        setModels(fetchedModels);
        setVehicles(specificVehicle);
        setLocations(fetchedLocations);

        if (!specificVehicle) {
            console.warn("WARN (VehicleDetail): Vehicle data for ID", vehicleId, "not found in category", category);
            setFetchError(`The selected ${singularCategory} was not found.`);
        }

      } catch (error) {
        console.error("Error fetching data in VehicleDetail:", error);
        setFetchError(`Failed to load ${category.slice(0, -1)} details. Please check your internet connection and try again.`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [vehicleId, category]);

  const handleReserveButtonClick = async () => {
    if (!(user && user.email)) {
      Swal.fire({
        title: "Authentication Required",
        text: "Please log in to make a reservation.",
        icon: "info",
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) navigate("/login");
      });
      return;
    }

    if (!vehicles) {
      Swal.fire({
        icon: "error",
        title: `${category.slice(0, -1)} not found!`,
        text: `This ${category.slice(0, -1)} doesn't exist in our records.`,
      });
      return;
    }

    if (Object.values(selectedLocations).some((v) => v === "")) {
      const message = Object.values(selectedLocations).every((v) => v === "")
        ? "Please choose locations!"
        : selectedLocations.pickup === ""
          ? "Please choose a pick-up location!"
          : "Please choose a drop-off location!";
      Swal.fire({ title: message, icon: "warning" });
      return;
    }

    if (getRentalDays() <= 0) {
        Swal.fire({ title: "Please select valid rental dates!", icon: "warning" });
        return;
    }

    if (getEffectiveStockCount(vehicles) <= 0) {
      Swal.fire({
        title: "Out of Stock",
        text: `This ${category.slice(0, -1)} is currently not available for rent.`,
        icon: "warning",
      });
      return;
    }

    const amount = (vehicles.pricePerDay || 500) * getRentalDays() * 100;

    const options = {
      key: "rzp_test_d1fqVsre2AEPX4",
      amount,
      currency: "INR",
      name: "SnapRide Rentals",
      description: `${category.slice(0, -1)} Reservation Payment`,
      handler: async function (response) {
        try {
          const singularCategory = category.slice(0, -1);
          const vehicleDocRef = doc(db, "vehicle", category);
          const currentVehiclesCollectionSnap = await getDoc(vehicleDocRef);

          if (!currentVehiclesCollectionSnap.exists()) {
              throw new Error("Vehicle collection not found in Firestore!");
          }
          const currentVehiclesCollectionData = currentVehiclesCollectionSnap.data();
          const currentVehicleData = currentVehiclesCollectionData[vehicleId];

          if (!currentVehicleData) {
              throw new Error("Specific vehicle not found in the collection!");
          }

          const updatedVehicleData = { ...currentVehicleData };

          if (updatedVehicleData.vehicleCount !== undefined) {
              updatedVehicleData.vehicleCount = Math.max(0, (updatedVehicleData.vehicleCount || 1) - 1);
          } else if (category === 'cars' && updatedVehicleData.carCount !== undefined) {
              updatedVehicleData.carCount = Math.max(0, (updatedVehicleData.carCount || 1) - 1);
          } else if (category === 'bikes' && updatedVehicleData.bikeCount !== undefined) {
              updatedVehicleData.bikeCount = Math.max(0, (updatedVehicleData.bikeCount || 1) - 1);
          } else {
              updatedVehicleData.stockCount = Math.max(0, (updatedVehicleData.stockCount || 1) - 1);
          }

          const newCollectionData = {
              ...currentVehiclesCollectionData,
              [vehicleId]: updatedVehicleData
          };

          await setDoc(vehicleDocRef, newCollectionData);

          setVehicles(updatedVehicleData);

          const reservationData = {
            reservationOwner: user.email,
            vehicleId,
            vehicleBrand: vehicleBrand,
            vehicleModel: vehicleModel,
            category: singularCategory,
            startDate: rentDate.start,
            endDate: rentDate.end,
            pickupLocation: selectedLocations.pickup,
            dropoffLocation: selectedLocations.dropoff,
            paymentId: response.razorpay_payment_id,
            timestamp: new Date(),
            totalAmount: amount / 100,
          };

          await addDoc(collection(db, "rentals"), reservationData);

          setReservationCompleted(true);

          Swal.fire("Reservation Successful", `Your ${singularCategory} has been reserved!`, "success");
        } catch (err) {
          console.error("Error after payment:", err);
          Swal.fire("Error", "Reservation failed after payment. Please try again.", "error");
        }
      },
      prefill: {
        name: user.displayName || "Customer",
        email: user.email,
      },
      theme: {
        color: isDark ? "#20C997" : "#007bff",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const vehicle = vehicles;
  const singularCategoryPrefix = category.slice(0, -1);

  const vehicleBrandName = brands && vehicle ? brands[`${singularCategoryPrefix}-${String(vehicle.brandId)}`] : vehicleBrand;
  const vehicleModelName = (models && vehicle && models[`${singularCategoryPrefix}-${String(vehicle.brandId)}`] && models[`${singularCategoryPrefix}-${String(vehicle.brandId)}`][String(vehicle.modelId)])
    ? (models[`${singularCategoryPrefix}-${String(vehicle.brandId)}`][String(vehicle.modelId)] || vehicleModel).toUpperCase() // Capitalize here
    : (vehicleModel || '').toUpperCase(); // Capitalize fallback as well

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant={isDark ? 'info' : 'primary'}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3" style={{ color: isDark ? '#ADD8E6' : 'var(--bs-primary)' }}>Loading {category.slice(0, -1)} details...</p>
        </div>
      );
    }

    if (fetchError) {
      return <p className="text-danger text-center fw-bold">{fetchError}</p>;
    }

    if (!vehicle) {
      return <p className="text-danger text-center fw-bold">This {category.slice(0, -1)} was not found!</p>;
    }

    const currentStock = getEffectiveStockCount(vehicle);

    // Theme-dependent colors
    const iconColor = isDark ? '#20C997' : '#007bff'; // Primary/accent color for icons
    const textColor = isDark ? '#E0E0E0' : '#555555'; // General text color, slightly darker for light mode
    const headingColor = isDark ? '#ADD8E6' : '#333333'; // For h1/h2/h3
    const sectionBgColor = isDark ? '#1a1a1a' : '#FFFFFF'; // Card background
    const borderColor = isDark ? '#444444' : '#EBEBEB'; // Card and divider border
    const listGroupItemBg = isDark ? '#2a2a2a' : '#F7F7F7'; // List item background
    const listGroupItemBorder = isDark ? '#3a3a3a' : '#EFEFEF'; // List item border
    const inputBgColor = isDark ? '#333333' : '#FFFFFF'; // Form input/select background
    const inputBorderColor = isDark ? '#555555' : '#D0D0D0'; // Form input/select border
    const inputTextColor = isDark ? '#E0E0E0' : '#333333'; // Form input/select text

    return (
      <Card
        className="p-4 shadow-lg rounded-3"
        style={{
          backgroundColor: sectionBgColor,
          border: `1px solid ${borderColor}`,
          transition: 'all 0.3s ease-in-out',
          boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.5)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Card.Body>
          <Row className="align-items-center mb-4">
            <Col md={6} className="text-center mb-3 mb-md-0">
              <div
                className="image-container rounded-3 overflow-hidden shadow-sm"
                style={{
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#000' : '#f0f0f0',
                  border: `1px solid ${borderColor}`,
                }}
              >
                <LazyLoadImage
                  src={vehicle.image}
                  alt={`${vehicleBrandName} / ${vehicleModelName}`}
                  className="img-fluid"
                  effect="blur"
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                  placeholderSrc="https://placehold.co/600x400/cccccc/ffffff?text=Loading..."
                />
              </div>
            </Col>
            <Col md={6}>
              <h2 className="fw-bold mb-3" style={{ color: headingColor }}>
                {vehicleBrandName} {vehicleModelName}
              </h2>
              <ListGroup variant="flush" className="rounded-2" style={{ border: `1px solid ${borderColor}` }}>
                <ListGroup.Item
                  className="d-flex align-items-center"
                  style={{ backgroundColor: listGroupItemBg, color: textColor, borderBottom: `1px solid ${listGroupItemBorder}` }}
                >
                  <BsFillCarFrontFill size={20} className="me-3" style={{ color: iconColor }} />
                  Vehicle Type: {category === 'cars' ? 'Car' : 'Bike'}
                </ListGroup.Item>
                <ListGroup.Item
                  className="d-flex align-items-center"
                  style={{ backgroundColor: listGroupItemBg, color: textColor, borderBottom: `1px solid ${listGroupItemBorder}` }}
                >
                  <TbEngine size={20} className="me-3" style={{ color: iconColor }} />
                  Horsepower: {vehicle.power || 'N/A'} HP
                </ListGroup.Item>
                <ListGroup.Item
                  className="d-flex align-items-center"
                  style={{ backgroundColor: listGroupItemBg, color: textColor, borderBottom: `1px solid ${listGroupItemBorder}` }}
                >
                  <PiEngineFill size={20} className="me-3" style={{ color: iconColor }} />
                  Engine Size: {vehicle.engineSize || 'N/A'} cc
                </ListGroup.Item>
                <ListGroup.Item
                  className="d-flex align-items-center"
                  style={{ backgroundColor: listGroupItemBg, color: textColor, borderBottom: `1px solid ${listGroupItemBorder}` }}
                >
                  <TbManualGearbox size={20} className="me-3" style={{ color: iconColor }} />
                  Gearbox: {vehicle.gearbox || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item
                  className="d-flex align-items-center"
                  style={{ backgroundColor: listGroupItemBg, color: textColor, borderBottom: `1px solid ${listGroupItemBorder}` }}
                >
                  <BsCarFront size={20} className="me-3" style={{ color: iconColor }} />
                  Body Type: {vehicle.bodyType || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item
                  className="d-flex align-items-center"
                  style={{ backgroundColor: listGroupItemBg, color: textColor, borderBottom: `1px solid ${listGroupItemBorder}` }}
                >
                  <BsFillFuelPumpFill size={20} className="me-3" style={{ color: iconColor }} />
                  Fuel Type: {vehicle.fuelType || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item
                  className="d-flex align-items-center"
                  style={{ backgroundColor: listGroupItemBg, color: textColor }}
                >
                  <MdOutlineDateRange size={20} className="me-3" style={{ color: iconColor }} />
                  Model Year: {vehicle.year || 'N/A'}
                </ListGroup.Item>
              </ListGroup>
              <div className="mt-3 text-end">
                <h5 className="fw-bold" style={{ color: iconColor }}>
                  Price per day: ₹{vehicle.pricePerDay || 0}
                </h5>
                <p className={`fw-bold mb-0 ${currentStock > 0 ? "text-success" : "text-danger"}`} style={{ fontSize: '1.1rem', color: textColor }}>
                  Available Stock: {currentStock}
                </p>
              </div>
            </Col>
          </Row>

          <hr className="my-5" style={{ borderColor: borderColor }} />

          <h3 className="fw-bold mb-4" style={{ color: headingColor }}>
            Book Your Ride
          </h3>
          <Row className="g-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold" style={{ color: textColor }}>Pick-Up Location</Form.Label>
                <Form.Select
                  value={selectedLocations.pickup}
                  onChange={(e) => setSelectedLocations({ ...selectedLocations, pickup: e.target.value })}
                  className="form-control-lg"
                  style={{
                    backgroundColor: inputBgColor,
                    color: inputTextColor,
                    borderColor: inputBorderColor,
                    boxShadow: isDark ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
                  }}
                >
                  <option value="" style={{ color: isDark ? '#AAA' : '#888' }}>Select pick-up location</option>
                  {locations && Object.entries(locations).map(([locKey, locValue]) => (
                    <option key={locKey} value={locKey} style={{ backgroundColor: isDark ? '#333' : '#FFF', color: inputTextColor }}>
                      {locValue}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold" style={{ color: textColor }}>Drop-Off Location</Form.Label>
                <Form.Select
                  value={selectedLocations.dropoff}
                  onChange={(e) => setSelectedLocations({ ...selectedLocations, dropoff: e.target.value })}
                  className="form-control-lg"
                  style={{
                    backgroundColor: inputBgColor,
                    color: inputTextColor,
                    borderColor: inputBorderColor,
                    boxShadow: isDark ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
                  }}
                >
                  <option value="" style={{ color: isDark ? '#AAA' : '#888' }}>Select drop-off location</option>
                  {locations && Object.entries(locations).map(([locKey, locValue]) => (
                    <option key={locKey} value={locKey} style={{ backgroundColor: isDark ? '#333' : '#FFF', color: inputTextColor }}>
                      {locValue}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold" style={{ color: textColor }}>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={rentDate.start}
                  onChange={(e) => setRentDate({ ...rentDate, start: e.target.value })}
                  className="form-control-lg"
                  style={{
                    backgroundColor: inputBgColor,
                    color: inputTextColor,
                    borderColor: inputBorderColor,
                    boxShadow: isDark ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold" style={{ color: textColor }}>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={rentDate.end}
                  onChange={(e) => setRentDate({ ...rentDate, end: e.target.value })}
                  className="form-control-lg"
                  style={{
                    backgroundColor: inputBgColor,
                    color: inputTextColor,
                    borderColor: inputBorderColor,
                    boxShadow: isDark ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-5 pt-3 border-top" style={{ borderColor: borderColor }}>
            <div className="total-price fw-bold mb-3 mb-md-0" style={{ fontSize: '1.4rem', color: headingColor }}>
              Total Price: <span style={{ color: iconColor }}>₹{getRentalDays() * (vehicle.pricePerDay || 0)}</span>
            </div>
            <Button
              variant={isDark ? 'success' : 'primary'}
              onClick={handleReserveButtonClick}
              disabled={reservationCompleted || (currentStock <= 0) || getRentalDays() <= 0 || !selectedLocations.pickup || !selectedLocations.dropoff}
              className="px-5 py-3 rounded-pill fw-bold"
              style={{
                transition: 'all 0.3s ease',
                backgroundColor: isDark ? '#20C997' : '#007bff',
                borderColor: isDark ? '#20C997' : '#007bff',
                color: 'white', // Ensure button text is white for both modes
                // Hover styles directly here for better control, or use a pseudo-class in a CSS module
                '--bs-btn-hover-bg': isDark ? '#1AA07B' : '#0056b3',
                '--bs-btn-hover-border-color': isDark ? '#1AA07B' : '#0056b3',
                opacity: (reservationCompleted || (currentStock <= 0) || getRentalDays() <= 0 || !selectedLocations.pickup || !selectedLocations.dropoff) ? 0.6 : 1,
                cursor: (reservationCompleted || (currentStock <= 0) || getRentalDays() <= 0 || !selectedLocations.pickup || !selectedLocations.dropoff) ? 'not-allowed' : 'pointer',
              }}
            >
              {reservationCompleted ? "Reserved ✅" : (currentStock <= 0) ? "Out of Stock" : "Reserve Now (Pay)"}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div
      id="vehicle-detail"
      style={{
        backgroundColor: isDark ? '#0A0A0A' : '#F8F8F8', // Main section background
        minHeight: '100vh',
        paddingTop: '2rem',
        paddingBottom: '2rem',
        transition: 'background-color 0.3s ease-in-out',
      }}
    >
      <Container>
        {renderContent()}
      </Container>
    </div>
  );
};

export default VehicleDetail;