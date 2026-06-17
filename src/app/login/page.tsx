"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

const DEMO_ACCOUNTS = [
  { role: "patient", email: "patient@careconnect.demo", label: "Patient (Amelia Hart)" },
  { role: "nurse", email: "nurse@careconnect.demo", label: "Nurse (Jordan Reyes)" },
  { role: "doctor", email: "doctor@careconnect.demo", label: "Doctor (Dr. Mei Chen)" },
  { role: "admin", email: "admin@careconnect.demo", label: "Admin (Sasha Ortiz)" },
];

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleHint = searchParams.get("role");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    const account = DEMO_ACCOUNTS.find((a) => a.email === email);
    const home = account ? `/${account.role}` : "/";
    window.location.href = searchParams.get("callbackUrl") ?? home;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-10 w-10 grid place-items-center rounded-xl bg-primary text-primary-foreground">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="font-display text-xl font-semibold">CareConnect</span>
        </div>

        <div className="metric-card">
          <h1 className="font-display text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Demo password for all accounts: <code className="text-foreground">demo123</code>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Quick demo login
            </p>
            <div className="grid gap-2">
              {DEMO_ACCOUNTS.filter((a) => !roleHint || a.role === roleHint).map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword("demo123");
                  }}
                  className="text-left rounded-lg border bg-background/40 px-3 py-2 text-sm hover:bg-accent transition"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:text-foreground">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
