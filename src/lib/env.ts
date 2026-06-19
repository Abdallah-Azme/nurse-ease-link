import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_EMERGENCY_PHONE: z.string().min(3).default("tel:112"),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }
  return cachedEnv;
}

export function getEmergencyPhoneHref() {
  return getEnv().NEXT_PUBLIC_EMERGENCY_PHONE;
}
