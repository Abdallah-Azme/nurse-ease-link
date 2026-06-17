import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, Bell, Calendar, Heart, LayoutDashboard, MessageCircle,
  Moon, Pill, Settings, Shield, Stethoscope, Sun, Users, Sparkles, FileText, LogOut,
} from "lucide-react";
import { type ReactNode } from "react";
import { useRole, useTheme, type RoleSlug } from "@/lib/role";
import { currentUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const NAV: Record<RoleSlug, { to: string; label: string; icon: typeof Activity }[]> = {
  patient: [
    { to: "/patient", label: "Overview", icon: LayoutDashboard },
    { to: "/patient/vitals", label: "Vitals", icon: Activity },
    { to: "/patient/medications", label: "Medications", icon: Pill },
    { to: "/patient/assistant", label: "AI Assistant", icon: Sparkles },
    { to: "/patient/chat", label: "Care Team", icon: MessageCircle },
    { to: "/patient/emergency", label: "Emergency", icon: AlertTriangle },
  ],
  nurse: [
    { to: "/nurse", label: "Dashboard", icon: LayoutDashboard },
    { to: "/nurse/patients", label: "Patients", icon: Users },
    { to: "/nurse/alerts", label: "Alerts", icon: Bell },
    { to: "/nurse/chat", label: "Messages", icon: MessageCircle },
  ],
  doctor: [
    { to: "/doctor", label: "Dashboard", icon: LayoutDashboard },
    { to: "/doctor/patients", label: "Patients", icon: Users },
    { to: "/doctor/appointments", label: "Appointments", icon: Calendar },
    { to: "/doctor/prescriptions", label: "Prescriptions", icon: FileText },
  ],
  admin: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/assignments", label: "Assignments", icon: Stethoscope },
    { to: "/admin/analytics", label: "Analytics", icon: Activity },
  ],
};

const ROLE_META: Record<RoleSlug, { label: string; icon: typeof Heart }> = {
  patient: { label: "Patient", icon: Heart },
  nurse: { label: "Nurse", icon: Stethoscope },
  doctor: { label: "Doctor", icon: Stethoscope },
  admin: { label: "Admin", icon: Shield },
};

export function AppShell({ children, role: roleProp }: { children: ReactNode; role: RoleSlug }) {
  const [role, setRole] = useRole();
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = NAV[roleProp];
  const user = currentUser[roleProp];
  const RoleIcon = ROLE_META[roleProp].icon;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <div className="h-9 w-9 grid place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold leading-none">CareConnect</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Patient monitoring</div>
          </div>
        </div>

        <div className="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          {ROLE_META[roleProp].label} workspace
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== `/${roleProp}` && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
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
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Link>
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
            <span className="font-medium text-foreground">{user.name}</span>
            <span>·</span>
            <span>{ROLE_META[roleProp].label}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <select
              value={role}
              onChange={(e) => {
                const r = e.target.value as RoleSlug;
                setRole(r);
                window.location.href = `/${r}`;
              }}
              className="hidden sm:block rounded-lg border bg-card px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Switch role (demo)"
            >
              <option value="patient">Demo: Patient</option>
              <option value="nurse">Demo: Nurse</option>
              <option value="doctor">Demo: Doctor</option>
              <option value="admin">Demo: Admin</option>
            </select>
            <button
              onClick={toggle}
              className="h-9 w-9 grid place-items-center rounded-lg border bg-card hover:bg-accent transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              className="h-9 w-9 grid place-items-center rounded-lg border bg-card hover:bg-accent transition relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
            </button>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur flex justify-around py-2">
          {nav.slice(0, 5).map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== `/${roleProp}` && pathname.startsWith(to));
            return (
              <Link key={to} to={to} className={cn("flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]", active ? "text-primary" : "text-muted-foreground")}>
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-10 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
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
