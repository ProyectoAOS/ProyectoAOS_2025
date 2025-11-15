import { addDoc, getDocs, query, where, updateDoc, doc, setDoc, getDoc, collection } from "firebase/firestore";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { userModel, userCollection } from "../models/users";
import db, { auth, googleProvider, githubProvider, facebookProvider } from "../firebase";
import { logAuditEvent } from "./auditService";

// Función para crear o actualizar usuario usando UID como ID del documento
const createOrUpdateUser = async (user, providerName) => {
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    const userData = {
      name: user.displayName || `Usuario ${providerName}`,
      correo: user.email,
      photoURL: user.photoURL || "",
      uid: user.uid,
      lastLoginAt: new Date(),
    };

    if (userDoc.exists()) {
      // Usuario existe, actualizar solo ciertos campos
      const existingData = userDoc.data();
      const providers = existingData.providers || [];
      const providerLower = providerName.toLowerCase();
      
      if (!providers.includes(providerLower)) {
        providers.push(providerLower);
      }

      await updateDoc(userDocRef, {
        providers: providers,
        photoURL: user.photoURL || existingData.photoURL || "",
        lastLoginAt: new Date(),
        name: user.displayName || existingData.name,
      });

      // Registrar login en auditoría
      await logAuditEvent({
        userId: user.uid,
        userName: existingData.name,
        userEmail: existingData.correo,
        action: "login",
        authProvider: providerLower,
        success: true,
        merged: false,
      });

      return {
        id: user.uid,
        name: existingData.name,
        correo: existingData.correo,
        photoURL: user.photoURL || existingData.photoURL || "",
        providers: providers,
        createdAt: existingData.createdAt,
      };
    } else {
      // Verificar si existe otro usuario con el mismo email (diferente UID)
      console.log("==========================================");
      console.log(`🔍 BUSCANDO USUARIO EXISTENTE`);
      console.log(`Email a buscar: ${user.email}`);
      console.log("==========================================");
      
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("correo", "==", user.email));
      const querySnapshot = await getDocs(q);
      
      console.log(`📊 Resultados de búsqueda: ${querySnapshot.size} usuario(s) encontrado(s)`);
      
      if (!querySnapshot.empty) {
        // Existe otro usuario con el mismo email
        const existingUserDoc = querySnapshot.docs[0];
        const existingUserData = existingUserDoc.data();
        const existingUid = existingUserDoc.id;
        
        console.log("==========================================");
        console.log(`✅ USUARIO EXISTENTE ENCONTRADO - CONSOLIDANDO`);
        console.log("==========================================");
        console.log(`UID Existente: ${existingUid}`);
        console.log(`UID Nuevo: ${user.uid}`);
        console.log(`Proveedores existentes:`, existingUserData.providers);
        console.log(`Nuevo proveedor: ${providerName}`);
        console.log("==========================================");
        
        const existingUserDocRef = doc(db, "users", existingUid);
        const providers = existingUserData.providers || [];
        const providerLower = providerName.toLowerCase();
        
        if (!providers.includes(providerLower)) {
          providers.push(providerLower);
          console.log(`➕ Agregando proveedor ${providerLower} a la lista`);
        }
        
        console.log("🔄 Actualizando documento principal en Firestore...");
        await updateDoc(existingUserDocRef, {
          providers: providers,
          [`alternativeUIDs.${providerLower}`]: user.uid,
          photoURL: user.photoURL || existingUserData.photoURL || "",
          lastLoginAt: new Date(),
        });
        
        console.log("🔄 Creando documento secundario...");
        await setDoc(userDocRef, {
          ...existingUserData,
          uid: user.uid,
          primaryUid: existingUid,
          providers: providers,
          photoURL: user.photoURL || existingUserData.photoURL || "",
          lastLoginAt: new Date(),
        });
        
        // Registrar consolidación en auditoría
        await logAuditEvent({
          userId: existingUid,
          userName: existingUserData.name,
          userEmail: existingUserData.correo,
          action: "account_merge",
          authProvider: providerLower,
          success: true,
          merged: true,
          primaryUid: existingUid,
          alternativeUid: user.uid,
        });
        
        console.log("==========================================");
        console.log("🎉 CONSOLIDACIÓN COMPLETADA");
        console.log("==========================================");
        
        return {
          id: existingUid,
          name: existingUserData.name,
          correo: existingUserData.correo,
          photoURL: user.photoURL || existingUserData.photoURL || "",
          providers: providers,
          createdAt: existingUserData.createdAt,
          merged: true,
        };
      }
      
      console.log(`🆕 No se encontró usuario existente, creando nuevo usuario`);
      
      const newUserData = {
        ...userData,
        providers: [providerName.toLowerCase()],
        createdAt: new Date(),
      };

      await setDoc(userDocRef, newUserData);

      // Registrar registro en auditoría
      await logAuditEvent({
        userId: user.uid,
        userName: newUserData.name,
        userEmail: newUserData.correo,
        action: "register",
        authProvider: providerName.toLowerCase(),
        success: true,
        merged: false,
      });

      return {
        id: user.uid,
        ...newUserData,
      };
    }
  } catch (error) {
    console.error("Error en createOrUpdateUser:", error);
    
    // Registrar error en auditoría
    await logAuditEvent({
      userId: user?.uid || "",
      userName: user?.displayName || "",
      userEmail: user?.email || "",
      action: "login",
      authProvider: providerName.toLowerCase(),
      success: false,
      errorMessage: error.message,
    });
    
    throw error;
  }
};

// Función para registrar el login en una subcolección
const addLoginRecord = async (uid) => {
  try {
    const loginsCollection = collection(db, "users", uid, "logins");
    await addDoc(loginsCollection, {
      loginAt: new Date(),
      timestamp: new Date().getTime(),
    });
  } catch (error) {
    console.error("Error al registrar login:", error);
  }
};

export const createUser = async (userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.correo, 
      userData.password
    );
    
    const user = userCredential.user;
    const userDocRef = doc(db, "users", user.uid);

    const data = {
      name: userData.name,
      correo: userData.correo,
      createdAt: new Date(),
      uid: user.uid,
      providers: ["password"],
      photoURL: "",
      lastLoginAt: new Date(),
    };
    
    await setDoc(userDocRef, data);
    await addLoginRecord(user.uid);

    // Registrar en auditoría
    await logAuditEvent({
      userId: user.uid,
      userName: userData.name,
      userEmail: userData.correo,
      action: "register",
      authProvider: "password",
      success: true,
    });

    return user.uid;
  } catch (error) {
    console.error("Error al crear usuario: ", error);
    
    // Registrar error en auditoría
    await logAuditEvent({
      userId: "",
      userName: userData.name || "",
      userEmail: userData.correo || "",
      action: "register",
      authProvider: "password",
      success: false,
      errorMessage: error.message,
    });
    
    switch (error.code) {
      case "auth/email-already-in-use":
        throw new Error("Este correo ya está registrado");
      case "auth/invalid-email":
        throw new Error("Correo electrónico inválido");
      case "auth/weak-password":
        throw new Error("La contraseña es muy débil (mínimo 6 caracteres)");
      default:
        throw error;
    }
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error("No se encontraron datos del usuario");
    }

    const userData = userDoc.data();

    await updateDoc(userDocRef, {
      lastLoginAt: new Date(),
    });

    await addLoginRecord(user.uid);

    // Registrar en auditoría
    await logAuditEvent({
      userId: user.uid,
      userName: userData.name,
      userEmail: userData.correo,
      action: "login",
      authProvider: "password",
      success: true,
    });

    return {
      id: user.uid,
      name: userData.name,
      correo: userData.correo,
      providers: userData.providers || ["password"],
      photoURL: userData.photoURL || "",
      createdAt: userData.createdAt,
    };
  } catch (error) {
    console.error("Error al iniciar sesión: ", error);
    
    // Registrar error en auditoría
    await logAuditEvent({
      userId: "",
      userName: "",
      userEmail: email || "",
      action: "login",
      authProvider: "password",
      success: false,
      errorMessage: error.message,
    });
    
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
      case "auth/invalid-credential":
        throw new Error("Credenciales inválidas");
      default:
        throw new Error(error.message || "Error al iniciar sesión");
    }
  }
};

export const loginWithGoogle = async () => {
  try {
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userData = await createOrUpdateUser(user, "Google");
    await addLoginRecord(user.uid);

    if (userData.merged) {
      console.log("✅ Cuenta consolidada exitosamente con usuario existente");
    }

    return userData;
    
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
    
    // Registrar error en auditoría
    await logAuditEvent({
      userId: "",
      userName: "",
      userEmail: "",
      action: "login",
      authProvider: "google",
      success: false,
      errorMessage: error.message,
    });
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Inicio de sesión cancelado");
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error("Popup bloqueado. Permite ventanas emergentes para este sitio.");
    } else {
      throw new Error(error.message || "Error al iniciar sesión con Google");
    }
  }
};

export const loginWithGithub = async () => {
  try {
    githubProvider.setCustomParameters({
      prompt: 'select_account',
      allow_signup: 'true'
    });

    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    if (!user.email) {
      throw new Error("GitHub no proporcionó un email. Asegúrate de tener un email público en tu perfil de GitHub.");
    }

    const userData = await createOrUpdateUser(user, "GitHub");
    await addLoginRecord(user.uid);

    if (userData.merged) {
      console.log("✅ Cuenta consolidada exitosamente con usuario existente");
    }

    return userData;
    
  } catch (error) {
    console.error("Error al iniciar sesión con GitHub:", error);
    
    // Registrar error en auditoría
    await logAuditEvent({
      userId: "",
      userName: "",
      userEmail: "",
      action: "login",
      authProvider: "github",
      success: false,
      errorMessage: error.message,
    });
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Inicio de sesión cancelado");
    } else {
      throw new Error(error.message || "Error al iniciar sesión con GitHub");
    }
  }
};

export const loginWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;

    const userData = await createOrUpdateUser(user, "Facebook");
    await addLoginRecord(user.uid);

    if (userData.merged) {
      console.log("✅ Cuenta consolidada exitosamente con usuario existente");
    }

    return userData;
    
  } catch (error) {
    console.error("Error al iniciar sesión con Facebook:", error);
    
    // Registrar error en auditoría
    await logAuditEvent({
      userId: "",
      userName: "",
      userEmail: "",
      action: "login",
      authProvider: "facebook",
      success: false,
      errorMessage: error.message,
    });
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Inicio de sesión cancelado");
    } else {
      throw new Error(error.message || "Error al iniciar sesión con Facebook");
    }
  }
};

// Obtener todos los usuarios
export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(userCollection);
    const users = [];
    const processedUids = new Set(); // Para evitar duplicados
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      
      // Solo agregar si no tiene primaryUid (evitar duplicados de cuentas consolidadas)
      if (!userData.primaryUid && !processedUids.has(doc.id)) {
        users.push({
          id: doc.id,
          ...userData,
        });
        processedUids.add(doc.id);
      }
    });

    console.log(`✅ Se obtuvieron ${users.length} usuarios únicos`);
    return users;
  } catch (error) {
    console.error("Error al obtener usuarios: ", error);
    throw error;
  }
};

// Obtener usuario por UID
export const getUserByUid = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error al obtener usuario por UID:", error);
    throw error;
  }
};