// Servicio para manejo de clientes
import {
  addDoc,
  getDocs,
  collection,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import db from "../firebase.js";
import { clientModel, clientCollection } from "../models/clients";

// createClient:
export const createClient = async (clientData) => {
  try {
    const data = {
      ...clientModel,
      ...clientData,
    };
    const docRef = await addDoc(clientCollection, data);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear cliente: ", error);
    throw error;
  }
};