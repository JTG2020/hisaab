# SCORECARDS — Hisaab

Version: 0.3
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
