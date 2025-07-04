import React, { useEffect, useState } from "react";
import { Form, Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useTheme } from '../context/ThemeContext';

const CarSearch = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [category, setCategory] = useState("cars");
  const [brands, setBrands] = useState({});
  const [models, setModels] = useState({});
  const [vehicles, setVehicles] = useState({});

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [filteredVehicleIds, setFilteredVehicleIds] = useState([]);

  const [isSearchButtonHovered, setIsSearchButtonHovered] = useState(false);

  useEffect(() => {
    const fetchStaticData = async () => {
      const brandsDoc = category === "cars" ? "brands" : "bike-brands";
      const modelsDoc = category === "cars" ? "models" : "bike-models";

      try {
        const brandsSnap = await getDoc(doc(db, "vehicle", brandsDoc));
        const modelsSnap = await getDoc(doc(db, "vehicle", modelsDoc));

        setBrands(brandsSnap.exists() ? brandsSnap.data().brands || {} : {});
        setModels(modelsSnap.exists() ? modelsSnap.data().models || {} : {});

      } catch (error) {
        console.error("Error fetching static data (brands/models):", error);
        setBrands({});
        setModels({});
      }
    };

    fetchStaticData();
  }, [category]);

  useEffect(() => {
    const fetchCategoryVehicles = async () => {
      try {
        const categorySnap = await getDoc(doc(db, "vehicle", category));
        setVehicles(categorySnap.exists() ? categorySnap.data() || {} : {});
      } catch (error) {
        console.error("Error fetching category vehicles:", error);
        setVehicles({});
      }
    };

    setSelectedBrand("");
    setSelectedModel("");
    setSelectedVehicleId("");
    setFilteredVehicleIds([]);

    fetchCategoryVehicles();
  }, [category]);

  const handleBrandChange = (e) => {
    const value = e.target.value;
    setSelectedBrand(value);
    setSelectedModel("");
    setSelectedVehicleId("");
    setFilteredVehicleIds([]);
  };

  const handleModelChange = (e) => {
    const value = e.target.value;
    setSelectedModel(value);
    setSelectedVehicleId("");

    const [modelGroupId] = value.split("_");

    const matches = Object.entries(vehicles)
      .filter(
        ([, vehicle]) =>
          String(vehicle.brandId) === selectedBrand &&
          String(vehicle.modelId) === modelGroupId
      )
      .map(([id]) => id);

    setFilteredVehicleIds(matches);
  };

  const handleVehicleChange = (e) => {
    setSelectedVehicleId(e.target.value);
  };

  const selectedBrandName = (brands && brands[selectedBrand]) || "unknown-brand";

  let selectedModelName = "unknown-model";
  if (selectedModel !== "") {
    const [modelGroupId, modelKey] = selectedModel.split("_");
    selectedModelName = (models && models[modelGroupId] && models[modelGroupId].models && models[modelGroupId].models[modelKey]) || "unknown-model";
  }

  const uiColors = {
    sectionBg: isDark ? '#0A0A0A' : '#F8F8F8',
    cardBg: isDark ? '#1C1C1C' : '#FFFFFF',
    cardBorder: isDark ? '1px solid #333333' : '1px solid #E0E0E0',
    cardShadow: isDark ? '0 8px 25px rgba(0,0,0,0.5)' : '0 8px 25px rgba(0,0,0,0.1)',
    headingPrimary: isDark ? '#E0E6F0' : '#2C3E50', // Slightly lighter primary for dark mode
    headingSecondary: isDark ? '#C0D0E0' : '#607D8B', // Lighter secondary for dark mode
    headingGradientStart: '#FF6347',
    headingGradientEnd: '#FFC14E',
    selectBg: isDark ? '#2A2A2A' : '#F8F8F8',
    selectText: isDark ? '#E0E0E0' : '#333333',
    selectBorder: isDark ? '1px solid #4A4A4A' : '1px solid #D0D0D0',
    selectFocusShadow: isDark ? '0 0 0 0.25rem rgba(32, 201, 151, 0.25)' : '0 0 0 0.25rem rgba(0, 123, 255, 0.25)',
    darkArrowSVG: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23e0e0e0' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
    lightArrowSVG: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23495057' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
    buttonBg: isDark ? '#20C997' : '#007bff',
    buttonBorder: isDark ? '#20C997' : '#007bff',
    buttonText: '#FFFFFF',
    buttonHoverBg: isDark ? '#1AA07B' : '#0056b3',
    buttonHoverBorder: isDark ? '#1AA07B' : '#0056b3',
    transition: 'all 0.3s ease-in-out',
  };

  const commonSelectStyles = {
    backgroundColor: uiColors.selectBg,
    color: uiColors.selectText,
    border: uiColors.selectBorder,
    borderRadius: '12px',
    height: '60px',
    padding: '0.5rem 2rem 0.5rem 1.5rem',
    boxShadow: '0 3px 7px rgba(0,0,0,0.07)',
    backgroundImage: isDark ? uiColors.darkArrowSVG : uiColors.lightArrowSVG,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1.5rem center',
    backgroundSize: '20px 16px',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    transition: uiColors.transition,
    option: {
        backgroundColor: uiColors.selectBg,
        color: uiColors.selectText,
        padding: '0.8rem 1.5rem', // Increased padding for "cell size"
        fontSize: '1.05rem', // Slightly larger font for options
    }
  };

  const CategorySelect = () => (
    <Form.Select
      size="lg"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      style={commonSelectStyles}
    >
      <option value="cars" style={commonSelectStyles.option}>Cars</option>
      <option value="bikes" style={commonSelectStyles.option}>Bikes</option>
    </Form.Select>
  );

  const BrandSelect = () => (
    <Form.Select
      size="lg"
      value={selectedBrand}
      onChange={handleBrandChange}
      style={commonSelectStyles}
    >
      <option value="" style={commonSelectStyles.option}>Choose a Brand</option>
      {Object.entries(brands).map(([id, name]) => (
        <option key={id} value={id} style={commonSelectStyles.option}>
          {name}
        </option>
      ))}
    </Form.Select>
  );

  const ModelSelect = () => (
    <Form.Select
      size="lg"
      value={selectedModel}
      onChange={handleModelChange}
      disabled={!selectedBrand}
      style={{
        ...commonSelectStyles,
        opacity: !selectedBrand ? 0.6 : 1,
        cursor: !selectedBrand ? 'not-allowed' : 'pointer',
        backgroundColor: !selectedBrand ? (isDark ? '#111' : '#F0F0F0') : commonSelectStyles.backgroundColor,
      }}
    >
      <option value="" style={commonSelectStyles.option}>{selectedBrand ? "Choose a Model" : "---"}</option>
      {selectedBrand &&
        Object.entries(models).flatMap(([groupId, modelData]) => {
          if (String(modelData.brandId) === selectedBrand) {
            if (modelData.models && typeof modelData.models === 'object') {
              return Object.entries(modelData.models).map(([modelKey, modelName]) => (
                <option key={`${groupId}_${modelKey}`} value={`${groupId}_${modelKey}`} style={commonSelectStyles.option}>
                  {modelName}
                </option>
              ));
            }
          }
          return [];
        })}
    </Form.Select>
  );

  const VehicleSelect = () => (
    <Form.Select
      size="lg"
      value={selectedVehicleId}
      onChange={handleVehicleChange}
      disabled={!selectedModel}
      style={{
        ...commonSelectStyles,
        opacity: !selectedModel ? 0.6 : 1,
        cursor: !selectedModel ? 'not-allowed' : 'pointer',
        backgroundColor: !selectedModel ? (isDark ? '#111' : '#F0F0F0') : commonSelectStyles.backgroundColor,
      }}
    >
      <option value="" style={commonSelectStyles.option}>Choose a {category === "cars" ? "Car" : "Bike"}</option>
      {filteredVehicleIds.map((id) => (
        <option key={id} value={id} style={commonSelectStyles.option}>
          {(vehicles && vehicles[id] && vehicles[id].name) || `ID: ${id}`}
        </option>
      ))}
    </Form.Select>
  );

  const SearchButton = () => (
    <div className="d-grid mt-5">
      <Link
        to={
          selectedVehicleId
            ? `/${category}/${selectedBrandName.toLowerCase().replace(/\s+/g, '-')}/${selectedModelName.toLowerCase().replace(/\s+/g, '-')}/${selectedVehicleId}`
            : "#"
        }
        onClick={(e) => !selectedVehicleId && e.preventDefault()}
        style={{ textDecoration: 'none' }}
      >
        <Button
          size="lg"
          className="w-100 py-3 fw-semibold fs-5"
          style={{
            backgroundColor: isSearchButtonHovered ? uiColors.buttonHoverBg : uiColors.buttonBg,
            border: `2px solid ${isSearchButtonHovered ? uiColors.buttonHoverBorder : uiColors.buttonBorder}`,
            color: uiColors.buttonText,
            transition: uiColors.transition,
            borderRadius: '12px',
            boxShadow: isSearchButtonHovered ? '0 7px 18px rgba(0,0,0,0.3)' : '0 3px 9px rgba(0,0,0,0.15)',
            opacity: !selectedVehicleId ? 0.7 : 1,
            cursor: !selectedVehicleId ? 'not-allowed' : 'pointer',
            padding: '1rem 2rem',
          }}
          onMouseEnter={() => setIsSearchButtonHovered(true)}
          onMouseLeave={() => setIsSearchButtonHovered(false)}
          disabled={!selectedVehicleId}
        >
          Find Your Ride
        </Button>
      </Link>
    </div>
  );

  return (
    <div
      id="vehicle-search"
      className="py-6"
      style={{
        backgroundColor: uiColors.sectionBg,
        transition: uiColors.transition,
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xl={10} xxl={9}>
            {/* Improved Heading Section */}
            <div
              className="text-center mb-6"
              style={{
                padding: '1.5rem 0',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <h1
                className="p-0 fw-extrabold"
                style={{
                  fontFamily: '"Montserrat", sans-serif', // Example modern font (import if not global)
                  fontSize: '3.5rem',
                  lineHeight: '1.2',
                  letterSpacing: '0.02em', // Increased letter spacing for better readability
                  color: isDark ? uiColors.headingPrimary : 'inherit',
                  background: !isDark
                    ? `linear-gradient(90deg, ${uiColors.headingGradientStart}, ${uiColors.headingGradientEnd})`
                    : 'none',
                  WebkitBackgroundClip: !isDark ? "text" : 'unset',
                  WebkitTextFillColor: !isDark ? "transparent" : 'inherit',
                  textShadow: isDark ? '0 0 15px rgba(176, 196, 222, 0.4)' : '2px 2px 5px rgba(0,0,0,0.15)',
                  transition: uiColors.transition,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <span style={{ display: 'block' }}>Your Next Adventure Starts Here</span> {/* Slightly rephrased */}
                <span
                  style={{
                    display: 'block',
                    fontSize: '1.8rem',
                    fontWeight: '400',
                    marginTop: '0.5rem',
                    color: isDark ? uiColors.headingSecondary : '#495057',
                    opacity: 0.9,
                    textShadow: 'none',
                    letterSpacing: 'normal', // Ensure sub-heading doesn't get main heading's letter spacing
                  }}
                >
                  Effortlessly Find & Book Your Perfect Ride
                </span>
              </h1>
              {/* Subtle background element for extra wow */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  background: isDark
                    ? 'radial-gradient(circle at 50% 50%, rgba(32, 201, 151, 0.08) 0%, transparent 70%)'
                    : 'radial-gradient(circle at 50% 50%, rgba(0, 123, 255, 0.05) 0%, transparent 70%)',
                  borderRadius: '50%',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              ></div>
            </div>

            <Card
              className="p-5 p-md-6 rounded-5 shadow-lg"
              style={{
                backgroundColor: uiColors.cardBg,
                border: uiColors.cardBorder,
                transition: uiColors.transition,
              }}
            >
              <Card.Body className="p-0">
                <Row className="gx-5 gy-4">
                  <Col xs={12} md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="mb-3 fw-semibold fs-5" style={{ color: uiColors.selectText }}>Category</Form.Label>
                      <CategorySelect />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="mb-3 fw-semibold fs-5" style={{ color: uiColors.selectText }}>Brand</Form.Label>
                      <BrandSelect />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="mb-3 fw-semibold fs-5" style={{ color: uiColors.selectText }}>Model</Form.Label>
                      <ModelSelect />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6} lg={3}>
                    <Form.Group>
                      <Form.Label className="mb-3 fw-semibold fs-5" style={{ color: uiColors.selectText }}>Vehicle</Form.Label>
                      <VehicleSelect />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <SearchButton />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CarSearch;