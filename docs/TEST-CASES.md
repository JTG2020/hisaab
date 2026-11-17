# TEST-CASES — Hisaab

Version: 0.4
Updated: 2026-11-17
Owner: Tester
Supersedes: TEST-CASES.md v0.3

Oracle rules: expected values come from `PRD.md`, `CONTRACT.md`, `sample-expected.json`, or an independent computation in the test. Never from `app/**`. The tester reads the DOM as a hostile grader would: `textContent`, attribute values, `parseInt`/`Number`, first-match `\d+`, and the normative machine shape `^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$`.

Conventions: `C-` contract, `U-` unit, `I-` integration, `E2E-Pn-` gate, `F-` fuzz, `N-` non-functional. Every case names its R/B/N ID, its phase, the exact preconditions, the steps, and the exact expected value. `Runs at` says when the case is executed; a row marked P1/P2/P4 is a planned oracle and must not be run before its phase gate.

## 1. Contract layer (`C-`)

| ID | Req | Phase | Runs at | Preconditions | Steps | Expected (exact) | Auto |
|---|---|---|---|---|---|---|---|
| C-01 | N1 | P0 | P0 | empty storage | load `/` | `#total-outstanding` exists, text `0` | yes |
| C-02 | N1 | P0 | P0 | empty storage | load `/` | `#import-box` and `#import-go` visible | yes |
| C-03 | N1 | P0 | P0 | empty storage | load `/` | `#shot-input` exists in the payment form | yes |
| C-04 | R3 | P1/P2 | P2 | sample imported | read total | text matches `/^\d+$/`, value `11820` | yes |
| C-05 | R3 | P1/P2 | P2 | sample imported | count rows | exactly 8 `[data-customer]` | yes |
| C-06 | R3 | P1/P2 | P2 | sample imported | read each row | each `[data-balance]` text and attribute are bare integers matching `sample-expected.json` | yes |
| C-07 | R6 | P3 | P3 | sample imported | read each reminder | href matches `^https://wa\.me/91<phone>\?text=`; decoded text contains name and balance digits | yes |
| C-08 | R8 | P2 | P2 | sample imported | fill `#import-box`, click `#import-go` | rows and total reflect the pasted shop only | yes |
| C-09 | N1 | P0 | P0 | empty storage | load `/`; count and read each always-rendered id | every one of `#new-name`, `#new-phone`, `#add-customer`, `#entry-form`, `#entry-type`, `#entry-amount`, `#entry-date`, `#entry-note`, `#entry-save`, `#shot-input`, `#import-box`, `#import-go`, `#import-msg`, `#search`, `#export-csv`, `#lang-switch`, `#overdue`, `#customers`, `#total-outstanding` resolves to exactly one element and each has a non-zero layout box; none is inside `dialog`, `[hidden]`, `details:not([open])`, or a `display:none` ancestor | 19 nodes, each `count === 1` and visible | yes |
| C-10 | N1, R3, D7 | P0 | P0 | empty storage | read `#total-outstanding` text, attribute, and its siblings | text is exactly `0`; `data-value` is exactly `0`; text matches `^-?(0\|[1-9][0-9]*)(\.[0-9]{2})?$`; node text contains no `Rs`, `₹`, `,`, space, `+`, or `.00`; any `Rs` human string lives in a sibling, not inside the node | yes |
| C-11 | R5, R8, N1 | P0 | P0 | empty storage | read tag/type/accept/placeholder of the import and screenshot controls | `#import-box` tagName `TEXTAREA`; `#import-go` tagName `BUTTON`; `#shot-input` tagName `INPUT`, `type` `file`, `accept` `image/*`; all three visible; `#shot-input` is a descendant of `#entry-form` | yes |
| C-12 | R2, N1 | P0 | P0 | empty storage | read `#entry-type` options | exactly two options, `value` list exactly `["credit","payment"]`, in that order; `#entry-type` visible | yes |
| C-13 | B6, D6 | P0/P4 | P0 | empty storage | read `#lang-switch` tag, options, and value | tagName `SELECT`; option values exactly `["en","hi","te"]` in that order; `value` exactly `en`; the `en` option is selected; visible | yes |
| C-14 | B1, D1 | P0/P4 | P0 | empty storage | read `#overdue` heading and content | `#overdue` exists and is visible; its heading text contains both `Overdue` and `30+ days`; with no customers there is visible text inside `#overdue` beyond the heading (empty-state line) | yes |
| C-15 | N1, D7 | P0 | P0 | empty storage | read `#customers` | `#customers` exists and is visible; it contains visible non-empty text (the empty-state message) and 0 `[data-customer]` children | yes |
| C-16 | N1, D7 | P0 | P0 | empty storage | count every data-dependent selector | exactly 0 each of `[data-customer]`, `[data-customer="<phone>"]` for a known phone, `a[data-remind]`, `img[data-shot]`, `[data-entry-id]`, `[data-amount]`, `[data-days]`, `[data-overdue]`, `[data-overdue="<phone>"]`, `a[href^="upi://pay?pa="]`; `#total-outstanding` still `0` | yes |
| C-17 | R4, N1 | P0 | P0 | empty storage | load `/?customer=9000000101` | `#cust-name` text exactly `Customer not found`; `#cust-balance` text exactly `0` and `data-balance` exactly `0`; `#entries` exists with 0 element children and text `""`; `#total-outstanding`, `#import-box`, `#import-go`, `#shot-input`, `#customers` are all still in the DOM (and visible); no redirect; no console error | yes |
| C-18 | R2, B1, §1.6 | P0 | P0 | empty storage | load `/?today=2026-11-15` | HTTP 200; every §2 node from C-09 resolves; `#total-outstanding` text `0`; no console error, no uncaught rejection, no failed request | yes |
| C-19 | R2, §1.6, N6 | P0 | P0 | empty storage | load `/?today=not-a-date` (and `/?today=`) | HTTP 200; every §2 node from C-09 resolves; `#total-outstanding` text `0`; no console error, no uncaught rejection, no failed request; no crash (date-dependent fallback is asserted at P1 by U-12) | yes |
| C-20 | R9, N2 | P0 | P0 | empty storage, viewport 375×812 | load `/`, measure `document.documentElement.scrollWidth` | `scrollWidth <= 375` | yes |
| C-21 | N3 | P0 | P0 | empty storage, `prefers-color-scheme: dark` | load `/`, read computed styles | `getComputedStyle(document.documentElement).colorScheme` contains `dark`; `#total-outstanding`, `#import-box`, `#shot-input`, `#customers`, `#overdue`, `#lang-switch` visible; contrast ratio of body text, `#total-outstanding`, `.label`, `#customers` empty text, and `#search` text against their resolved backgrounds is `>= 4.5:1` | yes |
| C-22 | R10 | P0 | P0 | empty storage | load `/`, record every request until `load` + 500 ms | every request URL is same-origin (`http://localhost:4173`) or uses a `data:`/`blob:` scheme; 0 requests to any other origin; 0 failed requests | yes |
| C-23 | R10, S3 | P0 | P0 | served `app/` | static inspect `app/` and the HTML | `app/index.html`, `app/styles.css`, `app/app.js` exist; every `src`/`href` in `index.html` is relative (`./…`, `data:`, `#…`) — no leading `/`, no `http://`, no `https://`, no `localhost`; no `serviceWorker` registration anywhere in `app/`; no `document.cookie`; no `<input type="password">`; no build manifest, lockfile, or `package.json` inside `app/`; `/` and `/index.html` both return 200 | yes |
| C-24 | R1, R3, D9 | P1 | P1 | empty storage | save a customer with name `Ravi Kumar` and phone `9000000101`; read the row | exactly one `[data-customer="9000000101"]`; its `[data-balance]` text and attribute are both `0`; row text contains the name and the phone | yes |
| C-25 | R2, R4 | P1 | P1 | customer `9000000101` selected | save a credit `1500` and a payment `500` with dates; open `?customer=9000000101` | `#entries` has 2 `li[data-entry-id]`; each carries `data-type` (`credit`/`payment`) and `data-date` `YYYY-MM-DD`; each `[data-amount]` text and attribute are identical bare numbers (`1500`, `500`); the newest date is first | yes |
| C-26 | R4 | P1 | P1 | a customer with entries on two dates plus two entries on one date | load `?customer=<phone>`; read `#entries` order | order is date descending; equal dates order newest-saved first; only that customer's entries are present | yes |
| C-27 | R4 | P1 | P1 | customer `9000000101` with balance `670` | load `?customer=9000000101` | `#cust-name` text exactly the full name; `#cust-balance` text and `data-balance` both exactly `670`; `#entries` lists that customer's entries only | yes |
| C-28 | B1, D1 | P4 | P4 | shop where customer X has positive balance and last payment 45 days before `?today=2026-11-15` | load `/?today=2026-11-15`; read `#overdue` | exactly one `li[data-overdue="<X phone>"]`; its `[data-days]` text and attribute are both `45`; rows sorted by days descending; no `data-customer` attribute inside `#overdue` | yes |
| C-29 | B3, D8 | P4 | P4 | any non-sample shop loaded | click `#export-csv`, capture both downloads | `customers.csv` header exactly `phone,name,credit,payment,balance`, one row per customer row, numeric fields bare per §3.3; `entries.csv` header exactly `phone,type,amount,date,note`, one row per entry, newest first | yes |
| C-30 | B4 | P4 | P4 | sample imported | type `9000000102` into `#search`; then clear it | only rows whose name or phone contains the query are visible; `#total-outstanding` unchanged; `#import-box`/`#import-go` still present; clearing restores every row; reload restores every row | yes |
| C-31 | R1 | P1 | P1 | empty storage | type name `Sunita Devi`, phone `9000000102`, click `#add-customer`; then retry with phone `90000001` and again with `9000000102` | first: one row `[data-customer="9000000102"]` with `[data-balance]` `0`; short phone: visible message, row count unchanged; duplicate phone: visible message, still exactly one row for that phone | yes |
| C-32 | R2 | P1 | P1 | customer selected | fill `#entry-amount` `Rs 1,500`, `#entry-date` `2026-11-15`, `#entry-note` `groceries`, submit `#entry-save`; then submit an empty amount | balance rises by `1500`; `[data-entry-id]` and `[data-amount]` `1500`; note text renders; empty amount is rejected with a visible message and no new entry | yes |
| C-33 | R8 | P2 | P2 | sample imported | paste malformed JSON into `#import-box`, click `#import-go` | `#import-msg` contains `Could not import`; previous rows, balances, and total (`11820`, 8 rows) unchanged; no crash | yes |
| C-34 | R8 | P2 | P2 | empty storage | paste `sample-data.json` into `#import-box` without firing input events, click `#import-go` | `#import-msg` is non-empty and contains the shop name, the customer count `8`, and the rendered total `11820` | yes |
| C-35 | B5, D12 | P4 | P4 | shop with a positive-balance customer (`670`), a zero-balance customer, and a negative-balance customer; the imported shop shape supplies no VPA | load `/`; read every row's `a[href^="upi://pay?pa="]` href | exactly one such link inside each `[data-customer="<phone>"]` row; every href starts `upi://pay?pa=hisaab@upi&am=`; `am=` equals the §3.3 rendering of `max(balance, 0)` (`am=670`, `am=670.50`, `am=0`, never a negative amount); `cu=INR` occurs exactly once; `tn=` percent-encodes the full name so decoding returns it byte-identically; no other query parameter is present (D12; the shop-supplied-VPA branch is unreachable from the documented import shape and is not asserted) | yes |
| C-36 | B2 | P4 | P4 | customer `9000000101` with credit `500` and payment `200` (balance `300`), plus a second customer whose balance is known | load `?customer=9000000101`; click `button[data-edit-entry]` on the `500` entry, change the amount to `800`, save; reread; reload; then click `button[data-delete-entry]` on the `200` entry | both `button[data-edit-entry]` and `button[data-delete-entry]` exist inside every `li[data-entry-id]`; before the edit the entry's id is `E1`; after the edit `[data-amount]` text and attribute are both `800`, `[data-balance]` and `#cust-balance` are both `600`, `#total-outstanding` rose by exactly `300`, and the entry's `data-entry-id` is still `E1`; after reload all four values are unchanged; after the delete the entry is gone from `#entries`, `[data-balance]` and `#cust-balance` are `800`, `#total-outstanding` dropped by exactly `200`, and the second customer's balance never changed | yes |
| C-37 | R4 | P1 | P1 | customer `9000000101` named `Ravi Kumar`, balance `670`, with entries on two dates | load `/`; follow the row link `a[href="?customer=9000000101"]` | exactly one such link per `[data-customer="<phone>"]` row, and its href is exactly `?customer=` + the normalised phone; the customer view then shows `#cust-name` exactly `Ravi Kumar`, `#cust-balance` text and `data-balance` both exactly `670`, and `#entries` listing exactly that customer's entries newest date first; `#total-outstanding`, `#import-box`, `#import-go`, `#shot-input`, and every `[data-customer]` row stay in the DOM | yes |
| C-38 | B7, D5 | P4 | P4 | a customer selected; an image file readable by OCR; the OCR path exercised both available and unavailable | (a) select a file on `#shot-input` while `#entry-amount` is empty and wait a bounded 5 s; (b) type `999` into `#entry-amount`, then select the file; (c) force OCR to fail or return nothing, then save immediately | (a) `#entry-amount` is either still empty or equal to the OCR value, and `#entry-save` saves successfully in both cases; (b) `#entry-amount` is exactly `999` — OCR never overwrites typed input; (c) `#entry-save` is never disabled or blocked, the entry saves with the manually typed amount, no console error, no uncaught rejection, no blocking dialog, and the selected file is not silently cleared; a failed OCR leaves manual entry fully usable | yes |
| C-39 | N6 | P0 | P0 | empty storage | load `/`, `/?customer=9000000101`, `/?today=2026-11-15`, and an invalid `?today` in one fresh context; capture console errors, uncaught rejections, and failed requests | 0 console errors, 0 uncaught rejections, 0 failed requests on every route; `#total-outstanding` is 0 and the §2 nodes resolve on every route | yes |

## 2. Unit layer (`U-`)

| ID | Req | Phase | Runs at | Preconditions | Steps | Expected (exact) | Auto |
|---|---|---|---|---|---|---|---|
| U-01 | R3 | P1 | P1 | — | sum `[{credit:250,payment:180}]` | balance `70`, integer | yes |
| U-02 | R8 | P2 | P2 | — | parse `"Rs 1,500"`, `"1,500"`, `1500` | `1500` each | yes |
| U-03 | R8 | P2 | P2 | — | parse type `CREDIT`, `Credit`, `credit` | all credit | yes |
| U-04 | R4 | P1 | P1 | — | sort same-date entries | insertion order desc as tie-break | yes |
| U-05 | N4, D4 | P1 | P1 | — | credits `1500` + `420`, payment `180` (rupees) through the money rule | exactly `174000` integer paise; rendered `1740`; no float artefact (`174000.0000001`, `173999.9999` fail); `typeof` the derived value is number and `Number.isInteger` is true | yes |
| U-06 | N4, D4 | P1 | P1 | — | parse `"670.50"` | `67050` paise; rendered text and attribute exactly `670.50` (two decimals, no trailing `0` removal) | yes |
| U-07 | N4, D4 | P2 | P2 | — | parse `"12.345"` | `1235` paise; rendered `12.35` (third digit `5` rounds half away from zero, never to the rupee); rounding is logged | yes |
| U-08 | R3, D2 | P1 | P1 | — | customer with credit `100` and payment `350.25` | balance `-25025` paise, rendered text and attribute `-250.25`; included in the signed shop total; never `-0` | yes |
| U-09 | N4, D4 | P1 | P1 | — | render whole sum `1182000` paise and fractional sum `1182050` paise | `11820` (no decimals) and `11820.50` (exactly two decimals); both match the §3.3 shape | yes |
| U-10 | N4, D4 | P2 | P2 | — | parse `""`, `"abc"`, `NaN`, `Infinity`, `null`, `"1,2,3"` | `0` each, a warning is logged, nothing throws | yes |
| U-11 | N4, D4 | P2 | P2 | — | parse an amount above `9000000000000000` paise | clamped to exactly `9000000000000000` and logged; still an exact integer | yes |
| U-12 | R2, §1.6 | P1 | P1 | — | read `?today=2026-11-15`, `?today=not-a-date`, `?today=` (empty), and no parameter | first: `2026-11-15`; the other three: the local calendar date `YYYY-MM-DD`; an invalid value never becomes a date string | yes |
| U-13 | R8, D11 | P2 | P2 | — | map types `credit`, `CREDIT`, `debit`, `gave`, `udhaar`, `payment`, `PAID`, `received`, `reversed`, `` | first seven map by the §4 rule (`credit`,`credit`,`credit`,`credit`,`credit`,`payment`,`payment`,`payment`); the last two → `credit` with a warning | yes |
| U-14 | R4, §4 | P2 | P2 | — | sort entries `2026-10-01`, `2026-10-05`, `2026-10-05` (insertion 1 then 2), `bad-date` | order `2026-10-05`#2, `2026-10-05`#1, `2026-10-01`, `bad-date` (non-ISO sorts after all ISO dates) | yes |

## 3. Integration layer (`I-`)

| ID | Req | Phase | Runs at | Preconditions | Steps | Expected (exact) | Auto |
|---|---|---|---|---|---|---|---|
| I-01 | R8 | P2 | P2 | sample imported | import a second different shop | no first-shop rows remain; total equals second shop | yes |
| I-02 | R7 | P1 | P1 | entries exist | reload page | same rows, balances, total | yes |
| I-03 | R5 | P3 | P3 | payment with image | save, reload | `img[data-shot]` exists on the entry | yes |
| I-04 | R8, D9 | P2 | P2 | empty storage | import two customers with phone `9000000101`, names `Ravi Kumar` then `Ravi K Sharma` | exactly one `[data-customer="9000000101"]`; its displayed name is `Ravi K Sharma` (last record); `#import-msg` contains `duplicate` and the phone; the row's balance counts the entries once | yes |
| I-05 | R8, D9 | P2 | P2 | empty storage | import `Ravi Kumar`/`9000000101` and `Ravi Kumar`/`9000000102` | exactly two rows, `[data-customer="9000000101"]` and `[data-customer="9000000102"]`; no duplicate warning for this case | yes |
| I-06 | R8, D9 | P2 | P2 | empty storage | import the same record twice (`Ravi Kumar`, `9000000101`) | exactly one row; no `duplicate` warning; balance counted once | yes |
| I-07 | R8, D10 | P2 | P2 | empty storage | import one customer `9000000101` and an entry for `9000000199` (`credit` `250`) | a row exists for `9000000199` named exactly `Customer 9000000199`; its balance is `250`; it is included in `#total-outstanding` | yes |
| I-08 | R5, N5 | P3 | P3 | payment entry with a 3 MB image | save with `localStorage.setItem` forced to throw; reload | entry is saved and visible; `img[data-shot]` absent for it; visible warning naming the photo; no crash, no data loss | yes |
| I-09 | R7, N5 | P1 | P1 | storage disabled (`Storage.prototype.setItem` throws) | add a customer and an entry, then read the DOM | app works in memory, row and total present, visible warning, no blank screen | yes |
| I-10 | R8 | P2 | P2 | sample imported | import `{"shop":"x"}` (no `customers`, no `entries`) | import succeeds; 0 rows; `#total-outstanding` `0`; `#import-msg` contains a warning; no crash | yes |

## 4. End-to-end gate layer (`E2E-`)

| ID | Req | Phase | Runs at | Preconditions | Steps | Expected (exact) | Auto |
|---|---|---|---|---|---|---|---|
| E2E-P0-01 | N1 | P0 | P0 | empty storage | load `/`; then load `/?customer=9000000101` | P0 reading of "every contract selector resolves": each of the 19 always-rendered `CONTRACT.md` §2 nodes resolves to exactly one visible element at first paint; every data-dependent §1 selector (`[data-customer]`, `[data-customer="<phone>"]`, `a[data-remind]`, `img[data-shot]`, `[data-entry-id]`, `[data-amount]`, `[data-days]`, `[data-overdue]`, `[data-overdue="<phone>"]`, `a[href^="upi://pay?pa="]`) has exactly 0 matches at empty state while `#total-outstanding` is `0`; and on `?customer=` the customer-view selectors `#cust-name`, `#cust-balance`, and `#entries` each resolve (not-found state: `Customer not found`, `0`, 0 children). No §1 selector is expected to exist without data; absence at empty state is the correct P0 outcome, not a gap | yes |
| E2E-P0-02 | N1, R4, §1.6 | P0 | P0 | empty storage | visit `/`, `/?customer=9000000101`, `/?today=2026-11-15`, `/?customer=9000000101&today=2026-11-15`, `/?today=not-a-date` in one context; re-read the §2 set on each | every route returns 200, the 19 §2 nodes resolve and the machine total is `0` on every route, the customer view is the not-found state, and the console stays clean on all five loads | yes |
| E2E-P0-03 | R9, N2, N3, R10 | P0 | P0 | empty storage | 375×812 light, 375×812 dark, then a desktop load with request recording | `scrollWidth <= 375` in both schemes; contrast ≥4.5:1; only same-origin/`data:` requests; no console errors | yes |

## 5. Fuzz layer (`F-`)

| ID | Req | Phase | Runs at | Preconditions | Steps | Expected (exact) | Auto |
|---|---|---|---|---|---|---|---|
| F-01 | R3, R8 | P2 | P2 | generated shop | import and compare | total and all balances equal independent computation; row count equals customer count | yes |
| F-02 | R3, R8, N4 | P6 | P6 | 200 generated shops, seed recorded | import each, compare | 0 mismatches; every balance and total equals the test-process integer paise computation; no row dropped; no `NaN`/`undefined` | yes |

## 6. Non-functional layer (`N-`)

| ID | Req | Phase | Runs at | Preconditions | Steps | Expected (exact) | Auto |
|---|---|---|---|---|---|---|---|
| N-01 | R9 | P5 | P5 | sample + long unicode | 375×812 | `document.documentElement.scrollWidth <= 375` | yes |
| N-02 | N3 | P5 | P5 | dark scheme | load, read contrast | body text contrast ≥4.5:1; balance and chips readable | yes |
| N-03 | R5 | P3 | P3 | 3 MB image | upload, save | entry saved; `img[data-shot]` present; entry retained on quota failure | yes |
| N-04 | N2, R9 | P5 | P5 | adversarial shop: 120-character unicode name, 100-character unbroken note, `250000.50`, thumbnail, 200 rows | 375×812 | `scrollWidth <= 375`; no element wider than the viewport other than the document; `#total-outstanding` not clipped or abbreviated | yes |
| N-05 | R10 | P0 | P0 | static `app/` | scan `app/index.html` and `app/app.js` for third-party origins, `serviceWorker`, `document.cookie`, `localStorage` auth gates, analytics tags | 0 matches for each; R1–R9 and B1–B6 need no login, cookie, or consent | yes |
| N-06 | N6 | P6 | P6 | full journey | import sample, import a second shop, reload, clear storage, add/edit/delete, screenshot, forced OCR failure, language switch, search, export | 0 console errors and 0 uncaught rejections across the journey | yes |

## 7. Selector coverage index

Mandatory before the G0 sync check: every selector token that appears in `CONTRACT.md` must appear in this file. Tokens are listed verbatim so the grep in `AGENTS.md` §4 resolves them. The automated grep only sees tokens that start with `#` or `[`, so the letter-prefixed and structural selectors are swept by hand and listed below; every one has a case.

| Selector | Case(s) at empty state / presence | Positive-data case |
|---|---|---|
| `#total-outstanding` | C-01, C-10, C-16, C-17, C-18, C-19, E2E-P0-01 | C-04, C-33 |
| `#customers` | C-09, C-15, C-17, E2E-P0-01 | C-24 |
| `#search` | C-09, C-21, C-30 | C-30 |
| `#overdue` | C-09, C-14, C-21 | C-28 |
| `#import-box` | C-02, C-09, C-11, C-17, C-22 | C-08, C-34 |
| `#import-go` | C-02, C-09, C-11, C-17 | C-08, C-34 |
| `#import-msg` | C-09, C-11 | C-33, C-34 |
| `#shot-input` | C-03, C-11, C-17, C-21 | I-03, I-08 |
| `#cust-name` | C-17, E2E-P0-01 | C-27, C-37 |
| `#cust-balance` | C-17, E2E-P0-01 | C-27, C-36, C-37 |
| `#entries` | C-17, E2E-P0-01 | C-25, C-26, C-27, C-36, C-37 |
| `#new-name` | C-09 | C-31 |
| `#new-phone` | C-09 | C-31 |
| `#add-customer` | C-09 | C-31 |
| `#entry-form` | C-09, C-11 | C-32 |
| `#entry-type` | C-09, C-12 | C-32 |
| `#entry-amount` | C-09 | C-32, C-38, U-06 |
| `#entry-date` | C-09 | C-32, U-12 |
| `#entry-note` | C-09 | C-32 |
| `#entry-save` | C-09 | C-32, C-38 |
| `#export-csv` | C-09 | C-29 |
| `#lang-switch` | C-09, C-13, C-21 | N-06 |
| `[data-entry-id]` | C-16, E2E-P0-01 | C-25, C-32, C-36 |
| `li[data-entry-id]` | C-16 (via `[data-entry-id]`) | C-25, C-36 |
| `[data-amount]` | C-16, E2E-P0-01 | C-25, C-32, C-36 |
| `[data-customer]` | C-15, C-16, E2E-P0-01 | C-05, C-24, C-36 |
| `[data-customer="<phone>"]` | C-16, E2E-P0-01 | C-24, I-04, I-05, C-36 |
| `[data-balance]` | C-16, C-24 | C-06, C-24, C-36, C-37 |
| `[data-days]` | C-16, E2E-P0-01 | C-28 |
| `[data-overdue="<phone>"]` | C-16, E2E-P0-01 | C-28 |
| `li[data-overdue="<phone>"]` | C-16 (via `[data-overdue="<phone>"]`) | C-28 |
| `a[data-remind="<phone>"]` | C-16, E2E-P0-01 | C-07 |
| `a[href="?customer=<phone>"]` | C-16 does not apply (zero rows) | C-37 (row link), C-17 (target route) |
| `a[href^="upi://pay?pa="]` | C-16, E2E-P0-01 | C-35 |
| `img[data-shot]` | C-16, E2E-P0-01 | I-03, I-08, N-03 |
| `button[data-edit-entry]` | — (zero entries at empty state) | C-36 |
| `button[data-delete-entry]` | — (zero entries at empty state) | C-36 |
| `input[type=file][accept="image/*"]` | C-03, C-11 | I-03, I-08 |
| `?customer=<phone>` (query parameter, not an element) | C-17, E2E-P0-01, E2E-P0-02 | C-37, C-27 |
| `?today=YYYY-MM-DD` (query parameter, not an element) | C-18, C-19, E2E-P0-02 | U-12, C-28 |
| `dialog`, `[hidden]`, `details:not([open])` (gate prohibition, not a node) | C-09 (no §2 node may sit inside one) | — |
| `data-customer` inside `#overdue` (prohibition, not a node) | C-14 (zero overdue rows) | C-28 (asserted absent) |
| `.human` sibling of `#total-outstanding` (§3.4, class not an id) | C-10 (the `Rs` string lives only in the sibling) | C-04 |

Snippet-only notation, deliberately **not** machine nodes: `#new-customer` (the `<form>` wrapper in the §1.9 example) is absent from the §2 always-rendered list and from the §8 extensions register; under `CONTRACT.md` §0 the HTML snippets are illustrative and the bullet lists are normative, so no case requires it. The same applies to class names used only in examples (`.label`, `.empty`, `.entries`, `.name`, `.phone`, `.amount`, `.note`, `.total`): tests read the contract ids and `data-*` attributes, never those classes.

Requirement-vs-case IDs: **`N6` is a requirement ID** ("no console errors"), never a case ID. Its oracles are **C-39** at P0 (four routes in a fresh context: 0 console errors, 0 uncaught rejections, 0 failed requests) and **N-06** at P6 (the full journey). Other requirement IDs that could be mistaken for case IDs follow the same pattern: `R1`–`R10` and `B1`–`B7` are requirements, all cases are `C-`/`U-`/`I-`/`E2E-`/`F-`/`N-` prefixed. Requirement `N6` is also enforced inside the other P0 cases (C-01…C-23, E2E-P0-01…03) as an embedded assertion, not as a separate case.

## 8. Case families to complete

1. **Contract** — every selector and every forbidden variation (formatted numbers, filtered rows, duplicate rows). P0 rows C-09…C-23 and **C-39** plus E2E-P0-01…03 are implemented; C-24…C-38 are the positive-data oracles for P1/P2/P4 (C-35 UPI href, C-36 edit/delete, C-37 customer-view row link, C-38 OCR fallback).
2. **Unit** — money parse/sum, type coercion, dedupe, sort, totals, `?today` parsing. U-05…U-14 are planned at P1/P2 and must not run at P0.
3. **Integration** — import replace, persistence, reminder href, screenshot lifecycle, quota degrade. I-04…I-10 planned.
4. **E2E per phase** — the journeys in `IMPLEMENTATION-PLAN.md` §2. E2E-P0-01…03 run only at G0.
5. **Fuzz** — 50 shops at P2, 200 at P6; hostile mixes: overpayment, zero balance, no entries, unknown phone, duplicate phone, string amounts, same dates, unicode, large values, empty arrays, malformed JSON.
6. **Non-functional** — 375 px, dark, long strings, quota, storage disabled, no network.

## 9. Bug-derived regression cases

Add one per closed bug, named `REG-<bug id>`, derived from `PRD.md`/`CONTRACT.md`, never from the patch.

## 10. Change log

| Version | Date | Change | By |
|---|---|---|---|
| 0.1-draft | 2026-11-17 | Seeded cases C-01…C-08, U-01…U-04, I-01…I-03, E2E-P0-01, F-01, N-01…N-03 | framework |
| 0.2 | 2026-11-17 | Added P0 contract cases C-09…C-23 and planned oracles C-24…C-34, U-05…U-14, I-04…I-10, E2E-P0-02…03, F-02, N-04…N-06; added the selector coverage index. No existing case weakened or renumbered | Tester |
| 0.3 | 2026-11-17 | Added **C-35** (B5 UPI href, D12 default payee), **C-36** (B2 edit/delete recalculation), **C-37** (R4 row link `a[href="?customer=<phone>"]` → customer view), **C-38** (B7 OCR prefill/never-overwrite/never-block). Rewrote the coverage index to cite C-35 for `a[href^="upi://pay?pa="]` (previously mis-cited as "C-30 family"), C-36 for `button[data-edit-entry]`/`button[data-delete-entry]`, C-37 for the row link, and C-38 for the OCR path; added the manual sweep of letter-prefixed, structural, prohibition, and query-parameter selectors. Clarified **E2E-P0-01** to the correct P0 reading (19 §2 nodes resolve; data-dependent §1 selectors have zero matches; customer-view selectors resolve on `?customer=`). No existing expected value changed | Tester |
| 0.4 | 2026-11-17 | Added **C-39** (N6, P0 console-clean across four routes in one fresh context: 0 console errors, 0 uncaught rejections, 0 failed requests). Fixes a labeling mismatch: RUN-2 listed an executed case `N6`, which is a **requirement** ID with no case row; the Playwright test holding those assertions was renamed `N6 first paint...` → `C-39 first paint...` with no assertion change, and `N-06` remains the P6 full-journey case. Coverage notes now state that `N6` is never a case ID. No existing case, ID, or expected value changed | Tester |
