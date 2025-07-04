# SnapRide: Car & Bike Rental System

SnapRide is a modern and intuitive web application that facilitates seamless car and bike rentals. It provides a user-friendly interface for Browse available vehicles, making reservations, and managing rentals. The application features a robust backend powered by Firebase, ensuring secure authentication and real-time data management.

## ✨ Features

SnapRide offers a wide range of functionalities for both regular users and administrators:

### User Features:
* **Browse Vehicles:** Explore a wide selection of available cars and bikes.
* **Detailed Vehicle Information:** View comprehensive details for each vehicle, including:
    * Image
    * Power (HP)
    * Engine Size
    * Gearbox Type
    * Body Type (for cars) / Bike Type (for bikes)
    * Fuel Type
    * Manufacturing Year
    * Price per day
* **Location Selection:** Choose convenient pickup and drop-off locations for your rental.
* **Flexible Reservations:** Select specific start and end dates for your rental period.
* **Secure Payment Gateway:** Integrated with **Razorpay** for smooth and secure online payment processing.
* **User Authentication:**
    * Secure user registration and login.
    * Personalized "My Rentals" dashboard to view and manage your own reservations.
* **Reservation Management:** Easily cancel your own active reservations.

### Admin Features (Rentals Management Panel):
* **Centralized Overview:** Access a dedicated admin panel to view all reservations made across the platform.
* **Grouped Reservations:** Reservations are intuitively grouped by the owner's email, making it easy to manage multiple rentals from a single user.
* **Detailed Reservation View:** Expand each reservation to see full vehicle details and rental specifics.
* **Individual Reservation Cancellation:** Admins can cancel any specific reservation from any user.
* **Bulk User Reservation Cancellation:** For efficient management, admins have the power to cancel **all** reservations belonging to a particular user.
* **Secure Admin Access:** Admin permissions are enforced through Firebase Security Rules, ensuring that only authorized accounts can perform administrative actions.

## 🚀 Technologies Used

* **Frontend:**
    * [React.js](https://react.dev/) - A JavaScript library for building user interfaces.
    * [React-Bootstrap](https://react-bootstrap.netlify.app/) - For responsive and pre-built UI components.
    * [React-Icons](https://react-icons.github.io/react-icons/) - For a wide variety of customizable SVG icons.
* **Backend & Database:**
    * [Firebase Firestore](https://firebase.google.com/docs/firestore) - A flexible, scalable NoSQL cloud database to store all application data (vehicles, locations, reservations, etc.).
    * [Firebase Authentication](https://firebase.google.com/docs/auth) - For secure user registration, login, and session management.
    * **Firebase Cloud Functions** (Implicitly required for secure Razorpay integration) - For handling server-side logic like payment capture.
* **Payment Gateway:**
    * [Razorpay](https://razorpay.com/) - A leading payment gateway for online transactions.
* **Utility & Alerts:**
    * [SweetAlert2](https://sweetalert2.github.io/) - For beautiful, responsive, customizable, accessible replacement for JavaScript's popup boxes.
* **Version Control:**
    * [Git](https://git-scm.com/) - For source code management.

## ⚙️ Setup and Installation

To get SnapRide up and running on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Akshit0707/SnapRide.git](https://github.com/Akshit0707/SnapRide.git)
    cd SnapRide
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Firebase Project Setup:**
    * Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    * Enable **Firestore Database** and **Firebase Authentication** (Email/Password provider).
    * Register a new web app within your Firebase project.
    * Copy your Firebase configuration object.

4.  **Configure Firebase in your project:**
    * Create a file named `firebase.js` (or similar) in your `src/config/` directory.
    * Paste your Firebase configuration into this file, replacing the placeholder values:
        ```javascript
        // src/config/firebase.js
        import { initializeApp } from "firebase/app";
        import { getFirestore } from "firebase/firestore";
        import { getStorage } from "firebase/storage";
        import { getAuth } from "firebase/auth";

        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_AUTH_DOMAIN",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_STORAGE_BUCKET",
          messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
          appId: "YOUR_APP_ID"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const storage = getStorage(app);
        const auth = getAuth(app);

        export {app, db, storage, auth};
        ```
    * **Populate your Firestore Database:** You'll need to manually create the initial data structures in Firestore:
        * `vehicle/cars/{vehicleId}`: Documents for each car (e.g., `0`, `1`, `2`, with fields like `brandId`, `modelId`, `pricePerDay`, etc.).
        * `vehicle/bikes/{vehicleId}`: Documents for each bike.
        * `locations/{locationId}`: Documents mapping location IDs to names (e.g., `0: "Delhi"`, `1: "Mumbai"`).
        * `brands/cars/{brandId}`: Documents mapping brand IDs to car brand names (e.g., `0: "BMW"`).
        * `brands/bikes/{brandId}`: Documents mapping brand IDs to bike brand names.
        * `models/cars/{brandId_key}`: Documents containing models for car brands (e.g., a document for `0` (BMW) containing models like `0: "X5"`, `1: "3 Series"`).
        * `models/bikes/{brandId_key}`: Documents containing models for bike brands.

5.  **Set up Firebase Security Rules (Crucial for Admin Access):**
    * Go to your Firebase Console -> Firestore Database -> Rules tab.
    * Implement the following rules to secure your data and enable admin functionality. **Remember to replace `YOUR_ADMIN_USER_UID` with your actual Firebase User ID for admin access.**
        ```firestore
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {

            // IMPORTANT: This isAdmin() function hardcodes admin UIDs directly into the rules.
            // For production, a more scalable and secure approach is to use Firebase Custom Claims
            // set via a Firebase Cloud Function or a secure backend.
            function isAdmin() {
              let adminUids = [
                "YOUR_ADMIN_USER_UID", // <<< REPLACE THIS with your Firebase User UID!
                // Add UIDs of any other admin users here
              ];
              return request.auth != null && request.auth.uid in adminUids;
            }

            // Allow authenticated users to read all data
            match /{document=**} {
              allow read: if request.auth != null;
            }

            // Allow authenticated users to create new rental documents
            match /rentals/{rentalId} {
              allow create: if request.auth != null
                            && request.resource.data.reservationOwner == request.auth.token.email;

              // Allow admins (defined by hardcoded UIDs) to read, update, or delete ANY rental,
              // OR allow the reservation owner to read, update, or delete their OWN rental.
              allow read, update, delete: if isAdmin() || (request.auth != null && resource.data.reservationOwner == request.auth.token.email);
            }

            // Allow authenticated users to update fields within the 'vehicle' documents.
            // This rule applies directly to documents like 'cars' or 'bikes' under 'vehicle'.
            match /vehicle/{categoryDocId} {
              allow update: if request.auth != null; // Generally, only admins should update this in a real app
            }

            // Rules for other collections (users, locations, brands, models)
            match /users/{userId} {
              allow read: if request.auth != null && request.auth.uid == userId;
              allow write: if request.auth != null && request.auth.uid == userId;
            }

            match /locations/{locationId} {
              allow read: if request.auth != null;
            }

            match /brands/{brandType} {
              allow read: if request.auth != null;
            }

            match /models/{modelType} {
              allow read: if request.auth != null;
            }
          }
        }
        ```

6.  **Razorpay Setup:**
    * **Create a Razorpay Account:** Sign up at [Razorpay](https://razorpay.com/).
    * **Get API Keys:** Navigate to `Settings > API Keys` in your Razorpay dashboard. Generate a new set of `Key ID` and `Key Secret`.
    * **Environment Variables:** **NEVER expose your `Key Secret` in client-side code.** For client-side (React), you only need the `Key ID`. Store both in environment variables:
        * For your **React app**: Create a `.env` file in your project root:
            ```
            REACT_APP_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID # Use rzp_test_ for sandbox
            # REACT_APP_RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET # DO NOT expose this in client-side code!
            ```
            Remember to restart your React development server (`npm start`) after adding/modifying `.env` variables.
        * **For Server-Side (Firebase Cloud Functions):** Your `Key Secret` must be used on a secure backend to capture payments.
            * Initialize Firebase Cloud Functions in your project if you haven't already: `firebase init functions`.
            * Install Razorpay SDK in your functions directory: `npm install razorpay`.
            * Set environment variables for your functions (e.g., using `firebase functions:config:set razorpay.key_id="YOUR_KEY_ID" razorpay.key_secret="YOUR_KEY_SECRET"`).
            * Your payment flow should involve:
                1.  Client (React) sends a request to a Cloud Function to "create an order."
                2.  Cloud Function uses `razorpay.orders.create()` with `Key ID` and `Key Secret`.
                3.  Cloud Function returns `order_id` to the client.
                4.  Client initializes Razorpay checkout with `order_id` and `Key ID`.
                5.  After successful payment on Razorpay pop-up, Razorpay returns a `payment_id` and `signature` to your client.
                6.  Client sends `payment_id`, `order_id`, and `signature` to another Cloud Function to "verify payment."
                7.  Cloud Function uses `razorpay.validateWebhookSignature()` or `razorpay.payments.fetch()` and `razorpay.payments.capture()` to verify and capture the payment securely using `Key ID` and `Key Secret`.

7.  **Start the development server:**
    ```bash
    npm start
    # or
    yarn start
    ```

The application should now be running in your browser, typically at `http://localhost:3000`.

## 🖥️ Usage

* **For Users:** Register an account, log in, browse cars/bikes, select dates and locations, and make reservations. During the reservation process, you will be directed through the Razorpay payment gateway. View your rentals in the "My Rentals" section.
* **For Admins:** Log in with a Firebase account whose UID is listed in the `isAdmin()` function within your Firebase Security Rules. Navigate to the admin panel (path to be defined in your routing) to manage all user reservations. **For specific demo access credentials, please contact the project owner directly.
  If you want to check use this demo account Email- akshitarora2022@gmail.com, Password- Akshit@345
**

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please feel free to open an issue or submit a pull request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
