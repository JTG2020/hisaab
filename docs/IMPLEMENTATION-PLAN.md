# IMPLEMENTATION-PLAN — Hisaab

Version: 1.13
Updated: 2026-11-18
Owner: Planner
Supersedes: IMPLEMENTATION-PLAN.md v1.12
Depends on: `PRD.md` v1.1, `TECH-STACK.md` v1.0, `CONTRACT.md` v1.0

Phases are sequential. No phase starts before the previous gate is recorded in `worklog.md`. E2E runs only at phase gates; every change runs the contract smoke plus the affected unit tests.

## 0. Global rules

- One phase at a time. Each phase ends with a Tester run, a Critic scorecard, and an Orchestrator gate entry.
- The Coder writes only `app/`; the Tester only `tests/`, `TEST-CASES.md`, `test-results.md`; the Planner only the six planning docs; the Critic only `scorecards.md`; the Orchestrator only `worklog.md`.
- Any change to `CONTRACT.md` stops the phase and escalates to the human (`AGENTS.md` §5, §7).
- Adding a dependency, framework, build step, backend, or external service is a human gate (`AGENTS.md` §7). OCR (B7) ships only with an approved, self-hosted asset; otherwise it is a graceful no-op and B7 is declared failed.
- Deploy the `app/` directory at every gate. Local verification uses `python3 -m http.server 4173 --directory app`.
- Derived values are recomputed from state on every render; nothing derived is cached or persisted.

## 1. Phase table

| Phase | Goal | R-IDs | Gate suite |
|---|---|---|---|
| P0 | Static skeleton, every contract selector, empty state, smoke suite, Vercel-shaped `app/` | R1–R10 (structure), N1, N6 | E2E-P0 |
| P1 | State, customers, entries, balances, total, persistence, customer view | R1, R2, R3, R4, R7, N4, N5 | E2E-P1 |
| P2 | Import: replace semantics, tolerant normalisation, warnings, errors | R3, R8, N4 | E2E-P2 + 50-shop fuzz |
| P3 | WhatsApp reminder, screenshot upload, downscale, quota fallback | R5, R6 | E2E-P3 |
| P4 | Bonus items B1–B7 | B1, B2, B3, B4, B5, B6, B7 | E2E-P4 |
| P5 | 375 px, light/dark, long unicode, large numbers | R9, N2, N3 | E2E-P5 |
| P6 | Hardening: 200-shop fuzz, quota, reload, double import, judges' note | R1–R10, B1–B7, N1–N6 | E2E-P6 (full) |
| P7 | Owner extras (post-gate, non-scored): file/CSV import, UPI URI in reminder, shop profile/logo/brand, OCR status | none (X1–X5; no R/B/N change) | E2E-P7-01–05 |

## 2. Phase details

### P0 — Skeleton and contract

- **Goal:** an empty but complete shell in which every contract selector resolves at first paint, with no data and no interaction.
- **R-IDs:** R1–R10 (structure only), N1, N6.
- **Selectors:** all of `CONTRACT.md` §1–§5 — `#total-outstanding`, `#customers`, `[data-customer]`, `[data-balance]`, `a[data-remind]`, `#import-box`, `#import-go`, `#import-msg`, `#shot-input`, `#new-name`, `#new-phone`, `#add-customer`, `#entry-form`, `#entry-type`, `#entry-amount`, `#entry-date`, `#entry-note`, `#entry-save`, `#cust-name`, `#cust-balance`, `#entries`, `[data-entry-id]`, `[data-amount]`, `#overdue`, `[data-days]`, `#search`, `#export-csv`, `#lang-switch`, `a[href^="upi://pay?pa="]`, `img[data-shot]`, `?customer=`, `?today=`.
- **Files allowed:** `app/index.html`, `app/styles.css`, `app/app.js`, `app/assets/*`, optional `app/vercel.json`.
- **Acceptance:** `#total-outstanding` text is `0`; the customers container and empty-state message exist; import box, import button, import message, shot input, search, export, language switch, overdue section, and both forms are visible or contain visible content; `?today=` and `?customer=` are parsed without behaviour; relative asset paths only; no build step; no console errors; no external network request.
- **E2E gate suite (gate-only):** `C-01–C-03`, `C-09–C-23`, `C-39`, and `E2E-P0-01–03` as defined in `TEST-CASES.md` v0.14; empty-state assertions, `scrollWidth` baseline at 375 px, dark-scheme baseline, Vercel-shape check (`app/index.html`, relative paths, no auth, no service worker). `C-04–C-08` are data-dependent and are not P0 cases: `C-04–C-06` and `C-08` run at P2, and `C-07` (reminder href) runs at P3.
- **Risks:** putting any node behind a modal, tab, or collapsed disclosure; rendering rows only when data exists; absolute or `localhost` asset paths; a web font or CDN on the critical path.
- **Rollback:** revert `app/` to the previous gate tag; no data migration needed.

### P1 — Data core

- **Goal:** a real ledger in memory and in storage, with exact money and a working customer view.
- **R-IDs:** R1, R2, R3, R4, R7, N4, N5.
- **Selectors:** `[data-customer]`, `[data-balance]`, `#total-outstanding`, `#cust-name`, `#cust-balance`, `#entries`, `[data-entry-id]`, `[data-amount]`, `#new-name`, `#new-phone`, `#add-customer`, `#entry-form`, `#entry-type`, `#entry-amount`, `#entry-date`, `#entry-note`, `#entry-save`, `?customer=`, `?today=`.
- **Files allowed:** `app/app.js`, `app/index.html` (event wiring only, no selector changes), `app/styles.css` (row and entry styles).
- **Acceptance:** add a customer with a 10-digit phone; reject a bad phone and a duplicate phone with a visible message; add credit and payment entries; balance = Σ credit − Σ payment in exact paise; total = signed net sum, recomputed on every render; customer view lists that customer's entries newest first with the right name and balance; unknown `?customer=` shows the not-found state; entry default date uses `?today=`; reload preserves everything; storage failure keeps the app alive in memory with a warning; machine nodes match the bare-number shape.
- **E2E gate suite (gate-only):** `E2E-P1-01–08` as defined in `TEST-CASES.md` v0.14: data core (customers, entries, balances, total), reload and storage failure, the customer view through the row link and direct `?customer=`, `?today=` as the default entry date, and early 375 px with long unicode. Fractional values render with exactly two decimals; whole-rupee values render with no decimals. No P1 case runs before the gate.
- **Risks:** float money or rupee rounding; caching the total; dropping zero-balance rows; duplicate rows; entry order ties; losing `#shot-input` when the type is credit.
- **Rollback:** revert `app/app.js` to the gate tag; state shape unchanged from P0, so stored data needs no migration.

### P2 — Import (the 60-mark surface)

- **Goal:** an arbitrary shop JSON replaces state correctly and safely.
- **R-IDs:** R3, R8, N4.
- **Selectors:** `#import-box`, `#import-go`, `#import-msg`, `#total-outstanding`, `[data-customer]`, `[data-balance]`, `#entries`, `[data-entry-id]`.
- **Files allowed:** `app/app.js` (import and normalisation module), `app/index.html` (only if a message element needs an id already defined in `CONTRACT.md`), `app/styles.css` (message styling).
- **Acceptance:** sample JSON → `11820`, exactly 8 rows, every balance equal to `sample-expected.json`; a second import leaves only the second shop; textarea value is read from the DOM at click time; `#import-msg` reports success with shop, count and total, or `Could not import` on error with the previous state intact; duplicate phone → one row, last full name, warning; same name different phones → two rows; exact duplicate → one row, no warning; unknown phone → `Customer` plus the phone auto-created; zero-entry customer → row with `0`; string/comma/currency amounts parsed; more than two decimals rounded to the nearest paise and logged; type casing mapped; missing or non-array lists treated as empty with a warning; malformed JSON leaves prior data intact; empty arrays render an empty shop.
- **E2E gate suite (gate-only):** `E2E-P2-01–05` plus `F-01` as defined in `TEST-CASES.md` v0.14, with the fuzz seed recorded in the RUN. The sample import must produce total `11820` with exactly 8 rows and the expected balances; a second import replaces the first shop and survives reload; malformed or partially missing input keeps the prior state; dedupe, unknown phone, zero balance, string amounts and type casing are asserted; the sample is checked at 375 px; 50 generated shops are compared against an independent expectation, including every hidden-data case in `PRD.md` R8.
- **Risks:** merging; `NaN` or float drift; dropping rows; stale totals; reading cached state instead of the textarea; a warning path that replaces data after a parse error.
- **Rollback:** revert the import module only; keep the P1 build intact.

### P3 — Reminder and screenshot

- **Goal:** the two per-customer and per-payment interactions the tester exercises.
- **R-IDs:** R5, R6.
- **Selectors:** `a[data-remind]`, `[data-balance]`, `#shot-input`, `img[data-shot]`, `[data-entry-id]`, `#entry-form`, `#entry-save`.
- **Files allowed:** `app/app.js` (reminder builder, image downscale, storage), `app/index.html` (only attribute wiring already in `CONTRACT.md`), `app/styles.css` (thumbnail styling).
- **Acceptance:** every row has exactly one reminder link whose href is exactly `https://wa.me/91` + phone + `?text=` + the encoded message, and whose decoded message contains the name and `Rs` plus the rendered balance; unicode and `&` in names encode and decode exactly; zero and negative balances still link; selecting an image and saving a payment renders `img[data-shot]` in that entry and after reload; a multi-megabyte image is downscaled; a quota failure saves the entry without the image and warns; a credit entry shows no screenshot.
- **E2E gate suite (gate-only):** `E2E-P3-01–05` as defined in `TEST-CASES.md` v0.14: every reminder href is read and decoded (normal names, `&`, `+`, `%`, unicode, zero and negative balances); a 3 MB or larger payment image is downscaled to a stored `data:image/` payload under 200 KB, renders one `img[data-shot]`, and survives reload; a credit-with-image and a payment-without-image render no thumbnail while `#shot-input` stays static; a quota failure saves the entry without the image and warns; a non-image or undecodable file saves the entry without a photo and warns.
- **Risks:** unencoded `&` or unicode; storing the original image; aborting the save on quota; creating `#shot-input` on click; attaching a screenshot to the wrong entry.
- **Rollback:** revert the reminder and image modules; keep P2 state and import intact.

### P4 — Bonuses

- **Goal:** the 30 bonus marks, one scripted check per item, none of which may disturb the contract.
- **R-IDs:** B1, B2, B3, B4, B5, B6, B7.
- **Selectors:** `#overdue`, `[data-days]`, `[data-entry-id]`, `[data-amount]`, `button[data-edit-entry]`, `button[data-delete-entry]`, `#export-csv`, `#search`, `a[href^="upi://pay?pa="]`, `#lang-switch`, `#shot-input` (OCR), `#entry-amount`, `#entry-save`, `#total-outstanding`, `[data-balance]`.
- **Files allowed:** `app/app.js` (bonus modules), `app/index.html` (bonus hooks already in `CONTRACT.md` §5), `app/styles.css` (bonus UI), `app/assets/ocr` only when a self-hosted OCR asset is approved by the human.
- **Acceptance:** B1 overdue section labelled `Overdue (30+ days)`, rows sorted by days descending, bare `[data-days]`, no `data-customer` inside, no-payment customers excluded, empty state present; B2 edit and delete recompute row, `#cust-balance`, and total, keep `data-entry-id`, and persist; B3 CSV downloads `customers.csv` and `entries.csv` with the exact D8 headers from current state; B4 search filters by name or phone, leaves the total and state untouched, and restores on clear; B5 UPI link starts with `upi://pay?pa=`, carries `am=` from the rendered positive balance and `cu=INR`, and encodes `tn=`; B6 language switch defaults to `en`, offers `hi` and `te`, and changes no id, attribute, machine value, or href; B7 OCR prefills `#entry-amount` only when empty, never blocks save, and fails silently.
- **E2E gate suite (gate-only):** `E2E-P4-01–07` as defined in `TEST-CASES.md` v0.14 — one scripted check per bonus item (`E2E-P4-01–07`), plus a re-run of the contract smoke to prove no node moved or hid. `E2E-P4-07` exercises the B7 manual fallback path per `PRD.md`/D5: the OCR engine is unavailable, so B7 is declared failed, not faked, and manual entry remains. Screenshots are captured for overdue ordering, CSV, UPI, language, and the OCR fallback. The earlier direct checks `C-14`/`C-28`, `C-36`, `C-29`, `C-30`, `C-35`, `C-13`/`N-06`, and `C-38` remain cited.
- **Risks:** bonus UI hiding or duplicating contract nodes; search leaving rows filtered for the next test; OCR overwriting typed input or blocking save; CSV exporting the sample instead of current state; editing breaking `data-entry-id`; UPI `am` drifting from the machine-rendered balance.
- **Rollback:** disable the affected bonus behind a flag; never remove or rename a contract node.

### P5 — Responsive and theme

- **Goal:** the 10 phone-and-theme marks, with real layout rather than masking.
- **R-IDs:** R9, N2, N3.
- **Selectors:** `#total-outstanding`, `[data-customer]`, `[data-balance]`, `#import-box`, `#import-go`, `#shot-input`, `img[data-shot]`, `#overdue`, `#entries`, `#lang-switch`; plus `document.documentElement.scrollWidth` and computed styles.
- **Files allowed:** `app/styles.css`; `app/index.html` only for a `meta viewport` or `color-scheme` line; `app/app.js` only if a layout-dependent measurement is required.
- **Acceptance:** at 375×812 `scrollWidth` is 375 or less with the sample and with an adversarial shop (long unicode names, 100-character unbroken notes, `250000.50`, thumbnails, 200 rows); every contract node is reachable without horizontal scrolling; text wraps; amounts are not clipped or abbreviated; tap targets are at least 40 px; both schemes meet 4.5:1 body contrast and 3:1 for large text and borders; `color-scheme: light dark` is set; no `overflow-x: hidden` used to mask overflow.
- **E2E gate suite (gate-only):** `E2E-P5-01–04` as defined in `TEST-CASES.md` v0.14: the sample and a 200-customer adversarial shop at 375×812 with all 200 rows in the DOM; light and dark contrast; tap targets at least 40 px; no `overflow-x` masking; no fixed or sticky overlay covering rows or the import section; amounts not clipped or abbreviated.
- **Risks:** a wide table; fixed widths; a long unbreakable name; an image without `max-width`; the sticky action bar covering the last row or the import box; grey-on-grey dark mode.
- **Rollback:** CSS-only revert to the previous gate tag.

### P6 — Hardening

- **Goal:** make the hidden-data test boring and prepare the submission note.
- **R-IDs:** R1–R10, B1–B7, N1–N6.
- **Selectors:** all of `CONTRACT.md` §1–§5 (full regression).
- **Files allowed:** `app/app.js`, `app/styles.css`, `app/index.html` (bug fixes only); the judges' note text is drafted here but submitted only by the human.
- **Acceptance:** 200-shop fuzz green with zero mismatches; double import replaces; reload persists; storage cleared renders the empty contract; quota path keeps the entry; `?today=` drives overdue and day counts; every bonus passes its scripted check; the full regression suite is green; no console errors; the judges' note is drafted with the final URL placeholder marked "pending deployment".
- **E2E gate suite (gate-only):** `E2E-P6-01–04` (full journey, empty-name duplicate regression, search empty state and per-row Add entry, home layout and customer-view routing) plus `F-02` (200 generated shops; seed recorded in the RUN) as defined in `TEST-CASES.md` v0.14, plus the full 58-test regression and the non-functional suite.
- **Risks:** overfitting to fuzz seeds; last-minute UI changes breaking a selector; shipping with an open P1 bug; stale cache on the host.
- **Rollback:** freeze features and fix only; revert `app/` to the last green gate tag if a fix regresses.

### Post-G6 UX note (v1.10)

The post-gate UX fix adds three behaviours and changes no CONTRACT node: a visible search empty-state line when a non-empty query matches nothing; a per-customer-row Add entry control that selects that customer in the entry form, scrolls to the form, and focuses the amount; and cache-busted asset URLs (`?v=6.1`) for the static files. No requirement ID, contract selector, or gate order changed.

### Post-G6.2 layout note (v1.11)

The layout fix changes presentation only: the customer view is hidden on `/` and shown on `?customer=`; the home order is Total → Search → Customers → Overdue → Add customer → entry form → Import → Shop UPI; search results render adjacent to the customer list, and `#customers` precedes `#overdue`. No contract selector was renamed or removed, and no requirement ID or gate order changed.

### P7 — Owner extras (post-gate, non-scored)

- **Goal:** add the owner-requested extras after the scored gates without touching the scored contract or the final score.
- **X-IDs:** X1, X2, X3, X4, X5. These are non-scored extras, **not** R/B/N requirements.
- **Selectors (non-contract extensions):** `#import-file`, `#import-choose`, the empty-`#import-go` picker path, the profile/logo controls, `#shop-upi`, and `#shot-ocr-hint`. None of these is a `CONTRACT.md` node; the scored selector set is unchanged.
- **Files allowed:** `app/index.html`, `app/styles.css`, `app/app.js`, `app/assets/*` (logo preview and profile UI only).
- **Acceptance:**
  - **X1 JSON/CSV file import:** `#import-file` and `#import-choose` load a JSON or CSV file; pressing `#import-go` with an empty box opens the file picker; a non-empty paste through `#import-box` keeps the existing path exactly; imported data replaces state atomically and never merges.
  - **X2 CSV schema:** primary columns `shop,phone,name,type,amount,date,note` in any order; a customers-only file `phone,name` imports customers and ignores financial columns with a warning; an entries-only file `phone,type,amount,date,note` imports entries; RFC-4180 quoting, and D4/D9/D10/D11 apply unchanged; shop name comes from the `shop` column or the filename.
  - **X3 UPI URI in the reminder:** the WhatsApp message text carries the same UPI URI as that row's pay anchor; the row still has exactly one `a[href^="upi://pay?pa="]`; the `wa.me` href format and the name plus `Rs` content are unchanged.
  - **X4 Shop profile, logo, brand:** owner name, address, UPI ID, logo and brand colour render in a visible header strip and profile card; the logo is stored as a 128 px data URL; the brand colour is applied as a contrast-safe tint/accent; without a logo the default palette is unchanged.
  - **X5 OCR status:** OCR is **not implemented**; B7 remains 0; the screenshot attaches and displays and the amount is entered manually; no OCR dependency, asset, or network request is added.
- **Not scored, no CONTRACT change, final model score unchanged.** P7 adds no requirement ID, no machine node, and no selector to `CONTRACT.md`; the 29 contract selectors and 23 R/B/N rows are untouched.
- **E2E gate suite (gate-only):** `E2E-P7-01–05` as defined in `TEST-CASES.md` v0.14, one per extra, plus a full regression re-run proving the scored contract is unaffected.
- **Risks:** an extra hiding, renaming, or reordering a contract node; file import bypassing replace semantics; a brand colour breaking contrast; profile data leaking into machine nodes; any OCR dependency or network call.
- **Rollback:** revert the P7 files or disable the extras behind a flag; the scored app state and all `CONTRACT.md` nodes remain intact.

### G0 sync note (v1.1)

The Tester's P0 gate suite is now `C-01–C-03`, `C-09–C-23`, `C-39`, and `E2E-P0-01–03` (`TEST-CASES.md` v0.14). The P0 contract smoke covers three things and nothing else: the **19 always-rendered `CONTRACT.md` §2 nodes** each resolve to exactly one visible element at first paint; the **ten data-dependent §1 selectors** have **zero** matches at empty state while `#total-outstanding` is `0`; and the **`?customer=` view** resolves its `#cust-name`, `#cust-balance`, and `#entries` nodes in the not-found state. `C-04–C-08` need data and are therefore not P0 cases: `C-04–C-06` (sample total, row count, balances) and `C-08` (import) are P2 oracles, and `C-07` (reminder href) is a P3 oracle. `C-39` covers console cleanliness (0 console errors, 0 uncaught rejections, 0 failed requests) on the four P0 routes: `/`, `/?customer=9000000101` (customer not-found), `/?today=2026-11-15`, and an invalid `?today`. No phase scope, requirement ID, selector, or gate order changes in this version.

## 3. Judges' note skeleton (draft, not submitted)

Status: final draft for the last gate; not submitted. The live link is pending deployment; the human owns and submits the final text.

```text
Live link: pending deployment

Routes: / (home: total, search and customer list). Customer page: add ?customer= followed by the 10-digit phone, or use the row's Open action.
Today override: add ?today=YYYY-MM-DD (for example /?today=2026-11-15) for date-dependent views.

Import: paste any JSON in the sample shape into #import-box and press #import-go.
Import replaces the shop; it never merges. The sample shop loads as total 11820 across 8 customer rows.
A JSON or CSV file can also be loaded with the file chooser; CSV columns are shop,phone,name,type,amount,date,note.
One row per phone, including zero-balance customers and customers auto-created from an unknown phone.

Total outstanding is the signed net sum of all customer balances; a negative total is shown as an advance.
Overdue list uses 30+ days since the customer's last payment.

WhatsApp reminder per customer carries the name and balance, and the message text also includes that customer's UPI pay link. Payment screenshots can be attached and are downscaled before storage.
A shop profile (owner name, address, UPI ID, logo, brand colour) is shown in the header and profile card; the logo is stored at 128 px and the brand colour is used as a contrast-safe tint.
Bonuses available: overdue list, edit/delete with recalculation, CSV export, search, UPI pay link, Hindi/Telugu labels.
Search filters the customer list by name or phone and shows a visible message when nothing matches. An entry can be added from a customer row or by choosing the customer in the form's Customer dropdown.
OCR prefill of the amount is not available: the amount is entered manually, and screenshot attachment and display still work. B7 is therefore not claimed.

No login required. Tested at 375 px and in light and dark themes. The app is static and every scored flow runs without a network call.
Evidence from our local suite: 63/63 checks passed; a 200-shop fuzz run (805 customers, 1,401 entries) produced 0 mismatches.
```

## 4. Gate checklist (Orchestrator, every gate)

- [ ] Tester RUN id present with commands and evidence
- [ ] Phase acceptance 100%, regression 100%
- [ ] No open P0/P1
- [ ] Contract audit 100%
- [ ] Doc sync check passes (`AGENTS.md` §4)
- [ ] Critic scorecard written; model score not lower than the previous gate
- [ ] `worklog.md` entry with `Next:`
