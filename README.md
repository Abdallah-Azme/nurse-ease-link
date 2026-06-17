# CareConnect (Next.js)

Patient monitoring demo migrated from TanStack Start to **Next.js 15** with **Server Actions**, **Auth.js**, and **Drizzle ORM** (SQLite for local dev).

## Quick start

```bash
npm install
npm run db:setup    # seed MongoDB Atlas (careconnect database)
npm run dev         # http://localhost:3000
```

Set `MONGODB_URI` in `.env` (see `.env.example`). Database name defaults to `careconnect`.

## Demo logins

Password for all accounts: `demo123`

| Role    | Email                      |
|---------|----------------------------|
| Patient | patient@careconnect.demo   |
| Nurse   | nurse@careconnect.demo     |
| Doctor  | doctor@careconnect.demo    |
| Admin   | admin@careconnect.demo     |

## Scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start development server             |
| `npm run build`   | Production build                     |
| `npm run start`   | Start production server              |
| `npm run db:setup`| Push schema + seed database          |
| `npm run db:seed` | Re-run seed (skips if data exists)   |
| `npm test`        | Run Vitest unit/integration tests    |

## Architecture

- **App Router** — `src/app/` (patient, nurse, doctor, admin workspaces)
- **Server Actions** — `src/actions/` (medications, emergencies, messages, assignments)
- **Database** — MongoDB Atlas (`src/db/mongo/`) with typed collections
- **Auth** — Auth.js v5 with JWT sessions and role-based middleware

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
2. Sign in — the app requests notification permission and registers your FCM token.
3. Triggers include: emergency alerts, chat messages, assignment changes, appointments, prescriptions, medication logs.

Without Firebase env vars, the app works normally; pushes are logged in dev and skipped.

## Legacy notes

SQLite/Drizzle files remain in the repo but are **no longer used**. All runtime data goes through MongoDB.

See `MIGRATION_DECISIONS.md` and `NEXTJS_MIGRATION_PLAN.md` for full migration notes.

## Legacy TanStack Start files

The following are **no longer used** by the Next.js app and can be removed when Lovable sync is no longer needed:

- `src/routes/`, `src/router.tsx`, `src/routeTree.gen.ts`
- `src/start.ts`, `src/server.ts`, `vite.config.ts`
