# Migration decisions (locked)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 15 App Router | Target architecture |
| Data layer | **MongoDB Atlas** (native driver) | User-provided cluster; document model fits care data |
| ORM | Repository pattern + typed collections | Drizzle is SQL-only; MongoDB driver with Zod-style types |
| Auth | Auth.js v5 (next-auth) + Credentials | Native Next.js sessions, RBAC in middleware |
| API pattern | Server Actions | Primary mutation path |
| Push notifications | Firebase Cloud Messaging | Optional; graceful skip without credentials |

Legacy SQLite/Drizzle files (`src/db/schema.ts`, `drizzle.config.ts`) are unused and can be removed.
