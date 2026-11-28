# ChatHeal — weekly diet & daily reports

## What was added
- Admin `/diet`: categories, client assignment, Excel import, editable day-by-day preview, saved drafts, manual publication, daily submitted/pending reports and real XLSX exports.
- Client `/diet`: assigned day's meals, as planned / changed amount / not eaten, optional notes, extra food, server-saved drafts, final submission and personal Excel download.
- Existing Express/SQLite backend owns the shared data; no localStorage simulation is used for diet records.
- Login no longer silently switches a real client to demo mode because of an assessment or network error.

## Install and run (Node.js 24)
1. Back up your existing backend database and `.env`. Keep the existing database; never overwrite a live database with an archive copy.
2. Backend: `npm ci`, copy `.env.example` to `.env` only for a fresh installation, retain your existing values, then `npm start`.
3. Set `CLIENT_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002` for local development. In production, use the actual frontend origins.
4. In **both frontend folders**, set `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:4000/api`. Use the actual API URL before a production build.
5. Each frontend: `npm ci`, `npm run dev`. Admin: http://localhost:3002/diet. Client: http://localhost:3000/diet.
6. Build: `npm run build`. These projects use Next.js static export. Use `npm run preview` to preview `out/` locally; deploy `out/` to your static host in production. Existing `next start` is not the static-export serving path.
7. Sign in with **real backend accounts**, not Explore Demo. Diet screens intentionally disable publishing/submitting in demo mode. A fresh backend can be seeded with your own `SEED_PASSWORD` (12+ characters) and `npm run seed`; do not seed or replace a live database merely to add this module. Seed account emails are printed by the seed command.

New SQLite tables are created additively at backend startup. Existing users, appointments and food logs are retained. There is no destructive migration.

## Admin workflow
1. Diet studio → Categories & clients: create A/B/C (or your own names), assign users. Create missing client accounts in the existing Clients page.
2. Weekly plans: select the category and the Monday start date. For a Saturday publication, select the **coming Monday** when preparing next week's plan.
3. Upload your `.xlsx` file (up to 4 MB). It must have one diet sheet, a `Day` header, Monday–Sunday rows, and meal columns. Six-day plans are accepted; missing days are reported, not invented.
4. Review **every day**. `+` separated foods are proposed as individual items; commas and prose remain together. Split compound items with Add food item and edit/remove as needed. Original source cells remain visible for checking. Enter planned quantities/ranges exactly as supplied. Blank means unspecified. Water instructions remain intact.
5. Save draft, tick the review confirmation, then Publish. The active recipients are listed before publishing. The plan appears inside their website accounts; no email/WhatsApp delivery is configured.
6. Daily reports: select date/category and Show reports; view submitted/pending users and download all or one user's workbook.

## Client workflow
Open My diet plan → today is selected using India time → mark each item as planned, changed amount or not eaten → add notes/extras → Save draft or confirm and Submit. Submission creates a server record immediately; Excel is generated on download. No manual Excel creation/upload is needed. Future days are preview-only. Past assigned days may be filled retrospectively. Submitted reports are locked. Drafts can be resumed after logging in again.

## Rules and limits
- Manual publication is implemented. Saturday automatic scheduling is **not enabled**; its timing/behavior has not been confirmed.
- Category recipients are snapshotted at publish time. Membership changes affect subsequent publications. A client cannot receive two category plans for the same week.
- One plan per category/week; drafts are editable, published plans are immutable. Plan correction/reissue and post-submission amendment workflows are not implemented.
- PDF and Word attachments are lab/deficiency reports, not this weekly diet format. This module imports `.xlsx` only. It does not perform PDF OCR or automatic medical categorisation.
- Calories/protein are not guessed. Actual quantities retain their units; as-planned records preserve the coach's text/range, with no invented numerical amount.
- Daily report exports contain the client name, ID, date, category, meal, food, planned quantity, actual amount/unit, status, notes, original instructions and submission time. Pending clients remain in the report. Private drafts are not exposed as submitted meals.
- API permissions enforce coach-only imports/publication/reports and client-only own-plan/submission/download. Dates, item IDs, duplicates, quantities and future submissions are validated server-side. Uploaded XLSX ZIP metadata is bounded before parsing; no macros/formulas are executed.
- Production deployment must preserve the persistent SQLite data directory, use HTTPS and compatible frontend/API cookie domains, and set the real allowed origins. No live deployment was performed.

## Verification
- Backend `npm test`: original authenticated workflow plus new real-workbook import/category isolation, publication, draft, submission, pending-status, XLSX round-trip, invalid workbook/date/formula tests.
- Both frontend TypeScript checks and production builds passed.
- Browser visual/E2E verification was attempted but Chromium could not launch because this environment blocks its required socket operation. Responsive styles cover narrow mobile layouts, but physical-device and browser visual checks remain to be done.
