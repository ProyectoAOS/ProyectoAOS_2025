import { addDoc, getDocs, query, where } from "firebase/firestore";
import { userModel, userCollection } from "../models/users";

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

// Login de usuario
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
