import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where
} from "firebase/firestore";
import { db } from "../config/firebase";

const fetchUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        users.sort((a, b) => {
            return a.role === b.role
                ? a.email.localeCompare(b.email)
                : a.role.localeCompare(b.role);
        });

        return users;
    } catch (error) {
        console.error("🔥 fetchUsers error:", error);
        return [];
    }
};

const fetchBrands = async (category = "cars") => {
    try {
        const docId = category === "bikes" ? "bike-brands" : "brands";
        const docSnap = await getDoc(doc(db, "vehicle", docId));
        if (docSnap.exists() && docSnap.data().brands) {
            return docSnap.data().brands;
        } else {
            console.warn(`⚠️ '${docId}' document or 'brands' field not found.`);
            return {};
        }
    } catch (error) {
        console.error(`🔥 fetchBrands(${category}) error:`, error);
        return {};
    }
};

const fetchModels = async (category = "cars") => {
    try {
        const docId = category === "bikes" ? "bike-models" : "models";
        const docSnap = await getDoc(doc(db, "vehicle", docId));
        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.models || {};
        } else {
            console.warn(`⚠️ '${docId}' document not found.`);
            return {};
        }
    } catch (error) {
        console.error(`🔥 fetchModels(${category}) error:`, error);
        return {};
    }
};

const fetchVehicles = async (category = "cars") => {
    try {
        const docId = category;
        const docSnap = await getDoc(doc(db, "vehicle", docId));
        return docSnap.exists() ? docSnap.data() : {};
    } catch (error) {
        console.error(`🔥 fetchVehicles(${category}) error:`, error);
        return {};
    }
};

const fetchLocations = async () => {
    try {
        const docSnap = await getDoc(doc(db, "vehicle", "locations"));
        if (docSnap.exists() && docSnap.data().locations) {
            return docSnap.data().locations;
        } else {
            console.warn("⚠️ 'locations' document or 'locations' field not found in 'vehicle' collection.");
            return {};
        }
    } catch (error) {
        console.error("🔥 fetchLocations error:", error);
        return {};
    }
};

const fetchReservations = async (owner) => {
    try {
        const rentalsRef = collection(db, "rentals");
        const q = owner
            ? query(rentalsRef, where("reservationOwner", "==", owner))
            : rentalsRef;

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            documentId: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("🔥 fetchReservations error:", error);
        return [];
    }
};

const fetchContactForms = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "forms"));
        const data = {};
        querySnapshot.forEach((docSnap) => {
            data[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
        });
        return data;
    } catch (error) {
        console.error("🔥 fetchContactForms error:", error);
        return {};
    }
};

export {
    fetchUsers,
    fetchBrands,
    fetchModels,
    fetchLocations,
    fetchReservations,
    fetchContactForms,
    fetchVehicles,
};