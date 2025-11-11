import * as admin from 'firebase-admin';
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// 1. Inicialización de Firebase Admin
// En entornos de Google Cloud (como Cloud Run), Firebase Admin SDK 
// detecta automáticamente las credenciales de servicio (Service Account) 
// proporcionadas por el entorno.
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || "focus-infusion-463923-t8",
  });
  console.log("Admin init project:", process.env.GOOGLE_CLOUD_PROJECT);
}

// 2. Exportar Instancias de Servicios

// Instancia de Firestore (db)
// La usamos para interactuar con la base de datos (guardar URLs de imágenes, etc.)
const db = getFirestore("tbtdb");

// Instancia de Storage
// La usamos para subir los archivos binarios de las imágenes a Firebase Storage.

const bucket = admin.storage().bucket("gs://focus-infusion-463923-t8.firebasestorage.app");

// 3. Exportar las Referencias
export { db, bucket };
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
