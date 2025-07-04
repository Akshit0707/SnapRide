import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  setDoc,
  doc,
  getDoc
} from "firebase/firestore";
import {
  clearUserData,
  setUser
} from "../redux/features/UserSlice";

const useAuthentication = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // ✅ Login handler
  const signInCall = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let docData;

      if (!userSnap.exists()) {
        docData = {
          userUID: user.uid,
          email: email,
          role: "user",
          name: "Anonymous" // fallback
        };
        await setDoc(userRef, docData);
      } else {
        docData = userSnap.data();
      }

      const userData = {
        uid: user.uid,
        email: docData.email,
        role: docData.role,
        name: docData.name || "User"
      };

      dispatch(setUser(userData));

      setMessage({
        content: "You are successfully logged in!",
        isError: false
      });
    } catch (err) {
      console.error(err);
      setMessage({
        content: "Incorrect email or password, please try again!",
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Signup handler
  const signUpCall = async ({ email, password, role, name, age, mobile, address }) => {
  setIsLoading(true);
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Build Firestore doc data
    const docData = {
      userUID: user.uid,
      email,
      role,
    };

    // Only add user-specific fields if role is 'user'
    if (role === "user") {
      docData.name = name;
      docData.age = age;
      docData.mobile = mobile;
      docData.address = address;
    }

    // Save to Firestore
    await setDoc(doc(db, "users", user.uid), docData);

    const userData = { ...user, ...docData };
    dispatch(setUser(userData));

    setMessage({
      content: "You are successfully signed up!",
      isError: false,
    });

    // Optional: redirect after signup based on role
    navigate(role === "admin" ? "/admin" : "/user");

    return { success: true };
  } catch (err) {
    console.error(err);
    setMessage({
      content: err.message,
      isError: true,
    });
    return { success: false };
  } finally {
    setIsLoading(false);
  }
};


  // ✅ Logout handler
  const signOutCall = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      dispatch(clearUserData());

      setMessage({
        content: "You are successfully logged out!",
        isError: false
      });

      navigate("/login");
    } catch (err) {
      console.log(err);
      setMessage({
        content: err.message,
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, message, signInCall, signUpCall, signOutCall };
};

export default useAuthentication;
