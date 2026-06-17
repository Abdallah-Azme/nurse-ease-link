import "server-only";

import { deleteFcmTokenByValue, getFcmTokensForUsers } from "@/db/queries/fcm";

import { getMessaging } from "./admin";

export type PushPayload = {
  title: string;
  body: string;
  /** In-app route when notification is tapped */
  url?: string;
  /** Logical event name for logging */
  event?: string;
  priority?: "high" | "normal";
};

export type PushResult = {
  sent: number;
  failed: number;
  skipped: boolean;
};

export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload,
): Promise<PushResult> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (!uniqueIds.length) {
    return { sent: 0, failed: 0, skipped: true };
  }

  const tokens = await getFcmTokensForUsers(uniqueIds);
  if (!tokens.length) {
    if (process.env.NODE_ENV === "development") {
      console.log("[FCM] No tokens for users:", uniqueIds, payload.title);
    }
    return { sent: 0, failed: 0, skipped: true };
  }

  const messaging = getMessaging();
  if (!messaging) {
    if (process.env.NODE_ENV === "development") {
      console.log("[FCM stub]", { userIds: uniqueIds, ...payload });
    }
    return { sent: 0, failed: 0, skipped: true };
  }

  let sent = 0;
  let failed = 0;

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      url: payload.url ?? "/",
      event: payload.event ?? "generic",
    },
    android: {
      priority: payload.priority === "high" ? "high" : "normal",
      notification: { channelId: "careconnect_alerts" },
    },
    apns: {
      headers: {
        "apns-priority": payload.priority === "high" ? "10" : "5",
      },
      payload: {
        aps: {
          sound: payload.priority === "high" ? "default" : undefined,
        },
      },
    },
    webpush: {
      headers: {
        Urgency: payload.priority === "high" ? "high" : "normal",
      },
      fcmOptions: {
        link: payload.url ?? "/",
      },
    },
  });

  sent = response.successCount;
  failed = response.failureCount;

  response.responses.forEach((res, index) => {
    if (
      !res.success &&
      (res.error?.code === "messaging/invalid-registration-token" ||
        res.error?.code === "messaging/registration-token-not-registered")
    ) {
      void deleteFcmTokenByValue(tokens[index]!);
    }
  });

  return { sent, failed, skipped: false };
}
