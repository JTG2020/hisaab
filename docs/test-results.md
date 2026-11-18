# TEST RESULTS — Hisaab

Version: 0.21
Updated: 2026-11-18
Owner: Tester
Supersedes: test-results.md v0.20

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

### RUN-12 | 2026-11-18 05:30 EST | phase P6 | post-G6 UX fix verification

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 for the P5 cases, the journey's phone step and the E2E-P6-03 tap check; light plus emulated `prefers-color-scheme: dark` where the cases require it; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker; 11 spec files.

Cases: 57/57 passed | Failing: none
- P0 23/23, P1 8/8, P2 5/5, P3 5/5, P4 7/7, P5 4/4
- F-01 50 datasets (seed `20261117`) and F-02 200 datasets (seed `20261118`) green
- P6: E2E-P6-01, E2E-P6-02, **E2E-P6-03 (new)**

Bugs filed: none | Bugs closed: none (BUG-1, BUG-2 remain closed)

Evidence:

```
$ npx playwright test
Running 57 tests using 1 worker
  ✓ [chromium] › e2e/p6.spec.js › E2E-P6-03 post-G6 UX: search empty state, customer picker, add-entry button (504ms)
  ✓ [chromium] › e2e/p4.spec.js › E2E-P4-04 (C-30) search filters by name and phone, keeps total and state, restores on clear and reload (675ms)
  ... all other 55 cases green ...
  57 passed (29.4s)

$ npx playwright test --list | tail -1
Total: 57 tests in 11 files
```

UX fix evidence (`tests/artifacts/p6-ux-fix.txt`, `tests/artifacts/p6-ux-375.png`):

```
search ravi:           1 visible row (9000000101), #search-empty hidden, total 11820
search zzz-no-match:   0 visible, #search-empty visible ("No customers match your search."),
                       8 rows still in the DOM, total 11820
clear:                 8 visible, #search-empty hidden
#entry-customer:       9 options after the sample import (placeholder + 8 customers)
picker save (10):      9000000101 balance "680" (text and attribute), total 11830, survives reload
add-entry button:      #entry-customer value "9000000102", #entry-amount focused,
                       #entry-form scrolled into view; credit 5 -> balance "3475", total 11835
375 px button:         {"height":45.19,"width":154.42,"right":329}; document and body scrollWidth <= 375
```

Verdict: PASS

Notes:

- **Test-authoring correction (brief vs arithmetic):** the task text says the add-entry case ends with "row balance `5`", but `sample-expected.json` gives `9000000102` a balance of **3470**, and the same sentence expects total `11835` (11830 + 5). The only value consistent with the sample and with that total is **3475**, which is what the case asserts (`3470 + 5`). No app change is implied; the brief's "5" reads as a slip for the entry amount.
- `#search-empty` is a new non-contract node (it is not in `CONTRACT.md`); the tests read it only to verify the UX fix and still assert the contract invariants around it: rows are hidden rather than removed, the total never moves, and clearing restores all rows.
- E2E-P4-04 was strengthened, not weakened: it now also requires `#search-empty` to be visible for a no-match query, hidden for a matching query, and hidden after clearing, while keeping the existing 8-row DOM, total, import-section and reload assertions.
- The per-row add-entry control is a `button` with `data-add-entry-for`, so the earlier tap-target audit (E2E-P5-04) also covers it as a 44 px `.btn`; E2E-P6-03 re-measures it at 375 px (45.19 px) and checks it stays inside the viewport with no sideways scroll.
- Asset URLs now carry `?v=6.1`; C-23 still passes because they remain relative `./` paths with no absolute or third-party origin, and C-22 confirms no external request.
- `docs/TEST-CASES.md` v0.12 adds E2E-P6-03 and the P6.1 mapping (search empty state, add-entry button, picker, hint, cache-busting). No existing ID or expected value changed.
- Doc-sync leftovers the Tester may not write: `worklog.md` needs the RUN-12 line and the P6.1 note; `TRACEABILITY.md` should record E2E-P6-03.
- The Tester did not edit `app/`. App checksums at verification time: `app/index.html ea598661a31a…`, `app/app.js 6d990115fff4…`, `app/styles.css 1a9e3c1e4059…`.

### RUN-13 | 2026-11-18 06:18 EST | phase P6 | post-G6.2 layout verification

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 for the P5 cases, the journey's phone step, E2E-P6-03 and E2E-P6-04; light plus emulated `prefers-color-scheme: dark` where required; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker; 11 spec files.

Cases: 58/58 passed | Failing: none
- P0 23/23, P1 8/8, P2 5/5, P3 5/5, P4 7/7, P5 4/4
- F-01 50 datasets (seed `20261117`) and F-02 200 datasets (seed `20261118`) green
- P6: E2E-P6-01, E2E-P6-02, E2E-P6-03, **E2E-P6-04 (new)**

Bugs filed: none | Bugs closed: none (BUG-1, BUG-2 remain closed)

Evidence:

```
$ npx playwright test
Running 58 tests using 1 worker
  ✓ [chromium] › e2e/p6.spec.js › E2E-P6-04 post-G6.2 layout: home order, hidden customer view, search above overdue, routes and 375 (451ms)
  ... all other 57 cases green ...
  58 passed (29.2s)

$ npx playwright test --list | tail -1
Total: 58 tests in 11 files
```

Layout and search evidence (`tests/artifacts/p6-layout-fix.txt`, `tests/artifacts/p6-layout-375-customer.png`):

```
home:              #customer-view hidden (hidden attribute); #customers precedes #overdue in document order;
                   bottom of #search, #customers and each of the 8 rows <= top of #overdue; total 11820
search ravi:       1 visible row (9000000101) above #overdue, #search-empty hidden, total 11820
search zzz-no-match: 0 visible rows, #search-empty visible, 8 rows still in the DOM, total 11820
clear:             8 visible, #search-empty hidden
?customer=9000000101: #customer-view visible, #cust-name "Ravi Kumar", #cust-balance "670",
                   #total-outstanding / #customers / #import-box / #import-go / #shot-input and 8 rows retained
?customer=9000000199: #customer-view visible, "Customer not found", "0"
375 px:            add-entry button {"height":45.19,"right":329}; customer view {"visible":true,"right":359,"width":343};
                   document and body scrollWidth <= 375 on both routes
```

Verdict: PASS

Notes:

- The layout change is purely presentational: `#customer-view` keeps its DOM position (first in `main`) and is toggled with the `hidden` attribute, so every existing selector-level case (C-17, C-09, C-16, E2E-P0-01/02) is unaffected and stayed green.
- The home order is asserted structurally, not by eye: `#customers` must precede `#overdue` in `compareDocumentPosition` terms, and the rendered bottom of `#search`, `#customers` and every row must be at or above the top of `#overdue` — also verified with an active filter that leaves a single row.
- On the customer route the list stays present (8 rows plus `#total-outstanding`, `#customers`, `#import-box`, `#import-go`, `#shot-input`), so CONTRACT §1.7's "do not remove the list" rule still holds now that the view is shown and the list is below it.
- At 375 px the customer view measures 343 px wide with a right edge of 359 and the add-entry button 45.19 px tall inside 329 px; no sideways scroll on `/` or `?customer=`.
- `docs/TEST-CASES.md` v0.13 adds E2E-P6-04 and the P6.2 mapping. No existing ID or expected value changed.
- Doc-sync leftovers the Tester may not write: `worklog.md` needs the RUN-13 line and the P6.2 note; `TRACEABILITY.md` should record E2E-P6-04.
- The Tester did not edit `app/`. App checksums at verification time: `app/index.html 0ee9383e5398…`, `app/app.js 138320ebdde9…`, `app/styles.css 1a9e3c1e4059…`.

### RUN-14 | 2026-11-18 06:44 EST | phase P7 | gate P7 (extras verification)

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 where a case requires it; light plus emulated `prefers-color-scheme: dark` for the theme cases; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker; 12 spec files.

Cases: 63 total | **62 passed, 1 failed** | Failing: **E2E-P7-04**
- Scored regression green: P0 23/23, P1 8/8, P2 5/5, P3 5/5, P4 7/7, P5 4/4, F-01 50 datasets, F-02 200 datasets (seed `20261118`)
- P6 green: E2E-P6-01, E2E-P6-02, E2E-P6-03, E2E-P6-04
- P7: E2E-P7-01, E2E-P7-02, E2E-P7-03, **E2E-P7-04 failed**, E2E-P7-05 green

Bugs filed: **BUG-3 (P1, open)** | Bugs closed: none

Failing assertion:

```
E2E-P7-04 › "brand text contrast below 4.5:1"
  light #owner-display-name    = 3.22 (rgb(22, 19, 16) on rgb(187, 35, 125))
  light #owner-display-address = 1.04 (rgb(107, 98, 89) on rgb(187, 35, 125))
  light #owner-display-upi     = 1.04 (rgb(107, 98, 89) on rgb(187, 35, 125))
  dark  #owner-display-address = 2.01 (rgb(169, 158, 144) on rgb(206, 9, 126))
  dark  #owner-display-upi     = 2.01 (rgb(169, 158, 144) on rgb(206, 9, 126))
  6 passed samples: light #import-go 6.69, dark #import-go 4.62, dark #owner-display-name 4.67,
                    and the functional steps (logo 128 px, header text, persistence, 375, quota)
```

Evidence:

```
$ npx playwright test
Running 63 tests using 1 worker
  ✓ [chromium] › e2e/p7.spec.js › E2E-P7-01 JSON import via #import-file, #import-choose and empty #import-go; paste still imports (495ms)
  ✓ [chromium] › e2e/p7.spec.js › E2E-P7-02 CSV import: primary schema, quoted fields, customers-only, entries-only, malformed and empty (259ms)
  ✓ [chromium] › e2e/p7.spec.js › E2E-P7-03 reminder message carries name, Rs balance and the exact UPI URI; owner UPI applies (327ms)
  ✘ [chromium] › e2e/p7.spec.js › E2E-P7-04 profile and logo: header, persistence, brand contrast light/dark, default palette, 375, quota
  ✓ [chromium] › e2e/p7.spec.js › E2E-P7-05 OCR honesty: hint says manual, no OCR asset or request, upload neither prefills nor blocks (1.7s)
  62 passed, 1 failed (32.9s)

$ npx playwright test --list | tail -1
Total: 63 tests in 12 files
```

P7 extras verified green:

```
JSON file import      #import-choose picker -> 11820 / 8 rows / sample balances; empty #import-go picker
                      -> second shop 749.50 / 2 rows, reload keeps it; pasted sample still imports 11820
CSV import            primary schema with BOM+CRLF+"Doe, Jane"/"said ""hi"""/embedded newline:
                      2 rows, 1249.50 + 670.50, total 1920, shop "shop-a" from the filename;
                      customers-only with shop column -> 2 rows at 0, "Shop B";
                      entries-only -> "Customer 9000000605" 100; unterminated quote -> Could not import,
                      previous shop intact; header-only -> 0 rows + Warning; no phone column -> Could not import
Reminder + UPI URI    decoded wa.me text contains the name, "Rs 670"/"Rs 1500.50" and
                      upi://pay?pa=hisaab@upi&am=<amt>&cu=INR&tn=<encoded> with cu=INR once;
                      exactly one row anchor with the identical href; owner VPA myshop@bank applies to both
Profile (functional)  default #brand-theme empty and button 5.02; logo stored as data:image with a 128 px
                      long edge; header name/address/UPI show the saved values; row UPI links use profile@bank;
                      reload persists; 375 px scrollWidth 375/375; forced quota -> #profile-msg warning,
                      new logo still shown, no crash
OCR honesty           hint "Enter the amount manually; the screenshot is saved with the entry.";
                      no ocr/tesseract request; no prefill; manual 1500 saved with one img[data-shot]
```

Artifacts: `tests/artifacts/p7-brand-contrast.txt` (all eight ratios), `tests/artifacts/p7-profile-375.png`, `tests/artifacts/p7-ocr.txt`.

Verdict: **FAIL** (BUG-3, P1) — the scored 58-case contract, F-01 and F-02 are green; the only red case is the new brand-contrast assertion.

Notes:

- **BUG-3 | severity P1 | phase P7 | case E2E-P7-04**
  Expected: with a brand color sampled from a logo, every visible header line and the accent button keep ≥ 4.5:1 text contrast in light and dark (PRD N3, and the P7 brief's "brand color injected contrast-safely").
  Actual: the themed header uses a near-accent background (`rgb(187,35,125)` for a `#B0006A` logo, `rgb(206,9,126)` in dark). `#owner-display-name` falls to 3.22:1 in light; `#owner-display-address` and `#owner-display-upi` fall to **1.04:1 light and 2.01:1 dark**, i.e. effectively invisible. The accent button itself passes (6.69 light / 4.62 dark), so the defect is confined to the header tint.
  Repro: serve `app/`; import `sample-data.json`; upload a saturated logo (e.g. a 320×320 `#B0006A` square) on `#logo-input`; read computed colours of `.topbar` and the three `#owner-display-*` nodes.
  Evidence: `tests/artifacts/p7-brand-contrast.txt`; reproduced with two hues (`#B0006A`, `#0055CC`) and both schemes, so it is systematic, not a one-colour artefact.
  Suspected layer: theme/brand (CSS variable injection).
  Root cause: stated, not guessed — `applyBrandTheme` sets `--brand-soft` with `mixRgb(lightAccent, pageBg, 0.12)` and `mixRgb(darkAccent, darkBg, 0.16)`, while `mixRgb(base, target, weight)` computes `base*(1-weight) + target*weight`; the accent therefore stays at 88 %/84 % and the header renders almost fully saturated instead of a 12–16 % tint. The accent itself is contrast-tuned against the page background, but the header's ink/muted text is measured against the tinted surface, which was never checked.
  Contract impact: no machine node; N3 (contrast) is broken whenever a logo brand is applied. P1 blocks the P7 gate; the fix is CSS/injection-only (make the tint the background color, e.g. `mixRgb(pageBg, lightAccent, 0.12)`, or set header text to `--accent-ink`).
- `docs/TEST-CASES.md` v0.14 adds E2E-P7-01…05 and the P7 mapping. No existing ID or expected value changed.
- The scored 58-case suite plus F-01/F-02 remain green, and the P7 extras' functional behaviour (JSON/CSV file import, reminder UPI, profile persistence, logo downscale, quota handling, OCR honesty) is verified; only the brand-tint contrast is red.
- Doc-sync leftovers the Tester may not write: `worklog.md` needs the RUN-14 line and the BUG-3 fix loop; `TRACEABILITY.md` should record E2E-P7-01…05.
- The Tester did not edit `app/`. App checksums at verification time: `app/index.html 32fb04687ad1…`, `app/app.js 8c99fbc34a5d…`, `app/styles.css da42dd418ea6…`.

### RUN-15 | 2026-11-18 06:49 EST | phase P7 | gate P7 (BUG-3 re-verification)

Command: `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app` from the working tree at run time; `@playwright/test` 1.65.1; Chromium 159.0.8154.6 (Chrome for Testing, Playwright build 1255, headless); default viewport 1280×800; 375×812 where a case requires it; light plus emulated `prefers-color-scheme: dark` for the theme cases; locale `en-IN`; timezone `Asia/Kolkata`; 1 worker; 12 spec files.

Cases: **63/63 passed** | Failing: none
- Scored regression green: P0 23, P1 8, P2 5, P3 5, P4 7, P5 4
- F-01 50 datasets (seed `20261117`) and **F-02 200 datasets (seed `20261118`)** green
- P6 four cases green; **P7 five cases green** (JSON file import, CSV, reminder UPI URI, profile/logo/brand, OCR honesty)

Bugs filed: none | **Bugs closed: BUG-3 (P1, brand-tint header contrast)**

Evidence:

```
$ npx playwright test
Running 63 tests using 1 worker
  ✓ [chromium] › e2e/p7.spec.js › E2E-P7-01 JSON import via #import-file, #import-choose and empty #import-go
  ✓ [chromium] › e2e/p7.spec.js › E2E-P7-02 CSV import: primary schema, quoted fields, customers-only, entries-only, malformed and empty
  ✓ [chromium] › e2e/p7.spec.js › E2E-P7-03 reminder message carries name, Rs balance and the exact UPI URI; owner UPI applies
  ✓ [chromium] › e2e/p7.spec.js › E2E-P7-04 profile and logo: header, persistence, brand contrast light/dark, default palette, 375, quota
  ✓ [chromium] › e2e/p7.spec.js › E2E-P7-05 OCR honesty: hint says manual, no OCR asset or request, upload neither prefills nor blocks
  ... all 58 other P0–P6 cases + F-01 + F-02 green ...
  63 passed (32.3s)

$ npx playwright test --list | tail -1
Total: 63 tests in 12 files
```

BUG-3 re-measured with the same `#B0006A` logo (`tests/artifacts/p7-brand-contrast.txt`):

```
light #import-go               = 6.69  (white on rgb(178, 6, 109))
light #owner-display-name      = 14.12 (rgb(22, 19, 16) on rgb(242, 219, 227))
light #owner-display-address   = 4.76  (rgb(104, 95, 87) on rgb(242, 219, 227))
light #owner-display-upi       = 4.76  (rgb(104, 95, 87) on rgb(242, 219, 227))
light row link                 = 16.16 (rgb(22, 19, 16) on rgb(244, 239, 230))
dark  #import-go               = 4.62  (rgb(26, 18, 6) on rgb(242, 8, 148))
dark  #owner-display-name      = 15.23 (rgb(245, 240, 232) on rgb(51, 12, 33))
dark  #owner-display-address   = 6.57  (rgb(169, 158, 144) on rgb(51, 12, 33))
dark  #owner-display-upi       = 6.57  (rgb(169, 158, 144) on rgb(51, 12, 33))
dark  row link                 = 14.40 (rgb(245, 240, 232) on rgb(36, 31, 26))
all >= 4.5:1; the light topbar is now rgb(242,219,227) (a 12% tint) instead of rgb(187,35,125)
```

F-02 unchanged and green: 200 datasets, seed `20261118`, 805 customers / 1,401 entries, 0 mismatches, no row dropped.

Verdict: PASS — **BUG-3 closed**

Notes:

- **BUG-3 closure:** the tint is now mixed from the page background (`mixRgb([251,248,243], lightAccent, 0.12)` / `mixRgb([15,13,11], darkAccent, 0.16)`), and `--brand-muted` is contrast-adjusted (`readableTintText`). Measured header text went from 3.22/1.04/1.04 (light) and 4.67/2.01/2.01 (dark) to 14.12/4.76/4.76 and 15.23/6.57/6.57. The accent button and the row link also clear 4.5:1 in both schemes, and the default no-logo palette is unchanged (`#brand-theme` empty; default button contrast re-asserted).
- **Test adjustment (no weakening):** the brand sample list now also includes the row link (`#customers [data-customer] a[href^="?customer="]`) to cover the "button/link" wording explicitly; all samples use the same ≥4.5:1 threshold.
- **Harness race found and fixed during this re-verification:** the first two invocations of the suite failed E2E-P7-02 at `expect(shop.rows).toHaveLength(0)` after the header-only CSV, because `setInputFiles` returns before the app's async `FileReader` import finishes; in isolation the timing usually passed, under full-suite load it did not. `importFile()` now waits until the app resets `#import-file` (its completion signal after success or refusal). This was a test-side race, not an app defect — the CSV behaviour itself was correct in both the passing and failing orderings once settled. The two aborted invocations are not recorded as RUNs.
- The P7 cases that previously passed (JSON file import, CSV schema/fallbacks, reminder UPI URI, OCR honesty) all pass again on the fixed build, and the 58 scored cases plus F-01/F-02 are untouched.
- Doc-sync leftovers the Tester may not write: `worklog.md` needs the RUN-15 line and the BUG-3 closure; `TRACEABILITY.md` should record E2E-P7-01…05.
- The Tester did not edit `app/`. App checksums at verification time: `app/index.html 32fb04687ad1…`, `app/app.js e562933e70f7…` (BUG-3 fix), `app/styles.css c52f8e013cf4…`.

### RUN-16 | 2026-11-18 10:31 EST | phase P8 | gate G8

Command: `python3 -m http.server 4173 --directory app` (shell 58), then `cd tests && npx playwright test smoke` (shell 59), `cd tests && npx playwright test unit/p8.spec.js integration/p8.spec.js e2e/p8.spec.js` (shell 61), and `cd tests && npx playwright test` (shell 62)

Environment: local `http://localhost:4173` served by `python3 -m http.server 4173 --directory app`; Playwright `1.65.1`; Chromium 159.0.8154.6; `workers: 1`; default viewport `1280×800`; P8 mobile check `375×812`; local timezone `Asia/Kolkata` and locale `en-IN`

Cases: 15/15 smoke passed | 22/22 P8 affected unit/integration/E2E passed | 85/85 full regression/E2E-P8/fuzz passed | Failing: none

P8 case IDs executed: C-40, C-41, C-42, C-43, C-44, C-45, C-46, C-47, C-48, U-15, I-11, I-12, I-13, I-14, E2E-P8-01, E2E-P8-02, E2E-P8-03, E2E-P8-04, E2E-P8-05, E2E-P8-06, E2E-P8-07, E2E-P8-08.

Bugs filed: none | Bugs closed: none

Evidence:

```
$ cd tests && npx playwright test smoke
Running 15 tests using 1 worker
15 passed (5.3s)

$ cd tests && npx playwright test unit/p8.spec.js integration/p8.spec.js e2e/p8.spec.js
Running 22 tests using 1 worker
22 passed (4.2s)

$ cd tests && npx playwright test
Running 85 tests using 1 worker
  ✓ C-40 ... P8 manager and contract selectors are visible at first paint
  ✓ E2E-P8-08 storage failure, 375 px and contract regressions
F-01 seed 20261117 datasets 50 :: {"shops":50,"customers":160,"entries":297,"negativeBalanceRows":56,"zeroBalanceRows":98,"unknownPhoneEntries":203,"unicodeNames":41,"stringAmounts":172,"missingTypes":27,"missingDates":64,"negativeTotalShops":17,"emptyShops":1}
F-02 seed 20261118 datasets 200 :: {"shops":200,"customers":805,"entries":1401,"negativeBalanceRows":293,"zeroBalanceRows":394,"unknownPhoneEntries":868,"unicodeNames":360,"stringAmounts":788,"missingTypes":107,"missingDates":242,"negativeTotalShops":52,"emptyShops":3,"customersInLargestShop":202}
85 passed (38.5s)
```

The P3 P8-storage contract update also passed in the full suite: `E2E-P3-02` read the active ledger from `hisaab.stores.v1` rather than `hisaab.v1`, and recorded the stored payment image under 200 KB and intact after reload.

Verdict: PASS

Notes:

- P8 case definitions are exact and are no longer planned: C-40–C-48, U-15, I-11–I-14, and E2E-P8-01–08 are implemented and green.
- Existing P0–P7 assertions remain in the full suite; no assertion was skipped or weakened.
- The 85-test full run includes F-01 (50 generated shops) and F-02 (200 generated shops), both with zero mismatches in the independent computation.
- 375 px P8 storage failure, active-store isolation, legacy migration, active-ledger import, and `?customer=`/`?today=` route behavior are green.
- The new P8 tests read `hisaab.stores.v1`, `hisaab.activeStore.v1`, `hisaab.profile.v1`, `hisaab.upi.v1`, and legacy `hisaab.v1` only as storage-contract setup/verification; they derive DOM expectations independently.
- Files added or changed for this Tester run: `tests/e2e/p8.spec.js`, `tests/unit/p8.spec.js`, `tests/integration/p8.spec.js`, `tests/e2e/p3.spec.js`, `tests/playwright.config.js`, `docs/TEST-CASES.md`, and `docs/test-results.md`.
- App code was not edited by this Tester run. The app working tree and docs outside Tester scope were not changed by this task.

### RUN-17 | 2026-11-18 10:53 EST | phase P8 | gate G8 follow-up

Command: `python3 -m http.server 4173 --directory app` (shell 72), then `cd tests && npx playwright test unit/p8.spec.js integration/p8.spec.js e2e/p8.spec.js`, `cd tests && npx playwright test smoke`, and `cd tests && npx playwright test`

Environment: local `http://localhost:4173` served from `app/`; Playwright `1.65.1`; Chromium 159.0.8154.6; 1 worker; default viewport `1280×800`; P8 responsive check `375×812` with dark scheme; locale `en-IN`; timezone `Asia/Kolkata`.

Cases: **22/22 affected P8 tests passed** | **15/15 contract smoke tests passed** | **85/85 full regression passed** | Failing: none

P8 cases re-run: C-40–C-48, U-15, I-11–I-14, E2E-P8-01–08. The full 85-test run also includes F-01 (50 datasets, seed `20261117`) and F-02 (200 datasets, seed `20261118`), both green.

Evidence:

```
$ cd tests && npx playwright test unit/p8.spec.js integration/p8.spec.js e2e/p8.spec.js
Running 22 tests using 1 worker
22 passed (5.1s)

$ cd tests && npx playwright test smoke
Running 15 tests using 1 worker
15 passed (5.4s)

$ cd tests && npx playwright test
Running 85 tests using 1 worker
  ✓  49 [chromium] › e2e/p8.spec.js:73:1 › C-45 active id, ledger, profile and UPI persist per store (374ms)
  ✓  56 [chromium] › e2e/p8.spec.js:212:1 › E2E-P8-04 active reload and full per-store ledger/profile/logo/brand isolation (342ms)
  ✓  58 [chromium] › e2e/p8.spec.js:275:1 › E2E-P8-06 legacy migration and same-phone independence (161ms)
  ✓  60 [chromium] › e2e/p8.spec.js:306:1 › E2E-P8-08 storage failure, 375 px and contract regressions (139ms)
F-01 seed 20261117 datasets 50 :: {"shops":50,"customers":160,"entries":297,"duplicatePhoneShops":21,"negativeBalanceRows":56,"zeroBalanceRows":98,"unknownPhoneEntries":203,"unicodeNames":41,"stringAmounts":172,"missingAmounts":31,"missingTypes":27,"missingDates":64,"negativeTotalShops":17,"emptyShops":1}
F-02 seed 20261118 datasets 200 :: {"shops":200,"customers":805,"entries":1401,"duplicatePhoneShops":79,"emptyNameDuplicateRecords":2,"clampedEntries":1,"negativeBalanceRows":293,"zeroBalanceRows":394,"unknownPhoneEntries":868,"unicodeNames":360,"stringAmounts":788,"missingAmounts":134,"missingTypes":107,"missingDates":242,"negativeTotalShops":52,"emptyShops":3,"customersInLargestShop":202}
85 passed (38.6s)
```

Coverage sync: `docs/CONTRACT.md` selector sweep found **45/45** selector tokens in `docs/TEST-CASES.md`; `#owner-display-address` and `#owner-display-upi` appear in C-45 and are asserted against rendered text. The new isolation checks compare distinct owner name/address/UPI, logo `src`, and `#brand-theme` values across A↔B switches and reload; same-phone balances assert exact text and `data-balance` values (`70`, `707`). E2E-P8-08 checks manager visibility/375 px bounds and text contrast `>=4.5:1` in dark mode.

Bugs filed: none | Bugs closed: none

Verdict: **PASS**

Notes:

- Tester follow-up only; app and non-Tester docs were not edited.
- `TEST-CASES.md` is v0.16; this append-only result log is v0.18. Previous RUN entries and assertions remain unchanged.

### RUN-18 | 2026-11-18 12:22 EST | phase P9 | gate G9 pre-gate verification
Command: `python3 -m http.server 4173 --directory app`; `cd tests && npx playwright test smoke`; `cd tests && npx playwright test unit/p9.spec.js integration/p9.spec.js`; `cd tests && npx playwright test e2e/p7.spec.js e2e/p8.spec.js`
Environment: local http://localhost:4173, Chromium, viewport 1280×800 (P9 mobile checks in P9 spec)
Cases: smoke 15/15 passed; P9 unit/integration 1/5 passed, 4/5 failed; P7/P8 regression 20/22 passed, 2/22 failed
Failing: I-16, I-17, I-18, U-16; E2E-P7-01, E2E-P7-02
Bugs filed: BUG-4 P1 (P7 immediate file replacement)| Bugs closed: none
Evidence:
- Smoke: `15 passed (5.4s)`.
- P9 unit/integration: I-15 passed; I-16 failed because `#owner-display-upi` remained `Demo UPI ID` instead of blank for invalid `upi`; I-17 failed because `#import-add-file` resolved to `0` elements; I-18 failed because manual-store display name remained `Your shop` instead of blank; U-16 failed because invalid-profile display nodes remained `Your shop` defaults.
- P7/P8: P7-01 received 0 `[data-customer]` after JSON file selection instead of 8; P7-02 received 0 `[data-customer]` after CSV file selection instead of 2; P8 suite passed 16/16; P7-03/P7-04/P7-05 passed.
- P9 E2E gate suite was not run because P7/P9 prerequisites are red.

BUG-4 | severity P1 | phase P7/P9 | case E2E-P7-01, E2E-P7-02
Expected: selecting JSON/CSV through `#import-file` via `#import-choose` immediately replaces the active ledger; sample JSON renders 11820/8 rows and primary CSV renders 1920/2 rows.
Actual: after each selection `[data-customer]` stayed at 0 rather than 8/2.
Repro: `cd tests && npx playwright test e2e/p7.spec.js`
Evidence: RUN-18; `E2E-P7-01` and `E2E-P7-02` failed at row-count assertions in P7.
Suspected layer: import
Root cause: `handleImportFile` stages the file instead of immediately replacing the active ledger through the existing P7 replacement flow.
Contract impact: `#import-file`, `#import-choose`, `[data-customer]`, `#total-outstanding`

Verdict: **FAIL**
Notes:
- P9 test coverage is now present in v0.17: C-49–C-58, U-16, I-15–I-18, E2E-P9-01–10.
- Test-results append-only log is v0.19.
- No app or Planner-owned document was edited by the Tester.
- No P9 E2E gate PASS is claimed. No P9 gate E2E suite is green until the Coder fixes the red import behavior and the full suite is rerun.

### Test oracle correction | 2026-11-18 | P9 accepted-spec alignment
Owner: Tester
Scope: `TEST-CASES.md` v0.18 and P9 unit/integration/E2E oracle code.
Changed: corrected U-16, I-16, I-18 and E2E-P9-03/04/06/07 assumptions to distinguish blank underlying profile fields/editable inputs/logo from D12 display fallbacks (`#owner-display-name = "Your shop"` and `#owner-display-upi = "Demo UPI ID"`). True-name-collision setup now makes the existing same-name store non-pristine; sole pristine `My Store` remains bootstrap-eligible. Missing-name/cancel, duplicate no-overwrite, and pristine/bootstrap coverage are retained.
Run: No commands executed for this documentation/oracle correction. No PASS or green verdict is claimed.

### Test oracle correction | 2026-11-18 | P9 CONTRACT §10/D23 alignment
Owner: Tester
Scope: `TEST-CASES.md` v0.19, P9 I-17 and E2E-P9-06 oracle code.
Changed: corrected I-17 so a valid unique CSV name on the sole pristine store asserts immediate bootstrap, hidden resolution, the active imported store/row, and then an existing P7 replacement file that replaces only the active ledger. Corrected E2E-P9-06 to populate initial `My Store` through `#import-go` with a non-empty 899 ledger, preserve that exact original row/balance across missing-name and true-collision cancellations, resolve the collision to `Safe Store`, and switch back to verify `My Store` still contains its original ledger. Missing-name cancellation, true collision, no-overwrite, and bootstrap cases remain covered.
Run: No commands executed. This is an oracle-only correction; RUN-18 and all prior RUN evidence are unchanged. No PASS or green verdict is claimed.

### RUN-19 | 2026-11-18 14:00 EST | phase P9 | gate G9
Command:
- `cd tests && npx playwright test smoke`
- `cd tests && npx playwright test unit/p9.spec.js integration/p9.spec.js e2e/p7.spec.js e2e/p8.spec.js`
- `cd tests && npx playwright test e2e/p9.spec.js`
- `cd tests && npx playwright test`
Environment: local `http://localhost:4173` served from `app/` (existing server; `/` and `/app.js` returned HTTP 200); Playwright 1.65.1; Chromium 159.0.8154.6; one worker; default viewport 1280×800; P9 responsive check 375×812 with dark scheme; locale `en-IN`, timezone `Asia/Kolkata`.
Cases: contract smoke **15/15**; P9 unit/integration plus targeted P7/P8 regression **27/27**; P9 E2E gate **10/10**; full P0–P9 regression including F-01/F-02 **100/100**. Failing: none.
P9 cases: C-49–C-58, U-16, I-15–I-18, E2E-P9-01–10. P7/P8 regression: E2E-P7-01–05, C-40–C-48, E2E-P8-01–08. The full run also executed both fuzz cases: F-01 (50 shops, seed `20261117`) and F-02 (200 shops, seed `20261118`), with 0 mismatches.
Bugs filed: none | Bugs closed: **BUG-4 (P1)**.
Evidence:
```
$ cd tests && npx playwright test smoke
15 passed (5.3s)

$ cd tests && npx playwright test unit/p9.spec.js integration/p9.spec.js e2e/p7.spec.js e2e/p8.spec.js
27 passed (7.5s)
E2E-P7-01 and E2E-P7-02 passed; immediate JSON/CSV replacement restored.

$ cd tests && npx playwright test e2e/p9.spec.js
10 passed (2.1s)

$ cd tests && npx playwright test
F-01 seed 20261117 datasets 50 :: ... "shops":50 ...
F-02 seed 20261118 datasets 200 :: ... "shops":200 ...
100 passed (40.6s)
```
Selector coverage: C-49/E2E-P9-01 first-paint coverage includes `#store-workspace`, `#store-profile-editor`, `#store-manager`, `#store-select`, `#store-name`, `#store-create`, `#store-rename`, `#store-delete`, `#store-confirm-delete`, `#store-cancel-delete`, `#store-msg`, `#active-store-name`, `#owner-name`, `#owner-address`, `#shop-upi`, `#logo-input`, `#profile-msg`, `#upi-msg`, `#import-add-store`, `#import-add-file`, `#import-store-name`, `#import-store-confirm`, `#import-store-cancel`, `#import-store-msg`, `#import-box`, `#import-go`, `#import-file`, `#import-choose`, `#total-outstanding`, and `#shot-input`; the prohibited `#profile-save` and `#profile-brand-input` are verified absent. Profile/display coverage includes `#owner-display-name`, `#owner-display-address`, `#owner-display-upi`, `#shop-logo`, and `#brand-theme`. Import and ledger assertions cover `[data-customer]`, phone-specific `[data-customer="<phone>"]`, and `[data-balance]`; name/cancel/bootstrap, storage and route cases assert the corresponding store controls/messages and active ledger. P9 mobile/dark assertions check `document.documentElement.scrollWidth <= 375` and ≥4.5:1 contrast for `#active-store-name`, `#store-select`, `#store-name`, `#store-create`, `#store-rename`, `#store-delete`, `#import-add-store`, and `#import-go`. Full smoke and regression retain the P0–P8 contract selectors.
BUG-4 closure evidence: the exact reproductions now pass in the targeted command and the full suite. `E2E-P7-01` immediately replaced the active ledger from JSON (`11820`, 8 rows, then `749.50`, 2 rows, surviving reload); `E2E-P7-02` passed the CSV replacement/schema cases. The separate P9 `#import-add-file` path also passed I-17 and E2E-P9-04/05, confirming add-store selection does not stage or replace the P7 picker semantics.
Console/network: C-39 passed with 0 console errors, uncaught rejections, and failed requests across the four contract routes; C-22 passed with no external request on load. A Playwright probe of P9 add-import with an invalid external logo recorded `consoleErrors: 0`, `failedRequests: 0`, `externalRequests: 0`.
Verdict: **PASS**
Notes: the 375 px/dark P9 gate and full P5 light/dark regression passed. No tests or TEST-CASES oracles were changed. RUN-18 remains unchanged as the historical failing run; BUG-4 is closed here with the regression evidence above.

### RUN-20 | 2026-11-18 16:15 EST | phase P10 | gate G10 pre-gate verification
Command:
- `cd tests && npx playwright test smoke`
- `cd tests && npx playwright test unit/p8.spec.js`
- `cd tests && npx playwright test e2e/p10.spec.js e2e/p8.spec.js unit/p8.spec.js`
- `cd tests && npx playwright test`
- `cd tests && npx playwright test --reporter=line 2>&1 | tail -n 35` (concise result repeat)
Environment: local `http://localhost:4173` served from `app/`; Playwright 1.65.1; Chromium 159.0.8154.6; one worker; default viewport 1280×800; P10 mobile check 375×812; locale/timezone `en-IN`/`Asia/Kolkata`.
Acceptance: P10 focused suite **3/5 passed** — `E2E-P10-02`, `E2E-P10-03`, `E2E-P10-04` passed; `C-59` and `E2E-P10-01` failed on exact approved copy.
P0–P9 regression: **97/100 passed** — the three P8 copy assertions `C-42`, `E2E-P8-02`, and `U-15` failed for the same exact-copy defect; all other P0–P9 tests passed. F-01/F-02 were included in the full run and remain green.
Full suite: **100 passed / 5 failed** out of 105 tests.
Cases: contract smoke **15/15**; targeted P8/P10 **18 passed / 5 failed**; P10 acceptance **3/5**; full suite including P0–P9 and P10 **100/105**.
Failing: `C-59`, `E2E-P10-01`, `C-42`, `E2E-P8-02`, `U-15`.
Evidence:
- Smoke: `15 passed (5.6s)`.
- Targeted rerun: `18 passed / 5 failed (31.4s)`.
- Full rerun: `100 passed / 5 failed (1.1m)`.
- Exact English duplicate reproduced as `Could not create shop: A shop with this name already exists.` / `Could not rename shop: A shop with this name already exists.` instead of exactly `A shop with this name already exists.`.
- Hindi blank reproduced as `दुकान नहीं बनाई जा सकी: दुकान का नाम दर्ज करें।` instead of exactly `दुकान का नाम दर्ज करें।`.
Bugs filed: **BUG-5 (P1, open)** | Bugs closed: none.

BUG-5 | severity P1 | phase P10/P8 | case C-59, E2E-P10-01, C-42, E2E-P8-02, U-15
Expected:
- English create/rename validation reasons are exact: `Enter a shop name.`, `Shop name must be 60 characters or fewer.`, and `A shop with this name already exists.`
- Hindi/Telugu blank, duplicate, too-long, delete-protection, and storage-status manager text exactly matches CONTRACT §10.6, without an obsolete English/Store prefix.
Actual:
- Validation text is prefixed in `#store-msg`, for example `Could not create shop: ...`, `Could not rename shop: ...`, and Hindi `दुकान नहीं बनाई जा सकी: ...`.
Repro:
1. Serve `app/` on `http://localhost:4173`.
2. Load `/`, enter `P10 One`, click `#store-create`, then enter `P10 One` and click `#store-create` again.
3. Read `#store-msg`.
4. Repeat blank-name creation after selecting `hi` and read `#store-msg`.
Evidence:
- `cd tests && npx playwright test e2e/p10.spec.js e2e/p8.spec.js unit/p8.spec.js`
- Exact raw values are shown above in this run.
Suspected layer: `render` / localized manager status
Root cause: `app/app.js` wraps D19/D25 reason keys through `storeCouldNotCreate` / `storeCouldNotRename` in `setStoreNotice`, producing extra create/rename prefixes instead of rendering the exact approved reason text; localized reason keys are then appended rather than used as the exact whole message.
Contract impact: `#store-msg` exact P10 copy and P8 exact-copy supersession; the machine node and state semantics remain intact.
Verdict: **FAIL**
Notes: preserving prior RUN-19 and all earlier RUN records; this run adds no PASS/G10 claim, adds no app change, and does not update TRACEABILITY or any Planner-owned doc. P10 manual-create, blank-profile autosave, layout/375, import, isolation and P0–P9 behavior outside the exact-copy defect passed. BUG-5 requires Coder fix; after fix, Tester will add/retain the exact regression assertions and rerun the full suite.

### RUN-21 | 2026-11-18 16:14 EST | phase P10 | BUG-5 post-fix verification
Command:
- `cd tests && npx playwright test smoke`
- `cd tests && npx playwright test e2e/p10.spec.js e2e/p8.spec.js unit/p8.spec.js`
- `cd tests && npx playwright test`
Environment: local `http://localhost:4173` served from `app/`; Playwright 1.65.1; Chromium 159.0.8154.6; one worker; default viewport 1280×800; P10/P8/P9 mobile checks include 375×812; locale/timezone `en-IN`/`Asia/Kolkata`.
Cases: contract smoke **15/15**; targeted P8/P10 regression **23/23**; full P0–P10 regression **105/105**. Failing: none.
Acceptance:
- C-59 passed exact English and localized manager copy, including exact blank, 61-character overlength, duplicate-name, and storage-failure status text in en/hi/te.
- E2E-P10-01–04 passed.
- C-42, E2E-P8-02, and U-15 passed the formerly failing exact copy assertions.
- P0–P9 regression, F-01 (50 shops), F-02 (200 shops), and 375 px/light/dark assertions passed.
P10 focused suite **23/23**; full suite **105/105**.
Failing: none.
Evidence:
```
$ cd tests && npx playwright test smoke
15 passed (5.5s)

$ cd tests && npx playwright test e2e/p10.spec.js e2e/p8.spec.js unit/p8.spec.js
23 passed (5.8s)

$ cd tests && npx playwright test
F-01 seed 20261117 datasets 50 :: 0 mismatches
F-02 seed 20261118 datasets 200 :: 0 mismatches
105 passed (42.0s)
```
BUG-5 closure evidence:
- Exact English: blank `Enter a shop name.`, overlength `Shop name must be 60 characters or fewer.`, duplicate `A shop with this name already exists.`, storage `Could not save shop changes.`
- Exact Hindi: blank `दुकान का नाम दर्ज करें।`, overlength `दुकान का नाम 60 अक्षरों से अधिक नहीं होना चाहिए।`, duplicate `इस नाम की दुकान पहले से मौजूद है।`, storage `दुकान के बदलाव सहेजे नहीं जा सके।`
- Exact Telugu: blank `దుకాణం పేరు నమోదు చేయండి.`, overlength `దుకాణం పేరు 60 అక్షరాలకు మించకూడదు.`, duplicate `ఈ పేరుతో దుకాణం ఇప్పటికే ఉంది.`, storage `దుకాణం మార్పులను సేవ్ చేయలేకపోయాము.`
- The exact post-fix checks in C-59, C-42, E2E-P8-02, and U-15 returned only those reason/status strings, with no create/rename prefix.
Bugs filed: none new | Bugs closed: **BUG-5 (P1, P10/P8 exact copy and storage copy)**.
Verdict: **PASS — BUG-5 closed**. This is post-fix verification only; no G10 PASS or gate claim is made.
Notes: RUN-19 and RUN-20 remain preserved unchanged. TEST-CASES.md is strengthened at v0.21 with storage-warning coverage; no app, Planner-owned doc, README, scorecard, or worklog file was modified by the Tester. 375 px and dark/light checks are green in the full run, and F-01/F-02 remain green with independent oracles.

### RUN-22 | 2026-11-18 16:34 EST | phase P11 | P11 gate verification
Command:
- `cd tests && npx playwright test smoke`
- `cd tests && npx playwright test unit/p8.spec.js unit/p9.spec.js`
- `cd tests && npx playwright test e2e/p8.spec.js e2e/p9.spec.js e2e/p10.spec.js`
- `cd tests && npx playwright test e2e/p11.spec.js`
- `cd tests && npx playwright test`
Environment: local `http://localhost:4173` served from `app/`; Playwright 1.65.1; Chromium 159.0.8154.6; one worker; default/phase viewport 1280×800 and P11 375×812; locale/timezone `en-IN`/`Asia/Kolkata`.
Cases: contract smoke **15/15**; affected P8/P9 unit **2/2**; P8/P9/P10 store/import regression **32/32**; P11 focused suite **3/3**; full P0–P11 regression including C-60/E2E-P11-01–02, F-01/F-02, P8/P9/P10 and P0–P7 **108/108**. Failing: none.
P11 cases: C-60, E2E-P11-01, E2E-P11-02.
Relevant P8/P10/P11 evidence:
- C-60 passed exact equality across My Store, manual creation, Unicode rename, switch, replacement import, reload, and existing owner/UPI fallbacks.
- E2E-P11-01 passed 375 px top-left header tracking through manual create, rename, switch and reload.
- E2E-P11-02 passed replacement import with different ledger `shop` labels and P9 `sample-data.json` add/populate activation; the active portfolio name remained exact after reload, and blank owner/address/UPI fallbacks remained `Your shop`, `""`, and `Demo UPI ID`.
- `.active-shop-display` passed class-only/no-ID/no-`data-*` inspection; `#active-store-name` passed exactly-one-count and no duplicate/moved location assertions.
- P11 375 px no-overflow and light/dark contrast checks passed for `.active-shop-display`, `#active-store-name`, and the three owner display nodes.
Evidence:
```
$ cd tests && npx playwright test smoke
15 passed (5.3s)

$ cd tests && npx playwright test unit/p8.spec.js unit/p9.spec.js
2 passed (1.1s)

$ cd tests && npx playwright test e2e/p8.spec.js e2e/p9.spec.js e2e/p10.spec.js
32 passed (7.0s)

$ cd tests && npx playwright test e2e/p11.spec.js
3 passed (935ms)

$ cd tests && npx playwright test
F-01 seed 20261117 datasets 50 :: 0 mismatches
F-02 seed 20261118 datasets 200 :: 0 mismatches
108 passed (41.7s)
```
Bugs filed: none | Bugs closed: none.
Verdict: **P11 TEST SUITE GREEN**. G11 is not claimed; Critic/Orchestrator phase-gate evidence remains required.
Notes: RUN-1 through RUN-21 remain preserved unchanged. TEST-CASES.md is at v0.22 with C-60 and E2E-P11-01–02; test-results is at v0.21. No app, Planner-owned doc, README, scorecard, worklog, or TRACEABILITY file was changed in this Tester run. P11 test code changed only `tests/e2e/p11.spec.js`; no P0–P10 assertion was weakened or skipped.
