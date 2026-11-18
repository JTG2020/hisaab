# TEST RESULTS — Hisaab

Version: 0.12
Updated: 2026-11-18
Owner: Tester
Supersedes: test-results.md v0.11

Append-only. One entry per run. Never edit a past run; add a new one. Cite run IDs in `scorecards.md`.

## Entry template

```
### RUN-<n> | <YYYY-MM-DD HH:MM> | phase <Pn> | gate <Gn>
Command: <exact command(s)>
Environment: local http://localhost:4173, chromium <version>, viewport 1280×800 (unless stated)
Cases: <passed>/<total> | Failing: <ids>
Bugs filed: <BUG-n ...> | Bugs closed: <...>
Evidence: <short command output excerpt or screenshot path>
Verdict: PASS | FAIL
Notes: <regressions, flakiness, unmet R-IDs, deviations>
```

## Rules

- A run is valid only if the app was served from `app/` at the current working tree.
- Include the failing assertion text, not just the case ID.
- For fuzz runs, record the seed and the number of datasets.
- A gate verdict is FAIL if any P0/P1 is open or any phase gate case fails.

## Runs

### RUN-1 | 2026-11-17 08:58 EST | phase P0 | gate G0

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 for C-20 and E2E-P0-03; colour scheme `light` plus emulated `prefers-color-scheme: dark` for C-21 and E2E-P0-03; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker.

Cases: 22/22 passed | Failing: none
Case IDs executed (1 test per ID): C-01, C-02, C-03, C-09, C-10, C-11, C-12, C-13, C-14, C-15, C-16, C-17, C-18, C-19, C-20, C-21, C-22, C-23, N-05, N6, E2E-P0-02, E2E-P0-03.

Bugs filed: none | Bugs closed: none

Evidence:

```
$ npx playwright test
Running 22 tests using 1 worker
  ✓  1 [chromium] › e2e/p0-gate.spec.js › C-23 Vercel shape: app/index.html, relative assets, no build step, no service worker
  ✓  2 [chromium] › e2e/p0-gate.spec.js › N-05 no service worker, cookie gate, password field, analytics, or third-party origin
  ✓  3 [chromium] › e2e/p0-gate.spec.js › E2E-P0-02 all query-string routes render the same first paint
  ✓  4 [chromium] › e2e/p0-gate.spec.js › E2E-P0-03 phone + theme baseline and offline-safe load
  ✓  5 [chromium] › nonfunctional/p0.spec.js › C-20 document scrollWidth is 375 or less at empty state
  ✓  6 [chromium] › nonfunctional/p0.spec.js › C-21 dark baseline keeps key nodes visible and text at >= 4.5:1
  ✓  7 [chromium] › nonfunctional/p0.spec.js › C-22 no external network request on load (same-origin or data: only)
  ✓  8–19 [chromium] › smoke/contract.spec.js › C-01, C-02, C-03, C-09, C-10, C-11, C-12, C-13, C-14, C-15, C-16, N6
  ✓ 20–22 [chromium] › smoke/routes.spec.js › C-17, C-18, C-19
  22 passed (7.4s)
```

Independent measurements taken in the same environment (Playwright `evaluate`, no app code imported):

```
375 light : { innerWidth: 375, documentElement.scrollWidth: 375, body.scrollWidth: 375 }
375 dark  : { scrollWidth: 375, colorScheme: "light dark", body bg rgb(15, 13, 11), ink rgb(245, 240, 232) }
contrast  : body 17.10 | #total-outstanding 15.73 | #overdue h2 15.73 | #customers empty 6.78 |
            #search 15.73 | #import-box 15.73 | #lang-switch 15.73   (all >= 4.5:1)
requests  : http://localhost:4173/ , http://localhost:4173/styles.css , http://localhost:4173/app.js
            (no other origin; favicon is data:, — no network request)
§2 nodes  : 19/19 ids resolve to exactly 1 element, all non-zero box, none under dialog/[hidden]/closed <details>
empty data: 0 matches for [data-customer], [data-customer="9000000101"], a[data-remind], img[data-shot],
            [data-entry-id], [data-amount], [data-days], [data-overdue], [data-overdue="9000000101"],
            a[href^="upi://pay?pa="]
#total    : text "0", data-value "0", matches ^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$, no Rs/₹/comma/space in node,
            "Rs" only in the sibling
customer  : /?customer=9000000101 -> #cust-name "Customer not found", #cust-balance text/attr "0", #entries 0 children
routes    : / , /?customer=9000000101 , /?today=2026-11-15 , /?customer=9000000101&today=2026-11-15 ,
            /?today=not-a-date , /?today=  -> HTTP 200, full §2 set, total "0", no console error/rejection
shapes    : #import-box TEXTAREA | #import-go BUTTON | #shot-input INPUT type=file accept=image/*
            #entry-type options ["credit","payment"] | #lang-switch SELECT options ["en","hi","te"] value "en"
            #overdue heading contains "Overdue" and "30+ days" | #customers visible empty-state text, 0 rows
selector coverage (AGENTS.md §4 check 2):
$ while read -r sel; do grep -qF "$sel" docs/TEST-CASES.md || echo "UNTESTED: $sel"; done < <contract tokens>
(no output — 29/29 contract selector tokens are covered)
```

Verdict: PASS

Notes:

- Harness flakiness, not an app defect: with 4 parallel workers the reference server intermittently dropped sockets and C-02/C-09 saw `console.error: Failed to load resource: net::ERR_SOCKET_NOT_CONNECTED` (2/15 on the first parallel smoke run). The same assertions pass 15/15 with one worker, and the official run is 22/22. `tests/playwright.config.js` pins `workers: 1`; no assertion, selector, or expected value was changed.
- Not executed at P0 and deliberately not green-washed: C-24…C-34 (P1/P2/P4 positive-data oracles), U-05…U-14, I-04…I-10, F-01/F-02, N-01…N-04, N-06. They are recorded in `docs/TEST-CASES.md` and run at their phase gates.
- `?today=` validity beyond shape is not asserted at P0 because P0 has no date-dependent behaviour; U-12 (P1) owns the fallback oracle, C-28 (P4) owns overdue day counts.
- Doc-sync leftovers the Tester may not write: `TRACEABILITY.md` still shows `TBD` for R1, R2, R4 (partly), R10, B1–B7, N4, N5 and N6 and should now cite C-09…C-34, U-05…U-14 and I-04…I-10; `worklog.md` needs the RUN-1 line.
- App files were not modified during this run; checksums recorded at run time: `app/index.html 0cc08edf…`, `app/styles.css cf5a53dd…`, `app/app.js 58d51eac…`.

### RUN-2 | 2026-11-17 09:01 EST | phase P0 | gate G0

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 for C-20 and E2E-P0-03; colour scheme `light` plus emulated `prefers-color-scheme: dark` for C-21 and E2E-P0-03; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker.

Cases: 23/23 passed | Failing: none
Case IDs executed (1 test per ID): C-01, C-02, C-03, C-09, C-10, C-11, C-12, C-13, C-14, C-15, C-16, C-17, C-18, C-19, C-20, C-21, C-22, C-23, N-05, N6, **E2E-P0-01 (new)**, E2E-P0-02, E2E-P0-03.

Bugs filed: none | Bugs closed: none

Evidence:

```
$ npx playwright test
Running 23 tests using 1 worker
  ✓   1 [chromium] › e2e/p0-gate.spec.js › C-23 Vercel shape: app/index.html, relative assets, no build step, no service worker
  ✓   2 [chromium] › e2e/p0-gate.spec.js › N-05 no service worker, cookie gate, password field, analytics, or third-party origin
  ✓   3 [chromium] › e2e/p0-gate.spec.js › E2E-P0-01 first paint: 19 §2 nodes resolve, data selectors are empty, customer view resolves (461ms)
  ✓   4 [chromium] › e2e/p0-gate.spec.js › E2E-P0-02 all query-string routes render the same first paint
  ✓   5 [chromium] › e2e/p0-gate.spec.js › E2E-P0-03 phone + theme baseline and offline-safe load
  ✓   6–8  [chromium] › nonfunctional/p0.spec.js › C-20, C-21, C-22
  ✓   9–20 [chromium] › smoke/contract.spec.js › C-01, C-02, C-03, C-09, C-10, C-11, C-12, C-13, C-14, C-15, C-16, N6
  ✓  21–23 [chromium] › smoke/routes.spec.js › C-17, C-18, C-19
  23 passed (7.9s)
```

Selector coverage re-checked for this run:

```
# AGENTS.md §4 automated check (tokens starting with # or [)
$ while read -r sel; do grep -qF "$sel" docs/TEST-CASES.md || echo "UNTESTED: $sel"; done < <29 contract tokens>
(no output — 29/29 covered)
# manual sweep of letter-prefixed / structural tokens (invisible to that grep)
$ grep -o '`\(a\|img\|button\|li\|input\|form\)\[[^`]*`' docs/CONTRACT.md | sort -u
a[data-remind="<phone>"] | a[data-remind] | a[href="?customer=<phone>"] | a[href^="upi://pay?pa="] |
button[data-delete-entry] | button[data-edit-entry] | img[data-shot] | li[data-entry-id] |
li[data-overdue="<phone>"]                       -> (no MISSING lines; 9/9 covered)
```

Verdict: PASS

Notes:

- New in this run: `E2E-P0-01` now encodes the correct P0 reading — the 19 `CONTRACT.md` §2 nodes each resolve and are visible at first paint, the ten data-dependent §1 selectors have **zero** matches at empty state, and `#cust-name`/`#cust-balance`/`#entries` resolve on `?customer=9000000101`. It reuses the C-09/C-16/C-17 assertions; the same assertions were shown to fail on a mutated copy of the app in the RUN-1 session, so the case is not vacuous.
- `TEST-CASES.md` v0.3 adds planned oracles C-35 (B5 UPI href, D12 `pa=hisaab@upi`, `am=0` for zero/negative, `cu=INR` once), C-36 (B2 edit 500→800 and delete, `data-entry-id` stable, persist across reload), C-37 (R4 row link `a[href="?customer=<phone>"]` → customer view) and C-38 (B7 OCR prefill only when empty, never overwrites typed input, never blocks save). None of them run before P4/P1 and no existing expected value changed.
- Coverage-index corrections: `a[href^="upi://pay?pa="]` now cites **C-35** (was the inaccurate "B5 check at P4 (C-30 family)"); `button[data-edit-entry]`/`button[data-delete-entry]` cite **C-36** (was "— (P4 planned)"); `a[href="?customer=<phone>"]` cites **C-37**; the OCR path (`#shot-input`, `#entry-amount`, `#entry-save`) cites **C-38**.
- Still not executed at P0: C-24…C-38, U-05…U-14, I-04…I-10, F-01/F-02, N-01…N-04, N-06.
- Doc-sync leftovers the Tester may not write: `TRACEABILITY.md` still shows `TBD` for R1, R2, R4 (partly), R10, B1–B7, N4–N6 and should now cite C-09…C-38, U-05…U-14 and I-04…I-10; `worklog.md` needs the RUN-1 and RUN-2 lines.
- App files were not modified during this run; checksums unchanged from RUN-1: `app/index.html 0cc08edf…`, `app/styles.css cf5a53dd…`, `app/app.js 58d51eac…`.

### RUN-3 | 2026-11-17 09:04 EST | phase P0 | gate G0

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 for C-20 and E2E-P0-03; colour scheme `light` plus emulated `prefers-color-scheme: dark` for C-21 and E2E-P0-03; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker.

Cases: 23/23 passed | Failing: none
Case IDs executed (1 test per ID, 23 tests ↔ 23 unique IDs): C-01, C-02, C-03, C-09, C-10, C-11, C-12, C-13, C-14, C-15, C-16, C-17, C-18, C-19, C-20, C-21, C-22, C-23, **C-39 (new ID)**, N-05, E2E-P0-01, E2E-P0-02, E2E-P0-03.

Bugs filed: none | Bugs closed: none

Evidence:

```
$ npx playwright test
Running 23 tests using 1 worker
  ✓  20 [chromium] › smoke/contract.spec.js:216:1 › C-39 first paint raises no console error, failed request, or rejection (844ms)
  23 passed (8.6s)

$ npx playwright test --list | tail -1
Total: 23 tests in 4 files
$ npx playwright test --list | grep C-39
  [chromium] › smoke/contract.spec.js:216:1 › C-39 first paint raises no console error, failed request, or rejection
```

C-39 now asserts the case row exactly: `/`, `/?customer=9000000101`, `/?today=2026-11-15` and `/?today=not-a-date` in one page/context, each returning 200 with the 19 §2 nodes and `#total-outstanding` `0`, and each with 0 console errors, 0 uncaught rejections, 0 failed requests.

Selector coverage re-checked for this run (unchanged, 0 misses): `AGENTS.md` §4 automated tokens 29/29, plus the manual letter-prefixed sweep (`a[…]`, `img[…]`, `button[…]`, `li[…]`) 9/9.

Verdict: PASS

Notes:

- **Correction of RUN-2's label:** RUN-2's executed list and notes used `N6` as if it were a case ID. It is the requirement ID for "no console errors"; `TEST-CASES.md` v0.3 had no `N6` case row. The case is now **C-39** (N6, P0), and the Playwright test holding the same assertions was renamed `N6 first paint...` → `C-39 first paint...` with no assertion removed or loosened. `N-06` remains the P6 full-journey case.
- **Count differs from the 24/24 expected in the brief; 23 is correct and no case is missing.** RUN-1 had 22 tests. RUN-2 added `E2E-P0-01` → 23. C-39 is a rename of the already-counted `N6`-titled test, not an additional test, so the suite stays at 23. Arithmetic: 22 + 1 (E2E-P0-01) = 23; + 0 (C-39 rename) = 23. Verified by `--list`: 23 tests ↔ 23 unique case IDs, and every test title starts with a real case ID. Adding a 24th test would have meant duplicating C-39 or keeping an uncased copy of it, which would recreate the mismatch this run fixes.
- `TEST-CASES.md` v0.4 adds **C-39** and the requirement-vs-case note (`N6` is never a case ID; `R*`, `B*`, `N6` are requirement prefixes, cases are `C-`/`U-`/`I-`/`E2E-`/`F-`/`N-`). No existing ID or expected value changed.
- Still not executed at P0: C-24…C-38, U-05…U-14, I-04…I-10, F-01/F-02, N-01…N-04, N-06.
- Doc-sync leftovers the Tester may not write: `TRACEABILITY.md` still shows `TBD` for R1, R2, R4 (partly), R10, B1–B7, N4–N6 and should cite C-09…C-39, U-05…U-14 and I-04…I-10 (N6 → C-39 at P0, N-06 at P6); `worklog.md` needs the RUN-1, RUN-2 and RUN-3 lines.
- App files were not modified during this run; checksums unchanged: `app/index.html 0cc08edf…`, `app/styles.css cf5a53dd…`, `app/app.js 58d51eac…`.

### RUN-4 | 2026-11-17 16:35 EST | phase P1 | gate P1 (pre-gate verification)

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time (the server had to be restarted; it was down before the run); `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 for C-20, E2E-P0-03 and E2E-P1-05; light scheme plus emulated `prefers-color-scheme: dark` for C-21/E2E-P0-03; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker.

Cases: 31/31 passed | Failing: none
P0 regression: 23/23 (C-01–C-03, C-09–C-23, C-39, N-05, E2E-P0-01–03)
P1 cases executed: E2E-P1-01, E2E-P1-02, E2E-P1-03, E2E-P1-04, E2E-P1-05, E2E-P1-06, E2E-P1-07, E2E-P1-08 (all new this run)

Bugs filed: none | Bugs closed: none

Evidence:

```
$ npx playwright test
Running 31 tests using 1 worker
  ✓  6 [chromium] › e2e/p1.spec.js › E2E-P1-01 add customers and four entries: exact paise balances, total, amounts, rejections (557ms)
  ✓  7 [chromium] › e2e/p1.spec.js › E2E-P1-02 reload keeps everything; a storage failure keeps the save in memory with a visible warning (528ms)
  ✓  8 [chromium] › e2e/p1.spec.js › E2E-P1-03 row link and direct ?customer= both open the same correct view (585ms)
  ✓  9 [chromium] › e2e/p1.spec.js › E2E-P1-04 ?today=2026-11-15 sets the default entry date and the saved data-date (349ms)
  ✓ 10 [chromium] › e2e/p1.spec.js › E2E-P1-05 375x812 with long unicode name, long unicode note, and a fractional amount (326ms)
  ✓ 11 [chromium] › e2e/p1.spec.js › E2E-P1-06 money parsing and rendering through the entry form (D4, N4) (588ms)
  ✓ 12 [chromium] › e2e/p1.spec.js › E2E-P1-07 entries with equal dates keep the newest-saved first (R4, U-04) (433ms)
  ✓ 13 [chromium] › e2e/p1.spec.js › E2E-P1-08 a later successful save clears the storage warning and persists (N5) (554ms)
  ... 23 P0 tests green ...
  31 passed (12.5s)

$ npx playwright test --list | tail -1
Total: 31 tests in 5 files
```

Independent oracle values asserted from the spec (not from `app/`):

```
2 customers + 4 entries (credit 1500, credit 420, payment 180, credit 670.50)
  balance = 150000 + 42000 + 67050 - 18000 = 241050 paise -> [data-balance] text AND attr "2410.50"
  #total-outstanding text "2410.50", data-value "2410.50"           (2410.50 + 0 for the second customer)
  [data-amount] text = attr = {1500, 420, 180, 670.50}, all matching ^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$
  whole value renders "0" and "1500" (no decimals); fractional renders exactly two decimals
reload
  same 2 rows, balances 2410.50 / 0, total 2410.50, 4 entries in order 12, 10, 05, 01
storage forced to throw (Storage.prototype.setItem)
  #storage-msg visible with a non-empty warning; in-memory total 2410.50 + 10 = 2420.50; 5 entries; no console error
row link + direct ?customer=
  #cust-name "Ravi Kumar", #cust-balance text/attr "2410.50", 4 entries newest-first, total 2485.50 with the other customer
?today=2026-11-15&customer=9000000101
  #entry-date value "2026-11-15"; saved li[data-entry-id] data-date "2026-11-15"
375x812, 120-char Telugu name, 100-char unicode note, 670.50
  documentElement.scrollWidth 375, body.scrollWidth 375, 0 elements with right edge > 376, amounts not clipped
money path
  "Rs 1,500" -> 1500; "12.345" -> 12.35; "0.05" -> 0.05; "-250" credit -> 250; payment 50 subtracts;
  balances 1500 -> 1512.35 -> 1512.40 -> 1762.40 -> 1712.40; ""/"abc"/"0" rejected with a visible #entry-msg
same-date order
  100, 200, 300 all on 2026-10-05 then 50 on 2026-10-06 -> order 50, 300, 200, 100 (newest insertion first)
```

Non-vacuity check (same suite against a deliberately broken copy of `app/` in `/tmp`, served on :4174; the real `app/` was never touched): payments were made to add instead of subtract, and the storage warning was suppressed. Result: **4/8 P1 cases failed** with exact mismatches — E2E-P1-01 and E2E-P1-03 `Expected "2410.50", Received "2770.50"`; E2E-P1-06 `Expected "1712.40", Received "1812.40"`; E2E-P1-02 failed on the missing `#storage-msg` warning. E2E-P1-04/05/07/08 are unaffected by those two mutations and stayed green, as expected.

Verdict: PASS

Notes:

- **`[data-balance]` duplication is contract-mandated, not a defect:** each customer row carries `[data-balance]` (§1.2) and `#cust-balance` carries `data-balance` (§1.7), so a *global* `[data-balance]` scan sees rows + 1. E2E-P1-01 asserts every row value exactly and records the global count (3 for two customers) instead of pretending it is 2. Any grader or later test must stay row-scoped; if a future hidden-data check counts `[data-balance]` globally, that must be raised with the Planner (CONTRACT change, human gate) — it is not the Coder's bug.
- E2E-P1-02 names the Coder-reported `#storage-msg` as the visible N5 warning node. The other Coder-reported non-contract ids (`#entry-customer`, `#total-human`, `#cust-view-title`, `#cust-phone`, `#cust-balance-human`, `#entries-empty`, `#back-to-list`) are recorded in `docs/TEST-CASES.md` §7 and are not treated as contract nodes.
- `#customer-view` is now static, so `/` shows `#cust-name` "Select a customer", `#cust-balance` `0` and an empty `#entries`. This does not violate §2 (those ids are not in the always-rendered list) and the P0 suite stays green; C-17 still gets "Customer not found" for an unknown phone.
- No external request is made on the P1 routes: E2E-P1-03 (direct `?customer=`) and E2E-P1-04 (`?today=&customer=`) now assert every request is same-origin or `data:`/`blob:`. C-23 (Vercel shape) and C-22 remain green.
- `docs/TEST-CASES.md` v0.6: added **E2E-P1-06** (money parse/render), **E2E-P1-07** (same-date tie-break), **E2E-P1-08** (storage recovery); named `#storage-msg` in E2E-P1-02; added the P1 non-contract hook list and the `[data-balance]` note. No P0 case, existing ID, or existing expected value changed.
- Still not run (later gates): C-04…C-08, C-24…C-38 (P2/P3/P4), U-01…U-14, I-01…I-10, F-01/F-02, N-01…N-04, N-06.
- Doc-sync leftovers the Tester may not write: `TRACEABILITY.md` should now map R1/R2/R3/R4/R7/R9/N4/N5/N2 to E2E-P1-01…08 (P1) and drop those `TBD`s; `worklog.md` needs the RUN-4 line and the P1 gate entry.
- The Tester did not edit `app/`. Coder handoff checksums at verification time: `app/index.html 669c644fb999…`, `app/app.js c9bf08e289d8…`, `app/styles.css 24239b30acdd…`.

### RUN-5 | 2026-11-17 16:57 EST | phase P2 | gate P2 (pre-gate verification)

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 for C-20, E2E-P0-03, E2E-P1-05, E2E-P2-05; light scheme plus emulated `prefers-color-scheme: dark` for C-21/E2E-P0-03; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker; 7 spec files.

Cases: 37/37 passed | Failing: none
- P0 regression: 23/23 (C-01–C-03, C-09–C-23, C-39, N-05, E2E-P0-01–03)
- P1 regression: 8/8 (E2E-P1-01…08)
- P2 gate: 5/5 (E2E-P2-01, E2E-P2-02, E2E-P2-03, E2E-P2-04, E2E-P2-05) plus **F-01 = 50 datasets, seed `20261117`** (1 test)

Bugs filed: none | Bugs closed: none

Evidence:

```
$ npx playwright test
Running 37 tests using 1 worker
  ✓ 14 [chromium] › e2e/p2.spec.js › E2E-P2-01 (C-04/C-05/C-06/C-34) sample import: 11820, 8 rows, every balance matches sample-expected.json (341ms)
  ✓ 15 [chromium] › e2e/p2.spec.js › E2E-P2-02 (I-01) a second import replaces the first shop and reload keeps the second (516ms)
  ✓ 16 [chromium] › e2e/p2.spec.js › E2E-P2-03 (C-33/I-10) malformed JSON keeps state; missing lists warn; empty arrays render an empty shop (471ms)
  ✓ 17 [chromium] › e2e/p2.spec.js › E2E-P2-04 (I-04/I-05/I-06/I-07/U-02/U-03) dedupe, unknown phone, zero entries, decorated amounts, type casing (356ms)
  ✓ 18 [chromium] › e2e/p2.spec.js › E2E-P2-05 imported sample at 375x812: no sideways scroll, balances not clipped (447ms)
F-01 seed 20261117 datasets 50 :: {"shops":50,"customers":160,"entries":297,"duplicatePhoneShops":21,
  "negativeBalanceRows":56,"zeroBalanceRows":98,"unknownPhoneEntries":203,"unicodeNames":41,
  "stringAmounts":172,"missingAmounts":31,"missingTypes":27,"missingDates":64,"negativeTotalShops":17,
  "emptyShops":1}
  ✓ 19 [chromium] › fuzz/p2-fuzz.spec.js › F-01 50-shop fuzz: every balance and the total equal the independent computation (425ms)
  ... 23 P0 + 8 P1 green ...
  37 passed (15.6s)

$ npx playwright test --list | tail -1
Total: 37 tests in 7 files
```

Independent oracle values asserted from the spec/sample files (never from `app/`):

```
sample-data.json + sample-expected.json (oracle files, not constants copied from the app)
  #total-outstanding text == data-value == "11820"; 8 [data-customer];
  each [data-balance] text == attribute == String(sample-expected.balances[phone]);
  sum(expected balances) == 11820; row set == the 8 expected phones; no Rs/₹/,/space in machine text

second shop (credit 1000 / payment 250.50)
  2 rows; balances "1000" and "-250.50"; total "749.50"; all 8 sample phones absent; reload keeps it

malformed / missing / non-array / empty
  "{"customers": [" -> #import-msg contains "Could not import", 8 rows and 11820 intact, 9000000101 == "670"
  [1,2,3]                     -> same refusal, state unchanged
  {"shop":"Only A Name"}      -> success + Warning, 0 rows, total "0"
  customers:"nope"/entries:42 -> success + Warning, 0 rows, total "0"
  {"customers":[],"entries":[]} -> 0 rows, total "0", empty-state text, no crash

dedupe / D4 / D9 / D10 / D11 (one import)
  5 rows: 9000000101 "Ravi K Sharma", 9000000102, 9000000103, 9000000104 "0", 9000000105 "0",
          plus auto-created "Customer 9000000109"
  balances: 101 = 1500+1500-670.50-12.35+5+7 = "2329.15"; 102 = "100" (unknown type -> credit);
            103 = "10" (missing type -> credit); 104 = "0"; 105 = "250"
  total "2689.15"; message contains "duplicate" and "9000000101", and both type warnings
  entries 101 newest-first: 10-08/7, 10-08/5, 10-04/12.35, 10-03/670.50, 10-02/1500, 10-01/1500

375x812 with the sample imported
  documentElement.scrollWidth 375, body.scrollWidth 375, 8 rows, no clipped balance, right edge <= 376
```

Non-vacuity checks (mutant copies in `/tmp` served on :4174; the real `app/` was never touched):

```
mutation: payments add instead of subtract (fuzz)
  F-01 failed at dataset 0 (seed 20261117): 9000000101 balance text
  Expected: "-247683.35"   Received: "253683.35"

mutation (P1 pass, re-used as the import regression guard): the same mutation is what the
  E2E-P1 and E2E-P2 balance assertions compare against, so a money regression cannot pass silently.
```

Verdict: PASS

Notes:

- **P2 is the 60-mark surface and it is green on the exact sample**: `11820`, 8 rows, every balance byte-equal to `sample-expected.json` in both text and attribute, with the totals independently summed to `11820`.
- Import reads `#import-box.value` at click time (CONTRACT §1.4): every P2 test and the fuzz set `.value` directly and fire no `input`/`change` events.
- Replace semantics hold: after the second import no sample phone, balance, or total survives, and reload keeps only the second shop.
- Dedupe follows D9 exactly: same name+phone collapses with no warning; same phone with a different name keeps the last name and warns with the phone; same name on two phones yields two rows; an entry for an unknown phone auto-creates `Customer <phone>` (D10) and is counted in the total; a customer with no entries renders `0`.
- `12.345` renders `12.35` (third digit ≥ 5 rounds half away from zero, never to the rupee), `0.05` keeps two paise digits, whole values keep none, and no machine node contains `Rs`, `₹`, `,` or space.
- The fuzz computes phone/name normalisation, the §3.2 money parse, type mapping, balances, the total and the §3.3 rendering **in the test process** and compares all 50 shops row by row; the summary line above proves the dataset set includes zero-entry customers, negative balances/totals, duplicate phones, unknown-phone entries, string amounts, missing amounts/types/dates, unicode names, same-date ties, and an empty shop. P6 will scale this to 200 datasets (F-02).
- Console/network/layout: every P2 test asserts no console error, no failed request, no unhandled rejection; the post-import 375 px check passes; C-22 (no external request), C-23 (Vercel shape), C-39 and C-21 remain green, so the import surface added no regression to the P0/P1 contract.
- `docs/TEST-CASES.md` v0.7 adds E2E-P2-01…05 and the P2 mapping (I-01, C-33, C-08/C-34, I-04–I-07, I-10, U-02/U-03 executed inside the E2E-P2 tests; F-01 = 50 datasets, seed in this RUN). No existing case, ID, or expected value changed.
- Still not run (later gates): C-07 (P3), C-24–C-32/C-35/C-36/C-38 (P3/P4), U-01/U-04 already covered at P1; I-03/I-08 (P3), I-09 (N5, P1 path), N-01…N-04, N-06, F-02 (P6).
- Doc-sync leftovers the Tester may not write: `TRACEABILITY.md` should map R3/R8/N4 to E2E-P2-01…05 + F-01 and drop the P2 `TBD`s; `worklog.md` needs the RUN-5 line and the P2 gate entry.
- The Tester did not edit `app/`. Coder handoff checksums at verification time: `app/index.html 669c644fb999…`, `app/app.js c5a8ccc60be6…`, `app/styles.css 24239b30acdd…`.

### RUN-6 | 2026-11-17 17:29 EST | phase P3 | gate P3 (pre-gate verification)

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 for C-20, E2E-P0-03, E2E-P1-05, E2E-P2-05; light scheme plus emulated `prefers-color-scheme: dark` for C-21/E2E-P0-03; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker; 8 spec files.

Cases: 42/42 passed | Failing: none
- P0 regression: 23/23 (C-01–C-03, C-09–C-23, C-39, N-05, E2E-P0-01–03)
- P1 regression: 8/8 (E2E-P1-01…08)
- P2 regression: 5/5 (E2E-P2-01…05) + **F-01** 50 datasets, seed `20261117`, green
- P3 gate: 5/5 (E2E-P3-01, E2E-P3-02, E2E-P3-03, E2E-P3-04, E2E-P3-05)

Bugs filed: none | Bugs closed: none

Evidence:

```
$ npx playwright test
Running 42 tests using 1 worker
  ✓ 19 [chromium] › e2e/p3.spec.js › E2E-P3-01 (C-07) reminder href for normal, &, +/%, Telugu, Devanagari, zero and negative balances (329ms)
E2E-P3-02 image sizes: original 5280583 bytes, stored 157319 chars
  ✓ 20 [chromium] › e2e/p3.spec.js › E2E-P3-02 (I-03/N-03) payment with a 3 MB+ image: thumbnail in the right entry, stored under 200 KB, survives reload (942ms)
  ✓ 21 [chromium] › e2e/p3.spec.js › E2E-P3-03 credit with an image and payment without one both save with no img[data-shot] (393ms)
  ✓ 22 [chromium] › e2e/p3.spec.js › E2E-P3-04 (I-08/N-03) quota failure saves the payment without the image and warns; a later save persists (696ms)
  ✓ 23 [chromium] › e2e/p3.spec.js › E2E-P3-05 a non-image file and an undecodable image save the entry without a photo and warn (387ms)
  ... 23 P0 + 8 P1 + 5 P2 + F-01 green ...
  42 passed (17.5s)

$ npx playwright test --list | tail -1
Total: 42 tests in 8 files
```

Image sizes (measured, not asserted from the app):

```
generated original : 5,280,583 bytes (5.03 MB) decodable JPEG, 2600x2000, canvas in the page
stored data URL    : 157,319 characters (153.6 KB)  ->  under the 204,800-character (200 KB) budget
thumbnail src      : data:image/... on exactly one img[data-shot], inside the payment's own li[data-entry-id]
after reload       : same entry, byte-identical src
```

Reminder cases asserted by E2E-P3-01 (5 rows, `#entries` imported via `#import-box`):

```
9000000101  "Ravi Kumar"            balance "670"       -> contains "Ravi Kumar" and "Rs 670"
9000000102  "Anna & Sons"           balance "0"         -> "&" encoded as %26, no raw & in href
9000000103  "Plus + Percent %"      balance "-250.25"   -> "+"/"%" encoded as %2B/%25, negative rendered
9000000104  "రవి కుమార్"             balance "1500.50"   -> unicode round-trips, "Rs 1500.50"
9000000105  "रवि कुमार"              balance "42"        -> Devanagari round-trips, "Rs 42"
each: exactly one a[data-remind="<phone>"], href == "https://wa.me/91" + phone + "?text=" + encodeURIComponent(message),
      no extra query parameter, encodeURIComponent(decoded) === encoded
```

Non-vacuity check (mutant copy in `/tmp` served on :4174; the real `app/` was never touched): the reminder message was left unencoded and the original image was stored instead of the downscaled JPEG. The P3 suite failed 3/5 with exact mismatches:

```
E2E-P3-01: Error: 9000000101 encoding must round-trip exactly
           Expected: "Namaste Ravi Kumar, your balance is Rs 670."
           Received: "Namaste%20Ravi%20Kumar%2C%20your%20balance%20is%20Rs%20670."
E2E-P3-02: img[data-shot] Expected 1, Received 0 (oversized original dropped on render)
E2E-P3-04: #entry-msg expected /screenshot|photo|image/i, received "Payment saved."
```

Verdict: PASS

Notes:

- **Reminder (R6) is exact**: one link per row, the literal `https://wa.me/91<phone>?text=` prefix, no extra query parameter, and `encodeURIComponent(decoded) === encoded` proves the message is encoded once and correctly for `&`, `+`, `%`, Telugu and Devanagari. Zero and negative balances still link and carry `Rs 0` / `Rs -250.25`.
- **Screenshot (R5)**: a 5.0 MB JPEG is stored as a 153.6 KB data URL, renders as exactly one `img[data-shot]` inside the payment's own `li[data-entry-id]`, survives reload with a byte-identical `src`, and never appears on a credit entry or a payment saved without a file. `#shot-input` stays static inside `#entry-form` throughout.
- **Quota (N5/I-08)**: with `Storage.prototype.setItem` throwing, the payment is still saved (2 entries, balance `700`), the image is dropped, `#storage-msg` and `#entry-msg` both warn, and after restoring storage the next save persists the whole in-memory state (3 entries, balance/total `650` after reload).
- **Bad files**: a `text/plain` file and an undecodable `image/png` both save the entry without a photo, with a readable warning, no console error and a still-enabled `#entry-save`.
- **C-38 (OCR) is P4** (D5) and deliberately not exercised at P3; only `#shot-input`/`#entry-save` availability is asserted here. `docs/TEST-CASES.md` v0.8 adds E2E-P3-01…05 and the P3 mapping (C-07 → E2E-P3-01, I-03 → E2E-P3-02, I-08 → E2E-P3-04, N-03 → E2E-P3-02/04, C-38 → P4). No existing case, ID, or expected value changed.
- P0–P2 regression is untouched and green (37/37 within the 42), including the sample import, the 50-shop fuzz, no console errors, no external requests, Vercel shape (C-23), dark contrast (C-21) and 375 px (C-20).
- Doc-sync leftovers the Tester may not write: `TRACEABILITY.md` should map R5/R6 to E2E-P3-01…05 (and C-07/I-03/I-08/N-03 to them) and drop those `TBD`s; `worklog.md` needs the RUN-6 line and the P3 gate entry.
- The Tester did not edit `app/`. Coder handoff checksums at verification time: `app/index.html 669c644fb999…`, `app/app.js 3049401a8749…`, `app/styles.css 291bc99cf82a…`.

### RUN-7 | 2026-11-17 18:04 EST | phase P4 | gate P4 (pre-gate verification)

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 for C-20, E2E-P0-03, E2E-P1-05, E2E-P2-05; light scheme plus emulated `prefers-color-scheme: dark` for C-21/E2E-P0-03; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker; 9 spec files.

Cases: 49/49 passed | Failing: none
- P0 regression: 23/23
- P1 regression: 8/8
- P2 regression: 5/5 + **F-01** (50 datasets, seed `20261117`) green
- P3 regression: 5/5
- **P4 gate: 7/7** — E2E-P4-01 (B1), E2E-P4-02 (B2), E2E-P4-03 (B3), E2E-P4-04 (B4), E2E-P4-05 (B5), E2E-P4-06 (B6), E2E-P4-07 (B7 fallback)

Bugs filed: **BUG-1 (P2, open)** — one untranslated visible label; see below. No P0/P1. Bugs closed: none.

Evidence:

```
$ npx playwright test
Running 49 tests using 1 worker
  ✓ 24 › E2E-P4-01 (C-14/C-28) overdue: 4 sample rows in day order, bare data-days, no data-customer, no-payment excluded, empty state
  ✓ 25 › E2E-P4-02 (C-36) edit 500->800 and delete: amounts, balances, total, id, image, reload, other customer untouched
  ✓ 26 › E2E-P4-03 (C-29) CSV export: exact headers, one row each, newest-first entries, RFC-4180 quoting, current state
  ✓ 27 › E2E-P4-04 (C-30) search filters by name and phone, keeps total and state, restores on clear and reload
  ✓ 28 › E2E-P4-05 (C-35) UPI pay links: one per row, am = max(balance,0), cu=INR once, tn decodes, default and shop VPA
  ✓ 29 › E2E-P4-06 (C-13/N-06) language switch translates labels and leaves every id, attribute, name, date, money text and href byte-identical
  ✓ 30 › E2E-P4-07 (C-38) OCR fallback: upload does not block or overwrite; manual amount saves
  ... 42 P0–P3 + F-01 green ...
  49 passed (24.6s)

$ npx playwright test --list | tail -1
Total: 49 tests in 9 files
```

P4 results against the spec:

```
B1  ?today=2026-11-15, sample: 4 rows in order 9000000105/61, 9000000104/44, 9000000108/43, 9000000102/42
    [data-days] text == attribute, heading "Overdue (30+ days)", 0 [data-customer] inside #overdue,
    no-payment customer excluded, 2026-09-10 payment listed as 66, empty state when nobody is overdue
B2  payment 500 -> edit to 800 (date 2026-10-20, note changed): [data-amount] "800", id unchanged,
    [data-balance]/#cust-balance "-800", total "-600", stored img[data-shot] kept; reload identical;
    delete -> 0 entries, balance "0", total "200"; other customer stayed "200" throughout
B3  customers.csv: phone,name,credit,payment,balance + 3 rows (1249.50 / 670.50 / -100)
    entries.csv: phone,type,amount,date,note + 4 rows newest-first;
    "Doe, Jane", "said ""thanks""", "paid, on UPI", embedded newline all RFC-4180 quoted; no sample data
B4  "sunita"/"SUNITA" -> 9000000102 only; "0104" -> 9000000104 only; no-match -> 0 visible, 8 in DOM;
    total stays 11820; clear and reload restore all 8
B5  pa=hisaab@upi, am=670 / 0 / 0 (never negative), cu=INR once, tn="Anna & Sons" decodes;
    #shop-upi=myshop@bank -> every link pa=myshop@bank and the demo note hides
B6  en/hi/te: #overdue-title, #add-customer, #entry-save and the search label all translate;
    the machine snapshot (total, balances, ids, attrs, names, dates, amounts, notes, reminder/UPI/?customer= hrefs,
    option values, #import-box content, 19 §2 ids) is byte-identical across languages; reload resets to en
B7  no OCR engine (D5): after upload #entry-amount stayed "" (allowed), #entry-save never blocked,
    typed 999 survived a second upload, payment saved with [data-amount] "999"; no console error
```

Screenshots and text evidence saved under `tests/artifacts/` (gitignored):

```
p4-overdue.png         33 KB  overdue heading, label and the four ordered rows
p4-csv.png             81 KB  page after #export-csv with #export-msg
p4-customers.csv      164 B   exported current-state customers file
p4-entries.csv        237 B   exported current-state entries file (newest first)
p4-upi.png             36 KB  customer list with the UPI pay links
p4-upi-hrefs.txt      164 B   upi://pay?pa=hisaab@upi&am=670&cu=INR&tn=Ravi%20Kumar …
p4-lang-hi.png         48 KB  Hindi labels
p4-lang-te.png         61 KB  Telugu labels
p4-lang-labels.txt    574 B   en/hi/te label strings
p4-ocr-fallback.png    45 KB  upload selected, typed manual amount, save enabled
p4-ocr-fallback.txt   128 B   recorded empty prefill, preserved "999", no engine
```

Non-vacuity checks (mutant copy in `/tmp` served on :4174; the real `app/` was never touched):

```
overdue threshold 30 -> 45   E2E-P4-01 failed (only 1 row instead of 4)
CSV header credits typo      E2E-P4-03 failed on the exact header row
UPI am = raw balance         E2E-P4-05 failed: Expected "0", Received "-250.25"
```

Verdict: PASS (one open P2, BUG-1; no P0/P1)

Notes:

- **BUG-1 | severity P2 | phase P4 | E2E-P4-06**
  Expected: after selecting `hi` or `te`, visible UI labels translate (PRD B6; CONTRACT §5.5).
  Actual: `#upi-demo-note` keeps the English text `Demo UPI ID — set your shop UPI ID` in both `hi` and `te`; every other sampled label translates (search label, `#overdue-title`, `#add-customer`, `#entry-save`, `#customers` and `#entries` empty states, `#overdue` day text).
  Repro: `python3 -m http.server 4173 --directory app` → open `/` → select `hi` in `#lang-switch` → read `#upi-demo-note`.
  Evidence: `tests/artifacts/p4-lang-hi.png`, `p4-lang-labels.txt`; console audit printed `UPI_NOTE_HI: "Demo UPI ID — set your shop UPI ID"`.
  Suspected layer: render/i18n (the node has no `data-i18n` key).
  Root cause: stated, not guessed — `#upi-demo-note` is the one visible label in the sample that carries no `data-i18n` attribute, so `applyStaticLabels()` never rewrites it.
  Contract impact: none on machine nodes; B6 is a bonus item, so this is P2 and needs a Critic waiver, not a gate block. B6's scripted checks (known labels + byte-identical machine state) still pass.
- B7 is the **D5 manual fallback only**: no OCR engine ships in P4. The test records that the amount stayed empty after upload (permitted), that typing is never overwritten, and that the entry saves with the manual amount. This is not a P0/P1 defect; OCR remains a P4/P6 judgement call for the Planner.
- `#overdue` day math, ordering and D1 exclusions match an independent calendar computation under `?today=2026-11-15`; `data-days` is bare in text and attribute.
- CSV files come from current state, not the sample (no sample phone appears after a second import), with exact D8 headers and RFC-4180 quoting verified by a parser written in the test.
- Search hides rows with the `hidden` attribute (0 removed from the DOM) and never touches the total or the import section; reload restores everything.
- UPI links use `max(balance,0)`, `cu=INR` exactly once, and the name percent-encoded; `#shop-upi` replaces the default `hisaab@upi` and hides the demo note.
- Language switching changes no id, attribute, `data-*` value, customer name, date, machine money text, href, option value or `#import-box` content. The `/` placeholder `Select a customer` does translate — that is UI text, not data — so the test asserts machine identity on a real customer view (`?customer=9000000101`).
- P0–P3 regression untouched and green (42/42 within the 49), including sample import, 50-shop fuzz, reminder/image/quota paths, 375 px, dark contrast, Vercel shape, no console errors and no external requests.
- `docs/TEST-CASES.md` v0.9 adds E2E-P4-01…07 and the P4 mapping (C-14/C-28, C-36, C-29, C-30, C-35, C-13/N-06 and C-38 executed inside those tests; Coder-reported non-contract hooks listed). No existing case, ID, or expected value changed.
- Doc-sync leftovers the Tester may not write: `TRACEABILITY.md` should map B1–B7 to E2E-P4-01…07 and drop those `TBD`s; `worklog.md` needs the RUN-7 line and the P4 gate entry with the BUG-1 waiver decision.
- The Tester did not edit `app/`. Coder handoff checksums at verification time: `app/index.html b6f58e9d03dc…`, `app/app.js 15ea8cfd1d6e…`, `app/styles.css 196813901119…`.

### RUN-8 | 2026-11-17 18:07 EST | phase P4 | gate P4 (BUG-1 re-verification)

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 for C-20, E2E-P0-03, E2E-P1-05, E2E-P2-05; light scheme plus emulated `prefers-color-scheme: dark` for C-21/E2E-P0-03; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker; 9 spec files.

Cases: 49/49 passed | Failing: none
- P0 23/23, P1 8/8, P2 5/5 + F-01 (50 datasets, seed `20261117`), P3 5/5, **P4 7/7** — unchanged in scope or expected values from RUN-7.

Bugs filed: none | **Bugs closed: BUG-1 (P2, `#upi-demo-note` untranslated)**

Evidence:

```
$ npx playwright test
Running 49 tests using 1 worker
  ✓ 29 [chromium] › e2e/p4.spec.js:475:1 › E2E-P4-06 (C-13/N-06) language switch translates labels and leaves every id, attribute, name, date, money text and href byte-identical (627ms)
  ... all other 48 P0–P4 + F-01 cases green ...
  49 passed (24.6s)

$ npx playwright test --list | tail -1
Total: 49 tests in 9 files
```

BUG-1 repro re-run (the exact steps recorded in RUN-7), reading `#upi-demo-note` after each switch:

```
en: "Demo UPI ID — set your shop UPI ID"
hi: "डेमो UPI ID — अपनी दुकान की UPI ID सेट करें"
te: "డెమో UPI ID — మీ షాప్ UPI ID సెట్ చేయండి"
```

Verdict: PASS — **BUG-1 closed**

Notes:

- **New assertion (E2E-P4-06, same test, no new test added):** `#upi-demo-note` must be visible and its text must be exactly `Demo UPI ID — set your shop UPI ID` on `en`; in `hi` and `te` its text must be non-empty and different from the English string. Every existing B6 assertion is untouched: label translation for `#overdue-title`/`#add-customer`/`#entry-save`/search, the full machine snapshot (`#total-outstanding` text + `data-value`, every row's `[data-balance]` text/attribute, `[data-customer]` keys, reminder/UPI/`?customer=` hrefs, entry id/type/date/amount/note, `#cust-name`, `#cust-balance` text/attribute, `#entry-type` and `#entry-customer` option values, `#import-box` content, the 19 §2 ids, `#lang-switch` option values), and the reload reset to `en`. Nothing was weakened or removed.
- **Regression proof:** the added assertion was run against a copy of `app/` in `/tmp` with the pre-fix markup restored (no `data-i18n` on `#upi-demo-note`, served on :4174). E2E-P4-06 failed with `hi demo UPI note must translate (BUG-1 regression)` / `Expected: not "Demo UPI ID — set your shop UPI ID"`, so the case genuinely catches BUG-1 rather than passing vacuously. The real `app/` was not touched.
- English is byte-identical to the pre-fix string (same em dash, same wording), so no other test or artifact changed.
- **`docs/TEST-CASES.md` stays v0.9** with no edits: B6's acceptance already covers "visible labels translate", and the demo note is one of them, so no case ID or expected value needed to change. The regression lives in E2E-P4-06 per the "no case weakened" rule.
- Screenshots from RUN-7 (`tests/artifacts/p4-lang-hi.png`, `p4-lang-te.png`, `p4-lang-labels.txt`) were regenerated by this run and now show the translated demo note.
- Doc-sync leftovers the Tester may not write: `worklog.md` needs the RUN-8 line and the BUG-1 closure; `TRACEABILITY.md` still needs the B1–B7 → E2E-P4-01…07 mapping.
- The Tester did not edit `app/`. Coder handoff checksums at verification time: `app/index.html bd38d3cedfef…`, `app/app.js b8d2194ea4f5…`, `app/styles.css 196813901119…`.

### RUN-9 | 2026-11-17 19:17 EST | phase P5 | gate P5 (pre-gate verification)

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; **375×812 for all P5 cases**; light scheme plus emulated `prefers-color-scheme: dark` for C-21, E2E-P0-03 and E2E-P5-03; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker; 10 spec files.

Cases: 53/53 passed | Failing: none
- P0 regression 23/23, P1 8/8, P2 5/5 + **F-01** (50 datasets, seed `20261117`), P3 5/5, P4 7/7
- **P5 gate: 4/4** — E2E-P5-01, E2E-P5-02, E2E-P5-03, E2E-P5-04

Bugs filed: none | Bugs closed: none

Evidence:

```
$ npx playwright test
Running 53 tests using 1 worker
  ✓ 31 [chromium] › e2e/p5.spec.js › E2E-P5-01 (R9/N2) sample at 375x812: no sideways scroll, every node reachable, amounts not clipped
  ✓ 32 [chromium] › e2e/p5.spec.js › E2E-P5-02 (R9/N2) adversarial 200-customer shop at 375x812: all rows in DOM, long text wraps, thumbnail safe
  ✓ 33 [chromium] › e2e/p5.spec.js › E2E-P5-03 (N3) contrast in light and dark: text >= 4.5:1, large text and control borders >= 3:1
  ✓ 34 [chromium] › e2e/p5.spec.js › E2E-P5-04 (N2/N3) tap targets >= 40px, no overflow masking, no fixed/sticky overlay
  ... 49 P0–P4 + F-01 green ...
  53 passed (26.2s)

$ npx playwright test --list | tail -1
Total: 53 tests in 10 files
```

375×812 layout (sample): `documentElement.scrollWidth` 375, `body.scrollWidth` 375, 0 elements with a right edge past 376, 8 rows, every amount node unclipped, `#total-outstanding`/`#import-box`/`#import-go`/`#shot-input`/`#overdue`/`#entries`/`#lang-switch` visible.

Adversarial 200-customer shop (from `tests/artifacts/p5-adversarial-metrics.txt`):

```
rows: 200                  documentScrollWidth: 375      bodyScrollWidth: 375
name  (45 chars):  { clipped: false, width: 283, right: 329 }
note  (100 chars): { clipped: false, width: 283, right: 329 }
thumbnail:         { width: 64, right: 110, maxWidth: "100%" }
```

Contrast (`tests/artifacts/p5-contrast.txt`, minima per scheme):

```
light: text min 5.02 (#import-go white on accent) / body 17.47 / muted 5.97
       borders 3.82 (all 12 inputs, ghost link 5.49, thumbnail 3.82)
dark : text min 6.78 (#total-human muted) / body 17.1
       borders 3.69 (all 12 inputs, ghost link 4.34, thumbnail 3.69)
color-scheme: "light dark"
```

Tap targets, masking and overlays (`tests/artifacts/p5-tap-targets.txt`):

```
controls sampled: 53       min height: 44px
fixed/sticky overlays: 0
overflow-x: html visible, body visible, main visible
```

Screenshots and evidence under `tests/artifacts/` (gitignored):

```
p5-375-light.png          298 KB  full-page sample at 375 px, light
p5-375-adversarial.png     39 KB  200-customer shop at 375 px with the thumbnail
p5-adversarial-metrics.txt      200 rows / 375 / wrap / thumbnail numbers
p5-contrast-dark.png       37 KB  375 px dark with the customer view and thumbnail
p5-contrast.txt          2.2 KB  light and dark ratios for text, borders, thumbnail
p5-tap-targets.png         39 KB  375 px form area used for the tap audit
p5-tap-targets.txt              53 controls, 44 px minimum, 0 overlays, overflow-x
```

Non-vacuity checks (mutant CSS in `/tmp` served on :4174; the real `app/` was never touched):

```
375px rows forced to 400px        E2E-P5-01 and E2E-P5-02 failed: scrollWidth 446 > 375
light --border #F1EBE2            E2E-P5-03 failed: "#lang-switch border contrast 1.18"
--tap 24px                        E2E-P5-04 failed: 12 Edit/Delete buttons at 34.3px
body { overflow-x: hidden }       E2E-P5-04 failed on the masking assertion
```

Verdict: PASS

Notes:

- **No masking and no overlay:** `html`, `body` and `main` all compute `overflow-x: visible`; there are **zero** fixed or sticky elements, so no sticky bar can cover the import section or the last row. The test still asserts the non-intersection rule so a future sticky header cannot regress it.
- **Tap targets:** 53 visible interactive controls (buttons, links, inputs, selects, textarea, file input) were sampled; the minimum rendered height is exactly **44 px**, matching the `--tap` token. The Edit/Delete entry buttons, the Open/remind/UPI links, `#lang-switch`, `#shop-upi`, the file input and every form control are included.
- **Adversarial layout:** all 200 customers stay in the DOM (no pagination/virtualisation), a 45-character Telugu name and a 100-character unbroken Telugu note both wrap to 283 px, `250000.50` amounts are neither clipped nor abbreviated, and the thumbnail is 64 px with `max-width: 100%`.
- **Contrast:** the P5 CSS pass had already strengthened `--border` (light `#8A8178` = 3.82:1 on white; dark ~`#7A7066` = 3.69:1 on surface), so control boundaries clear the 3:1 bar in both schemes; the lowest *text* ratio is 5.02:1 (white on the accent button) and the lowest muted text is 5.97:1 light / 6.78:1 dark. Large text (27 px/700 totals, 20 px titles) clears 3:1 with wide margin.
- Test-harness note: the first draft of E2E-P5-02 read the *first* `.entry-note` (the 9-character UI-saved "thumbnail" note) instead of the 100-character imported note; fixed to select the note whose text length is ≥100 before asserting wrapping. No app change or weakened assertion was involved.
- `docs/TEST-CASES.md` v0.10 adds E2E-P5-01…04 and the P5 mapping (R9/N2/N3 with N-01/N-02/N-04 executed inside them; B6 stays in E2E-P4-06). No existing case, ID, or expected value changed.
- Doc-sync leftovers the Tester may not write: `TRACEABILITY.md` should map R9/N2/N3 and N-01/N-02/N-04 to E2E-P5-01…04; `worklog.md` needs the RUN-9 line and the P5 gate entry.
- The Tester did not edit `app/`. Coder handoff checksums at verification time: `app/index.html bd38d3cedfef…`, `app/app.js b8d2194ea4f5…`, `app/styles.css 8b799aa1e618…` (CSS-only P5 change).

### RUN-10 | 2026-11-17 19:55 EST | phase P6 | gate P6 (final verification)

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 for the P5 cases and the journey's phone step; light scheme plus emulated `prefers-color-scheme: dark` for C-21, E2E-P0-03, E2E-P5-03 and the journey's dark step; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker; 11 spec files.

Cases: 56/56 passed | Failing: none
- P0 23/23, P1 8/8, P2 5/5, P3 5/5, P4 7/7, P5 4/4
- **F-01** 50 datasets (seed `20261117`) and **F-02** **200 datasets (seed `20261118`)**
- **P6 gate: E2E-P6-01** (full journey) and **E2E-P6-02** (empty-name duplicate)

Bugs filed: **BUG-2 (P3, open)** | Bugs closed in this run: none (BUG-1 closed in RUN-8)

Evidence:

```
$ npx playwright test
Running 56 tests using 1 worker
  ✓ [chromium] › e2e/p6.spec.js › E2E-P6-01 full journey: import, replace, customer, reminder, image, B1–B6, 375, dark, clear, quota, ?today (1.2s)
  ✓ [chromium] › e2e/p6.spec.js › E2E-P6-02 duplicate phone with a later empty name: one row, documented name choice, no loss
  ✓ [chromium] › fuzz/p2-fuzz.spec.js › F-02 200-shop fuzz (hardening): every balance and total equal the independent computation (1.0s)
  ... all other 53 P0–P5 + F-01 cases green ...
  56 passed (28.8s)

$ npx playwright test --list | tail -1
Total: 56 tests in 11 files
```

F-02 (200 datasets, seed `20261118`, independent oracle in the test process):

```
F-02 seed 20261118 datasets 200 :: {"shops":200,"customers":805,"entries":1401,"duplicatePhoneShops":79,
  "emptyNameDuplicateRecords":2,"clampedEntries":1,"negativeBalanceRows":293,"zeroBalanceRows":394,
  "unknownPhoneEntries":868,"unicodeNames":360,"stringAmounts":788,"missingAmounts":134,"missingTypes":107,
  "missingDates":242,"negativeTotalShops":52,"emptyShops":3,"customersInLargestShop":202}
0 mismatches: every [data-balance] text/attribute and #total-outstanding text/data-value matched the
computed §3.3 rendering; row sets matched exactly (no row dropped); no NaN/undefined; no console error.
```

F-02 coverage includes the required hostile mix: zero-entry customers, over/underpayment with negative balances and 52 negative totals, 79 shops with duplicate phones (same/different names, plus 2 later-empty-name records), 868 entries for unknown phones, string/comma/decimal amounts (788 strings), 134 missing amounts, 107 missing types, 242 missing dates, 360 unicode names, same-date ties, one clamped value (`99999999999999999` → `9000000000000000` paise), 3 empty shops and a 202-customer shop.

E2E-P6-01 journey (single test, one diagnostics object for the whole run):

```
sample import            total 11820, 8 rows, every balance == sample-expected.json
second shop              total 749.50, 2 rows, reload keeps it, all 8 sample phones gone
re-import sample         total 11820, 8 rows
?customer=9000000101     "Ravi Kumar", balance "670", 6 entries (count derived from sample-data.json)
reminder                 https://wa.me/919000000101?text= + encodeURIComponent(message); name + "Rs 670";
                         no extra parameter; re-encoding round-trips
payment + screenshot     7 entries, #cust-balance 570, exactly one img[data-shot] in that entry; reload keeps it
B2 edit 100 -> 150       balance 520, image retained; delete -> 670, 6 entries; reload identical
B1 ?today=2026-11-15     4 rows 61 / 44 / 43 / 42, bare [data-days], 0 data-customer inside #overdue
B3 CSVs                  customers.csv 8 rows + D8 header; entries.csv 1 + 38 rows; every numeric cell bare
B4 search                "sunita" -> only 9000000102, total unchanged; clear -> 8 visible
B5 UPI                   pa=hisaab@upi&am=670&cu=INR&tn=Ravi Kumar (cu=INR once)
B6 language              hi changes the overdue title; 11820 and 670 unchanged; en restores
375 px                   documentElement and body scrollWidth <= 375
dark                     body / #total-outstanding / #cust-balance >= 4.5:1
clear storage            total 0, 0 rows, "No customers", 19 §2 ids present
forced quota             entry kept (50), #storage-msg visible; after restore 75 persists through reload
?today=2026-12-01        8 overdue rows, 9000000105 first at 77 days, days non-increasing
?today=2026-11-15        first row 61 days
network                  no third-party request; no console error, failed request or rejection
```

Artifacts: `tests/artifacts/p6-journey-end.png`, `p6-customers.csv`, `p6-entries.csv`, `p6-empty-name-duplicate.txt` (plus the earlier P4/P5 evidence).

Verdict: PASS (one open P3, BUG-2; no P0/P1)

Notes:

- **BUG-2 | severity P3 | phase P6 | case E2E-P6-02**
  Expected (P6 hardening rule for a duplicate phone whose later record has an empty name): either keep the earlier non-empty name **with** a `duplicate` warning, or take the later name.
  Actual: the earlier name `Ravi Kumar` is kept and **no** duplicate warning is emitted; `#import-msg` is only `Imported "Empty Name Case": 1 customer, total 100.`
  Repro: `python3 -m http.server 4173 --directory app` → open `/` → paste `{"shop":"Empty Name Case","customers":[{"name":"Ravi Kumar","phone":"9000000001"},{"name":"","phone":"9000000001"}],"entries":[{"phone":"9000000001","type":"credit","amount":100,"date":"2026-10-01"}]}` → click `#import-go` → read `#import-msg`.
  Evidence: `tests/artifacts/p6-empty-name-duplicate.txt` (`duplicate warning present: false`) and the run log line `E2E-P6-02 observed: keptName="Ravi Kumar" duplicateWarning=false`.
  Suspected layer: import/normalise (the duplicate branch in `buildImportState`).
  Root cause: stated, not guessed — the duplicate-name comparison is inside `else if (name)`, so a later record with an empty name is skipped entirely: it neither renames nor registers a duplicate.
  Contract impact: none on machine nodes; D9 speaks of a "different name", and an empty string is arguably not a name, so this is a P3 advisory that needs a Critic waiver and does not block the gate. No row loss, no crash, balance intact.
- The journey's counts are derived from `sample-data.json` (6 entries for `9000000101`, 38 entries overall) instead of being hardcoded; the first run of the journey caught exactly that mistake (expected 4 entries, received 6) and the test was corrected to the file-derived oracle, not to the app.
- `docs/TEST-CASES.md` v0.11 adds E2E-P6-01 and E2E-P6-02, makes F-02 concrete (200 datasets, seed `20261118`), and adds the P6 mapping (F-02 for the 60-mark hidden data; E2E-P6-01 re-reads R1–R10 and B1–B6; B7 stays in E2E-P4-07; N1–N6 covered). No existing ID was removed and no expected value was weakened.
- Gate status: every phase case green, F-01 and F-02 green, no open P0/P1. The only open item is BUG-2 (P3), which requires a Critic waiver under `AGENTS.md` §6.
- Doc-sync leftovers the Tester may not write: `TRACEABILITY.md` should map F-02 and E2E-P6-01/02 (and mark N6 as covered by the journey); `worklog.md` needs the RUN-10 line, the P6 gate entry and the BUG-2 waiver decision.
- The Tester did not edit `app/`. App checksums at verification time: `app/index.html bd38d3cedfef…`, `app/app.js b8d2194ea4f5…`, `app/styles.css 8b799aa1e618…`.

### RUN-11 | 2026-11-17 20:32 EST | phase P6 | gate P6 (BUG-2 re-verification)

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time (the previous server had been up 1 h 13 min and stalled; it was stopped and a fresh one started before this run — see Notes); `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 for the P5 cases and the journey's phone step; light plus emulated `prefers-color-scheme: dark` for C-21, E2E-P0-03, E2E-P5-03 and the journey's dark step; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker; 11 spec files.

Cases: 56/56 passed | Failing: none
- P0 23/23, P1 8/8, P2 5/5, P3 5/5, P4 7/7, P5 4/4
- **F-01** 50 datasets (seed `20261117`) and **F-02** **200 datasets (seed `20261118`)** — both green
- **E2E-P6-01** full journey and **E2E-P6-02** duplicate-phone matrix — green

Bugs filed: none | **Bugs closed: BUG-2 (P3, duplicate phone with a later empty name)**

Evidence:

```
$ npx playwright test
Running 56 tests using 1 worker
  ... all 56 cases green ...
  56 passed (28.7s)

$ npx playwright test --list | tail -1
Total: 56 tests in 11 files
```

BUG-2 repro re-run (exact steps from RUN-10), reading `#import-msg`:

```
empty-name case rows:    [{"phone":"9000000001","name":"Ravi Kumar","balance":"100"}]
empty-name message:      "Imported \"Empty Name Case\": 1 customer, total 100.
                          Warning: duplicate phone 9000000001; the later record had no name,
                          so the earlier name was kept."
later-name message:      "... Warning: duplicate phone 9000000002; kept the last name for that row."
exact-duplicate message: "Imported \"Exact Duplicate\": 1 customer, total 5."   (no warning)
```

F-02 still green on the fixed build (same seed, same 200 datasets):

```
F-02 seed 20261118 datasets 200 :: {"shops":200,"customers":805,"entries":1401,"duplicatePhoneShops":79,
  "emptyNameDuplicateRecords":2,"clampedEntries":1,"negativeBalanceRows":293,"zeroBalanceRows":394,
  "unknownPhoneEntries":868,"unicodeNames":360,"stringAmounts":788,"missingAmounts":134,"missingTypes":107,
  "missingDates":242,"negativeTotalShops":52,"emptyShops":3,"customersInLargestShop":202}
0 mismatches; no row dropped; no NaN/undefined; no console error.
```

Verdict: PASS — **BUG-2 closed**

Notes:

- **New assertions in E2E-P6-02 (same test, no new ID):** the empty-name case now requires exactly one `[data-customer="9000000001"]` row, the display name `Ravi Kumar`, `[data-balance]` text `100`, `#total-outstanding` `100`, a visible `#import-msg` containing both `duplicate` and `9000000001`, and no `Could not import`/console error. The test also adds the two regression guards the fix must not disturb: a later **non-empty** name still wins (`Second Name`, warning with `9000000002`) and an **exact** duplicate stays silent (no `duplicate` in the message, balance `5`). Nothing was removed or weakened.
- **F-02 changed only in its oracle, not its data:** the seed (`20261118`), the 200 datasets and the 202-customer shop are unchanged. The independent model now also flags a later record with an empty name on an existing phone as a duplicate (when an earlier non-empty name exists), matching the fixed rule — this is the model catching up to the documented behaviour, and it is why F-02 now also protects the fix. F-01 is unaffected (no empty names in its mix) and stayed green.
- **Discarded attempt:** an earlier invocation of the full suite at 20:06 ran for 11.3 min and timed out C-03 after 30 s. The failure was infrastructure: the server process had been running for 1 h 13 min and had stopped serving promptly (page snapshot rendered, `goto` stalled). The server was stopped and restarted; a smoke re-run took 5.1 s and the official run above took 28.7 s. The aborted attempt is not counted as a RUN and no app change was made in response.
- `docs/TEST-CASES.md` stays **v0.11** (unmodified in this run): the case text already covers the fixed behaviour via E2E-P6-02's invariants plus the tracked warning, so no ID or expected value needed to change.
- Gate status: every phase case green, F-01 and F-02 green, no open P0/P1 and no open P2; BUG-2 (P3) is closed, so the P6 waiver item is resolved.
- Doc-sync leftovers the Tester may not write: `worklog.md` needs the RUN-11 line and the BUG-2 closure; `TRACEABILITY.md` should record F-02 and E2E-P6-01/02.
- The Tester did not edit `app/`. App checksums at verification time: `app/index.html bd38d3cedfef…`, `app/app.js a62699796a9e…` (BUG-2 fix), `app/styles.css 8b799aa1e618…`.
