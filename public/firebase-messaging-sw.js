/* eslint-disable no-undef */

importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging-compat.js");

const params = new URLSearchParams(self.location.search);
const config = {
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};

if (self.firebase && self.firebase.initializeApp && config.apiKey) {
  try {
    self.firebase.initializeApp(config);
    const messaging = self.firebase.messaging();

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
  } catch {
    // Silent fallback if the worker loads without Firebase config.
  }
}
