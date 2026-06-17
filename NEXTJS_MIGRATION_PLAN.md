# CareConnect → Next.js + Server Actions Migration Plan

> **Document purpose:** Phased roadmap to migrate the CareConnect nursing demo from **TanStack Start (Vite + Nitro)** to **Next.js App Router** with **Server Actions** as the primary backend API, backed by a persistent database layer.
>
> **Target stack:** Next.js 15+, React 19, Server Actions, Tailwind v4, shadcn/ui, Zod validation.
>
> **Database note:** Drizzle ORM is **SQL-only** (PostgreSQL, MySQL, SQLite). It does **not** support MongoDB as of mid-2026. This plan includes a **Phase 0 decision** with two supported paths: **(A) Drizzle + PostgreSQL** (recommended if you want Drizzle) or **(B) MongoDB native driver + Zod schemas** (recommended if you must use MongoDB). Server Actions work identically with either path.

---

## Table of contents

1. [Current application audit](#1-current-application-audit)
2. [Target architecture](#2-target-architecture)
3. [Route mapping (TanStack → Next.js)](#3-route-mapping-tanstack--nextjs)
4. [Proposed data model](#4-proposed-data-model)
5. [Phase 0 — Decisions & prerequisites](#phase-0--decisions--prerequisites)
6. [Phase 1 — Next.js foundation](#phase-1--nextjs-foundation)
7. [Phase 2 — Database layer](#phase-2--database-layer)
8. [Phase 3 — Auth, sessions & RBAC](#phase-3--auth-sessions--rbac)
9. [Phase 4 — Shared UI migration](#phase-4--shared-ui-migration)
10. [Phase 5 — Landing & role layouts](#phase-5--landing--role-layouts)
11. [Phase 6 — Patient workspace](#phase-6--patient-workspace)
12. [Phase 7 — Nurse workspace](#phase-7--nurse-workspace)
13. [Phase 8 — Doctor workspace](#phase-8--doctor-workspace)
14. [Phase 9 — Admin workspace](#phase-9--admin-workspace)
15. [Phase 10 — Cross-cutting features](#phase-10--cross-cutting-features)
16. [Phase 11 — Testing, deployment & cutover](#phase-11--testing-deployment--cutover)
17. [Risk register & Lovable considerations](#risk-register--lovable-considerations)
18. [Appendix — File inventory](#appendix--file-inventory)

---

## 1. Current application audit

### 1.1 Tech stack (as-is)

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (`@tanstack/react-start`) on Vite 8 |
| Routing | TanStack Router (file-based routes in `src/routes/`) |
| SSR / server | Nitro (`nitro` beta) + custom `src/server.ts` error wrapper |
| State / data | **No backend** — all data from `src/lib/mock-data.ts` |
| Data fetching | TanStack Query wired in root, but **no `useQuery` usage** in routes |
| Styling | Tailwind CSS v4 (`src/styles.css`), custom design tokens |
| UI | shadcn/ui (46 components in `src/components/ui/`) |
| Charts | Recharts |
| Forms | react-hook-form + Zod (available, lightly used) |
| Toasts | Sonner |
| Auth | **Demo only** — `localStorage` role switcher in `src/lib/role.ts` |
| Platform | Lovable-connected (`tanstack_start_ts` template) |

### 1.2 Application domains

**CareConnect** is a multi-role patient monitoring demo with four workspaces:

| Role | Routes | Primary features |
|------|--------|------------------|
| **Public** | `/` | Marketing landing, role entry links |
| **Patient** | `/patient/*` (6 pages) | Overview, vitals charts, medications (toggle taken), AI assistant (canned), care team chat, emergency flow |
| **Nurse** | `/nurse/*` (4 pages) | Dashboard, assigned patients, alerts, messages |
| **Doctor** | `/doctor/*` (4 pages) | Dashboard, patients, appointments, prescriptions |
| **Admin** | `/admin/*` (4 pages) | Platform stats, users, assignments (dropdowns), analytics |

### 1.3 Interactive behaviors to persist (currently client-only)

| Feature | Current behavior | Needs server action |
|---------|------------------|---------------------|
| Medication "Mark taken" | `useState` + toast | Yes — write `medication_logs` |
| Care team chat | Local message array | Yes — persist messages |
| AI assistant | Canned `setTimeout` replies | Optional — LLM API later |
| Emergency flow | Local wizard + toast | Yes — create emergency + alerts |
| Admin assignments | `<select>` with no save | Yes — update patient assignments |
| Role switcher | `localStorage` + redirect | Replace with real auth |

### 1.4 What can be reused as-is (high reuse)

- All `src/components/ui/*` (shadcn) — mark interactive ones `"use client"`
- `src/lib/utils.ts` (`cn` helper)
- `src/lib/mock-data.ts` types and seed content (for DB seed script)
- `riskColor`, `riskBg` helpers
- `AppShell` layout structure (adapt links from TanStack `Link` → `next/link`)
- Recharts chart components (client components)
- `src/styles.css` design system

### 1.5 What must be replaced

| Current | Replacement |
|---------|-------------|
| `src/routes/*.tsx` | `app/**/page.tsx` + `layout.tsx` |
| `createFileRoute` / `routeTree.gen.ts` | Next.js App Router file conventions |
| `__root.tsx` (html shell, QueryClient) | `app/layout.tsx` |
| `vite.config.ts` + Nitro | `next.config.ts` |
| `src/server.ts` | Next.js built-in server / middleware |
| `src/router.tsx` | Deleted — routing is filesystem-based |
| `@tanstack/react-router` `Link` | `next/link` |
| `useRouterState` for pathname | `usePathname()` from `next/navigation` |
| Mock data imports in pages | Server Components + Server Actions |
| Demo role in `localStorage` | Session + middleware RBAC |

---

## 2. Target architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                        │
├─────────────────────────────────────────────────────────────────┤
│  Server Components (default)                                     │
│    └─ Fetch data via db queries in page.tsx / layout.tsx         │
├─────────────────────────────────────────────────────────────────┤
│  Client Components ("use client")                                │
│    └─ Charts, chat UI, forms, theme toggle, interactive widgets  │
├─────────────────────────────────────────────────────────────────┤
│  Server Actions (app/actions/*.ts)                               │
│    └─ Mutations: markMedTaken, sendMessage, triggerEmergency…    │
│    └─ Zod input validation → db layer → revalidatePath/tags      │
├─────────────────────────────────────────────────────────────────┤
│  Middleware (middleware.ts)                                      │
│    └─ Auth session check, role-based route protection             │
├─────────────────────────────────────────────────────────────────┤
│  Data layer                                                      │
│    Path A: Drizzle ORM → PostgreSQL (Neon / Supabase / local)    │
│    Path B: mongodb driver → collections + Zod document schemas   │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended folder structure (target)

```
careconnect-next/
├── app/
│   ├── layout.tsx                 # Root layout, fonts, Toaster
│   ├── page.tsx                   # Landing (/)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── patient/
│   │   ├── layout.tsx             # AppShell role=patient
│   │   ├── page.tsx
│   │   ├── vitals/page.tsx
│   │   ├── medications/page.tsx
│   │   ├── assistant/page.tsx
│   │   ├── chat/page.tsx
│   │   └── emergency/page.tsx
│   ├── nurse/...
│   ├── doctor/...
│   └── admin/...
├── actions/
│   ├── medications.ts
│   ├── vitals.ts
│   ├── alerts.ts
│   ├── messages.ts
│   ├── emergencies.ts
│   ├── appointments.ts
│   ├── assignments.ts
│   └── users.ts
├── components/
│   ├── app-shell.tsx
│   └── ui/...
├── db/
│   ├── index.ts                   # Connection singleton
│   ├── schema/                    # Drizzle tables OR Zod collection schemas
│   └── seed.ts
├── lib/
│   ├── auth.ts
│   ├── rbac.ts
│   ├── validations/               # Zod schemas shared by actions + forms
│   └── utils.ts
├── middleware.ts
└── next.config.ts
```

---

## 3. Route mapping (TanStack → Next.js)

| Current TanStack route | Next.js App Router path | Rendering strategy |
|------------------------|-------------------------|-------------------|
| `src/routes/index.tsx` | `app/page.tsx` | Server Component |
| `src/routes/patient.tsx` + children | `app/patient/layout.tsx` + pages | Layout SC, pages mixed |
| `src/routes/patient.index.tsx` | `app/patient/page.tsx` | Server Component (charts → client child) |
| `src/routes/patient.vitals.tsx` | `app/patient/vitals/page.tsx` | Server + client chart islands |
| `src/routes/patient.medications.tsx` | `app/patient/medications/page.tsx` | Server list + client toggle form |
| `src/routes/patient.assistant.tsx` | `app/patient/assistant/page.tsx` | Client Component |
| `src/routes/patient.chat.tsx` | `app/patient/chat/page.tsx` | Client + server actions |
| `src/routes/patient.emergency.tsx` | `app/patient/emergency/page.tsx` | Client wizard + server action |
| `src/routes/nurse.tsx` + children | `app/nurse/layout.tsx` + pages | Same pattern |
| `src/routes/doctor.tsx` + children | `app/doctor/layout.tsx` + pages | Same pattern |
| `src/routes/admin.tsx` + children | `app/admin/layout.tsx` + pages | Same pattern |

**Metadata migration:** TanStack `head()` exports become Next.js `export const metadata` or `generateMetadata()` per page.

---

## 4. Proposed data model

Derived from `src/lib/mock-data.ts`. Normalize for either SQL (Drizzle) or MongoDB (embedded vs referenced).

### 4.1 Core entities

```
users
  id, email, name, role (patient|nurse|doctor|admin), passwordHash, createdAt

patients (extends user or 1:1 profile)
  userId, age, sex, conditions[], riskLevel, adherenceScore, avatarHue
  assignedNurseId, assignedDoctorId

vitals_readings
  id, patientId, type (bp|glucose|hr|weight|spo2), recordedAt
  values: { systolic?, diastolic?, fasting?, bpm?, kg?, spo2? }

medications
  id, patientId, name, dose, schedule, nextDoseAt, adherenceScore

medication_logs
  id, medicationId, patientId, takenAt, source (patient|nurse)

alerts
  id, patientId, level (info|warning|critical), message, createdAt, resolvedAt?

messages
  id, threadId, senderId, recipientId, body, createdAt

appointments
  id, patientId, staffId, scheduledAt, reason, status

emergencies
  id, patientId, answers[], severity, notifiedStaffIds[], createdAt, status

platform_metrics (or computed via aggregation)
  snapshotDate, totalPatients, activeNurses, ...
```

### 4.2 MongoDB vs PostgreSQL modeling notes

| Concern | PostgreSQL (Drizzle) | MongoDB |
|---------|---------------------|---------|
| Vitals time series | Normalized `vitals_readings` table | Collection with compound index `(patientId, recordedAt)` |
| Conditions array | `text[]` or junction table | Embedded `conditions: string[]` on patient doc |
| Relations | FK constraints + joins | `ObjectId` references or embedding |
| Aggregations (admin stats) | SQL `COUNT`, `AVG` | Aggregation pipeline |
| Migrations | `drizzle-kit push/migrate` | Manual migration scripts or `migrate-mongo` |

---

## Phase 0 — Decisions & prerequisites

**Goal:** Lock stack choices before writing migration code.

### Step 0.1 — Choose database path

**Option A — Drizzle + PostgreSQL (recommended if you want Drizzle)**

1. Provision PostgreSQL (Neon, Supabase, or local Docker).
2. Use `drizzle-orm`, `drizzle-kit`, `postgres` or `@neondatabase/serverless`.
3. Full type-safe schema, migrations, and relational queries.

**Option B — MongoDB + typed repository layer (recommended if you must use MongoDB)**

1. Provision MongoDB Atlas (or local).
2. Use official `mongodb` driver (not Drizzle).
3. Define Zod schemas per collection in `db/schema/` (document shape + validation).
4. Build thin repository functions (`getPatientVitals`, `createAlert`, …) called from Server Actions.
5. Optionally add `drizzle-zod`-style inference patterns manually.

> **Do not** block the migration waiting for Drizzle MongoDB support — it is explicitly out of scope for the Drizzle team.

### Step 0.2 — Choose auth provider

| Option | Pros | Cons |
|--------|------|------|
| **Auth.js (NextAuth v5)** | Native Next.js integration, session in Server Actions | Setup complexity |
| **Clerk** | Fastest UX, built-in RBAC | Vendor lock-in, cost |
| **Custom credentials** | Full control | You own security (bcrypt, sessions) |

For a healthcare demo, start with **Auth.js + credentials** or **Clerk**; replace the demo role dropdown with real login.

### Step 0.3 — Migration strategy

Choose one:

- **Big-bang:** New `next/` branch, migrate all at once (risky for Lovable sync).
- **Parallel app (recommended):** Create `careconnect-next` subdirectory or separate repo; run both until feature parity.
- **Incremental strangler:** Not practical — TanStack Start and Next.js cannot share the same entry point.

### Step 0.4 — Lovable platform decision

Current project uses Lovable's TanStack Start template (`.lovable/project.json`). **Next.js is a different template.** Plan whether to:

- Disconnect from Lovable TanStack sync and deploy Next.js independently (Vercel), or
- Recreate the project in Lovable's Next.js template and port code.

Document this in `AGENTS.md` or team wiki before Phase 1.

### Step 0.5 — Environment variables contract

```env
# Database (pick one set)
DATABASE_URL=postgresql://...          # Path A
MONGODB_URI=mongodb+srv://...          # Path B

# Auth
AUTH_SECRET=...
AUTH_URL=http://localhost:3000

# Optional later
OPENAI_API_KEY=...                     # Real AI assistant
```

### Phase 0 exit criteria

- [ ] Database path chosen (A or B)
- [ ] Auth provider chosen
- [ ] Hosting target chosen (Vercel recommended for Next.js)
- [ ] Lovable strategy documented
- [ ] `.env.example` committed

---

## Phase 1 — Next.js foundation

**Goal:** Bootstrapped Next.js app with Tailwind v4, path aliases, and dev workflow.

### Step 1.1 — Scaffold Next.js project

1. Run `npx create-next-app@latest` with:
   - TypeScript: Yes
   - App Router: Yes
   - Tailwind CSS: Yes
   - `src/` directory: Yes (optional — match current `@/` alias habit)
   - Import alias: `@/*`
2. Pin React 19 to match current app.
3. Add scripts: `dev`, `build`, `start`, `lint`, `db:seed`, `db:migrate`.

### Step 1.2 — Port global styles

1. Copy `src/styles.css` → `app/globals.css` (or `src/app/globals.css`).
2. Verify Tailwind v4 config — current app uses `@tailwindcss/vite`; Next.js uses `@tailwindcss/postcss` or equivalent.
3. Port custom utility classes: `.metric-card`, `.chip`, font tokens (`font-display`), CSS variables for charts.
4. Load Inter + Plus Jakarta Sans in `app/layout.tsx` (replace TanStack `head()` link tags).

### Step 1.3 — Root layout

1. Create `app/layout.tsx` with:
   - `<html lang="en">`, font classes
   - `<Toaster />` from Sonner (client boundary)
   - Theme provider if moving beyond `localStorage` toggle (consider `next-themes`)
2. Port 404 → `app/not-found.tsx`
3. Port error UI from `__root.tsx` → `app/error.tsx` + `global-error.tsx`

### Step 1.4 — TypeScript & tooling

1. Extend `tsconfig.json` with `strict: true` (already on).
2. Copy ESLint / Prettier config from current repo.
3. Update `components.json` for shadcn: set `"rsc": true`.

### Step 1.5 — Remove TanStack dependencies (in new project)

Do **not** install: `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/router-plugin`, `nitro`, `@lovable.dev/vite-tanstack-config`.

Keep (if needed): `@tanstack/react-query` only if you add client-side polling later — Server Actions + `revalidatePath` may make it unnecessary.

### Phase 1 exit criteria

- [ ] `npm run dev` serves blank Next.js app with CareConnect styles
- [ ] Fonts and color tokens match current demo
- [ ] `@/` alias resolves

---

## Phase 2 — Database layer

**Goal:** Persistent storage replacing `mock-data.ts`, callable from Server Actions.

### Path A steps (Drizzle + PostgreSQL)

#### Step 2A.1 — Install and configure Drizzle

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

1. Create `db/index.ts` with connection singleton (use `globalThis` pattern for dev hot reload).
2. Create `drizzle.config.ts` pointing at `DATABASE_URL`.

#### Step 2A.2 — Define schema

1. Create `db/schema/users.ts`, `patients.ts`, `vitals.ts`, `medications.ts`, `alerts.ts`, `messages.ts`, `appointments.ts`, `emergencies.ts`.
2. Map types from `mock-data.ts` (`RiskLevel`, `Role`, etc.) to `pgEnum` or `varchar` + Zod.
3. Define relations (`patients.assignedNurseId` → `users.id`).

#### Step 2A.3 — Migrations

1. Run `drizzle-kit generate` → `drizzle-kit migrate`.
2. Add `npm run db:migrate` script.

#### Step 2A.4 — Seed script

1. Create `db/seed.ts` porting all arrays from `mock-data.ts`.
2. Generate 14 days of vitals per patient (reuse sine/cos logic or store as-is).
3. Run seed against dev database.

#### Step 2A.5 — Query module

1. Create `db/queries/patients.ts`, `vitals.ts`, etc.
2. Export typed functions used by Server Components (read) and Server Actions (write).

### Path B steps (MongoDB)

#### Step 2B.1 — Install driver

```bash
npm install mongodb zod
```

1. Create `db/index.ts` with `MongoClient` singleton.
2. Define database name: `careconnect`.

#### Step 2B.2 — Collection schemas (Zod)

1. `db/schema/patient.ts` — Zod object matching `Patient` interface.
2. Repeat for all entities.
3. Export TypeScript types via `z.infer<typeof PatientSchema>`.

#### Step 2B.3 — Indexes

1. `vitals_readings`: `{ patientId: 1, recordedAt: -1 }`
2. `alerts`: `{ patientId: 1, createdAt: -1, resolvedAt: 1 }`
3. `messages`: `{ threadId: 1, createdAt: 1 }`
4. `users`: `{ email: 1 }` unique

#### Step 2B.4 — Repository layer

1. `db/repositories/patientRepository.ts` with `findById`, `findByNurseId`, `updateAssignments`, etc.
2. Keep all MongoDB-specific syntax inside repositories — Server Actions stay ORM-agnostic.

#### Step 2B.5 — Seed script

1. `db/seed.ts` using `insertMany` for each collection.
2. Idempotent seed (check count before insert).

### Step 2.6 — Shared validation schemas

1. Create `lib/validations/medications.ts`, `emergencies.ts`, etc.
2. Use same Zod schemas in Server Actions and client forms (`@hookform/resolvers/zod`).

### Phase 2 exit criteria

- [ ] Database running locally and in CI
- [ ] Seed populates equivalent data to `mock-data.ts`
- [ ] Sample query returns patient `p1` with vitals in a test script
- [ ] No production code imports `mock-data.ts` for runtime data (types/helpers OK)

---

## Phase 3 — Auth, sessions & RBAC

**Goal:** Replace demo `localStorage` role switcher with secure, server-verified authorization.

### Step 3.1 — User model linkage

1. Seed users for `p1`, `n1`, `d1`, `a1` with passwords (dev only).
2. Map `currentUser` mock entries to real `users` rows.

### Step 3.2 — Implement auth (Auth.js example)

1. Install `next-auth@beta` (Auth.js v5).
2. Create `auth.ts` with Credentials provider.
3. Session callback attaches `role` and `userId`.
4. Add `app/api/auth/[...nextauth]/route.ts` or edge-compatible setup.

### Step 3.3 — Middleware RBAC

1. Create `middleware.ts`:
   - `/patient/*` → requires `role === 'patient'`
   - `/nurse/*` → requires `role === 'nurse'`
   - `/doctor/*` → requires `role === 'doctor'`
   - `/admin/*` → requires `role === 'admin'`
2. Redirect unauthenticated users to `/login`.
3. Redirect wrong-role users to their home workspace.

### Step 3.4 — Server Action auth guard

1. Create `lib/safe-action.ts` wrapper:

```typescript
// Pattern: every action calls requireRole('nurse') or requireSession()
```

2. Never trust client-sent `userId` — always read from session.

### Step 3.5 — Login / logout UI

1. `app/(auth)/login/page.tsx` — email/password form.
2. Replace AppShell "Sign out" `Link` with `signOut()` action.
3. Remove demo role `<select>` from production builds (keep behind `NODE_ENV === 'development'` flag if needed).

### Step 3.6 — Data scoping rules

| Role | Query scope |
|------|-------------|
| Patient | Own `patientId` only |
| Nurse | Patients where `assignedNurseId = session.userId` |
| Doctor | Patients where `assignedDoctorId = session.userId` |
| Admin | All records |

Enforce in `db/queries/*`, not in UI.

### Phase 3 exit criteria

- [ ] Login as each role lands on correct dashboard
- [ ] Direct URL to wrong role returns 403 or redirect
- [ ] Server Actions reject cross-tenant access

---

## Phase 4 — Shared UI migration

**Goal:** Port reusable components with minimal changes.

### Step 4.1 — Copy shadcn UI components

1. Copy `src/components/ui/*` → `components/ui/*`.
2. Add `"use client"` to components using hooks, Radix state, or event handlers.
3. Run `npx shadcn@latest init` if regenerating; merge with existing styles.

### Step 4.2 — Port `AppShell`

1. Copy `src/components/app-shell.tsx`.
2. Replace `@tanstack/react-router` `Link` → `next/link`.
3. Replace `useRouterState` → `usePathname()` from `next/navigation`.
4. Add `"use client"` directive.
5. Accept `user` prop from Server Component layout (session name) instead of `currentUser` mock.
6. Update nav `to` props → `href`.

### Step 4.3 — Port `PageHeader`

Keep as Server or Client Component (no hooks — can stay Server).

### Step 4.4 — Port hooks

1. `use-mobile.tsx` — copy with `"use client"`.
2. `useRole` / `useTheme` — replace theme with `next-themes`; remove `useRole` after auth.

### Step 4.5 — Chart wrapper components

1. Extract repeated Recharts boilerplate into `components/charts/vitals-line-chart.tsx`, etc.
2. Mark `"use client"`; accept `data` prop from parent Server Component.

### Step 4.6 — Delete dead code

Remove from new project: `routeTree.gen.ts`, `router.tsx`, `start.ts`, `server.ts`, Lovable TanStack vite config.

### Phase 4 exit criteria

- [ ] Storybook or test page renders AppShell with all nav items
- [ ] All shadcn components compile under RSC rules
- [ ] No TanStack Router imports remain

---

## Phase 5 — Landing & role layouts

**Goal:** Public landing and four authenticated layout shells.

### Step 5.1 — Landing page

1. Port `src/routes/index.tsx` → `app/page.tsx`.
2. Replace `Link to=` → `href=`.
3. Update CTA links to `/login?role=patient` or dedicated role login.
4. Add `metadata` export for SEO (port from TanStack `head()`).

### Step 5.2 — Role layouts

For each role, create `app/{role}/layout.tsx`:

```tsx
// Server Component
export default async function PatientLayout({ children }) {
  const session = await requireRole('patient');
  return <AppShell role="patient" user={session.user}>{children}</AppShell>;
}
```

Repeat for `nurse`, `doctor`, `admin`.

### Step 5.3 — Loading & error states

1. Add `loading.tsx` per role (skeleton from `components/ui/skeleton.tsx`).
2. Add `error.tsx` per role workspace.

### Phase 5 exit criteria

- [ ] `/` renders landing
- [ ] `/patient` shows shell with sidebar (authenticated)
- [ ] Metadata titles match current app per route

---

## Phase 6 — Patient workspace

**Goal:** Six patient pages backed by Server Components + Actions.

### Step 6.1 — Patient overview (`/patient`)

1. Server Component fetches: latest vitals, medications summary, alerts, appointments.
2. Extract `MetricCard` to `components/patient/metric-card.tsx`.
3. Chart section → client child `<BloodPressureChart data={vitals} />`.

### Step 6.2 — Vitals (`/patient/vitals`)

1. Query 14-day vitals for session patient.
2. Port five chart cards from `patient.vitals.tsx`.
3. Optional action: `logVitalReading` for manual entry (future).

### Step 6.3 — Medications (`/patient/medications`)

1. Server Component lists medications from DB.
2. Client component `MedicationList` with optimistic UI.
3. **Server Action `markMedicationTaken`:**
   - Input: `medicationId` (Zod UUID)
   - Validate session patient owns medication
   - Insert `medication_logs` row
   - Update adherence score
   - `revalidatePath('/patient/medications')`
4. Wire toast on success (client).

### Step 6.4 — AI Assistant (`/patient/assistant`)

**Phase 6.4a (parity):** Port canned responses as-is (client-only).

**Phase 6.4b (enhanced):** Server Action `askAssistant`:
- Store conversation in `assistant_messages` collection/table
- Call OpenAI with system prompt (no diagnosis guardrails)
- Stream via `ai` SDK optional

### Step 6.5 — Care team chat (`/patient/chat`)

1. Server Component loads thread messages.
2. Client chat UI with `useOptimistic` or local state.
3. **Server Action `sendMessage`:**
   - `threadId`, `body`
   - Persist message, notify recipient
4. Load nurse/doctor threads by assignment IDs.

### Step 6.6 — Emergency (`/patient/emergency`)

1. Port wizard UI (client).
2. **Server Action `triggerEmergency`:**
   - Input: `answers[]`, computed severity
   - Create `emergencies` record
   - Create `critical` alerts for assigned nurse + doctor
   - Optional: email/SMS webhook placeholder
3. Return confirmation payload for success screen.

### Phase 6 exit criteria

- [ ] All 6 patient routes functional with DB data
- [ ] Medication toggle persists across refresh
- [ ] Emergency creates alert visible on nurse dashboard
- [ ] Chat messages persist

---

## Phase 7 — Nurse workspace

**Goal:** Nurse dashboard, patients, alerts, messages — scoped to assigned patients.

### Step 7.1 — Nurse dashboard (`/nurse`)

1. Query assigned patients, open alerts, adherence trend aggregate.
2. Port stats cards and tables from `nurse.index.tsx`.
3. Alerts list links to `/nurse/alerts`.

### Step 7.2 — Patients list (`/nurse/patients`)

1. Port table from `nurse.patients.tsx`.
2. Add patient detail route later: `/nurse/patients/[id]` (optional enhancement).

### Step 7.3 — Alerts (`/nurse/alerts`)

1. List alerts for assigned patients only.
2. **Server Action `resolveAlert`:** set `resolvedAt`.
3. Filter UI: open / resolved / all.

### Step 7.4 — Messages (`/nurse/chat`)

1. List patient threads (group by patient).
2. Reuse message components from patient chat.
3. **Server Action `sendMessage`** with nurse as sender.

### Phase 7 exit criteria

- [ ] Nurse sees only `assignedNurseId === n1` patients (for seeded nurse)
- [ ] Alerts from patient emergency appear here
- [ ] Adherence chart uses real aggregated data

---

## Phase 8 — Doctor workspace

**Goal:** Doctor dashboard, patients, appointments, prescriptions.

### Step 8.1 — Doctor dashboard (`/doctor`)

1. Query patients by `assignedDoctorId`.
2. Port patient cards, appointments sidebar, HR trend chart.

### Step 8.2 — Patients (`/doctor/patients`)

1. Full patient list with risk badges.
2. "Open chart" → `/doctor/patients/[id]` with vitals history (enhancement).

### Step 8.3 — Appointments (`/doctor/appointments`)

1. CRUD appointments scoped to doctor.
2. **Server Actions:** `createAppointment`, `cancelAppointment`, `updateAppointment`.
3. Port list UI from `doctor.appointments.tsx`.

### Step 8.4 — Prescriptions (`/doctor/prescriptions`)

1. Query medications grouped by patient for doctor's panel.
2. **Server Actions:** `renewPrescription`, `addPrescription`, `discontinuePrescription`.
3. "Renew" button triggers action (currently no-op in demo).

### Phase 8 exit criteria

- [ ] Doctor sees only assigned patients
- [ ] Appointments persist in DB
- [ ] Prescription renew updates `nextDoseAt` or creates new medication row

---

## Phase 9 — Admin workspace

**Goal:** Platform overview, user management, assignments, analytics.

### Step 9.1 — Admin overview (`/admin`)

1. Compute or fetch `platformStats` via aggregation query.
2. Port stat cards and adherence chart.
3. Critical alerts feed from all patients.

### Step 9.2 — Users (`/admin/users`)

1. Tabs: patients / staff tables from DB.
2. **Server Actions (stretch):** `createUser`, `deactivateUser`.
3. Port table UI from `admin.users.tsx`.

### Step 9.3 — Assignments (`/admin/assignments`)

1. Load patients with nurse/doctor dropdowns.
2. **Server Action `updatePatientAssignments`:**
   - Input: `patientId`, `assignedNurseId`, `assignedDoctorId`
   - Validate IDs exist and roles match
   - `revalidatePath('/admin/assignments')`
3. Use `<form action={updatePatientAssignments}>` or `useFormState`.

### Step 9.4 — Analytics (`/admin/analytics`)

1. Port charts from `admin.analytics.tsx`.
2. Replace hardcoded `platformStats` with live aggregations:
   - Total patients, staff counts
   - Emergencies last 7 days
   - Average adherence
   - Vitals population trends

### Phase 9 exit criteria

- [ ] Assignment dropdown changes persist
- [ ] Stats reflect seeded + live data
- [ ] Admin can access all roles' data scopes

---

## Phase 10 — Cross-cutting features

**Goal:** Production polish, real-time, notifications, AI.

### Step 10.1 — Server Action patterns (standardize)

1. Create `lib/action-result.ts` — discriminated union `{ ok: true, data } | { ok: false, error }`.
2. Consistent Zod error messages for forms.
3. `revalidateTag` for shared data (alerts, stats).

### Step 10.2 — Notifications

1. Bell icon in AppShell shows unread alert count (Server Component in layout).
2. Optional: Server-Sent Events or polling for nurse/doctor alerts.

### Step 10.3 — Real-time (optional)

1. MongoDB Change Streams or PostgreSQL `LISTEN/NOTIFY` for live alerts.
2. Or Pusher / Ably for chat.

### Step 10.4 — AI assistant (production)

1. Server Action with rate limiting.
2. Audit log of prompts/responses (HIPAA consideration for real deployment).
3. Keep disclaimer UI from current assistant page.

### Step 10.5 — Audit logging

1. `audit_logs` table/collection for sensitive actions (emergency, assignment changes, prescription changes).

### Step 10.6 — HIPAA / compliance placeholders

> Current app is a demo ("Not for clinical use"). For production:

1. Encryption at rest (Atlas / Neon defaults).
2. BAA with cloud providers.
3. PHI access logging.
4. Session timeout policies.

### Phase 10 exit criteria

- [ ] Consistent error handling across all actions
- [ ] Notification badge reflects DB state
- [ ] Documented compliance gaps for production

---

## Phase 11 — Testing, deployment & cutover

**Goal:** Ship Next.js app and retire TanStack Start.

### Step 11.1 — Testing strategy

| Layer | Tool | Coverage target |
|-------|------|-----------------|
| Zod schemas | Vitest unit tests | All action inputs |
| db/queries | Integration tests against test DB | Critical paths |
| Server Actions | Integration tests with mocked session | Auth + scoping |
| UI | Playwright E2E | One flow per role |

**Critical E2E flows:**

1. Patient marks medication → nurse sees adherence change
2. Patient emergency → nurse alert appears
3. Admin reassigns nurse → nurse dashboard patient list updates
4. Wrong role cannot access routes

### Step 11.2 — CI pipeline

1. GitHub Actions: lint → typecheck → test → build.
2. Spin up Postgres/Mongo service container for integration tests.
3. `drizzle-kit migrate` or seed step in CI.

### Step 11.3 — Deployment

1. **Vercel** (recommended): connect repo, set env vars, deploy.
2. Database: Neon (Postgres) or MongoDB Atlas with IP allowlist / Vercel integration.
3. Preview deployments per PR.

### Step 11.4 — Performance

1. Server Components for all read-heavy pages (default).
2. `loading.tsx` skeletons for perceived speed.
3. Index review for vitals and alerts queries.
4. `dynamic = 'force-dynamic'` only where needed (most authenticated pages).

### Step 11.5 — Cutover checklist

- [ ] Feature parity sign-off per role
- [ ] DNS / domain pointed to Next.js deployment
- [ ] TanStack Start app archived or README updated
- [ ] Lovable project migrated or disconnected
- [ ] `mock-data.ts` removed from runtime path
- [ ] Environment secrets rotated for production

### Step 11.6 — Post-migration cleanup

1. Delete Vite/TanStack config from main branch (or keep in `legacy/` tag).
2. Update README with new dev instructions.
3. Tag release `v2.0.0-nextjs`.

### Phase 11 exit criteria

- [ ] Production deployment live
- [ ] E2E suite green in CI
- [ ] Team runbook for db migrations and rollbacks

---

## Risk register & Lovable considerations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Drizzle does not support MongoDB | Blocks stated stack | Choose Path A (Postgres) or Path B (Mongo driver) in Phase 0 |
| Lovable sync expects TanStack Start | Lost no-code editing | New Lovable Next.js project or deploy outside Lovable |
| RSC + Recharts bundle size | Slow patient pages | Chart code-split into client islands |
| Server Actions without auth guards | Data leak | `requireSession` in every action (Phase 3) |
| Healthcare compliance | Legal exposure | Keep "demo only" disclaimer until compliance Phase 10.6 |
| Big-bang migration downtime | User disruption | Parallel run + feature flags |
| `force push` on Lovable branch | History loss | Follow `AGENTS.md` — no force push to connected branch |

---

## Appendix — File inventory

### Routes to migrate (22 files)

```
src/routes/index.tsx
src/routes/patient.tsx, patient.index.tsx, patient.vitals.tsx,
  patient.medications.tsx, patient.assistant.tsx, patient.chat.tsx, patient.emergency.tsx
src/routes/nurse.tsx, nurse.index.tsx, nurse.patients.tsx, nurse.alerts.tsx, nurse.chat.tsx
src/routes/doctor.tsx, doctor.index.tsx, doctor.patients.tsx,
  doctor.appointments.tsx, doctor.prescriptions.tsx
src/routes/admin.tsx, admin.index.tsx, admin.users.tsx, admin.assignments.tsx, admin.analytics.tsx
```

### Server Actions to implement (minimum set)

| Action file | Functions |
|-------------|-----------|
| `actions/medications.ts` | `markMedicationTaken`, `addMedication`, `renewPrescription` |
| `actions/vitals.ts` | `logVitalReading`, `getVitalsHistory` (if not inline query) |
| `actions/alerts.ts` | `resolveAlert`, `createAlert` |
| `actions/messages.ts` | `sendMessage`, `getThread` |
| `actions/emergencies.ts` | `triggerEmergency` |
| `actions/appointments.ts` | `createAppointment`, `cancelAppointment` |
| `actions/assignments.ts` | `updatePatientAssignments` |
| `actions/users.ts` | `createUser`, `deactivateUser` (admin) |

### Dependencies — add vs remove

**Add (Next.js project):**
```
next, drizzle-orm, drizzle-kit, postgres (Path A)
mongodb, zod (Path B)
next-auth, bcryptjs
next-themes (optional)
```

**Remove:**
```
@tanstack/react-start, @tanstack/react-router, @tanstack/router-plugin,
nitro, vite, @lovable.dev/vite-tanstack-config, @vitejs/plugin-react
```

**Keep:**
```
react, react-dom, tailwindcss, @radix-ui/*, recharts, sonner,
react-hook-form, @hookform/resolvers, zod, lucide-react, date-fns,
class-variance-authority, clsx, tailwind-merge
```

---

## Suggested timeline (indicative)

| Phase | Duration (1 dev) | Cumulative |
|-------|------------------|------------|
| Phase 0 | 2–3 days | Week 1 |
| Phase 1 | 2–3 days | Week 1 |
| Phase 2 | 4–5 days | Week 2 |
| Phase 3 | 3–4 days | Week 2 |
| Phase 4 | 2–3 days | Week 3 |
| Phase 5 | 1–2 days | Week 3 |
| Phase 6 | 4–5 days | Week 4 |
| Phase 7 | 2–3 days | Week 4 |
| Phase 8 | 2–3 days | Week 5 |
| Phase 9 | 2–3 days | Week 5 |
| Phase 10 | 3–5 days | Week 6 |
| Phase 11 | 3–4 days | Week 6–7 |

**Total estimate:** ~6–7 weeks for one experienced developer, or ~3–4 weeks with two developers splitting role workspaces (Phases 6–9).

---

## Quick start — what to do first

1. **Read Phase 0** and pick PostgreSQL+Drizzle **or** MongoDB+Zod repositories.
2. **Scaffold Next.js** in a new branch or folder (Phase 1).
3. **Seed the database** from `mock-data.ts` (Phase 2) before touching UI.
4. **Implement auth + middleware** (Phase 3) before wiring Server Actions.
5. **Migrate AppShell + landing** (Phases 4–5), then one role at a time starting with **Patient** (Phase 6).

This order ensures every page migration has real data and auth scoping from day one, rather than porting UI first and bolting on the backend later.
