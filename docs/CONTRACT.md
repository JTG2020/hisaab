# CONTRACT — Hisaab (machine interface)

Version: 0.1 — **FROZEN at gate G0**
Updated: 2026-11-17
Owner: Planner
Supersedes: none

This file is the score. The grader reads these exact nodes. The Coder may not rename, move, wrap, hide, or conditionally render any of them. Change requires a version bump + full regression + human sign-off.

## 1. Machine nodes

### 1.1 Total outstanding
```html
<div id="total-outstanding" data-value="11820">11820</div>
```
- Text is the **bare integer**, no `Rs`, `₹`, commas, spaces, decimals, or abbreviation.
- Signed (net sum of customer balances). `0` on empty state.
- Human-readable formatting lives in a **sibling**, never inside this node.
- Present at first paint, before any data is loaded.

### 1.2 Customer rows
```html
<div data-customer="9000000101">
  <span>Ravi Kumar</span>
  <span>9000000101</span>
  <span data-balance="670">670</span>
  <a data-remind="9000000101" href="https://wa.me/919000000101?text=...">WhatsApp</a>
</div>
```
- Exactly **one** `[data-customer]` per customer, `data-customer` = the 10-digit phone as a string.
- Includes customers with balance `0` and customers auto-created from an unknown-phone entry.
- `[data-balance]` is a **descendant** of the row. Attribute value and text are both the bare signed integer.
- No pagination, virtualisation, filtering by balance, or duplicate rows.

### 1.3 WhatsApp reminder
- `a[data-remind="<phone>"]`, one per customer row.
- `href` exactly `https://wa.me/91<phone>?text=<encodeURIComponent(message)>`.
- `message` must contain the customer's **name** and their **balance digits** (rupees).

### 1.4 Import
- `textarea#import-box` and `button#import-go`, both visible and present at load.
- The tester pastes JSON and clicks. Parse `value` from the DOM at click time.
- Import **replaces** all customers and entries; it never merges. Recompute everything.
- Malformed JSON: show a message, keep the previous state, do not crash.

### 1.5 Payment screenshot
- `input#shot-input` of `type="file"` on the payment form, **always in the DOM** (not created on click).
- After saving a payment with an image, that entry renders `img[data-shot]` with a data URL `src`.
- Downscale before storing; a quota failure must still save the entry (without the image) and warn.

### 1.6 Date override
- `?today=YYYY-MM-DD` overrides "today" for every date-dependent feature (overdue, days since last payment, default entry date).
- Invalid/missing → local date.

### 1.7 Customer view
- `?customer=<phone>` renders that customer's page (or an equivalent in-page view) with `#cust-name`, `#cust-balance` (`[data-balance]`), entries newest first.
- Bonus: each entry may expose `[data-entry-id]` for edit/delete tests.

## 2. Always rendered

At first paint, with no data: `#total-outstanding`, `#import-box`, `#import-go`, `#shot-input`, the customers container, and the Overdue/Search/Export hooks. No modal, tab, accordion, or route may gate them.

## 3. Number rules

- State and machine nodes: **integer rupees**.
- Import coercion: strip `Rs`, `₹`, spaces, commas; parse; non-finite → `0` (log, don't crash).
- No `toFixed`, `toLocaleString`, `Intl.NumberFormat`, or percentage math in the money path.

## 4. Import semantics

- Full replace, atomic: parse → normalise → persist → re-render.
- Dedupe customers by phone (last name wins); strip `+91`, spaces, dashes.
- `type`: case-insensitive; `credit*`/`debit*`/`gave` → credit, `payment*`/`paid*`/`received` → payment.
- Entries for unknown phones → auto-create `Customer <phone>`.
- Customers with no entries → row with balance `0`.
- Sort entries by date desc, tie-break insertion order desc. ISO `YYYY-MM-DD`.

## 5. Bonus hooks (tests need these)

- `#search` — input filtering rows by name or phone substring.
- `#export-csv` — button that downloads CSV matching current state.
- A section labelled **Overdue** with each customer's days since last payment, sorted desc.
- `a[href^="upi://pay?pa="]` with `am=<balance>` and `cu=INR`.
- Language switch (EN/Hindi/Telugu) that never changes ids or machine values.
- OCR trigger on the screenshot input; detection prefills the amount and never blocks save.

## 6. Forbidden

- Formatting inside `#total-outstanding` or `[data-balance]`.
- Hiding or duplicating contract nodes; rendering them after data loads.
- Merge on import; caching totals; float money.
- Virtualised/paginated/filtered-by-default customer list.
- Service worker or stale caches.

## 7. Grader assumptions to design against (worst case)

- Reads `textContent` and applies `parseInt` or the first `\d+` match.
- Counts `[data-customer]` elements and reads each balance.
- Uses Playwright-style `fill`/`setInputFiles` on visible elements.
- Imports twice in one tab; reloads; clears storage; opens `?today=` and `?customer=`.
- Checks `scrollWidth` at 375 px and emulates dark mode.
