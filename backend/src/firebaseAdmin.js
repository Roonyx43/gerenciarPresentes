import admin from "firebase-admin";
import path from "node:path";

// ✅ Caminho para seu JSON local (somente em dev)
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
  (await import(path.resolve("src/config/serviceAccountKey.json"), { assert: { type: "json" } })).default
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE,
});

export const bucket = admin.storage().bucket();
