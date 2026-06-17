import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging as getAdminMessaging, type Messaging } from "firebase-admin/messaging";

import { isFirebaseAdminConfigured } from "./config";

export function getFirebaseAdmin(): App | null {
  if (!isFirebaseAdminConfigured()) return null;

  if (!getApps().length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey,
      }),
    });
  }

  return getApps()[0] ?? null;
}

export function getMessaging(): Messaging | null {
  const app = getFirebaseAdmin();
  if (!app) return null;
  return getAdminMessaging(app);
}
