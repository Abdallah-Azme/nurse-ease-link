# Firebase Cloud Messaging — Notification Touchpoints

This document lists every CareConnect event where a **Firebase push notification** is appropriate, whether it is implemented, and who receives it.

## Setup

1. Create a Firebase project and enable **Cloud Messaging**.
2. Generate a **Web Push certificate** (VAPID key) in Firebase Console → Project Settings → Cloud Messaging.
3. Create a **service account** (Project Settings → Service Accounts → Generate new private key).
4. Copy `.env.example` Firebase variables into `.env`.

Push delivery is **skipped gracefully** when Firebase env vars are missing (local dev without Firebase still works).

---

## Notification map

| #   | Event                       | Trigger                                | Recipient(s)                       | Priority | Route on tap                     | Status                                       |
| --- | --------------------------- | -------------------------------------- | ---------------------------------- | -------- | -------------------------------- | -------------------------------------------- |
| 1   | **Patient emergency**       | `triggerEmergency`                     | Assigned nurse + doctor            | Critical | `/nurse/alerts` or `/doctor`     | Implemented                                  |
| 2   | **Critical alert created**  | Same as emergency (alert row inserted) | Assigned nurse                     | Critical | `/nurse/alerts`                  | Implemented (via #1)                         |
| 3   | **New care-team message**   | `sendMessage`                          | Message recipient                  | Normal   | `/patient/chat` or `/nurse/chat` | Implemented                                  |
| 4   | **Alert resolved**          | `resolveAlert`                         | Patient who owns the alert         | Normal   | `/patient`                       | Implemented                                  |
| 5   | **Care team reassignment**  | `updateAssignments`                    | Newly assigned nurse and/or doctor | Normal   | `/nurse` or `/doctor`            | Implemented                                  |
| 6   | **Appointment scheduled**   | `createAppointment`                    | Patient                            | Normal   | `/patient`                       | Implemented                                  |
| 7   | **Appointment cancelled**   | `cancelAppointment`                    | Patient                            | Normal   | `/patient`                       | Implemented                                  |
| 8   | **Prescription renewed**    | `renewPrescription`                    | Patient                            | Normal   | `/patient/medications`           | Implemented                                  |
| 9   | **Medication marked taken** | `markMedicationTaken`                  | Assigned nurse                     | Low      | `/nurse/patients`                | Implemented                                  |
| 10  | **Vitals anomaly**          | Automated vitals ingest (future)       | Nurse + doctor                     | High     | `/nurse/alerts`                  | Not implemented — no vitals write action yet |
| 11  | **Missed medication dose**  | Scheduled job (future)                 | Patient + nurse                    | Warning  | `/patient/medications`           | Not implemented — needs cron                 |
| 12  | **Admin platform alert**    | Manual admin broadcast (future)        | All staff                          | Low      | `/admin`                         | Not implemented — no broadcast UI            |

---

## Not recommended for FCM

| Event                      | Reason                                     |
| -------------------------- | ------------------------------------------ |
| User login / logout        | In-app only; no push needed                |
| Theme toggle               | Local UI preference                        |
| AI assistant replies       | User is already on the page; use in-app UI |
| Admin viewing analytics    | Read-only; no actionable event             |
| Seeded demo alerts on load | Static data; not user-triggered            |

---

## Architecture

```
Client (browser)
  └─ FcmRegistration → requests permission → FCM token
  └─ registerFcmToken (Server Action) → fcm_tokens table

Server Action (mutation)
  └─ sendPushToUsers() → Firebase Admin SDK → FCM → device

Service worker: /firebase-messaging-sw.js (background notifications)
```

## Files

| File                                                | Role                              |
| --------------------------------------------------- | --------------------------------- |
| `src/lib/firebase/admin.ts`                         | Firebase Admin singleton          |
| `src/lib/firebase/send-push.ts`                     | `sendPushToUsers`, payload types  |
| `src/lib/firebase/client-config.ts`                 | Public Firebase web config        |
| `src/actions/notifications.ts`                      | Register / unregister FCM tokens  |
| `src/components/notifications/fcm-registration.tsx` | Client token + foreground handler |
| `src/app/firebase-messaging-sw.js/route.ts`         | Dynamic service worker            |
