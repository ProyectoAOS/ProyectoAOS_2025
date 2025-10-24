import { addDoc, getDocs, query, where } from "firebase/firestore";
import { signInWithPopup } from "firebase/auth";
import { userModel, userCollection } from "../models/users";
import { auth, googleProvider, githubProvider } from "../firebase";

export const createUser = async (userData) => {
  try {
    const data = { ...userModel, ...userData };
    const docRef = await addDoc(userCollection, data);

    return docRef.id;
  } catch (error) {
    console.error("Error al crear usuario: ", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    // Crear una consulta para buscar el usuario por correo
    const q = query(userCollection, where("correo", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Usuario no encontrado");
    }

    // Obtener el primer documento que coincida
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Verificar la contraseña
    if (userData.password !== password) {
      throw new Error("Contraseña incorrecta");
    }

    // Retornar los datos del usuario (sin la contraseña)
    return {
      id: userDoc.id,
      name: userData.name,
      correo: userData.correo,
      createdAt: userData.createdAt,
    };
  } catch (error) {
    console.error("Error al iniciar sesión: ", error);
    throw error;
  }
};


// Login con Google
export const loginWithGoogle = async () => {
  try {
    // Configurar el provider para forzar selección de cuenta
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Iniciar sesión con popup
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Verificar si el usuario ya existe en Firestore
    const q = query(userCollection, where("correo", "==", user.email));
    const querySnapshot = await getDocs(q);

    let userId;
    let userData;

    if (querySnapshot.empty) {
      // Si no existe, crear un nuevo usuario en Firestore
      const newUser = {
        name: user.displayName || "Usuario Google",
        correo: user.email,
        password: "", // No almacenamos contraseña para usuarios de Google
        createdAt: new Date(),
        authProvider: "google",
        photoURL: user.photoURL || "",
      };

      const docRef = await addDoc(userCollection, newUser);
      userId = docRef.id;
      userData = newUser;
    } else {
      // Si existe, obtener sus datos
      const userDoc = querySnapshot.docs[0];
      userId = userDoc.id;
      userData = userDoc.data();
    }

    // Retornar los datos del usuario
    return {
      id: userId,
      name: userData.name,
      correo: userData.correo,
      photoURL: userData.photoURL || user.photoURL || "",
      authProvider: "google",
      createdAt: userData.createdAt,
    };
  } catch (error) {
    console.error("Error completo al iniciar sesión con Google: ", error);
    console.error("Código de error: ", error.code);
    console.error("Mensaje de error: ", error.message);
    
    // Manejar errores específicos
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Inicio de sesión cancelado");
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error("Popup bloqueado por el navegador. Por favor, permite popups en este sitio.");
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error("Dominio no autorizado. Configura el dominio en Firebase Console.");
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error("Autenticación con Google no habilitada en Firebase.");
    } else {
      throw new Error(`Error: ${error.message || "Error al iniciar sesión con Google"}`);
    }
  }
};

// Login con GitHub
export const loginWithGithub = async () => {
  try {
    // Configurar el provider para forzar selección de cuenta
    githubProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Iniciar sesión con popup
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    // Verificar si el usuario ya existe en Firestore
    const q = query(userCollection, where("correo", "==", user.email));
    const querySnapshot = await getDocs(q);

    let userId;
    let userData;

    if (querySnapshot.empty) {
      // Si no existe, crear un nuevo usuario en Firestore
      const newUser = {
        name: user.displayName || "Usuario GitHub",
        correo: user.email,
        password: "", // No almacenamos contraseña para usuarios de GitHub
        createdAt: new Date(),
        authProvider: "github",
        photoURL: user.photoURL || "",
      };

      const docRef = await addDoc(userCollection, newUser);
      userId = docRef.id;
      userData = newUser;
    } else {
      // Si existe, obtener sus datos
      const userDoc = querySnapshot.docs[0];
      userId = userDoc.id;
      userData = userDoc.data();
    }

    // Retornar los datos del usuario
    return {
      id: userId,
      name: userData.name,
      correo: userData.correo,
      photoURL: userData.photoURL || user.photoURL || "",
      authProvider: "github",
      createdAt: userData.createdAt,
    };
  } catch (error) {
    console.error("Error completo al iniciar sesión con GitHub: ", error);
    console.error("Código de error: ", error.code);
    console.error("Mensaje de error: ", error.message);
    
    // Manejar errores específicos
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Inicio de sesión cancelado");
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error("Popup bloqueado por el navegador. Por favor, permite popups en este sitio.");
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error("Dominio no autorizado. Configura el dominio en Firebase Console.");
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error("Autenticación con GitHub no habilitada en Firebase.");
    } else {
      throw new Error(`Error: ${error.message || "Error al iniciar sesión con GitHub"}`);
    }
  }
};

// Obtener todos los usuarios
export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(userCollection);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return users;
  } catch (error) {
    console.error("Error al obtener usuarios: ", error);
    throw error;
  }
};
