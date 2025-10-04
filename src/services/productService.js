import {
  addDoc,
  getDocs,
  collection
} from "firebase/firestore";
import db from "../firebase.js";

import { productModel, productCollection } from "../models/products.js";

//createProduct:
export const createProduct = async (productData) => {
  try {
    const data = {
      ...productModel,
      ...productData,
    };
    const docRef = await addDoc(productCollection, data);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear producto: ", error);
    throw error;
  }
};

//getProducts:
export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = [];

    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    console.log(querySnapshot);
    return products;
  } catch (error) {
    console.error("Error al obtener prouctos: ", error);
    throw error;
  }
};
