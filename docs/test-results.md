# TEST RESULTS — Hisaab

Version: 0.4
Updated: 2026-11-17
Owner: Tester
Supersedes: test-results.md v0.3

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
