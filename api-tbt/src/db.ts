import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || "focus-infusion-463923-t8",
  });
  console.log("Admin init project:", process.env.GOOGLE_CLOUD_PROJECT);
}

// 👇 indica explícitamente el databaseId
export const db = getFirestore("tbtdb");

// helpers opcionales
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
