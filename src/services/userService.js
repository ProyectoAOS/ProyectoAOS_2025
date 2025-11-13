<<<<<<< Updated upstream
import { addDoc, getDocs } from "firebase/firestore";
=======
import { addDoc, getDocs, query, where } from "firebase/firestore";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
>>>>>>> Stashed changes
import { userModel, userCollection } from "../models/users";

export const createUser = async (userData) => {
  try {
    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.correo, 
      userData.password
    );
    
    const user = userCredential.user;

    // Guardar datos adicionales en Firestore (sin la contraseña)
    const data = {
      ...userModel,
      name: userData.name,
      correo: userData.correo,
      createdAt: userData.createdAt || new Date(),
      uid: user.uid, // Guardar el UID de Firebase Auth
    };
    
    // No guardar la contraseña en Firestore ya que Firebase Auth la maneja
    delete data.password;
    
    const docRef = await addDoc(userCollection, data);

    return docRef.id;
  } catch (error) {
    console.error("Error al crear usuario: ", error);
    
    // Manejar errores específicos de Firebase Auth
    switch (error.code) {
      case "auth/email-already-in-use":
        throw new Error("Este correo ya está registrado");
      case "auth/invalid-email":
        throw new Error("Correo electrónico inválido");
      case "auth/weak-password":
        throw new Error("La contraseña es muy débil");
      default:
        throw error;
    }
  }
};

<<<<<<< Updated upstream
//getUser:
=======
export const loginUser = async (email, password) => {
  try {
    // Autenticar con Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Buscar datos adicionales del usuario en Firestore
    const q = query(userCollection, where("correo", "==", email));
    const querySnapshot = await getDocs(q);

    let userData = {
      id: user.uid,
      name: user.displayName || email.split('@')[0],
      correo: user.email,
      createdAt: user.metadata.creationTime,
    };

    // Si existe en Firestore, usar esos datos
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const firestoreData = userDoc.data();
      userData = {
        id: userDoc.id,
        name: firestoreData.name,
        correo: firestoreData.correo,
        createdAt: firestoreData.createdAt,
      };
    }

    return userData;
  } catch (error) {
    console.error("Error al iniciar sesión: ", error);
    
    // Manejar errores específicos de Firebase Auth
    switch (error.code) {
      case "auth/user-not-found":
        throw new Error("Usuario no encontrado");
      case "auth/wrong-password":
        throw new Error("Contraseña incorrecta");
      case "auth/invalid-email":
        throw new Error("Correo electrónico inválido");
      case "auth/user-disabled":
        throw new Error("Usuario deshabilitado");
      case "auth/too-many-requests":
        throw new Error("Demasiados intentos. Intenta más tarde");
      default:
        throw new Error(error.message || "Error al iniciar sesión");
    }
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

// Login con Facebook
export const loginWithFacebook = async () => {
  try {
    // Iniciar sesión con popup
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;

    // Verificar si el usuario ya existe en Firestore
    const q = query(userCollection, where("correo", "==", user.email));
    const querySnapshot = await getDocs(q);

    let userId;
    let userData;

    if (querySnapshot.empty) {
      // Si no existe, crear un nuevo usuario en Firestore
      const newUser = {
        name: user.displayName || "Usuario Facebook",
        correo: user.email,
        password: "", // No almacenamos contraseña para usuarios de Facebook
        createdAt: new Date(),
        authProvider: "facebook",
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
      authProvider: "facebook",
      createdAt: userData.createdAt,
    };
  } catch (error) {
    console.error("Error completo al iniciar sesión con Facebook: ", error);
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
      throw new Error("Autenticación con Facebook no habilitada en Firebase.");
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error("Ya existe una cuenta con este correo usando otro proveedor.");
    } else {
      throw new Error(`Error: ${error.message || "Error al iniciar sesión con Facebook"}`);
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
>>>>>>> Stashed changes
