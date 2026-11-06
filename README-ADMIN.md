# ChatHeal — Luxury Admin Studio

A refreshed coach workspace with frosted glass surfaces, colour-coded Lucide icons, responsive layouts, and persistent light/dark themes.

## Run locally

Use Node.js 22 or newer. From this folder:

```bash
npm ci
npm run dev
```

Open http://localhost:3002. Choose **Explore Coach Demo** to review the interface without a backend.

For a production build:

```bash
npm run build
npm start
```

## Connect your existing backend

Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to your existing API base URL. The default is `http://localhost:4000/api`. This archive contains the admin frontend only. Keep your existing backend, database and environment values.

## Updated screens

Overview, Clients, Content library, Package studio, Programmes (the package studio alias), Appointments, Live sessions, Nutrition insights, Settings, and authentication styling.

## Design and interaction

- Light: soft ivory/mint glass, deep slate text, emerald actions.
- Dark: layered forest surfaces, pale text, mint accents.
- Distinct blue, amber, violet and rose icon accents.
- Theme preference is remembered in local storage; first visit follows the system theme.
- Compact dashboard metrics, clearer headings, responsive forms and tables.
- Keyboard focus indicators, skip link, modal/drawer focus handling and Escape dismissal.
- Reduced-motion support and local demo imagery.

`src/app/studio.css` owns the final visual system. `theme-tokens.css` maps the inherited palette across themes. `ThemeToggle.tsx` manages appearance changes.

## Verification and scope

See `QA-REPORT.md` for the tested route/viewport matrix and demo interaction coverage. Tests use Chromium emulation, not physical devices. Live authentication, backend persistence, real video calls and external messaging require your existing services and were not integration-tested.

Package editing remains a browser-local draft workflow inherited from the supplied project. Registration is invitation-only in this frontend; it does not create accounts. Existing illustrative telemetry and notifications are not live measurements. Payments are not included.
