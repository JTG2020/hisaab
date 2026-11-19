# Hisaab — project workspace

Digital ledger for a local shop, with WhatsApp reminders. Build Projects, Freedom With AI.
Deadline: **Sun 22 Nov 2026, 10:00 am IST**.

This folder is self-contained. Do not mix in the other project.

## Read in this order

1. [`PROJECT.md`](PROJECT.md) — what the page asks for: requirements, the exact DOM contract the tester reads, bonus menu, scoring.
2. [`WIN-ANALYSIS.md`](WIN-ANALYSIS.md) — the honest read: what is actually scored, why we might lose, strategy, definition of done, judges' note.
3. [`WIN-PLAN.md`](WIN-PLAN.md) — execution: contract skeleton, data model, edge-case matrix, bonus specs, fuzz harness, build order.
4. [`DESIGN.md`](DESIGN.md) — UI/UX: design constraints, tokens, screens, states, visual risks.

## Sample data

- [`sample-data.json`](sample-data.json) — 8 customers, 38 entries (fictional shop).
- [`sample-data.csv`](sample-data.csv) — the same shop in the combined CSV import format.
- [`sample-expected.json`](sample-expected.json) — expected total `11820` and per-phone balances.

## Agent framework

| Path | Role |
|---|---|
| `AGENTS.md` | orchestration contract: roles, write scopes, loop, gates, doc-sync, Vercel rules |
| `agents/orchestrator.md` | runs the loop and gates; writes only `docs/worklog.md` |
| `agents/planner.md` | owns PRD, TECH-STACK, IMPLEMENTATION-PLAN, CONTRACT, DECISIONS, TRACEABILITY |
| `agents/coder.md` | implements one phase at a time in `app/` |
| `agents/tester.md` | independent oracle, cases, runs, bug reports; never fixes |
| `agents/critic.md` | scores against the rubric and gates; never builds |
| `docs/` | living documents (versioned) — see `AGENTS.md` §4 for sync rules |
| `tests/README.md` | test layout, commands, gate policy |

Deployable unit is `app/` — static HTML/CSS/JS, no build step.

## Run locally

No build step and no package install is needed for the app itself. From this folder:

```bash
python3 -m http.server 4173 --directory app
```

Open <http://localhost:4173>.

Useful routes:

- `/` — customer list, import, add customer/entry, bonuses
- `/?customer=9000000101` — that customer's page
- `/?today=2026-11-15` — date-dependent views (overdue/day counts)

To see data immediately, open [`sample-data.json`](sample-data.json), paste its contents into the `Import shop JSON` box, and press **Import**. Import replaces the current shop; it never merges. Data is stored in the browser's `localStorage` (`hisaab.v1`), so clear this site's data to reset.

To add an entry from the list page, either choose the customer in the **Customer** dropdown inside the entry form, or press **Add entry** on that customer's row. Both select the customer and scroll to the form. The home page shows the total, search and customer list; the customer view opens only on `?customer=<phone>` or when you press **Open** on a row.

## Import a file (JSON or CSV)

Use **Choose JSON/CSV file** to open the native desktop file picker. Pressing **Import** with an empty paste box opens the same picker. Pasting JSON (or CSV) into the box and pressing **Import** still works. Import always replaces the current shop; it never merges.

CSV accepts:

- Primary format: `shop,phone,name,type,amount,date,note` (column order is free).
- Customers only: `phone,name` (optional `credit`/`payment`/`balance` are ignored with a warning).
- Entries only: `phone,type,amount,date,note`; unknown phones auto-create `Customer <phone>`.

Quoted fields, embedded commas/quotes/newlines, BOM and CRLF are supported. [`sample-data.csv`](sample-data.csv) is the sample shop in the primary format; it imports to total `11820` with 8 customers.

## Shop profile, logo and brand

The **Shop profile** card stores the owner name, address, UPI ID and logo locally. They appear in the header; the owner name, address and UPI are visible on every page. The logo is downscaled to 128 px and stored in the browser. A dominant brand color is sampled from the logo and used for a contrast-safe header tint, accent buttons/links and focus ring; if no logo is set, the default palette is unchanged. Invalid/unreadable logos and storage limits fall back without losing the profile or the page.

## UPI in the WhatsApp reminder

Each customer row has a **Pay via UPI** link, and the WhatsApp reminder message now includes the same `upi://pay?pa=...&am=...&cu=INR&tn=...` URI in its text. The payee is the Shop UPI ID entered in the profile (or the demo `hisaab@upi` when unset); `am` is the positive balance, and `0` for zero/negative balances.

## OCR status

**OCR is not implemented in this build.** The amount is entered manually; the screenshot is still attached, downscaled and shown with the payment. B7's OCR prefill is therefore not claimed, and the bonus is scored 0 while the other bonuses cover the 30 available marks.

To test the fallback: import the sample, open a customer, choose **Payment**, select a screenshot on **Payment screenshot**, enter an amount manually (for example `1500`), and save. The entry is saved with one thumbnail and no OCR prefill; reload keeps both. This is covered by `E2E-P7-05`.

## Test

Playwright is a dev-only dependency under `tests/`; it is not part of the deployed app. Keep the local server running in one terminal, then:

```bash
cd tests
npm install
npx playwright install chromium   # first run only
npx playwright test
```

The suite covers the contract selector smoke, the sample import (`11820`, 8 rows), the P1 data core, reminders/screenshot, bonuses, 375 px/dark mode, the full journey, and the 50/200-shop fuzz.

## Deploy

Deploy `app/` as a static site. No build step, dependency install, environment variable, serverless function, rewrite, or `vercel.json` is required. `app/vendor/d3.min.js` (d3 7.9.2) is a vendored static asset used by the customer balance-history chart; commit it with `app/` so Vercel serves it.

### Deploy with the Vercel dashboard

1. Push this repository to a Git provider supported by Vercel.
2. In Vercel, choose **Add New → Project**, import the repository, and open the project configuration.
3. Set **Root Directory** to `app`. This is important: `app/index.html` is the deploy entry point.
4. Choose **Other** for **Framework Preset**. Leave the build and install commands empty. If Vercel asks for an output directory, use `.` so the files in `app/` are served directly.
5. Choose **Deploy**. No environment variables are needed.
6. Open the deployment URL and verify `/`, `/?customer=9000000101`, and `/?today=2026-11-15`. The app uses relative asset paths and query-string views, so no rewrite is needed.

After connecting the Git repository, Vercel can create preview deployments for branches and production deployments for the configured production branch.

### Data and privacy

This is a static, browser-local app: shop ledgers and profiles are saved in that browser's `localStorage`, not on Vercel and not synchronized across devices or users. The deployed site has no authentication; do not treat a public deployment as a private customer-data service.

## Current status

All technical gates G0–G7 are green; the P12 shop-profile draft/Update behavior and the customer balance-history chart (d3, vendored) are merged, and the full suite is 112/112 locally. The scored 60/30/10 blocks are unchanged and the live score stays 100/100; the G12 Critic scorecard and a Vercel redeploy are pending. The P7 owner extras (file/CSV import, UPI in the reminder, shop profile/logo/brand) are non-scored additions.
