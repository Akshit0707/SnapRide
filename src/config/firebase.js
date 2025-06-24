// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

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

export {app, db, storage, auth};