import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjX9C9oT5lEC3M4U2pcGqUQr0_u_XsI8A",
  authDomain: "scrtch-4d620.firebaseapp.com",
  projectId: "scrtch-4d620",
  storageBucket: "scrtch-4d620.appspot.com", // ✅ FIXED
  messagingSenderId: "312017391268",
  appId: "1:312017391268:web:e65f2077d26036bea46031",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
