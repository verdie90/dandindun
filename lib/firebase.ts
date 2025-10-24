import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDV7zJWxd-6nADsxLAj4K0AR3G5MMTou-M",
  authDomain: "dandindun-7dc85.firebaseapp.com",
  projectId: "dandindun-7dc85",
  storageBucket: "dandindun-7dc85.firebasestorage.app",
  messagingSenderId: "449164779053",
  appId: "1:449164779053:web:c14976ffb9af36014962a4",
  measurementId: "G-JNJMMZC03K",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
