import { z } from "zod";

export const registrationRoles = ["patient", "nurse", "doctor"] as const;

export const registrationSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128)
      .regex(/[a-z]/, "Password must contain a lowercase letter.")
      .regex(/[A-Z]/, "Password must contain an uppercase letter.")
      .regex(/\d/, "Password must contain a number."),
    confirmPassword: z.string(),
    role: z.enum(registrationRoles),
    age: z.coerce.number().int().min(1).max(120).optional(),
    sex: z.enum(["F", "M"]).optional(),
    conditions: z.string().trim().max(500).optional().default(""),
    specialty: z.string().trim().max(120).optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }

    if (data.role === "patient") {
      if (!data.age) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["age"],
          message: "Age is required for patients.",
        });
      }
      if (!data.sex) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sex"],
          message: "Sex is required for patients.",
        });
      }
    } else if (!data.specialty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["specialty"],
        message: "Specialty is required for clinical staff.",
      });
    }
  });

export type RegistrationInput = z.input<typeof registrationSchema>;

export function registrationFieldErrors(error: z.ZodError) {
  return error.flatten().fieldErrors as Record<string, string[]>;
}
