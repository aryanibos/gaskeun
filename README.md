# Gaskeun — AI content approval for creative teams

**Google AI Builder Cup 2026 · Theme: Media, Content & Digital Experiences**

🔗 **Live demo:** https://gasskeun.web.app · **Repo:** https://github.com/aryanibos/gaskeun

> Upload. Check. Approve. Gaskeun. 🚀 — built with Gemini 2.5 Flash, Firebase AI Logic, Firebase Auth, Cloud Firestore and Firebase Hosting.

## Problem
Small creative studios and in-house design teams publish to Instagram, LinkedIn and TikTok every day. Each post needs a
platform-specific caption, hashtags and a brand check (typos, wrong brand spelling, missing CTA, banned words) before a
Head Designer approves it. Today this is manual copy-writing plus WhatsApp back-and-forth, and mistakes still get published.

## Solution
Gaskeun is a web app where a Staff Designer uploads artwork, **Gemini** reads the image and drafts captions for every
platform, a **Brand Guardian** (also Gemini) checks artwork + captions against the brand rules, and the Head Designer
reviews the submission with the AI findings attached.

## Features
| Feature | Status |
|---|---|
| Upload artwork (PNG/JPG/WEBP) with preview | ✅ Real |
| Gemini image understanding → captions for Instagram, LinkedIn, TikTok + hashtags (structured JSON via `responseSchema`) | ✅ Real |
| Regenerate → new Gemini variation | ✅ Real |
| Brand Guardian: image + captions + brand rules → `{issues[], riskScore, summary}` | ✅ Real |
| Google sign-in (Firebase Auth) with `users/{uid}` profile + role (staff/head/admin) | ✅ Real |
| Submissions saved to Firestore; Head review queue is live (`onSnapshot`) | ✅ Real |
| Approve / request revision / reject → status + reviewer comment in Firestore; approved items in Published | ✅ Real |
| Activity log written to and read from Firestore; Admin can change user roles | ✅ Real |
| Firestore security rules (auth required, role checks) | ✅ Real |
| Clear "AI not configured" state when Firebase env vars are missing (no fake AI output) | ✅ |
| Hosting on Firebase Hosting | ✅ Config included |
| Calendar, team insights, analytics numbers, connected accounts, invites | 🟡 UI prototype with sample data |
| Sample items when Firestore is empty | 🟡 Shown with a `[Sample]` prefix |
| Actual publishing to Instagram/LinkedIn/TikTok, scheduling, Cloud Storage for images | 🗺️ Roadmap |

## Architecture
```
Browser (React 19 + Vite + Tailwind v4)  ← served by Firebase Hosting (site "gasskeun")
   ├─ firebase/auth      → Firebase Auth (Google sign-in, signInWithPopup)
   ├─ firebase/firestore → Cloud Firestore: users/{uid}, submissions/{id}, activity/{id}
   │                        (protected by firestore.rules)
   └─ firebase/ai        → Firebase AI Logic → Gemini Developer API (gemini-2.5-flash)
```
- `src/lib/firebase.ts` – shared app init from `VITE_FIREBASE_*`.
- `src/lib/auth.ts` – Google sign-in, profile creation, roles.
- `src/lib/db.ts` – submissions / users / activity reads & writes, image compression.
- All AI code lives in `src/lib/ai.ts` (`generateCaptions`, `checkBrand`).

### Data model
- `users/{uid}`: `displayName, email, photoURL, role ('staff'|'head'|'admin'), createdAt, updatedAt`
- `submissions/{id}`: `title, captions{Instagram,LinkedIn,TikTok}, hashtags{…}, platforms[], brandCheck{issues[],riskScore,summary}, detected, aiGenerated, status ('draft'|'submitted'|'approved'|'revision'|'published'), timing, note, imageUrl, createdBy, createdByName, createdAt, updatedAt, reviewerComment, reviewedBy, reviewedByName, reviewedAt`
- `activity/{id}`: `uid, person, personRole, actionCategory, actionLabel, targetTitle, detail, createdAt` (append-only)

**Images:** Cloud Storage for Firebase requires the Blaze (billing) plan on new projects, so the uploaded artwork is
downscaled (max 1280 px) and JPEG-compressed in the browser to a data URL under ~700 KB and stored in the submission
document (Firestore docs are limited to 1 MiB). Moving images to Cloud Storage is on the roadmap.

**Roles:** first sign-in creates `users/{uid}` with the role picked on the login screen (default Staff). For the demo,
the sidebar role switch updates your own role so one Google account can try Staff → Head → Admin; the rules allow this
self-switch (marked DEMO in `firestore.rules`). For production remove it and let only Admins change roles.
- Default brand rules: `src/config/brandRules.ts` (brand spelling, banned words, tone, required CTA).
- No API key or secret is embedded beyond the public Firebase web config read from env at build time.

**Roadmap (Google Cloud):** Cloud Run publish API (Meta Graph / LinkedIn / TikTok), Meta/LinkedIn OAuth for connected accounts, Cloud Scheduler for scheduled publishing, Firebase App Check to protect
AI Logic, Cloud Storage for artwork.

## Setup
Requirements: Node 20+, pnpm, Firebase CLI (`npm i -g firebase-tools`).

1. In the [Firebase console](https://console.firebase.google.com) create (or pick) a project.
2. **Build → AI Logic → Get started**, choose **Gemini Developer API** and enable it.
3. **Project settings → General → Your apps → Add app → Web**. Copy the config values.
4. `cp .env.example .env` and fill in:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=<project-id>
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=<project-id>.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   ```
5. **Authentication → Get started → Sign-in method → Google → Enable** (pick a support email, Save).
   **Authentication → Settings → Authorized domains**: make sure your Hosting domains (e.g. `gasskeun.web.app`,
   `gasskeun.firebaseapp.com`) and `localhost` are listed.
6. **Firestore Database → Create database** → Production mode → location e.g. `asia-southeast2` (Jakarta).
7. `pnpm install && pnpm dev` → open the app, sign in with Google, upload an image.

## Deploy (Firebase Hosting)
1. Put your project id in `.firebaserc` (replace `your-firebase-project-id`).
2. `firebase login`
3. `pnpm run deploy` (runs `pnpm build && firebase deploy --only hosting,firestore` — Hosting + Firestore rules/indexes).
   Note: use `pnpm run deploy` — plain `pnpm deploy` is a built-in pnpm command.
   `.firebaserc` points at `gen-lang-client-0056669642` and `firebase.json` targets the Hosting site `gasskeun`.

`pnpm-workspace.yaml` sets `minimumReleaseAge: 0` so pnpm doesn't refuse recently published transitive deps.

Env vars are baked in at build time, so `.env` must exist when you build/deploy.

## What's real vs. roadmap
- **Real:** Google sign-in, Firestore user profiles & roles, image upload, Gemini caption generation (3 platforms +
  hashtags), Regenerate, Gemini Brand Guardian with risk score/issues, submissions persisted in Firestore, live Head
  review queue, approve/revision with reviewer comments, approved history, Firestore activity log, security rules,
  Firebase Hosting deployment.
- **Sample/demo data:** other queue items, calendar, team insights, analytics, admin screens, scheduling suggestion
  (labelled as sample in the UI).
- **Roadmap:** real social publishing (Cloud Run + Meta/LinkedIn/TikTok APIs & OAuth), Cloud Scheduler for scheduled
  posts, Cloud Storage for artwork, App Check, real invites, analytics.
- If Firebase env vars are missing, the app runs in a clearly labelled local demo mode (no sign-in, nothing saved).
