// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBA8MZjJV0Bww3b25JpE5VzHE9SklvGSRE",
  authDomain: "tokenforge-v1.firebaseapp.com",
  projectId: "tokenforge-v1",
  storageBucket: "tokenforge-v1.firebasestorage.app",
  messagingSenderId: "1007265484406",
  appId: "1:1007265484406:web:3ba577e1973a0fae6a5957",
  measurementId: "G-KNRV998H66"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export default app;
