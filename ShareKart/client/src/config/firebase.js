import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnRU_GEz8Q08B-RdS7uxfIBcyZHa4-Gzk",
  authDomain: "sharekart-app.firebaseapp.com",
  projectId: "sharekart-app",
  storageBucket: "sharekart-app.firebasestorage.app",
  messagingSenderId: "1042824032927",
  appId: "1:1042824032927:web:c87f2c3c26096c3f43a8aa",
  measurementId: "G-V2RF3NVCQC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
