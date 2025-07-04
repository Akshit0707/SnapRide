// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import onAuthStateChanged

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
   apiKey: "AIzaSyAXhBfqrGL-AHzDQ3xs1wdNI4FOCNDD65I",
  authDomain: "easydrive-1a6fb.firebaseapp.com",
  projectId: "easydrive-1a6fb",
  storageBucket: "easydrive-1a6fb.firebasestorage.app",
  messagingSenderId: "731936098782",
  appId: "1:731936098782:web:818620fd04104d7837b54f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

console.log("✅ Firebase config loaded:", firebaseConfig);

// --- ADDED CODE FOR ADMIN CLAIM VERIFICATION ---
// This function will listen for authentication state changes
// and log the custom claims of the authenticated user.
// This is for DIAGNOSIS, not for FIXING the missing claim.
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      // Force a refresh of the ID token to ensure latest claims are fetched
      const idTokenResult = await user.getIdTokenResult(true);
      console.log("User UID:", user.uid);
      console.log("User Email:", user.email);
      console.log("User Custom Claims:", idTokenResult.claims);

      if (idTokenResult.claims.admin === true) {
        console.log("✅ Current user is recognized as an ADMIN!");
      } else {
        console.warn("⚠️ Current user is NOT recognized as an admin (admin: true claim is missing or false).");
      }
    } catch (error) {
      console.error("Error getting ID token result:", error);
    }
  } else {
    console.log("No user is currently logged in.");
  }
});
// --- END ADDED CODE ---

export {app, db, storage, auth};