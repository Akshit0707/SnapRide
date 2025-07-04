import React from 'react'; // useEffect is no longer needed here as it's moved to ThemeContext

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/style.css';
import './App.scss';
import "animate.css";


import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import store from "./redux/app/store";

import {
    BrowserRouter as Router,
    Routes,
    Route
} from "react-router-dom"

import ScrollToTop from "./config/ScrollToTop";

import Header from "./components/header";
import Footer from './components/footer';

import Home from './pages/home';

import Login from './pages/auth/login';
import Signup from './pages/auth/signup';

import About from './pages/about/about';
import Client from './pages/client/client';
import Services from './pages/services/services';
import Vehicles from './pages/vehicles/vehicles';
import Contact from './pages/contact/contact';

import VehicleDetail from "./pages/car-detail";

import MyRentals from "./pages/my-rentals/my-rentals";
import AuthGuard from "./guards/AuthGuard";
import GuestGuard from "./guards/GuestGuard";
import AdminGuard from "./guards/AdminGuard";

import AdminLayout from "./admin/admin-layout";
import Admin from "./admin/admin";
import VehiclesManager from "./admin/vehicles-manager/vehicles-manager";
import VehicleBrands from "./admin/vehicles-manager/vehicle-brands";
import VehicleModels from "./admin/vehicles-manager/vehicle-models";
import VehicleCars from "./admin/vehicles-manager/vehicle-cars";
import UsersManager from "./admin/users-manager/users-manager";
import LocationsManager from "./admin/locations-manager/locations-manager";
import RentalsManager from "./admin/rentals-manager/rentals-manager";
import ContactFormManager from "./admin/contact-form-manager/contact-form-manager";

import { ThemeProvider } from "./context/ThemeContext"; // useTheme is not needed here

function App() {
    const persistor = persistStore(store);

    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <ThemeProvider> {/* ThemeProvider now handles body class */}
                    {/* Removed <ThemeBodyBackground /> as its logic is now in ThemeProvider */}
                    <Router>
                        <ScrollToTop />
                        <Header />
                        <Routes>
                            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                                <Route index element={<Admin />} />
                                <Route path="users" element={<UsersManager />} />
                                <Route path="vehicles" element={<VehiclesManager />} >
                                    <Route path="brands" element={<VehicleBrands />} />
                                    <Route path="models" element={<VehicleModels />} />
                                    <Route path="cars" element={<VehicleCars />} />
                                </Route>
                                <Route path="locations" element={<LocationsManager />} />
                                <Route path="rentals" element={<RentalsManager />} />
                                <Route path="contact-form" element={<ContactFormManager />} />
                            </Route>

                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
                            <Route path="/sign-up" element={<GuestGuard><Signup /></GuestGuard>} />
                            <Route path="/about" element={<About />} />
                            <Route path="/client" element={<Client />} />
                            <Route path="/services" element={<Services />} />
                            <Route path="/vehicles" element={<Vehicles />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/my-rentals" element={<AuthGuard><MyRentals /></AuthGuard>} />
                            <Route path="/:category/:vehicleBrand/:vehicleModel/:vehicleId" element={<VehicleDetail />} />
                            <Route path="*" element={
                                <div className="text-center py-5" style={{ backgroundColor: 'transparent', minHeight: '80vh', color: 'gray' }}> {/* Fallback for 404 */}
                                    <h1>404 - Page Not Found</h1>
                                    <p>The page you are looking for does not exist.</p>
                                </div>
                            } />
                        </Routes>
                        <Footer />
                    </Router>
                </ThemeProvider>
            </PersistGate>
        </Provider>
    );
}

export default App;