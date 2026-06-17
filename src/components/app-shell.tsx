"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Activity,
  AlertTriangle,
  Bell,
  Calendar,
  Heart,
  LayoutDashboard,
  MessageCircle,
  Moon,
  Pill,
  Settings,
  Shield,
  Sparkles,
  Stethoscope,
  Sun,
  Users,
  FileText,
  LogOut,
} from "lucide-react";
import { type ReactNode } from "react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import type { Role } from "@/auth";

const NAV: Record<Role, { href: string; label: string; icon: typeof Activity }[]> = {
  patient: [
    { href: "/patient", label: "Overview", icon: LayoutDashboard },
    { href: "/patient/vitals", label: "Vitals", icon: Activity },
    { href: "/patient/medications", label: "Medications", icon: Pill },
    { href: "/patient/assistant", label: "AI Assistant", icon: Sparkles },
    { href: "/patient/chat", label: "Care Team", icon: MessageCircle },
    { href: "/patient/emergency", label: "Emergency", icon: AlertTriangle },
  ],
  nurse: [
    { href: "/nurse", label: "Dashboard", icon: LayoutDashboard },
    { href: "/nurse/patients", label: "Patients", icon: Users },
    { href: "/nurse/alerts", label: "Alerts", icon: Bell },
    { href: "/nurse/chat", label: "Messages", icon: MessageCircle },
  ],
  doctor: [
    { href: "/doctor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/patients", label: "Patients", icon: Users },
    { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
    { href: "/doctor/prescriptions", label: "Prescriptions", icon: FileText },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/assignments", label: "Assignments", icon: Stethoscope },
    { href: "/admin/analytics", label: "Analytics", icon: Activity },
  ],
};

const ROLE_META: Record<Role, { label: string; icon: typeof Heart }> = {
  patient: { label: "Patient", icon: Heart },
  nurse: { label: "Nurse", icon: Stethoscope },
  doctor: { label: "Doctor", icon: Stethoscope },
  admin: { label: "Admin", icon: Shield },
};

export function AppShell({
  children,
  role,
  userName,
  alertCount = 0,
}: {
  children: ReactNode;
  role: Role;
  userName: string;
  alertCount?: number;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const nav = NAV[role];
  const RoleIcon = ROLE_META[role].icon;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <div className="h-9 w-9 grid place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold leading-none">CareConnect</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
              Patient monitoring
            </div>
          </div>
        </div>

        <div className="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          {ROLE_META[role].label} workspace
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== `/${role}` && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60">
            <Settings className="h-4 w-4" /> Settings
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/85 backdrop-blur px-4 lg:px-8 py-3">
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-8 w-8 grid place-items-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-4 w-4" fill="currentColor" />
            </div>
            <span className="font-display font-semibold">CareConnect</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <RoleIcon className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{userName}</span>
            <span>·</span>
            <span>{ROLE_META[role].label}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 grid place-items-center rounded-lg border bg-card hover:bg-accent transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              href={
                role === "nurse" ? "/nurse/alerts" : role === "patient" ? "/patient" : `/${role}`
              }
              className="h-9 w-9 grid place-items-center rounded-lg border bg-card hover:bg-accent transition relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
              )}
            </Link>
          </div>
        </header>

        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur flex justify-around py-2">
          {nav.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== `/${role}` && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-10 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
