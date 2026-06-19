# CareConnect (Next.js)

Role-based home-care and palliative-care application built with **Next.js 15**, **React 19**, **Server Actions**, **Auth.js**, and **MongoDB**. The former TanStack Start implementation is retained only as a reference archive.

## Quick start

```bash
npm install
npm run db:setup
npm run dev         # http://localhost:3000
```

Set `MONGODB_URI` in `.env` (see `.env.example`). Database name defaults to `careconnect`.

## Demo logins

Password for all accounts: `demo123`

| Role    | Email                    |
|---------|--------------------------|
| Patient | patient@careconnect.demo |
| Nurse   | nurse@careconnect.demo   |
| Doctor  | doctor@careconnect.demo  |
| Admin   | admin@careconnect.demo   |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:setup` | Seed database |
| `npm run db:seed` | Re-run seed (skips if data exists) |
| `npm run worker:outbox` | Run the push outbox worker |
| `npm run db:migrate:evidence` | Open migration evidence note |
| `npm run db:backup:evidence` | Open backup/restore evidence note |
| `npm test` | Run Vitest unit/integration tests |

## Architecture

- **App Router** - `src/app/` (patient, nurse, doctor, admin workspaces)
- **Server Actions** - `src/actions/` (medications, emergencies, messages, assignments, appointments, notifications, and palliative care)
- **Database** - MongoDB Atlas (`src/db/mongo/`) with typed collections, audit logs, notifications, and outbox jobs
- **Auth** - Auth.js v5 with JWT sessions and role-based middleware
- **Authorization** - reusable role, ownership, assignment, and care-team policies in `src/lib/policies.ts`
- **Background delivery** - retry-aware notification outbox worker in `src/workers/outbox.ts`

## Implemented features

- Patient, nurse, doctor, and admin role workspaces with scoped navigation and data access.
- Patient vitals, medications, emergency escalation, real nurse/doctor conversation threads with read state, and approved educational assistant content.
- Home palliative care: symptom check-ins, escalation rules, care plans and goals, visit scheduling/logging, caregiver details, education, communication logs, and outcome reporting.
- Nurse alert triage and resolution, patient messaging, and palliative visit workflows.
- Doctor appointments, prescriptions, patient review, palliative care plans, and outcome recording.
- Admin user/assignment workflows, analytics, and palliative-program oversight.
- Unified in-app notification feed, unread state, notification preferences, Firebase push registration, durable outbox jobs, retries, and dead-letter state.
- MongoDB seed data, index creation, audit logs, idempotency support, policy tests, and palliative workflow tests.

## Environment

Copy `.env.example` to `.env` and set your MongoDB Atlas URI:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/careconnect?appName=Cluster0
MONGODB_DB_NAME=careconnect
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
```

## Firebase push notifications

See **[FIREBASE_NOTIFICATIONS.md](./FIREBASE_NOTIFICATIONS.md)** for the full list of notification touchpoints.

1. Add Firebase web + admin credentials to `.env` (see `.env.example`).
2. Sign in - the app requests notification permission and registers your FCM token.
3. Triggers include emergency alerts, chat messages, assignment changes, appointments, prescriptions, and medication logs.

Without Firebase env vars, the app works normally; pushes are logged in dev and queued for retry handling.

## Operational notes

- All runtime data goes through MongoDB.
- The obsolete centralized runtime mock-data module has been removed; demo records now come from the MongoDB seed.
- See `MIGRATION_DECISIONS.md` and `NEXTJS_MIGRATION_PLAN.md` for migration notes.
- Use `npm run worker:outbox` to process queued push jobs in development or staging.
- The legacy TanStack Start application was removed after the Next.js migration; its history remains available in Git.

## Still missing before production

The core product workflows are implemented, but production readiness still requires evidence and hardening outside the current feature code:

- Full browser end-to-end coverage for patient, nurse, doctor, and admin role/ownership scenarios.
- MongoDB-backed repository and Server Action integration tests; the current suite primarily covers policies, utilities, and seed behavior.
- Update `src/lib/action-result.test.ts` for the current result contract (`code`, `message`, correlation/event IDs, and field errors); two assertions currently fail because they still expect the old minimal shape.
- Add a dedicated doctor chat inbox/thread route and notification deep link; the patient can now use a real doctor thread, but the doctor workspace has no equivalent conversation screen.
- Automated accessibility checks and a complete keyboard/screen-reader review of interactive routes.
- A real staging deployment with Firebase credentials, scheduled outbox execution, monitoring, alerting, and dead-letter operational ownership.
- Executed migration and backup/restore rehearsals; the current files under `docs/` are runbooks/evidence templates, not proof of a completed production rehearsal.
- Security, privacy, clinical, performance/load, and disaster-recovery sign-off for the intended healthcare deployment.
- CI/CD release gates that run lint, tests, build, accessibility, and deployment checks automatically.

For the detailed implementation ledger and release gates, see [`PRODUCTION_APP_IMPLEMENTATION_PLAN.md`](./PRODUCTION_APP_IMPLEMENTATION_PLAN.md).
