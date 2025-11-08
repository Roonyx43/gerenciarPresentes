// src/firebaseAdmin.js
import fs from "node:fs";
import admin from "firebase-admin";

function loadServiceAccount() {
  let raw;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
    raw = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf8");
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    raw = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8");
  } else {
    throw new Error("Credencial ausente (B64, JSON ou arquivo)");
  }

  const sa = JSON.parse(raw);
  if (typeof sa.private_key === "string") {
    sa.private_key = sa.private_key
      .replace(/\\n/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
  }
  return sa;
}

const serviceAccount = loadServiceAccount();

if (!admin.apps?.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const bucket = admin.storage().bucket();