import db from "../firebase";

import { collection } from "firebase/firestore";

export const productCollection = collection(db, "products");

export const productModel = {
    name: "",
    category: "",
    price: 0,
    description: "",
    image: "",
};