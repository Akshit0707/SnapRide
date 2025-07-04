import React, { useEffect, useState } from 'react';
import { Col, Container, Row, Button, Spinner, Form } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useTheme } from '../context/ThemeContext';
import { CiFilter } from "react-icons/ci";
import { BikeIcon, CarIcon } from 'lucide-react';

/**
 * OfferSection Component (Nested within CarOffers)
 * Displays individual vehicle offer cards with dynamic styling based on theme.
 */
function OfferSection({ items, brands, models, activeCategory, theme, maxItemsToShow, showViewMoreButton, onShowAllClick }) {
  if (!items || items.length === 0) {
    return <Col><p className="text-center" style={{ color: theme === 'dark' ? '#ADD8E6' : '#6c757d' }}>No vehicles found matching your criteria.</p></Col>;
  }

  const navigate = useNavigate();

  const getStockCountForDisplay = (vehicleData, categoryType) => {
    if (!vehicleData) return 0;
    if (categoryType === 'car' && vehicleData.carCount !== undefined) return vehicleData.carCount;
    if (categoryType === 'bike' && vehicleData.bikeCount !== undefined) return vehicleData.bikeCount;
    if (vehicleData.vehicleCount !== undefined) return vehicleData.vehicleCount;
    return vehicleData.stockCount !== undefined ? vehicleData.stockCount : 0;
  };

  const textColor = theme === 'dark' ? '#E0E0E0' : '#333333';
  const primaryColorDark = '#87CEFA';

  const itemsToDisplay = (maxItemsToShow !== undefined && maxItemsToShow !== null)
    ? items.slice(0, maxItemsToShow)
    : items;

  return (
    <>
      <Row className="justify-content-center">
        {itemsToDisplay.map(([key, value]) => {
          const originalBrandId = String(value.brandId);
          const originalModelId = String(value.modelId);

          const prefixedBrandKey = `${activeCategory}-${originalBrandId}`;

          const brand = brands[prefixedBrandKey] || "Unknown Brand";

          let modelName = "Unknown Model";
          const brandModels = models[prefixedBrandKey];

          if (brandModels && typeof brandModels === 'object' && brandModels !== null) {
            const foundModelInState = brandModels[originalModelId];
            if (foundModelInState) {
              modelName = foundModelInState;
            } else {
                console.warn(`WARN (OfferSection): Model ID '${originalModelId}' not found for brand '${brand}' (prefixed key: '${prefixedBrandKey}'). Available models for brand:`, brandModels);
            }
          } else {
              console.warn(`WARN (OfferSection): No models object found for prefixed brand key: '${prefixedBrandKey}'. Active category: ${activeCategory}, Brand ID: ${originalBrandId}. Full models state:`, models);
          }

          const urlBrand = brand.toLowerCase().replace(/\s+/g, '-');
          const urlModel = modelName.toLowerCase().replace(/\s+/g, '-');
          const currentStock = getStockCountForDisplay(value, activeCategory);

          return (
            <Col xs={12} sm={8} md={4} className="mb-4 d-flex justify-content-center" key={`offer_${key}`}>
              <div
                className="gallery-box h-100 d-flex flex-column justify-content-between"
                style={{
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  border: theme === 'dark' ? '1px solid #444' : '1px solid #e0e0e0',
                  transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: theme === 'dark' ? '0 4px 10px rgba(0,0,0,0.4)' : '0 4px 10px rgba(0,0,0,0.1)',
                  maxWidth: '350px',
                  width: '100%'
                }}
              >
                <div
                  className="gallery-img"
                  style={{
                    height: '200px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #f0f0f0'
                  }}
                >
                  <LazyLoadImage
                    src={value.image}
                    className="img-fluid"
                    effect="blur"
                    alt={`${brand} ${modelName}`}
                    placeholderSrc="https://placehold.co/400x250/cccccc/ffffff?text=Loading..."
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="gallery-content text-center px-2 py-3 d-flex flex-column flex-grow-1 justify-content-between">
                  <div>
                    <h3 className="fs-4 fw-600" style={{ color: textColor }}>{brand}</h3>
                    <p className="fs-5 fw-500 mb-2" style={{ color: theme === 'dark' ? primaryColorDark : 'var(--primary-color)' }}>
                      {modelName}
                    </p>
                    <p className="fs-6 fw-500 mb-3" style={{ color: textColor }}>
                      Available Stock: <span className={currentStock > 0 ? "text-success fw-bold" : "text-danger fw-bold"}>{currentStock}</span>
                    </p>
                  </div>
                  <div className="d-grid mt-auto">
                    <Link to={`/${activeCategory}s/${urlBrand}/${urlModel}/${key}`}>
                      <Button
                        className="rounded-1 px-4 fw-bold"
                        style={{
                          backgroundColor: theme === 'dark' ? '#007bff' : '#007bff',
                          border: 'none',
                          color: '#fff',
                          transition: 'background-color 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor: theme === 'dark' ? '#0056b3' : '#0056b3',
                          }
                        }}
                      >
                        Rent Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
      {showViewMoreButton && (
        <Row className="mt-4">
          <Col className="text-center">
            <Button
              variant={theme === 'dark' ? 'outline-info' : 'outline-primary'}
              onClick={onShowAllClick}
              className="fw-bold px-5 py-3 rounded-pill"
              style={{
                borderColor: theme === 'dark' ? '#20C997' : '#007bff',
                color: theme === 'dark' ? '#20C997' : '#007bff',
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#20C997' : '#007bff',
                  color: '#fff',
                }
              }}
            >
              View All {activeCategory === 'car' ? 'Cars' : 'Bikes'}
            </Button>
          </Col>
        </Row>
      )}
    </>
  );
}


/**
 * CarOffers Component
 * Main component to display car and bike offers, toggle between them,
 * and handle data fetching from Firestore.
 */
function CarOffers() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeType, setActiveType] = useState("car");
  const [cars, setCars] = useState({});
  const [bikes, setBikes] = useState({});

  const [brands, setBrands] = useState({});
  const [models, setModels] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [selectedBodyType, setSelectedBodyType] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState('');

  const [appliedBodyType, setAppliedBodyType] = useState('');
  const [appliedFuelType, setAppliedFuelType] = useState('');

  const [showAllVehicles, setShowAllVehicles] = useState(
    location.pathname === '/vehicles' || location.pathname === '/all-offers'
  );

  const vehicleCategories = [
    { name: 'Cars', value: 'car', icon: <CarIcon size={20} /> },
    { name: 'Bikes', value: 'bike', icon: <BikeIcon size={20} /> },
  ];

  const MAX_VISIBLE_TABS_MOBILE = 3;

  const carBodyTypeOptions = ['All', 'SUV', 'Sedan', 'Hatchback', 'Convertible'];
  const bikeBodyTypeOptions = ['All', 'Regular', 'Sports', 'Naked', 'Cruiser', 'Off-road'];
  const fuelTypeOptions = ['All', 'Petrol', 'Diesel', 'Electric'];

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const [
          fetchedCarBrandsSnap, fetchedBikeBrandsSnap,
          fetchedCarModelsSnap, fetchedBikeModelsSnap,
          fetchedCars, fetchedBikes
        ] = await Promise.all([
          getDoc(doc(db, "vehicle", "brands")),
          getDoc(doc(db, "vehicle", "bike-brands")),
          getDoc(doc(db, "vehicle", "models")),
          getDoc(doc(db, "vehicle", "bike-models")),
          getDoc(doc(db, "vehicle", "cars")),
          getDoc(doc(db, "vehicle", "bikes"))
        ]);

        const allFetchedBrands = {};

        console.log("--- Processing Car Brands ---");
        if (fetchedCarBrandsSnap.exists()) {
          const brandsData = fetchedCarBrandsSnap.data().brands;
          console.log("Raw car brands data from 'vehicle/brands' document:", brandsData);
          if (brandsData && typeof brandsData === 'object' && brandsData !== null) {
            Object.entries(brandsData).forEach(([brandId, brandName]) => {
              allFetchedBrands[`car-${String(brandId)}`] = brandName;
            });
            console.log("Successfully processed car brands. Added to allFetchedBrands.");
          } else {
            console.warn("WARN (CarOffers FetchData - Car Brands): 'brands' field not found in 'vehicle/brands' document or is not a valid object.", fetchedCarBrandsSnap.data());
          }
        } else {
          console.warn("WARN (CarOffers FetchData - Car Brands): 'vehicle/brands' document does not exist. Check document ID.");
        }

        console.log("--- Processing Bike Brands ---");
        if (fetchedBikeBrandsSnap.exists()) {
          const bikeBrandsData = fetchedBikeBrandsSnap.data().brands;
          console.log("Raw bike brands data from 'vehicle/bike-brands' document:", bikeBrandsData);
          if (bikeBrandsData && typeof bikeBrandsData === 'object' && bikeBrandsData !== null) {
            Object.entries(bikeBrandsData).forEach(([brandId, brandName]) => {
              allFetchedBrands[`bike-${String(brandId)}`] = brandName;
            });
            console.log("Successfully processed bike brands. Added to allFetchedBrands.");
          } else {
            console.warn("WARN (CarOffers FetchData - Bike Brands): 'brands' field not found in 'vehicle/bike-brands' document or is not a valid object.", fetchedBikeBrandsSnap.data());
          }
        } else {
          console.warn("WARN (CarOffers FetchData - Bike Brands): 'vehicle/bike-brands' document does not exist. Check document ID.");
        }
        setBrands(allFetchedBrands);
        console.log("Final 'brands' state after all brand processing:", allFetchedBrands);


        console.log("--- Processing Models Data ---");
        const combinedModels = {};

        const processModelsData = (snap, categoryPrefix, targetObj) => {
          if (snap.exists()) {
            const rawModelsForCategory = snap.data().models;
            console.log(`Raw '${categoryPrefix}-models' document data (field 'models'):`, rawModelsForCategory);

            if (rawModelsForCategory && typeof rawModelsForCategory === 'object' && rawModelsForCategory !== null) {
              const itemsToIterate = Array.isArray(rawModelsForCategory)
                ? rawModelsForCategory
                : Object.values(rawModelsForCategory);

              itemsToIterate.forEach((brandModelGroup) => {
                if (brandModelGroup && typeof brandModelGroup === 'object' && brandModelGroup.brandId !== undefined && brandModelGroup.models !== undefined) {
                  const actualBrandId = String(brandModelGroup.brandId);
                  const modelsContent = brandModelGroup.models;

                  let processedModelsForBrand = {};
                  if (typeof modelsContent === 'object' && modelsContent !== null) {
                      processedModelsForBrand = Object.fromEntries(
                          Object.entries(modelsContent).map(([id, name]) => [String(id), name])
                      );
                  } else {
                      console.warn(`WARN (CarOffers FetchData - ${categoryPrefix} models): 'models' content for brandId '${actualBrandId}' is not an object (map). Actual type: ${typeof modelsContent}. Value:`, modelsContent);
                  }

                  targetObj[`${categoryPrefix}-${actualBrandId}`] = {
                      ...(targetObj[`${categoryPrefix}-${actualBrandId}`] || {}),
                      ...processedModelsForBrand
                  };
                  console.log(`Processed models for ${categoryPrefix} brand ${actualBrandId}:`, processedModelsForBrand);
                } else {
                  console.warn(`WARN (CarOffers FetchData - ${categoryPrefix} models): Invalid brandModelGroup structure in '${categoryPrefix}-models' document: missing brandId or models field, or not an object.`, brandModelGroup);
                }
              });
            } else {
              console.warn(`WARN (CarOffers FetchData - Models for ${categoryPrefix}): 'models' field within 'vehicle/${categoryPrefix}-models' document is not an object/array or is missing. Actual value:`, rawModelsForCategory);
            }
          } else {
            console.warn(`WARN (CarOffers FetchData - Models for ${categoryPrefix}): 'vehicle/${categoryPrefix}-models' document does not exist. This is required for models.`);
          }
        };

        processModelsData(fetchedCarModelsSnap, "car", combinedModels);
        processModelsData(fetchedBikeModelsSnap, "bike", combinedModels);
        setModels(combinedModels);
        console.log("Final 'models' state after all model processing:", combinedModels);


        console.log("--- Processing Cars Data ---");
        if (fetchedCars.exists()) {
          setCars(fetchedCars.data());
          console.log("Fetched Cars Data:", fetchedCars.data());
        } else {
          setCars({});
          console.warn("WARN: 'vehicle/cars' document not found or empty.");
        }

        console.log("--- Processing Bikes Data ---");
        if (fetchedBikes.exists()) {
          setBikes(fetchedBikes.data());
          console.log("Fetched Bikes Data:", fetchedBikes.data());
        } else {
          setBikes({});
          console.warn("WARN: 'vehicle/bikes' document not found or empty.");
        }

      } catch (err) {
        console.error("❌ Error fetching vehicle data in CarOffers:", err);
        setFetchError("Failed to load vehicle offers. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStockCount = (vehicleData, categoryType) => {
    if (!vehicleData) return 0;
    if (vehicleData.vehicleCount !== undefined) {
      return vehicleData.vehicleCount;
    }
    if (categoryType === 'car') {
      return vehicleData.carCount !== undefined ? vehicleData.carCount : 0;
    }
    if (categoryType === 'bike') {
      return vehicleData.bikeCount !== undefined ? vehicleData.bikeCount : 0;
    }
    return vehicleData.stockCount !== undefined ? vehicleData.stockCount : 0;
  };

  const vehiclesForCurrentCategory = activeType === "car" ? cars : bikes;

  const filteredItems = vehiclesForCurrentCategory
    ? Object.entries(vehiclesForCurrentCategory).filter(([id, v]) => {
      const stockCount = getStockCount(v, activeType);

      if (stockCount === 0) {
        return false;
      }

      if (appliedBodyType && appliedBodyType !== 'All') {
          const vehicleBodyType = v.bodyType ? String(v.bodyType).toLowerCase() : 'n/a';
          const appliedBodyTypeLower = appliedBodyType.toLowerCase();
          if (vehicleBodyType !== appliedBodyTypeLower) {
              return false;
          }
      }

      if (activeType === 'car' && appliedFuelType && appliedFuelType !== 'All') {
          const vehicleFuelType = v.fuelType ? String(v.fuelType).toLowerCase() : 'n/a';
          const appliedFuelTypeLower = appliedFuelType.toLowerCase();
          if (vehicleFuelType !== appliedFuelTypeLower) {
              return false;
          }
      }
      return true;
    })
    : [];

  const applyFilters = () => {
    setAppliedBodyType(selectedBodyType);
    setAppliedFuelType(activeType === 'car' ? selectedFuelType : '');
    setShowFilterDropdown(false);
    if (!(location.pathname === '/vehicles' || location.pathname === '/all-offers')) {
        setShowAllVehicles(false);
    }
  };

  const clearAllFilters = () => {
    setSelectedBodyType('');
    setSelectedFuelType('');
    setAppliedBodyType('');
    setAppliedFuelType('');
    setShowFilterDropdown(false);
    if (!(location.pathname === '/vehicles' || location.pathname === '/all-offers')) {
        setShowAllVehicles(false);
    }
  };

  const handleShowAllClick = () => {
    setShowAllVehicles(true);
    navigate('/vehicles');
  };

  const handleTabChange = (type) => {
    setActiveType(type);
    clearAllFilters();
    if (!(location.pathname === '/vehicles' || location.pathname === '/all-offers')) {
        setShowAllVehicles(false);
    } else {
        setShowAllVehicles(true);
    }
  };

  const currentBodyTypeOptions = activeType === 'car' ? carBodyTypeOptions : bikeBodyTypeOptions;

  const maxItems = isMobile ? 7 : 9;
  const itemsToRenderCount = showAllVehicles ? null : maxItems;
  const shouldShowViewMoreButton = !showAllVehicles && filteredItems.length > maxItems;

  return (
    <div
      id="car-offers"
      style={{
        clear: "both",
        background: theme === 'dark' ? '#0A0A0A' : '#F8F8F8',
        padding: "2rem 0",
        borderRadius: "0 0 16px 16px",
        transition: 'background 0.3s ease-in-out',
        overflow: 'hidden',
        // ADDED BORDER PROPERTIES TO MITIGATE ANTI-ALIASING/EDGE ISSUES
        borderBottom: theme === 'dark' ? '1px solid #0A0A0A' : '1px solid #F8F8F8', // Match background color
        borderLeft: theme === 'dark' ? '1px solid #0A0A0A' : '1px solid #F8F8F8',   // Match background color
        borderRight: theme === 'dark' ? '1px solid #0A0A0A' : '1px solid #F8F8F8',  // Match background color
      }}
    >
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h1
              className="text-center fw-bold"
              style={{
                fontSize: "3.2rem",
                backgroundImage: `linear-gradient(45deg, ${theme === 'dark' ? '#33D9B2' : '#FF6347'}, ${theme === 'dark' ? '#20C997' : '#CC4C3B'}, ${theme === 'dark' ? '#1ABC9C' : '#FF6347'})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: theme === 'dark'
                  ? '0 0 8px rgba(32, 201, 151, 0.4), 0 0 15px rgba(32, 201, 151, 0.2)'
                  : '0 0 8px rgba(255, 99, 71, 0.3), 0 0 15px rgba(255, 99, 71, 0.15)',
                letterSpacing: "0.5px",
                marginBottom: "0.5rem",
                lineHeight: '1.2',
              }}
            >
              Explore Our Awesome Rides!
            </h1>
            <p className="text-center" style={{ color: theme === 'dark' ? '#B0B0B0' : '#666', fontSize: "1.05rem" }}>
              Find your perfect car or bike for your next adventure.
            </p>
          </Col>
        </Row>

        <Row className="mb-4 justify-content-center">
          <Col xs={12} md={10} lg={8} className="text-center position-relative">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "15px",
                marginBottom: "1rem",
                flexWrap: 'wrap',
              }}
              className="d-md-flex"
            >
              <div
                className="d-flex flex-nowrap overflow-auto scrollable-tabs-container mb-3 mb-md-0"
                style={{
                  flexShrink: 0,
                  border: theme === 'dark' ? '1px solid #444' : '1px solid #D0D0D0',
                  borderRadius: "10px",
                  backgroundColor: theme === 'dark' ? '#2A2A2A' : '#F0F0F0',
                  boxShadow: theme === 'dark' ? 'inset 0 1px 3px rgba(0,0,0,0.3)' : 'inset 0 1px 3px rgba(0,0,0,0.05)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: `${theme === 'dark' ? '#555' : '#888'} ${theme === 'dark' ? '#333' : '#f1f1f1'}`,
                }}
              >
                {vehicleCategories.slice(0, MAX_VISIBLE_TABS_MOBILE).map((category, index) => (
                  <Button
                    key={category.value}
                    onClick={() => handleTabChange(category.value)}
                    style={{
                      flexGrow: 1,
                      flexShrink: 0,
                      minWidth: '130px',
                      padding: "0.8rem 1.2rem",
                      fontSize: "1rem",
                      fontWeight: "500",
                      backgroundColor: activeType === category.value
                        ? (theme === 'dark' ? '#4A4A4A' : '#E0E0E0')
                        : (theme === 'dark' ? 'transparent' : 'transparent'),
                      color: activeType === category.value
                        ? (theme === 'dark' ? '#20C997' : '#007bff')
                        : (theme === 'dark' ? '#B0B0B0' : '#777'),
                      borderRight: index < vehicleCategories.slice(0, MAX_VISIBLE_TABS_MOBILE).length - 1
                        ? (theme === 'dark' ? '1px solid #3A3A3A' : '1px solid #DEDEDE')
                        : 'none',
                      borderRadius: '0',
                      ...(index === 0 && { borderRadius: "8px 0 0 8px" }),
                      ...(index === MAX_VISIBLE_TABS_MOBILE - 1 && vehicleCategories.length <= MAX_VISIBLE_TABS_MOBILE ? { borderRadius: "0 8px 8px 0" } : {}),
                      transition: "all 0.2s ease-in-out",
                      '&:hover': {
                         backgroundColor: theme === 'dark' ? '#3A3A3A' : '#EAEAEA',
                         color: theme === 'dark' ? '#20C997' : '#007bff',
                      },
                      outline: 'none',
                      boxShadow: 'none',
                    }}
                    className="d-flex align-items-center justify-content-center gap-2"
                  >
                    {category.icon} <span>{category.name}</span>
                  </Button>
                ))}

                {vehicleCategories.length > MAX_VISIBLE_TABS_MOBILE && (
                  <Button
                    onClick={handleShowAllClick}
                    style={{
                      flexShrink: 0,
                      minWidth: '130px',
                      padding: "0.8rem 1.2rem",
                      fontSize: "1rem",
                      fontWeight: "500",
                      backgroundColor: theme === 'dark' ? 'transparent' : 'transparent',
                      color: theme === 'dark' ? '#B0B0B0' : '#777',
                      borderRadius: "0 8px 8px 0",
                      transition: "all 0.2s ease-in-out",
                      borderLeft: theme === 'dark' ? '1px solid #3A3A3A' : '1px solid #DEDEDE',
                      '&:hover': {
                         backgroundColor: theme === 'dark' ? '#3A3A3A' : '#EAEAEA',
                         color: theme === 'dark' ? '#20C997' : '#007bff',
                      },
                      outline: 'none',
                      boxShadow: 'none',
                    }}
                    className="d-flex align-items-center justify-content-center gap-1"
                  >
                    View All
                  </Button>
                )}
              </div>

              <Button
                variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="p-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  borderColor: theme === 'dark' ? '#20C997' : '#FF6347',
                  color: theme === 'dark' ? '#20C997' : '#FF6347',
                  backgroundColor: 'transparent',
                  transition: "all 0.2s ease-in-out",
                  width: '48px',
                  height: '48px',
                }}
              >
                <CiFilter />
              </Button>
            </div>

            {showFilterDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 5px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1000,
                  backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
                  border: theme === 'dark' ? '1px solid #666' : '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                  width: '90vw',
                  maxWidth: '450px',
                  maxHeight: '350px',
                  overflowY: 'auto',
                  textAlign: 'left',
                  WebkitScrollbar: { width: '8px' },
                  WebkitScrollbarTrack: { background: theme === 'dark' ? '#333' : '#f1f1f1' },
                  WebkitScrollbarThumb: { background: theme === 'dark' ? '#555' : '#888', borderRadius: '4px' },
                  WebkitScrollbarThumbHover: { background: theme === 'dark' ? '#777' : '#555' },
                }}
              >
                <h4 className="mb-4 fw-bold" style={{ color: theme === 'dark' ? '#20C997' : '#007bff' }}>
                  Filter Options
                </h4>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold" style={{ color: theme === 'dark' ? '#E0E0E0' : '#444' }}>
                    {activeType === 'car' ? 'Car Body Type' : 'Vehicle Body Type'}
                  </Form.Label>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {currentBodyTypeOptions.map(bodyType => (
                      <Form.Check
                        key={bodyType}
                        type="radio"
                        label={bodyType}
                        name="bodyType"
                        id={`bodyType-${bodyType}`}
                        value={bodyType}
                        checked={selectedBodyType === bodyType}
                        onChange={(e) => setSelectedBodyType(e.target.value)}
                        className={theme === 'dark' ? 'text-light' : 'text-dark'}
                      />
                    ))}
                  </div>
                </Form.Group>

                {activeType === 'car' && (
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold" style={{ color: theme === 'dark' ? '#E0E0E0' : '#444' }}>
                      Fuel Type
                    </Form.Label>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {fuelTypeOptions.map(fuel => (
                        <Form.Check
                          key={fuel}
                          type="radio"
                          label={fuel}
                          name="fuelType"
                          id={`fuelType-${fuel}`}
                          value={fuel}
                          checked={selectedFuelType === fuel}
                          onChange={(e) => setSelectedFuelType(e.target.value)}
                          className={theme === 'dark' ? 'text-light' : 'text-dark'}
                        />
                      ))}
                    </div>
                  </Form.Group>
                )}

                <div className="d-flex justify-content-between mt-4 pt-3 border-top" style={{borderColor: theme === 'dark' ? '#444' : '#eee'}}>
                  <Button
                    variant={theme === 'dark' ? 'outline-info' : 'outline-secondary'}
                    onClick={clearAllFilters}
                    className="flex-grow-1 me-2 rounded-pill fw-bold"
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'success' : 'primary'}
                    onClick={applyFilters}
                    className="flex-grow-1 ms-2 rounded-pill fw-bold"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </Col>
        </Row>

        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant={theme === 'dark' ? 'light' : 'primary'}>
              <span className="visually-hidden">Loading offers...</span>
            </Spinner>
            <p className="mt-3" style={{ color: theme === 'dark' ? '#ADD8E6' : 'var(--bs-primary)' }}>Loading {activeType} offers...</p>
          </div>
        ) : fetchError ? (
          <p className="text-danger text-center fw-bold">{fetchError}</p>
        ) : (
          filteredItems.length > 0 ? (
            <OfferSection
              items={filteredItems}
              brands={brands}
              models={models}
              activeCategory={activeType}
              theme={theme}
              maxItemsToShow={itemsToRenderCount}
              showViewMoreButton={shouldShowViewMoreButton}
              onShowAllClick={handleShowAllClick}
            />
          ) : (
            <p className="text-center text-muted" style={{ color: theme === 'dark' ? '#ADD8E6' : '#6c757d' }}>No {activeType}s available with these filters. Try adjusting your filters.</p>
          )
        )}
      </Container>
    </div>
  );
}

export default CarOffers;