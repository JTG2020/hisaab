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

To add an entry from the list page, either choose the customer in the **Customer** dropdown inside the entry form, or press **Add entry** on that customer's row. Both select the customer and scroll to the form.

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

Deploy `app/` as a static site. On Vercel choose **Root Directory = `app`**, framework preset **Other**, no build command. The app reads no environment variables, uses no auth/cookies, and makes no network calls.

## Current status

All technical gates G0–G6.1 are green; the final suite is 57/57 and the final model score is 100/100 (floor 97 under the strict B6-placeholder reading). The only remaining step is the human deployment/submission: deploy `app/`, paste the live URL into the judges' note in `docs/IMPLEMENTATION-PLAN.md` §3, and submit before **Sun 22 Nov 2026, 10:00 IST**.
