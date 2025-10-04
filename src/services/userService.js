import { addDoc, getDocs } from "firebase/firestore";
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

//getUser:
