import db from "../firebase.js";
import { collection } from "firebase/firestore";

export const auditCollection = collection(db, "audit_logs");

export const auditModel = {
  userId: "",
  userName: "",
  userEmail: "",
  action: "", 
  authProvider: "", 
  timestamp: new Date(),
  ipAddress: "",
  userAgent: "",
  platform: "",
  language: "",
  success: true,
  errorMessage: "",
  merged: false, 
  primaryUid: "", 
  alternativeUid: "", 
};