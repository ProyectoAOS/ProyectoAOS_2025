import db from "../firebase";
import { collection } from "firebase/firestore";


export const providerCollection = collection(db, "providers");

export const providerModel = {
    name: "",
    nit: "",
    phone: "",
    email: "",
    address: "",
    cityCountry: "",
    category: "",
    description: "",
    status: "Activo",
};