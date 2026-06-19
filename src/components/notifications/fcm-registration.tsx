"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { registerFcmToken } from "@/actions/notifications";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export function FcmRegistration() {
  const { data: session, status } = useSession();
  const registeredRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    if (!isFirebaseConfigured()) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    let cancelled = false;

    async function setup() {
      try {
        const { initializeApp, getApps } = await import("firebase/app");
        const { getMessaging, getToken, onMessage, isSupported } =
          await import("firebase/messaging");

        if (!(await isSupported())) return;

        const config = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
        };

        const app = getApps().length ? getApps()[0]! : initializeApp(config);

        if ("serviceWorker" in navigator) {
          const swUrl =
            `/firebase-messaging-sw.js?apiKey=${encodeURIComponent(config.apiKey)}` +
            `&authDomain=${encodeURIComponent(config.authDomain)}` +
            `&projectId=${encodeURIComponent(config.projectId)}` +
            `&messagingSenderId=${encodeURIComponent(config.messagingSenderId)}` +
            `&appId=${encodeURIComponent(config.appId)}`;
          await navigator.serviceWorker.register(swUrl, { scope: "/" });
        }

        const permission =
          Notification.permission === "default"
            ? await Notification.requestPermission()
            : Notification.permission;

        if (permission !== "granted" || cancelled) return;

        const messaging = getMessaging(app);
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
          serviceWorkerRegistration: await navigator.serviceWorker.ready,
        });

        if (!token || cancelled || registeredRef.current === token) return;

        const result = await registerFcmToken(token);
        if (result.ok) {
          registeredRef.current = token;
        }

        onMessage(messaging, (payload) => {
          const title = payload.notification?.title ?? "CareConnect";
          const body = payload.notification?.body ?? "";
          toast(title, { description: body });
        });
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[FCM] Registration skipped:", err);
        }
      }
    }

    void setup();
    return () => {
      cancelled = true;
    };
  }, [session?.user, status]);

  return null;
}
