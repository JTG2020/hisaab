# IMPLEMENTATION-PLAN — Hisaab

Version: 1.21
Updated: 2026-11-18
Owner: Planner
Supersedes: IMPLEMENTATION-PLAN.md v1.20
Depends on: `PRD.md` v1.10, `TECH-STACK.md` v1.7, `CONTRACT.md` v1.7

v1.19 changes: reconciles every planning dependency reference with the current PRD v1.8, TECH-STACK v1.6, and CONTRACT v1.6 after the G9 documentation HOLD resolution.
v1.20 changes: adds the human-approved P10 Shop terminology/workspace presentation amendment (R13), preserving data behavior and requiring full P0–P9 regression plus a G10 Critic re-score.
v1.21 changes: adds strictly additive P11/R14 header presentation planning. `CONTRACT.md` remains frozen and unchanged; no new machine node or existing node move/rename/formatting change is authorized.

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
| P8 | Post-G7 local multiple-store management: create/switch/rename/delete, isolation, legacy migration, active-store import and reload behavior | R11 | E2E-P8-01–08 |
| P9 | Post-G8 store-workspace/profile UI and explicit add-as-new-store JSON/CSV import; pristine-bootstrap population and safe name resolution | R12 | E2E-P9-01–10 |
| P10 | Post-G9 Shop terminology/localization and existing workspace placement; no data-semantic or import changes | R13 | E2E-P10-01–04 + full P0–P9 regression |
| P11 | Strictly additive top-left active-shop name line alongside the unchanged owner name/address/UPI display; portfolio-name source only | R14 | C-60 + E2E-P11-01–02 + smoke, targeted unit/regression, full suite, 375/light/dark, Critic G11 |

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
  - **X1 JSON/CSV file import:** `#import-file` and `#import-choose` retain the P7 replacement flow: selecting JSON/CSV immediately replaces the active ledger atomically, including after the empty-`#import-go` picker opens; no second click stages or commits the import. A non-empty paste through `#import-box` and `#import-go` keeps the existing path exactly. E2E-P7-01/02 remain the regression oracles.
  - **X2 CSV schema:** primary columns `shop,phone,name,type,amount,date,note` in any order; a customers-only file `phone,name` imports customers and ignores financial columns with a warning; an entries-only file `phone,type,amount,date,note` imports entries; RFC-4180 quoting, and D4/D9/D10/D11 apply unchanged; shop name comes from the `shop` column or the filename.
  - **X3 UPI URI in the reminder:** the WhatsApp message text carries the same UPI URI as that row's pay anchor; the row still has exactly one `a[href^="upi://pay?pa="]`; the `wa.me` href format and the name plus `Rs` content are unchanged.
  - **X4 Shop profile, logo, brand:** owner name, address, UPI ID, logo and brand colour render in a visible header strip and profile card; the logo is stored as a 128 px data URL; the brand colour is applied as a contrast-safe tint/accent; without a logo the default palette is unchanged.
  - **X5 OCR status:** OCR is **not implemented**; B7 remains 0; the screenshot attaches and displays and the amount is entered manually; no OCR dependency, asset, or network request is added.
- **Not scored, no CONTRACT change, final model score unchanged.** P7 adds no requirement ID, no machine node, and no selector to `CONTRACT.md`; the 29 contract selectors and 23 R/B/N rows are untouched.
- **E2E gate suite (gate-only):** `E2E-P7-01–05` as defined in `TEST-CASES.md` v0.14, one per extra, plus a full regression re-run proving the scored contract is unaffected.
- **Risks:** an extra hiding, renaming, or reordering a contract node; file import bypassing replace semantics; a brand colour breaking contrast; profile data leaking into machine nodes; any OCR dependency or network call.
- **Rollback:** revert the P7 files or disable the extras behind a flag; the scored app state and all `CONTRACT.md` nodes remain intact.

### P8 — Multiple local stores (post-G7, human-approved contract extension)

- **Goal:** add full local-store portfolio management after P7 without any backend, account, network dependency, or change to existing scored machine nodes.
- **R-IDs:** R11.
- **Selectors:** `#store-manager`, `#store-select`, `#store-name`, `#store-create`, `#store-rename`, `#store-delete`, `#store-confirm-delete`, `#store-cancel-delete`, `#store-msg`, `#active-store-name`, plus active-store readings of `#total-outstanding`, `[data-customer]`, `[data-balance]`, `#shop-upi`, `#shop-logo`, `#owner-display-name`, `#owner-display-address`, `#owner-display-upi`, `#brand-theme`, `#import-box`, `#import-go`, `#cust-name`, `#cust-balance`, `#entries`.
- **Files allowed:** planning implementation later would be limited to `app/index.html`, `app/styles.css`, `app/app.js`; no server, dependency, or test/document file in this planning-only task.
- **Acceptance:**
  - Given first paint or a customer-view route, `#store-manager` and all six manager controls are visible; `#store-confirm-delete` and `#store-cancel-delete` appear as the inline confirmation row after `#store-delete`, but remain exact nodes and never alter the existing contract nodes.
  - Given a new store name of 1–60 characters after trim/whitespace collapse, unique case-insensitively, create succeeds: store count increases by exactly 1, its ledger and profile start empty, it becomes active, `#store-select` option count and active selection match, and reload persists the result.
  - Given blank, 61-character, or duplicate names, create/rename is rejected with no state change and `#store-msg` names the validation reason.
  - Given two stores A and B with different ledgers/profile/UPI/logo/brand, switching to B makes every existing customer/entry/profile node read B only, then reload restores B as active.
  - Given a switch while `?customer=<phone>` is present, `customer` is removed from the URL and home rerenders B; the previous store's phone, entries, UPI, logo, and profile are absent.
  - Given delete is clicked, deletion occurs only after `#store-confirm-delete`; cancel leaves count and active id unchanged.
  - Given one store remains, delete attempts leave the portfolio unchanged and `#store-msg` contains `last store`.
  - Given an active store A and a confirmed delete of A, A's complete ledger/profile/UPI/logo is removed, exactly one deterministic next store becomes active, and reload shows the remaining portfolio.
  - Given import in active store B, only B's ledger is replaced: store count/id/names/profile/UPI/logo and A's ledger remain unchanged; reload restores B as active with B's replaced ledger.
  - Given legacy `hisaab.v1`, `hisaab.profile.v1`, and `hisaab.upi.v1` with no P8 portfolio, migration creates exactly one store before first paint, preserves legacy customers/entries/profile/UPI/logo and shop name, uses `hisaab.upi.v1` only when profile UPI is empty, and repeats with no duplicate store.
  - Given storage write/read failure, create/switch/rename/delete/import degrade to in-memory state for the current tab and show `#store-msg` or the existing import/profile warning; no network or blank screen occurs.
- **E2E gate suite (gate-only):** `C-40–C-48`, `U-15`, `I-11–I-14`, and `E2E-P8-01–E2E-P8-08` as defined in the P8 row of `TRACEABILITY.md`; at least: manager visibility, create/switch/rename/confirmation/last-store/delete isolation, active reload, legacy migration, active-store import replace, customer-view switch, storage failure, 375 px and light/dark recheck, and a full P0–P7 regression. The Tester owns the final exact assertions in `TEST-CASES.md`.
- **Risks:** hiding manager controls behind a modal/tabs/`<details>`; treating the imported `shop` name as a portfolio rename; deleting or replacing A instead of only the active store; persisting a stale active id; migrating legacy data twice; leaking profile/logo/UPI or customer rows across stores; keeping `?customer=` after switching.
- **Rollback:** revert P8 implementation to the last G7/P7 green build and retain only the legacy migration/portfolio snapshot if a snapshot exists; never rename or remove existing `CONTRACT.md` §1–§8 nodes, and never reinterpret P8 rollback as a merge of stores.

### P9 — Unified store workspace and add-as-new-store import (post-G8, human-approved)

- **Goal:** combine Store management and Shop profile into one active-store workspace, add separate JSON/CSV portfolio import, and preserve every P0–P8 ledger, route, and machine-node behavior.
- **R-IDs:** R12.
- **Selectors:** existing P8 `#store-manager`, `#store-select`, `#store-name`, `#store-create`, `#store-rename`, `#store-delete`, `#store-confirm-delete`, `#store-cancel-delete`, `#store-msg`, `#active-store-name`, `#shop-upi`, `#shop-logo`, `#owner-display-name`, `#owner-display-address`, `#owner-display-upi`, `#brand-theme`; P9 `#store-workspace`, `#store-profile-editor`, the existing controls `#owner-name`, `#owner-address`, `#shop-upi`, `#logo-input`, `#profile-msg`, `#upi-msg`; plus `#import-add-store`, hidden `#import-add-file`, `#import-store-name`, `#import-store-confirm`, `#import-store-cancel`, `#import-store-msg`, `#import-box`, `#import-go`, P7 `#import-file`/`#import-choose`, `#total-outstanding`, `[data-customer]`, `[data-balance]`, `#cust-name`, `#cust-balance`, `#entries`.
- **Files allowed:** `app/index.html`, `app/styles.css`, `app/app.js`; no build step, dependency, backend, service, or test/document file in this planning-only task.
- **Acceptance:**
  - The active-store workspace visibly combines P8 store controls and `#store-profile-editor`; P9 may move `#owner-name`, `#owner-address`, `#shop-upi`, `#logo-input`, `#profile-msg`, and `#upi-msg` into it, retaining exact IDs, visibility, and input/autosave semantics. Header read-only display nodes and all other P0–P8 nodes stay in place.
  - No `#profile-save`, `#profile-brand-input`, or duplicate brand UI is required. Profile edits autosave on input and survive reload. Blank profile defaults are `ownerName/address/upi/logo=""` and `brand=null`.
  - A brand is accepted only as null or an RGB array of exactly three integer channels 0..255; a logo is accepted only as `data:image/...` at or below `LOGO_STORE_MAX_CHARS`. Invalid subfields blank to the defaults, show a visible add-import warning, and make no network request.
  - JSON pasted into `#import-box` and confirmed by `#import-add-store` creates a new store with the imported ledger and optional `profile`; old JSON with no `profile` creates blank profile fields.
  - If `#import-box` is empty, clicking `#import-add-store` opens the dedicated hidden `#import-add-file`; selecting JSON/CSV immediately enters the P9 add-store validation/name-confirm path. If the box is nonempty, `#import-add-store` parses its pasted content instead. JSON `profile` is honored only in this add path; CSV `shop` supplies the name and all profile fields are blank.
  - Existing P7 `#import-choose`/`#import-file` selection, including selection from the empty-`#import-go` picker, immediately performs active-ledger replacement as before (E2E-P7-01/02); it is never staged for a later click. `#import-go` paste and file replacement paths never create/rename/merge stores or apply an imported JSON profile.
  - `shop` supplies the store name in both JSON and CSV add paths; it is not silently used to rename a store through the replacement path.
  - Missing or collision-name resolution opens inline controls prefilled or blank as appropriate, and does not mutate the portfolio. `#import-store-confirm` creates only after a valid normalized 1–60-character, case-insensitive-unique name; `#import-store-cancel` leaves state unchanged.
  - The first-import bootstrap rule requires both ledger and profile to be empty and exactly one store. If true, it may repurpose that one store; otherwise it creates a separate store. It never discards existing ledger/profile data.
  - Successful add/populate activates the new store and removes only `customer` from the URL, preserving `today` and all P8 route semantics.
  - Manual `#store-create` starts a fully blank ledger and profile. Add operations never merge existing store ledgers or alter other stores.
- **E2E gate suite (gate-only):** `C-49–C-58`, `U-16`, `I-15–I-18`, and `E2E-P9-01–E2E-P9-10`, plus full P0–P8 contract smoke/regression, 375 px/light/dark, and a 200-shop fuzz rerun. Minimum cases:
  - `E2E-P9-01` workspace/profile UI and all existing P9/P8 nodes first paint.
  - `E2E-P9-02` JSON paste add as a separate store with profile.
  - `E2E-P9-03` old JSON add compatibility and blank profile defaults.
  - `E2E-P9-04` JSON/CSV file add through hidden `#import-add-file`, with `shop` name, blank CSV profile, and existing P9 validation/name-confirm behavior.
  - `E2E-P9-05` existing P7 `#import-choose`/`#import-file` selection still immediately replaces only the active ledger, and `#import-go` paste/file picker semantics remain unchanged; preserve E2E-P7-01/02 exactly.
  - `E2E-P9-06` missing/collision name resolution, confirm/cancel, and no overwrite.
  - `E2E-P9-07` pristine bootstrap population versus user-data no-populate.
  - `E2E-P9-08` activation, `customer` removal, `today` preservation, reload.
  - `E2E-P9-09` manual-store blank state and storage failure.
  - `E2E-P9-10` 375 px/dark and full P0–P8 regression.
- **Risks:** using `#import-go` for portfolio creation; silently merging or overwriting a collision; applying CSV profile claims; replacing a user-populated bootstrap store; hiding existing P8 or import nodes; changing URL params beyond `customer`; profile/logo cross-store leakage.
- **Rollback:** revert P9 `app/` changes to the G8 build; keep the P8 portfolio and all P0–P8 contract nodes intact; do not remove, merge, or migrate existing stores as rollback.

### P10 — Shop terminology and workspace presentation (post-G9, human-approved contract amendment)

- **Goal:** consistently present the existing manager in English, Hindi, and Telugu as Shops/Shop, arrange the existing controls within the approved workspace, and leave all P0–P9 data and machine behavior intact.
- **R-IDs:** R13.
- **Selectors:** `#store-workspace`, `#store-manager`, `#store-select`, `#store-name`, `#store-create`, `#store-rename`, `#store-delete`, `#store-confirm-delete`, `#store-cancel-delete`, `#store-msg`, `#active-store-name`, `#owner-name`, `#owner-address`, `#shop-upi`, `#logo-input`, `#owner-display-name`, `#owner-display-address`, `#owner-display-upi`, `#shop-logo`, `#brand-theme`.
- **Files allowed:** Coder: `app/index.html`, `app/styles.css`, `app/app.js` only for existing UI copy/layout/localization; Tester: `tests/**`, `docs/TEST-CASES.md`, `docs/test-results.md`; Critic: `docs/scorecards.md`; Orchestrator: `docs/worklog.md`. No role edits another role's scope.
- **Acceptance:**
  - English visible copy is exact: heading `Shop Manager`, active label `Active shop`, selector label `Select Shop`, name label `Shop name`, and actions `Create Shop`, `Rename Shop`, `Delete Shop`. Confirmation and all manager success/error/validation/storage messages use Shop terminology; `Store` must not appear in the visible manager/workspace copy.
  - Selecting `en`, `hi`, or `te` localizes all P10 heading, labels, actions, confirmation, and manager messages consistently. Existing P0–P9 localization behavior and all machine values remain unchanged.
  - In `#store-workspace`, shop selection remains at the top. The existing shop-name field and create/rename/delete actions are visually grouped at the bottom of the Shop profile workspace. All existing controls remain visible, usable, unique, and under their existing IDs.
  - The owner name/address/UPI read-only display stays at the top-left and updates for the active shop as it does today. `#active-store-name` continues to expose only the active shop's exact name.
  - Manual creation activates an empty ledger and blank profile `{ownerName:"", address:"", upi:"", logo:"", brand:null}`. Subsequent profile-input edits autosave to that new active shop and update only its display; another shop remains unchanged, including across reload.
  - No change to import replacement/add-shop flows, ledger calculations, scoring, storage keys/schema, profile defaults, or any P0–P9 behavior. Preserve all machine IDs, attributes, and data semantics.
- **Focused cases required from Tester:** add `C-59` and `E2E-P10-01–04` to `TEST-CASES.md` before the P10 gate. Cover exact English text and all three locales; top-versus-bottom placement and top-left owner display; blank manual-create profile followed by autosave to the active shop; and unchanged create/rename/delete/import/store-isolation behavior. Do not remove or relax any existing assertion. If a P0–P9 test has a literal visible-copy expectation that conflicts with the approved Shop terminology, update only that expected copy to the exact P10 wording while preserving its prior behavior, boundary, and regression assertions.
- **Test and gate order:** each app/test change runs the 10-second contract smoke and affected unit tests. E2E runs only at the P10 gate. After the final app/test change, Tester reruns the complete suite, retaining all P0–P9 tests unweakened and adding the focused P10 cases; report acceptance and regression separately. Critic independently audits the amended contract, re-scores before G10, and confirms no open P0/P1. No G10 PASS is recorded until the full suite, contract audit, doc sync, and scorecard are green.
- **Risks:** visible Store/Shop vocabulary drift across locales; copy tests accidentally asserting the obsolete label; moving a selector or owner display; profile inputs saving to the previously active shop; an accidental change to blank defaults, imports, or ledger behavior.
- **Rollback:** revert only P10 presentation/localization changes to the G9 build. Preserve the approved contract note and all P0–P9 state semantics; do not roll back or migrate portfolio data.

### P11 — Active shop name in the top-left header (post-G10, strictly additive)

- **Goal:** add a human-only active-shop name line in the top-left header, sourced exactly from the active portfolio shop name while preserving the existing owner name/address/UPI display and every P0–P10 behavior and contract node.
- **R-IDs:** R14.
- **Selectors:** existing `#active-store-name`, `#owner-display-name`, `#owner-display-address`, `#owner-display-upi`. The added shop-name line is ordinary class-only presentation markup with no `id`, `data-*` selector, or machine role; it must not replace or duplicate `#active-store-name`. No `CONTRACT.md` node is added or changed.
- **Files allowed:** Coder may change `app/index.html`, `app/styles.css`, and `app/app.js` only as needed for the presentation line and active-name synchronization. No role may change `CONTRACT.md`, `TECH-STACK.md`, or P10 `TEST-CASES.md`/test evidence scope outside its role.
- **Acceptance:**
  - Given the active shop is shown, the top-left header contains a new ordinary shop-name line whose text exactly equals `#active-store-name` text for the active portfolio shop.
  - Switching or renaming the active shop updates both `#active-store-name` and the added line to the active portfolio name; adding and activating a manual or P9-imported shop does the same.
  - Replacement import never changes the portfolio shop name or the added line. A ledger/import `shop` label is display/import data only for replacement flows and is not used as the added line source.
  - `#owner-display-name`, `#owner-display-address`, and `#owner-display-upi` remain in the top-left and unchanged. They continue to use active-profile values and existing blank fallbacks; sample data can show the shop name with blank owner/UPI profile, never invented owner/UPI values.
  - The ordinary line remains readable at 375 px and in light/dark; it wraps without horizontal overflow and introduces no hidden, moved, renamed, duplicated, or conditionally absent scored machine node.
  - No ledger, customer, entry, balance, profile, UPI/logo, import replacement/add-store, storage, route, score, or P10 copy/placement semantics change.
- **Test and gate order:**
  - Every app/test change runs the 10-second contract smoke and affected unit tests.
  - Tester defines and records focused `C-60` and `E2E-P11-01–02` in `docs/TEST-CASES.md` and `docs/test-results.md` before the gate; until those runs exist R14 remains `planned`, and no P11 pass or G11 pass may be claimed.
  - `C-60` covers source equality, no machine selector on the added line, top-left owner display fallbacks, switch/rename/add synchronization, reload, and replacement-import non-rename.
  - `E2E-P11-01` covers visible header presentation and the active portfolio name across switch/rename/add/reload.
  - `E2E-P11-02` covers replacement imports and P9 add/populate activation while proving the portfolio name, owner fallbacks, 375 px, and light/dark behavior remain correct.
  - At the gate, after any red P11 fix loop, Tester reruns the full P0–P11 regression and the applicable P8–P10 store/import regressions, plus the 375 px and light/dark checks.
  - Critic independently re-runs the contract smoke, P11 gate E2E, relevant fuzz/regression checks, and full-suite evidence, re-scores, and confirms no open P0/P1. G11 PASS requires phase acceptance 100%, full regression 100%, doc sync, and a PASS scorecard.
- **Risks:** sourcing the line from an imported ledger label instead of the active portfolio shop; duplicating or repurposing `#active-store-name`; moving or hiding owner display nodes; inventing owner/UPI fallback values; changing P9 replacement behavior or P10 copy/layout.
- **Rollback:** revert only P11 app presentation/synchronization changes. Preserve P10 copy/layout, P8/P9 portfolio state semantics, and all existing machine nodes; do not rename or migrate any store or profile.

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
