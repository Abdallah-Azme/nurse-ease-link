"use client";

import { ArrowRight, Heart, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { registerAccount } from "@/actions/registration";
import type { RegistrationInput } from "@/lib/registration";

type Role = "patient" | "nurse" | "doctor";

const inputClass =
  "mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("patient");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [registered, setRegistered] = useState<{ role: Role; status: "active" | "pending" } | null>(
    null,
  );

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");
    setFieldErrors({});

    const input: RegistrationInput = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
      role,
      age: role === "patient" ? Number(formData.get("age") ?? 0) : undefined,
      sex: role === "patient" ? (String(formData.get("sex") ?? "") as "F" | "M") : undefined,
      conditions: role === "patient" ? String(formData.get("conditions") ?? "") : "",
      specialty: role !== "patient" ? String(formData.get("specialty") ?? "") : "",
    };

    const result = await registerAccount(input);
    setPending(false);

    if (!result.ok) {
      setMessage(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }

    setRegistered(result.data);
  }

  if (registered) {
    const awaitingApproval = registered.status === "pending";
    return (
      <main className="min-h-screen grid place-items-center bg-background px-4">
        <div className="metric-card w-full max-w-md text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-success/15 text-success grid place-items-center">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold">
            {awaitingApproval ? "Registration submitted" : "Account created"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {awaitingApproval
              ? "An administrator must approve your clinical staff account before you can sign in."
              : "Your patient account is ready. Sign in to open your workspace."}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Go to sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="mb-7 flex items-center justify-center gap-2.5">
          <span className="h-10 w-10 grid place-items-center rounded-xl bg-primary text-primary-foreground">
            <Heart className="h-5 w-5" fill="currentColor" />
          </span>
          <span className="font-display text-xl font-semibold">CareConnect</span>
        </Link>

        <div className="metric-card">
          <h1 className="font-display text-2xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Patient accounts are ready immediately. Nurse and doctor accounts require admin
            approval.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2" role="group" aria-label="Account type">
            {(["patient", "nurse", "doctor"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setRole(option);
                  setFieldErrors({});
                  setMessage("");
                }}
                aria-pressed={role === option}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium capitalize ${
                  role === option ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <form action={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="name" error={fieldErrors.name?.[0]} />
            <Field label="Email" name="email" type="email" error={fieldErrors.email?.[0]} />

            {role === "patient" ? (
              <>
                <Field label="Age" name="age" type="number" error={fieldErrors.age?.[0]} />
                <label className="text-sm font-medium">
                  Sex
                  <select name="sex" required className={inputClass} defaultValue="">
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="F">Female</option>
                    <option value="M">Male</option>
                  </select>
                  <FieldError message={fieldErrors.sex?.[0]} />
                </label>
                <label className="text-sm font-medium sm:col-span-2">
                  Health conditions <span className="text-muted-foreground">(optional)</span>
                  <input
                    name="conditions"
                    className={inputClass}
                    placeholder="For example: Hypertension, Diabetes"
                  />
                </label>
              </>
            ) : (
              <label className="text-sm font-medium sm:col-span-2">
                Specialty
                <input
                  name="specialty"
                  required
                  className={inputClass}
                  placeholder={
                    role === "nurse" ? "For example: Home care" : "For example: Cardiology"
                  }
                />
                <FieldError message={fieldErrors.specialty?.[0]} />
              </label>
            )}

            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              error={fieldErrors.password?.[0]}
            />
            <Field
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              error={fieldErrors.confirmPassword?.[0]}
            />

            <p className="text-xs text-muted-foreground sm:col-span-2">
              Use at least 8 characters with uppercase, lowercase, and a number.
            </p>
            {message && (
              <p role="alert" className="text-sm text-destructive sm:col-span-2">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {pending ? "Creating account..." : `Register as ${role}`}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input name={name} type={type} required autoComplete={autoComplete} className={inputClass} />
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="mt-1 block text-xs text-destructive">{message}</span> : null;
}
