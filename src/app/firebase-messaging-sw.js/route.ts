import { getFirebaseWebConfig } from "@/lib/firebase/config";

export async function GET() {
  const config = getFirebaseWebConfig();
  if (!config) {
    return new Response("// Firebase not configured", {
      headers: { "Content-Type": "application/javascript" },
    });
  }

  const body = `
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "CareConnect";
  const options = {
    body: payload.notification?.body ?? "",
    icon: "/icons/notification-icon.svg",
    data: payload.data ?? {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(clients.openWindow(url));
});
`.trim();

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-cache",
    },
  });
}
