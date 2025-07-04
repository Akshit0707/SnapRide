import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  ListGroup,
  Tabs,
  Tab,
  Badge,
  Spinner,
} from "react-bootstrap";
import { TbEngine, TbManualGearbox } from "react-icons/tb";
import { BsFillCarFrontFill, BsCarFront, BsFillFuelPumpFill } from "react-icons/bs";
import { PiEngineFill } from "react-icons/pi";
import { MdOutlineLocationOn, MdDateRange } from "react-icons/md";
import { FaMoneyBillWave } from "react-icons/fa";
import {
  fetchVehicles,
  fetchReservations,
  fetchLocations,
  fetchBrands,
  fetchModels,
} from "../../hooks/useFetchData";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import Swal from "sweetalert2";
import { useTheme } from "../../context/ThemeContext";

const MyRentals = () => {
  const { theme } = useTheme();
  const locale = "en";
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector(({ UserSlice }) => UserSlice.user);

  // State for user's full name from Firestore
  const [firestoreUserName, setFirestoreUserName] = useState(null);

  const [activeTab, setActiveTab] = useState("current");

  const cardBg = theme === 'dark' ? '#282828' : '#ffffff';
  const cardBorder = theme === 'dark' ? '1px solid #3a3a3a' : '1px solid #e0e0e0';
  const textColor = theme === 'dark' ? '#E0E0E0' : '#333333';
  const primaryColor = theme === 'dark' ? '#20C997' : '#007bff';
  const secondaryTextColor = theme === 'dark' ? '#b0b0b0' : '#6c757d';

  const [cars, setCars] = useState({}); // { "0": carData1, "1": carData2 }
  const [bikes, setBikes] = useState({}); // { "0": bikeData1, "1": bikeData2 }
  const [brands, setBrands] = useState({}); // { "car-0": "Brand A", "bike-0": "Brand X" }
  const [models, setModels] = useState({}); // { "car-0": { "0": "Model A1", "1": "Model A2" }, "bike-0": { "0": "Model X1" } }
  const [locations, setLocations] = useState({});
  const [current, setCurrent] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60 * 1000);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // --- User Data Fetch (from Firestore, then Redux) ---
        if (user && user.uid) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setFirestoreUserName(userData.name || user.displayName || user.email);
          } else {
            setFirestoreUserName(user.displayName || user.email);
          }
        }

        const [
          carsData,
          bikesData,
          carBrandsData,
          bikeBrandsData,
          carModelsRawData,
          bikeModelsRawData,
          locationsData,
          reservationsData,
        ] = await Promise.all([
          fetchVehicles("cars"),
          fetchVehicles("bikes"),
          fetchBrands("cars"),
          fetchBrands("bikes"),
          fetchModels("cars"),
          fetchModels("bikes"),
          fetchLocations(),
          fetchReservations(user.email),
        ]);

        setCars(carsData || {});
        setBikes(bikesData || {});
        setLocations(locationsData || {});

        // Process Brands
        const allFetchedBrands = {};
        const processBrands = (brandsData, prefix) => {
          if (brandsData) {
            Object.entries(brandsData).forEach(([k, v]) => {
              allFetchedBrands[`${prefix}-${String(k)}`] = v;
            });
          }
        };
        processBrands(carBrandsData, "car");
        processBrands(bikeBrandsData, "bike");
        setBrands(allFetchedBrands);

        // Process Models
        const combinedModels = {};
        const processModelsData = (rawModelsData, prefix, targetObj) => {
          if (!rawModelsData || typeof rawModelsData !== 'object') {
            return;
          }
          // rawModelsData from fetchModels can be in a few formats based on your data:
          // 1. { "0": { brandId: "0", models: { "0": "ModelA", "1": "ModelB" } } } (Newer, preferred)
          // 2. { "0": ["ModelA", "ModelB"] } (Older, where key IS brandId and value is an array)
          // 3. { "0": { "0": "ModelA", "1": "ModelB" } } (Older, where key IS brandId and value is an object)

          for (const [internalKey, brandModelGroup] of Object.entries(rawModelsData)) {
            let actualBrandId;
            let modelsContent;

            // Attempt to parse based on preferred structure (brandId and models fields)
            if (brandModelGroup && typeof brandModelGroup === 'object' && brandModelGroup.brandId !== undefined && brandModelGroup.models !== undefined) {
              actualBrandId = String(brandModelGroup.brandId);
              modelsContent = brandModelGroup.models;
            }
            // Fallback for older structure where internalKey IS brandId
            else {
              actualBrandId = String(internalKey);
              modelsContent = brandModelGroup;
            }

            let processedModelsForBrand = {};
            if (Array.isArray(modelsContent)) {
              // Convert array to object with numeric keys if it's an array
              modelsContent.forEach((modelName, index) => {
                processedModelsForBrand[String(index)] = modelName;
              });
            } else if (modelsContent && typeof modelsContent === 'object') {
              // If it's already an object, use it directly
              processedModelsForBrand = modelsContent;
            } else {
              continue; // Skip if modelsContent is not a valid format
            }

            targetObj[`${prefix}-${actualBrandId}`] = {
              ...(targetObj[`${prefix}-${actualBrandId}`] || {}), // Merge if brand already exists
              ...processedModelsForBrand,
            };
          }
        };

        processModelsData(carModelsRawData, "car", combinedModels);
        processModelsData(bikeModelsRawData, "bike", combinedModels);
        setModels(combinedModels);


        // Process Reservations
        const today = new Date().toISOString().split("T")[0];
        const curr = [];
        const past = [];
        if (reservationsData && Array.isArray(reservationsData)) { // Corrected typo: `reservationsData`
          reservationsData.forEach((r) => {
            const rEndDateString = r.endDate ? String(r.endDate) : '';

            // Consider a booking "completed" if its end date is in the past, or if it's explicitly cancelled
            if (r.status === "cancelled" || (rEndDateString && rEndDateString < today)) {
              past.push(r);
            } else {
              curr.push(r);
            }
          });
        }
        setCurrent(curr);
        setHistory(past);

        // Set active tab based on available bookings
        if (curr.length > 0) {
          setActiveTab("current");
        } else if (past.length > 0) {
          setActiveTab("history");
        } else {
          setActiveTab("current"); // Default to current if no bookings at all
        }

      } catch (error) {
        console.error("Error fetching data for MyRentals:", error);
        // Optionally show an alert to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => clearInterval(timer);
  }, [user.email, user.uid, db]);

  const cancelReservation = async (rentalId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to cancel this booking? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it"
    });

    if (result.isConfirmed) {
      try {
        const rentalToCancel = current.find((r) => r.documentId === rentalId);
        if (!rentalToCancel) {
          Swal.fire("Error", "Booking not found or already cancelled.", "error");
          return;
        }

        const { category, vehicleId } = rentalToCancel;

        // 1. Update the rental status to cancelled
        const rentalDocRef = doc(db, "rentals", rentalId);
        await updateDoc(rentalDocRef, { status: "cancelled" });

        // 2. Update vehicle stock count
        const actualCategoryDocId = category === "car" ? "cars" : category === "bike" ? "bikes" : category;
        const vehicleDocRef = doc(db, "vehicle", actualCategoryDocId);
        const sourceCollection = category === 'cars' ? cars : bikes;
        const vehicleData = sourceCollection[String(vehicleId)]; // Access using the string key

        if (vehicleData) {
          const updatedVehicleData = { ...vehicleData };
          // Increment stock based on likely field names
          if (updatedVehicleData.vehicleCount !== undefined) {
            updatedVehicleData.vehicleCount = (updatedVehicleData.vehicleCount || 0) + 1;
          } else if (updatedVehicleData.stockCount !== undefined) {
            updatedVehicleData.stockCount = (updatedVehicleData.stockCount || 0) + 1;
          } else if (updatedVehicleData.carCount !== undefined) {
            updatedVehicleData.carCount = (updatedVehicleData.carCount || 0) + 1;
          } else if (updatedVehicleData.bikeCount !== undefined) {
            updatedVehicleData.bikeCount = (updatedVehicleData.bikeCount || 0) + 1;
          } else if (updatedVehicleData.availableCount !== undefined) {
            updatedVehicleData.availableCount = (updatedVehicleData.availableCount || 0) + 1;
          } else {
            updatedVehicleData.availableCount = (updatedVehicleData.availableCount || 0) + 1; // Fallback
          }

          // Update the specific field (e.g., "0", "1") within the 'vehicle/cars' or 'vehicle/bikes' document
          await updateDoc(vehicleDocRef, { [String(vehicleId)]: updatedVehicleData });
        } else {
          console.warn(`Could not find vehicle data for category: ${category}, vehicleId: ${vehicleId}. Stock not updated.`);
        }


        // Update local state
        setCurrent((prevCurrent) => prevCurrent.filter((r) => r.documentId !== rentalId));
        setHistory((prevHistory) => [...prevHistory, { ...rentalToCancel, status: "cancelled" }]);

        Swal.fire("Booking Cancelled!", "Your booking has been successfully cancelled and vehicle stock updated.", "success");
      } catch (e) {
        console.error("Cancel reservation error:", e);
        Swal.fire("Error", "Failed to cancel booking. Please try again.", "error");
      }
    } else {
      Swal.fire("Cancellation Aborted", "Your booking is safe!", "info");
    }
  };

  const welcomeMessage = () => {
    let day = date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
    let hour = date.getHours();
    let wish = `Good ${hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening"}, `;
    let time = date.toLocaleTimeString(locale, { hour: "numeric", minute: "numeric", hour12: true });

    const welcomeColor = theme === 'dark' ? '#ADD8E6' : '#333333';
    const displayUserName = firestoreUserName || user.displayName || user.email;

    return (
      <h4 className="mb-4 text-center" style={{ color: welcomeColor, fontWeight: '600', fontSize: '1.8rem' }}>
        <span style={{ display: 'block', marginBottom: '0.5rem' }}>{day} | {time}</span>
        <hr style={{ borderColor: theme === 'dark' ? '#444' : '#eee', width: '50%', margin: '1rem auto' }} />
        {wish}
        <strong style={{ color: theme === 'dark' ? '#20C997' : '#007bff' }}>{displayUserName}</strong>
      </h4>
    );
  };

  const renderCard = (r) => {
    const headingColor = theme === 'dark' ? '#ADD8E6' : '#007bff';
    const iconColor = theme === 'dark' ? '#92B4F4' : '#6c757d';

    const isCancelled = r.status === "cancelled";
    // Check if the current date is AFTER the reservation end date
    const today = new Date().toISOString().split("T")[0];
    const isPastEndDate = r.endDate && String(r.endDate) < today;

    let statusBadgeBg;
    let statusBadgeText;
    if (isCancelled) {
      statusBadgeBg = "danger";
      statusBadgeText = "CANCELLED";
    } else if (isPastEndDate) {
      statusBadgeBg = "info"; // Use info for completed
      statusBadgeText = "COMPLETED";
    } else {
      statusBadgeBg = "success";
      statusBadgeText = "ACTIVE";
    }

    const isCar = (r.category === "cars" || r.category === "car");
const sourceCollection = isCar ? cars : bikes; // This will be your 'cars' state
const lookupId = String(r.vehicleId); // This will be "1" (as a string)
const vehicleData = sourceCollection[lookupId];
    // console.log(`--- Rendering Card for Booking ID: ${r.documentId} ---`);
    // console.log(`Reservation Raw Data:`, r);
    // console.log(`Resolved Category: ${r.category}`);
    // console.log(`Vehicle ID from Reservation (r.vehicleId): ${r.vehicleId}`);
    // console.log(`Lookup Key (String(r.vehicleId)): ${lookupId}`);
    // console.log(`Is this a car booking? ${isCar}`);
    // console.log(`Source Collection (${r.category}):`, sourceCollection);
    // console.log(`Vehicle Data found (sourceCollection[lookupId]):`, vehicleData);
    // if (!vehicleData) {
    //     console.warn(`No vehicle data found for ${r.category} with ID ${lookupId}. Displaying reservation data fallback.`);
    // } else {
    //     console.log(`Vehicle Data Image URL:`, vehicleData.image);
    //     console.log(`Vehicle Data Brand ID:`, vehicleData.brandId);
    //     console.log(`Vehicle Data Model ID:`, vehicleData.modelId);
    // }

    let brandName = "Unknown Brand";
    let modelName = "Unknown Model";
    let power = "N/A", engineSize = "N/A", gearbox = "N/A", bodyType = "N/A", fuelType = "N/A", pricePerDay = "N/A", imageUrl = "/no-image.png";

    if (vehicleData) {
      // --- Prioritize vehicleData for details if found ---
      const brandIdFromVehicle = (vehicleData.brandId !== undefined) ? String(vehicleData.brandId) : null;
      const prefixedBrandId = brandIdFromVehicle ? `${r.category}-${brandIdFromVehicle}` : null;

      // Try to get brand/model from fetched 'brands' and 'models' first
      if (prefixedBrandId && brands[prefixedBrandId]) {
        brandName = brands[prefixedBrandId];
        const modelIdFromVehicle = (vehicleData.modelId !== undefined) ? String(vehicleData.modelId) : null;
        const brandModels = models[prefixedBrandId];
        if (brandModels && typeof brandModels === 'object' && modelIdFromVehicle !== null && brandModels[modelIdFromVehicle]) {
          modelName = brandModels[modelIdFromVehicle];
        } else {
          modelName = r.vehicleModel || "Unknown Model (from Reservation)"; // Fallback to reservation model
        }
      } else {
        // Fallback: If brand ID from vehicleData doesn't work, use reservation's brand/model
        brandName = r.vehicleBrand || "Unknown Brand (from Reservation)";
        modelName = r.vehicleModel || "Unknown Model (from Reservation)";
      }

      power = vehicleData.power || "N/A";
      engineSize = vehicleData.engineSize || "N/A";
      gearbox = vehicleData.gearbox || "N/A";
      bodyType = vehicleData.bodyType || "N/A"; // This will be "N/A" for bikes
      fuelType = vehicleData.fuelType || "N/A";
      pricePerDay = vehicleData.pricePerDay || "N/A";
      imageUrl = vehicleData.image || "/no-image.png";

    } else {
      // --- Fallback: If no vehicleData found, use details directly from the reservation record ---
      console.warn(`Vehicle data not found for ${r.category} with ID ${lookupId}. Displaying details from reservation:`, r);
      brandName = r.vehicleBrand || "Unknown Brand (No Vehicle Data)";
      modelName = r.vehicleModel || "Unknown Model (No Vehicle Data)";
      imageUrl = r.vehicleImage || "/no-image.png"; // Assuming image might be stored in reservation too
      // Other details will remain "N/A" if not explicitly stored in the reservation itself
      power = r.power || "N/A";
      engineSize = r.engineSize || "N/A";
      gearbox = r.gearbox || "N/A";
      bodyType = r.bodyType || "N/A";
      fuelType = r.fuelType || "N/A";
      pricePerDay = r.pricePerDay || "N/A";
    }

    return (
      <Col key={r.documentId} xs={12} lg={6}>
        <Card
          className="my-3 shadow-lg"
          style={{
            backgroundColor: cardBg,
            border: cardBorder,
            transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Card.Header
            className="text-center py-3 fw-bold"
            style={{
              backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa',
              color: headingColor,
              fontSize: '1.4rem',
              borderBottom: cardBorder,
              borderRadius: '15px 15px 0 0',
            }}
          >
            {isCar ? (
              <BsFillCarFrontFill size="1.8em" className="me-2" style={{ color: iconColor }} />
            ) : (
              <span style={{ fontSize: '1.8em', marginRight: '0.5em', color: iconColor }}>🏍️</span>
            )}
            {brandName} / {modelName} {' '}
            <Badge bg={statusBadgeBg} className="ms-2 align-middle">
              {statusBadgeText}
            </Badge>
          </Card.Header>
          <Row className="g-0 align-items-center flex-grow-1">
            <Col md={6}>
              <div style={{ height: '250px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                <img
                  src={imageUrl}
                  alt={`${brandName} / ${modelName}`}
                  className="img-fluid"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: theme === 'dark' ? '0 0 0 5px' : '0' }}
                />
              </div>
            </Col>
            <Col md={6}>
              <ListGroup variant="flush" style={{ backgroundColor: 'transparent', color: textColor }}>
                <ListGroup.Item style={{ backgroundColor: 'transparent', borderColor: theme === 'dark' ? '#3a3a3a' : '#eee', color: textColor }}>
                  <TbEngine className="me-2" style={{ color: iconColor }} /> Power: <strong>{power} HP</strong>
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: 'transparent', borderColor: theme === 'dark' ? '#3a3a3a' : '#eee', color: textColor }}>
                  <PiEngineFill className="me-2" style={{ color: iconColor }} /> Engine: <strong>{engineSize}</strong>
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: 'transparent', borderColor: theme === 'dark' ? '#3a3a3a' : '#eee', color: textColor }}>
                  <TbManualGearbox className="me-2" style={{ color: iconColor }} /> Gearbox: <strong>{gearbox}</strong>
                </ListGroup.Item>
                {isCar && (
                  <ListGroup.Item style={{ backgroundColor: 'transparent', borderColor: theme === 'dark' ? '#3a3a3a' : '#eee', color: textColor }}>
                    <BsCarFront className="me-2" style={{ color: iconColor }} /> Body: <strong>{bodyType}</strong>
                  </ListGroup.Item>
                )}
                <ListGroup.Item style={{ backgroundColor: 'transparent', borderColor: theme === 'dark' ? '#3a3a3a' : '#eee', color: textColor }}>
                  <BsFillFuelPumpFill className="me-2" style={{ color: iconColor }} /> Fuel: <strong>{fuelType}</strong>
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: 'transparent', borderColor: theme === 'dark' ? '#3a3a3a' : '#eee', color: textColor }}>
                  <FaMoneyBillWave className="me-2" style={{ color: iconColor }} /> Price Per Day: <strong style={{ color: theme === 'dark' ? '#20C997' : '#28a745' }}>₹{pricePerDay}</strong>
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
          <div className="p-4" style={{ color: textColor, borderTop: cardBorder, borderRadius: '0 0 15px 15px' }}>
            <h5 className="fw-bold mb-3" style={{ color: headingColor }}>Booking Details</h5>
            <Row>
              <Col xs={12} md={6}>
                <div className="mb-2"><MdOutlineLocationOn className="me-2" style={{ color: iconColor }} /><strong>Pick-up:</strong> {locations[r.pickupLocation] || "Unknown"}</div>
                <div className="mb-2"><MdDateRange className="me-2" style={{ color: iconColor }} /><strong>Start Date:</strong> {r.startDate}</div>
              </Col>
              <Col xs={12} md={6}>
                <div className="mb-2"><MdOutlineLocationOn className="me-2" style={{ color: iconColor }} /><strong>Drop-off:</strong> {locations[r.dropoffLocation] || "Unknown"}</div>
                <div className="mb-2"><MdDateRange className="me-2" style={{ color: iconColor }} /><strong>End Date:</strong> {r.endDate}</div>
              </Col>
            </Row>
          </div>
          {!isCancelled && !isPastEndDate && (
            <div className="text-center pb-4 pt-2">
              <Button
                variant="danger"
                onClick={() => cancelReservation(r.documentId)}
                className="px-4 py-2 rounded-pill fw-bold"
                style={{
                  transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out',
                  backgroundColor: '#DC3545',
                  borderColor: '#DC3545',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Cancel Booking
              </Button>
            </div>
          )}
        </Card>
      </Col>
    );
  };

  return (
    <Container
      fluid
      className="py-5"
      style={{
        minHeight: '100vh',
        backgroundColor: theme === 'dark' ? '#000000' : '#f8f9fa',
        color: theme === 'dark' ? '#E0E0E0' : '#333333',
        transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out'
      }}
    >
      <Container>
        <h1
          className="text-center mb-5 fw-bold"
          style={{
            fontSize: '3rem',
            color: primaryColor,
            textShadow: theme === 'dark' ? '0 0 10px rgba(32, 201, 151, 0.4)' : '0 0 5px rgba(0, 123, 255, 0.2)',
          }}
        >
          My Rentals 🔑
        </h1>
        {user.email && welcomeMessage()}
        <Row className="mt-5 justify-content-center">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant={theme === 'dark' ? 'light' : 'primary'}>
                <span className="visually-hidden">Loading bookings...</span>
              </Spinner>
              <p className="mt-3" style={{ color: secondaryTextColor }}>Fetching your rental data...</p>
            </div>
          ) : (
            (current.length || history.length) ? (
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                id="my-rentals-tabs"
                className="mb-4 justify-content-center custom-tabs"
              >
                <Tab
                  eventKey="current"
                  title={<span className="fw-bold fs-5">Current Bookings <Badge bg={current.length ? "success" : "secondary"} className="ms-2">{current.length}</Badge></span>}
                >
                  <Row className="justify-content-center mt-3">
                    {current.length ? (
                      current.map((r, i) => renderCard(r))
                    ) : (
                      <Col xs={12} className="mt-4">
                        <Card
                          className="text-center p-5 shadow"
                          style={{
                            backgroundColor: cardBg,
                            border: cardBorder,
                            color: secondaryTextColor
                          }}
                        >
                          <p className="fs-4 mb-4 fw-medium">You have no active bookings right now. Time for a new adventure!</p>
                          <Link to="/vehicles">
                            <Button
                              variant="primary"
                              className="px-4 py-2 rounded-pill fw-bold"
                              style={{
                                backgroundColor: primaryColor,
                                borderColor: primaryColor,
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              Browse Vehicles
                            </Button>
                          </Link>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </Tab>
                <Tab
                  eventKey="history"
                  title={<span className="fw-bold fs-5">Booking History <Badge bg={history.length ? "info" : "secondary"} className="ms-2">{history.length}</Badge></span>}
                >
                  <Row className="justify-content-center mt-3">
                    {history.length ? (
                      history.map((r, i) => renderCard(r))
                    ) : (
                      <Col xs={12} className="mt-4">
                        <Card
                          className="text-center p-5 shadow"
                          style={{
                            backgroundColor: cardBg,
                            border: cardBorder,
                            color: secondaryTextColor
                          }}
                        >
                          <p className="fs-4 fw-medium">Your past adventures will show up here.</p>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </Tab>
              </Tabs>
            ) : (
              <Col xs={12} className="mt-4">
                <Card
                  className="text-center p-5 shadow"
                  style={{
                    backgroundColor: cardBg,
                    border: cardBorder,
                    color: secondaryTextColor
                  }}
                >
                  <p className="fs-3 mb-4 fw-semibold">It looks like you haven't booked any vehicles yet.</p>
                  <p className="fs-5 mb-4">Start your journey by exploring our amazing fleet of cars and bikes!</p>
                  <Link to="/vehicles">
                    <Button
                      variant="primary"
                      className="px-5 py-3 rounded-pill fw-bold fs-5"
                      style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      Browse Vehicles Now
                    </Button>
                  </Link>
                </Card>
              </Col>
            )
          )}
        </Row>
      </Container>
    </Container>
  );
};

export default MyRentals;