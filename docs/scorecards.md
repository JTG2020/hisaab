# SCORECARDS — Hisaab

Version: 0.6
Updated: 2026-11-17
Owner: Critic
Supersedes: none

Append-only, one entry per gate. Evidence only; no encouragement.

## Rubric reminder

| Block | Marks |
|---|---|
| Hidden-data model | 60 |
| Bonus (5 each, 6 count) | 30 |
| 375 px (5) + light/dark (5) | 10 |

Gate thresholds: G0 contract 100% + docs in sync + smoke green; phase gates 100% acceptance and regression, no P0/P1, score not lower than previous; final ≥95, zero P0/P1.

## Entry template

```
### GATE <Gn> | <YYYY-MM-DD> | phase <Pn>
Build: <timestamp/zip>
Runs cited: RUN-<n>, CRITIC-RUN-<n>
Hidden-data: <x>/60 | Bonus: <x>/30 (B1 5, B2 0, ...) | Phone/theme: <x>/10
MODEL SCORE: <x>/100
Deductions:
- D1 <what> — <marks> — <evidence>
Contract audit: <n>/<total>
Doc sync: PASS/FAIL — <output>
Vercel readiness: PASS/FAIL — <notes>
Score risks: <WIN-ANALYSIS §4 item: PASS/RISK/FAIL>
Verdict: PASS | FAIL
Required before re-gate: <ordered list>
Confidence / unknown about the real tester: <lines>
```

## Scorecards

### GATE G0 | 2026-11-17 | phase P0

Build: uncommitted working tree, served by `python3 -m http.server 4173 --directory app` (PID 24413) from `/Users/akanse/Documents/FWAIProjects/batch10/hisaasb`; SHA-256 `app/index.html 0cc08edf…`, `app/styles.css cf5a53dd…`, `app/app.js 58d51eac…` (mtime 08:49–08:52, identical to RUN-1/2/3). Git HEAD `bdbe01b` is the framework baseline and does **not** contain `app/`; no gate tag exists — see reproducibility risk R-6.
Runs cited: RUN-3 (Tester), CRITIC-RUN-1 (my re-run), CRITIC-ADV-1/2 (my independent adversarial runs)
Hidden-data: 0/60 | Bonus: 0/30 (B1 0, B2 0, B3 0, B4 0, B5 0, B6 0, B7 0) | Phone/theme: 5/10
MODEL SCORE: 5/100 (provisional P0 structural baseline; G0 does not require the final ≥95 — the final gate does)
Deductions:
- Ded-1 Hidden-data block not implemented — **60** — no state, import, balances, rows, persistence, reminders or screenshots exist. Independent check CRITIC-ADV-1: 0 matches for all ten data-dependent §1 selectors; `#total-outstanding` is the static empty-state `0`. Owner phases P1–P3.
- Ded-2 Bonus block not implemented — **30** — all six hooks are inert shells (`app.js:111–126` only calls `preventDefault` on `#add-customer`, `#import-go`, `#export-csv`); `#search` does not filter, `#lang-switch` does not translate, `#overdue` has no rows, no `upi://` link exists, no CSV/OCR exists. Owner phase P4.
- Ded-3 375 px with sample + long-unicode data not earned — **5** — measured only at empty state (`scrollWidth` 375 = `innerWidth` 375, CRITIC-ADV-1); the scored oracle needs the sample and a 100-character unicode note, which cannot exist while every data path is absent. Owner phase P5.
- Dark-mode half of Phone/theme is earned (5/5): see CRITIC-ADV-1 contrasts.
Contract audit: **48/48 pass** — 38 P0-observable items + 10 documented data rules; 0 `CONTRACT-<n>` deviations.
Doc sync: **PASS** — literal `R-` check vacuous (0/0/0), corrected `[RNB][0-9]+` check 23 IDs with 0 missing, 29/29 contract selector tokens tested, 0 `TBD`, 23/23 traceability rows phased, 74/74 case IDs defined.
Vercel readiness: **PASS** — `app/index.html` + 2 relative assets only (13,639 B total); no build files, no absolute/localhost URLs, no service worker, no cookie, no auth, no analytics, no console error; `?customer=` direct load returns 200 in a fresh context.
Score risks: WIN-ANALYSIS §4 (13 rows) → PASS 6, RISK 6, mixed 1 (PASS at empty state / RISK with data); WIN-PLAN §4 edge-case matrix 18/18 **FAIL at P0** because no data path exists (expected, P1–P4); WIN-PLAN §11 (8 rows) → PASS 5, FAIL 3 (same reason).
Verdict: **PASS** (structural G0 only)
Required before re-gate: none for G0. Before the **P1** gate: close R-1/R-2/R-3 (Planner, docs only); commit/tag the P1 build. Before **P2**: resolve the D9-vs-CONTRACT §4 phone rule (R-1) without touching the frozen CONTRACT unless the human approves; define E2E-P1…P6 case rows in `TEST-CASES.md`. See R-1…R-7.
Confidence / unknown about the real tester: (1) whether it evaluates `?customer=` after `load` — the customer view is inserted by the deferred script, not present in raw HTML, so a hostile reader that queries before scripts run sees no `#cust-name`; (2) whether it string-compares fractional money (`670.50`) or expects rupee rounding — D4 is the riskiest accepted choice; (3) whether it clears storage between checks and how it uploads files (`setInputFiles` vs drag); (4) whether its overdue oracle counts no-payment customers (D1 sub-rule). Highest-impact wrong assumption at final: D4's two-decimal render and the `?customer=` post-load timing.

#### Write-scope interpretation (recorded explicitly)

`AGENTS.md` §2 gives the Critic `docs/scorecards.md` only; `docs/G0-CHECKLIST.md` is not writable by the Critic. To avoid a second uncontrolled checklist copy, the full A1–A9/B1–B11/C1–C6/D1–D6/E1–E6/F1–F3 checklist is reproduced **below in this file** with `[x]`/evidence and is the signed G0 record. The Orchestrator must copy the sign-off block into `docs/worklog.md` and leave `docs/G0-CHECKLIST.md` unchanged (its boxes may be ticked by its owner in the same phase from this evidence).

#### CRITIC-RUN-1 — independent re-execution of the Tester suite

```
$ cd tests && npx playwright test
Running 23 tests using 1 worker
  ✓   1 [chromium] › e2e/p0-gate.spec.js:59:1 › C-23 Vercel shape: app/index.html, relative assets, no build step, no service worker (325ms)
  ✓   2 [chromium] › e2e/p0-gate.spec.js:95:1 › N-05 no service worker, cookie gate, password field, analytics, or third-party origin (275ms)
  ✓   3 [chromium] › e2e/p0-gate.spec.js:121:1 › E2E-P0-01 first paint: 19 §2 nodes resolve, data selectors are empty, customer view resolves (486ms)
  ✓   4 [chromium] › e2e/p0-gate.spec.js:148:1 › E2E-P0-02 all query-string routes render the same first paint (1.1s)
  ✓   5 [chromium] › e2e/p0-gate.spec.js:176:1 › E2E-P0-03 phone + theme baseline and offline-safe load (421ms)
  ✓   6 [chromium] › nonfunctional/p0.spec.js:10:3 › C-20 document scrollWidth is 375 or less at empty state (239ms)
  ✓   7 [chromium] › nonfunctional/p0.spec.js:30:3 › C-21 dark baseline keeps key nodes visible and text at >= 4.5:1 (260ms)
  ✓   8 [chromium] › nonfunctional/p0.spec.js:63:1 › C-22 no external network request on load (same-origin or data: only) (608ms)
  ✓   9 [chromium] › smoke/contract.spec.js:45:1 › C-01 #total-outstanding resolves on load with text 0 (259ms)
  ✓  10 [chromium] › smoke/contract.spec.js:54:1 › C-02 #import-box and #import-go are visible at first paint (256ms)
  ✓  11 [chromium] › smoke/contract.spec.js:61:1 › C-03 #shot-input exists inside the payment form at first paint (255ms)
  ✓  12 [chromium] › smoke/contract.spec.js:68:1 › C-09 every CONTRACT §2 node resolves and is visible before interaction (271ms)
  ✓  13 [chromium] › smoke/contract.spec.js:91:1 › C-10 #total-outstanding text and data-value are exactly 0 (bare), Rs lives in a sibling (272ms)
  ✓  14 [chromium] › smoke/contract.spec.js:114:1 › C-11 #import-box is a textarea, #import-go a button, #shot-input a file input accepting image/* (272ms)
  ✓  15 [chromium] › smoke/contract.spec.js:141:1 › C-12 #entry-type options are exactly credit and payment (272ms)
  ✓  16 [chromium] › smoke/contract.spec.js:153:1 › C-13 #lang-switch is a select with exactly en, hi, te and defaults to en (270ms)
  ✓  17 [chromium] › smoke/contract.spec.js:175:1 › C-14 #overdue heading contains Overdue and 30+ days, with an empty-state line (264ms)
  ✓  18 [chromium] › smoke/contract.spec.js:194:1 › C-15 #customers shows a visible empty-state message and no rows (248ms)
  ✓  19 [chromium] › smoke/contract.spec.js:205:1 › C-16 empty storage renders zero data-dependent nodes (272ms)
  ✓  20 [chromium] › smoke/contract.spec.js:216:1 › C-39 first paint raises no console error, failed request, or rejection (859ms)
  ✓  21 [chromium] › smoke/routes.spec.js:28:1 › C-17 ?customer=unknown renders the not-found view and keeps every list node (288ms)
  ✓  22 [chromium] › smoke/routes.spec.js:54:1 › C-18 ?today=2026-11-15 loads cleanly with the full empty-state contract (272ms)
  ✓  23 [chromium] › smoke/routes.spec.js:66:1 › C-19 invalid ?today values load cleanly and do not crash (466ms)

  23 passed (9.0s)
```

CRITIC-RUN-1 is 23/23 PASS, reproducing RUN-3 (23/23) on the same checksums. No test was edited, skipped, or retried (`retries: 0`, `workers: 1`).

#### CRITIC-ADV-1 — my own adversarial batch (not the Tester's assertions)

Command: `node /tmp/critic-g0.js` — a standalone Playwright script that reads the DOM directly, imports no app code and no test helper, and computes its own contrast ratios. Key output:

```
§2 nodes: 19 ids each count===1, 19/19 visible (non-zero box, no dialog/[hidden]/details ancestor)
raw served HTML: 19/19 ids present before scripts; 0 external URLs; <script … defer>
#total-outstanding: text "0"; data-value "0"; Number 0; parseInt 0; first-match "0";
  normative ^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$ true; no [Rs₹,+\s]; no ".00"; trimmed;
  children 0; "Rs" only in the sibling span
data-dependent selectors: 0/0/0/0/0/0/0/0/0/0
  ([data-customer], [data-customer="9000000101"], a[data-remind], img[data-shot],
   [data-entry-id], [data-amount], [data-days], [data-overdue], [data-overdue="9000000101"],
   a[href^="upi://pay?pa="])
controls: #import-box TEXTAREA visible | #import-go BUTTON visible | #shot-input INPUT
  type=file accept=image/* visible, closest form = entry-form | #export-csv visible | #lang-switch value en
#overdue: heading contains "Overdue" + "30+ days", empty-state line, 0 [data-customer] inside
#customers: 1 child, visible empty-state text, 0 rows
#import-msg: text "" and box height 17.5px (visible line)
?customer=9000000101: 200, #cust-name "Customer not found", #cust-balance text/attr "0",
  #entries 0 children/text ""; total/import-box/import-go/shot-input/customers all still in DOM and visible
routes: /?today=2026-11-15, /?today=not-a-date, /?today=, /?customer=…&today=… → 200, 19 nodes, total "0"
console: 0 errors, 0 pageerrors, 0 failed responses; requests = /, /styles.css, /app.js only
375×812 light: innerWidth 375, documentElement.scrollWidth 375, body.scrollWidth 375, widest edge 375
375×812 dark : scrollWidth 375; color-scheme "light dark"; body bg rgb(15,13,11), ink rgb(245,240,232)
contrast     : body 17.10 | #total 15.73 | .label 6.78 | #customers-empty 6.78 | #search 15.73 |
               #import-box 15.73 | #lang-switch 15.73 | #shot-input 15.73 | #overdue h2 15.73  (all ≥4.5)
no dialog/details/[hidden] gates; 0 password inputs; document.cookie ""; localStorage keys []
```

Command: `node /tmp/critic-tap.js` (CRITIC-ADV-2): `<html lang="en">`; viewport meta `width=device-width, initial-scale=1`; `color-scheme light dark`; minimum tap height 44.0 px across all 14 interactive controls (none < 40); every input/select/textarea has a `<label for>`; `#entry-save` not disabled; `#import-go` and `#add-customer` are `type="button"`; `#entry-date` is `type="date"`; `#entry-amount` `inputmode="decimal"`; the only `overflow-x: hidden` is on the two `.visually-hidden` labels, not a layout mask.

#### Contract audit — 48/48

P0-observable items (38). Every item was checked in the DOM at first paint (`CRITIC-ADV-1`), not inferred from the tests. The 10 rows marked "documented" are contract rules whose runtime oracle belongs to P1–P4 by PLAN v1.2; their presence and exact wording were verified in `CONTRACT.md`.

| # | CONTRACT item | Result | Evidence |
|---|---|---|---|
| CA-01 | `#total-outstanding` (§1.1, §2) | PASS | 1 element, visible, text `0` |
| CA-02 | `#new-name` (§2) | PASS | 1, visible, box 45.2 px |
| CA-03 | `#new-phone` (§2) | PASS | 1, visible, box 45.2 px |
| CA-04 | `#add-customer` (§2) | PASS | 1, visible, `type=button` |
| CA-05 | `#entry-form` (§1.9, §2) | PASS | 1, visible |
| CA-06 | `#entry-type` (§1.9, §2) | PASS | 1, visible |
| CA-07 | `#entry-amount` (§1.9, §2) | PASS | 1, visible, `inputmode=decimal` |
| CA-08 | `#entry-date` (§1.9, §2) | PASS | 1, visible, `type=date` |
| CA-09 | `#entry-note` (§1.9, §2) | PASS | 1, visible |
| CA-10 | `#entry-save` (§1.9, §2) | PASS | 1, visible, not disabled |
| CA-11 | `#shot-input` (§1.5, §2) | PASS | 1, visible, `INPUT type=file accept=image/*`, inside `#entry-form` |
| CA-12 | `#import-box` (§1.4, §2) | PASS | 1, visible, `TEXTAREA`, 132 px tall |
| CA-13 | `#import-go` (§1.4, §2) | PASS | 1, visible, `BUTTON` |
| CA-14 | `#import-msg` (§1.4, §2) | PASS | 1, visible (17.5 px box), empty text, `role=status` |
| CA-15 | `#search` (§5.1, §2) | PASS | 1, visible, value `""` at load |
| CA-16 | `#export-csv` (§5.3, §2) | PASS | 1, visible, `BUTTON` |
| CA-17 | `#lang-switch` (§5.5, §2) | PASS | 1, visible, `SELECT`, values `["en","hi","te"]`, value `en` |
| CA-18 | `#overdue` (§5.2, §2) | PASS | 1, visible; heading text contains `Overdue` and `30+ days`; visible empty-state line |
| CA-19 | `#customers` + empty-state message (§2) | PASS | 1, visible, non-empty text, 0 rows |
| CA-20 | Total bare signed value, text/attr identical, no decoration (§1.1, §3.3) | PASS | `0`/`0`; normative regex true; no `Rs`/`₹`/`,`/space/`+`/`.00`; `Number`=0, `parseInt`=0 |
| CA-21 | Human `Rs` formatting only in a sibling (§1.1, §3.4) | PASS | sibling span `Rs 0`; `#total-outstanding` has 0 children and no `Rs` in `innerHTML` |
| CA-22 | Import box/button visible at load, never in modal/tab/accordion/details (§1.4) | PASS | 0 `dialog`, 0 `details`, 0 `[hidden]`; both visible |
| CA-23 | Import message visible line, empty when no message (§1.4) | PASS | `""` and non-zero height |
| CA-24 | Shot input real file input at load, on payment form (§1.5) | PASS | `INPUT type=file`, ancestor `#entry-form` |
| CA-25 | `#entry-type` values exactly `credit`/`payment` in order (§1.9) | PASS | options `["credit","payment"]` |
| CA-26 | `#lang-switch` values `en/hi/te`, default `en` (§5.5) | PASS | verified |
| CA-27 | Overdue heading + empty state (§5.2) | PASS | verified |
| CA-28 | No `data-customer` inside `#overdue` (§5.2) | PASS | 0 matches |
| CA-29 | Empty state when storage has no data (§1.2, §2, D7) | PASS | 0 `[data-customer]`, empty-state text visible |
| CA-30 | Data-dependent §1 selectors have 0 matches at empty state (P0 reading) | PASS | 10/10 selectors exactly 0 |
| CA-31 | `?customer=` not-found exact values (§1.7) | PASS | `Customer not found`; balance text/attr `0`; `#entries` 0 children, text `""` |
| CA-32 | Customer view keeps total/import/import-go/shot/customers (§1.7) | PASS | all 5 count 1 and visible on the `?customer=` route |
| CA-33 | `?today=` ISO accepted; invalid/empty fall back without crash (§1.6) | PASS | four routes 200, 19 nodes, no console error; ISO test in `app.js:30` |
| CA-34 | No console error / uncaught rejection / failed request (§6, §7, N6) | PASS | 0/0/0 on `/` and four query routes |
| CA-35 | No external network request on load (§6) | PASS | only `/`, `/styles.css`, `/app.js`; 0 foreign origins |
| CA-36 | Relative asset paths only, no absolute/localhost (§0.1, §2) | PASS | `[src],[href]` = `data:,`, `./styles.css`, `./app.js` only |
| CA-37 | No service worker, cookie, auth, password, analytics (§6) | PASS | 0 matches in `app/`; `document.cookie` empty; no controller |
| CA-38 | No node gated by modal/tab/animation/data load; all 19 in served HTML (§2) | PASS | 19/19 in raw response; 0 dialog/details/hidden |
| CA-39 | One row per normalised phone, including zero/no-entry/auto-created (§1.2, §4) | PASS (documented) | `CONTRACT.md:62–67`, `:224–229`; runtime oracle P2 (`C-05`, `I-04`–`I-07`) |
| CA-40 | `[data-balance]` text and attribute identical bare signed string (§1.2, §3.3) | PASS (documented) | `CONTRACT.md:64`, `:196–206`; runtime oracle P1 (`C-24`, `C-27`) |
| CA-41 | Reminder href exact `https://wa.me/91<phone>?text=<encoded>` + name/`Rs` content (§1.3) | PASS (documented) | `CONTRACT.md:75–78`; runtime oracle P3 (`C-07`) |
| CA-42 | Row link `a[href="?customer=<phone>"]` (§1.2) | PASS (documented) | `CONTRACT.md:66`; runtime oracle P1 (`C-37`) |
| CA-43 | Import replaces atomically, reads the textarea at click, msg/error/duplicate rules (§1.4, §4) | PASS (documented) | `CONTRACT.md:88–92`, `:218–236`; runtime P2 (`C-08`, `C-33`, `C-34`, `I-01`) |
| CA-44 | `img[data-shot]` only after a saved payment image; quota keeps the entry (§1.5) | PASS (documented) | `CONTRACT.md:104–107`; runtime P3 (`I-03`, `I-08`, `N-03`) |
| CA-45 | Entry rows: one `li[data-entry-id]`, date desc/insertion tie, `data-type`/`data-date`, identical `[data-amount]`, edit/delete, stable id (§1.8) | PASS (documented) | `CONTRACT.md:137–143`; runtime P1/P4 (`C-25`, `C-26`, `C-36`) |
| CA-46 | Forms: 10-digit and duplicate rejection, credit/payment, today default, save never disabled (§1.9) | PASS (documented) | `CONTRACT.md:163–166`; runtime P1 (`C-31`, `C-32`) |
| CA-47 | Money path: integer paise, parse/round/render rules, forbidden float APIs (§3) | PASS (documented) | `CONTRACT.md:174–216`; runtime P1/P2 (`U-05`–`U-11`) |
| CA-48 | Bonus hooks search/overdue/CSV/UPI/lang/OCR rules (§5, §8 register) | PASS (documented) | `CONTRACT.md:238–316`; runtime P4 (`C-28`–`C-30`, `C-35`, `C-36`, `C-38`) |

**CONTRACT-<n> deviations: none.** Three non-blocking coherence notes are recorded as R-1/R-2/R-3 below (DECISIONS-vs-CONTRACT phone rule, PRD N1 wording, PRD R5 credit-screenshot rule); none is a P0 selector or shape, and none blocks G0.

#### Doc sync — output

```
$ grep -o 'R-[0-9]\+' docs/PRD.md | sort -u | wc -l            → 0   (literal AGENTS.md §4 regex is vacuous)
$ grep -o 'R-[0-9]\+' docs/IMPLEMENTATION-PLAN.md | sort -u | wc -l → 0
$ grep -o 'R-[0-9]\+' docs/TRACEABILITY.md | sort -u | wc -l   → 0
$ grep -oE '\b[RNB][0-9]+' docs/PRD.md | sort -u               → 23
  B1 B2 B3 B4 B5 B6 B7 N1 N2 N3 N4 N5 N6 R1 R10 R2 R3 R4 R5 R6 R7 R8 R9
$ comm -23 /tmp/r /tmp/p   (PRD IDs missing from PLAN)         → (empty)
$ comm -23 /tmp/r /tmp/t   (PRD IDs missing from TRACEABILITY) → (empty)
$ comm -13 /tmp/r /tmp/p   (PLAN IDs not in PRD)               → (empty)
$ comm -13 /tmp/r /tmp/t   (TRACEABILITY IDs not in PRD)       → (empty)
$ grep -o '`[#\[][^`]*`' docs/CONTRACT.md | tr -d '`' | sort -u | wc -l → 29
$ while read sel; do grep -qF "$sel" docs/TEST-CASES.md || echo "UNTESTED: $sel"; done < /tmp/s
                                                               → (no output; 29/29 covered)
letter-prefixed/structural sweep (a/img/button/li)             → 9/9 OK, 0 MISS
$ grep -nE 'TBD|TODO' docs/TRACEABILITY.md                     → none
traceability rows                                              → rows=23 with_phase=23 bad=none
headers                                                        → 4/4 fields on all six docs
TODO/TBD/(Planner) in PRD/TECH-STACK/PLAN/CONTRACT             → none
angle-bracket matches `<[a-z-]+>`                              → 37, all in CONTRACT.md, 0 elsewhere (A5 approved notation)
PRD selector tokens 35 → CONTRACT                              → 0 missing
PLAN selector tokens 34 → CONTRACT                             → 0 missing
CONTRACT selector tokens 43 → TRACEABILITY claim               → all claimed (the 2 `li[…]` variants normalise to claimed `[data-*]`)
TRACEABILITY case IDs                                          → 74 cited, 74 defined, 0 undefined, 0 uncited
```

Versions this freeze: PRD 1.0, TECH-STACK 1.0, CONTRACT 1.0 (FROZEN), DECISIONS 1.1, IMPLEMENTATION-PLAN 1.2, TRACEABILITY 1.2; all `Updated: 2026-11-17`. The mixed versions are the recorded sync updates (worklog 14:45; approved as deviation 6), not drift: PRD/TECH/CONTRACT are unchanged v1.0 texts, DECISIONS v1.1 records the D1 attribution, PLAN/TRACEABILITY v1.2 record the P0 gate-suite scope and the 23-row mapping.

#### Vercel readiness — PASS

- `app/index.html` exists; deployable set is exactly `index.html`, `styles.css`, `app.js` (13,639 B). No `package.json`, lockfile, manifest, bundler config, `dist/` or `build/` inside `app/`; no build step.
- Every `src`/`href` is relative or `data:` (`./styles.css`, `./app.js`, `favicon data:,`); no leading `/`, no `http(s)://`, no `localhost`.
- No `serviceWorker`, `document.cookie`, auth gate, password input, analytics, `fetch`, or `XMLHttpRequest` in `app/`.
- `?customer=9000000101` direct load in a **fresh context** returns 200 and renders the not-found view; `/index.html` and `/` both serve 200 (C-23).
- Clean profile: 0 console errors, 0 uncaught rejections, 0 failed responses, 3 same-origin requests; no storage keys, no cookie.
- `app/vercel.json` absent, which is allowed (optional, must not be required).

#### Score-risk review — WIN-ANALYSIS §4 and WIN-PLAN §4/§11

WIN-ANALYSIS §4 (why we may lose), current P0 build:

| # | Failure mode | P0 status | Evidence |
|---|---|---|---|
| 1 | Selector missing / renamed / conditional | **PASS** | 19/19 §2 nodes in raw HTML and visible; 0 hidden/dialog/details |
| 2 | Tester reads before first paint | **PASS** | static markup; `defer` script adds only the customer view |
| 3 | `.value` set without events, app reads state | **RISK** | import is inert at P0 (`app.js:118–126`); P2 must read the DOM at click time |
| 4 | Import merges on second run | **RISK** | no import exists; neither merge nor replace is proven (P2) |
| 5 | Punctuation/commas/₹ in machine nodes | **PASS** | `0`; no forbidden character; no formatting code |
| 6 | Zero-balance/unknown-phone rows dropped | **RISK** | no row rendering at P0; rule only documented (P2) |
| 7 | Float money | **PASS (structural)** | no money path at all; 0 `toFixed`/`toLocaleString`/`Intl` in `app/`; correctness unproven until P1 |
| 8 | Screenshot quota loses the save | **RISK** | no upload path (P3) |
| 9 | `?today=` ignored → overdue days wrong | **RISK** | ISO parsing works and invalid values fall back; no date-dependent feature exists yet (P1/P4) |
| 10 | Sideways scroll / unreadable dark | **PASS at empty state, RISK with data** | 375/375 light and dark; contrasts 6.78–17.10; long unicode + sample untested (P5) |
| 11 | `[data-customer]` count ≠ customer count | **RISK** | 0 rows; no filter exists, but the oracle cannot run (P2) |
| 12 | Virtualised / paginated list | **PASS (structural)** | plain `#customers` div grid, no pagination/virtualisation code |
| 13 | No harness | **PASS** | 23-test Playwright suite in 4 files, CI-runnable, `workers: 1`, preflight |

WIN-PLAN §4 edge-case matrix — **18/18 FAIL at P0** because no data path exists (expected, by phase):

| Matrix row | P0 status | Owner |
|---|---|---|
| Customer with zero entries; overpayment → negative; two customers same name; duplicate phone; unknown-phone entry; same-date entries; future-dated entry; empty note; large numbers; unicode names; `entries: []` | **FAIL** (no rows/state) | P1/P2 |
| `"1,500"` / `"Rs 1500"`; `type` as `CREDIT`/`Credit` | **FAIL** (no parser) | P2 |
| Malformed JSON (error, previous state intact); import twice; reload after import | **FAIL** (no import/persistence) | P2/P1 |
| `?today=2026-11-15` overdue/days | **FAIL** (no overdue feature) | P4 |
| 3 MB screenshot downscaled + `img[data-shot]` | **FAIL** (no upload) | P3 |

WIN-PLAN §11 (if we lose) — current P0 build:

| # | Cause | P0 status |
|---|---|---|
| 1 | Import merging instead of replacing | **FAIL** (not implemented; unprovable either way) |
| 2 | Punctuation in `#total-outstanding` | **PASS** |
| 3 | Dropping zero-entry / unknown-phone rows | **FAIL** (no rows) |
| 4 | Contract nodes rendered by JS after a delay | **PASS** (static; 19/19 in raw HTML) |
| 5 | Float money | **PASS (structural)**; unproven until P1 |
| 6 | Screenshot upload fails on quota | **FAIL** (no upload) |
| 7 | Sideways scroll at 375 from a table/long name | **PASS at empty state** (no table; `overflow-wrap:anywhere`); unproven with data |
| 8 | No harness | **PASS** (23 tests) |

#### G0 checklist — reproduced in full and signed

Rule applied: PASS only if every box is ticked with evidence. `[x]` = evidence cited. Mechanical part was re-run by me on the freeze candidate, not copied from the worklog.

**A. Mechanical completeness — 9/9**

- [x] **A1** Six living docs exist — `ls docs`: `PRD.md`, `TECH-STACK.md`, `IMPLEMENTATION-PLAN.md`, `CONTRACT.md`, `DECISIONS.md`, `TRACEABILITY.md`.
- [x] **A2** Each has `Version`, `Updated`, `Owner`, `Supersedes` — 4/4 fields on all six (scripted header check).
- [x] **A3** PRD has no `TODO`/`TBD`/`(Planner)`; every R/B/N has acceptance text — 0 markers; 23/23 blocks (`R1–R10`, `B1–B7`, `N1–N6`). Note: `N1–N6` carry Given/Then acceptance bullets without a bold `**Acceptance**` label; the text is present, so A3's wording is met, but the label is inconsistent with R/B blocks.
- [x] **A4** PLAN has P0–P6 blocks with goal, R-IDs, selectors, acceptance, gate suite, risks, rollback — 7/7 required labels in each of P0–P6 (plus `Files allowed`; 8 labels/phase).
- [x] **A5** CONTRACT has no placeholder text and no empty section — 0 `TODO`/`TBD`; 37 `<[a-z-]+>` matches, all in CONTRACT and all §0-approved metavariables or HTML example tags (human-approved exception, worklog 13:40); `## 1` and `## 3` are container headings with subsections (not empty).
- [x] **A6** DECISIONS: every row has rationale, impact, status — 12/12 rows complete across 6 columns; 12 accepted, 0 proposed.
- [x] **A7** TRACEABILITY: every R/B/N row has a phase — 23/23, 0 bad.
- [x] **A8** Sync check: zero missing R-IDs, zero untested selectors — literal `R-` regex returns 0/0/0 (vacuous, approved correction), corrected `\b[RNB][0-9]+` gives 23 IDs with 0 missing in PLAN and TRACEABILITY; 29/29 contract tokens and 9/9 letter-prefixed selectors tested.
- [x] **A9** No doc references a removed requirement ID — all IDs in `docs/{PRD,TECH-STACK,IMPLEMENTATION-PLAN,CONTRACT,DECISIONS,TRACEABILITY,TEST-CASES}.md` are within the canonical 23; 0 references to `R11+`/`B8+`/`N7+`. (`B8–B11` appear only as G0-CHECKLIST item IDs, not requirement IDs.)

**B. Contract completeness — 11/11**

- [x] **B1** Every `PROJECT.md` "How we check" row appears verbatim — 6/6 rows quoted in `CONTRACT.md` §0.1; 10/10 selector/URL strings present.
- [x] **B2** `#total-outstanding` rule states bare digits and the signed-net formula — §1.1 + §3.1/§3.3. Human-approved D4 amendment recorded: whole rupees render as integers, fractional values with exactly two decimals; no symbols/commas/spaces. The checklist's "bare integer" wording is superseded by D4, not ignored.
- [x] **B3** One-row-per-customer covers zero balance, duplicate phone, unknown phone, customer page — §1.2, §1.7, §4 dedupe rules, §8.
- [x] **B4** `[data-balance]` states attribute **and** text, signed, bare — §1.2 + §3.3 (same D4 amendment as B2).
- [x] **B5** `a[data-remind]` states exact `https://wa.me/91<phone>?text=` and required content — §1.3, including unicode/zero/negative.
- [x] **B6** `#import-box`/`#import-go` state replace (never merge), visible, always rendered, error behaviour — §1.4, §4.4, §6.
- [x] **B7** `#shot-input`/`img[data-shot]` state always-rendered input and post-save image — §1.5 (plus quota fallback, no image on image-less entries).
- [x] **B8** `?today=` and `?customer=` semantics explicit — §1.6 and §1.7.
- [x] **B9** Bonus hooks listed — §5.1–§5.6 (search, overdue, CSV, UPI, language, OCR) and §8 register.
- [x] **B10** Forbidden list and grader worst-case assumptions present — §6 and §7.
- [x] **B11** A Coder could implement P0 from CONTRACT alone — §0 notation + §1 static shapes + §2 exhaustive always-rendered list + §1.7 not-found values; the delivered P0 matches that reading.

**C. Coherence — 6/6**

- [x] **C1** Every selector named in PRD/PLAN exists in CONTRACT; every CONTRACT node is claimed by a requirement — PRD 35/35 and PLAN 34/34 selector tokens resolve in CONTRACT (normalised); 43/43 CONTRACT tokens claimed by TRACEABILITY/R-IDs (`li[data-entry-id]` and `li[data-overdue="<phone>"]` are structural variants of claimed `[data-*]` attributes).
- [x] **C2** TECH-STACK has no undecided item; every decision has status and rejected alternative — 13/13 rows complete; all accepted (S5 shows `accepted — amended by D4`); 0 undecided.
- [x] **C3** PLAN phases reference only existing IDs; no phase has zero requirements or no gate suite — P0–P6 each name R/B/N IDs from the canonical set and a named E2E gate suite.
- [x] **C4** PLAN file scopes, phases and gate order match `AGENTS.md` §3 — role scopes match §2; sequential P0–P6; E2E gate-only; contract-change escalation matches §5/§7.
- [x] **C5** DECISIONS covers every ambiguity the PRD flags; human-gate items identifiable — D1–D10 human-accepted; D11/D12 recorded as implementation defaults, explicitly vetoable at G0; 0 `proposed`.
- [x] **C6** Doc versions/updates mutually consistent for this freeze — PRD 1.0, TECH-STACK 1.0, CONTRACT 1.0, DECISIONS 1.1, PLAN 1.2, TRACEABILITY 1.2, all 2026-11-17; mixed versions match the recorded sync updates (worklog 14:45; approved deviation 6).

**D. Testability — 6/6**

- [x] **D1** Every R/B has at least one acceptance criterion observable via a selector or measurement — R1–R10/B1–B7/N1–N6 map to selectors or `scrollWidth`/contrast/console/network measurements (TRACEABILITY + TEST-CASES).
- [x] **D2** No acceptance criterion depends on taste — every scored outcome names a selector, a number, a boolean or a screenshot label; no "looks good".
- [x] **D3** Each phase has a named E2E gate suite and E2E is marked gate-only — PLAN phase table + each phase's `E2E gate suite (gate-only)` line; P0 suite `C-01–C-03`, `C-09–C-23`, `C-39`, `E2E-P0-01–03` (plus `N-05` in the suite).
- [x] **D4** Hidden-data cases are listed per requirement that can be fed arbitrary data — `PRD.md` R3, R8, R6 have explicit hidden-data lists; R1/R2/R4/R5/R7/R9 also do.
- [x] **D5** Bonus items have a stated likely check (script or screenshot) — B1–B7 each has `Likely check` + `Visible label`.
- [x] **D6** TRACEABILITY is consistent with TEST-CASES for assigned IDs — 74/74 case IDs cited in TRACEABILITY are defined in TEST-CASES; 0 undefined, 0 uncited; 0 `TBD` cells.

**E. Runtime proof — 6/6 (RUN-3 + CRITIC-RUN-1 + CRITIC-ADV-1/2)**

- [x] **E1** `app/` serves locally and every contract selector resolves at first paint with empty state — 19/19 §2 nodes resolve and are visible; the ten data-dependent §1 selectors are correctly 0 at empty state; customer-view selectors resolve on `?customer=`. CRITIC-RUN-1 23/23; CRITIC-ADV-1.
- [x] **E2** `#total-outstanding` reads `0` on empty state — text `0`, `data-value` `0`, `Number`/`parseInt` 0, normative regex true.
- [x] **E3** `#import-box`, `#import-go`, `#shot-input` visible (not behind a modal/tab/`<details>`) — visible with non-zero boxes; 0 `dialog`/`details`/`[hidden]`; `#shot-input` inside `#entry-form`.
- [x] **E4** No console errors on load — 0 console errors, 0 pageerrors, 0 failed requests on `/` and four query routes.
- [x] **E5** Vercel shape: `app/index.html`, relative paths, no build step, no auth, no service worker — verified statically and by direct `?customer=` load in a fresh context.
- [x] **E6** `C-01…C-12` (or the project's contract cases) pass — 23/23 CRITIC-RUN-1. The P0 suite is the PLAN v1.2 suite: `C-01–C-03`, `C-09–C-23`, `C-39`, `N-05`, `E2E-P0-01–03`; `C-04–C-08` are data-dependent P2/P3 oracles and are correctly not P0 (human-approved deviation 5).

**F. Human decisions — 3/3**

- [x] **F1** Every DECISIONS item needed by P1–P3 is `accepted` — D1–D10 accepted by the human; D11/D12 accepted implementation defaults, vetoable at G0.
- [x] **F2** Any accepted deviation is recorded with its impact — worklog 13:40 (A5 notation exception, D4/D9 revisions), 14:05 note (A8 regex, B2/B4 superseded by D4, D1 interpretation, D11/D12 veto), 14:45 (sync + D1 attribution); DECISIONS §3 change log carries each revision.
- [x] **F3** Judges'-note skeleton drafted (not submitted) — `IMPLEMENTATION-PLAN.md` §3, `Live link: pending deployment`.

#### Sign-off block

```
Gate: G0 | Date: 2026-11-17
Mechanical (A): 9/9 — output pasted
Contract (B): 11/11
Coherence (C): 6/6
Testability (D): 6/6
Runtime (E): 6/6 — RUN-3, CRITIC-RUN-1
Human (F): 3/3
Total: 41/41
Verdict: PASS
Failures: none
```

Verified by: **Critic** (this entry) · To be recorded by: **Orchestrator** (`docs/worklog.md`) · Decisions accepted by: **Human**.

#### Human veto items at G0 (recorded, no gate impact if vetoed)

1. **D1 sub-rules** — "positive balance only" and "customers with no payment are never listed". The 30+ day threshold was human-accepted; these two sub-rules are the Planner's interpretation (`DECISIONS.md` D1, v1.1). Vetoing either changes the P4 overdue oracle (`C-28`, `C-14`), not P0.
2. **D11** — malformed-entry defaults (missing/unknown `type` → `credit` + warning; magnitude-only negative amounts; unattributable entry skipped; blank date → today; unparseable date sorts oldest; missing note → empty). Vetoable at G0; affects P2 import expectations (`U-13`, `I-10`).
3. **D12** — UPI payee default `hisaab@upi` when the import supplies no VPA; `am=0` for zero/negative. Vetoable at G0; affects the P4 UPI oracle (`C-35`).

#### Remaining risks (non-blocking at G0; ordered)

- **R-1 (DOC, P2):** `DECISIONS.md` D9 says phone normalisation also strips "a leading `0` on 11 digits"; `CONTRACT.md` §4 does not include that clause (it drops a leading `+`, strips non-digits, and drops a `91` prefix only on 12 digits). CONTRACT is the frozen machine interface, so the Coder will follow §4. Close before P2 by amending D9 to match §4 (no CONTRACT change, so no post-G0 contract gate) or escalate to the human if the 11-digit rule is wanted.
- **R-2 (DOC, P1 sync):** `PRD.md` N1 says "every selector in `CONTRACT.md` §1–§5 resolves before any interaction". Read literally that cannot hold with empty storage (data-dependent §1 selectors must be absent under D7), and it conflicts with `CONTRACT.md` §2's exhaustive 19-node list and E2E-P0-01. The P0 reading used here is the coherent one (19 §2 nodes; zero data selectors; customer view on `?customer=`). Tighten the N1 wording at the P1 doc sync.
- **R-3 (DOC, P3):** `PRD.md` R5 requires "no screenshot on a credit entry"; `CONTRACT.md` §1.5 does not restate that rule. PLAN P3 acceptance does (`a credit entry shows no screenshot`), so implementation is defined, but the contract's behavioural completeness has a gap. Add a P3 acceptance note without changing a selector; if a CONTRACT edit is proposed, it is a human gate.
- **R-4 (testability, P1+):** `TEST-CASES.md` v0.4 defines no case rows for `E2E-P1`…`E2E-P6`; PLAN names them. They must exist before their phase gates, and each phase gate must cite them.
- **R-5 (score, P5):** the 375 px mark is proven only at empty state; the sample + 100-character unicode note oracle (`N-01`, `N-04`) is unrun and unearned.
- **R-6 (process):** the P0 build is untracked (`app/` absent from git HEAD `bdbe01b`, no gate tag). Checksums pin it for now, but there is no reproducible commit. Commit/tag the P1 build at its gate; do not rewrite the P0 evidence.
- **R-7 (score, final):** the hidden-data and bonus blocks (90 marks) are entirely unproven; the provisional 5/100 must not be read as a trajectory. P2 is the 60-mark surface and the next real test of this build.

#### Confidence / unknown about the real tester

- If it reads `?customer=` before scripts run, the JS-inserted customer view is invisible; `goto` waits for `load` in all our runs, but the real tester's wait policy is unknown. Mitigation at P1: render the customer-view shell statically and fill it from state.
- D4's fractional rendering (`670.50`) is the most consequential accepted choice: a grader expecting rupee rounding or integer-only strings would differ on fractional shops. The sample is whole-rupee, so the sample cannot reveal this.
- D1's no-payment exclusion is the second: a grader that counts from the first credit or lists no-payment customers would disagree on the overdue bonus.
- Storage-clearing and upload mechanics are unknown; P1/P3 must prove persistence and `setInputFiles` behaviour under a quota throw.

### GATE G1 | 2026-11-17 | phase P1

Build: uncommitted working tree at `/Users/akanse/Documents/FWAIProjects/batch10/hisaasb`, served by a local `python3 -m http.server 4173 --directory app`; SHA-256 `app/index.html 669c644fb999…` (6,108 B), `app/styles.css 24239b30acdd…` (7,229 B), `app/app.js c9bf08e289d8…` (25,694 B) — identical to the Tester's RUN-4 handoff checksums. Git HEAD `ce69d69` ("chore: pre-P1 doc and test sync") predates the P1 app changes, so the P1 build is untracked and untagged; only the checksums pin it (see F-4).
Runs cited: RUN-4 (Tester), CRITIC-RUN-2 (my independent re-run of the Tester suite), CRITIC-ADV-3/4 (my own adversarial batches, `/tmp/critic-g1*.js`, importing no app code and no test helper)
Hidden-data: 0/60 | Bonus: 0/30 (B1 0, B2 0, B3 0, B4 0, B5 0, B6 0, B7 0) | Phone/theme: 10/10 (provisional — both halves demonstrated with data; P5 re-audits the sample, 200 rows and thumbnails)
MODEL SCORE: 10/100 (provisional; G0 recorded 5/100, so the gate's "not lower than the previous gate" condition is met. G1 does not require the final ≥95)
Deductions:
- Ded-1 Hidden-data block not reachable on the graded path — **60** — import is P2 and `#import-go` is still an inert `preventDefault` (`app.js:849–854`); no imported shop can be read back, so the 60-mark surface is 0 by construction. Not a P1 defect: `IMPLEMENTATION-PLAN.md` P2 owns it.
- Ded-2 Bonus block not implemented — **30** — `#overdue` has no rows, no `[data-days]`, no `a[href^="upi://pay?pa="]`, no `button[data-edit-entry]`/`button[data-delete-entry]` in entry rows, `#search`/`#export-csv`/`#lang-switch` do not act, no OCR. Owner phase P4.
- Phone/theme 10/10 is earned provisionally: 375 px with real data and dark mode with real data both measured (CRITIC-ADV-3 F, CRITIC-ADV-4 dark). See the P5 caveat in Score risks.
Contract audit: **32/32 P1-observable items pass**, 0 `CONTRACT-<n>` deviations; the P2/P3/P4-owned items are listed as deferred by plan and are not counted as P1 failures.
Doc sync: **PASS** — literal `R-` vacuous (0/0/0), corrected `\b[RNB][0-9]+` 23/23/23 with 0 missing and 0 extra, 29/29 contract selector tokens tested, 0 `TBD`, 23/23 traceability rows phased, E2E-P1-01…08 defined and cited, 71/71 traceability case IDs defined, 82 case rows, headers 4/4, versions PRD 1.1 / TECH-STACK 1.0 / CONTRACT 1.0 FROZEN / DECISIONS 1.3 / PLAN 1.4 / TRACEABILITY 1.4.
Vercel readiness: **PASS** — `app/` is exactly `index.html` + `styles.css` + `app.js` (39,031 B); every `src`/`href` is relative, `data:`, or the row/reminder links; no absolute or `localhost` asset path; no build file, service worker, cookie, auth, password input, `fetch`, or `XMLHttpRequest`; `?customer=` direct load returns 200 and renders correctly; only same-origin requests; 0 console errors in a fresh context.
Score risks: WIN-ANALYSIS §4 (13 rows) → PASS 8, RISK 5, all RISKs owned by P2/P3/P4. WIN-PLAN §4 (18 rows) → PASS 7, DEFERRED 11 (P2/P3/P4). WIN-PLAN §11 (8 rows) → PASS 6, RISK 2 (import replace, screenshot quota — both later phases).
Verdict: **PASS** (P1 data core)
Required before re-gate: see "Required before P2" below.
Confidence / unknown about the real tester: (1) the 60 marks now depend entirely on P2 import — nothing in P1 predicts replace semantics, dedupe, or DOM-read-at-click behaviour; (2) a grader that counts `[data-balance]` globally sees customers + 1 because `#cust-balance` is contract-mandated to carry `data-balance` (§1.7) while rows carry it per §1.2 — the biggest P1-introduced contract risk (F-1); (3) rows/entries are rendered by the deferred script, so a reader that queries before `load` sees none, while `goto`-style waiters are fine; (4) D4's fractional rendering (`2410.50`) is invisible in the whole-rupee sample and remains the riskiest accepted money choice.

#### CRITIC-RUN-2 — independent re-execution of the Tester suite

Command: `cd tests && npx playwright test` (1 worker, retries 0, `http://localhost:4173`, Chromium via `@playwright/test` 1.65.1, 1280×800 default, 375×812 where the case sets it).

```
$ cd tests && npx playwright test
Running 31 tests using 1 worker

  ✓   1 [chromium] › e2e/p0-gate.spec.js:59:1 › C-23 Vercel shape: app/index.html, relative assets, no build step, no service worker (258ms)
  ✓   2 [chromium] › e2e/p0-gate.spec.js:95:1 › N-05 no service worker, cookie gate, password field, analytics, or third-party origin (276ms)
  ✓   3 [chromium] › e2e/p0-gate.spec.js:121:1 › E2E-P0-01 first paint: 19 §2 nodes resolve, data selectors are empty, customer view resolves (505ms)
  ✓   4 [chromium] › e2e/p0-gate.spec.js:148:1 › E2E-P0-02 all query-string routes render the same first paint (1.1s)
  ✓   5 [chromium] › e2e/p0-gate.spec.js:176:1 › E2E-P0-03 phone + theme baseline and offline-safe load (437ms)
  ✓   6 [chromium] › e2e/p1.spec.js:66:1 › E2E-P1-01 add customers and four entries: exact paise balances, total, amounts, rejections (594ms)
  ✓   7 [chromium] › e2e/p1.spec.js:161:1 › E2E-P1-02 reload keeps everything; a storage failure keeps the save in memory with a visible warning (532ms)
  ✓   8 [chromium] › e2e/p1.spec.js:211:1 › E2E-P1-03 row link and direct ?customer= both open the same correct view (586ms)
  ✓   9 [chromium] › e2e/p1.spec.js:249:1 › E2E-P1-04 ?today=2026-11-15 sets the default entry date and the saved data-date (378ms)
  ✓  10 [chromium] › e2e/p1.spec.js:270:1 › E2E-P1-05 375x812 with long unicode name, long unicode note, and a fractional amount (351ms)
  ✓  11 [chromium] › e2e/p1.spec.js:325:1 › E2E-P1-06 money parsing and rendering through the entry form (D4, N4) (600ms)
  ✓  12 [chromium] › e2e/p1.spec.js:384:1 › E2E-P1-07 entries with equal dates keep the newest-saved first (R4, U-04) (446ms)
  ✓  13 [chromium] › e2e/p1.spec.js:413:1 › E2E-P1-08 a later successful save clears the storage warning and persists (558ms)
  ✓  14 [chromium] › nonfunctional/p0.spec.js:10:3 › 375x812 viewport › C-20 document scrollWidth is 375 or less at empty state (232ms)
  ✓  15 [chromium] › nonfunctional/p0.spec.js:30:3 › prefers-color-scheme: dark › C-21 dark baseline keeps key nodes visible and text at >= 4.5:1 (256ms)
  ✓  16 [chromium] › nonfunctional/p0.spec.js:63:1 › C-22 no external network request on load (same-origin or data: only) (598ms)
  ✓  17 [chromium] › smoke/contract.spec.js:45:1 › C-01 #total-outstanding resolves on load with text 0 (256ms)
  ✓  18 [chromium] › smoke/contract.spec.js:54:1 › C-02 #import-box and #import-go are visible at first paint (272ms)
  ✓  19 [chromium] › smoke/contract.spec.js:61:1 › C-03 #shot-input exists inside the payment form at first paint (257ms)
  ✓  20 [chromium] › smoke/contract.spec.js:68:1 › C-09 every CONTRACT §2 node resolves and is visible before interaction (267ms)
  ✓  21 [chromium] › smoke/contract.spec.js:91:1 › C-10 #total-outstanding text and data-value are exactly 0 (bare), Rs lives in a sibling (275ms)
  ✓  22 [chromium] › smoke/contract.spec.js:114:1 › C-11 #import-box is a textarea, #import-go a button, #shot-input a file input accepting image/* (273ms)
  ✓  23 [chromium] › smoke/contract.spec.js:141:1 › C-12 #entry-type options are exactly credit and payment (272ms)
  ✓  24 [chromium] › smoke/contract.spec.js:153:1 › C-13 #lang-switch is a select with exactly en, hi, te and defaults to en (291ms)
  ✓  25 [chromium] › smoke/contract.spec.js:175:1 › C-14 #overdue heading contains Overdue and 30+ days, with an empty-state line (254ms)
  ✓  26 [chromium] › smoke/contract.spec.js:194:1 › C-15 #customers shows a visible empty-state message and no rows (256ms)
  ✓  27 [chromium] › smoke/contract.spec.js:205:1 › C-16 empty storage renders zero data-dependent nodes (273ms)
  ✓  28 [chromium] › smoke/contract.spec.js:216:1 › C-39 first paint raises no console error, failed request, or rejection (845ms)
  ✓  29 [chromium] › smoke/routes.spec.js:28:1 › C-17 ?customer=unknown renders the not-found view and keeps every list node (288ms)
  ✓  30 [chromium] › smoke/routes.spec.js:54:1 › C-18 ?today=2026-11-15 loads cleanly with the full empty-state contract (271ms)
  ✓  31 [chromium] › smoke/routes.spec.js:66:1 › C-19 invalid ?today values load cleanly and do not crash (470ms)

  31 passed (13.0s)
```

CRITIC-RUN-2 is 31/31 PASS — 23 P0 regression + 8 P1, exactly reproducing RUN-4 on the same checksums. `npx playwright test --list` → `Total: 31 tests in 5 files`; every test title maps to a defined `TEST-CASES.md` row (0 undefined). No test was edited, skipped, or retried.

#### CRITIC-ADV-3 — my own adversarial batch (not the Tester's assertions)

Commands: `node /tmp/critic-g1.js`, `/tmp/critic-g1b.js`, `/tmp/critic-g1c.js`, `/tmp/critic-g1d.js`, `/tmp/critic-g1e.js`, `/tmp/critic-g1f.js`. Standalone Playwright scripts; they read the DOM directly and compute their own expectations (integer paise: `150000 + 42000 − 18000 + 67050 = 241050`). Key output:

```
A add customers: msg "Customer added." x2; rows 2; short phone "90000001" →
  "Enter a phone number with exactly 10 digits.", rows still 2; duplicate "9000000101" →
  "A customer with this phone already exists.", rows still 2; message visible; global [data-balance] = 3
B entries (?customer=9000000101): credit 1500 / credit 420 / payment 180 / credit 670.50 →
  row [data-balance] text "2410.50", attribute "2410.50"
  #total-outstanding text "2410.50", data-value "2410.50"; human sibling "Rs 2,410.50"
  [data-amount] text = attribute = {670.50, 180, 420, 1500}; dates 12,10,05,01 (newest first)
  all six machine strings match ^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$; 0 contain Rs/₹/,/space/+/.00
  second customer row balance "0"; global [data-balance] = 3 (2 rows + #cust-balance)
C reload: 2 rows, Ravi "2410.50", Sunita "0", total "2410.50", same 4 entries, same order
C storage: Storage.prototype.setItem forced to throw → save accepted (#entry-msg "Credit saved."),
  #storage-msg visible "Could not save to browser storage. Your changes are kept in this tab only.",
  total "2420.50", Ravi "2420.50", 5 entries, no crash; reload (memory gone, expected) → 2410.50 / 4 entries
D row link a[href="?customer=9000000101"] → URL ?customer=9000000101, #cust-name "Ravi Kumar",
  #cust-balance text/attr "2410.50", 4 entries, #total-outstanding/#import-box/#import-go/#shot-input
  each count 1, both customer rows still in DOM. Direct load → identical.
D unknown ?customer=9999999999 → "Customer not found", balance text/attr "0", 0 entries
E /?today=2026-11-15&customer=… → #entry-date "2026-11-15"; saved li data-date "2026-11-15"
G reminder hrefs → ^https://wa\.me/91<phone>\?text=<encoded>$ exactly, phone matches the row,
  no extra parameter, decoded message contains the full name and "Rs <rendered balance>":
  "Namaste Ravi Kumar, your balance is Rs 2415.50."; zero balance "… Rs 0."; negative "… Rs -250.25."
  names "Ravi & Sons + 50%", "రవి కుమార్", "रवि कुमार" all encode/decode byte-identically
F 375×812, 120-char Telugu name, 100+ char unicode note, 250000.50 and 670.50 →
  innerWidth 375, documentElement.scrollWidth 375, body.scrollWidth 375, widest element right edge 342;
  every #total-outstanding/[data-balance]/[data-amount] has scrollWidth === clientWidth (no clipping)
H audit at /: 19/19 §2 ids count 1 and visible; 0 dialog/[hidden]/details:not([open]) ancestors;
  rows: 1 [data-customer] each, text=attr balance, 0 nested rows, openHref "?customer=<phone>", 1 remind, 0 upi;
  #cust-name "Select a customer", #cust-balance "0"; 0 password fields, document.cookie "", no SW controller,
  0 [data-customer] inside #overdue
H net/console: 0 console errors, 0 page errors, 0 failed requests, 0 external requests across every route
Vercel: app/ = [app.js, index.html, styles.css]; assets [data:, ./styles.css, ./, ./app.js]; 0 absolute;
  no serviceWorker, document.cookie, fetch, XMLHttpRequest, toFixed, toLocaleString/Intl.NumberFormat;
  0 overflow-x rules; no http(s) URL except the wa.me reminder hrefs
```

CRITIC-ADV-4 (supplementary, same scripts):

```
invalid ?today → #entry-date = 2026-11-18 (local date); empty ?today → same; never a garbage string
overpayment: payment 250.25 → [data-balance] text/attr "-250.25", #cust-balance "-250.25",
  #total-outstanding "-250.25"/data-value "-250.25", siblings "Advance Rs 250.25" (machine stays signed bare)
blank note → note span text "" (never "undefined"/"null"/"NaN"); date span 2026-11-18
storage fully disabled (getItem + setItem throw): first paint warning visible, total "0";
  add customer + entry in-page → 1 row, total "10", #cust-balance "10", 1 entry, warning still visible,
  0 console errors, screen never blank
dark 375×812 with data (Telugu name, 670.50): color-scheme "light dark"; scrollWidth 375;
  contrasts row name 14.40, row balance 14.40, #cust-balance 15.73, #total-outstanding 15.73,
  #overdue empty line 6.78, #cust-balance-human 6.78 — all ≥ 4.5:1, no invisible text
forms: #entry-save disabled=false; #entry-date type=date; #entry-amount inputmode=decimal;
  #shot-input type=file accept="image/*" inside #entry-form; #entry-type options [credit,payment];
  #import-box TEXTAREA; #import-go BUTTON; 11/11 inputs have a label[for]; min tap height 44 px
```

#### Contract audit — P1 scope

32 P1-observable items, all checked in the DOM (CRITIC-ADV-3/4 and CRITIC-RUN-2), not inferred from the Tester's assertions.

| # | CONTRACT item | Result | Evidence |
|---|---|---|---|
| CA-P1-01 | `#total-outstanding` resolves, visible, bare signed text, `data-value` identical (§1.1, §3.3) | PASS | `2410.50`/`2410.50`; `0`/`0` at empty; 0 children; regex true |
| CA-P1-02 | Total = signed net sum of balances, recomputed on render; negative total allowed (§3.1, D2) | PASS | `2410.50`; `-250.25` after a 250.25 payment |
| CA-P1-03 | Human `Rs`/`Advance Rs` formatting only in the sibling (§3.4) | PASS | `Rs 2,410.50`, `Advance Rs 250.25`; machine nodes undecorated |
| CA-P1-04 | Integer-paise money path; exact sums; no `toFixed`/`toLocaleString`/`Intl.NumberFormat` (§3.1, §3.5) | PASS | independent sum 241050 paise; no forbidden API in `app/app.js` |
| CA-P1-05 | Exactly one `[data-customer="<phone>"]` per customer, keyed by phone (§1.2) | PASS | 2 customers → 2 rows, 1 each |
| CA-P1-06 | Row for a zero-balance / no-entry customer (§1.2) | PASS | Sunita row exists with `[data-balance]` `0` |
| CA-P1-07 | `[data-balance]` is a row descendant; text = attribute = bare signed string (§1.2, §3.3) | PASS | `2410.50`/`2410.50`, `0`/`0`, `-250.25`/`-250.25` |
| CA-P1-08 | Each row contains `a[href="?customer=<phone>"]` exactly (§1.2) | PASS | `?customer=9000000101`, `?customer=9000000102` |
| CA-P1-09 | Exactly one `a[data-remind="<phone>"]` per row (§1.3) | PASS | count 1 in every row |
| CA-P1-10 | Reminder href exactly `https://wa.me/91<phone>?text=<encodeURIComponent(message)>`, no other parameter (§1.3) | PASS | full-string match on 6 rows; phone matches the row; no extra param |
| CA-P1-11 | Decoded message contains the full name and `Rs <rendered balance>`; zero/negative and unicode/`&` names work (§1.3) | PASS | `Rs 2415.50`, `Rs 0`, `Rs -250.25`; `Ravi & Sons + 50%`, Telugu, Devanagari round-trip |
| CA-P1-12 | `#cust-name` is the full name on `?customer=` (§1.7) | PASS | `Ravi Kumar` |
| CA-P1-13 | `#cust-balance` text and `data-balance` are the bare balance (§1.7) | PASS | `2410.50`/`2410.50`; `-250.25`/`-250.25` |
| CA-P1-14 | `#entries` lists only that customer's entries (§1.7) | PASS | 4 entries for 9000000101, 0 for the other customer |
| CA-P1-15 | Entries newest first: date descending, equal dates newest insertion first (§1.8) | PASS | 12,10,05,01; E2E-P1-07 same-date order 50,300,200,100 |
| CA-P1-16 | `li[data-entry-id]` carries `data-type` and ISO `data-date` (§1.8) | PASS | `credit`/`payment`, `2026-10-12` etc. |
| CA-P1-17 | `[data-amount]` text = attribute = unsigned bare magnitude (§1.8) | PASS | 670.50, 180, 420, 1500 |
| CA-P1-18 | Note renders as text or blank, never `undefined`/`null`/`NaN` (§1.8) | PASS | blank note → empty span |
| CA-P1-19 | Customer view keeps `#total-outstanding`, `#import-box`, `#import-go`, `#shot-input`, rows in the DOM (§1.7) | PASS | all count 1 with rows present on both routes |
| CA-P1-20 | Unknown `?customer=` → `Customer not found`, `#cust-balance` `0`, empty `#entries`, no crash (§1.7) | PASS | exact values; 0 entries |
| CA-P1-21 | `?today=YYYY-MM-DD` sets the default entry date and the saved `data-date`; invalid/empty → local date (§1.6) | PASS | `2026-11-15` saved as `2026-11-15`; `not-a-date` and empty → `2026-11-18` (local) |
| CA-P1-22 | Add-customer: exactly 10 digits accepted; short phone and duplicate rejected with a visible message and no row (§1.9) | PASS | 2 rows before and after both rejections; messages visible |
| CA-P1-23 | `#entry-type` values exactly `credit`/`payment`; `#entry-date` native date; `#entry-save` never disabled (§1.9) | PASS | options [credit,payment]; `type=date`; `disabled=false` |
| CA-P1-24 | `#shot-input` real file input inside `#entry-form`, present through credit saves (§1.5) | PASS | `INPUT type=file accept=image/*`, in `#entry-form`, survives |
| CA-P1-25 | Empty-state contract at first paint (regression) — 19 §2 nodes, total `0`, 0 data selectors (§2, §1.2, D7) | PASS | C-01/C-09/C-15/C-16 green in CRITIC-RUN-2 |
| CA-P1-26 | No `data-customer` inside `#overdue` (§5.2) | PASS | 0 matches |
| CA-P1-27 | No node gated by modal/tab/`<details>`/animation/data load; §2 nodes visible (§2) | PASS | 19/19 visible; 0 dialog/hidden/closed details |
| CA-P1-28 | No console error, uncaught rejection, failed request; no external request on P1 routes (§6, N6, R10) | PASS | 0/0/0; only same-origin `/`, `/styles.css`, `/app.js` |
| CA-P1-29 | No service worker, cookie, auth, password field, analytics (§6, N5) | PASS | 0 matches; `document.cookie` `""`; no SW controller |
| CA-P1-30 | Relative assets only; no build step; `?customer=` direct load (§0.1, §2) | PASS | 3 files; assets `data:,`/`./styles.css`/`./`/`./app.js`; direct load 200 |
| CA-P1-31 | Storage write failure keeps the save in memory, shows a visible warning, loses nothing, never blanks (§N5) | PASS | total `2420.50`, 5 entries, `#storage-msg` visible, 0 console errors; next success persists (E2E-P1-08) |
| CA-P1-32 | Storage unavailable at load keeps the app usable in memory with a warning (§N5) | PASS | warning visible at first paint; add + entry in-page → row, total `10`, 1 entry, no blank screen |

**`CONTRACT-<n>` deviations at P1: none.** Deferred by plan and therefore not P1 failures:

- **P2 / R8:** import behaviour (`#import-box` read at click, atomic replace, dedupe, unknown-phone rows, warnings, malformed JSON). `#import-go` is inert today.
- **P3 / R5, R6:** `img[data-shot]`, screenshot upload/downscale, image quota fallback; formal `C-07`, `I-03`, `I-08`, `N-03` (reminder hrefs are already conformant — CRITIC-ADV-3 G — but P3 must re-verify after any refinement and must not regress them).
- **P4 / B1–B7:** `#overdue` rows + `[data-days]`, `button[data-edit-entry]`/`button[data-delete-entry]` inside entry rows (CONTRACT §1.8 bullets owned by B2), `#export-csv`, `#search` filtering, `a[href^="upi://pay?pa="]`, `#lang-switch` translation, OCR.
- **P5 / P6:** sample-imported and 200-row/thumbnail responsive audit, 200-shop fuzz.

#### Doc sync — output

```
$ grep -o 'R-[0-9]\+' docs/{PRD,IMPLEMENTATION-PLAN,TRACEABILITY}.md | sort -u | wc -l
  PRD 0 | PLAN 0 | TRACEABILITY 0                 (literal AGENTS.md §4 regex is vacuous, as recorded at G0)
$ grep -oE '\b[RNB][0-9]+' docs/PRD.md            → 23   (B1–B7, N1–N6, R1–R10)
$ comm -23 /tmp/r /tmp/p   (PRD missing from PLAN)  → (empty)   0
$ comm -23 /tmp/r /tmp/t   (PRD missing from TRACE) → (empty)   0
$ comm -13 /tmp/r /tmp/p ; comm -13 /tmp/r /tmp/t   → (empty)   0 extra
$ grep -o '`[#\[][^`]*`' docs/CONTRACT.md | tr -d '`' | sort -u | wc -l → 29
$ while read sel; do grep -qF "$sel" docs/TEST-CASES.md || echo "UNTESTED: $sel"; done < /tmp/s
                                                     → (no output; 29/29 covered)
$ grep -nE 'TBD|TODO|\(Planner\)' docs/{PRD,TECH-STACK,IMPLEMENTATION-PLAN,CONTRACT,DECISIONS,TRACEABILITY}.md
                                                     → none
traceability rows                                    → rows=23 with_phase=23 bad=none
E2E-P1-01…08                                         → 8/8 defined in TEST-CASES.md v0.6,
                                                       8/8 cited in TRACEABILITY.md v1.4,
                                                       8/8 implemented in tests/e2e/p1.spec.js
traceability case IDs                                → 71 cited, 71 defined, 0 undefined
TEST-CASES case rows                                 → 82 (71 + 11 E2E); 31/31 test titles resolve, 0 undefined
headers                                              → 4/4 (Version, Updated, Owner, Supersedes) on all six docs
removed-ID scan (R11+/B8+/N7+)                       → none referenced
```

Versions this gate: PRD **1.1**, TECH-STACK **1.0**, CONTRACT **1.0 — FROZEN at gate G0** (unchanged), DECISIONS **1.3**, IMPLEMENTATION-PLAN **1.4**, TRACEABILITY **1.4**; all `Updated: 2026-11-17`. TEST-CASES v0.6 and test-results RUN-4 are Tester-owned and consistent with the plan. The version spread is the recorded sync sequence (worklog 21:35 and 22:20), not drift.

#### Vercel readiness — PASS

- Deployable set is exactly `app/index.html` (6,108 B), `app/styles.css` (7,229 B), `app/app.js` (25,694 B) — 39,031 B total. No `package.json`, lockfile, manifest, bundler config, `dist/`, `build/`, or `assets/` in `app/`; no build step.
- Every `src`/`href` is relative or `data:` (`./styles.css`, `./app.js`, `./`, `data:,`); 0 absolute or `localhost` paths. The only absolute URLs are the `https://wa.me/...` reminder `href`s, which are outbound links and produce no request (request log: same-origin only).
- No `serviceWorker`, `document.cookie`, password input, auth gate, analytics, `fetch`, or `XMLHttpRequest` in `app/`.
- `?customer=9000000101` and `?customer=9999999999` direct-load in a fresh context return 200 and render the correct view; `/` and `/index.html` both 200 (C-23).
- Clean profile: 0 console errors, 0 uncaught rejections, 0 failed responses, 3–6 same-origin requests; no cookie. `app/vercel.json` absent, which is allowed.

#### Score-risk review — WIN-ANALYSIS §4 and WIN-PLAN §4/§11

WIN-ANALYSIS §4 (why we may lose), P1 build:

| # | Failure mode | Status | Evidence |
|---|---|---|---|
| 1 | Selector missing / renamed / conditional | **PASS** | 19/19 §2 nodes plus row/entry/customer-view nodes present and visible |
| 2 | Tester reads before first paint | **PASS for §2 and the customer-view shell** (now static); rows/entries are post-`load` by design | raw HTML contains every §2 id and `#cust-name`/`#cust-balance`/`#entries` |
| 3 | `.value` set without events; app reads state | **RISK (P2)** | import is inert; the DOM-read requirement is unproven |
| 4 | Import merges instead of replaces | **RISK (P2)** | no import exists; neither behaviour is provable |
| 5 | Punctuation/commas/₹ in machine nodes | **PASS** | 0 forbidden characters in 6 machine strings; `Rs` only in siblings |
| 6 | Zero-balance / unknown-phone rows dropped | **PASS for zero-balance** (row exists); **RISK for unknown-phone** (import, P2) | Sunita row `0`; unknown-phone path is import-only |
| 7 | Float money | **PASS** | integer paise path, independent sums match (`2410.50`, `1512.35`, `-250.25`) |
| 8 | Screenshot quota loses the save | **RISK (P3)** | no upload path yet |
| 9 | `?today=` ignored | **PASS for the entry default**; overdue is P4 | default date and saved `data-date` exact |
| 10 | Sideways scroll / unreadable dark | **PASS with data** | `scrollWidth` 375 at 375×812 with long unicode + `250000.50`; dark contrasts 6.78–15.73 |
| 11 | `[data-customer]` count ≠ customer count | **PASS with manual data**; dedupe unproven (P2) | 2 rows ⇔ 2 customers; no filter active |
| 12 | Virtualised / paginated list | **PASS** | plain `#customers` container, every row in the DOM |
| 13 | No harness | **PASS** | 31-test Playwright suite, `workers: 1`, `retries: 0` |

WIN-PLAN §4 edge-case matrix — 7 demonstrated at P1, 11 deferred to their phase:

| Matrix row | P1 status | Owner |
|---|---|---|
| Zero-entry customer; overpayment → negative; duplicate phone rejected; `"1,500"`/`"Rs 1,500"` parsing; same-date order; future-dated entry (date sorts, balance counts); empty note; large numbers; unicode names | **PASS** (exact values above) | done / P1 |
| Same name, different phones; entry for unknown phone; `type` casing; malformed JSON; import twice; reload after import; `entries: []` | **DEFERRED** | P2 |
| `?today=` overdue/days | **DEFERRED** | P4 |
| 3 MB screenshot | **DEFERRED** | P3 |

WIN-PLAN §11 (if we lose), P1 build:

| # | Cause | P1 status |
|---|---|---|
| 1 | Import merging instead of replacing | **RISK** (P2, unprovable) |
| 2 | Punctuation in `#total-outstanding` | **PASS** |
| 3 | Dropping zero-entry / unknown-phone rows | **PASS** (zero-entry) / **RISK** (unknown-phone, P2) |
| 4 | Contract nodes rendered by JS after a delay | **PASS** (§2 + customer-view shell are static) |
| 5 | Float money | **PASS** |
| 6 | Screenshot upload fails on quota | **RISK** (P3) |
| 7 | Sideways scroll at 375 from a table/long name | **PASS with data** |
| 8 | No harness | **PASS** |

The provisional phone/theme mark is honest but not yet a real-world score: the graded run imports a shop first, and import is P2. P5 must re-audit with the sample, 200 rows and thumbnails before these 10 marks are secure.

#### G1 gate checklist (PLAN §4)

- [x] **Tester RUN id present with commands and evidence** — RUN-4: `cd tests && npx playwright test` → 31/31, with exact oracle values, a P1 case list and a non-vacuity mutation check (4/8 P1 cases failed on a deliberately broken copy; `app/` untouched).
- [x] **Phase acceptance 100%, regression 100%** — E2E-P1-01…08 8/8 green in RUN-4 and CRITIC-RUN-2; P0 regression 23/23 green in the same run. Every PLAN P1 acceptance bullet verified independently: customers, rejections, entries, exact paise balances, signed net total, newest-first view, not-found view, `?today`, reload, storage failure, bare machine nodes.
- [x] **No open P0/P1** — none filed (RUN-1…4), none found by CRITIC-ADV-3/4. The findings below are contract-level risks and later-phase scope notes, not P1 defects.
- [x] **Contract audit 100%** — 32/32 P1-observable items; 0 `CONTRACT-<n>`; deferred P2/P3/P4 items named and owned.
- [x] **Doc sync check passes** — output pasted above: 23/0/0 IDs, 29/29 selectors, 0 TBD, 23/23 rows phased, E2E-P1 8/8 defined, headers 4/4.
- [x] **Critic scorecard written; model score not lower than the previous gate** — 10/100 vs 5/100 at G0.
- [x] **`worklog.md` entry with `Next:`** — the latest entry (22:20, Planner) ends `Next: Critic G1`; the Orchestrator must append the G1 gate entry ending `Next: P2 — Coder` after this scorecard is recorded.

**Verdict: PASS.**

#### Findings / notes (none blocks G1; no veto raised)

- **F-1 [RISK, contract-level — not a Coder bug]** A global `[data-balance]` scan returns customers + 1 because `#cust-balance` carries `data-balance` (§1.7) while each row does too (§1.2); measured 3 for 2 customers. Both are contract-mandated; row-scoped reads are correct (`9000000101 → 2410.50`, `9000000102 → 0`). If the Planner wants to remove the ambiguity, that is a CONTRACT change and a human gate. Any future test or grader proxy must stay row-scoped.
- **F-2 [P3 note]** The per-row reminder link is already contract-correct, including zero, negative (`Rs -250.25`) and unicode/`&`/`+`/`%` names. P3 owns formal verification (`C-07`) and must re-verify after any refinement; it must not regress.
- **F-3 [P3 note]** The decoded reminder reads `Rs -250.25` for an overpayment, which matches CONTRACT §1.3 literally ("`Rs <rendered>`"). If an absolute value was intended, that is a contract decision, not a Coder fix.
- **F-4 [process]** The P1 build is uncommitted (`app/*` modified against HEAD `ce69d69`) and untagged. The Orchestrator should commit and tag `g1` at this gate so the build is reproducible; the three SHA-256 checksums above pin it for this scorecard.
- **F-5 [P2 bookkeeping]** No `E2E-P2-*` rows exist yet in `TEST-CASES.md`; the P2 gate suite is defined only in prose plus C-04/C-05/C-06/C-08/C-33/C-34/I-01/I-04–I-07/I-10/F-01. Name the P2 gate case set (or add the E2E-P2 rows) before the P2 gate, per the accepted R-4 resolution.
- **F-6 [scope, by plan]** `#import-go` and `#export-csv` are inert; `#search`, `#lang-switch` and `#overdue` are shells; entry rows have no `button[data-edit-entry]`/`button[data-delete-entry]` yet. CONTRACT §1.8's edit/delete bullet is B2/P4. Deferred, not P1 failures.
- **F-7 [behaviour note]** When only `getItem` throws and `setItem` succeeds, the read warning is cleared by the first successful write (matches N5's "later available → a subsequent normal save works" and E2E-P1-08). Fully disabled storage keeps the warning and the app alive. No action required.

#### Required before P2

1. Orchestrator: append the G1 gate entry to `worklog.md` with `Next: P2 — Coder`; commit and tag the P1 build (`669c644f…`, `24239b30…`, `c9bf08e2…`).
2. Planner: record a decision on the global `[data-balance]` count (F-1). Preferred outcome: document row-scoped reads and leave CONTRACT frozen; any change is a human gate.
3. Tester: name the P2 gate case set / add the `E2E-P2-*` rows (F-5) before the P2 gate.
4. Coder (P2): implement import — read `#import-box` at click time, atomic full replace, phone/name normalisation and dedupe per §4, unknown-phone auto-create, `#import-msg` success/`Could not import`/`duplicate` warnings, malformed-JSON safety. This is the 60-mark surface.
5. Tester (P2): RUN-5 with the sample import (`11820`, 8 rows, all balances), a second shop in the same tab, reload, 50-shop fuzz against an independent integer-paise oracle, and the full 31-test regression.
6. Keep the P1 guarantees green while adding import: 31/31 regression, 0 console errors, 375 px with the sample, dark mode unchanged.

#### Confidence / unknown about the real tester

- Every P1 number is verified twice (RUN-4 and my own scripts) from the DOM, so a false PASS on R1–R4/R7/N4/N5 is unlikely. What cannot be known is P2: the 60 marks hinge on replace semantics and normalisation that do not exist yet.
- The single most dangerous P1-introduced assumption is the global `[data-balance]` count (F-1). If the tester compares `querySelectorAll('[data-balance]').length` to the customer count, it reads one extra node on every route, including empty state (1 vs 0). Mitigation is documentation plus row-scoped tests; the Coder cannot fix it without a contract change.
- Rows and entries are rendered by the deferred script; a reader that queries before `load` sees none. `goto`-style waiting is assumed, as at G0.
- D4 fractional rendering (`2410.50`, `250000.50`, `-250.25`) is invisible in the whole-rupee sample and remains the riskiest accepted money choice; the parser-friendly bare shape is correct in all measured cases.

### GATE G2 | 2026-11-17 | phase P2

Build: uncommitted working tree at `/Users/akanse/Documents/FWAIProjects/batch10/hisaasb`, served by `python3 -m http.server 4173 --directory app` from that directory; SHA-256 `app/index.html 669c644fb999…` (6,108 B), `app/styles.css 24239b30acdd…` (7,229 B), `app/app.js c5a8ccc60be6…` (35,612 B) — identical to the Tester's RUN-5 handoff checksums. `index.html`/`styles.css` are unchanged from G1; `app.js` grew from 25,694 B (P1) to 35,612 B (P2 import). Git HEAD is `32a2853` ("feat: P1 data core and G1 gate") and `app/app.js` is still modified against it, so the P2 build is uncommitted and untagged; only the checksums pin it (F-1).
Runs cited: RUN-5 (Tester), CRITIC-RUN-3 (my independent re-run of the full suite), CRITIC-ADV-5 (adversarial P2, `/tmp/hisaab-critic/adv-p2.js`), CRITIC-ADV-6 (independent 50-shop fuzz, seed `77190345`, `/tmp/hisaab-critic/fuzz-p2.js`), CRITIC-ADV-7 (contract-bullet probes `/tmp/hisaab-critic/contract-p2.js` + dark/375 measurement `/tmp/hisaab-critic/dark-sample.js`). None imports `app/` or any `tests/` helper.
Hidden-data: **60/60** | Bonus: **0/30** (B1 0, B2 0, B3 0, B4 0, B5 0, B6 0, B7 0 — P4 by plan) | Phone/theme: **10/10** (provisional; sample imported at 375×812 and dark measured with data; P5 re-audits 200 rows and thumbnails)
MODEL SCORE: **70/100** (provisional; up from G0 5/100 and G1 10/100, so "not lower than the previous gate" holds. G2 does not require the final ≥95)
Deductions:
- Ded-1 Bonus block not implemented — **30** — `#overdue` has no rows or `[data-days]`, `#search`/`#export-csv`/`#lang-switch` do not act, entry rows have no `button[data-edit-entry]`/`button[data-delete-entry]`, no `a[href^="upi://pay?pa="]`, no OCR. Owner phase P4; deferred by `IMPLEMENTATION-PLAN.md`.
- No hidden-data deduction: the sample import and my independent fuzz/adversarial batches were fully green (0 failed assertions of 1,077 fuzz assertions and 150 adversarial checks), so `60 × 0/total = 0`.
Contract audit: **37/37 P2-observable items pass**, 0 `CONTRACT-<n>` deviations. P3/P4-owned items are named as deferred, not scored as G2 failures.
Doc sync: **PASS** — literal `R-` check vacuous (0/0/0), corrected `[RNB][0-9]+` 23 IDs with 0 missing / 0 extra, 29/29 contract selector tokens tested, 0 `TBD`/`TODO`/`(Planner)`, 23/23 traceability rows phased, E2E-P2-01…05 and F-01 defined and cited, 87 cited case IDs ↔ 87 defined (0 undefined), headers 4/4, versions PRD 1.1 / TECH-STACK 1.0 / CONTRACT 1.0 FROZEN / DECISIONS 1.3 / PLAN 1.5 / TRACEABILITY 1.5, TEST-CASES v0.7, test-results RUN-5.
Vercel readiness: **PASS** — `app/` is exactly `index.html` + `styles.css` + `app.js` (48,949 B); every `src`/`href` is `./…`, `data:`, or an outbound `https://wa.me/…` link; no absolute/`localhost` asset path, build file, package manifest, service worker, cookie, auth, password field, analytics, `fetch`, or `XMLHttpRequest`; `/`, `/index.html`, `/?customer=…`, `/?today=…` all 200; the import route works on a direct load; 0 console errors, 0 failed and 0 external requests in my fresh contexts.
Score risks: WIN-ANALYSIS §4 (13 rows) → PASS 12, RISK 1 (screenshot quota, P3); the P5 caveats on 375 px/dark with 200 rows are noted in item 10, not scored against P2. WIN-PLAN §4 (18 rows) → PASS 16, DEFERRED 2 (3 MB screenshot P3; `?today` overdue P4). WIN-PLAN §11 (8 rows) → PASS 7, RISK 1 (screenshot quota P3).
Verdict: **PASS** (P2 import — the 60-mark surface is earned)
Required before re-gate: see "Required before P3" below.
Confidence / unknown about the real tester: (1) the 60 marks are now demonstrated on a shop the app has never seen, but only for the documented sample-shaped schema; an importer variant that nests fields differently (`shop.upi`, `entries[].amountPaise`, `customers` as an object keyed by phone) is unhandled by contract and by design. (2) D4 fractional rendering (`12.35`, `-250.25`, `90000000000000` after clamp) is the riskiest accepted money choice; a grader expecting rupee rounding or integer-only strings would differ. (3) D10 (unknown-phone entries create `Customer <phone>` and are counted) is the second risk: a grader that expects them ignored would count one extra row and a larger total. (4) A reader that queries before the deferred render sees the static §2 nodes but no imported rows; `goto`/`load` waiting is assumed throughout.

#### CRITIC-RUN-3 — independent re-execution of the full suite

Command: `cd tests && npx playwright test` (config `workers: 1`, `retries: 0`, base `http://localhost:4173`, Chromium via `@playwright/test` 1.65.1, default 1280×800, 375×812 where a case sets it).

```
$ cd tests && npx playwright test
Running 37 tests using 1 worker

  ✓   1 [chromium] › e2e/p0-gate.spec.js:59:1 › C-23 Vercel shape: app/index.html, relative assets, no build step, no service worker (257ms)
  ✓   2 [chromium] › e2e/p0-gate.spec.js:95:1 › N-05 no service worker, cookie gate, password field, analytics, or third-party origin (251ms)
  ✓   3 [chromium] › e2e/p0-gate.spec.js:121:1 › E2E-P0-01 first paint: 19 §2 nodes resolve, data selectors are empty, customer view resolves (487ms)
  ✓   4 [chromium] › e2e/p0-gate.spec.js:148:1 › E2E-P0-02 all query-string routes render the same first paint (1.1s)
  ✓   5 [chromium] › e2e/p0-gate.spec.js:176:1 › E2E-P0-03 phone + theme baseline and offline-safe load (426ms)
  ✓   6 [chromium] › e2e/p1.spec.js:66:1 › E2E-P1-01 add customers and four entries: exact paise balances, total, amounts, rejections (580ms)
  ✓   7 [chromium] › e2e/p1.spec.js:161:1 › E2E-P1-02 reload keeps everything; a storage failure keeps the save in memory with a visible warning (547ms)
  ✓   8 [chromium] › e2e/p1.spec.js:211:1 › E2E-P1-03 row link and direct ?customer= both open the same correct view (593ms)
  ✓   9 [chromium] › e2e/p1.spec.js:249:1 › E2E-P1-04 ?today=2026-11-15 sets the default entry date and the saved data-date (353ms)
  ✓  10 [chromium] › e2e/p1.spec.js:270:1 › E2E-P1-05 375x812 with long unicode name, long unicode note, and a fractional amount (330ms)
  ✓  11 [chromium] › e2e/p1.spec.js:325:1 › E2E-P1-06 money parsing and rendering through the entry form (D4, N4) (593ms)
  ✓  12 [chromium] › e2e/p1.spec.js:384:1 › E2E-P1-07 entries with equal dates keep the newest-saved first (R4, U-04) (441ms)
  ✓  13 [chromium] › e2e/p1.spec.js:413:1 › E2E-P1-08 a later successful save clears the storage warning and persists (N5) (556ms)
  ✓  14 [chromium] › e2e/p2.spec.js:52:1 › E2E-P2-01 (C-04/C-05/C-06/C-34) sample import: 11820, 8 rows, every balance matches sample-expected.json (357ms)
  ✓  15 [chromium] › e2e/p2.spec.js:100:1 › E2E-P2-02 (I-01) a second import replaces the first shop and reload keeps the second (524ms)
  ✓  16 [chromium] › e2e/p2.spec.js:144:1 › E2E-P2-03 (C-33/I-10) malformed JSON keeps state; missing lists warn; empty arrays render an empty shop (472ms)
  ✓  17 [chromium] › e2e/p2.spec.js:191:1 › E2E-P2-04 (I-04/I-05/I-06/I-07/U-02/U-03) dedupe, unknown phone, zero entries, decorated amounts, type casing (342ms)
  ✓  18 [chromium] › e2e/p2.spec.js:282:1 › E2E-P2-05 imported sample at 375x812: no sideways scroll, balances not clipped (480ms)
F-01 seed 20261117 datasets 50 :: {"shops":50,"customers":160,"entries":297,"duplicatePhoneShops":21,"negativeBalanceRows":56,"zeroBalanceRows":98,"unknownPhoneEntries":203,"unicodeNames":41,"stringAmounts":172,"missingAmounts":31,"missingTypes":27,"missingDates":64,"negativeTotalShops":17,"emptyShops":1}
  ✓  19 [chromium] › fuzz/p2-fuzz.spec.js:210:1 › F-01 50-shop fuzz: every balance and the total equal the independent computation (410ms)
  ✓  20 [chromium] › nonfunctional/p0.spec.js:10:3 › 375x812 viewport › C-20 document scrollWidth is 375 or less at empty state (226ms)
  ✓  21 [chromium] › nonfunctional/p0.spec.js:30:3 › prefers-color-scheme: dark › C-21 dark baseline keeps key nodes visible and text at >= 4.5:1 (270ms)
  ✓  22 [chromium] › nonfunctional/p0.spec.js:63:1 › C-22 no external network request on load (same-origin or data: only) (581ms)
  ✓  23 [chromium] › smoke/contract.spec.js:45:1 › C-01 #total-outstanding resolves on load with text 0 (258ms)
  ✓  24 [chromium] › smoke/contract.spec.js:54:1 › C-02 #import-box and #import-go are visible at first paint (257ms)
  ✓  25 [chromium] › smoke/contract.spec.js:61:1 › C-03 #shot-input exists inside the payment form at first paint (274ms)
  ✓  26 [chromium] › smoke/contract.spec.js:68:1 › C-09 every CONTRACT §2 node resolves and is visible before interaction (280ms)
  ✓  27 [chromium] › smoke/contract.spec.js:91:1 › C-10 #total-outstanding text and data-value are exactly 0 (bare), Rs lives in a sibling (270ms)
  ✓  28 [chromium] › smoke/contract.spec.js:114:1 › C-11 #import-box is a textarea, #import-go a button, #shot-input a file input accepting image/* (266ms)
  ✓  29 [chromium] › smoke/contract.spec.js:141:1 › C-12 #entry-type options are exactly credit and payment (263ms)
  ✓  30 [chromium] › smoke/contract.spec.js:153:1 › C-13 #lang-switch is a select with exactly en, hi, te and defaults to en (285ms)
  ✓  31 [chromium] › smoke/contract.spec.js:175:1 › C-14 #overdue heading contains Overdue and 30+ days, with an empty-state line (267ms)
  ✓  32 [chromium] › smoke/contract.spec.js:194:1 › C-15 #customers shows a visible empty-state message and no rows (267ms)
  ✓  33 [chromium] › smoke/contract.spec.js:205:1 › C-16 empty storage renders zero data-dependent nodes (270ms)
  ✓  34 [chromium] › smoke/contract.spec.js:216:1 › C-39 first paint raises no console error, failed request, or rejection (847ms)
  ✓  35 [chromium] › smoke/routes.spec.js:28:1 › C-17 ?customer=unknown renders the not-found view and keeps every list node (269ms)
  ✓  36 [chromium] › smoke/routes.spec.js:54:1 › C-18 ?today=2026-11-15 loads cleanly with the full empty-state contract (269ms)
  ✓  37 [chromium] › smoke/routes.spec.js:66:1 › C-19 invalid ?today values load cleanly and do not crash (460ms)

  37 passed (15.5s)
```

`37 = 23 P0 (C-01–C-03, C-09–C-23, C-39, N-05, E2E-P0-01–03, C-20–C-22) + 8 P1 (E2E-P1-01…08) + 5 P2 (E2E-P2-01…05) + F-01`. The count and the P2 pass/fail match RUN-5; the suite is not vacuous (RUN-5 records the payments-add mutant failing F-01 at dataset 0).

#### CRITIC-ADV-5 — independent P2 adversarial checks (150/150)

`node /tmp/hisaab-critic/adv-p2.js` — a standalone Playwright script that imports nothing from `app/` or `tests/`; every expected value is computed in the script from `CONTRACT.md` §3.2/§3.3/§4, D4/D9/D10/D11 and `sample-expected.json`. Import is always performed by setting `#import-box.value` through `evaluate` (no `input`/`change` events) and clicking `#import-go`, as §1.4 permits.

```
ADVERSARIAL CHECKS: 150/150 passed
```

Evidence by group (every value read from the DOM):

| Group | Result |
|---|---|
| Sample import | `#total-outstanding` text = `data-value` = `11820`, matches `^-?(0\|[1-9][0-9]*)(\.[0-9]{2})?$`, no `Rs`/`₹`/`,`/space; exactly 8 `[data-customer]`, row set = the 8 `sample-expected.json` phones; each `[data-balance]` text = attribute = `String(expected)`; expected-file sum = `11820`; message contains the shop name, `8 customers`, `total 11820`, no `Warning`; body has no `undefined`/`NaN` |
| 375 px with the sample | `documentElement.scrollWidth` 375, `body.scrollWidth` 375, 8 rows, 0 clipped balances (right edge ≤ 376) |
| Replace | second shop (`Asha` 1000 credit, `Bala` 250.50 payment): 2 rows, balances `1000` and `-250.50`, total `749.50`; 0 sample phones survive, no `Lakshmi Provision Store`/`9000000102` text, total ≠ `11820`; after `reload()` the same 2 rows, `749.50`, `-250.50` |
| Malformed / non-object | `{"customers": [` → `Could not import`, 8 rows and `11820` intact, `9000000101` still `670`; `[1,2,3]` and `42` → refusal, state intact |
| Missing / non-array / empty | `{"shop":"Only A Name"}` → success + `Warning`, 0 rows, total `0`, empty-state text; `customers:"nope"`/`entries:42` → warning, 0 rows, `0`; `{"customers":[],"entries":[]}` → 0 rows, `0`, no error text |
| D9 / D10 / zero | exact duplicate (name + `+91 90000 00101` phone) → 1 row, balance `100` once, no `duplicate`; same phone different name → 1 row, last name `Ravi K Sharma` and not `Ravi Kumar`, message contains `duplicate` and `9000000101`; same name two phones → 2 rows, no duplicate warning; unknown phone `9000000199` → row `Customer 9000000199` balance `250`, total `250`; zero-entry customer → `0`; three decorated phone forms (`+91 …`, `90000-00101`, `919000000101`) → one row keyed `9000000101` |
| Amounts | `1500` (number) → `1500`; `"Rs 1,500"` → `1500`; `"1,500"` → `1500`; `"670.50"` → `670.50`; `"12.345"` → `12.35`; `0.05` → `0.05`; `-250` credit → `250`; `"abc"`/`""`/missing → `0` with `Warning`; rounding warning present; total `5432.90`; text = attribute everywhere; no `NaN`/`undefined` |
| Types | `CREDIT`, `Credit`, `debit`, `gave`, `udhaar` → credit (`100`); `payment`, `PAID`, `received` → payment (`-100`); `mystery` and missing → credit (`100`) with both warnings |
| Dates / order | blank and whitespace-only → `2026-11-15` under `?today=2026-11-15`; ISO kept; `not-a-date` kept as text; customer-view order = blank-today, then `2026-10-05` newest-inserted first, then `2026-10-01`, then `not-a-date` last; all 6 entries present |
| P0/P1 regression (own probes) | 19/19 §2 nodes resolve with non-zero boxes; empty total `0`; 0 data-dependent nodes; add customer + credit `Rs 1,500` + payment `350.25` → balance and total `1149.75`; customer view name/balance/attr/2 entries exact; reload keeps `1149.75` |
| Console / network | 0 console errors, 0 failed requests, 0 external requests across every context above |

#### CRITIC-ADV-6 — independent 50-shop fuzz, seed `77190345` (1,077/1,077)

`node /tmp/hisaab-critic/fuzz-p2.js` — a different generator and a separately written oracle from the Tester's F-01 (`20261117`). Each shop is imported through the UI at `/?today=2026-11-15`; the script recomputes phone/name normalisation, D9 dedupe, D10 auto-create, D11 type/date defaults, the §3.2 parse (including nearest-paise rounding and the `9000000000000000` clamp), balances, the signed net total and the §3.3 render in the Node process, then compares every row (text **and** attribute), the row set, the total (text **and** attribute), the machine shape, the warning classes, and one sampled customer's entry count through `?customer=`.

```
FUZZ seed 77190345 datasets 50
DATASETS SUMMARY :: {"shops":50,"customers":155,"entries":202,"duplicatePhoneShops":22,
  "negativeBalanceRows":38,"zeroBalanceRows":86,"unknownPhoneEntries":93,"unicodeNames":21,
  "stringAmounts":114,"missingAmounts":10,"missingTypes":30,"missingDates":34,
  "negativeTotalShops":13,"emptyShops":3,"bigValues":7,"invalidEntries":4,
  "entryCountChecks":47,"zeroEntryRows":61,"sameDateTieShops":9,
  "negativeAmountEntries":12,"duplicateCustomerRecords":48}
FUZZ ASSERTIONS: 1077/1077 passed across 50 shops
```

Every hidden-data class named in the task is present in this seed: zero-entry rows (61), overpayments/negative balances (38 rows, 13 shops with a negative total), duplicate phones (48 duplicate records across 22 shops), unknown-phone entries (93), string/decorated amounts (114), missing amounts/types/dates (10/30/34), unicode names (21), same-date ties (9 shops), large/clamped values (7), invalid entries skipped (4), and 3 completely empty shops. No mismatch, no dropped row, no `NaN`/`undefined`, no console error; reload after the last import keeps the same total.

#### CRITIC-ADV-7 — contract-bullet probes and dark/375 measurement

`node /tmp/hisaab-critic/contract-p2.js` → `EXTRA CONTRACT PROBES: 19/19 passed`: `#import-msg` empty at load; import replaces a manually added customer (not merged); phone keys `12345`, `441234567890`, `9000000502` (from `919000000502`), `9000000503` (from `+91 90000 00503`), `9000000504` — short/long phones keep their money rows and 12-digit `91` prefixes drop; displayed name keeps original case (`ravi kumar` not lowercased); entries with `abc`/empty phones are skipped with a `Warning` and their `999` is not counted; a negative total renders `-250.25` in text and `data-value` with `Advance Rs 250.25` only in the human sibling; a zero-balance row remains with `0`; after a decorated import every machine node (total, row balances, `#cust-balance`, `[data-amount]`) is bare and text = attribute, with `[data-amount]` showing the unsigned magnitude (`1500`, `670.50`) while `#cust-balance` carries the sign (`-829.50`); 0 console errors.

`node /tmp/hisaab-critic/dark-sample.js` (375×812, `prefers-color-scheme: dark`, sample imported):

```
colorScheme "light dark" | scrollWidth 375 | rows 8 | body bg rgb(15,13,11) / ink rgb(245,240,232)
contrast: body 17.10 | #total-outstanding 15.73 | labels 6.78 | row names 14.4 ×8 |
          balance chips 14.4 ×8 | #import-box/#search/#new-name 15.73
```

#### Contract audit — P2 scope (37/37)

| # | CONTRACT rule | Result | Evidence |
|---|---|---|---|
| CA-P2-01 | `#import-box`/`#import-go`/`#import-msg` visible in the DOM at load, never in a modal (§1.4) | PASS | C-02/C-09 green; own first-paint count = 1 each, non-zero boxes |
| CA-P2-02 | Import reads `#import-box.value` at click time, not cached state (§1.4) | PASS | Every ADV check sets `.value` via `evaluate` and fires no events |
| CA-P2-03 | Import atomically replaces the entire shop (§1.4, §4) | PASS | Manual customer `9000000999` gone after import; rows = imported key set |
| CA-P2-04 | A second import leaves only the second shop | PASS | 2 rows, `749.50`, no sample phone/text/total |
| CA-P2-05 | Never merges, appends, or unions | PASS | Row sets and totals exact in 50 fuzz shops and the replace probe |
| CA-P2-06 | Success text contains shop name, customer count, rendered total | PASS | `Imported "Lakshmi Provision Store (fictional)": 8 customers, total 11820.` |
| CA-P2-07 | Error text contains `Could not import` | PASS | Malformed and non-object inputs |
| CA-P2-08 | Duplicate warning contains `duplicate` and names the phone | PASS | `Warning: duplicate phone 9000000101; …` |
| CA-P2-09 | Malformed JSON: no state change, readable message, no crash | PASS | 8 rows/`11820`/`670` intact |
| CA-P2-10 | Non-object JSON: refused, state unchanged | PASS | `[1,2,3]`, `42` |
| CA-P2-11 | Missing `customers`/`entries` → empty list, success + warning | PASS | `{"shop":"Only A Name"}` → 0 rows, `0`, `Warning` |
| CA-P2-12 | Non-array `customers`/`entries` → empty list, success + warning | PASS | `"nope"`/`42`, and `null` lists |
| CA-P2-13 | Empty arrays → empty shop, total `0` | PASS | 0 rows, `0`, empty-state text |
| CA-P2-14 | Unknown top-level fields ignored; non-string `shop` not rendered | PASS | `unknownTop`, numeric/object `shop` |
| CA-P2-15 | Phone normalisation (cast, trim, non-digits removed, one leading `+` dropped, `91` dropped only at 12 digits) | PASS | Three forms collapse to one key; 11-digit result kept |
| CA-P2-16 | Short/long phones keep their row and money | PASS | `12345` balance `1`; `441234567890` row present |
| CA-P2-17 | Name comparison: NFC, trim, whitespace collapse, case-insensitive; display keeps case | PASS | Exact dup collapses; `ravi kumar` displayed as given |
| CA-P2-18 | Exact duplicate (same name + phone) → one row, one name, no warning, money once | PASS | 1 row, `100`, no `duplicate` |
| CA-P2-19 | Same phone/different name → one row, last name, warning naming the phone | PASS | `Ravi K Sharma`, warning contains `duplicate` + `9000000101` |
| CA-P2-20 | Same name/different phone → two distinct rows | PASS | 2 rows, no duplicate warning |
| CA-P2-21 | Entries keyed by phone; unknown phone auto-creates `Customer <phone>` and is counted | PASS | `Customer 9000000199`, balance/total `250`; 93 fuzz cases |
| CA-P2-22 | Zero-entry customer → row with `[data-balance]` `0` | PASS | 61 zero-entry rows in fuzz; explicit probe |
| CA-P2-23 | Type mapping `credit*`/`debit*`/`gave`/`udhaar` → credit; `payment*`/`paid*`/`received` → payment; case-insensitive | PASS | Ten type probes, exact signed balances |
| CA-P2-24 | Unknown type → credit + warning; missing/empty type → credit + warning | PASS | Applies to both a warning sentence each |
| CA-P2-25 | Amount parses number or string; strips `Rs`/`₹`/`INR`/spaces/commas; magnitude; sign from type | PASS | `Rs 1,500`, `1,500`, `-250`, `₹ 99.99` |
| CA-P2-26 | More than two decimals rounds half away from zero, never to the rupee; logged | PASS | `12.345` → `12.35`, message warns about rounding |
| CA-P2-27 | Fractional renders exactly two decimals; whole values none; `0.05` keeps two paise digits | PASS | `670.50`, `0.05`, `1500`, `11820` |
| CA-P2-28 | Invalid/empty/missing amount → `0` + warning, never throws | PASS | `abc`, `""`, deleted `amount`; no `NaN`/`undefined` |
| CA-P2-29 | Magnitudes above `9000000000000000` paise clamp and log | PASS | 7 clamped rows in fuzz; values exact in text and attribute |
| CA-P2-30 | Date: ISO kept; blank/missing → today (`?today` honoured); unparseable kept as text and sorts after ISO | PASS | `2026-11-15` default, `not-a-date` last |
| CA-P2-31 | Note missing/blank → empty text, never `undefined`/`null`/`NaN` | PASS | Body text scan; blank-only note |
| CA-P2-32 | Entry with no usable phone is skipped with a warning; no invented row | PASS | `abc`/`""` phones skipped, `999` not counted |
| CA-P2-33 | Sort: date descending, then insertion index descending | PASS | Exact order `6,2,5,4,1,3`; 9 same-date-tie shops in fuzz |
| CA-P2-34 | Rows/total: one row per phone key, total = signed net sum of all balances | PASS | 50 shops, every row and total equal to the independent oracle |
| CA-P2-35 | Machine shape: bare, text = attribute, no decoration in total/row/`#cust-balance`/`[data-amount]` | PASS | Regex applied to every machine node in every fuzz shop |
| CA-P2-36 | Negative total: signed machine value, `Advance Rs …` only in the human sibling | PASS | `-250.25` text/attr, `Advance Rs 250.25` sibling |
| CA-P2-37 | No duplicate/filtered rows; every imported customer is in the DOM; P0/P1 still green | PASS | Row set = key set; 37/37 suite + own regression probes |

**`CONTRACT-<n>` deviations at P2: none.** Deferred by plan and therefore not P2 failures:

- **P3 / R5, R6:** `img[data-shot]`, screenshot upload/downscale, quota fallback (`C-07`, `I-03`, `I-08`, `N-03`). `a[data-remind]` already exists and is href-conformant but P3 owns formal verification and must not regress it.
- **P4 / B1–B7:** overdue rows + `[data-days]`, edit/delete buttons inside entry rows, `#export-csv` downloads, `#search` filtering, `a[href^="upi://pay?pa="]`, `#lang-switch` translation, OCR.
- **P5 / P6:** 200-row + thumbnail responsive audit, dark-mode full audit, 200-shop fuzz (F-02).

#### Doc sync — output

```
$ grep -o 'R-[0-9]\+' docs/PRD.md | sort -u | wc -l                  → 0   (literal AGENTS.md §4 regex is vacuous)
$ grep -oE '\b[RNB][0-9]+' docs/PRD.md | sort -u | wc -l            → 23
$ comm -23 /tmp/r /tmp/p   (PRD IDs missing from PLAN)              → (empty)  0
$ comm -23 /tmp/r /tmp/t   (PRD IDs missing from TRACEABILITY)      → (empty)  0
$ comm -13 /tmp/r /tmp/p ; comm -13 /tmp/r /tmp/t                   → (empty)  0 extra
$ grep -o '`[#\[][^`]*`' docs/CONTRACT.md | tr -d '`' | sort -u | wc -l → 29
$ while read sel; do grep -qF "$sel" docs/TEST-CASES.md || echo "UNTESTED: $sel"; done < /tmp/s
                                                                     → (no output) 29/29
$ grep -nE 'TBD|TODO|\(Planner\)' docs/{PRD,TECH-STACK,IMPLEMENTATION-PLAN,CONTRACT,DECISIONS,TRACEABILITY}.md
                                                                     → none
traceability rows                                                    → rows=23 with_phase=23 bad=none
E2E-P2-01…05 + F-01                                                  → 6/6 defined in TEST-CASES.md v0.7,
                                                                       6/6 cited in TRACEABILITY.md v1.5,
                                                                       6/6 implemented in tests/{e2e/p2,fuzz/p2-fuzz}.spec.js
traceability case IDs                                                → 87 cited, 87 defined, 0 undefined
case rows in TEST-CASES.md                                           → 87
headers                                                              → 4/4 (Version, Updated, Owner, Supersedes) on all six docs
removed-ID scan (R11+/B8+/N7+)                                       → only G0-CHECKLIST/scorecard *checklist* item labels
                                                                       (B8–B11); 0 requirement-ID references
```

Versions this gate: PRD **1.1**, TECH-STACK **1.0**, CONTRACT **1.0 — FROZEN at gate G0** (unchanged since G0), DECISIONS **1.3**, IMPLEMENTATION-PLAN **1.5**, TRACEABILITY **1.5**; all `Updated: 2026-11-17`. TEST-CASES v0.7 and test-results RUN-5 are Tester-owned and consistent with the plan. The version spread is the recorded sync sequence (worklog 23:20), not drift.

#### Vercel readiness — PASS

- Deployable set is exactly `app/index.html` (6,108 B), `app/styles.css` (7,229 B), `app/app.js` (35,612 B) — 48,949 B total. No `package.json`, lockfile, manifest, bundler config, `dist/`, `build/`, or `assets/` in `app/`; no build step; no `vercel.json` (allowed).
- Every `src`/`href` is relative or `data:` (`./styles.css`, `./app.js`, `./`, `data:,`); 0 absolute or `localhost` paths. The only absolute URLs are outbound `https://wa.me/…` reminder links, which produce no request.
- No `serviceWorker`, `document.cookie`, password input, auth gate, analytics, `fetch`, `XMLHttpRequest`, or third-party origin in `app/`.
- Direct loads: `/`, `/index.html`, `/?customer=9000000101`, `/?today=2026-11-15`, `/?today=not-a-date` → HTTP 200. The import box works on a cold direct load with empty storage.
- Fresh contexts throughout CRITIC-ADV-5/6/7: 0 console errors, 0 page errors, 0 failed requests, 0 external requests.

#### Score-risk review — WIN-ANALYSIS §4 and WIN-PLAN §4/§11

WIN-ANALYSIS §4 (why we may lose), P2 build:

| # | Failure mode | Status | Evidence |
|---|---|---|---|
| 1 | Selector missing / renamed / conditional | **PASS** | 19/19 §2 nodes + imported rows/entries/customer view all resolve |
| 2 | Tester reads before first paint | **PASS for §2 and shells**; rows are post-import by design | raw HTML holds every §2 id; rows exist after the click resolves |
| 3 | `.value` set without events; app reads state | **PASS** | every import in ADV-5/6 set `.value` directly and was honoured |
| 4 | Import merges instead of replaces | **PASS** | 2 rows after the second import; no sample phone/text survives; 50/50 fuzz row sets exact |
| 5 | Punctuation/commas/₹ in machine nodes | **PASS** | bare regex on every machine node in every fuzz shop; 0 forbidden chars |
| 6 | Zero-balance / unknown-phone rows dropped | **PASS** | 61 zero-entry rows; `Customer 9000000199` created and counted |
| 7 | Float money | **PASS** | `12.35`, `670.50`, `-250.25`, `90000000000000` exact; independent integer oracle |
| 8 | Screenshot quota loses the save | **RISK (P3)** | no upload path yet |
| 9 | `?today=` ignored | **PASS for the entry default and import date default**; overdue P4 | blank dates → `2026-11-15` |
| 10 | Sideways scroll / unreadable dark | **PASS with the sample** (provisional) | 375/375 with 8 imported rows; dark contrast 6.78–17.10 |
| 11 | `[data-customer]` count ≠ customer count | **PASS** | row set = normalised key set in 50 shops; no filter active at load |
| 12 | Virtualised / paginated list | **PASS** | every row in `#customers`; no pagination |
| 13 | No harness | **PASS** | 37-test suite + independent 50-shop fuzz + adversarial batch |

WIN-PLAN §4 edge-case matrix — PASS at P2: zero-entry customer; overpayment → negative; duplicate phone; entry for unknown phone; `"1,500"`/`"Rs 1500"`; `type` casing; same-date entries; future-dated entry; empty note; large numbers; unicode names; `entries: []`; malformed JSON; import twice; reload after import; `?today=2026-11-15` for the entry/import default. **DEFERRED:** 3 MB screenshot (P3), `?today` overdue days (P4).

WIN-PLAN §11 (if we lose), P2 build:

| # | Cause | P2 status |
|---|---|---|
| 1 | Import merging instead of replacing | **PASS** |
| 2 | Punctuation in `#total-outstanding` | **PASS** |
| 3 | Dropping zero-entry / unknown-phone rows | **PASS** |
| 4 | Contract nodes rendered after a delay | **PASS** (§2 + customer shells static) |
| 5 | Float money | **PASS** |
| 6 | Screenshot upload fails on quota | **RISK** (P3) |
| 7 | Sideways scroll at 375 from a table/long name | **PASS with the sample**; 200-row/long-string pass is P5 |
| 8 | No harness | **PASS** |

The 10 phone/theme marks are earned provisionally with the exact graded flow (sample imported, then 375 px and dark mode). P5 must still audit 200 rows, 100-character unicode notes, thumbnails, and tap targets before the final gate.

#### G2 gate checklist (PLAN §4)

- [x] **Tester RUN id present with commands and evidence** — RUN-5: `cd tests && npx playwright test` → 37/37, exact oracle values, a P2 case list, seed `20261117`/50 datasets, and a non-vacuity mutant failing F-01 at dataset 0.
- [x] **Phase acceptance 100%, regression 100%** — E2E-P2-01…05 + F-01 6/6 green in RUN-5 and CRITIC-RUN-3; P0 23/23 and P1 8/8 green in the same run; every PLAN P2 acceptance bullet independently verified (sample `11820`/8 rows, replace, DOM read, message text, dedupe, unknown/zero, decorated amounts, rounding, type casing, missing lists, malformed JSON, empty arrays, 375 px).
- [x] **No open P0/P1** — none filed (RUN-1…5) and none found by ADV-5/6/7. The findings below are process and later-phase notes, not P0/P1 defects.
- [x] **Contract audit 100%** — 37/37 P2-observable items; 0 `CONTRACT-<n>`; deferred P3/P4 items named and owned.
- [x] **Doc sync check passes** — output pasted above: 23/0/0 IDs, 29/29 selectors, 0 TBD, 23/23 rows phased, E2E-P2 6/6 defined and cited, 87/87 case IDs, headers 4/4.
- [x] **Critic scorecard written; model score not lower than the previous gate** — 70/100 vs 10/100 at G1.
- [x] **`worklog.md` entry with `Next:`** — the latest entry (23:20, Planner) ends `Next: Critic G2`; the Orchestrator must append the G2 gate entry ending `Next: P3 — Coder` after this scorecard is recorded.

**Verdict: PASS.**

#### Findings / notes (none blocks G2; no veto raised)

- **F-1 [process]** The P2 build is uncommitted: `app/app.js` is modified against HEAD `32a2853` (the `g1` commit/tag), and the new `tests/e2e/p2.spec.js` + `tests/fuzz/` are untracked. The Orchestrator should commit and tag `g2` so the graded build is reproducible; the three SHA-256 checksums above pin it for this scorecard.
- **F-2 [residual edge, non-blocking]** When two customer records share a phone and the **later** record has an empty/absent name, the app keeps the earlier non-empty name and emits no `duplicate` warning (`app.js` import dedupe: `else if (name) { … }`). The row count and all money stay correct; CONTRACT §4's duplicate bullet presumes a full name and PRD hidden-data lists duplicate phones with different names, so this is an underspecified edge, not a `CONTRACT-<n>` deviation. No P0/P1/P2. If the Planner wants it pinned, it belongs in a later docs/P6 note, not a contract change.
- **F-3 [known contract risk, unchanged from G1]** A global `[data-balance]` scan returns rows + 1 because `#cust-balance` carries `data-balance` (§1.7) while rows carry it (§1.2); after the sample import the global count is 9 for 8 customers. Row-scoped values are exact; every P2 test and my fuzz are row-scoped. Any change is a CONTRACT change and a human gate.
- **F-4 [non-contract hooks]** `#entry-msg`, `#storage-msg`, and `#entry-customer` remain Coder-reported test hooks, not contract nodes. The import status uses the contract node `#import-msg`.
- **F-5 [scope, by plan]** `img[data-shot]`, screenshot downscale/quota, overdue rows, edit/delete, CSV, search filtering, UPI, language translation, and OCR are P3/P4. Deferred, not G2 failures.
- **F-6 [note]** The success message's customer count includes rows auto-created from unknown-phone entries, so it equals the rendered row count (e.g. `Customer 9000000199`). Documented behaviour, consistent with D10.
- **F-7 [note]** `[data-amount]` renders the unsigned magnitude (§1.8) while the row balance carries the sign; verified on a decorated import (`1500`, `670.50` amounts; `-829.50` balance). A grader reading entry amounts must not expect a sign there.

#### Required before P3

1. Orchestrator: append the G2 gate entry to `worklog.md` with `Next: P3 — Coder`; commit and tag the P2 build (`669c644f…`, `c5a8ccc6…`, `24239b30…`).
2. Coder (P3): implement the screenshot path — `#shot-input` is already a real always-present file input; add downscale-before-store, `img[data-shot]` inside the same `[data-entry-id]`, and the quota fallback that still saves the entry and warns. Do not regress `a[data-remind]` (already href-conformant) or any P0/P1/P2 node.
3. Tester (P3): write/execute `C-07`, `I-03`, `I-08`, `N-03` (3 MB image, reload, forced quota) and re-run the full suite; RUN-6 with the P3 gate set.
4. Planner (P3 sync): map R5/R6 to the P3 cases and update versions; no CONTRACT change expected.
5. Keep the P2 guarantees green: 37/37 regression, sample `11820`/8 rows, replace + reload, dedupe/unknown/zero, 0 console errors, 375 px with the sample.
6. Optional (docs-only): record F-2 (empty-name duplicate) and F-3 (row-scoped `[data-balance]`) as known edges; no contract change and no human gate.

#### Confidence / unknown about the real tester

- The 60 hidden-data marks are now backed by three independent oracles (my adversarial batch, my 50-shop fuzz on a different seed, and the Tester's F-01), all reading the DOM and computing expectations outside `app/`. A false PASS would require all three oracles to share a wrong reading of D4/D9/D10/D11.
- What cannot be known is the real shop schema: the brief fixes the sample shape, and this import handles that shape plus documented variations. A nested or renamed schema (`entries[].amountPaise`, `customers` keyed by phone, `shop.upi`) is not in the contract and would not import.
- D4's exact-paise rendering is invisible in the whole-rupee sample (`11820`) and is the highest-impact accepted choice; D10 (`Customer <phone>` rows counted in the total) is the second, and `[data-balance]` row-vs-global counting is the third. All three are documented choices, not implementation accidents.
- Import replaces and persists, and rows are rendered synchronously from the click; a reader that queries between `goto` and the click legitimately sees the previous/empty shop, which is the expected state before an import.

### GATE G3 | 2026-11-17 | phase P3

Build: uncommitted working tree at `/Users/akanse/Documents/FWAIProjects/batch10/hisaasb`, served by `python3 -m http.server 4173 --directory app` from that directory; SHA-256 `app/index.html 669c644fb999…` (6,108 B, unchanged since G0/G1/G2), `app/styles.css 291bc99cf82a…` (7,510 B, +281 B: `.entry-shot` thumbnail rule), `app/app.js 3049401a8749…` (44,107 B, +8,495 B: reminder verification + FileReader → Image → canvas/JPEG pipeline). Deployable total 57,725 B. Git HEAD is `cccb4d6` ("feat: P2 import and G2 gate", tag `g2`); `app/app.js` and `app/styles.css` are modified against it and `tests/e2e/p3.spec.js` is untracked, so the P3 build is uncommitted and untagged — the three checksums pin it (F-1).
Runs cited: RUN-6 (Tester), CRITIC-RUN-4 (my independent re-run of the full suite), CRITIC-ADV-8 (`/tmp/hisaab-critic/adv-p3.js`), CRITIC-ADV-9 (`/tmp/hisaab-critic/extra-p3.js`), CRITIC-ADV-10 (`/tmp/hisaab-critic/final-probe.js`), CRITIC-ADV-11 (re-run of my independent 50-shop fuzz `/tmp/hisaab-critic/fuzz-p2.js`, seed `77190345`, on the P3 build). None imports `app/` or any `tests/` helper.
Hidden-data: **60/60** | Bonus: **5/30** (B1 0, B2 0, B3 0, B4 0, B5 0, B6 0, B7 **5 provisional** — see Ded-1) | Phone/theme: **10/10** (provisional; 375×812 with the sample and with a thumbnail, dark measured with a thumbnail; P5 still audits 200 rows and tap targets)
MODEL SCORE: **75/100** (provisional; up from G0 5, G1 10, G2 70, so "not lower than the previous gate" holds. Strict reading with B7 = 0 is **70/100**, still ≥ G2's 70. G3 does not require the final ≥95)
Deductions:
- Ded-1 Bonus block incomplete — **25 marks foregone** — B1 overdue rows/`[data-days]`, B2 edit/delete, B3 CSV, B4 search filtering, B5 UPI link, B6 language translation and B7's OCR amount prefill are all P4 by `IMPLEMENTATION-PLAN.md`. The only bonus-adjacent thing that exists is the P3 screenshot save path (R5, part of the 60-mark contract), so the 5 credited under B7 is **provisional** on that scripted path; if the real tester's B7 check requires amount-reading, B7 is 0 and the model score is 70/100. Either figure clears the G3 threshold.
- No hidden-data deduction: the P3 build still passes the suite's F-01 (50 shops, seed `20261117`), my independent 50-shop fuzz (1,077/1,077 assertions, seed `77190345`), and the sample/replace/malformed probes in CRITIC-ADV-8. `60 × 0/total = 0`.
Contract audit: **43/43 P3-observable items pass**, 0 `CONTRACT-<n>` deviations (full table below). P4-owned items (OCR, edit/delete, CSV, search, overdue rows, UPI, language) are named as deferred, not G3 failures.
Doc sync: **PASS** — literal `R-` check vacuous (0/0/0), corrected `[RNB][0-9]+` 23 IDs with 0 missing / 0 extra, 29/29 contract selector tokens tested, 0 `TBD`/`TODO`/`(Planner)`, 23/23 traceability rows phased, E2E-P3-01…05 5/5 defined + 5/5 cited + 5/5 implemented (`IMPLEMENTATION-PLAN.md` v1.6 cites the range `E2E-P3-01–05`), C-38 still P4, 92 cited case IDs ↔ 92 defined (0 undefined), headers 4/4 on all six docs, versions PRD 1.1 / TECH-STACK 1.0 / CONTRACT 1.0 FROZEN / DECISIONS 1.3 / PLAN **1.6** / TRACEABILITY **1.6**, TEST-CASES v0.8, test-results RUN-6.
Vercel readiness: **PASS** — `app/` is exactly `index.html` + `styles.css` + `app.js` (57,725 B); every `src`/`href` is `./…`, `data:`, or an outbound `https://wa.me/…` link; no absolute/`localhost` path, build file, package manifest, `vercel.json`, service worker, cookie, auth/password field, analytics, `fetch`, or `XMLHttpRequest`; `/`, `/index.html`, `/?customer=…`, `/?today=…`, `/?today=not-a-date` all 200; the screenshot and import flows work on a cold direct load in a fresh profile; 0 SW registrations, `document.cookie` empty, 0 console errors, 0 failed and 0 external requests.
Score risks: WIN-ANALYSIS §4 (13 rows) → PASS 13 (item 8 "screenshot quota loses the save" is now **closed**; item 9 is PASS for the entry/import date default, its overdue half is P4); item 10 stays provisional for 200 rows. WIN-PLAN §4 (18 rows) → PASS 17, DEFERRED 1 (`?today` overdue days, P4). WIN-PLAN §11 (8 rows) → PASS 8 (item 6 quota **closed**; item 7 provisional for 200 rows, P5).
Verdict: **PASS** (P3 reminder + screenshot — the last two per-customer/per-payment interactions the tester exercises are earned)
Required before re-gate: see "Required before P4" below.
Confidence / unknown about the real tester: (1) The reminder and screenshot paths are now backed by four independent batches (243 assertions) plus the Tester's five gate cases, all reading the DOM and computing expectations outside `app/`; a false PASS would need every oracle to share a wrong reading of §1.3/§1.5. (2) What cannot be known is **how the tester uploads**: `setInputFiles` on a 5.28 MB JPEG is covered, but a tester that types a path, drags a file, uploads a non-image, or uploads from a camera stream is outside the modelled set; the non-image and undecodable paths are covered because §1.5/§7 demand them. (3) The brief never says what B7 measures; I credit the screenshot half provisionally and the OCR half is P4 (D5), so the bonus figure is the least certain number in this scorecard. (4) The stored-image ceiling is 204,800 chars and one probe measured 200,795 chars, so a stricter "200 KB = 200,000 bytes" reading would see a breach that no contract node exposes (F-2).

#### CRITIC-RUN-4 — independent re-execution of the full suite

Command: `cd tests && npx playwright test` (config `workers: 1`, `retries: 0`, base `http://localhost:4173`, Chromium via `@playwright/test` 1.65.1, default 1280×800, 375×812 where a case sets it).

```
$ cd tests && npx playwright test
Running 42 tests using 1 worker

  ✓   1 [chromium] › e2e/p0-gate.spec.js:59:1 › C-23 Vercel shape: app/index.html, relative assets, no build step, no service worker (316ms)
  ✓   2 [chromium] › e2e/p0-gate.spec.js:95:1 › N-05 no service worker, cookie gate, password field, analytics, or third-party origin (249ms)
  ✓   3 [chromium] › e2e/p0-gate.spec.js:121:1 › E2E-P0-01 first paint: 19 §2 nodes resolve, data selectors are empty, customer view resolves (481ms)
  ✓   4 [chromium] › e2e/p0-gate.spec.js:148:1 › E2E-P0-02 all query-string routes render the same first paint (1.0s)
  ✓   5 [chromium] › e2e/p0-gate.spec.js:176:1 › E2E-P0-03 phone + theme baseline and offline-safe load (405ms)
  ✓   6 [chromium] › e2e/p1.spec.js:66:1 › E2E-P1-01 add customers and four entries: exact paise balances, total, amounts, rejections (596ms)
  ✓   7 [chromium] › e2e/p1.spec.js:161:1 › E2E-P1-02 reload keeps everything; a storage failure keeps the save in memory with a visible warning (520ms)
  ✓   8 [chromium] › e2e/p1.spec.js:211:1 › E2E-P1-03 row link and direct ?customer= both open the same correct view (576ms)
  ✓   9 [chromium] › e2e/p1.spec.js:249:1 › E2E-P1-04 ?today=2026-11-15 sets the default entry date and the saved data-date (333ms)
  ✓  10 [chromium] › e2e/p1.spec.js:270:1 › E2E-P1-05 375x812 with long unicode name, long unicode note, and a fractional amount (325ms)
  ✓  11 [chromium] › e2e/p1.spec.js:325:1 › E2E-P1-06 money parsing and rendering through the entry form (D4, N4) (586ms)
  ✓  12 [chromium] › e2e/p1.spec.js:384:1 › E2E-P1-07 entries with equal dates keep the newest-saved first (R4, U-04) (421ms)
  ✓  13 [chromium] › e2e/p1.spec.js:413:1 › E2E-P1-08 a later successful save clears the storage warning and persists (N5) (530ms)
  ✓  14 [chromium] › e2e/p2.spec.js:52:1 › E2E-P2-01 (C-04/C-05/C-06/C-34) sample import: 11820, 8 rows, every balance matches sample-expected.json (329ms)
  ✓  15 [chromium] › e2e/p2.spec.js:100:1 › E2E-P2-02 (I-01) a second import replaces the first shop and reload keeps the second (504ms)
  ✓  16 [chromium] › e2e/p2.spec.js:144:1 › E2E-P2-03 (C-33/I-10) malformed JSON keeps state; missing lists warn; empty arrays render an empty shop (445ms)
  ✓  17 [chromium] › e2e/p2.spec.js:191:1 › E2E-P2-04 (I-04/I-05/I-06/I-07/U-02/U-03) dedupe, unknown phone, zero entries, decorated amounts, type casing (336ms)
  ✓  18 [chromium] › e2e/p2.spec.js:282:1 › E2E-P2-05 imported sample at 375x812: no sideways scroll, balances not clipped (433ms)
  ✓  19 [chromium] › e2e/p3.spec.js:69:1 › E2E-P3-01 (C-07) reminder href for normal, &, +/%, Telugu, Devanagari, zero and negative balances (331ms)
E2E-P3-02 image sizes: original 5280583 bytes, stored 157319 chars
  ✓  20 [chromium] › e2e/p3.spec.js:138:1 › E2E-P3-02 (I-03/N-03) payment with a 3 MB+ image: thumbnail in the right entry, stored under 200 KB, survives reload (976ms)
  ✓  21 [chromium] › e2e/p3.spec.js:195:1 › E2E-P3-03 credit with an image and payment without one both save with no img[data-shot] (432ms)
  ✓  22 [chromium] › e2e/p3.spec.js:232:1 › E2E-P3-04 (I-08/N-03) quota failure saves the payment without the image and warns; a later save persists (711ms)
  ✓  23 [chromium] › e2e/p3.spec.js:290:1 › E2E-P3-05 a non-image file and an undecodable image save the entry without a photo and warn (387ms)
F-01 seed 20261117 datasets 50 :: {"shops":50,"customers":160,"entries":297,"duplicatePhoneShops":21,"negativeBalanceRows":56,"zeroBalanceRows":98,"unknownPhoneEntries":203,"unicodeNames":41,"stringAmounts":172,"missingAmounts":31,"missingTypes":27,"missingDates":64,"negativeTotalShops":17,"emptyShops":1}
  ✓  24 [chromium] › fuzz/p2-fuzz.spec.js:210:1 › F-01 50-shop fuzz: every balance and the total equal the independent computation (376ms)
  ✓  25 [chromium] › nonfunctional/p0.spec.js:10:3 › 375x812 viewport › C-20 document scrollWidth is 375 or less at empty state (212ms)
  ✓  26 [chromium] › nonfunctional/p0.spec.js:30:3 › prefers-color-scheme: dark › C-21 dark baseline keeps key nodes visible and text at >= 4.5:1 (263ms)
  ✓  27 [chromium] › nonfunctional/p0.spec.js:63:1 › C-22 no external network request on load (same-origin or data: only) (586ms)
  ✓  28 [chromium] › smoke/contract.spec.js:45:1 › C-01 #total-outstanding resolves on load with text 0 (248ms)
  ✓  29 [chromium] › smoke/contract.spec.js:54:1 › C-02 #import-box and #import-go are visible at first paint (261ms)
  ✓  30 [chromium] › smoke/contract.spec.js:61:1 › C-03 #shot-input exists inside the payment form at first paint (245ms)
  ✓  31 [chromium] › smoke/contract.spec.js:68:1 › C-09 every CONTRACT §2 node resolves and is visible before interaction (245ms)
  ✓  32 [chromium] › smoke/contract.spec.js:91:1 › C-10 #total-outstanding text and data-value are exactly 0 (bare), Rs lives in a sibling (243ms)
  ✓  33 [chromium] › smoke/contract.spec.js:114:1 › C-11 #import-box is a textarea, #import-go a button, #shot-input a file input accepting image/* (260ms)
  ✓  34 [chromium] › smoke/contract.spec.js:141:1 › C-12 #entry-type options are exactly credit and payment (261ms)
  ✓  35 [chromium] › smoke/contract.spec.js:153:1 › C-13 #lang-switch is a select with exactly en, hi, te and defaults to en (244ms)
  ✓  36 [chromium] › smoke/contract.spec.js:175:1 › C-14 #overdue heading contains Overdue and 30+ days, with an empty-state line (243ms)
  ✓  37 [chromium] › smoke/contract.spec.js:194:1 › C-15 #customers shows a visible empty-state message and no rows (243ms)
  ✓  38 [chromium] › smoke/contract.spec.js:205:1 › C-16 empty storage renders zero data-dependent nodes (263ms)
  ✓  39 [chromium] › smoke/contract.spec.js:216:1 › C-39 first paint raises no console error, failed request, or rejection (809ms)
  ✓  40 [chromium] › smoke/routes.spec.js:28:1 › C-17 ?customer=unknown renders the not-found view and keeps every list node (244ms)
  ✓  41 [chromium] › smoke/routes.spec.js:54:1 › C-18 ?today=2026-11-15 loads cleanly with the full empty-state contract (259ms)
  ✓  42 [chromium] › smoke/routes.spec.js:66:1 › C-19 invalid ?today values load cleanly and do not crash (445ms)

  42 passed (17.7s)
```

`42 = 23 P0 (C-01–C-03, C-09–C-23, C-39, N-05, E2E-P0-01–03, C-20–C-22) + 8 P1 (E2E-P1-01…08) + 5 P2 (E2E-P2-01…05) + 5 P3 (E2E-P3-01…05) + F-01`. The count and every pass/fail match RUN-6; the suite is not vacuous (RUN-6 records the mutant that leaves the reminder unencoded and stores the original image failing 3/5 P3 cases).

#### CRITIC-ADV-8 — independent P3 adversarial batch (198/198)

`node /tmp/hisaab-critic/adv-p3.js` — a standalone Playwright script that imports nothing from `app/` or `tests/`; every expected value is computed in the script from `CONTRACT.md` §1.3, §1.5, §3.3, §4, §7 and D4/D9/D10/D11. Imports set `#import-box.value` through `evaluate` (no events) and click `#import-go`.

```
ADVERSARIAL P3 CHECKS: 198/198 passed
```

| Group | Result |
|---|---|
| A. Reminder, 7 rows | Exactly 7 `a[data-remind]` elements for 7 rows, 1 per row, `data-remind` = row phone, `[data-balance]` = the value used in the message; every href starts `https://wa.me/91<phone>?text=` at index 14, contains exactly one `?`, no extra query parameter, no raw `&`/`+`/`?`/`=`/`#`; `decodeURIComponent(encoded)` contains the byte-identical full name and `Rs <rendered>`; `encodeURIComponent(decoded)` reproduces the href exactly for the normal, `&`, `+`/`%`, Telugu, Devanagari, zero and negative rows |
| B. Screenshot | 5,282,627-byte generated JPEG → stored data URL **157,435 chars (~118,059 JPEG bytes)**; exactly one `li[data-entry-id]`; exactly one `img[data-shot]`, inside that payment's entry; `src` starts `data:image/`; stored `shot` under 204,800 and above 1,000 chars; reload keeps a byte-identical `src`; `#shot-input` is a visible `input[type=file][accept="image/*"]` inside `#entry-form`; a later credit adds no image; a payment without a file has none; a credit saved while a JPEG was selected has none; exactly one entry in total carries an image, and it is the payment |
| C. Quota (all writes throw) | Payment saved while `Storage.prototype.setItem` throws: 2 entries, balance `700` in memory, 0 `img[data-shot]`, `#storage-msg` non-empty, `#entry-msg` names the screenshot; entries intact; after restoring `setItem`, a later payment is 3 entries, `#storage-msg` is empty, reload keeps 3 entries with balance and total `650` |
| D. Bad files | `text/plain` and an undecodable `image/png` each save their payment (`70`, `20`) with no image, a readable screenshot/photo warning on each, `#shot-input` visible and `#entry-save` enabled |
| E. P0–P2 regression, 375 px, Vercel shape | 19/19 §2 nodes exactly once with a non-zero box; empty total `0` and zero data-dependent nodes; sample → `11820`, 8 rows, every balance text = attribute = `sample-expected.json`; second import → 2 rows, `749.50`, no sample row, reload `749.50` and `-250.50`; malformed JSON → `Could not import`, rows and total intact; `documentElement.scrollWidth` 375 with the sample; `app/` is exactly 3 files, relative script/stylesheet, no localhost/absolute path, no SW/cookie/fetch/XHR/password/build manifest; 5 routes 200; 0 console/page/failed/external |
| Console/network | Every context above: 0 console errors, 0 page errors, 0 failed requests, 0 external requests |

Reminder evidence (each row: `links` = `a[data-remind]` count in the row):

```
9000000201 "Ravi Kumar"         670     1  Namaste Ravi Kumar, your balance is Rs 670.
9000000202 "Anna & Sons"        0       1  Namaste Anna & Sons, your balance is Rs 0.            (& -> %26)
9000000203 "Plus + Percent %"   -250.25 1  Namaste Plus + Percent %, your balance is Rs -250.25. (+ -> %2B, % -> %25)
9000000204 "రవి కుమార్"         1500.50 1  Namaste రవి కుమార్, your balance is Rs 1500.50.
9000000205 "रवि कुमार"          42      1  Namaste रवि कुमार, your balance is Rs 42.
9000000206 "Zero Balance"       0       1  Namaste Zero Balance, your balance is Rs 0.
9000000207 "Minus Twenty Five"  -250.25 1  Namaste Minus Twenty Five, your balance is Rs -250.25.
href shape, e.g. 9000000202:
https://wa.me/919000000202?text=Namaste%20Anna%20%26%20Sons%2C%20your%20balance%20is%20Rs%200.
one link per row, one '?' only, no raw & + % ? = # inside the encoded message,
decodeURIComponent(encoded) -> name + "Rs <rendered>", encodeURIComponent(decoded) === encoded
```

#### CRITIC-ADV-9 — angles the gate suite does not cover (36/36)

`node /tmp/hisaab-critic/extra-p3.js`:

```
EXTRA P3 CHECKS: 36/36 passed
```

| Probe | Evidence |
|---|---|
| F. **Size-sensitive quota** (`setItem` throws only when the payload is > 20,000 chars, i.e. only because it carries the image) | 2 entries, 0 `img[data-shot]`, `#storage-msg` and `#entry-msg` both name the photo; the persisted payload is **304 chars with 2 entries and the payment has no `shot` field** (this is the §1.5 "saved without the image" path, not just an in-memory save); after reload both entries are present, 0 images, balance `700` |
| G. Name `O'Brien 100% ? = #1` | href `https://wa.me/919000000801?text=Namaste%20O'Brien%20100%25%20%3F%20%3D%20%231%2C%20your%20balance%20is%20Rs%2099.99.` — exactly one `?`, no extra parameter, no raw `?`/`#`/`&`/`=` in the encoded message, name and `Rs 99.99` decode byte-identically, re-encoding matches |
| H. Injected stored state: a `credit` entry carrying `data:image/…` | renders 0 images; the payment entry next to it renders 1 (render guard, §1.5 last bullet) |
| I. 375×812 + `prefers-color-scheme: dark` with a thumbnail present | `scrollWidth` 375 (body 375), thumbnail right edge 258.66 px inside 375, `color-scheme: light dark`, contrast body **17.10**, customer name 17.10, heading 17.10, label **7.37** |
| J. Stored/rendered identity + stability | stored `shot` = rendered `src` byte for byte, `data:image/jpeg;base64,`, 200,795 chars (under the 204,800 budget — see F-2), `data-entry-id` and `src` identical after reload |

#### CRITIC-ADV-10 — contract probes against reload and the customer route (9/9)

`node /tmp/hisaab-critic/final-probe.js` → `FINAL P3 PROBES: 9/9 passed`: empty state has 0 `img[data-shot]`; `#shot-input` is inside `#entry-form` at load, still present and visible when `#entry-type` is `credit`; the two imported rows' reminder hrefs are byte-identical after reload; `9000001201` reads exactly `https://wa.me/919000001201?text=` + `encodeURIComponent("Namaste Stable Row, your balance is Rs 250.25.")`; `/?customer=9000001201` keeps both `a[data-remind]` links, the total `250.25`, and the entry.

#### CRITIC-ADV-11 — independent 50-shop fuzz re-run on the P3 build (1,077/1,077)

`node /tmp/hisaab-critic/fuzz-p2.js` (seed `77190345`, a different generator and a separately written oracle from the Tester's F-01; no `app/` or `tests/` import) re-executed against the P3 build:

```
FUZZ seed 77190345 datasets 50
DATASETS SUMMARY :: {"shops":50,"customers":155,"entries":202,"duplicatePhoneShops":22,
  "negativeBalanceRows":38,"zeroBalanceRows":86,"unknownPhoneEntries":93,"unicodeNames":21,
  "stringAmounts":114,"missingAmounts":10,"missingTypes":30,"missingDates":34,
  "negativeTotalShops":13,"emptyShops":3,"bigValues":7,"invalidEntries":4,
  "entryCountChecks":47,"zeroEntryRows":61,"sameDateTieShops":9,
  "negativeAmountEntries":12,"duplicateCustomerRecords":48}
FUZZ ASSERTIONS: 1077/1077 passed across 50 shops
```

The P3 code changes (reminder builder, image pipeline, persistence split) do not touch parse/normalise/balance/render: every row (text and attribute), the row set, the signed total, the machine shape and sampled entry counts still equal the independent oracle. No mismatch, no `NaN`/`undefined`, no console error.

#### Contract audit — P3 scope (43/43)

| # | CONTRACT rule | Result | Evidence |
|---|---|---|---|
| CA-P3-01 | Exactly one `a[data-remind="<phone>"]` per customer row (§1.3) | PASS | 7 rows → 7 links, 1 in each row, in ADV-8 A |
| CA-P3-02 | `href` is exactly `https://wa.me/91<phone>?text=<encodeURIComponent(message)>`, literal prefix (§1.3) | PASS | Prefix at index 14 for all 7 rows; `encodeURIComponent(decoded) === encoded` |
| CA-P3-03 | No other query parameters, no trailing characters (§1.3) | PASS | Exactly one `?`; no raw `&`; one field after `?`; punctuation-name probe (ADV-9 G) |
| CA-P3-04 | Message contains the customer's **full name** (§1.3) | PASS | Seven names byte-identical, incl. `&`, `+`, `%`, Telugu, Devanagari and punctuation |
| CA-P3-05 | Message contains the balance **rendered by §3.3 inside `Rs <rendered>`** (§1.3) | PASS | `Rs 670`, `Rs 0`, `Rs -250.25`, `Rs 1500.50`, `Rs 42`, `Rs 99.99` |
| CA-P3-06 | Works for a zero balance (§1.3) | PASS | Two zero rows render `Rs 0` and still link |
| CA-P3-07 | Works for a negative balance (§1.3) | PASS | `-250.25` → `Rs -250.25` on two rows |
| CA-P3-08 | Encoding is mandatory and correct (no raw `&`, `+`, `%`, unicode) (§1.3) | PASS | `%26`, `%2B`, `%25`, percent-encoded unicode; decode/re-encode round-trip |
| CA-P3-09 | The row's `[data-balance]` equals the value used in the message (§1.3) | PASS | Read from the same row and compared for all 7 |
| CA-P3-10 | Reminder survives reload and the `?customer=` route (§1.3, §1.7) | PASS | Byte-identical hrefs after reload; both links and the total survive the customer route |
| CA-P3-11 | `data-remind` equals the normalised row phone (§1.3) | PASS | `data-remind` = `[data-customer]` = the phone inside the href |
| CA-P3-12 | `#shot-input` is a real `input[type=file]` on the payment form **present at load** (§1.5) | PASS | C-03/C-11 green; own probe counts 1 at first paint |
| CA-P3-13 | Not created on click; not removed when the entry type is `credit` (§1.5) | PASS | Present with empty storage; still 1 and visible after selecting `credit`; static across four saves |
| CA-P3-14 | After saving a payment that carried an image, **that** entry renders `img[data-shot]` inside the same `[data-entry-id]` (§1.5) | PASS | 1 image, inside the payment id; 3 other entries have none |
| CA-P3-15 | The image `src` is a `data:` URL (§1.5) | PASS | `data:image/jpeg;base64,…` |
| CA-P3-16 | `img[data-shot]` scope: exactly one, correct entry, none elsewhere (§1.5) | PASS | Global count 1; correct id; credit/payment-no-file/credit-with-file all 0 |
| CA-P3-17 | Downscaled before storage: 800 px long edge, JPEG quality ladder 0.7–0.4 (TECH-STACK S8) | PASS | `app.js:529–548` scales by `min(1, 800 / max(w,h))` and walks 800px at 0.7/0.6/0.5/0.4; 5.28 MB → 157,435 chars |
| CA-P3-18 | Stored `data:` URL under the 204,800-character budget (§1.5, E2E-P3-02 oracle) | PASS | 157,319 (RUN-6), 157,435 (ADV-8), 200,795 (ADV-9 J) — all < 204,800; ceiling note F-2 |
| CA-P3-19 | Quota: the entry is still saved without the image, `img[data-shot]` absent, readable warning (§1.5) | PASS | All-writes-throw path: 2 entries, 0 images, `#storage-msg` + `#entry-msg` warn |
| CA-P3-20 | Quota when only the image-bearing payload fails: the retry persists the entry (§1.5) | PASS | Size-sensitive path: 304-char payload, 2 entries, payment stored with no `shot`, reload keeps both |
| CA-P3-21 | The warning is readable and names the screenshot/photo (§1.5) | PASS | "The payment screenshot could not be stored; the entry was saved without the photo." |
| CA-P3-22 | The save must never be aborted because of the image (§1.5) | PASS | Entry + balance in memory under a full failure; persisted under the image-only failure |
| CA-P3-23 | `img[data-shot]` never appears on entries saved without an image (§1.5) | PASS | Payment with no file → 0; credit with a file selected → 0 |
| CA-P3-24 | A `credit` entry never carries a screenshot (§1.5) | PASS | Credit-with-image save → 0; hand-injected stored credit shot → 0 (ADV-9 H) |
| CA-P3-25 | A non-image file saves the entry without a photo and warns (§1.5, PLAN P3) | PASS | `text/plain` → payment `70`, no image, warning, no console error |
| CA-P3-26 | An undecodable `image/*` file saves the entry without a photo and warns (§1.5, PLAN P3) | PASS | Broken PNG → payment `20`, no image, warning, `#entry-save` enabled |
| CA-P3-27 | Stored shot = rendered src; entry id stable across reload (§1.5, §1.8) | PASS | Byte-identical src and `data-entry-id` after reload (ADV-9 J) |
| CA-P3-28 | `#entry-save` is never disabled by image processing (§1.5, §1.9) | PASS | Enabled after every success and every failure path |
| CA-P3-29 | §7 assumption: the tester may upload a **multi-megabyte** image with `setInputFiles` | PASS | 5,282,627 B uploaded; one image rendered under budget |
| CA-P3-30 | §7 assumption: reads happen with DOM APIs and a first-match number pattern | PASS | Every value read via `evaluate`/locators; machine nodes still bare (§3.3) |
| CA-P3-31 | §7 assumption: reloads after the save | PASS | Image, entry id, balance and total stable after `reload()` |
| CA-P3-32 | §7 assumption: imports twice in one tab (the image path must not disturb replace) | PASS | Replace probe 2 rows/`749.50`; fuzz re-run 1,077/1,077 |
| CA-P3-33 | §7/§6: no network, no service worker, no console error on the scored path | PASS | 0 SW registrations, 0 external/failed requests, 0 console/page errors in every context |
| CA-P3-34 | 19 `§2` nodes resolve exactly once and are visible at first paint | PASS | Own first-paint probe 19/19; C-09/E2E-P0-01 green |
| CA-P3-35 | Empty storage: 0 data-dependent nodes, `#total-outstanding` `0` | PASS | 0 rows/reminders/shots/entries; C-16 green |
| CA-P3-36 | Sample import: `11820`, 8 rows, every balance = `sample-expected.json` | PASS | Text = attribute for all 8; expected-file sum self-check |
| CA-P3-37 | A second import replaces; reload keeps the second shop | PASS | 2 rows, `749.50`, `-250.50`; no sample row survives |
| CA-P3-38 | Malformed import keeps prior state and reports it | PASS | `Could not import`, 2 rows, `749.50` intact |
| CA-P3-39 | 375 px with the sample | PASS | `documentElement.scrollWidth` 375, body 375 |
| CA-P3-40 | 375 px + dark with a thumbnail (P3 adds the image, so re-measured) | PASS | 375/375, thumbnail inside the viewport, body 17.10, label 7.37 |
| CA-P3-41 | Machine nodes unchanged by the P3 work | PASS | Bare values, text = attribute, reminders and totals exact after reload |
| CA-P3-42 | Vercel shape (`app/` only, relative, no build/auth/cookies/SW) | PASS | 3 files, 57,725 B, relative script/stylesheet, no build manifest, 5 routes 200 |
| CA-P3-43 | No console error, failed request or external request in any inspected context | PASS | All six contexts; runtime SW/cookie probe empty |

**`CONTRACT-<n>` deviations at P3: none.** Deferred by plan and therefore not G3 failures:

- **P4 / B1–B7:** overdue rows + `[data-days]`, edit/delete buttons inside entry rows, `#export-csv` downloads, `#search` filtering, `a[href^="upi://pay?pa="]`, `#lang-switch` translation, OCR prefill on `#shot-input` (§5.6).
- **P5 / P6:** 200-row + long-unicode + thumbnail responsive audit, full dark-mode and tap-target audit, 200-shop fuzz (F-02).

#### Doc sync — output

```
$ grep -o 'R-[0-9]\+' docs/PRD.md | sort -u | wc -l                  → 0   (literal AGENTS.md §4 regex is vacuous)
$ grep -oE '\b[RNB][0-9]+' docs/PRD.md | sort -u | wc -l            → 23
$ comm -23 /tmp/critic_r /tmp/critic_p   (PRD IDs missing from PLAN) → (empty)  0
$ comm -23 /tmp/critic_r /tmp/critic_t   (PRD IDs missing from TRACE)→ (empty)  0
$ comm -13 /tmp/critic_r /tmp/critic_p ; comm -13 /tmp/critic_r /tmp/critic_t → (empty)  0 extra
$ grep -o '`[#\[][^`]*`' docs/CONTRACT.md | tr -d '`' | sort -u | wc -l → 29
$ while read sel; do grep -qF "$sel" docs/TEST-CASES.md || echo "UNTESTED: $sel"; done < /tmp/critic_sels
                                                                     → (no output) 29/29
$ grep -nE 'TBD|TODO|\(Planner\)' docs/{PRD,TECH-STACK,IMPLEMENTATION-PLAN,CONTRACT,DECISIONS,TRACEABILITY}.md
                                                                     → none
traceability rows                                                    → rows=23, with_phase=23, bad=none
E2E-P3-01…05                                                         → 5/5 defined in TEST-CASES.md v0.8,
                                                                       5/5 cited in TRACEABILITY.md v1.6,
                                                                       5/5 implemented in tests/e2e/p3.spec.js,
                                                                       PLAN v1.6 cites the range `E2E-P3-01–05`
C-38                                                                 → row phase P4, "runs at" P4 (OCR remains P4, D5)
traceability case IDs                                                → 92 cited, 92 defined, 0 undefined
case rows in TEST-CASES.md                                           → 92
headers                                                              → 4/4 (Version, Updated, Owner, Supersedes) on all six docs
removed-ID scan (R11+/B8+/N7+)                                       → none in PRD/PLAN/TRACEABILITY/TEST-CASES/CONTRACT
```

Versions this gate: PRD **1.1**, TECH-STACK **1.0**, CONTRACT **1.0 — FROZEN at gate G0** (unchanged since G0), DECISIONS **1.3**, IMPLEMENTATION-PLAN **1.6**, TRACEABILITY **1.6**; all `Updated: 2026-11-17`. TEST-CASES v0.8 and test-results RUN-6 are Tester-owned and consistent with the plan. The P3 change is doc-sync only (Plan P3 gate suite + traceability rows); no CONTRACT change, so no human gate.

#### Vercel readiness — PASS

- Deployable set is exactly `app/index.html` (6,108 B), `app/styles.css` (7,510 B), `app/app.js` (44,107 B) — 57,725 B total. No `package.json`, lockfile, manifest, bundler config, `dist/`, `build/`, `assets/`, or `vercel.json` in `app/`; no build step.
- Every `src`/`href` is relative or `data:` (`./styles.css`, `./app.js`, `./`, `data:,`); 0 absolute or `localhost` paths. The only absolute URLs are outbound `https://wa.me/…` reminder links, which produce no request.
- No `serviceWorker` (0 registrations at runtime), no `document.cookie` (empty), no password input, no auth gate, no analytics, no `fetch`, no `XMLHttpRequest`, no third-party origin in `app/`.
- Direct loads: `/`, `/index.html`, `/?customer=9000000101`, `/?today=2026-11-15`, `/?today=not-a-date` → HTTP 200. The screenshot and import flows both work from a cold direct load in a fresh profile.
- Fresh contexts throughout CRITIC-ADV-8/9/10/11: 0 console errors, 0 page errors, 0 failed requests, 0 external requests.

#### Score-risk review — WIN-ANALYSIS §4 and WIN-PLAN §4/§11

WIN-ANALYSIS §4 (why we may lose), P3 build:

| # | Failure mode | Status | Evidence |
|---|---|---|---|
| 1 | Selector missing / renamed / conditional | **PASS** | 19/19 §2 nodes; rows, reminders, entries, images all resolve |
| 2 | Tester reads before first paint | **PASS for §2 and shells** | static ids at first paint; rows are post-import by design |
| 3 | `.value` set without events; app reads state | **PASS** | every import in ADV-8/9 set `.value` directly and was honoured |
| 4 | Import merges instead of replaces | **PASS** | replace probe; 50 fuzz shops exact |
| 5 | Punctuation/commas/₹ in machine nodes | **PASS** | bare regex on every machine node in every probe |
| 6 | Zero-balance / unknown-phone rows dropped | **PASS** | zero rows link with `Rs 0`; `Customer <phone>` counted |
| 7 | Float money | **PASS** | `250.25`, `-250.25`, `1500.50`, `99.99` exact; independent integer oracle |
| 8 | Screenshot quota loses the save | **PASS (closed at P3)** | all-throws keeps the entry in memory; size-sensitive retry persists it without the photo |
| 9 | `?today=` ignored | **PASS** for entry/import defaults; overdue days are P4 | blank dates → `2026-11-15`; overdue rows are P4 |
| 10 | Sideways scroll / unreadable dark | **PASS, provisional** | 375/375 with sample and thumbnail; dark 17.10 / 7.37 with a thumbnail; 200-row audit is P5 |
| 11 | `[data-customer]` count ≠ customer count | **PASS** | row set = key set in 50 shops; no filter at load |
| 12 | Virtualised / paginated list | **PASS** | every row in `#customers` |
| 13 | No harness | **PASS** | 42-test suite + 243 independent assertions + 1,077 fuzz assertions |

WIN-PLAN §4 edge-case matrix — PASS at P3: zero-entry customer; overpayment → negative; same name/different phones; duplicate phone; unknown phone; `"1,500"`/`"Rs 1500"`; `type` casing; same-date entries; future-dated entry; empty note; large numbers; unicode names; `entries: []`; malformed JSON; import twice; reload after import; **3 MB screenshot (now green: 5.28 MB → 157,435 chars, image on the right entry, survives reload)**. **DEFERRED:** `?today` overdue/days-since (P4).

WIN-PLAN §11 (if we lose), P3 build:

| # | Cause | P3 status |
|---|---|---|
| 1 | Import merging instead of replacing | **PASS** |
| 2 | Punctuation in `#total-outstanding` | **PASS** |
| 3 | Dropping zero-entry / unknown-phone rows | **PASS** |
| 4 | Contract nodes rendered after a delay | **PASS** (§2 + customer shells static) |
| 5 | Float money | **PASS** |
| 6 | Screenshot upload fails on quota | **PASS (closed)** |
| 7 | Sideways scroll at 375 from a table/long name/image | **PASS with the sample and a thumbnail**; 200-row pass is P5 |
| 8 | No harness | **PASS** |

The 10 phone/theme marks are earned provisionally with the graded flow plus a thumbnail (375×812, light and dark). P5 must still audit 200 rows, 100-character unicode notes, tap targets and a full dark-mode contrast sweep before the final gate.

#### G3 gate checklist (PLAN §4)

- [x] **Tester RUN id present with commands and evidence** — RUN-6: `cd tests && npx playwright test` → 42/42, the five P3 cases with exact expectations, measured image sizes (5,280,583 B → 157,319 chars), and a non-vacuity mutant failing 3/5 P3 cases.
- [x] **Phase acceptance 100%, regression 100%** — E2E-P3-01…05 5/5 green in RUN-6 and CRITIC-RUN-4; P0 23/23, P1 8/8, P2 5/5 and F-01 green in the same run; every PLAN P3 acceptance bullet independently verified (exact href/encoding incl. `&`/`+`/`%`/unicode/zero/negative, `img[data-shot]` in the right entry, reload, downscale, quota with and without an image-only failure, credit/no-image, non-image/undecodable).
- [x] **No open P0/P1** — none filed (RUN-1…6) and none found by ADV-8/9/10/11. The findings below are process and residual-risk notes, not P0/P1 defects.
- [x] **Contract audit 100%** — 43/43 P3-observable items; 0 `CONTRACT-<n>`; deferred P4/P5 items named and owned.
- [x] **Doc sync check passes** — output pasted above: 23/0/0 IDs, 29/29 selectors, 0 TBD, 23/23 rows phased, E2E-P3 5/5 defined+cited, 92/92 case IDs, headers 4/4.
- [x] **Critic scorecard written; model score not lower than the previous gate** — 75/100 provisional (floor 70/100 with B7 = 0) vs 70/100 at G2.
- [x] **`worklog.md` entry with `Next:`** — the latest entry (00:20, Planner) ends `Next: Critic G3`; the Orchestrator must append the G3 gate entry ending `Next: P4 — Coder` after this scorecard is recorded.

**Verdict: PASS.**

#### Findings / notes (none blocks G3; no veto raised)

- **F-1 [process]** The P3 build is uncommitted: HEAD is `cccb4d6` (tag `g2`), `app/app.js` and `app/styles.css` are modified, and `tests/e2e/p3.spec.js` is untracked. The Orchestrator should commit and tag `g3` so the graded build is reproducible; the checksums above pin it for this scorecard. A stray root `.DS_Store` is untracked and outside `app/` (it is not deployed).
- **F-2 [risk, non-blocking]** The stored-image acceptance ceiling is 204,800 chars (`SHOT_TARGET_CHARS = 200 * 1024`). A 1,200×900 noise JPEG compressed at the top rung (800 px, q0.7) measured **200,795 chars**: under the documented 204,800 budget and under 200 KiB, but above a strict "200 KB = 200,000 bytes" reading. No contract node exposes the stored size and the graded flow only reads `img[data-shot]`, so no mark is at risk; if the team wants margin, lower the acceptance ceiling in P6 (no contract change).
- **F-3 [residual edge, non-blocking]** Only a hand-injected `localStorage` payload can put a `shot` on a `credit` entry; the UI never does, the save path strips it, and the render guard drops it (ADV-9 H). No action needed.
- **F-4 [non-contract hooks]** `#entry-msg` and `#storage-msg` remain Coder test/UI hooks, not contract nodes. CONTRACT §1.5 only requires "a readable warning is shown", and both are visible text lines; the import status still uses the contract node `#import-msg`.
- **F-5 [scope, by plan]** OCR (B7's amount reading, C-38), edit/delete, CSV, search filtering, overdue rows, UPI, language translation are P4. Deferred, not G3 failures.
- **F-6 [note]** `img[data-shot]` carries `loading="lazy"`; the `src` attribute is set at render, so an attribute read is unaffected, and the image is in the viewport in the entry list. P5's screenshot audit should still confirm the thumbnail paints (not just resolves) at 200 rows.
- **F-7 [doc note]** TRACEABILITY rows cite cases that run at gates other than the row's owning phase (N3→E2E-P3-02/04, N5→E2E-P3-04, R7→E2E-P3-02, B7→E2E-P3-*). This is the pre-existing pattern (R4 already cites E2E-P0-02): the Phase column is the owning phase and the case list spans gates. Not a G3 sync failure; the Planner may clarify the wording at P4.

#### Required before P4

1. Orchestrator: append the G3 gate entry to `worklog.md` with `Next: P4 — Coder`; commit and tag the P3 build (`669c644f…`, `291bc99c…`, `3049401a…`).
2. Coder (P4): implement B1–B7. OCR must be a progressive no-op when unavailable, must prefill `#entry-amount` only when empty, and must never block `#entry-save` or disturb `#shot-input`; B1–B6 must not hide, rename or duplicate any contract node.
3. Tester (P4): `C-38` plus one scripted check per bonus item, screenshot evidence for overdue ordering, CSV content, UPI href, language labels and OCR; re-run the full suite (42 + new) and file any P0/P1 before the gate.
4. Planner: map B1–B7 to the P4 cases, bump the plan/traceability versions, and confirm the B7 wording so the provisional 5 becomes either a full 5 (OCR works) or 0.
5. Optional (P6): lower the stored-image ceiling for margin and record the 200 KB interpretation (F-2); clarify the traceability phase/case wording (F-7).
6. Keep the P3 guarantees green: 42/42, exact reminder encoding for every row, `img[data-shot]` only on the image-bearing payment, quota paths that never abort the save, 375 px and dark with a thumbnail.

#### Confidence / unknown about the real tester

- Four independent batches (243 assertions) plus the Tester's five cases now cover both P3 interactions, and the 60 hidden-data marks are re-backed by a 1,077-assertion fuzz on this exact build. A false PASS would need every oracle to share a wrong reading of §1.3/§1.5.
- The real tester's **upload mechanics** are the largest unknown: `setInputFiles` with a JPEG, a text file and an undecodable PNG is covered; a drag-and-drop, a camera-capture stream, or a path typed into the input is not modelled.
- **B7 is the least certain number here**: the brief's bonus is "reading the amount from the payment screenshot"; only the screenshot save/thumbnail path exists, so the 5 is provisional and the OCR prefill is P4. The 70/100 floor is the number I would defend without that provisional credit.
- D4's exact-paise rendering and D10's `Customer <phone>` rows remain the highest-impact accepted choices for the hidden-data block; neither is exercised differently by P3.

### GATE G4 | 2026-11-17 | phase P4

Build: uncommitted working tree at `/Users/akanse/Documents/FWAIProjects/batch10/hisaasb`, served by `python3 -m http.server 4173 --directory app` (PID 65074) from that directory; SHA-256 `app/index.html bd38d3cedfef…` (7,794 B), `app/styles.css 196813901119…` (8,705 B), `app/app.js b8d2194ea4f5…` (71,079 B); deployable total **87,578 B**; mtimes 17:57–18:06. These are exactly RUN-7/RUN-8's handoff checksums, so the audited build is the tested build. Git HEAD is `87c99ee` ("feat: P3 reminder and screenshot, G3 gate", tag `g3`), `app/*` are modified against it and `tests/e2e/p4.spec.js` is untracked, so the P4 build is uncommitted and untagged — the checksums pin it (F-1).
Runs cited: RUN-7, RUN-8 (Tester), **CRITIC-RUN-5** (full-suite re-run), **CRITIC-ADV-12…24** (13 independent batches, `/tmp/hisaab-g4/*.js` plus the G2/G3 fuzz and P3 batches re-executed on this build). No script imports `app/**` or any `tests/**` helper; every expected value is computed in the script from `sample-data.json`, `sample-expected.json` and `CONTRACT.md` §1.2/§1.8/§3.3/§4/§5.
Hidden-data: **60/60** | Bonus: **30/30** (B1 5, B2 5, B3 5, B4 5, B5 5, B6 5, B7 **0** — the six best count, so the block is 30 either way) | Phone/theme: **10/10** (provisional; P5 still owes the 200-row/adversarial/tap-target/full-dark sweep)
MODEL SCORE: **100/100** (provisional; up from G0 5, G1 10, G2 70, G3 75 → "not lower than the previous gate" holds. G4 does **not** require the final ≥95, but the build meets it provisionally; P5/P6 must not regress it)
Deductions:
- Hidden-data: **none.** No failed assertion in the 49-case suite or the 1,077-assertion independent fuzz (seed `77190345`, 50 shops). Of the 432 new adversarial assertions, 430 pass; the only two red lines are the B6 **placeholder** checks, recorded as F-2, which are not contract assertions and cost no hidden-data marks. `60 × 0/total = 0`.
- Bonus: **none.** B1–B6 each earn 5 on a scripted, DOM-read check. **B7 is 0, declared failed, not faked:** no OCR engine ships (D5), so the amount is never read from the screenshot; the PRD/D5 manual fallback is verified (upload never blocks or overwrites, save works, zero console errors) but the brief's bonus is *reading the amount*, and I do not award 5 for the fallback. Because six of seven count, B7's 0 costs nothing: best six = B1–B6 = 30/30. (Under the alternative reading — PRD B7's "or the entry saves with the manually entered value" clause makes the fallback sufficient — B7 would be 5 and B1–B6 would still be the counted six; the bonus block is 30/30 either way.)
- Phone/theme: **none at G4**, provisional. 375×812 `scrollWidth` is 375 with the sample and with long-unicode names + 100-char unbroken notes + `250000.50`; dark contrast is body 17.10, total 15.73, balance/name/overdue-days 14.40, labels/demo note 6.78 (all ≥ 4.5:1 text / 3:1 label). P5 must still audit 200 rows, tap targets, clipping and the sticky bar.
Contract audit: **59/59 P4-observable items pass**, 0 `CONTRACT-<n>` deviations (table below). No §1/§2 node was moved, renamed, hidden, duplicated or re-rendered late; the 19 §2 nodes still resolve exactly once and visibly at first paint in every language. P5/P6 items are named as deferred, not G4 failures.
Doc sync: **PASS** — literal `R-` check vacuous (0/0/0), corrected `[RNB][0-9]+` **23 IDs, 0 missing / 0 extra** in PLAN and TRACEABILITY, **29/29** contract selector tokens tested, **0** `TBD`/`TODO`/`(Planner)`, **23/23** traceability rows phased, **E2E-P4-01…07 7/7 defined + 7/7 cited + 7/7 implemented**, B7 fallback noted in TRACEABILITY and PLAN, **99 cited case IDs ↔ 99 defined, 0 undefined / 0 uncited**, headers **4/4** on all six docs, versions PRD **1.1** / TECH-STACK **1.0** / CONTRACT **1.0 FROZEN** / DECISIONS **1.3** / PLAN **1.7** / TRACEABILITY **1.7**, TEST-CASES **0.9**, results RUN-7/RUN-8. No removed R-ID is referenced.
Vercel readiness: **PASS** — `app/` is exactly `index.html` + `styles.css` + `app.js` (87,578 B); every `src`/`href` is `./…`, `./`, `data:,` or an outbound `https://wa.me/…`/`upi://` link; no localhost/absolute path, build file, package manifest, `vercel.json`, service worker, cookie, password field, analytics, `fetch` or `XMLHttpRequest`; `/`, `/index.html`, `/?customer=…`, `/?today=…`, `/?today=not-a-date` all 200; 0 SW registrations, `document.cookie` empty, 0 console/page errors, 0 failed and 0 external requests in every fresh context.
Score risks: WIN-ANALYSIS §4 (13 rows) → **PASS 13** (item 9 "`?today=` ignored" is now **closed** — overdue days/order verified; item 10 stays provisional for 200 rows). WIN-PLAN §4 (18 rows) → **PASS 18** (the last deferred row, `?today=2026-11-15` overdue/days-since, is green). WIN-PLAN §11 (8 rows) → **PASS 8** (item 7 provisional for 200 rows, P5).
Verdict: **PASS**
Required before re-gate: see "Required before P5" below.
Confidence / unknown about the real tester: (1) The P4 surfaces are backed by 1,743 independent assertions on this exact build (432 new + 1,077 fuzz + 198 + 36 re-run) plus the 49-case suite; a false PASS would need every oracle to share a wrong reading of §5.2/§5.3/§5.4/§5.5. (2) What cannot be known is **how strictly B6 is screenshot-diffed**: all `<label>` elements, headings, buttons, empty states and `#upi-demo-note` translate, but input **placeholders** stay English (F-2); a grader that compares every visible string could call B6 partial (2–3 marks → 97–98/100, still above the final 95 floor). (3) **B7 is scored 0**, so the bonus total does not depend on whether the hidden tester scripts the prefill or accepts the fallback; if it requires prefill, nothing changes because B7 is already the dropped seventh. (4) The D1 no-payment exclusion and D2 signed-net total remain the hidden-data assumptions most likely to differ from an independent grader; both are stated in the visible overdue label and the judges' note.

#### CRITIC-RUN-5 — independent re-execution of the full suite

Command: `cd tests && npx playwright test` (config `workers: 1`, `retries: 0`, base `http://localhost:4173`, Chromium via `@playwright/test` 1.65.1, default 1280×800, 375×812 where a case sets it, locale `en-IN`, `Asia/Kolkata`).

```
$ cd tests && npx playwright test
Running 49 tests using 1 worker

  ✓   1 [chromium] › e2e/p0-gate.spec.js:59:1 › C-23 Vercel shape: app/index.html, relative assets, no build step, no service worker (319ms)
  ✓   2 [chromium] › e2e/p0-gate.spec.js:95:1 › N-05 no service worker, cookie gate, password field, analytics, or third-party origin (248ms)
  ✓   3 [chromium] › e2e/p0-gate.spec.js:121:1 › E2E-P0-01 first paint: 19 §2 nodes resolve, data selectors are empty, customer view resolves (462ms)
  ✓   4 [chromium] › e2e/p0-gate.spec.js:148:1 › E2E-P0-02 all query-string routes render the same first paint (1.0s)
  ✓   5 [chromium] › e2e/p0-gate.spec.js:176:1 › E2E-P0-03 phone + theme baseline and offline-safe load (416ms)
  ✓   6 [chromium] › e2e/p1.spec.js:66:1 › E2E-P1-01 add customers and four entries: exact paise balances, total, amounts, rejections (578ms)
  ✓   7 [chromium] › e2e/p1.spec.js:161:1 › E2E-P1-02 reload keeps everything; a storage failure keeps the save in memory with a visible warning (520ms)
  ✓   8 [chromium] › e2e/p1.spec.js:211:1 › E2E-P1-03 row link and direct ?customer= both open the same correct view (559ms)
  ✓   9 [chromium] › e2e/p1.spec.js:249:1 › E2E-P1-04 ?today=2026-11-15 sets the default entry date and the saved data-date (353ms)
  ✓  10 [chromium] › e2e/p1.spec.js:270:1 › E2E-P1-05 375x812 with long unicode name, long unicode note, and a fractional amount (348ms)
  ✓  11 [chromium] › e2e/p1.spec.js:325:1 › E2E-P1-06 money parsing and rendering through the entry form (D4, N4) (587ms)
  ✓  12 [chromium] › e2e/p1.spec.js:384:1 › E2E-P1-07 entries with equal dates keep the newest-saved first (R4, U-04) (417ms)
  ✓  13 [chromium] › e2e/p1.spec.js:413:1 › E2E-P1-08 a later successful save clears the storage warning and persists (N5) (550ms)
  ✓  14 [chromium] › e2e/p2.spec.js:52:1 › E2E-P2-01 (C-04/C-05/C-06/C-34) sample import: 11820, 8 rows, every balance matches sample-expected.json (331ms)
  ✓  15 [chromium] › e2e/p2.spec.js:100:1 › E2E-P2-02 (I-01) a second import replaces the first shop and reload keeps the second (500ms)
  ✓  16 [chromium] › e2e/p2.spec.js:144:1 › E2E-P2-03 (C-33/I-10) malformed JSON keeps state; missing lists warn; empty arrays render an empty shop (446ms)
  ✓  17 [chromium] › e2e/p2.spec.js:191:1 › E2E-P2-04 (I-04/I-05/I-06/I-07/U-02/U-03) dedupe, unknown phone, zero entries, decorated amounts, type casing (335ms)
  ✓  18 [chromium] › e2e/p2.spec.js:282:1 › E2E-P2-05 imported sample at 375x812: no sideways scroll, balances not clipped (437ms)
  ✓  19 [chromium] › e2e/p3.spec.js:69:1 › E2E-P3-01 (C-07) reminder href for normal, &, +/%, Telugu, Devanagari, zero and negative balances (331ms)
E2E-P3-02 image sizes: original 5280583 bytes, stored 157319 chars
  ✓  20 [chromium] › e2e/p3.spec.js:138:1 › E2E-P3-02 (I-03/N-03) payment with a 3 MB+ image: thumbnail in the right entry, stored under 200 KB, survives reload (979ms)
  ✓  21 [chromium] › e2e/p3.spec.js:195:1 › E2E-P3-03 credit with an image and payment without one both save with no img[data-shot] (437ms)
  ✓  22 [chromium] › e2e/p3.spec.js:232:1 › E2E-P3-04 (I-08/N-03) quota failure saves the payment without the image and warns; a later save persists (696ms)
  ✓  23 [chromium] › e2e/p3.spec.js:290:1 › E2E-P3-05 a non-image file and an undecodable image save the entry without a photo and warn (385ms)
  ✓  24 [chromium] › e2e/p4.spec.js:131:1 › E2E-P4-01 (C-14/C-28) overdue: 4 sample rows in day order, bare data-days, no data-customer, no-payment excluded, empty state (485ms)
  ✓  25 [chromium] › e2e/p4.spec.js:208:1 › E2E-P4-02 (C-36) edit 500->800 and delete: amounts, balances, total, id, image, reload, other customer untouched (722ms)
  ✓  26 [chromium] › e2e/p4.spec.js:288:1 › E2E-P4-03 (C-29) CSV export: exact headers, one row each, newest-first entries, RFC-4180 quoting, current state (387ms)
  ✓  27 [chromium] › e2e/p4.spec.js:370:1 › E2E-P4-04 (C-30) search filters by name and phone, keeps total and state, restores on clear and reload (502ms)
  ✓  28 [chromium] › e2e/p4.spec.js:410:1 › E2E-P4-05 (C-35) UPI pay links: one per row, am = max(balance,0), cu=INR once, tn decodes, default and shop VPA (381ms)
  ✓  29 [chromium] › e2e/p4.spec.js:475:1 › E2E-P4-06 (C-13/N-06) language switch translates labels and leaves every id, attribute, name, date, money text and href byte-identical (594ms)
  ✓  30 [chromium] › e2e/p4.spec.js:599:1 › E2E-P4-07 (C-38) OCR fallback: upload does not block or overwrite; manual amount saves (3.5s)
F-01 seed 20261117 datasets 50 :: {"shops":50,"customers":160,"entries":297,"duplicatePhoneShops":21,"negativeBalanceRows":56,"zeroBalanceRows":98,"unknownPhoneEntries":203,"unicodeNames":41,"stringAmounts":172,"missingAmounts":31,"missingTypes":27,"missingDates":64,"negativeTotalShops":17,"emptyShops":1}
  ✓  31 [chromium] › fuzz/p2-fuzz.spec.js:210:1 › F-01 50-shop fuzz: every balance and the total equal the independent computation (397ms)
  ✓  32 [chromium] › nonfunctional/p0.spec.js:10:3 › 375x812 viewport › C-20 document scrollWidth is 375 or less at empty state (214ms)
  ✓  33 [chromium] › nonfunctional/p0.spec.js:30:3 › prefers-color-scheme: dark › C-21 dark baseline keeps key nodes visible and text at >= 4.5:1 (248ms)
  ✓  34 [chromium] › nonfunctional/p0.spec.js:63:1 › C-22 no external network request on load (same-origin or data: only) (577ms)
  ✓  35 [chromium] › smoke/contract.spec.js:45:1 › C-01 #total-outstanding resolves on load with text 0 (254ms)
  ✓  36 [chromium] › smoke/contract.spec.js:54:1 › C-02 #import-box and #import-go are visible at first paint (266ms)
  ✓  37 [chromium] › smoke/contract.spec.js:61:1 › C-03 #shot-input exists inside the payment form at first paint (248ms)
  ✓  38 [chromium] › smoke/contract.spec.js:68:1 › C-09 every CONTRACT §2 node resolves and is visible before interaction (247ms)
  ✓  39 [chromium] › smoke/contract.spec.js:91:1 › C-10 #total-outstanding text and data-value are exactly 0 (bare), Rs lives in a sibling (248ms)
  ✓  40 [chromium] › smoke/contract.spec.js:114:1 › C-11 #import-box is a textarea, #import-go a button, #shot-input a file input accepting image/* (244ms)
  ✓  41 [chromium] › smoke/contract.spec.js:141:1 › C-12 #entry-type options are exactly credit and payment (266ms)
  ✓  42 [chromium] › smoke/contract.spec.js:153:1 › C-13 #lang-switch is a select with exactly en, hi, te and defaults to en (264ms)
  ✓  43 [chromium] › smoke/contract.spec.js:175:1 › C-14 #overdue heading contains Overdue and 30+ days, with an empty-state line (262ms)
  ✓  44 [chromium] › smoke/contract.spec.js:194:1 › C-15 #customers shows a visible empty-state message and no rows (263ms)
  ✓  45 [chromium] › smoke/contract.spec.js:205:1 › C-16 empty storage renders zero data-dependent nodes (267ms)
  ✓  46 [chromium] › smoke/contract.spec.js:216:1 › C-39 first paint raises no console error, failed request, or rejection (829ms)
  ✓  47 [chromium] › smoke/routes.spec.js:28:1 › C-17 ?customer=unknown renders the not-found view and keeps every list node (263ms)
  ✓  48 [chromium] › smoke/routes.spec.js:54:1 › C-18 ?today=2026-11-15 loads cleanly with the full empty-state contract (261ms)
  ✓  49 [chromium] › smoke/routes.spec.js:66:1 › C-19 invalid ?today values load cleanly and do not crash (449ms)

  49 passed (24.5s)
```

`49 = 23 P0 + 8 P1 + 5 P2 + 5 P3 + 7 P4 + F-01`. The count and every pass/fail match RUN-7/RUN-8. The P4 cases are not vacuous: RUN-7 records mutants (overdue threshold 30→45, CSV header typo, `am` = raw balance) that each fail the matching E2E-P4 case, and RUN-8 records the pre-fix `#upi-demo-note` mutant failing E2E-P4-06.

#### CRITIC-ADV-12 — B1 overdue (25/25)

`node /tmp/hisaab-g4/b1.js` — oracle computed in-script from `sample-data.json` (balance > 0; latest **payment** ≥ 30 days before `?today`; no-payment excluded; ties by name ascending).

```
--- B1 OVERDUE ---
NOTE sample rows: 9000000105/61 "Prakash Rao", 9000000104/44 "Anjali Reddy", 9000000108/43 "Kavitha S", 9000000102/42 "Sunita Devi"
B1 OVERDUE: 25/25 assertions passed
```

- `/?today=2026-11-15` with the sample → exactly **4** `li[data-overdue]`, order `9000000105/61, 9000000104/44, 9000000108/43, 9000000102/42`, identical to the independent calendar oracle.
- Every `[data-days]` is `^\d+$` and its **text equals its attribute**; heading text contains `Overdue` and `30+ days`; **0** `#overdue [data-customer]`; `#overdue-empty` hidden with rows, visible with text when empty; no reminder/UPI controls inside `#overdue`.
- List identical after reload (persistence + `?today`), and stable across a re-read.
- Boundary shop under the same `?today`: a payment on `2026-10-16` (**30** days) is listed; `2026-10-17` (**29**) is not; a customer with credit only (no payment) is not; a zero balance and a future-dated payment are not.
- Tie probe: three customers at the same day count → `alpha, Beta, Zebra` (name ascending, case-insensitive).
- Empty storage at first paint → 0 rows and a visible `#overdue-empty`; heading still `Overdue (30+ days)`.

#### CRITIC-ADV-13 — B2 edit/delete (36/36)

`node /tmp/hisaab-g4/b2.js` — two customers, a payment of 500 with a real uploaded screenshot, and a credit of 200 for the other customer.

- `button[data-edit-entry]` and `button[data-delete-entry]` exist **inside** the entry row; edit pre-fills amount `500`, date `2026-10-10`, note `first note`.
- Edit to `800` / `2026-10-20` / `edited note`: `[data-amount]` text **and** attribute `800`; `data-date` `2026-10-20`; note text `edited note`; `data-entry-id` **unchanged**; the stored `img[data-shot]` stays inside that entry; row `[data-balance]` text **and** attribute `-800`; `#cust-balance` text **and** attribute `-800`; `#total-outstanding` text **and** attribute `-600`; the other customer stays `200` on the customer route and in the list.
- Reload keeps all of it (amount, id, screenshot, total `-600`); the list view shows `-800 / 200`.
- Delete: entry and its `img[data-shot]` gone, `#cust-balance` `0`, row balance `0`, total `200`, other customer `200`; reload keeps the deleted state.
- Two-entry shop: deleting the first leaves the survivor with its own id and value, balance/total `150`. Customer→credit type change drops the image (§1.5, CRITIC-ADV-23).

#### CRITIC-ADV-14 — B3 CSV (27/27)

`node /tmp/hisaab-g4/b3.js` — imports the sample first, then a `CSV Shop`; captures both downloads with `page.on('download')` and parses them with an RFC-4180 parser written in the script.

```
NOTE customers.csv:
phone,name,credit,payment,balance
9000000401,Plain Person,1500,250.50,1249.50
9000000402,"Doe, Jane",670.50,0,670.50
9000000403,"Quote ""Q"" Person",0,100,-100

NOTE entries.csv:
phone,type,amount,date,note
9000000403,payment,100,2026-10-05,"paid, on UPI"
9000000402,credit,670.50,2026-10-05,"said ""thanks"""
9000000401,credit,1500,2026-10-05,plain credit
9000000401,payment,250.50,2026-10-01,"line one
line two"

B3 CSV: 27/27 assertions passed
```

- Both files download from `#export-csv`; headers exactly `phone,name,credit,payment,balance` and `phone,type,amount,date,note`; one row per customer row (3) and per entry (4).
- `credit/payment/balance` semantics exact (`1500 - 250.50 = 1249.50`; `-100` signed); every numeric cell matches `^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$`, fractional values two decimals, whole values none, **no** `Rs`/`₹`/`,`/space.
- Entries newest-first, equal dates newest-insertion-first (`403, 402, 401`, then the older `2026-10-01`).
- Comma names, doubled quotes, comma notes, quote notes and an **embedded newline** all round-trip through the parser; CRLF terminators.
- **No sample phone** appears in either file after the second import; an empty shop exports headers only (current state, never cached); `#export-msg` visible.
- After an edit the CSV shows the edited amount and recomputed credit/payment/balance; export while `#search` filters leaves all 8 customers in the file (state, not visible rows).

#### CRITIC-ADV-15 — B4 search (29/29)

`node /tmp/hisaab-g4/b4.js` — sample shop.

- `#search` empty at load, 8 rows in the DOM, all 8 visible, total `11820`.
- `sunita` / `SUNITA` / `SuNiTa` → only `9000000102` visible; `0104` → only `9000000104`; full-phone query → exactly that row.
- Total text/attribute stay `11820` while filtered; `#import-box` and `#import-go` stay visible; **8 rows remain in the DOM** (0 removed) with a no-match query (`zzz-no-match` → 0 visible, 8 in DOM, total `11820`).
- Clearing restores all 8; typing then reload → `#search` empty, all 8 visible, 8 in the DOM, total `11820`.
- On `?customer=9000000102`: searching does not remove `#cust-name` or change it (`Sunita Devi`), still filters the list, clearing restores 8.

#### CRITIC-ADV-16 — B5 UPI (75/75)

`node /tmp/hisaab-g4/b5.js` — 6 customers: balance `670`, `0` (paid exactly), `-250.25`, `42`, `1500.50`, `670.50`; names `Ravi Kumar`, `Zero Balance`, `Minus Person`, `Anna & Sons`, `రవి కుమార్`, `Fractional Person`.

```
NOTE default hrefs: 9000000501 upi://pay?pa=hisaab@upi&am=670&cu=INR&tn=Ravi%20Kumar | 9000000502 ...am=0... | 9000000503 ...am=0... | 9000000504 ...am=42...&tn=Anna%20%26%20Sons | 9000000505 ...am=1500.50...&tn=%E0%B0%B0... | 9000000506 ...am=670.50...
B5 UPI: 75/75 assertions passed
```

- Exactly **one** `a[href^="upi://pay?pa="]` in each row (6/6; global count 6); href starts `upi://pay?pa=`; parameter order `pa, am, cu, tn`.
- Default `pa=hisaab@upi`; `am` = `max(balance, 0)` rendered bare (`670`, `0`, `0`, `42`, `1500.50`, `670.50`) and equal to the row's positive `[data-balance]`; `cu=INR` occurs exactly **once**; `tn` decodes byte-identically to the full name, including `Anna%20%26%20Sons` → `Anna & Sons` and percent-encoded Telugu.
- `#upi-demo-note` visible while the demo VPA is in use.
- Setting `#shop-upi` to `myshop@bank` switches **every** link's `pa`, leaves `am` unchanged and hides the demo note; clearing it restores `hisaab@upi` and the note; the shop VPA survives reload.
- A `shop_upi`/`upi` field inside the imported JSON is ignored (D12: import schema unchanged; `pa` stays the owner value).
- Fresh storage → demo note visible at first paint.

#### CRITIC-ADV-17 — B6 language (63/65; 2 documented placeholder misses)

`node /tmp/hisaab-g4/b6.js` — sample imported, `?customer=9000000101`, `#import-box` sentinel; full snapshot of ids, every `data-*` attribute, every `href`, option values, totals, rows, entries, customer view, import box, taken in `en`, `hi`, `te`.

```
NOTE hi labels: {"overdueTitle":"बकाया — Overdue (30+ days)","addCustomer":"ग्राहक जोड़ें","save":"सहेजें","search":"नाम या फ़ोन खोजें","searchPlaceholder":"Search name or phone","demoNote":"डेमो UPI ID — अपनी दुकान की UPI ID सेट करें","totalLabel":"कुल बकाया (रु.)","importBtn":"आयात करें","remindFirst":"WhatsApp रिमाइंडर","customersTitle":"ग्राहक",...}
NOTE te labels: {"overdueTitle":"గడువు మీరినవి — Overdue (30+ days)","addCustomer":"కస్టమర్‌ను జోడించండి","save":"సేవ్ చేయండి","search":"పేరు లేదా ఫోన్ వెతకండి","demoNote":"డెమో UPI ID — మీ షాప్ UPI ID సెట్ చేయండి",...}
NOTE placeholders in the current language: {"search":"Search name or phone","new-name":"Full name","new-phone":"10-digit phone","entry-amount":"0","entry-note":"Optional note","import-box":"Paste shop JSON","shop-upi":"yourname@bank"}
FAIL hi search placeholder translates :: "Search name or phone"
FAIL te search placeholder translates :: "Search name or phone"
B6 LANGUAGE: 63/65 assertions passed
```

- `#lang-switch` is a `select` with exactly `en, hi, te`, value `en` at load; reload resets to `en` and English labels.
- `#overdue-title`, `#add-customer`, `#entry-save`, the search `<label>`, the total label, the import button and the row reminder label all translate in `hi` and `te`; the heading still contains `Overdue` and `30+ days`; `#upi-demo-note` translates (**BUG-1 closed**).
- In `hi` and `te` the snapshot is **byte-identical** to English: all element ids, every `data-*` attribute (including `data-balance`, `data-entry-id`, `data-date`, `data-amount`, `data-customer`), every `href` (reminder, UPI, `?customer=`), `#entry-type`/`#entry-customer`/`#lang-switch` option values, `#import-box` content, `#cust-name`, `#cust-balance` text+attribute, every row and entry.
- `#total-outstanding` and every `[data-balance]` stay bare (`BARE`, text = attribute) in all three languages; empty shop total stays `0` in `hi`.
- The only misses are input **placeholders** (`#search`, `#new-name`, `#new-phone`, `#entry-note`, `#import-box`, `#shop-upi`), which stay English. They are not `<label>`s; CONTRACT §5.5 scopes translation to "visible UI labels". Recorded as **F-2** with the score risk stated above.

#### CRITIC-ADV-18 — B7 fallback (20/20)

`node /tmp/hisaab-g4/b7.js` — clear 900×400 JPEG reading `1500`, customer view open.

```
--- B7 OCR FALLBACK ---
NOTE after upload #entry-amount = "" -> OCR UNAVAILABLE (empty, allowed)
B7 OCR FALLBACK: 20/20 assertions passed
```

- The visible label `#shot-ocr-hint` reads `Read amount from screenshot` next to a real `input[type=file][accept=image/*]`.
- Upload + 1.6 s wait → `#entry-amount` stays **empty** (no engine; permitted by PRD B7/D5); `#entry-save` stays enabled and visible; the selected file is retained.
- Typed `1500` survives a second upload unchanged.
- Typing `999` and saving **immediately** after choosing a file: save is never blocked; one payment entry with `[data-amount]` text and attribute `999`, screenshot present, form reset.
- Empty amount is rejected with a visible message and no second entry; entry + amount + image survive reload; **0 console errors / 0 page errors / 0 failed requests / 0 external requests** (so no OCR asset is fetched and no failure path leaks an error).
- **Recorded, not faked:** OCR is unavailable in P4, so B7 earns 0. The manual fallback works.

#### CRITIC-ADV-19 — P0–P3 regression, 375 px, dark, Vercel shape (69/69)

`node /tmp/hisaab-g4/context.js`:

- First paint (fresh profile, empty storage): the 19 §2 nodes each resolve **exactly once** and are visible; `#total-outstanding` `0`; the customers empty-state message is visible; **0** matches for all seven data-dependent selectors; `#overdue-empty` visible; 0 console/page errors.
- `?customer=9000009999` → `Customer not found`, `0`, list nodes still in the DOM.
- Sample import → `11820` (text = `data-value`), exactly 8 rows, every balance text = attribute = `sample-expected.json`; one reminder per row; `9000000101` href byte-exact (`Namaste Ravi Kumar, your balance is Rs 670.`); `#import-msg` reports the shop, 8 customers and `11820`.
- Second import replaces (1 row, `-250.50`, no sample phone), survives reload; malformed JSON → `Could not import`, previous row and total intact.
- 375×812 with the sample: `documentElement.scrollWidth` **375**, body 375, no element past the viewport. 375×812 with long unicode names, a 100-char unbroken note and `250000.50`: `scrollWidth` 375, no overflow, balance still exactly `250000.50`; `#overdue` and `#upi-demo-note` fit. Screenshots: `/tmp/hisaab-g4/artifacts/375-sample.png`, `375-adversarial.png`.
- Dark scheme with the sample: body 17.10; total 15.73; balance 14.40; customer name 14.40; label 6.78; overdue title 15.73; overdue days 14.40; demo note 6.78; search input 15.73; import box 15.73. `color-scheme` includes `dark`. Screenshot `dark-sample.png`.
- Vercel shape: `app/` is exactly the three files; every `src`/`href` is `./styles.css`, `./app.js`, `./` or `data:,`; no localhost/absolute path, build file, manifest, `vercel.json`, service worker, cookie/auth/analytics/fetch/XHR; `/`, `/index.html`, `/?customer=`, `/?today=`, `/?today=not-a-date` → 200; 0 SW registrations, empty `document.cookie`, 0 password fields; 0 console/page/failed/external requests.

#### CRITIC-ADV-20 — P4 contract audit probes (27/27)

`node /tmp/hisaab-g4/audit.js`: no duplicate element ids in empty, sample, customer-view or `te` states; `#export-csv` is a `button`; `#overdue` rows carry `data-overdue` (not `data-customer`) and are unique per phone; same-date entries render `third, second, first, older` (newest insertion first); every `[data-amount]` is a bare unsigned magnitude, text = attribute; every `data-date` is ISO; every entry row carries both action buttons; `#cust-balance` text = attribute = `55`; CSV after an edit shows `60, 99, -39` and reflects edits/deletes; export while filtered keeps every customer; search still works in `te` and export still downloads both files; no duplicate ids in `te`; 0 console/page/failed/external.

#### CRITIC-ADV-21 — cross-feature integration (25/25)

`node /tmp/hisaab-g4/integration.js`: editing a payment amount updates the entry, row balance and **UPI `am`**; editing the last payment's date to today **removes** that customer from `#overdue`; deleting a customer's only payment removes them from `#overdue` (D1) and shows the empty state; deleting the payment zeroes the payment column in `customers.csv`; type change payment→credit recomputes balance and `am`; edits keep `data-entry-id` after reload; import replaces rows, overdue list, total and UPI `am`; 0 console/page/failed/external.

#### CRITIC-ADV-22 — contract probes (21/21)

`node /tmp/hisaab-g4/contract.js`: exactly one `[data-balance]`, one `a[data-remind="<phone>"]`, one `a[href="?customer=<phone>"]` and one UPI link per row; `#import-msg` reads `Imported "Lakshmi Provision Store (fictional)": 8 customers, total 11820.`; duplicate phone → one row, last name, warning contains `duplicate`; unknown phone → `Customer 9000000962` and its money in the total; `?today=` sets the default entry date and the saved `data-date`; empty note is blank (never `undefined`/`null`/`NaN`); empty machine nodes are bare zeros with `Rs` only in the human sibling.

#### CRITIC-ADV-23 — edge sequences (13/13)

`node /tmp/hisaab-g4/edge.js` (5/5): importing while an entry is being edited exits edit mode, keeps the imported shop's total and rejects the stale save with a visible message — no orphan entry, no lost money. `node /tmp/hisaab-g4/edge2.js` (8/8): editing a payment to a credit drops its `img[data-shot]` (§1.5), balance `+120`, image absent after reload; deleting the only entry leaves `#entries` empty and `#cust-balance` `0`.

#### CRITIC-ADV-24 — independent fuzz + prior P2/P3 batches re-run on the P4 build

```
$ node /tmp/hisaab-critic/fuzz-p2.js        # P4 build
FUZZ seed 77190345 datasets 50
FUZZ ASSERTIONS: 1077/1077 passed across 50 shops

$ node /tmp/hisaab-critic/adv-p3.js         # P3 batch on the P4 build
ADVERSARIAL P3 CHECKS: 198/198 passed

$ node /tmp/hisaab-critic/extra-p3.js       # P3 angles on the P4 build
EXTRA P3 CHECKS: 36/36 passed
```

The P4 build does not move parse/normalise/balance/render, reminder encoding or the image pipeline: the independent fuzz (different generator and oracle from F-01), the 198-assertion reminder/image/quota batch and the 36-assertion P3 angle batch are all green.

#### Contract audit — P4 scope (59/59)

| # | CONTRACT rule | Result | Evidence |
|---|---|---|---|
| CA-P4-01 | `#search` is an `input`, empty at load (§5.1) | PASS | `['INPUT','']` empty state; ADV-19 |
| CA-P4-02 | Filters `[data-customer]` rows by full name substring, case-insensitive (§5.1) | PASS | `sunita`/`SUNITA`/`SuNiTa` → 9000000102 only |
| CA-P4-03 | Filters by phone substring (§5.1) | PASS | `0104`, `9000000102` |
| CA-P4-04 | Filtering mutates no state; clearing restores every row (§5.1) | PASS | 8 in DOM while filtered/no-match; clear → 8 |
| CA-P4-05 | Never changes `#total-outstanding`, never removes the import section (§5.1) | PASS | total `11820` throughout; `#import-box`/`#import-go` visible |
| CA-P4-06 | Reload restores all rows (§5.1) | PASS | query not persisted; 8 visible, 8 in DOM |
| CA-P4-07 | `#overdue` section with heading containing `Overdue` and `30+ days` (§5.2) | PASS | `Overdue (30+ days)`; hi/te keep both tokens |
| CA-P4-08 | Rows are `li[data-overdue="<phone>"]`, one per qualifying customer (§5.2) | PASS | 4 sample rows; unique phones; 0 inside `#overdue` with `data-customer` |
| CA-P4-09 | `[data-days]` bare integer, text = attribute (§5.2) | PASS | `61/44/43/42`, `^\d+$`, identical strings |
| CA-P4-10 | Order days descending; ties by name ascending (§5.2) | PASS | 61,44,43,42; tie probe `alpha,Beta,Zebra` |
| CA-P4-11 | Only positive balance with a last payment; no payment at all never listed (§5.2, D1) | PASS | boundary shop: 30 days in, 29 out, no-payment/zero/future excluded |
| CA-P4-12 | Visible empty-state line when nobody is overdue (§5.2) | PASS | `#overdue-empty` visible + non-empty text |
| CA-P4-13 | Nothing inside `#overdue` carries `data-customer` (§5.2) | PASS | 4 `[data-overdue]`, 0 `[data-customer]` |
| CA-P4-14 | `?today=` drives membership and day counts (§1.6, §5.2) | PASS | 2026-11-15 oracle; boundary 30/29; reload stable |
| CA-P4-15 | `#export-csv` is a `button` at load (§5.3) | PASS | `BUTTON`, visible (C-09) |
| CA-P4-16 | Downloads `customers.csv` with header exactly `phone,name,credit,payment,balance` (§5.3) | PASS | captured file, exact header |
| CA-P4-17 | Downloads `entries.csv` with header exactly `phone,type,amount,date,note` (§5.3) | PASS | captured file, exact header |
| CA-P4-18 | One row per customer row and per entry (§5.3) | PASS | 3 and 4; 8 after sample; headers-only on empty |
| CA-P4-19 | `credit`/`payment` totals and signed `balance` per customer (§5.3) | PASS | `1500,250.50,1249.50`; `0,100,-100`; after edit `60,99,-39` |
| CA-P4-20 | Entries newest-first, equal dates newest insertion first (§1.8, §5.3) | PASS | `403,402,401` then older; `third,second,first,older` |
| CA-P4-21 | RFC-4180 quoting, embedded quotes doubled (§5.3) | PASS | `"Doe, Jane"`, `"Quote ""Q"" Person"`, `"said ""thanks"""`, `"line one\nline two"` |
| CA-P4-22 | No currency/grouping in numeric cells; fractional two decimals, whole none (§5.3, §3.3) | PASS | every numeric cell `BARE`, no `Rs/₹/,/space` |
| CA-P4-23 | Built from current state, never the sample (§5.3) | PASS | second import, no sample phone; empty shop headers only |
| CA-P4-24 | CSV reflects edits and deletes (§5.3) | PASS | edited amount/credit/payment/balance in both files |
| CA-P4-25 | Export is state, not visible rows (§5.3) | PASS | filtered export still 8 customers |
| CA-P4-26 | Exactly one `a[href^="upi://pay?pa="]` per row (§5.4) | PASS | 6/6 rows, global 6 |
| CA-P4-27 | `href` = `upi://pay?pa=<payee>&am=<amount>&cu=INR&tn=<encoded name>` (§5.4) | PASS | prefix; param order `pa,am,cu,tn` |
| CA-P4-28 | `am` = §3.3 rendering of `max(balance, 0)` (§5.4) | PASS | `670,0,0,42,1500.50,670.50`; never negative |
| CA-P4-29 | `cu=INR` literal and exactly once (§5.4) | PASS | one occurrence per href |
| CA-P4-30 | `tn` percent-encoded full name; `&` and unicode round-trip (§5.4) | PASS | `Anna%20%26%20Sons` → `Anna & Sons`; Telugu decodes exactly |
| CA-P4-31 | No shop VPA → documented default `hisaab@upi` (§5.4, D12) | PASS | all default rows |
| CA-P4-32 | Shop VPA replaces the default; demo note visible only while unset (§5.4, D12) | PASS | `myshop@bank` on all links; note hides/returns |
| CA-P4-33 | Shop VPA local-only; import JSON VPA ignored (§5.4, D12) | PASS | persists reload; imported `upi` field ignored |
| CA-P4-34 | `#lang-switch` is a `select` with values exactly `en,hi,te`, default `en` (§5.5) | PASS | option values; `en` at load and after reload |
| CA-P4-35 | `hi`/`te` translate visible labels (§5.5) | PASS | heading/title/buttons/`<label>`s/empty states; hi/te strings differ |
| CA-P4-36 | `#upi-demo-note` translates (BUG-1) (§5.5) | PASS | `डेमो UPI ID — …` / `డెమో UPI ID — …`; E2E-P4-06 regression |
| CA-P4-37 | Ids, attributes, `data-*`, names, dates, money text, hrefs, `#import-box`, option values byte-identical (§5.5) | PASS | full snapshot equality in `en`/`hi`/`te` |
| CA-P4-38 | Machine nodes stay bare in every language (§5.5, §3.3) | PASS | `#total` `11820`, balances bare, text = attribute |
| CA-P4-39 | Reload may reset the switch to `en` (§5.5) | PASS | `en` + English labels after reload |
| CA-P4-40 | OCR prefill only when `#entry-amount` is empty at resolve time (§5.6) | PASS | no engine → stays empty (allowed); no wrong value |
| CA-P4-41 | OCR never overwrites typed input (§5.6) | PASS | typed `1500` survives a second upload |
| CA-P4-42 | Save never waits for OCR; `#entry-save` stays usable (§5.6, §1.9) | PASS | immediate save with a file → one entry, `999` |
| CA-P4-43 | No OCR failure produces a console error or clears the file silently (§5.6) | PASS | 0 console/page errors; file retained |
| CA-P4-44 | `button[data-edit-entry]` and `button[data-delete-entry]` inside every entry row (§1.8) | PASS | 2 controls per row, all 4 rows |
| CA-P4-45 | Edit recomputes `[data-amount]`, row `[data-balance]`, `#cust-balance`, `#total-outstanding` (§1.8, B2) | PASS | `800`, `-800`, `-800`, `-600` (text = attribute) |
| CA-P4-46 | `data-entry-id` stable across edits (§1.8) | PASS | same id before/after edit and after reload |
| CA-P4-47 | Delete removes the entry, recomputes and persists (§1.8, B2) | PASS | 0 entries, balance `0`, total `200`, reload |
| CA-P4-48 | Edit/delete never changes another customer's balance (§1.8, B2) | PASS | other row `200` throughout |
| CA-P4-49 | Screenshot preserved on amount/date/note edit; dropped when type becomes credit (§1.5) | PASS | `img[data-shot]` kept; type-change probe 0 images |
| CA-P4-50 | 19 §2 nodes resolve exactly once, visible, at first paint (§2) | PASS | ADV-19 19/19; C-09/E2E-P0-01 |
| CA-P4-51 | 7 data-dependent selectors have 0 matches at empty state (§1, §2, N1) | PASS | `[data-customer]`, `[data-remind]`, `img[data-shot]`, `[data-entry-id]`, `[data-amount]`, `[data-days]`, `[data-overdue]` |
| CA-P4-52 | No contract node moved, renamed, duplicated or conditionally rendered (§1–§2) | PASS | unique ids in 4 states; same node counts; bonus UI adds only non-contract nodes |
| CA-P4-53 | Bonus hooks present at load, not behind a modal/tab/`<details>` (§5) | PASS | `#search`, `#export-csv`, `#lang-switch`, `#overdue`, `#upi-demo-note` visible |
| CA-P4-54 | Search hides rows only while its value is non-empty (§1.2, §5.1) | PASS | empty-at-load 8 visible; clear restores; hidden attr only while typed |
| CA-P4-55 | `#import-box`, `#import-go`, `#shot-input`, `#total-outstanding`, `[data-customer]`, `[data-balance]`, `a[data-remind]` never hidden by bonus UI (AGENTS §5) | PASS | all present and visible in every P4 state; customer route keeps them |
| CA-P4-56 | Per-customer reminder and `?customer=` links unchanged by P4 (§1.2, §1.3) | PASS | one each per row; hrefs byte-identical across languages |
| CA-P4-57 | Machine nodes bare after add/edit/delete/import/type change (§3.3, N4) | PASS | `800`, `-800`, `11820`, `12.34`, `-250.50`, `250000.50` |
| CA-P4-58 | Import replaces all P4 derived views (§4) | PASS | rows, overdue, total, UPI, CSV after replace |
| CA-P4-59 | No network request on the P4 critical path (§6) | PASS | 0 external requests in every context (CSV uses Blob, UPI is an href) |

**`CONTRACT-<n>` deviations at P4: none.** Deferred by plan and therefore not G4 failures:

- **P5:** 200-row and long-unicode responsive audit, tap targets ≥ 40 px, clipping, sticky-bar overlap, full dark sweep.
- **P6:** 200-shop fuzz (F-02), storage-cleared/double-import hardening pass, judges' note, gallery screenshots.

#### Doc sync — output

```
$ grep -o 'R-[0-9]\+' docs/PRD.md | sort -u | wc -l                  → 0   (literal AGENTS.md §4 regex is vacuous)
$ grep -oE '\b[RNB][0-9]+' docs/PRD.md | sort -u | wc -l            → 23
$ comm -23 /tmp/critic_g4_r /tmp/critic_g4_p   (PRD IDs missing from PLAN) → (empty)  0
$ comm -23 /tmp/critic_g4_r /tmp/critic_g4_t   (PRD IDs missing from TRACE) → (empty)  0
$ comm -13 /tmp/critic_g4_r /tmp/critic_g4_p ; comm -13 /tmp/critic_g4_r /tmp/critic_g4_t → (empty)  0 extra
$ grep -o '`[#\[][^`]*`' docs/CONTRACT.md | tr -d '`' | sort -u | wc -l → 29
$ while read -r sel; do grep -qF "$sel" docs/TEST-CASES.md || echo "UNTESTED: $sel"; done < /tmp/critic_g4_sels
                                                                      → (no output) 29/29
$ grep -nE 'TBD|TODO|\(Planner\)' docs/{PRD,TECH-STACK,IMPLEMENTATION-PLAN,CONTRACT,DECISIONS,TRACEABILITY,TEST-CASES}.md
                                                                      → none
traceability rows                                                     → rows=23, with_phase=23, bad=none
E2E-P4-01…07                                                          → 7/7 defined in TEST-CASES.md v0.9,
                                                                        7/7 cited in TRACEABILITY.md v1.7,
                                                                        7/7 implemented in tests/e2e/p4.spec.js,
                                                                        PLAN v1.7 cites the range `E2E-P4-01–07`
B7 fallback                                                           → TRACEABILITY Notes: C-38 and E2E-P4-07 exercise the
                                                                        D5 manual fallback; PLAN P4: "OCR engine unavailable,
                                                                        declared failed, not faked"
case IDs                                                              → 99 cited, 99 defined, 0 undefined, 0 uncited
                                                                        (104 definition+mapping rows; 5 IDs also appear in the
                                                                        P3 gate-mapping table — not duplicate definitions)
headers                                                               → 4/4 (Version, Updated, Owner, Supersedes) on all six docs
removed-ID scan (R11+/B8+/N7+)                                        → none in PRD/PLAN/TRACEABILITY/TEST-CASES/CONTRACT
```

Versions this gate: PRD **1.1**, TECH-STACK **1.0**, CONTRACT **1.0 — FROZEN at gate G0** (unchanged since G0), DECISIONS **1.3**, IMPLEMENTATION-PLAN **1.7**, TRACEABILITY **1.7**; all `Updated: 2026-11-17`. TEST-CASES **0.9**, test-results RUN-7/RUN-8. No CONTRACT change, so no human gate was triggered.

#### Vercel readiness — PASS

- Deployable set is exactly `app/index.html` (7,794 B), `app/styles.css` (8,705 B), `app/app.js` (71,079 B) — **87,578 B** total. No `package.json`, lockfile, manifest, bundler config, `dist/`, `build/`, `assets/`, or `vercel.json` in `app/`; no build step.
- Every `src`/`href` is `./styles.css`, `./app.js`, `./` or `data:,`; 0 absolute or `localhost` paths. The only absolute URLs are outbound `https://wa.me/…` reminders and `upi://` pay links, which produce no request.
- No service worker (0 registrations at runtime), no `document.cookie`, no password input, no auth gate, no analytics, no `fetch`, no `XMLHttpRequest` in `app/`.
- Direct loads `/`, `/index.html`, `/?customer=…`, `/?today=…`, `/?today=not-a-date` → 200; the import, edit/delete, CSV, search, UPI, language and screenshot flows all work from a cold direct load in fresh contexts.
- Every fresh context: 0 console errors, 0 page errors, 0 failed requests, 0 external requests.

#### Score-risk review — WIN-ANALYSIS §4 and WIN-PLAN §4/§11

WIN-ANALYSIS §4 (why we may lose), P4 build:

| # | Failure mode | Status | Evidence |
|---|---|---|---|
| 1 | Selector missing / renamed / conditional | **PASS** | 19/19 §2 nodes; all P4 hooks present |
| 2 | Tester reads before first paint | **PASS** | first paint has every §2 node and the bonus shells |
| 3 | `.value` set without events; app reads state | **PASS** | every import in ADV-12…24 set `.value` directly and was honoured |
| 4 | Import merges instead of replaces | **PASS** | replace probe; 50 fuzz shops exact |
| 5 | Punctuation/commas/₹ in machine nodes | **PASS** | bare regex on every machine node, all languages |
| 6 | Zero-balance / unknown-phone rows dropped | **PASS** | zero rows keep UPI `am=0` and reminders; `Customer <phone>` rows counted |
| 7 | Float money | **PASS** | `250000.50`, `1500.50`, `-250.25`, `670.50`, `12.34` exact; integer oracle |
| 8 | Screenshot quota loses the save | **PASS (closed at P3)** | P3 batch re-run 198/198 on this build |
| 9 | `?today=` ignored → overdue days wrong | **PASS (closed at P4)** | 61/44/43/42 vs independent calendar; 30/29 boundary |
| 10 | Sideways scroll / unreadable dark | **PASS, provisional** | 375/375 sample + long unicode; dark ≥ 6.78 on sampled text; 200-row audit is P5 |
| 11 | `[data-customer]` count ≠ customer count | **PASS** | rows = keys at load; search returns all on clear/reload |
| 12 | Virtualised / paginated list | **PASS** | every row in `#customers`, 8 in DOM while filtered |
| 13 | No harness | **PASS** | 49-test suite + 1,743 independent assertions |

WIN-PLAN §4 edge-case matrix — **PASS 18/18**: zero-entry customer; overpayment → negative; same name/different phones; duplicate phone; unknown phone; `"1,500"`/`Rs 1500`; `type` casing; same-date entries; future-dated entry; empty note; large numbers; unicode names; `entries: []`; malformed JSON; import twice; reload after import; `?today=2026-11-15` overdue/days-since; 3 MB screenshot.

WIN-PLAN §11 (if we lose), P4 build:

| # | Cause | P4 status |
|---|---|---|
| 1 | Import merging instead of replacing | **PASS** |
| 2 | Punctuation in `#total-outstanding` | **PASS** |
| 3 | Dropping zero-entry / unknown-phone rows | **PASS** |
| 4 | Contract nodes rendered after a delay | **PASS** |
| 5 | Float money | **PASS** |
| 6 | Screenshot upload fails on quota | **PASS (closed)** |
| 7 | Sideways scroll at 375 from a table/long name/image | **PASS with sample, long unicode and thumbnail**; 200-row pass is P5 |
| 8 | No harness | **PASS** |

The 10 phone/theme marks are earned provisionally with the graded flows at 375×812 in light and dark. P5 must still audit 200 rows, tap targets, clipping and the full dark sweep before the final gate.

#### G4 gate checklist (PLAN §4)

- [x] **Tester RUN id present with commands and evidence** — RUN-8: `cd tests && npx playwright test` → 49/49, the seven P4 cases with exact expectations, screenshots and CSV artifacts, BUG-1 closed with a pre-fix regression mutant, and the RUN-7 non-vacuity mutants.
- [x] **Phase acceptance 100%, regression 100%** — E2E-P4-01…07 7/7 green in RUN-8 and CRITIC-RUN-5; P0 23/23, P1 8/8, P2 5/5 + F-01, P3 5/5 in the same run; every PLAN P4 acceptance bullet independently reproduced (B1 order/days/exclusions/empty, B2 edit+delete/id/screenshot/persist, B3 both files/headers/quoting/current state, B4 substring+case+restore, B5 one link/`am`/`cu`/`tn`/VPA, B6 labels+machine identity+reload, B7 fallback non-blocking).
- [x] **No open P0/P1** — none filed in RUN-1…8 and none found by 1,743 independent assertions. BUG-1 (P2) is closed; no P2 is open.
- [x] **Contract audit 100%** — 59/59 P4-observable items; 0 `CONTRACT-<n>`; deferred P5/P6 items named and owned.
- [x] **Doc sync check passes** — output pasted above: 23/0/0 IDs, 29/29 selectors, 0 TBD, 23/23 rows phased, E2E-P4 7/7 defined+cited, 99/99 case IDs, B7 fallback noted, headers 4/4, versions as required.
- [x] **Critic scorecard written; model score not lower than the previous gate** — **100/100** vs 75/100 at G3 (floor 97/100 if B6 is read strictly and 95/100 if both B6 and an audit item were discounted — still ≥ the final 95 threshold).
- [x] **`worklog.md` entry with `Next:`** — the latest entry (01:30, Planner) ends `Next: Critic G4`; the Orchestrator must append the G4 gate entry ending `Next: P5 — Coder` after this scorecard is recorded.

**Verdict: PASS.**

#### Findings / notes (none blocks G4; no veto raised)

- **F-1 [process]** The P4 build is uncommitted: HEAD is `87c99ee` (tag `g3`), `app/*` are modified, and `tests/e2e/p4.spec.js` is untracked. The Orchestrator should commit and tag `g4` so the graded build is reproducible; the three checksums above pin it for this scorecard.
- **F-2 [residual i18n gap, non-blocking]** Input **placeholders** stay English in `hi`/`te` (`#search` "Search name or phone", `#new-name`, `#new-phone`, `#entry-note`, `#import-box`, `#shop-upi`). Every `<label>`, heading, button, empty state and `#upi-demo-note` translates. CONTRACT §5.5 scopes translation to "visible UI labels", so B6 is credited 5; a screenshot grader that diffs every visible string could call B6 partial (2–3), which would put the model score at 97–98/100 — above the final 95 floor. Optional P5 fix: add `data-i18n-ph` keys for the placeholders.
- **F-3 [doc note]** TRACEABILITY keeps citing cross-gate cases by owning phase (B7 → E2E-P3-* plus E2E-P4-07; R7 → E2E-P3-02). Pre-existing pattern; not a sync failure.
- **F-4 [non-contract hooks]** `#shop-upi`, `#upi-msg`, `#upi-demo-note`, `#export-msg`, `#shot-ocr-hint`, `#entry-msg`, `#storage-msg`, `#overdue-list`, `#overdue-empty`, `#customers-empty`, `#entries-empty`, `#entry-cancel`, `#cust-phone`, `#total-human`, `#cust-balance-human` are Coder UI/test hooks, not contract nodes. No contract node was moved to make them fit.
- **F-5 [scope, by plan]** P5 (responsive/theme) and P6 (200-shop fuzz, quota/reload hardening, judges' note) remain. Deferred, not G4 failures.
- **F-6 [behaviour confirmed]** `#shop-upi` is stored under `hisaab.upi.v1`, separate from `hisaab.v1`; import does not reset it and a VPA inside the shop JSON is ignored (D12). Verified across reload and re-import.

#### Required before P5

1. Orchestrator: append the G4 gate entry to `worklog.md` with `Next: P5 — Coder`; commit and tag the P4 build (`bd38d3ce…`, `19681390…`, `b8d2194e…`).
2. Coder (P5): responsive/theme work only — 200 rows, 40-char unicode names, 100-char unbroken notes, `250000.50`, thumbnails; tap targets ≥ 40 px; no clipping/abbreviation; sticky bar must not cover rows or `#import-box`; full light/dark contrast sweep; no `overflow-x: hidden` masking. Do not rename, move or hide a contract node.
3. Tester (P5): E2E-P5 gate suite (viewport audit, contrast audit, tap targets, clipping, sticky overlap), full regression (49 + new) and the 200-row adversarial shop; file any P0/P1 before the gate.
4. Keep the P4 guarantees green: 4 overdue rows `61/44/43/42`, edit/delete with a stable `data-entry-id`, both CSVs with exact headers and current-state data, search restore, UPI `am`/`cu`/`tn`, byte-identical machine state across `en`/`hi`/`te`, and the B7 fallback that never blocks save.
5. Optional (P5/P6): translate the input placeholders (F-2); keep B7 declared failed unless a self-hosted OCR asset is approved (human gate).

#### Confidence / unknown about the real tester

- The P4 surfaces are backed by 1,743 independent assertions on this exact build (432 new, 1,077 fuzz, 198 + 36 re-run) plus the 49-case suite, all reading the DOM and computing expectations outside `app/`. A false PASS would need every oracle to share a wrong reading of §5.2–§5.5.
- What cannot be known is **how strictly B6 is screenshot-diffed**: labels, headings, buttons, empty states and the demo note translate, but placeholders stay English (F-2). This is the single most likely way to lose 2–3 bonus marks; it cannot take the score below 95.
- **B7 is scored 0** and is the dropped seventh item, so the bonus block does not depend on whether the hidden tester scripts the prefill or accepts the manual fallback. The earlier provisional B7 credit at G3 is now resolved to 0, not carried forward.
- D1's no-payment exclusion and D2's signed-net total remain the hidden-data assumptions most likely to differ from an independent grader; both are stated in the visible overdue label and must be repeated in the judges' note at P6.

### GATE G5 | 2026-11-18 | phase P5

Build: uncommitted working tree at `/Users/akanse/Documents/FWAIProjects/batch10/hisaasb`, served by `python3 -m http.server 4173 --directory app` from that directory; SHA-256 `app/index.html bd38d3cedfef…` (7,794 B), `app/styles.css 8b799aa1e618…` (9,227 B), `app/app.js b8d2194e4f5…` (71,079 B); deployable total **88,100 B**; mtimes `index.html` 18:05, `app.js` 18:06, `styles.css` 18:29. `index.html`/`app.js` are byte-identical to the G4 build (`bd38d3ce…`, `b8d2194e…`) and only `styles.css` differs (`19681390…` → `8b799aa1…`), so P5 is CSS-only as planned. These are exactly RUN-9's handoff checksums. Git HEAD is `54c8a36` (tag `g4`); `app/styles.css` is modified and `tests/e2e/p5.spec.js` is untracked, so the P5 build is uncommitted and untagged — the checksums pin it (F-1).
Runs cited: RUN-9 (Tester), **CRITIC-RUN-6** (full-suite re-run), **CRITIC-P5-A** (sample 375 layout), **CRITIC-P5-B** (200-customer adversarial layout), **CRITIC-P5-C** (light/dark contrast), **CRITIC-P5-D** (tap targets, masking, overlays, contract, Vercel, regression probes), **CRITIC-FUZZ-G5** (62-shop independent fuzz), **CRITIC-BONUS-G5** (B1–B6 probes). Each `/tmp/hisaab-g5/*.js` script imports only the Playwright module; no `app/**` or `tests/**` helper is imported and every expected value is computed in the script from `CONTRACT.md`, `sample-data.json`, `sample-expected.json` or an integer-paise oracle written there.
Hidden-data: **60/60** | Bonus: **30/30** (B1 5, B2 5, B3 5, B4 5, B5 5, B6 5, B7 **0** — six best count) | Phone/theme: **10/10** (final P5 audit: 5 for 375 px with the sample and the 200-row adversarial shop, 5 for light/dark readability)
MODEL SCORE: **100/100** (up from G0 5, G1 10, G2 70, G3 75, G4 100 → "not lower than the previous gate" holds. Floor **97/100** if B6 input placeholders are read as labels; the final ≥95 floor holds either way)
Deductions:
- Hidden-data: **none.** 53/53 in the suite (F-01: 50 shops, seed `20261117`) and **311/311** assertions in my own 62-shop fuzz (seed `20261118`, different generator and integer-paise oracle). Sample: total `11820`, 8 rows, all 8 balances text = attribute = `sample-expected.json`. The P5 CSS pass moves no parse, balance or render code (checksums above). `60 × 0/total = 0`.
- Bonus: **none.** B1–B6 each earned 5 on a DOM-read probe on this build (overdue `61/44/43/42`; edit→300 with stable id and total 400, delete→0/100; both CSV headers and current-state rows; search 1 visible / 8 in DOM / total unchanged; one UPI link per row with `am`=`max(balance,0)`, `cu=INR`, `tn`=name; `hi`/`te` labels change while ids, attributes, balances and hrefs stay byte-identical). **B7 is 0, declared failed, not faked:** no OCR engine ships (D5), so the amount is never read from the screenshot; the manual fallback is verified (upload never blocks or overwrites, save works) but the brief's item is *reading the amount*, and the fallback is not awarded. B7 is the dropped seventh, so the block is 30/30.
- Phone/theme: **none.** 375×812 `documentElement.scrollWidth` and `body.scrollWidth` are **375/375** with the sample and with the 200-customer adversarial shop; 0 visible right edges > 376 in either state; all 202 amount nodes are bare, unclipped and inside the viewport; the 47-character unicode name (283 px) and 100-character unbroken unicode note (283 px) wrap; thumbnail 64 px, `max-width: 100%`, right 110. Light/dark: `color-scheme: light dark`; lowest text 5.02:1 light (white on accent button) and 6.78:1 dark (muted), body 17.47/17.1; control borders 3.82/3.69, container borders 3.34/3.37, thumbnail 3.82/3.69, placeholders 5.97/6.78. 53 controls sampled, **minimum 44 px**, none under 40.
Contract audit: **34/34 P5-observable items pass**, **0 `CONTRACT-<n>` deviations** (table below). The 19 §2 nodes resolve **exactly once** and visibly at first paint; the seven data-dependent §1 selectors have **0** matches at empty state; no node was moved, renamed, hidden, duplicated or conditionally rendered by the P5 CSS (empty, sample, customer-view and `te` states all checked); no duplicate element ids; `#import-box`, `#import-go`, `#shot-input`, `#total-outstanding`, `[data-customer]`, `[data-balance]` and `a[data-remind]` are visible in every state. Deferred P6 items are named, not G5 failures.
Doc sync: **PASS** — literal `R-` check vacuous (0), corrected `[RNB][0-9]+` **23 IDs, 0 missing / 0 extra** in PLAN and TRACEABILITY, **29/29** contract selector tokens found in `TEST-CASES.md`, **0** `TBD`/`TODO`/`(Planner)`, **23/23** traceability rows phased, **E2E-P5-01…04 4/4 defined + 4/4 cited + 4/4 implemented** (PLAN v1.8 cites the range `E2E-P5-01–04`), **103/103** case IDs cited ↔ defined (0 undefined / 0 uncited), headers **4/4** (Version, Updated, Owner, Supersedes) on all six docs, versions PRD **1.1** / TECH-STACK **1.0** / CONTRACT **1.0 — FROZEN at gate G0** / DECISIONS **1.3** / PLAN **1.8** / TRACEABILITY **1.8**, TEST-CASES **0.10**, results RUN-9. No removed R-ID is referenced. No CONTRACT change since G0, so no human gate was triggered.
Vercel readiness: **PASS** — `app/` is exactly `index.html` + `styles.css` + `app.js` (88,100 B); `./styles.css` and `./app.js` are the only asset paths, the favicon is `data:,`; no absolute/localhost path, build file, manifest, `vercel.json`, service worker, cookie, password field, analytics, `fetch` or `XMLHttpRequest`; `/`, `/index.html`, `/?customer=…`, `/?today=2026-11-15`, `/?today=not-a-date` all return 200; in fresh contexts 0 service-worker registrations, empty `document.cookie`, 0 console errors, 0 page errors, 0 failed requests, 0 external requests.
Score risks: WIN-ANALYSIS §4 (13 rows) → **PASS 13** (item 10 "sideways scroll at 375 / unreadable dark" is now **closed**: 375/375 with 200 rows, tap 44, borders ≥3.34, dark ≥6.78). WIN-PLAN §4 (18 rows) → **PASS 18**. WIN-PLAN §11 (8 rows) → **PASS 8** (item 7 "sideways scroll from a table/unbreakable name" closed with the 200-row adversarial shop).
Verdict: **PASS**
Required before re-gate: see "Required before P6" below.
Confidence / unknown about the real tester: (1) The scored surfaces are backed by 53 suite cases plus **739 independent assertions** on this exact build (87 layout + 33 adversarial + 147 contrast + 135 hygiene/contract/Vercel + 311 fuzz + 26 bonus), all reading the DOM and computing expectations outside `app/`; a false PASS would need every oracle to share a wrong reading of §3.3/§5. (2) The single most likely score loss is **B6 placeholder translation**: `<label>`s, headings, buttons, empty states and `#upi-demo-note` translate, input placeholders stay English (F-2); a screenshot grader that diffs every visible string could call B6 partial (2–3), giving **97–98/100**, still above the final 95 floor. (3) **B7 is 0** and is the dropped seventh, so the bonus block does not depend on whether the hidden tester scripts the prefill or accepts the fallback. (4) What cannot be known: whether the grader's hidden shop exercises a normalisation corner outside the 112 fuzzed shops (200-shop F-02 is P6), how strictly it emulates dark mode, and how it buffers the file upload; the largest single risk remains a hidden-data mismatch, not the P5 layout.

#### CRITIC-RUN-6 — independent re-execution of the full suite

Command: `cd tests && npx playwright test` (config `workers: 1`, `retries: 0`, base `http://localhost:4173`, Chromium via `@playwright/test` 1.65.1, default 1280×800, 375×812 where a case sets it, locale `en-IN`, `Asia/Kolkata`).

```
$ cd tests && npx playwright test
Running 53 tests using 1 worker

  ✓   1 [chromium] › e2e/p0-gate.spec.js:59:1 › C-23 Vercel shape: app/index.html, relative assets, no build step, no service worker (377ms)
  ✓   2 [chromium] › e2e/p0-gate.spec.js:95:1 › N-05 no service worker, cookie gate, password field, analytics, or third-party origin (249ms)
  ✓   3 [chromium] › e2e/p0-gate.spec.js:121:1 › E2E-P0-01 first paint: 19 §2 nodes resolve, data selectors are empty, customer view resolves (487ms)
  ✓   4 [chromium] › e2e/p0-gate.spec.js:148:1 › E2E-P0-02 all query-string routes render the same first paint (1.1s)
  ✓   5 [chromium] › e2e/p0-gate.spec.js:176:1 › E2E-P0-03 phone + theme baseline and offline-safe load (415ms)
  ✓   6 [chromium] › e2e/p1.spec.js:66:1 › E2E-P1-01 add customers and four entries: exact paise balances, total, amounts, rejections (575ms)
  ✓   7 [chromium] › e2e/p1.spec.js:161:1 › E2E-P1-02 reload keeps everything; a storage failure keeps the save in memory with a visible warning (538ms)
  ✓   8 [chromium] › e2e/p1.spec.js:211:1 › E2E-P1-03 row link and direct ?customer= both open the same correct view (559ms)
  ✓   9 [chromium] › e2e/p1.spec.js:249:1 › E2E-P1-04 ?today=2026-11-15 sets the default entry date and the saved data-date (369ms)
  ✓  10 [chromium] › e2e/p1.spec.js:270:1 › E2E-P1-05 375x812 with long unicode name, long unicode note, and a fractional amount (345ms)
  ✓  11 [chromium] › e2e/p1.spec.js:325:1 › E2E-P1-06 money parsing and rendering through the entry form (D4, N4) (606ms)
  ✓  12 [chromium] › e2e/p1.spec.js:384:1 › E2E-P1-07 entries with equal dates keep the newest-saved first (R4, U-04) (421ms)
  ✓  13 [chromium] › e2e/p1.spec.js:413:1 › E2E-P1-08 a later successful save clears the storage warning and persists (N5) (560ms)
  ✓  14 [chromium] › e2e/p2.spec.js:52:1 › E2E-P2-01 (C-04/C-05/C-06/C-34) sample import: 11820, 8 rows, every balance matches sample-expected.json (348ms)
  ✓  15 [chromium] › e2e/p2.spec.js:100:1 › E2E-P2-02 (I-01) a second import replaces the first shop and reload keeps the second (500ms)
  ✓  16 [chromium] › e2e/p2.spec.js:144:1 › E2E-P2-03 (C-33/I-10) malformed JSON keeps state; missing lists warn; empty arrays render an empty shop (454ms)
  ✓  17 [chromium] › e2e/p2.spec.js:191:1 › E2E-P2-04 (I-04/I-05/I-06/I-07/U-02/U-03) dedupe, unknown phone, zero entries, decorated amounts, type casing (332ms)
  ✓  18 [chromium] › e2e/p2.spec.js:282:1 › E2E-P2-05 imported sample at 375x812: no sideways scroll, balances not clipped (439ms)
  ✓  19 [chromium] › e2e/p3.spec.js:69:1 › E2E-P3-01 (C-07) reminder href for normal, &, +/%, Telugu, Devanagari, zero and negative balances (350ms)
E2E-P3-02 image sizes: original 5280583 bytes, stored 157319 chars
  ✓  20 [chromium] › e2e/p3.spec.js:138:1 › E2E-P3-02 (I-03/N-03) payment with a 3 MB+ image: thumbnail in the right entry, stored under 200 KB, survives reload (1.0s)
  ✓  21 [chromium] › e2e/p3.spec.js:195:1 › E2E-P3-03 credit with an image and payment without one both save with no img[data-shot] (438ms)
  ✓  22 [chromium] › e2e/p3.spec.js:232:1 › E2E-P3-04 (I-08/N-03) quota failure saves the payment without the image and warns; a later save persists (752ms)
  ✓  23 [chromium] › e2e/p3.spec.js:290:1 › E2E-P3-05 a non-image file and an undecodable image save the entry without a photo and warn (391ms)
  ✓  24 [chromium] › e2e/p4.spec.js:131:1 › E2E-P4-01 (C-14/C-28) overdue: 4 sample rows in day order, bare data-days, no data-customer, no-payment excluded, empty state (476ms)
  ✓  25 [chromium] › e2e/p4.spec.js:208:1 › E2E-P4-02 (C-36) edit 500->800 and delete: amounts, balances, total, id, image, reload, other customer untouched (752ms)
  ✓  26 [chromium] › e2e/p4.spec.js:288:1 › E2E-P4-03 (C-29) CSV export: exact headers, one row each, newest-first entries, RFC-4180 quoting, current state (415ms)
  ✓  27 [chromium] › e2e/p4.spec.js:370:1 › E2E-P4-04 (C-30) search filters by name and phone, keeps total and state, restores on clear and reload (499ms)
  ✓  28 [chromium] › e2e/p4.spec.js:410:1 › E2E-P4-05 (C-35) UPI pay links: one per row, am = max(balance,0), cu=INR once, tn decodes, default and shop VPA (397ms)
  ✓  29 [chromium] › e2e/p4.spec.js:475:1 › E2E-P4-06 (C-13/N-06) language switch translates labels and leaves every id, attribute, name, date, money text and href byte-identical (592ms)
  ✓  30 [chromium] › e2e/p4.spec.js:599:1 › E2E-P4-07 (C-38) OCR fallback: upload does not block or overwrite; manual amount saves (3.5s)
  ✓  31 [chromium] › e2e/p5.spec.js:166:1 › E2E-P5-01 (R9/N2) sample at 375x812: no sideways scroll, every node reachable, amounts not clipped (401ms)
  ✓  32 [chromium] › e2e/p5.spec.js:203:1 › E2E-P5-02 (R9/N2) adversarial 200-customer shop at 375x812: all rows in DOM, long text wraps, thumbnail safe (546ms)
  ✓  33 [chromium] › e2e/p5.spec.js:297:1 › E2E-P5-03 (N3) contrast in light and dark: text >= 4.5:1, large text and control borders >= 3:1 (480ms)
  ✓  34 [chromium] › e2e/p5.spec.js:409:1 › E2E-P5-04 (N2/N3) tap targets >= 40px, no overflow masking, no fixed/sticky overlay (304ms)
F-01 seed 20261117 datasets 50 :: {"shops":50,"customers":160,"entries":297,"duplicatePhoneShops":21,"negativeBalanceRows":56,"zeroBalanceRows":98,"unknownPhoneEntries":203,"unicodeNames":41,"stringAmounts":172,"missingAmounts":31,"missingTypes":27,"missingDates":64,"negativeTotalShops":17,"emptyShops":1}
  ✓  35 [chromium] › fuzz/p2-fuzz.spec.js:210:1 › F-01 50-shop fuzz: every balance and the total equal the independent computation (398ms)
  ✓  36 [chromium] › nonfunctional/p0.spec.js:10:3 › 375x812 viewport › C-20 document scrollWidth is 375 or less at empty state (213ms)
  ✓  37 [chromium] › nonfunctional/p0.spec.js:30:3 › prefers-color-scheme: dark › C-21 dark baseline keeps key nodes visible and text at >= 4.5:1 (268ms)
  ✓  38 [chromium] › nonfunctional/p0.spec.js:63:1 › C-22 no external network request on load (same-origin or data: only) (587ms)
  ✓  39 [chromium] › smoke/contract.spec.js:45:1 › C-01 #total-outstanding resolves on load with text 0 (253ms)
  ✓  40 [chromium] › smoke/contract.spec.js:54:1 › C-02 #import-box and #import-go are visible at first paint (270ms)
  ✓  41 [chromium] › smoke/contract.spec.js:61:1 › C-03 #shot-input exists inside the payment form at first paint (255ms)
  ✓  42 [chromium] › smoke/contract.spec.js:68:1 › C-09 every CONTRACT §2 node resolves and is visible before interaction (266ms)
  ✓  43 [chromium] › smoke/contract.spec.js:91:1 › C-10 #total-outstanding text and data-value are exactly 0 (bare), Rs lives in a sibling (246ms)
  ✓  44 [chromium] › smoke/contract.spec.js:114:1 › C-11 #import-box is a textarea, #import-go a button, #shot-input a file input accepting image/* (260ms)
  ✓  45 [chromium] › smoke/contract.spec.js:141:1 › C-12 #entry-type options are exactly credit and payment (261ms)
  ✓  46 [chromium] › smoke/contract.spec.js:153:1 › C-13 #lang-switch is a select with exactly en, hi, te and defaults to en (248ms)
  ✓  47 [chromium] › smoke/contract.spec.js:175:1 › C-14 #overdue heading contains Overdue and 30+ days, with an empty-state line (263ms)
  ✓  48 [chromium] › smoke/contract.spec.js:194:1 › C-15 #customers shows a visible empty-state message and no rows (264ms)
  ✓  49 [chromium] › smoke/contract.spec.js:205:1 › C-16 empty storage renders zero data-dependent nodes (248ms)
  ✓  50 [chromium] › smoke/contract.spec.js:216:1 › C-39 first paint raises no console error, failed request, or rejection (826ms)
  ✓  51 [chromium] › smoke/routes.spec.js:28:1 › C-17 ?customer=unknown renders the not-found view and keeps every list node (282ms)
  ✓  52 [chromium] › smoke/routes.spec.js:54:1 › C-18 ?today=2026-11-15 loads cleanly with the full empty-state contract (262ms)
  ✓  53 [chromium] › smoke/routes.spec.js:66:1 › C-19 invalid ?today values load cleanly and do not crash (429ms)

  53 passed (26.7s)
```

`53 = 23 P0 + 8 P1 + 5 P2 + 5 P3 + 7 P4 + 4 P5 + F-01`. The count and every pass/fail match RUN-9. P5 is not vacuous: RUN-9 records four mutants in `/tmp` (rows forced to 400 px, border lightened to 1.18, `--tap` 24 px, `body { overflow-x: hidden }`) that each fail the matching E2E-P5 case.

#### CRITIC-P5-A — sample at 375×812 (87/87)

`node /tmp/hisaab-g5/layout.js` — sample imported, `/?today=2026-11-15&customer=9000000101`:

```
--- SAMPLE 375x812 ---
{"htmlSW":375,"bodySW":375,"rows":8,"rowsVisible":8,"wide":[]}
layout: 87/87 assertions passed
```

- `innerWidth` 375, `documentElement.scrollWidth` **375**, `body.scrollWidth` **375**, **0** visible elements with a right edge > 376.
- Exactly **8** `[data-customer]` rows, all visible; every balance text = attribute = `sample-expected.json`; `#total-outstanding` `11820` with `data-value` identical.
- `#total-outstanding`, `#cust-balance`, all 8 row balances: machine shape, `scrollWidth <= clientWidth + 1`, right edge ≤ 376.
- Reachable and inside the viewport: `#total-outstanding`, `#customers`, `#import-box`, `#import-go`, `#shot-input`, `#overdue`, `#entries`, `#lang-switch`, `#cust-name`, `#cust-balance`.
- 0 console errors, 0 page errors, 0 failed requests, 0 external requests.

#### CRITIC-P5-B — 200-customer adversarial shop at 375×812 (33/33)

`node /tmp/hisaab-g5/adversarial.js` — 200 customers with 45-character Telugu names, 100-character unbroken Telugu notes, `250000.50` credits, 300000/100000.25 payments, then one real payment of 100 with a JPEG thumbnail:

```
{"rows":200,"visibleRows":200,"htmlSW":375,"bodySW":375,"wide":[],
 "name":{"clipped":false,"width":283,"right":329,"textLength":47},
 "note":{"clipped":false,"width":283,"right":329,"textLength":100},
 "shot":{"width":64,"right":110,"maxWidth":"100%","srcIsData":true},
 "total":"35099992.75","balance0":"-150099.75",
 "expectedTotal":"35099992.75","expected9000":"-150099.75"}
adversarial: 33/33 assertions passed
```

- **200** `[data-customer]` rows in the DOM and visible: no pagination, no virtualisation; `#import-msg` reports 200 customers.
- `scrollWidth` **375/375**; **0** visible right edges > 376.
- All **202** amount nodes (200 row balances + `#cust-balance` + `#total-outstanding`) are bare, not clipped and inside the viewport; the total and the altered row equal my integer-paise oracle exactly (`35099992.75`, `-150099.75`), so nothing is abbreviated.
- The 45-character name and 100-character unbroken note both wrap (283 px, right 329); thumbnail 64 px, `max-width: 100%`, right 110, stored `data:image/`.
- `#total-outstanding`, `#import-box`, `#import-go`, `#shot-input`, `#overdue`, `#lang-switch` reachable in the same state; 0 console/page/failed/external.

#### CRITIC-P5-C — light and emulated dark contrast (147/147)

`node /tmp/hisaab-g5/contrast.js` — sample imported, one payment with a screenshot, `?customer=9000000101`, then `prefers-color-scheme: dark`:

```
light:  #total-outstanding 18.51 | #cust-balance 18.51 | row [data-balance] 16.16
        body 17.47 | #total-human 5.97 | #import-go 5.02 | row link 16.16
        #search/#import-box/#lang-switch 18.51 | #overdue [data-days] 16.16
        .entry-note 16.16 | #cust-name 18.51 | #upi-demo-note 5.97
        borders: 12 inputs/selects 3.82 | cards 5.02 | .entry 3.34 | thumbnail 3.82
        placeholder 5.97        color-scheme "light dark"
dark:   #total-outstanding 15.73 | #cust-balance 15.73 | row [data-balance] 14.40
        body 17.10 | #total-human 6.78 | #import-go 8.63 | row link 14.40
        #search/#import-box/#lang-switch 15.73 | #overdue [data-days] 14.40
        .entry-note 14.40 | #cust-name 15.73 | #upi-demo-note 6.78
        borders: 12 inputs/selects 3.69 | cards 8.31 | .entry 3.37 | thumbnail 3.69
        placeholder 6.78        color-scheme "light dark"
contrast: 147/147 assertions passed
```

- Every sampled text meets **≥4.5:1** (≥3:1 where the text is large: the 27 px/700 totals and the 20 px/700 name/balance); labels, inputs, placeholders, buttons, row links, overdue days, entry notes and muted text all pass in both schemes.
- Every control border and container/thumbnail border meets **≥3:1**; the thumbnail is 64 px in both schemes.
- `color-scheme` on `:root` contains both `light` and `dark` in both audits.

#### CRITIC-P5-D — tap targets, masking, overlays, contract and Vercel (135/135)

`node /tmp/hisaab-g5/hygiene.js`:

```
--- TAP / MASK / OVERLAY (sample, customer view) ---
controls sampled: 53, min height: 44px
overflow-x: [{"tag":"html","overflowX":"visible"},{"tag":"body","overflowX":"visible"},{"tag":"main","overflowX":"visible"}]
fixed/sticky overlays: []
elements with overflow hidden/clip (excluding .visually-hidden): []
--- VERCEL SHAPE ---
app/: app.js, index.html, styles.css | app.js:71079, index.html:7794, styles.css:9227
hygiene: 135/135 assertions passed
```

- **53** visible interactive controls (row Open/UPI/remind links, every button, input, select, textarea, `#shot-input`); **minimum rendered height 44 px**, none under 40, none under 44.
- `overflow-x` is `visible` on `html`, `body` and `main`; **no** non-control element uses `overflow-x: hidden`/`clip` (`.visually-hidden` is the only masked element and is allowed; native form controls report a UA `overflow-x: hidden` and cannot mask page overflow — recorded as F-3).
- **Zero** fixed or sticky elements exist, so no bar can cover the import section or the last customer row; the non-intersection rule is still asserted.
- Contract: at empty first paint all **19** §2 nodes resolve **exactly once and visibly**; the seven data-dependent selectors have **0** matches; `#total-outstanding` `0`; empty-state message visible; no duplicate ids. With the sample and on the customer view the same 19 nodes still resolve exactly once and visibly, 8 reminders and 8 row balances exist, and no duplicate ids appear.
- Regression probes on this build: second import replaces (1 row, `9000.25`, no sample row); reload keeps it; sample total `11820`; overdue `61/44/43/42` with 0 `data-customer` inside; machine snapshot byte-identical in `en`/`hi`/`te`; CSV download fires.
- Vercel: exactly three static files, relative asset paths, no localhost/absolute path, no service worker/fetch/XHR/cookie/password/analytics, no `vercel.json`; five direct routes return 200; 0 SW registrations; empty cookie; 0 console/page/failed/external.

#### CRITIC-FUZZ-G5 — independent 62-shop fuzz (311/311)

`node /tmp/hisaab-g5/fuzz.js` — own generator (seed `20261118`) and own integer-paise parser/renderer; shops mix duplicate phones, same-name/different-phone, unknown-phone entries, decorated/string/fractional/negative amounts, type casing and missing types/dates, unicode and `&` names, plus empty and exact-duplicate shops:

```
FUZZ seed 20261118 shops 62, 311/311 assertions passed
```

Row count, every balance (text **and** attribute) and the total equal the oracle in all 62 shops; no `NaN`/`undefined`/`Infinity` rendered; 0 console errors.

#### CRITIC-BONUS-G5 — bonus probes on the P5 build (26/26)

`node /tmp/hisaab-g5/bonus.js` — B1 heading/order/attribute, B2 edit→300 + stable id + total 400 + delete→0/100, B3 both CSV headers and the current-state row, B4 search 1 visible / 8 in DOM / total unchanged / clear restores, B5 one `am`/`cu`/`tn`-correct link per row, B6 label translation with byte-identical machine state:

```
NOTE B6 placeholders (English in every language): {"search":"Search name or phone","importBox":"Paste shop JSON","newName":"Full name"}
bonus: 26/26 assertions passed
```

B6's English placeholders are the pre-existing F-2 risk, not a P5 regression; every `<label>`, heading, button and empty state translates and every id/attribute/balance/href stays byte-identical.

#### Contract audit — P5 scope (34/34)

| # | CONTRACT rule | Result | Evidence |
|---|---|---|---|
| CA-P5-01 | 19 §2 nodes resolve exactly once and visibly at first paint (§2) | PASS | hygiene empty-state audit 19/19; CRITIC-RUN-6 C-09/E2E-P0-01 |
| CA-P5-02 | Seven data-dependent §1 selectors have 0 matches at empty state (§1, §2, N1) | PASS | `[data-customer]`, `[data-remind]`, `img[data-shot]`, `[data-entry-id]`, `[data-amount]`, `[data-days]`, `[data-overdue]` all 0 |
| CA-P5-03 | `#total-outstanding` `0` at empty, `11820` with the sample, text = `data-value` (§1.1) | PASS | 0 / 11820 / identical strings |
| CA-P5-04 | Exactly 8 rows with the sample; one row-scoped `[data-balance]` each (§1.2) | PASS | 8/8; text = attribute = `sample-expected.json` |
| CA-P5-05 | Machine shape on every amount node (`^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$`) (§3.3) | PASS | 9 nodes sample, 202 nodes adversarial |
| CA-P5-06 | Amounts are never clipped (`scrollWidth <= clientWidth + 1`) or abbreviated (§3.3, R9) | PASS | every amount node in both states; oracle totals exact |
| CA-P5-07 | Amounts stay inside the viewport (right edge ≤ 376) (§3.3, R9) | PASS | all amount nodes |
| CA-P5-08 | No visible element right edge > 376 with the sample (N2, R9) | PASS | `wide: []` |
| CA-P5-09 | No visible element right edge > 376 with 200 adversarial rows (N2, R9) | PASS | `wide: []` |
| CA-P5-10 | `documentElement.scrollWidth <= 375` in both states (N2, R9) | PASS | 375 / 375 |
| CA-P5-11 | `body.scrollWidth <= 375` in both states (N2, R9) | PASS | 375 / 375 |
| CA-P5-12 | All 200 customers stay in the DOM and are visible; no pagination/virtualisation (§1.2) | PASS | 200/200; `#import-msg` reports 200 |
| CA-P5-13 | A 40+ character unicode name wraps and does not push the page (§1.2, R9) | PASS | 47 chars, 283 px, right 329, unclipped |
| CA-P5-14 | A 100-character unbroken note wraps and does not push the page (§1.8, R9) | PASS | 100 chars, 283 px, right 329, unclipped |
| CA-P5-15 | Thumbnail ≤64 px, `max-width: 100%`, inside the viewport, `data:` src (§1.5, R5) | PASS | 64 px, right 110, `100%`, `data:image/` |
| CA-P5-16 | `#import-box`, `#import-go`, `#shot-input` reachable at 375 in both states (§1.4, §1.5, R9) | PASS | visible, right ≤376 |
| CA-P5-17 | `#overdue`, `#entries`, `#lang-switch`, `#total-outstanding`, `#customers` reachable (§2, R9) | PASS | visible in both states |
| CA-P5-18 | Customer-view `#cust-name`, `#cust-balance`, `#entries` visible, list nodes retained (§1.7) | PASS | reachable at 375; 8 rows still present |
| CA-P5-19 | `color-scheme` contains `light` and `dark` (N3) | PASS | `"light dark"` in both audits |
| CA-P5-20 | Light body/UI text ≥4.5:1, large ≥3:1 (N3) | PASS | min text 5.02; totals 18.51; labels 18.51 |
| CA-P5-21 | Dark body/UI text ≥4.5:1, large ≥3:1 (N3) | PASS | min text 6.78; totals 15.73 |
| CA-P5-22 | Light control borders ≥3:1 (N3) | PASS | 12 controls 3.82 |
| CA-P5-23 | Dark control borders ≥3:1 (N3) | PASS | 12 controls 3.69 |
| CA-P5-24 | Light container and thumbnail borders ≥3:1 (N3) | PASS | cards 5.02, `.entry` 3.34, thumbnail 3.82 |
| CA-P5-25 | Dark container and thumbnail borders ≥3:1 (N3) | PASS | cards 8.31, `.entry` 3.37, thumbnail 3.69 |
| CA-P5-26 | Placeholders resolve to a real colour and are readable (N3) | PASS | 5.97 light / 6.78 dark |
| CA-P5-27 | Every interactive control ≥40 px (§2–§5, N3) | PASS | 53 controls, min 44, none under 40 |
| CA-P5-28 | `overflow-x` on `html`/`body`/`main` is not `hidden` or `clip` (N2) | PASS | all `visible` |
| CA-P5-29 | No page element masks horizontal overflow (§N2; `.visually-hidden` allowed) | PASS | none outside `.visually-hidden`/native controls |
| CA-P5-30 | No fixed/sticky overlay covers the import section or the last row (§2, N2) | PASS | 0 fixed/sticky elements |
| CA-P5-31 | No contract node moved, renamed, hidden, duplicated or conditionally rendered (§1–§2) | PASS | 19/19 in empty, sample, customer and `te` states; unique ids |
| CA-P5-32 | `#import-box`, `#import-go`, `#shot-input`, `#total-outstanding`, `[data-customer]`, `[data-balance]`, `a[data-remind]` never hidden by P5 (§5 lock) | PASS | visible in every state |
| CA-P5-33 | Direct routes work and no console/network error is raised (N6, R10) | PASS | 5 routes 200; 0 console/page/failed/external |
| CA-P5-34 | Static `app/` shape, relative assets, no build/service worker/auth (§8) | PASS | three files; `./styles.css`, `./app.js`; no SW/cookie/fetch/XHR |

**`CONTRACT-<n>` deviations at P5: none.** Deferred by plan and therefore not G5 failures: **P6** — 200-shop fuzz (F-02), storage-cleared / double-import / quota hardening pass, judges' note, gallery screenshots; **B7 OCR** — no self-hosted engine approved (human gate), scored 0.

#### Doc sync — output

```
$ grep -o 'R-[0-9]\+' docs/PRD.md | sort -u | wc -l                        → 0   (literal AGENTS.md §4 regex is vacuous)
$ grep -oE '\b[RNB][0-9]+' docs/PRD.md | sort -u | wc -l                  → 23
$ comm -23 /tmp/g5_r /tmp/g5_p   (PRD IDs missing from PLAN)              → (empty)  0
$ comm -23 /tmp/g5_r /tmp/g5_t   (PRD IDs missing from TRACE)             → (empty)  0
$ comm -13 /tmp/g5_r /tmp/g5_p ; comm -13 /tmp/g5_r /tmp/g5_t            → (empty)  0 extra
$ grep -o '`[#\[][^`]*`' docs/CONTRACT.md | tr -d '`' | sort -u | wc -l   → 29
$ while read -r sel; do grep -qF "$sel" docs/TEST-CASES.md || echo UNTESTED
                                                                          → (no output) 29/29
$ grep -nE 'TBD|TODO|\(Planner\)' docs/{PRD,TECH-STACK,IMPLEMENTATION-PLAN,
  CONTRACT,DECISIONS,TRACEABILITY,TEST-CASES}.md                          → none
traceability rows                                                         → rows=23, with_phase=23
E2E-P5-01…04                                                              → 4/4 defined (TEST-CASES v0.10),
                                                                            4/4 cited (TRACEABILITY v1.8),
                                                                            4/4 implemented (tests/e2e/p5.spec.js),
                                                                            PLAN v1.8 cites the range E2E-P5-01–04
case IDs                                                                  → 103 defined, 103 cited, 0 undefined, 0 uncited
headers                                                                   → 4/4 (Version, Updated, Owner, Supersedes) on all six docs
removed-ID scan (R11+/B8+/N7+)                                            → none
```

Versions this gate: PRD **1.1**, TECH-STACK **1.0**, CONTRACT **1.0 — FROZEN at gate G0** (unchanged since G0), DECISIONS **1.3**, IMPLEMENTATION-PLAN **1.8**, TRACEABILITY **1.8**; all `Updated: 2026-11-17`. TEST-CASES **0.10**, test-results RUN-9. No CONTRACT change, so no human gate was triggered.

#### Vercel readiness — PASS

- Deployable set is exactly `app/index.html` (7,794 B), `app/styles.css` (9,227 B), `app/app.js` (71,079 B) — **88,100 B** total. No `package.json`, lockfile, manifest, bundler config, `dist/`, `build/`, or `vercel.json` in `app/`; no build step.
- The only asset paths are `./styles.css` and `./app.js`; the favicon is `data:,`; 0 absolute or `localhost` paths. The only absolute URLs are outbound `https://wa.me/…` reminders and `upi://` pay links, which produce no request.
- No service worker (0 registrations at runtime), no `document.cookie`, no password input, no auth gate, no analytics, no `fetch`, no `XMLHttpRequest` in `app/`.
- Direct loads `/`, `/index.html`, `/?customer=…`, `/?today=2026-11-15`, `/?today=not-a-date` → 200; every audited state ran in a fresh context from a cold direct load.
- Every fresh context: 0 console errors, 0 page errors, 0 failed requests, 0 external requests.

#### Score-risk review — WIN-ANALYSIS §4 and WIN-PLAN §4/§11

WIN-ANALYSIS §4 (why we may lose), P5 build:

| # | Failure mode | Status | Evidence |
|---|---|---|---|
| 1 | Selector missing / renamed / conditional | **PASS** | 19/19 §2 nodes, exactly once, visible |
| 2 | Tester reads before first paint | **PASS** | first paint complete in a fresh context |
| 3 | `.value` set without events; app reads state | **PASS** | every import in CRITIC-P5-A…D, FUZZ and BONUS set `.value` directly |
| 4 | Import merges instead of replaces | **PASS** | replace probe 1 row / 9000.25; 112 fuzzed shops |
| 5 | Punctuation/commas/₹ in machine nodes | **PASS** | bare regex on every amount node, both states |
| 6 | Zero-balance / unknown-phone rows dropped | **PASS** | fuzz covers zero rows and unknown phones; row counts exact |
| 7 | Float money | **PASS** | 62-shop integer-paise oracle; `-150099.75`, `35099992.75` exact |
| 8 | Screenshot quota loses the save | **PASS (closed at P3)** | suite E2E-P3-04 green on this build |
| 9 | `?today=` ignored → overdue days wrong | **PASS (closed at P4)** | 61/44/43/42 re-verified on this build |
| 10 | Sideways scroll / unreadable dark | **PASS (closed at P5)** | 375/375 sample and 200 rows; 0 wide elements; min text 5.02 |
| 11 | `[data-customer]` count ≠ customer count | **PASS** | 200 rows for 200 customers; 8 for the sample |
| 12 | Virtualised / paginated list | **PASS** | every row in `#customers`; 200/200 visible |
| 13 | No harness | **PASS** | 53-case suite + 739 independent assertions |

WIN-PLAN §4 edge-case matrix — **PASS 18/18**: zero-entry customer; overpayment → negative; same name/different phones; duplicate phone; unknown phone; `"1,500"`/`Rs 1500`; `type` casing; same-date entries; future-dated entry; empty note; large numbers (`250000.50`, 200 rows); unicode names; `entries: []`; malformed JSON; import twice; reload after import; `?today=2026-11-15`; 3 MB screenshot.

WIN-PLAN §11 (if we lose), P5 build:

| # | Cause | P5 status |
|---|---|---|
| 1 | Import merging instead of replacing | **PASS** |
| 2 | Punctuation in `#total-outstanding` | **PASS** |
| 3 | Dropping zero-entry / unknown-phone rows | **PASS** |
| 4 | Contract nodes rendered after a delay | **PASS** |
| 5 | Float money | **PASS** |
| 6 | Screenshot upload fails on quota | **PASS (closed)** |
| 7 | Sideways scroll at 375 from a table/long name/image | **PASS (closed at P5)** — 200 rows, 45-char name, 100-char unbroken note, 64 px thumbnail |
| 8 | No harness | **PASS** |

#### G5 gate checklist (PLAN §4)

- [x] **Tester RUN id present with commands and evidence** — RUN-9: `cd tests && npx playwright test` → 53/53, E2E-P5-01…04 with 375/200-row/contrast/tap evidence, artifacts and `/tmp` non-vacuity mutants.
- [x] **Phase acceptance 100%, regression 100%** — E2E-P5-01…04 4/4 in RUN-9 and CRITIC-RUN-6; P0 23/23, P1 8/8, P2 5/5 + F-01, P3 5/5, P4 7/7 in the same run; every PLAN P5 acceptance bullet independently reproduced (375 sample, 200 rows + unicode + `250000.50` + thumbnail, wraps, unclipped amounts, tap ≥40, 4.5:1/3:1 both schemes, `color-scheme: light dark`, no `overflow-x` masking, no fixed/sticky overlay).
- [x] **No open P0/P1** — none filed in RUN-1…9 and none found by the 53-case suite or 739 independent assertions. BUG-1 (P2) remains closed; no P2 is open.
- [x] **Contract audit 100%** — 34/34 P5-observable items; 0 `CONTRACT-<n>`; deferred P6/B7 items named and owned.
- [x] **Doc sync check passes** — output pasted above: 23/0/0 IDs, 29/29 selectors, 0 TBD, 23/23 rows phased, E2E-P5 4/4 defined+cited+implemented, headers 4/4, versions as required.
- [x] **Critic scorecard written; model score not lower than the previous gate** — **100/100** vs 100/100 at G4 (floor 97/100 if B6 placeholders are read as labels; both ≥ the final 95 threshold).
- [x] **`worklog.md` entry with `Next:`** — the latest entry (03:00, Planner) ends `Next: Critic G5`; the Orchestrator must append the G5 gate entry ending `Next: P6 — Coder` after this scorecard is recorded.

**Verdict: PASS.**

#### Findings / notes (none blocks G5; no veto raised)

- **F-1 [process]** The P5 build is uncommitted: HEAD is `54c8a36` (tag `g4`), `app/styles.css` is modified and `tests/e2e/p5.spec.js` is untracked. The Orchestrator should commit and tag `g5` so the graded build is reproducible; the checksums above pin it for this scorecard.
- **F-2 [residual i18n gap, non-blocking]** Input **placeholders** stay English in `hi`/`te` (`#search`, `#new-name`, `#import-box`, etc.). Every `<label>`, heading, button, empty state and `#upi-demo-note` translates; CONTRACT §5.5 scopes translation to visible UI labels, so B6 is credited 5. A screenshot grader that diffs every visible string could call B6 partial (2–3), putting the model at 97–98/100 — above the final 95 floor.
- **F-3 [measurement note]** Native form controls report a UA-computed `overflow-x: hidden`; the masking audit excludes `input`/`select`/`textarea`/`button` and `.visually-hidden`, and no page-level container masks overflow (`html`, `body`, `main` all `visible`). This is not a P5 defect.
- **F-4 [contrast margin]** `.entry` and `.customer-row` borders sit at **3.34:1** light / **3.37:1** dark — above the 3:1 floor but the closest margin in the system. Any P6 palette tweak must re-check these before the final gate.
- **F-5 [tap margin]** The `input[type=file]::file-selector-button` is 40 px tall: it meets the hard 40 px floor but not the 44 px design token. The file control itself measures 44 px, so the audited control list is compliant.
- **F-6 [scope, by plan]** P6 (200-shop F-02 fuzz, quota/reload/double-import hardening, judges' note) remains; P5 is green and must not regress.
- **F-7 [declared failure]** B7 OCR remains 0 — no self-hosted OCR asset is approved (human gate); the manual fallback works and B7 is the dropped seventh, so the bonus block stays 30/30.

#### Required before P6

1. Orchestrator: append the G5 gate entry to `worklog.md` with `Next: P6 — Coder`; commit and tag the P5 build (`bd38d3ce…`, `8b799aa1…`, `b8d2194e…`).
2. Coder (P6): run the 200-shop fuzz (F-02) to zero mismatches, and harden storage-cleared, quota, reload and double-import paths. No new features; no selector, attribute or machine-value changes.
3. Tester (P6): E2E-P6 full journey plus the 200-shop fuzz and non-functional suite; file any P0/P1 before the gate.
4. Draft the judges' note: routes, import replace, net total, 30+ day overdue, 375 px + light/dark, demo UPI disclosure, and "no login" — URL marked "pending deployment" until the human submits.
5. Preserve the P5 guarantees: no `overflow-x` masking, ≥40 px (44 token) targets, 200 rows in the DOM, 4.5:1 text / 3:1 borders in both schemes, and the sample/adversarial `scrollWidth` at 375.
6. Optional (P6): translate the input placeholders (F-2) only if it can be done without changing any attribute the contract reads; keep B7 declared failed unless a self-hosted OCR asset is approved.

#### Confidence / unknown about the real tester

- The scored surfaces are backed by 53 suite cases plus **739 independent assertions** on this exact build, all reading the DOM and computing expectations outside `app/`. A false PASS would need every oracle to share a wrong reading of §3.3/§5.
- The single most likely score loss is **B6 placeholder translation** (F-2): a strict screenshot diff of every visible string would cost 2–3 bonus marks → 97–98/100, still ≥95.
- **B7 is 0** and is the dropped seventh, so the bonus block does not depend on whether the hidden tester scripts the prefill or accepts the manual fallback.
- What cannot be known: a hidden-data corner outside the 112 fuzzed shops (F-02 is P6), the grader's dark-mode emulation and file upload buffering, and whether it clears storage before importing. The largest residual risk is a hidden-data mismatch, not the P5 layout.
