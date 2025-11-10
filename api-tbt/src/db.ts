// src/db.ts
import admin from "firebase-admin";

/**
 * Inicializa el cliente de Firestore de forma segura y única.
 * Usa Application Default Credentials (ADC) en GCP (App Hosting, Cloud Run, etc.),
 * o GOOGLE_APPLICATION_CREDENTIALS en local.
 */

if (!admin.apps.length) {
  admin.initializeApp({
    // No pongas credenciales explícitas si estás en GCP/App Hosting.
    // Firebase detectará automáticamente las credenciales del entorno.
    projectId: process.env.GCLOUD_PROJECT || "focus-infusion-463923-t8",
  });
}

// Exporta la instancia de Firestore
export const db = admin.firestore();

// Exporta también algunos helpers útiles
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
