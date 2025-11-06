// src/firebaseAdmin.js
import admin from "firebase-admin";

function loadServiceAccount() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON ausente");
  }
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  // Se vier com \n escapado, normaliza:
  if (typeof sa.private_key === "string") {
    sa.private_key = sa.private_key.replace(/\\n/g, "\n");
  }
  return sa;
}

const serviceAccount = loadServiceAccount();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // -> d-a-dext-50c31.appspot.com
});

export const bucket = admin.storage().bucket();