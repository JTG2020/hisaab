# PRD — Hisaab

Version: 0.1-draft
Updated: 2026-11-17
Owner: Planner
Supersedes: none
Sources: `PROJECT.md`, `WIN-ANALYSIS.md`, `WIN-PLAN.md`, `DESIGN.md`

> Planner: complete every acceptance criterion, verify the requirement set, then bump to 1.0. Do not renumber IDs.

## 1. Product summary

A digital ledger for a local shop, the notebook a kirana keeps for who owes what, with a one-tap WhatsApp reminder. Static web app, browser storage, no AI. Graded by a scripted browser tester on a live URL.

## 2. Users and jobs

- **Shop owner** (phone, one hand, busy, possibly Hindi/Telugu): record credit/payment, see who owes what, send a reminder.
- **Tester** (automated browser): import an arbitrary shop, read the contract, check numbers, upload a screenshot, exercise bonuses.

## 3. Scored outcomes

100 marks: hidden-data test 60, bonus 30 (6 of 7 items), phone + light/dark 10. Ties break on earlier submission.

## 4. Requirements

Each requirement: statement, acceptance (Given/When/Then), selectors, hidden-data risk.

### R1 — Add a customer
Statement: add a customer with a name and a 10-digit phone number.
Acceptance:
- Given the app is loaded, when a customer is saved with a valid name and 10-digit phone, then a row `[data-customer="<phone>"]` exists with balance `0`.
- Given an invalid phone (not 10 digits), then the save is rejected with a visible message and no row is created.
Selectors: `[data-customer]`, `[data-balance]`.
Hidden-data risk: duplicate phone (dedupe), unicode names, phone as number.

### R2 — Add an entry
Statement: add a credit (shop gave goods) or payment (customer paid), with amount, date and short note.
Acceptance: TODO (Planner).
Selectors: `[data-customer]`, `[data-balance]`.
Hidden-data risk: string amounts, commas, unknown type casing, same-date entries.

### R3 — Balances and total
Statement: show each customer's balance (credit − payments) and the shop's total outstanding at the top.
Acceptance: TODO (Planner) — total must equal the signed sum of balances and render bare digits.
Selectors: `#total-outstanding`, `[data-balance]`.
Hidden-data risk: overpayment (negative), zero balance, large numbers.

### R4 — Customer page
Statement: a customer page lists that customer's entries, newest first.
Acceptance: TODO (Planner).
Selectors: `?customer=<phone>`, `#cust-name`, `#cust-balance`.
Hidden-data risk: same-date order, unicode notes, long notes.

### R5 — Payment screenshot
Statement: a payment can have a screenshot attached; it shows as a small picture on the entry.
Acceptance: TODO (Planner) — `img[data-shot]` after save; survives reload.
Selectors: `#shot-input`, `img[data-shot]`.
Hidden-data risk: large file, quota exhaustion, non-image mime.

### R6 — WhatsApp reminder
Statement: a reminder button per customer with the customer's name and balance in the message.
Acceptance: TODO (Planner) — exact `wa.me` href with `91` prefix and URL-encoded text.
Selectors: `a[data-remind]`.
Hidden-data risk: names with `&`/unicode, zero balance, negative balance.

### R7 — Persistence
Statement: data is still there after a reload.
Acceptance: TODO (Planner).
Selectors: all (rendered from persisted state).
Hidden-data risk: storage disabled/quota; stale cache; merge.

### R8 — Import
Statement: an import box loads a JSON file in the sample format; the tester loads a different shop through it.
Acceptance: TODO (Planner) — replace semantics, tolerant parse, error without data loss.
Selectors: `#import-box`, `#import-go`.
Hidden-data risk: this is the hidden-data test surface: unknown phones, duplicate phones, string amounts, empty arrays, malformed JSON, second import.

### R9 — Phone layout
Statement: works well at 375 px.
Acceptance: TODO (Planner) — no sideways scroll with sample and long-unicode data.
Selectors: n/a (document measurements).
Hidden-data risk: long names/notes, big amounts, screenshot thumbnails.

### R10 — No AI
Statement: plain code and browser storage are enough.
Acceptance: no network calls required for any scored flow.
Selectors: n/a.
Hidden-data risk: accidental dependency on a CDN/API.

## 5. Bonus requirements

| ID | Item | Acceptance (Planner completes) |
|---|---|---|
| B1 | Overdue list by days since last payment | sorted desc, days visible, section labelled Overdue |
| B2 | Edit/delete entry with recalculation | total and row update, persists |
| B3 | CSV export matching data | downloads current state |
| B4 | Search by name or phone | filters rows live |
| B5 | UPI pay link in reminder | `upi://pay?pa=...&am=...&cu=INR` |
| B6 | Hindi or Telugu labels | switch keeps ids/machine values |
| B7 | Read amount from screenshot | prefill; never blocks save |

## 6. Non-functional requirements

| ID | Statement |
|---|---|
| N1 | Every contract selector exists at first paint with no data |
| N2 | No sideways scroll at 375 px |
| N3 | Readable in light and dark (contrast ≥4.5:1 body) |
| N4 | Integer money end to end; no float artefacts |
| N5 | Storage failure degrades gracefully (in-memory fallback, visible warning) |
| N6 | No console errors on load or on scored flows |

## 7. Out of scope

Authentication, multi-user sync, server/API, database, payments, notifications beyond the `wa.me` link, analytics, PWA/service worker, currency other than INR rupees.

## 8. Ambiguities

See `DECISIONS.md` (D1 overdue threshold, D2 net total, D3 routing, D4 money parsing, D5 OCR, D6 language).

## 9. Traceability

`TRACEABILITY.md` maps every R/B/N ID to phase, selectors and test case IDs.
