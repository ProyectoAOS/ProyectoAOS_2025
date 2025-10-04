import db from "../firebase";
import { collection } from "firebase/firestore";

export const clientCollection = collection(db, "clients");

export const clientModel = {
    nombre: "",
    identificacion: "",
    telefono: "",
    correo: "",
    direccion: ""
};

export class Client {
  constructor({ nombre, identificacion, telefono, correo, direccion }) {
    this.nombre = nombre;
    this.identificacion = identificacion;
    this.telefono = telefono;
    this.correo = correo;
    this.direccion = direccion;
  }
}

