# UI verification report

## Build

Production build and TypeScript validation passed.

## Route matrix

Chromium browser emulation with demo data, reduced motion, and a 1000 px viewport height.
Every route below was checked at 375, 768, 1024 and 1440 px widths in both light and dark themes (72 combinations).

| Route | Screen | Light | Dark |
|---|---|---|---|
| / | Overview | Pass | Pass |
| /clients | Clients | Pass | Pass |
| /discover | Content library | Pass | Pass |
| /packages | Package studio | Pass | Pass |
| /programmes | Package studio alias | Pass | Pass |
| /appointments | Appointments | Pass | Pass |
| /sessions | Live sessions | Pass | Pass |
| /progress | Nutrition insights | Pass | Pass |
| /settings | Settings | Pass | Pass |

No JavaScript page errors were captured. No unintended page overflow was detected in the final matrix. Data tables and horizontally scrolling filter/appointment strips retain intentional inner scrolling. A further 12 targeted checks covered Overview, Clients and Content library at the four widths after responsive fixes.

Screenshots were visually reviewed across the route matrix. A final high-specificity heading rule resolves inherited gradient text contrast in dark mode. This is practical UI testing, not a formal WCAG certification or a physical-device/browser compatibility certification.

## Interaction checks

- Theme changes on login — passed.
- Theme persists after reload — passed.
- Demo login opens workspace — passed.
- Notification closes with Escape — passed.
- Client search filters results — passed.
- Client empty search state — passed.
- Add client dialog opens — passed.
- Client dialog closes with Escape — passed.
- Dark heading uses readable foreground — passed.
- Package editor opens — passed.
- Mobile drawer closes with Escape — passed.
- Mobile navigation closes after route selection — passed.
- Client nutrition details load — passed.
- Nutrition client selection works — passed.
- Theme switch works on mobile — passed.

## Limits

Testing used the supplied demo mode. No backend was supplied, so real login, saved server records, video connectivity, messaging and production API integration were not tested. Package drafts remain browser-local. Existing demo notifications and telemetry are illustrative. Registration is invitation-only. Safari/Firefox and physical iOS/Android devices were not tested.
