import "server-only";

import { collections } from "@/db/mongo/collections";
import { getMessaging } from "@/lib/firebase/admin";
import { deleteFcmTokenByValue, getFcmTokensForUsers } from "@/db/queries/fcm";
import { insertNotificationDelivery } from "@/db/repositories/writes";

const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 20;

type PushJobPayload = {
  userIds: string[];
  title: string;
  body: string;
  url?: string;
  event?: string;
  priority?: "high" | "normal";
};

export async function processOutboxOnce() {
  const { outboxJobs, notifications } = await collections();
  const now = new Date();
  const jobs = await outboxJobs
    .find({
      status: { $in: ["pending", "retrying"] },
      availableAt: { $lte: now },
    })
    .sort({ availableAt: 1 })
    .limit(BATCH_SIZE)
    .toArray();

  let processed = 0;
  for (const job of jobs) {
    await outboxJobs.updateOne(
      { id: job.id, status: job.status },
      { $set: { status: "processing", updatedAt: now } },
    );
    const payload = job.payload as Partial<PushJobPayload>;
    if (job.type !== "push" || !payload.userIds?.length || !payload.title || !payload.body) {
      await outboxJobs.updateOne({ id: job.id }, {
        $set: {
          status: "failed",
          updatedAt: now,
          lastError: "Invalid outbox payload",
        },
      } as never);
      continue;
    }

    try {
      const tokens = await getFcmTokensForUsers(payload.userIds);
      if (!tokens.length) {
        await outboxJobs.updateOne(
          { id: job.id },
          {
            $set: { status: "sent", updatedAt: now },
          },
        );
        processed += 1;
        continue;
      }

      const messaging = getMessaging();
      if (!messaging) {
        await outboxJobs.updateOne(
          { id: job.id },
          {
            $set: {
              status: "retrying",
              attempts: (job.attempts ?? 0) + 1,
              availableAt: new Date(now.getTime() + 5 * 60_000),
              updatedAt: now,
            },
          },
        );
        continue;
      }

      const response = await messaging.sendEachForMulticast({
        tokens,
        notification: { title: payload.title, body: payload.body },
        data: { url: payload.url ?? "/", event: payload.event ?? "generic" },
        android: { priority: payload.priority === "high" ? "high" : "normal" },
        webpush: {
          headers: { Urgency: payload.priority === "high" ? "high" : "normal" },
          fcmOptions: { link: payload.url ?? "/" },
        },
      });

      for (let i = 0; i < response.responses.length; i += 1) {
        const res = response.responses[i];
        if (!res?.success) {
          await insertNotificationDelivery({
            id: crypto.randomUUID(),
            notificationId: job.id,
            channel: "push",
            status: "failed",
            attemptCount: (job.attempts ?? 0) + 1,
            failureReason: res.error?.message ?? "Push send failed",
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      response.responses.forEach((res, index) => {
        if (
          !res.success &&
          (res.error?.code === "messaging/invalid-registration-token" ||
            res.error?.code === "messaging/registration-token-not-registered")
        ) {
          void deleteFcmTokenByValue(tokens[index]!);
        }
      });

      await outboxJobs.updateOne({ id: job.id }, {
        $set: {
          status: response.failureCount > 0 ? "retrying" : "sent",
          attempts: (job.attempts ?? 0) + 1,
          availableAt: response.failureCount > 0 ? new Date(now.getTime() + 5 * 60_000) : now,
          updatedAt: now,
          lastError: response.failureCount > 0 ? "Some push deliveries failed" : null,
        },
      } as never);
      processed += 1;
    } catch (error) {
      const attempts = (job.attempts ?? 0) + 1;
      await outboxJobs.updateOne({ id: job.id }, {
        $set: {
          status: attempts >= MAX_ATTEMPTS ? "failed" : "retrying",
          attempts,
          availableAt: new Date(now.getTime() + attempts * 5 * 60_000),
          updatedAt: now,
          lastError: error instanceof Error ? error.message : "Unknown outbox failure",
        },
      } as never);
      if (attempts >= MAX_ATTEMPTS) {
        await outboxJobs.updateOne({ id: job.id }, { $set: { deadLetteredAt: now } } as never);
      }
    }
  }

  return { processed };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  processOutboxOnce()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
