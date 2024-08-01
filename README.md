![ezgif-7-03a726b6b6](https://github.com/user-attachments/assets/e949e6e1-f217-40b7-89d4-0d46cc3f165e)


# EasyDrive : Car-Bike Rentals Application


Easydrive is a React-based car and bike rental application designed to provide a seamless vehicle rental experience. Users can easily register, log in, browse available vehicles, and make secure bookings through a user-friendly interface.

## Features

- **User Authentication**: Register and log in to access the platform.
- **Responsive Design** : Seamless browsing on all devices.
- **Vehicle Booking** : Select desired vehicle, specify rental duration, and proceed to checkout.
- **Payment Integration** : Secure transactions via Razorpay, offering multiple payment options.
- **Booking History** : Access details of previous rentals for reference and tracking.

## Getting Started

### Prerequisites

- Node.js
- npm (Node Package Manager)

### Installation

1. **Clone the Repository**:

   ```sh
   git clone https://github.com/ravikant-diwakar/EasyDrive
   cd easydrive
   ```

2. **Install Dependencies**:

   ```sh
   npm install
   ```

3. **Configure Firebase**:
   - Create a Firebase project and set up a web app.
   - Replace placeholders in `src/config/firebase.js` with your Firebase configuration.
   - Follow the instructions on the [Firebase setup guide](https://firebase.google.com/docs/web/setup?authuser=0&hl=en) to create a project and obtain your Firebase configuration.
   - Create a `.env` file in the root directory and add your Firebase configuration.
     ```env
     REACT_APP_FIREBASE_API_KEY=your_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
     REACT_APP_FIREBASE_PROJECT_ID=your_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     REACT_APP_FIREBASE_APP_ID=your_app_id
     ```

4. **Configure Razorpay**:
   - Create a Razorpay account and obtain your API keys.
   - Replace placeholders in the payment integration code with your Razorpay API keys.
   - Follow the [Razorpay documentation](https://razorpay.com/docs/#home-payments) to create an account and obtain your API keys.
   - Add the Razorpay API keys to your `.env` file.
     ```env
     RAZORPAY_KEY_ID=your_key_id
     RAZORPAY_KEY_SECRET=your_key_secret
     ```

5. **Start the Development Server**:

   ```sh
   npm start
   ```

6. **Open the Application**:

   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

Refer to the [Firebase Setup Documentation](https://firebase.google.com/docs/web/setup?authuser=0&hl=en).

## Payment Integration

Refer to the [Razorpay Documentation](https://razorpay.com/docs/#home-payments).

## Contributing

Contributions are welcome! Follow these steps to contribute:

1. **Fork the Repository**.
2. **Create a New Branch**:

   ```sh
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes** and **Commit**:

   ```sh
   git commit -m "Add feature"
   ```

4. **Push to the Branch**:

   ```sh
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** on GitHub.

## Contact

For any queries or feedback, contact us at diwakarr956@gmail.com

## Folder Structure

```plaintext
├──src
├── admin
│   ├── contact-form-manager
│   │   └── contact-form-manager.jsx
│   ├── locations-manager
│   │   └── location-managers.jsx
│   ├── rentals-manager
│   │   └── rentals-manager.jsx
│   ├── users-manager
│   │   └── users-manager.jsx
│   ├── vehicles-manager
│   │   ├── vehicle-brands.jsx
│   │   ├── vehicle-cars.jsx
│   │   ├── vehicle-models.jsx
│   │   └── vehicles-manager.jsx
│   ├── admin-header.jsx
│   ├── admin-layout.jsx
│   └── admin.jsx
├── assets
│   └── images
├── components
│   ├── general
│   │   └── general-components.jsx
│   ├── about-section.jsx
│   ├── car-offers.jsx
│   ├── car-search.jsx
│   ├── contact-section.jsx
│   ├── customer-reviews.jsx
│   ├── features-section.jsx
│   ├── footer.jsx
│   ├── header.jsx
│   └── slider.jsx
├── config
│   ├── firebase.js
│   ├── general.js
│   └── ScrollToTop.js
├── DATA
│   ├── data.json
│   └── data.jsx
├── dev
│   ├── index.js
│   ├── palette.jsx
│   ├── previews.jsx
│   └── useInitial.js
├── guards
│   ├── AdminGuard.js
│   ├── AuthGuard.js
│   └── GuestGuard.js
├── hooks
│   ├── useAuthentication.js
│   └── useFetchData.js
├── pages
│   ├── about
│   │   └── about.jsx
│   ├── auth
│   │   ├── login.jsx
│   │   └── signup.jsx
│   ├── client
│   │   └── client.jsx
│   ├── contact
│   │   └── contact.jsx
│   ├── my-rentals
│   │   └── my-rentals.jsx
│   ├── services
│   │   └── services.jsx
│   └── vehicles
│       ├── vehicles.jsx
│       ├── car-detail.jsx
│       └── home.jsx
├── redux
│   ├── app
│   │   └── store.js
│   └── features
│       ├── ReserveSlice.js
│       └── UserSlice.js
├── styles
│   └── style.css
├── utils
│   └── demo-content.js
├── App.js
├── App.scss
├── App.test.js
├── index.css
├── index.js
├── reportWebVitals.js
└── setupTests.js
```

| 🏍️ | 🚘 |
|------|------|
| ![image](https://github.com/user-attachments/assets/65dbda30-f896-4873-9f09-a81286645e1f) | ![image](https://github.com/user-attachments/assets/35b461e2-33ed-4341-934a-e7deee5f6c42) |




| ⛍ | ✔ |
|---------|--------|
| ![image](https://github.com/user-attachments/assets/c94033e4-a2d7-4632-944f-6c7052720af7) | ![image](https://github.com/user-attachments/assets/ac31d377-f14c-4b86-8ec4-e8c7a69de8dd) |



---

**Easydrive** - Simplifying Vehicle Rentals!
