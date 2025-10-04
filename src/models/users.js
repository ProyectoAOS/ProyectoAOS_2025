import db from "../firebase.js";

import { collection } from "firebase/firestore";

export const userCollection = collection(db, "users");

export const userModel = {
    name: "",
    correo: "",
    password: "",
    createdAt: new Date(),
}