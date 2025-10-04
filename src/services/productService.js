import {
  addDoc,
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

