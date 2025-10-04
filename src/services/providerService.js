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

// getProviders:
export const getProviders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "providers"));
    const providers = [];

    querySnapshot.forEach((docSnap) => {
      providers.push({ id: docSnap.id, ...docSnap.data() });
    });

    return providers;
  } catch (error) {
    console.error("Error al obtener proveedores: ", error);
    throw error;
  }
};