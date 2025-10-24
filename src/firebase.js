import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC_rgQypceldw5rSJm1dX-4lSawsF7m0PI",
  authDomain: "proyectoaos-2025.firebaseapp.com",
  projectId: "proyectoaos-2025",
  storageBucket: "proyectoaos-2025.firebasestorage.app",
  messagingSenderId: "858537104949",
  appId: "1:858537104949:web:cac9d7a29d4ce6d9bfc37c",
  measurementId: "G-M96F6EQCFW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Iniciar BD
const db = getFirestore(app);

// Iniciar Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default db;
const analytics = getAnalytics(app);
