# PRD — Hisaab

Version: 1.0
Updated: 2026-11-17
Owner: Planner
Supersedes: PRD.md v0.1-draft
Sources: `PROJECT.md`, `WIN-ANALYSIS.md`, `WIN-PLAN.md`, `DESIGN.md`, `sample-data.json`, `sample-expected.json`

## 1. Product summary

A digital ledger for a local shop: the notebook a kirana keeps for who owes what, with a one-tap WhatsApp reminder. It is a static web app that runs on a phone, keeps its data in the browser, needs no login and no AI, and is graded by a scripted browser that imports an arbitrary shop and reads exact values back.

## 2. Users and jobs

- **Shop owner** — on a phone, one hand, between customers, possibly reading Hindi or Telugu. Records credit and payments, sees who owes what, sends a reminder in one tap.
- **Automated tester** — opens the live URL, imports a different shop through the visible import box, reads the contract nodes, reloads, re-imports, uploads a screenshot, and exercises each bonus item.

## 3. Scored outcomes

100 marks: hidden-data test 60, bonus menu 30 (six of seven items count), phone + light/dark 10. Ties break on the earlier submission.

## 4. Money rule (D4 — applies to R2, R3, R6, R8, B1, B3, B5, N4)

- Money is exact to the **paise** (two decimal places). No value is rounded to the rupee, no value is stored or summed as an inexact fraction, and no sum shows an artefact such as `670.0000000001`.
- Parsing accepts a JSON number or a string. A string may carry `Rs`, `₹`, spaces, and commas; those are removed before reading. Input with more than two decimal places is rounded to the nearest paise (never to the rupee) and the rounding is logged. Input that is not a finite number becomes `0` with a logged warning and never crashes the app.
- Machine values (`#total-outstanding`, `[data-balance]`, `#cust-balance`, `[data-amount]`) are **bare numbers**: no `Rs`, `₹`, comma, space, or plus sign. Whole-rupee values render without decimals (`11820`, `670`); fractional values render with up to two decimals (`670.50`, `-250.25`). Negative values keep the minus sign.
- Human-readable rupees (`Rs 1,500.50`) appear only in a sibling element a script never reads.
- The sample shop is unchanged by this rule: all sample amounts are whole rupees, so the expected total stays `11820` and each balance stays an integer.

## 5. Requirements

### R1 — Add a customer

**Statement:** Add a customer with a full name and a 10-digit phone number.

**Acceptance**
- Given the app is loaded, when a customer is saved with a non-empty name and exactly 10 digits in the phone field, then a row `[data-customer]` exists for that phone with `[data-balance]` text and attribute `0`.
- Given a phone that is not exactly 10 digits, when save is pressed, then a visible message explains the requirement, no row is created, and existing data is unchanged.
- Given a phone that already has a row, when save is pressed, then a visible message says the customer exists, no second row is created, and existing data is unchanged.
- Given a name with leading/trailing spaces or repeated internal spaces, then the displayed name is trimmed and whitespace-collapsed.

**Selectors:** `[data-customer]`, `[data-balance]`, `#new-name`, `#new-phone`, `#add-customer`.

**Hidden-data cases:** phone supplied as an imported number rather than a string; duplicate phone; names in Devanagari/Telugu script; very long names; empty name.

### R2 — Add an entry

**Statement:** Add an entry for a customer: **credit** (the shop gave goods) or **payment** (the customer paid), with an amount, a date, and a short note.

**Acceptance**
- Given a customer is selected, when a credit of 1500 is saved with a date and note, then that customer's balance increases by 1500 and the entry appears in `#entries` with type `credit` and amount `1500`.
- Given a payment of 500 is saved, then the balance decreases by 500 and the entry appears with type `payment`.
- Given the amount is entered as text containing `Rs`, `₹`, spaces, or commas, then the value is read by the money rule and stored exactly.
- Given the amount is fractional (`670.50`), then the balance and total reflect exactly `670.50`; whole-rupee sums never gain decimals.
- Given the amount field is empty, non-numeric, or zero, then save is rejected with a visible message and no entry is created.
- Given the date field is left at its default, then the date is today, or the `?today=` value when present.
- Given the note is empty, then the entry saves and shows no note text (never `undefined` or `null`).
- Given a payment type is selected, then `#shot-input` remains present and usable.

**Selectors:** `[data-customer]`, `[data-balance]`, `#entries`, `[data-entry-id]`, `[data-amount]`, `#entry-form`, `#entry-type`, `#entry-amount`, `#entry-date`, `#entry-note`, `#entry-save`.

**Hidden-data cases:** amount as number or string; `1,500`; `Rs 1500`; `-250`; `12.345`; `0`; huge values; equal dates; unicode notes.

### R3 — Balances and total outstanding

**Statement:** Show each customer's balance (all credit minus all payments) and the shop's total outstanding at the top.

**Acceptance**
- Given a customer has credits of 1500 and 420 and a payment of 180, then `[data-balance]` text and attribute are both `1740`.
- Given a customer overpays, then the balance is negative and renders with a minus sign (e.g. `-250.25`), and it is included in the total.
- Given the total is computed, then `#total-outstanding` text is the **signed net sum of every customer balance** (D2) rendered as a bare number, and its human sibling shows `Rs ...` or `Advance Rs ...` for a negative total.
- Given a fractional sum, then the total shows up to two decimals (e.g. `11820.50`); given a whole-rupee total, then it shows no decimals (e.g. `11820`).
- Given the sample shop is imported, then the total is `11820` and all eight balances match `sample-expected.json` exactly.
- Given the shop is empty, then `#total-outstanding` is `0`.
- Given any mutation (add, edit, delete, import), then the total is recomputed from all balances and never shows a stale or cached value.

**Selectors:** `#total-outstanding`, `[data-balance]`, `#cust-balance`.

**Hidden-data cases:** overpayment; zero balance; customer with no entries; large values (`250000`); fractional amounts; string amounts; sums in different orders; 200 customers.

### R4 — Customer page, entries newest first

**Statement:** A customer page lists that customer's entries, newest first, with the customer's name and balance.

**Acceptance**
- Given a customer row, when its link is followed, then `?customer=` opens the customer view with `#cust-name` equal to the full name and `#cust-balance` equal to that customer's balance (machine text and attribute).
- Given the customer has entries, then `#entries` lists every one of them and only that customer's entries, ordered by date descending; entries with equal dates keep the newest-saved first.
- Given an entry, then its `li[data-entry-id]` exposes the type, the amount in `[data-amount]`, and the date; the note renders as text.
- Given an entry has a screenshot, then `img[data-shot]` appears inside that entry.
- Given an unknown phone in `?customer=`, then the view shows `#cust-name` `Customer not found`, `#cust-balance` `0`, and an empty `#entries`, without crashing.
- Given the customer view is open, then `#total-outstanding`, `#import-box`, `#import-go`, `#shot-input`, and the customer rows are still in the DOM.

**Selectors:** `#cust-name`, `#cust-balance`, `#entries`, `[data-entry-id]`, `[data-amount]`, `img[data-shot]`, and the row link to `?customer=`.

**Hidden-data cases:** same-date entries; unicode and very long notes; a customer with no entries; a phone that needs normalising; a customer with an overpayment.

### R5 — Payment screenshot

**Statement:** A payment can have a screenshot attached; it shows as a small picture on the entry.

**Acceptance**
- Given the app is loaded, then `#shot-input` is a file input on the payment form, present before any customer is selected or any data is loaded.
- Given a payment is saved with an image attached, then that entry renders `img[data-shot]` immediately and after a reload.
- Given a large image, then it is downscaled before storage and still renders as a thumbnail.
- Given storage refuses the image, then the entry is still saved and visible without `img[data-shot]`, and a readable warning is shown; the save is not lost.
- Given an entry was saved without an image, then it has no `img[data-shot]`.
- Given the image is attached to a credit entry, then no screenshot is shown (the screenshot belongs to payments).

**Selectors:** `#shot-input`, `img[data-shot]`, `[data-entry-id]`.

**Hidden-data cases:** multi-megabyte image; non-image mime type; image removed before save; quota exhaustion; reload after a quota failure.

### R6 — WhatsApp reminder

**Statement:** A reminder button per customer, whose message contains the customer's name and their balance in rupees.

**Acceptance**
- Given any customer row, then exactly one `a[data-remind]` exists in it.
- Given a reminder link, then its `href` is exactly `https://wa.me/91` + the 10-digit phone + `?text=` + the URL-encoded message, with no other parameters.
- Given the decoded message, then it contains the customer's full name and their balance rendered as `Rs` followed by the bare balance number; a script decoding the text finds both.
- Given a name containing `&`, spaces, or Telugu/Devanagari characters, then the message is correctly URL-encoded and decodes to the exact name.
- Given a zero or negative balance, then the link still exists and still carries the rendered balance.

**Selectors:** `a[data-remind]`, `[data-balance]`.

**Hidden-data cases:** names with `&`, `+`, `%`; unicode names; zero balance; negative balance; 10-digit phones that begin with 6–9 or other digits; phone normalised from `+91`.

### R7 — Persistence across reload

**Statement:** Data is still there after a reload. Browser storage is enough.

**Acceptance**
- Given customers and entries were added, then a reload shows the same rows, balances, total, and customer view entries in the same order.
- Given a shop was imported, then a reload shows that shop's numbers, not the sample and not a union.
- Given an entry was edited or deleted, then a reload shows the post-edit state.
- Given storage is unavailable or throws, then the app still works in memory, shows a visible warning, and never shows a blank screen.
- Given storage has no data, then the app shows the full empty-state contract (D7).

**Selectors:** `#total-outstanding`, `[data-customer]`, `[data-balance]`, `#entries`.

**Hidden-data cases:** storage cleared; storage disabled; quota exceeded by a screenshot; reload after double import; reload in a second tab.

### R8 — Import JSON

**Statement:** An import box loads a JSON file in the sample format; the tester loads a different shop through it.

**Acceptance**
- Given the sample JSON is pasted into `#import-box` and `#import-go` is pressed, then the app shows `11820` in `#total-outstanding`, exactly 8 `[data-customer]` rows, and every `[data-balance]` equal to `sample-expected.json`.
- Given a second, different shop is imported in the same tab, then **only** the second shop remains: its row count, its total, and its balances. Import replaces; it never merges.
- Given the tester sets the textarea value without firing input events and then presses the button, then the pasted value is read and imported.
- Given malformed JSON, then a readable error appears, the previous shop is still rendered, and nothing crashes.
- Given a valid shop missing `entries` or `customers`, then the missing list is treated as empty, a warning appears, and the import succeeds.
- Given customers with the same phone, then exactly one row exists per phone, with the last record's full name, and a duplicate warning is shown.
- Given customers with the same name but different phones, then both exist as distinct rows.
- Given an entry for an unknown phone, then a row named `Customer` followed by the phone is auto-created and the money is counted.
- Given a customer with no entries, then the row exists with balance `0`.
- Given string or decorated amounts (`"Rs 1,500"`, `"1,500"`, `1500`, `"670.50"`, `"12.345"`), then they are read by the money rule, with more than two decimals rounded to the nearest paise and logged.
- Given `type` in any casing (`CREDIT`, `Credit`, `payment`, `PAID`), then it is mapped case-insensitively.
- Given empty arrays, then the shop renders empty with total `0` and no crash.

**Selectors:** `#import-box`, `#import-go`, `#import-msg`, `#total-outstanding`, `[data-customer]`, `[data-balance]`.

**Hidden-data cases (D9 and D4):**
- Duplicate phone with different full names → one row for that phone, last name kept, warning shown.
- Same full name with different phones → two independent rows.
- Exact duplicate (same normalised name and phone) → one row, no warning.
- Unknown phone in entries → auto-created row named `Customer` followed by the phone.
- Phone forms `+91 90000 00101`, `90000-00101`, `919000000101` → same row.
- Decimal amounts `670.5`, `"670.50"`, `12.345` (rounds to `12.35`), `-250.25`.
- String amounts with `Rs`, `₹`, commas, spaces.
- Amount `0`, missing amount, `NaN`, `Infinity` → `0` with no crash.
- 50–200 random shops, including all of the above mixed together.

### R9 — Works at 375 px

**Statement:** Works well on a phone 375 px wide; the shop owner uses a phone.

**Acceptance**
- Given a 375×812 viewport, then `document.documentElement.scrollWidth` is 375 or less with the sample loaded and with an adversarial shop (long unicode names, long notes, large amounts, screenshot thumbnails).
- Given the same viewport, then `#total-outstanding`, every `[data-customer]` row, `#import-box`, `#import-go`, and `#shot-input` are reachable and usable without horizontal scrolling.
- Given long unbroken names or notes, then text wraps and does not push the page wider.
- Given amounts, then they are fully visible and never abbreviated or clipped.

**Selectors:** `#total-outstanding`, `[data-customer]`, `[data-balance]`, `#import-box`, `#import-go`, `#shot-input`.

**Hidden-data cases:** 40-character unicode name; unbroken 100-character note; `250000.50`; 200 customers; thumbnails.

### R10 — No AI, no network dependency

**Statement:** Plain code and browser storage are enough. No AI is required for any scored flow.

**Acceptance**
- Given the static assets are served, then R1–R9 and B1–B6 work with the network disabled after load: no API call, no CDN font, no remote script.
- Given OCR (B7) is unavailable, then every other flow still works.
- Given the tester never logs in, then every route opens directly, with no auth, cookie wall, or consent banner.

**Selectors:** none specific; verified by network observation and route access.

**Hidden-data cases:** cold load; offline after first paint; blocked third-party requests.

## 6. Bonus requirements

All seven are built. At most six count, so one may fail harmlessly; each is visible, labelled, and reachable in at most two clicks.

### B1 — Overdue list

**Statement:** A list of customers overdue by 30+ days since their last payment, most overdue first.

**Acceptance**
- Given `?today=2026-11-15` and the sample shop, then `#overdue` lists exactly the customers with a positive balance whose latest payment is at least 30 days before that date.
- Given a listed customer, then its row carries the bare day count in `[data-days]` and the row is ordered by days descending.
- Given a customer with no payment at all, then it is not listed (D1).
- Given no overdue customers, then the section is present with its heading and an empty-state line.
- Given the section, then its heading text contains `Overdue` and `30+ days`, and no element inside it carries a `data-customer` attribute.

**Likely check:** script reads the section text and compares day numbers/order with an independent computation under `?today=`; screenshot for the label.

**Visible label:** `Overdue (30+ days)`.

**Selectors:** `#overdue`, the overdue row attribute `data-overdue`, `[data-days]`.

### B2 — Edit and delete an entry

**Statement:** Edit or delete an entry; balances and the total recalculate.

**Acceptance**
- Given an entry, then `button[data-edit-entry]` and `button[data-delete-entry]` are inside its row.
- Given an amount is edited from 500 to 800, then `[data-amount]`, the customer's `[data-balance]`, `#cust-balance`, and `#total-outstanding` all reflect the change, and it survives reload.
- Given an entry is deleted, then it disappears from `#entries`, the balance and total drop by its amount, and the change survives reload.
- Given an edit, then `data-entry-id` is unchanged.
- Given an edit or delete, then no other customer's balance changes.

**Likely check:** script clicks edit, changes the amount/date/note, reads balances and total, reloads, then deletes and re-reads.

**Visible label:** `Edit`, `Delete`.

**Selectors:** `[data-entry-id]`, `button[data-edit-entry]`, `button[data-delete-entry]`, `[data-amount]`, `#total-outstanding`, `[data-balance]`.

### B3 — CSV export

**Statement:** Export the current shop's data as CSV that matches what is on screen.

**Acceptance**
- Given any current shop, then clicking `#export-csv` downloads `customers.csv` and `entries.csv` built from that shop, not from the sample.
- Given `customers.csv`, then its header is exactly `phone,name,credit,payment,balance` and it has one row per customer row, with money values rendered as bare numbers.
- Given `entries.csv`, then its header is exactly `phone,type,amount,date,note` and it has one row per entry in newest-first order.
- Given a field containing a comma, quote, or newline, then it is quoted and embedded quotes are doubled.
- Given a fractional balance, then the CSV shows two decimals; a whole balance shows no decimals.

**Likely check:** script captures the download, parses the header and rows, and compares counts and totals with the rendered shop.

**Visible label:** `Export CSV`.

**Selectors:** `#export-csv`.

### B4 — Search by name or phone

**Statement:** Filter the customer list by name or phone as the owner types.

**Acceptance**
- Given `#search` is empty at load, then all customer rows are visible.
- Given a query matching part of a name or phone, case-insensitive, then only matching rows are visible.
- Given a query, then `#total-outstanding` is unchanged, the import section stays visible, and no customer is removed from state.
- Given the query is cleared, then every row returns.
- Given a reload without a query, then every row is present.

**Likely check:** script types a phone substring and a name substring, counts visible rows, clears, and recounts.

**Visible label:** search placeholder such as `Search name or phone`.

**Selectors:** `#search`, `[data-customer]`.

### B5 — UPI pay link in the reminder

**Statement:** A UPI payment link for the customer's outstanding balance.

**Acceptance**
- Given a customer with a positive balance, then a link matching `a[href^="upi://pay?pa="]` exists inside that customer's row with `am=` equal to the balance rendered as a bare number (e.g. `am=670`, `am=670.50`) and `cu=INR`.
- Given the link, then `tn=` carries the URL-encoded customer name.
- Given a zero or negative balance, then `am=0`.
- Given the shop supplies no VPA, then `pa=hisaab@upi` is used (D12).
- Given the href, then it starts with `upi://pay?pa=` and contains `cu=INR` exactly once.

**Likely check:** script reads the href, regex-matches `^upi://pay\?pa=`, parses `am` and `cu`, and compares `am` with the rendered balance.

**Visible label:** `Pay via UPI`.

**Selectors:** `a[href^="upi://pay?pa="]`, `[data-balance]`.

### B6 — Hindi and Telugu labels

**Statement:** Switch the visible labels between English, Hindi, and Telugu.

**Acceptance**
- Given fresh load, then `#lang-switch` exists, its value is `en`, and labels are English (D6).
- Given `hi` or `te` is selected, then visible labels translate.
- Given any language, then element ids, attributes, `data-*` values, phone numbers, names, dates, money text in machine nodes, `href` values, and `#import-box` content are byte-identical to English.
- Given the switch is used, then `#total-outstanding` and every `[data-balance]` stay bare numbers.

**Likely check:** script selects `hi` and `te`, reads a known label, and re-reads every machine node to confirm it is unchanged; screenshot per language.

**Visible label:** `English / हिंदी / తెలుగు`.

**Selectors:** `#lang-switch`, `#total-outstanding`, `[data-balance]`.

### B7 — Read the amount from the payment screenshot

**Statement:** OCR may read the amount from a payment screenshot and prefill the amount field.

**Acceptance**
- Given an image is chosen on `#shot-input`, then OCR may run and, when it resolves, prefills `#entry-amount` only if that field is still empty.
- Given OCR returns nothing or is unavailable, then the amount stays manual, save still works, and no error appears.
- Given the user typed an amount before OCR resolves, then the typed value is never overwritten.
- Given OCR is running, then `#entry-save` is never blocked and the entry can be saved immediately.
- Given the test uploads a clear image reading `1500`, then `#entry-amount` shows `1500` (or the entry saves with the manually entered value); no failure path blocks the flow.

**Likely check:** script uploads an image containing a rupee amount, waits a bounded time, reads `#entry-amount`; if empty, types the amount and saves to prove the fallback; screenshot evidence.

**Visible label:** `Read amount from screenshot` (adjacent to `#shot-input`).

**Selectors:** `#shot-input`, `#entry-amount`, `#entry-save`.

## 7. Non-functional requirements

### N1 — Contract at first paint
- Given empty storage, when the page is opened, then every selector in `CONTRACT.md` §1–§5 resolves before any interaction, `#total-outstanding` reads `0`, the customers container and empty-state message are visible, and the import box and shot input are usable.
- Given a script that never waits for data, then no contract node is missing or created later.

**Selectors:** all of `CONTRACT.md` §1–§5.

### N2 — No sideways scroll
- Given 375×812, then `document.documentElement.scrollWidth` is 375 or less with the sample and with adversarial long-unicode content.
- Given the same, then no element produces horizontal overflow and the page is not masked with `overflow-x: hidden` as a substitute for layout.

**Selectors:** document measurement; `#total-outstanding`, `[data-customer]`, `#import-box`.

### N3 — Readable in light and dark
- Given the light scheme, then body text contrast is at least 4.5:1 and large text and UI borders at least 3:1.
- Given `prefers-color-scheme: dark`, then the same thresholds hold for text, inputs, placeholders, balance chips, and borders.
- Given both schemes, then `color-scheme: light dark` is set and amounts remain legible without zoom.

**Selectors:** computed styles; `#total-outstanding`, `[data-balance]`, `#import-box`.

### N4 — Exact money
- Given any shop, then balances and the total are exact to the paise and contain no floating-point artifact.
- Given a whole-rupee value, then machine nodes show no decimals; given a fractional value, then up to two decimals.
- Given machine nodes, then the text and attribute match the bare-number shape and contain no currency symbol, grouping separator, or space.
- Given the same shop imported in a different order, then the total is identical.

**Selectors:** `#total-outstanding`, `[data-balance]`, `#cust-balance`, `[data-amount]`.

### N5 — Storage failure degrades gracefully
- Given storage throws on write (quota) or is disabled, then the app keeps working in memory, shows a visible warning, and never loses a save silently.
- Given a screenshot cannot be stored, then the entry is still saved and the warning names the photo.
- Given storage is later available, then a subsequent normal save works.

**Selectors:** `#import-msg`, `#entries`, `#total-outstanding`.

### N6 — No console errors
- Given a fresh load, then there are no console errors or uncaught rejections from app code.
- Given the scored flows (import twice, reload, clear storage, add/edit/delete, screenshot, OCR failure, language switch, search, export), then there are no console errors.

**Selectors:** browser console; all contract nodes.

## 8. Out of scope

Authentication, accounts, multi-user sync, server or API, database, real payments or payment settlement, notifications beyond the `wa.me` link, analytics, PWA/service worker, currencies other than INR rupees, automated backups, printing, and any AI service.

## 9. Ambiguities and decisions

All accepted decisions are in `DECISIONS.md`: D1 overdue threshold, D2 net total, D3 routing, D4 money, D5 OCR, D6 language, D7 empty shop, D8 CSV columns, D9 dedupe, D10 unknown phone, D11 malformed-entry defaults, D12 UPI payee.

## 10. Traceability

`TRACEABILITY.md` maps every R1–R10, B1–B7, and N1–N6 to a phase, the exact selectors, and test case IDs.
