"use server";

import { z } from "zod";

import { deleteFcmToken, upsertFcmToken } from "@/db/queries/fcm";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getSessionOrThrow } from "@/lib/safe-action";

const tokenSchema = z.object({
  token: z.string().min(1),
});

export async function registerFcmToken(token: string): Promise<ActionResult<void>> {
  try {
    const session = await getSessionOrThrow();
    const parsed = tokenSchema.safeParse({ token });
    if (!parsed.success) return fail("Invalid token.");

    await upsertFcmToken(session.user.id, parsed.data.token);
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to register token.");
  }
}

export async function unregisterFcmToken(token: string): Promise<ActionResult<void>> {
  try {
    const session = await getSessionOrThrow();
    const parsed = tokenSchema.safeParse({ token });
    if (!parsed.success) return fail("Invalid token.");

    await deleteFcmToken(session.user.id, parsed.data.token);
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to unregister token.");
  }
}
