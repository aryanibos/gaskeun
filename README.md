# Gaskeun — AI content approval for creative teams

**Google AI Builder Cup · Theme: Media, Content & Digital Experiences**

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
| Head review queue shows the real Gemini result for the submitted item | ✅ Real (in-memory app state) |
| Clear "AI not configured" state when Firebase env vars are missing (no fake AI output) | ✅ |
| Hosting on Firebase Hosting | ✅ Config included |
| Role switcher, queue, calendar, team, admin, published screens | 🟡 UI prototype with sample data |
| Actual publishing to Instagram/LinkedIn/TikTok, persistence, scheduling | 🗺️ Roadmap |

## Architecture
```
Browser (React 19 + Vite + Tailwind v4)
   │  firebase/ai SDK (Firebase AI Logic, App config from VITE_FIREBASE_*)
   ▼
Firebase AI Logic  ──►  Gemini Developer API  (model: gemini-2.5-flash)
   ▲
Firebase Hosting (serves /dist, SPA rewrite)
```
- All AI code lives in `src/lib/ai.ts` (`generateCaptions`, `checkBrand`).
- Default brand rules: `src/config/brandRules.ts` (brand spelling, banned words, tone, required CTA).
- No API key or secret is embedded beyond the public Firebase web config read from env at build time.

**Roadmap (Google Cloud):** Cloud Run publish API (Meta Graph / LinkedIn / TikTok), Firestore for submissions & audit
log, Meta/LinkedIn OAuth for connected accounts, Cloud Scheduler for scheduled publishing, Firebase App Check to protect
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
5. `pnpm install && pnpm dev` → open the app, sign in as Staff, upload an image.

## Deploy (Firebase Hosting)
1. Put your project id in `.firebaserc` (replace `your-firebase-project-id`).
2. `firebase login`
3. `pnpm run deploy` (runs `pnpm build && firebase deploy --only hosting`).
   Note: use `pnpm run deploy` — plain `pnpm deploy` is a built-in pnpm command.

Env vars are baked in at build time, so `.env` must exist when you build/deploy.

## What's real vs. roadmap
- **Real:** image upload, Gemini caption generation (3 platforms + hashtags), Regenerate, Gemini Brand Guardian with
  risk score/issues, results flowing to the Head review screen, Firebase Hosting deployment.
- **Sample/demo data:** other queue items, calendar, team insights, analytics, admin screens, scheduling suggestion
  (labelled as sample in the UI).
- **Roadmap:** real social publishing, persistence (Firestore), auth, scheduling.
