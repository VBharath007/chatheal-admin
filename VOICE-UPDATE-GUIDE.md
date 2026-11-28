# ChatHeal — Voice & Google Sheet updates

28 November 2026

உங்கள் மூன்று voice transcripts, Google Sheet, Word reference, weekly Excel, lab PDF மற்றும் blood-test checklist ஆகியவற்றை uploaded Admin / User / Backend code-உடன் ஒப்பிட்டு, விடுபட்ட workflow மட்டும் சேர்க்கப்பட்டுள்ளது.

## எது ஏற்கனவே இருந்தது? எது சேர்க்கப்பட்டது?

| Requirement | Original code | இந்த update / பார்க்க வேண்டிய இடம் |
|---|---|---|
| Weekly Excel plan import, food splitting, categories, publish | Already present | Existing Diet studio → Weekly plans அப்படியே உள்ளது |
| User meal checklist, changed/skipped food, extra food, photos, macros, export | Already present | Existing User → Diet flow அப்படியே உள்ளது |
| Client health assessment & report | Already present | Existing assessment/client screens மாற்றப்படவில்லை |
| Food names, portion, servings, calories, protein, fat, carbs, fibre — coach daily chart | Coach worksheet இல்லை; user meal reports/analytics மட்டும் இருந்தன | Admin → Diet studio → Client workspace → Daily chart |
| Daily target, actual total, remaining/over target | Sheet-style coach target/balance இல்லை | Daily chart summary + date-specific targets; calorie ranges supported |
| Hydration, bedtime, awakenings, wake time, fitness focus & minutes | Assessment-ல் usual habits இருந்தன; daily check-in இல்லை | Admin / User → Daily check-in |
| Add new daily tracking questions | இல்லை | Client setup → Extra daily tracking fields |
| Private Word reference and lab reports together per client | Dedicated private document workspace இல்லை | Documents & weeks; reference/lab uploads remain private |
| W1 / W2 from joining date; weekly document history | Calendar-week diet plans இருந்தன; joining-date numbering இல்லை | Client setup → Joining date; Documents & weeks |
| Common blood-test checklist | Supplied 11-category checklist இல்லை | Client setup / User → Test checklist |
| Reduce repeated work | Existing weekly import was present | Copy previous chart + Use submitted meal report + default targets |

## Admin-ல் எப்படி பயன்படுத்துவது?

1. **Diet studio → Client workspace** திறந்து client தேர்வு செய்யவும்.
2. **Client setup**-ல் joining date, daily targets, private notes மற்றும் தேவையான extra tracking questions சேர்த்து **Save client setup** செய்யவும்.
3. **Documents & weeks**-ல் Word reference / lab PDF upload செய்யவும். Client-க்கு அனுப்ப வேண்டிய weekly document-க்கு மட்டும் **Weekly plan document → Make this weekly plan visible to this client** தேர்வு செய்யவும்.
4. **Daily chart**-ல் food மற்றும் one-portion nutrition சேர்க்கவும். `150 g` என்பது portion; `2` servings என்றால் அந்த portion-ன் nutrition இருமடங்காகக் கணக்கிடப்படும். Sheet-ல் ஏற்கனவே total-for-portion values இருந்தால் servings `1` வைக்கவும்.
5. Previous chart-ஐ copy செய்யலாம்; அல்லது **Use submitted meal report** மூலம் client ஏற்கனவே submit செய்த உணவுகளை எடுத்துக்கொள்ளலாம். Skipped foods வராது; manual nutrition values மட்டும் copy ஆகும்; missing values நீங்கள் review செய்து நிரப்பலாம்.
6. **Save draft** coach-க்கு மட்டும். **Publish to client** செய்ததும் அந்த client portal-ல் தெரியும். Existing published chart-ஐ draft-க்கு மாற்றும்போது confirmation உள்ளது.
7. **Download saved chart** மூலம் date-wise Excel பெறலாம். Foods, totals, target, balance, coach note மற்றும் wellness check-in அதில் இருக்கும். Private coach notes/reference files வராது.

## User-ல் எங்கே?

**Diet → Your care companion** பகுதியில் record date தேர்வு செய்து:

- Daily chart: coach publish செய்த chart, totals மற்றும் Excel download.
- Daily check-in: hydration, sleep, awakenings, wake-up, activity, duration, custom questions; Google account தேவையில்லை.
- Documents & weeks: shared weekly plans மற்றும் own lab-report upload.
- Test checklist: coach marked progress (read-only).

Existing meal checklist-ன் date control மற்றும் care record date தனித்தனியாக உள்ளன. ஒரு பழைய நாளைப் பார்க்கும்போது தேவையான பகுதியில் அந்த தேதியைத் தேர்வு செய்யவும். Weekly documents upload செய்யும் போது W1/W2 number review செய்யலாம்.

## Reference verification

- Google Sheet `Vijayakumar_Food_Log`: 14-11-2026, 16-11-2026, 17-11-2026 tabs inspected. Food/portion + five nutrient columns, totals, daily targets, actual intake, balance, hydration, sleep, awakenings, wake-up, fitness focus/duration all checked.
- 14-11 sample-ல் calorie food-row total மற்றும் displayed actual intake வேறுபட்டிருந்தது. புதிய chart-ல் actual intake food rows-லிருந்து கணக்கிடப்படும்; தனியாக conflicting total type செய்ய வேண்டியதில்லை.
- Word file is a **private deficiency/reference document**, not a weekly client plan. The uploaded Excel is the weekly meal layout. அந்த content distinction அடிப்படையில் document privacy அமைக்கப்பட்டுள்ளது.
- Lab PDF is a six-page reference report. Medical values are not auto-diagnosed or copied into another client’s account.
- Image checklist-ன் 11 categories, including vitamin/mineral, infection, heart and enzyme tests, சேர்க்கப்பட்டுள்ளன.
- Google Sheet ஒரு reference ஆகச் சரிபார்க்கப்பட்டது; ongoing Google sync/import service இணைக்கப்படவில்லை. புதிய daily chart app-ல் save/publish/export ஆகும்.

## Calculation & privacy rules

- Nutrition entered is per listed portion; servings multiply it.
- Missing nutrient values remain unknown (`—`), not invented zeroes. If a food lacks a nutrient, that nutrient’s complete total/balance remains unavailable until filled.
- Remaining = target minus recorded total; negative values are shown as over target. For calorie ranges, remaining uses the upper value, explicitly labelled.
- No default nutrition targets are prescribed automatically. The coach sets them.
- Existing analytics and its estimate logic were not modified. The new coach chart uses recorded values and stays separate from those estimates.
- Private notes are excluded from client API responses and exported daily charts. Client A cannot fetch Client B’s documents. Uploaded lab reports are available to the uploading client and coach; coach-uploaded reference/lab files remain coach-only.
- Only weekly plan documents have an explicit client sharing option. Downloads require the existing signed-in session.
- Date validation, non-negative values, bounded upload size/types and version conflict checks are included. Reload saved data resolves a stale version before editing again.
- The report/reference documents supplied in this conversation were not automatically assigned to a live client or embedded as new sample data.

## Changed code files only

| Package | Modified existing file | New files |
|---|---|---|
| Admin | `src/components/diet/DietScreen.tsx` | `src/components/care/CareWorkspace.tsx`, `src/components/care/care.css` |
| User | `src/components/diet/DietScreen.tsx` | `src/components/care/CareWorkspace.tsx`, `src/components/care/care.css` |
| Backend | `backend/src/diet/routes.js` | `backend/src/diet/care.js`, `backend/test/care.test.js` |

Each ZIP also contains this `VOICE-UPDATE-GUIDE.md`. Original assets, routes, screens, dependency versions and database bytes are preserved. Build output, installed node_modules and preview test accounts are not included.

## Apply the update

Existing project-ல் **மேலே பட்டியலிட்ட changed/new files மட்டும் copy செய்வது போதும்**. Full ZIPs are supplied for convenience.

1. Keep your current `.env` and live database. **Do not overwrite the server’s `backend/data` folder with ZIP data.** Back up the live SQLite database before deploying.
2. Copy the listed frontend files into their matching Admin / User projects.
3. Copy backend `src/diet/routes.js` and new `src/diet/care.js`; the new test is optional for deployment.
4. Restart the backend. It creates four new `care_*` tables using `CREATE TABLE IF NOT EXISTS`; no reset/seed command is needed.
5. Build both frontend projects using `npm run build` and deploy their `out` directories using your existing hosting process.
6. Keep `NEXT_PUBLIC_API_URL` pointed to your own backend `/api` URL at build time, as in your existing setup.

The backend uses the existing Node SQLite runtime (tested with Node 24). No new production dependency was added. If installing from scratch, run `npm ci` in each package first.

## Validation

- Admin: TypeScript and production static build — passed.
- User: TypeScript and production static build — passed.
- Backend: `npm test` — 6 tests passed (existing workflow regression + new care functionality).
- Coverage includes private data isolation, cross-client file denial, draft/publish visibility, portion calculations, unknown nutrient values, week boundaries, wellness validation, stale-version conflicts, Excel output, and copying submitted meals without inferred nutrition.
- Added CSS is scoped to the new workspace, with light/dark colours, focus styles, wrapping tabs, small-screen cards and an independently scrollable nutrition table.
- **Visual browser QA remains unverified:** the available browser could not connect to the local preview. Before production release, check the new workspace in your browser at 320px/mobile, tablet and desktop widths in both themes.
- No live website deployment was performed.
