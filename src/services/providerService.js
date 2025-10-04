import {
  addDoc,
  getDocs,
  collection,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import db from "../firebase.js";

import { providerModel, providerCollection } from "../models/provider.js";

// createProvider:
export const createProvider = async (providerData) => {
  try {
    const data = {
      ...providerModel,
      ...providerData,
    };
    const docRef = await addDoc(providerCollection, data);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear proveedor: ", error);
    throw error;
  }
};