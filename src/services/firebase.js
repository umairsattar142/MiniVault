import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFpGiSXu3Fb8vld6gIA19Pbpk_mAPv5T4",
  authDomain: "token-generator-28ae1.firebaseapp.com",
  projectId: "token-generator-28ae1",
  storageBucket: "token-generator-28ae1.firebasestorage.app",
  messagingSenderId: "1094463924",
  appId: "1:1094463924:web:d151fe37136e51b31902e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };