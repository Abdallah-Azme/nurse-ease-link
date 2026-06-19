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
  Shield,
  Sparkles,
  Stethoscope,
  Sun,
  Users,
  FileText,
  LogOut,
  Inbox,
  UserCog,
  MoreHorizontal,
  X,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import type { Role } from "@/auth";

const NAV: Record<Role, { href: string; label: string; icon: typeof Activity }[]> = {
  patient: [
    { href: "/patient", label: "Overview", icon: LayoutDashboard },
    { href: "/patient/palliative", label: "Palliative", icon: Heart },
    { href: "/patient/vitals", label: "Vitals", icon: Activity },
    { href: "/patient/medications", label: "Medications", icon: Pill },
    { href: "/patient/assistant", label: "AI Assistant", icon: Sparkles },
    { href: "/patient/chat", label: "Care Team", icon: MessageCircle },
    { href: "/patient/emergency", label: "Emergency", icon: AlertTriangle },
    { href: "/notifications", label: "Inbox", icon: Inbox },
  ],
  nurse: [
    { href: "/nurse", label: "Dashboard", icon: LayoutDashboard },
    { href: "/nurse/palliative", label: "Palliative", icon: Heart },
    { href: "/nurse/patients", label: "Patients", icon: Users },
    { href: "/nurse/alerts", label: "Alerts", icon: Bell },
    { href: "/nurse/chat", label: "Messages", icon: MessageCircle },
    { href: "/notifications", label: "Inbox", icon: Inbox },
  ],
  doctor: [
    { href: "/doctor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/palliative", label: "Palliative", icon: Heart },
    { href: "/doctor/patients", label: "Patients", icon: Users },
    { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
    { href: "/doctor/prescriptions", label: "Prescriptions", icon: FileText },
    { href: "/notifications", label: "Inbox", icon: Inbox },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/palliative", label: "Palliative", icon: Heart },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/assignments", label: "Assignments", icon: Stethoscope },
    { href: "/admin/analytics", label: "Analytics", icon: Activity },
    { href: "/notifications", label: "Inbox", icon: Inbox },
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
  const [moreOpen, setMoreOpen] = useState(false);
  const moreItems = useMemo(() => {
    if (role === "patient") {
      return [
        { href: "/patient/assistant", label: "AI Assistant", icon: Sparkles },
        { href: "/notifications/preferences", label: "Settings", icon: UserCog },
      ];
    }
    if (role === "nurse") {
      return [
        { href: "/nurse/alerts", label: "Alerts", icon: Bell },
        { href: "/notifications/preferences", label: "Settings", icon: UserCog },
      ];
    }
    if (role === "doctor") {
      return [
        { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
        { href: "/notifications/preferences", label: "Settings", icon: UserCog },
      ];
    }
    return [
      { href: "/admin/analytics", label: "Analytics", icon: Activity },
      { href: "/notifications/preferences", label: "Settings", icon: UserCog },
    ];
  }, [role]);

  return (
    <div className="flex min-h-screen min-h-dvh w-full bg-background text-foreground">
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
          <Link
            href="/notifications/preferences"
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
          >
            <UserCog className="h-4 w-4" /> Settings
          </Link>
          <button
            onClick={() => signOut({ redirectTo: "/" } as never)}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="mobile-safe-header sticky top-0 z-30 flex items-center gap-3 border-b bg-background/85 backdrop-blur px-4 lg:px-8 py-3">
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-8 w-8 grid place-items-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-4 w-4" fill="currentColor" />
            </div>
            <span className="font-display font-semibold">CareConnect</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <RoleIcon className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{userName}</span>
            <span aria-hidden="true">·</span>
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
              href="/notifications"
              className="h-9 w-9 grid place-items-center rounded-lg border bg-card hover:bg-accent transition relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-[10px] text-destructive-foreground grid place-items-center">
                  {alertCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <nav className="mobile-bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur overflow-x-auto">
          <div className="flex min-w-max justify-around py-1.5 px-1 gap-1">
            {nav.slice(0, 5).map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || (href !== `/${role}` && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex min-w-[56px] flex-col items-center gap-0.5 px-1.5 py-1 text-[9px] leading-none text-center",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span className="max-w-[56px] truncate">{label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-0.5 px-1.5 py-1 text-[9px] leading-none text-center text-muted-foreground",
                moreOpen && "text-primary",
              )}
              aria-label="Open more actions"
            >
              <MoreHorizontal className="h-4.5 w-4.5" />
              <span className="max-w-[56px] truncate">More</span>
            </button>
          </div>
        </nav>

        {moreOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close more actions"
              onClick={() => setMoreOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t bg-card p-4 shadow-2xl">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-display text-lg font-semibold">More actions</div>
                  <div className="text-xs text-muted-foreground">
                    Additional workspace actions and settings
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="h-9 w-9 grid place-items-center rounded-lg border bg-background"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid gap-2">
                {moreItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
                        active ? "border-primary bg-primary/5 text-primary" : "bg-background",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    void signOut({ redirectTo: "/" } as never);
                  }}
                  className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm bg-background"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="mobile-main flex-1 px-4 lg:px-8 py-6 pb-20 lg:pb-10 max-w-[1400px] w-full mx-auto">
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
