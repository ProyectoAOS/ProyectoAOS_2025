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

// getClients:
export const getClients = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "clients"));
    const clients = [];
    querySnapshot.forEach((docSnap) => {
      clients.push({ id: docSnap.id, ...docSnap.data() });
    });
    return clients;
  } catch (error) {
    console.error("Error al obtener clientes: ", error);
    throw error;
  }
};

// updateClient:
export const updateClient = async (id, updatedData) => {
  try {
    const docRef = doc(db, "clients", id);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error("Error al actualizar cliente: ", error);
    throw error;
  }
};

// deleteClient:
export const deleteClient = async (id) => {
  try {
    const docRef = doc(db, "clients", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error al eliminar cliente: ", error);
    throw error;
  }
};
