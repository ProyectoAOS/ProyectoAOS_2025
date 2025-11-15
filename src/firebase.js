import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider } from "firebase/auth";

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

// Configurar Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Configurar GitHub Provider
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email'); // Solicitar acceso a emails
githubProvider.addScope('read:user');  // Solicitar acceso a perfil

// Configurar Facebook Provider
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');

export default db;
const analytics = getAnalytics(app);
