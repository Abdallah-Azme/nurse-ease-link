import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Heart,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 grid place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="font-display text-lg font-semibold">CareConnect</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Link
            href="/login?role=patient"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium hover:bg-primary/90"
          >
            Open demo <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20">
        <div className="max-w-3xl">
          <span className="chip bg-accent text-accent-foreground mb-5">
            <Sparkles className="h-3 w-3" /> AI-assisted clinical care
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight">
            Connected care that <span className="text-primary">never sleeps</span>.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
            CareConnect helps care teams monitor vitals, medication adherence, and emergencies in
            one calm, modern workspace — built for patients, nurses, doctors, and administrators.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/login?role=patient"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary/90 shadow-sm"
            >
              Enter as Patient <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login?role=nurse"
              className="rounded-lg border bg-card px-5 py-3 text-sm font-medium hover:bg-accent"
            >
              Enter as Nurse
            </Link>
            <Link
              href="/login?role=doctor"
              className="rounded-lg border bg-card px-5 py-3 text-sm font-medium hover:bg-accent"
            >
              Enter as Doctor
            </Link>
            <Link
              href="/login?role=admin"
              className="rounded-lg border bg-card px-5 py-3 text-sm font-medium hover:bg-accent"
            >
              Enter as Admin
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-4 gap-4">
          {[
            {
              icon: Heart,
              title: "Patient",
              desc: "Log vitals, medications, daily check-ins, and chat with your care team.",
            },
            {
              icon: Stethoscope,
              title: "Nurse",
              desc: "Monitor assigned patients, respond to alerts, and coordinate care.",
            },
            {
              icon: Activity,
              title: "Doctor",
              desc: "Review history, manage prescriptions, plan treatment.",
            },
            {
              icon: ShieldCheck,
              title: "Admin",
              desc: "Assign teams, monitor platform health, and review analytics.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="metric-card">
              <Icon className="h-5 w-5 text-primary" />
              <div className="mt-3 font-display font-semibold">{title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border bg-gradient-to-br from-accent/60 to-secondary p-8 md:p-10 flex flex-wrap gap-8 items-center justify-between">
          <div>
            <div className="font-display text-2xl font-semibold">Made for safety.</div>
            <p className="text-muted-foreground mt-1 max-w-md">
              Risk detection flags abnormal readings and missed doses. Emergencies notify your nurse
              and doctor instantly.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="chip bg-success/15 text-success">Low risk</span>
            <span className="chip bg-warning/20 text-warning-foreground">Medium risk</span>
            <span className="chip bg-destructive/15 text-destructive">High risk</span>
            <span className="chip bg-card border">
              <Pill className="h-3 w-3" /> Adherence 84%
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        CareConnect demo · Not for clinical use
      </footer>
    </div>
  );
}
