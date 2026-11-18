# CONTRACT — Hisaab (machine interface)

Version: 1.7
Updated: 2026-11-18
Owner: Planner
Supersedes: CONTRACT.md v1.6

Human approval note (2026-11-18): the P10 Shop terminology/workspace amendment explicitly permits the scoped visual repositioning described in §10.6 and requires full regression plus Critic re-score. This amendment does not authorize changing IDs or semantics.

This file is the score. The grader reads these exact nodes. The Coder may not rename, move, wrap, hide, or conditionally render any machine node except where a post-G0 amendment expressly permits a scoped visual move without changing its ID or semantics (P9 in §9, P10 in §10.6). Any other change requires a version bump + full regression + human sign-off (`AGENTS.md` §5–§7).

## Post-G0 P8 contract note

Human approval received 2026-11-18 for a P8 contract extension: stores are browser-local only; full management is create/switch/rename/delete; delete requires confirmation; and the last store cannot be deleted. All pre-existing nodes and selectors remain unchanged, with no existing machine node renamed, moved, formatted differently, or made conditional. P8 clarifies R8 and §4 import semantics: one-store behavior remains a full replacement of that one store's shop ledger, while in the P8 portfolio import replaces only the active store's ledger and never creates, removes, renames, merges, or changes any store in the portfolio or another store's ledger/profile. The P8 extension also adds the explicit post-G0 human-approved manager nodes and isolation/migration rules in §9.

## Post-G8 P9 contract note

Human approval received 2026-11-18 for a P9 contract extension that explicitly separates portfolio creation from active-ledger replacement and visually combines Store and Profile controls. P9 adds no renaming or conditionally rendering of P0–P8 machine nodes. `#import-go` and P7 file replacement remain active-store ledger replacement. `#import-add-store` is the only explicit JSON/CSV add-as-new-store action. JSON may add a top-level `profile`; CSV provides no profile fields. Missing/colliding names require editable confirmation or cancellation; a sole pristine bootstrap store is the only permissible population exception.
P9 profile controls are the existing `#owner-name`, `#owner-address`, `#shop-upi`, `#logo-input`, `#profile-msg`, and `#upi-msg`; P9 does not add #profile-save, #profile-brand-input, or duplicate brand controls. P9 may move those existing controls into `#store-profile-editor` within `#store-workspace`, but they retain exact IDs and input/autosave semantics; header read-only nodes and every other P0–P8 node remain in place.

P9's dedicated hidden `#import-add-file` is separate from the existing P7 `#import-file`/`#import-choose` replacement flow. Selecting a P7 file immediately replaces the active ledger as required by E2E-P7-01/02; it is never staged for a later click. The add-store button reads nonempty `#import-box` content, or opens `#import-add-file` when the box is empty; selecting a file there immediately follows the P9 add-store validation/name-confirm path.

## Post-G9 P10 contract note

The human explicitly approved this post-G9 contract amendment on 2026-11-18, including a full regression and Critic re-score. P10 standardizes the visible manager/workspace terminology as Shops/Shop and localizes the changed copy for English, Hindi, and Telugu. It permits visual repositioning of existing shop-manager controls only within the existing `#store-workspace`: selection stays at the top; the shop-name field and create/rename/delete actions are grouped at the bottom of the Shop profile workspace. All existing IDs and data semantics remain exact. The owner name/address/UPI read-only display stays at the top-left and updates for the active shop as before. Manual shop creation continues to activate an empty ledger with blank profile fields; existing profile inputs continue to autosave to the active shop. P10 does not alter import flows, calculations, storage, or any other P0–P9 behavior.

## 0. Notation

- Angle-bracket metavariables such as `<phone>`, `<balance>`, `<message>`, `<n>`, `<amount>`, `<name>`, `<shop>` are **intentional type placeholders**, not unfinished text. Each stands for the runtime value described beside it.
- HTML snippets are **illustrative shapes**; the normative rules are the bullet lists under each snippet. HTML example tags such as `<div>`, `<span>`, `<section>`, `<ul>` are notation too.
- "Machine node" means an element whose text or attribute is read by a script. "Human element" means any sibling or wrapper that a script never reads.
- Money examples use the sample shop. The sample has only whole rupees, so `sample-expected.json` stays authoritative and unchanged.

## 0.1 Checks quoted verbatim from `PROJECT.md` "How we check"

| Check | Requirement |
|---|---|
| Total outstanding | `#total-outstanding`, the text contains the number, e.g. `11820` or `Rs 11,820` |
| One row per customer | `[data-customer="<phone>"]`, with the balance inside `[data-balance]` |
| WhatsApp reminder link | `a[data-remind="<phone>"]`, the link is `https://wa.me/91<phone>?text=<message>` |
| Import | a text area `#import-box` and a button `#import-go`. The tester pastes the JSON and presses the button |
| Payment screenshot | a file input `#shot-input` on the payment form. After saving, the entry shows `img[data-shot]` |
| Today's date | if you add anything that depends on the date, honour `?today=2026-11-15` in the URL |

Hisaab renders **stricter** values than the first row tolerates: bare numbers only, never `Rs 11,820` inside a machine node.

## 1. Machine nodes

### 1.1 Total outstanding

```html
<header>
  <div class="label">Total outstanding (Rs)</div>
  <div id="total-outstanding" data-value="11820">11820</div>
  <span class="human">Rs 11,820</span>
</header>
```

- `#total-outstanding` exists at first paint, before any data, and is never hidden.
- Text = **bare signed number** produced by the render rule in §3.3. No `Rs`, `₹`, commas, spaces, `+`, `.00`, or abbreviations.
- `data-value` attribute, when present, carries the **same string** as the text.
- Value = signed net sum of all customer balances (§3.1). Negative allowed (for example `-250.25`). Empty shop → text `0`.
- Human formatting (`Rs 11,820`) lives in a **sibling** element, never inside `#total-outstanding`.

### 1.2 Customer rows

```html
<div id="customers">
  <div data-customer="9000000101">
    <span class="name">Ravi Kumar</span>
    <span class="phone">9000000101</span>
    <span data-balance="670">670</span>
    <a data-remind="9000000101" href="https://wa.me/919000000101?text=...">WhatsApp reminder</a>
    <a href="?customer=9000000101">Open</a>
  </div>
</div>
```

- Exactly **one** `[data-customer="<phone>"]` per customer row, keyed by the normalised phone string (D9).
- Rows exist for every customer in state: **including balance `0`, customers with no entries, and customers auto-created from an unknown-phone entry**.
- `[data-balance]` is a descendant of the row. Its **attribute value and its text are both** the bare signed number from §3.3 (identical strings). Negative allowed.
- No pagination, virtualisation, default filtering, balance-based hiding, or duplicate rows.
- Each row contains a link `a[href="?customer=<phone>"]` to the customer view.
- `#search` may hide rows **only** while it holds a non-empty string (§5.1). At load its value is empty and every row is present.

### 1.3 WhatsApp reminder

```html
<a data-remind="9000000101" href="https://wa.me/919000000101?text=Namaste%20Ravi%20Kumar%2C%20your%20balance%20is%20Rs%20670.">WhatsApp reminder</a>
```

- Exactly one `a[data-remind="<phone>"]` per customer row.
- `href` is exactly `https://wa.me/91<phone>?text=<encodeURIComponent(message)>`: literal `https://wa.me/91`, then the normalised phone, then `?text=`, then the URL-encoded message. No other query parameters, no trailing characters.
- `message` contains the customer's **full name** and their balance **rendered by §3.3 inside `Rs <rendered>`**; it must contain the rendered digits verbatim (a script may decode the text and match them).
- Works for zero and negative balances, and for names containing `&`, spaces, or non-ASCII characters (encoding is mandatory).

### 1.4 Import

```html
<textarea id="import-box" placeholder="Paste shop JSON"></textarea>
<button id="import-go" type="button">Import</button>
<span id="import-msg" role="status"></span>
```

- `#import-box`, `#import-go`, `#import-msg` are visible and in the DOM at load; never inside a modal, tab, accordion, or `<details>`.
- The tester may set `.value` directly and then click `#import-go`. **Read the value from the DOM at click time**, never from cached state.
- Import replaces the ledger (customers and entries). In one-store mode it replaces the whole shop ledger. In P8 mode it replaces only `stores[active].ledger`; it never changes the portfolio or another store. It never merges, appends, or unions. A second import in the same tab leaves only the second import's ledger numbers in the applicable shop (see §4 and §9).
- `#import-msg` is a visible text line, empty when there is no message. Success text contains the imported shop name (when present), the customer count, and the rendered total. Error text contains `Could not import`. Duplicate-phone warnings are appended here and contain the word `duplicate`.
- Malformed JSON or a JSON value that is not an object: no state change, previous rows and totals stay intact, readable message, no page crash.

### 1.5 Payment screenshot

```html
<form id="entry-form">
  ...
  <input id="shot-input" type="file" accept="image/*">
  <button id="entry-save" type="submit">Save</button>
</form>
```

- `#shot-input` is a real `input` of `type="file"` on the payment form, **present at load**, not created on click, not removed when the entry type is `credit`.
- After saving a payment that carried an image, that entry renders `img[data-shot]` **inside the same `[data-entry-id]`** with a `data:` URL in `src`.
- The image is downscaled before storage (TECH-STACK S8). If storage refuses the image (quota), the entry is still saved without the image, `img[data-shot]` is absent for it, and a readable warning is shown. The save must never be aborted because of the image.
- `img[data-shot]` never appears on entries that were saved without an image.

### 1.6 Date override

- `?today=YYYY-MM-DD` replaces "today" for **every** date-dependent feature: overdue membership and day counts, "days since last payment", and the default date of a new entry.
- Missing or invalid value → local calendar date.
- The override only affects today's date; it never rewrites stored entry dates.

### 1.7 Customer view

- `?customer=<phone>` renders the customer view for that normalised phone, in the same page. It may be scrolled to, but it is not behind a modal, tab, or `<details>`.
- The view contains `#cust-name` (full name, text) and `#cust-balance` (the balance, machine text and `data-balance` attribute per §3.3).
- The view contains `#entries`, a list of that customer's entries **newest first** (§1.8).
- Navigating to a customer view must not remove `#total-outstanding`, `#import-box`, `#import-go`, `#shot-input`, or the `[data-customer="<phone>"]` rows from the DOM.
- Unknown phone: `#cust-name` text is `Customer not found`, `#cust-balance` is `0`, `#entries` is empty. No crash, no redirect.

### 1.8 Entries

```html
<ul id="entries">
  <li data-entry-id="e7" data-type="payment" data-date="2026-10-25">
    <span class="amount" data-amount="1500">1500</span>
    <span class="note">paid on UPI</span>
    <img data-shot src="data:image/jpeg;base64,..." alt="Payment screenshot">
    <button data-edit-entry type="button">Edit</button>
    <button data-delete-entry type="button">Delete</button>
  </li>
</ul>
```

- `#entries` contains one `li[data-entry-id]` per entry of the selected customer.
- Order: **date descending**; equal dates break by insertion order, **newest insertion first**.
- `[data-entry-id]` carries `data-type` (`credit` or `payment`) and `data-date` (ISO `YYYY-MM-DD` when valid).
- `[data-amount]` carries the bare rendered amount (unsigned magnitude, §3.3). Text and attribute are identical strings.
- `note` renders as text or blank; never the strings `undefined`, `null`, or `NaN`.
- `button[data-edit-entry]` and `button[data-delete-entry]` exist inside every entry row; editing or deleting recomputes the row balance, `#cust-balance`, and `#total-outstanding`, and persists.
- An entry's `data-entry-id` is stable across edits.

### 1.9 Forms (extensions, see §8)

```html
<form id="new-customer">
  <input id="new-name">
  <input id="new-phone" inputmode="numeric">
  <button id="add-customer" type="button">Add customer</button>
</form>
<form id="entry-form">
  <select id="entry-type"><option value="credit">Credit</option><option value="payment">Payment</option></select>
  <input id="entry-amount" inputmode="decimal">
  <input id="entry-date" type="date">
  <input id="entry-note">
  <input id="shot-input" type="file" accept="image/*">
  <button id="entry-save" type="submit">Save</button>
</form>
```

- `#new-name` + `#new-phone` + `#add-customer` create a customer. A phone that is not exactly 10 digits is rejected with a visible message and no row. A phone that already exists is rejected with a visible message and no second row.
- `#entry-form` saves one entry for the currently selected customer. `#entry-type` values are exactly `credit` and `payment`. `#entry-amount` accepts digits and one decimal point. `#entry-date` is a native date input defaulting to today (`?today` when present).
- `#entry-save` is enabled whenever a customer is selected; it is never disabled by OCR or image processing (§5.6).
- These ids are fixed so automated UI tests do not depend on visible labels.

## 2. Always rendered

At first paint, with empty storage, **all** of the following resolve and are visible or contain visible content: `#total-outstanding` (text `0`), `#new-name`, `#new-phone`, `#add-customer`, `#entry-form`, `#entry-type`, `#entry-amount`, `#entry-date`, `#entry-note`, `#entry-save`, `#shot-input`, `#import-box`, `#import-go`, `#import-msg`, `#search`, `#export-csv`, `#lang-switch`, `#overdue`, `#customers`, and the empty-state message.

No modal, tab, accordion, route, login, banner, animation, or data load may gate them. They may be visually below the fold; they may not be absent from the DOM.

## 3. Number and money rules (D4)

### 3.1 Representation

- Every stored or derived money value is an **integer number of paise** (1 rupee = 100 paise). No binary floating-point value is stored, summed, or compared in the money path.
- Balance(customer) = (Σ credit paise) − (Σ payment paise). Signed.
- Total outstanding = Σ Balance over **all** customers, signed (D2). It equals the literal "all credit minus all payments" of the shop.
- Integer paise sums are order-independent and exact. Recompute from state on every render; never cache a total.
- Sample invariant: every sample amount is a whole rupee, so the sample renders `#total-outstanding` = `11820` and the eight `[data-balance]` values exactly as `sample-expected.json`.

### 3.2 Parse (import and manual entry)

Input may be a JSON number or a string.

1. String: trim; remove every occurrence of `Rs`, `₹`, `INR`, spaces (including non-breaking space), and commas; allow one leading `+` or `-`.
2. Accepted shape after cleaning: `^-?[0-9]+(\.[0-9]+)?$`. Anything else (empty, `NaN`, `Infinity`, words, stray punctuation) → `0`, log a warning, never throw.
3. Integer part and first two fractional digits become paise using **exact integer arithmetic** (no `parseFloat` accumulation).
4. More than two fractional digits: keep two, and if the third digit is `5` or greater add one paise (round half away from zero). Log the rounding. Never round to the rupee.
5. A `number` input is converted with its shortest decimal string first, then parsed by rules 1–4, so `12.3` and `"12.3"` behave identically.
6. Magnitudes above `9000000000000000` paise are clamped to that bound and logged, to stay inside exact-integer range.
7. `abs()` is applied to the parsed magnitude; direction comes from `type` (§4).

### 3.3 Render (machine nodes only)

For an integer paise value `p`:

- `sign` = `-` when `p < 0`, else empty.
- `rupees = floor(abs(p) / 100)`, `paise = abs(p) % 100`.
- `paise == 0` → `sign` + decimal digits of `rupees`.
- `paise != 0` → `sign` + `rupees` + `.` + two digits of `paise` (zero-padded to 2).
- Normative shape for every machine text and machine attribute: `^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$`.
- Never: `-0`, `.00`, leading zeros, `+`, grouping separators, currency symbols, spaces, exponent notation, or abbreviations.
- Examples: `0` → `0`; `1182000` → `11820`; `67050` → `670.50`; `-25025` → `-250.25`; `5` → `0.05`; `67000` → `670`.

### 3.4 Human display

- The sibling of `#total-outstanding` renders `Rs ` + the absolute value with thousands grouping and two decimals only when fractional (e.g. `Rs 1,500.50`, `Rs 11,820`).
- A negative total's sibling reads `Advance Rs <absolute>`; the machine node still reads the signed bare number.
- Human formatting never enters a machine node, an attribute read by a test, a CSV numeric column, or the reminder message beyond the literal `Rs <rendered>` prefix.

### 3.5 Forbidden in the money path

`toFixed`, `toLocaleString`, `Intl.NumberFormat`, percentage math, division of money, `Math.round` on rupees, string building from floats, and any render that passes through a float. Money arithmetic is integer addition and subtraction only.

## 4. Import semantics (D8, D9)

- Atomic ledger replace: parse → normalise → validate → write the applicable state atomically → re-render everything. In one-store mode the applicable state is the whole shop ledger; in P8 mode it is only the active store's ledger. No derived value survives an import, and the portfolio/other stores are never changed.
- Top-level shape: an object with `shop` (string, optional), `customers` (array, optional), `entries` (array, optional), and an optional P9 `profile` object. P9 JSON profile keys are `ownerName`, `address`, `upi`, `logo`, and `brand`; in the add-as-new-store path, omitted or invalid `ownerName/address/upi/logo` subfields become `""`, while `brand` becomes `null` unless it is valid RGB/null. Old JSON without `profile` remains compatible. A missing or non-array `customers`/`entries` is treated as an empty list and the import succeeds with a warning in `#import-msg`. Unknown top-level fields are ignored.
- Phone normalisation: cast to string, trim, remove every character that is not a digit after dropping a leading `+`; if the result has 12 digits and starts with `91`, drop that `91`. Keep the remaining digit string as the row key even when it is not 10 digits (never drop a money row for a short or long phone).
- Name normalisation for comparison only: Unicode NFC, trim, collapse internal whitespace to one space, compare case-insensitively. The **displayed** name keeps the record's original letter case, trimmed and whitespace-collapsed and NFC-normalised; it is never lowercased.
- Customer dedupe (exact):
  - Same normalised full name **and** same phone → collapse to one row (exact duplicate), keep one name, no warning.
  - Same phone, different full name → **one row per phone**; keep the **last** record's full name; append an import warning naming the phone. Entries are phone-keyed, so two rows would double-count.
  - Same full name, different phone → **two distinct customers**, two rows.
- Entries are keyed by phone. An entry whose phone is not among the imported customers auto-creates one customer named `Customer <phone>` (D10); that row renders like any other, with balance from its entries.
- Customer with no entries → row with `[data-balance]` `0`.
- `type` mapping (case-insensitive, trimmed): `credit*`, `debit*`, `gave`, `udhaar` → `credit`; `payment*`, `paid*`, `received` → `payment`. Any other value → `credit` and a warning. Missing/empty `type` → `credit` and a warning.
- `amount`: parsed by §3.2; magnitude used, sign from `type`.
- `date`: kept when it matches `YYYY-MM-DD`; blank/missing → today (`?today` when present); unparseable → kept as the given string, logged, and treated as oldest for sorting.
- `note`: missing/blank → empty text.
- Entry with no usable phone (missing, empty, or non-numeric after normalisation) cannot be attributed: skip it and append a warning; do not crash and do not invent a row.
- Sorting: entry date descending, then insertion index descending. String date comparison is valid only for ISO dates; non-ISO dates sort after all ISO dates.
- Import never leaves a partially applied state. If any step throws, the previous state is restored and `#import-msg` explains it in plain language.

## 5. Bonus hooks (tests need these)

Each hook is present at load and not hidden behind a modal, tab, or `<details>`.

### 5.1 `#search`
- An `input` with id `#search`, empty at load.
- Typing filters the visible `[data-customer="<phone>"]` rows to those whose full name **or** phone contains the query, case-insensitive, substring.
- Filtering mutates no state, never changes `#total-outstanding`, never removes the import section, and clearing the query restores every row.
- No rows are removed from state; a reload restores all rows.

### 5.2 `#overdue`
- A section with id `#overdue` whose visible heading text contains `Overdue` and `30+ days` (D1).
- Rows are `li[data-overdue="<phone>"]`, one per customer that has **balance greater than 0** and a **last payment at least 30 days before today** (today = `?today` when present). A customer with no payment at all is never listed.
- Days = whole calendar days between today and that customer's latest **payment** date, floored at 0 for future dates.
- `[data-days]` inside each row carries the bare integer day count as text and in the attribute, identical strings.
- Order: days descending. Ties break by full name ascending.
- The section renders at first paint with its heading and, when empty, a visible empty-state line.
- Nothing inside `#overdue` may carry a `data-customer` attribute: row counting must stay exact.

### 5.3 `#export-csv`
- A `button` with id `#export-csv` that downloads two files built from **current state**, never from the sample.
- `customers.csv` header exactly `phone,name,credit,payment,balance`; one row per customer row; `credit` and `payment` are that customer's total credit and total payment in paise rendered by §3.3, and `balance` is the signed balance; name is the displayed name.
- `entries.csv` header exactly `phone,type,amount,date,note`; one row per entry, newest-first order; `amount` is the §3.3 magnitude.
- Fields containing a comma, quote, or newline are double-quoted with embedded quotes doubled. No currency symbols or grouping separators in numeric fields.

### 5.4 UPI pay link
- Inside each `[data-customer]` row exactly one link matching `a[href^="upi://pay?pa="]`, so a list-page scan finds every customer's pay link.
- `href` = `upi://pay?pa=<payee>&am=<amount>&cu=INR&tn=<encodeURIComponent(name)>`.
- `<amount>` = §3.3 rendering of `max(balance, 0)` (a UPI request cannot be negative); `0` when the balance is zero or negative.
- `<payee>` = the shop UPI VPA; when the imported shop supplies no VPA, the documented default `hisaab@upi` is used (D12). `cu=INR` is literal and present exactly once.

### 5.5 `#lang-switch`
- A `select` with id `#lang-switch`, option values exactly `en`, `hi`, `te`, default `en` on every load (D6).
- Changing it translates visible UI labels only. In every language: element ids, attributes, `data-*` values, phone numbers, names, dates, money text, `href` values, `#import-box` content, and all machine nodes are byte-identical to English.
- Reload may reset the switch to `en`; no persistence requirement.

### 5.6 OCR on `#shot-input`
- OCR is triggered by selecting a file on `#shot-input`. It may run asynchronously and may prefill `#entry-amount`.
- Prefill happens only when `#entry-amount` is empty at the moment OCR resolves; it never overwrites typed input.
- Save never waits for OCR. If OCR is unavailable, slow, or returns nothing, manual amount entry works and `#entry-save` stays usable.
- No OCR failure may produce a console error, block the form, or clear the selected file silently.

## 6. Forbidden

- Formatting, currency symbols, grouping separators, or `.00` inside `#total-outstanding`, `[data-balance]`, `#cust-balance`, or `[data-amount]`.
- Hiding, duplicating, or conditionally rendering any node in §1–§2; rendering machine nodes only after data loads.
- Merging on import; caching totals; float money; rounding money to the rupee.
- Virtualised, paginated, or balance-filtered customer list.
- `data-customer` attributes inside `#overdue`.
- Service worker, auth, cookies, paywall, consent banner, or analytics that block first paint.
- Network requests on the critical path of R1–R9, B1–B6.

## 7. Grader assumptions to design against (worst case)

- Reads `textContent` and applies `parseInt`, `Number`, or a first-match integer or signed-decimal pattern.
- Queries rows with `[data-customer]`, balances with `[data-balance]`, reminders with `a[data-remind]`, entries with `[data-entry-id]`; counts `[data-customer]` elements and compares to the customer count, and reads each `[data-balance]` text and attribute.
- Uses Playwright-style `fill`, `selectOption`, `setInputFiles`, `click`, and `evaluate` on visible elements.
- Imports twice in one tab; reloads; clears storage; opens `?today=` and `?customer=`; may append `?today=` to the customer view.
- Checks `document.documentElement.scrollWidth` at 375 px and emulates dark mode.
- May paste JSON and press the button without firing `input`/`change` events on `#import-box`.
- May upload a multi-megabyte image to `#shot-input`.

## 8. Extensions register

The brief fixes the selectors in §0.1 and §1.1–§1.6. The following are Hisaab extensions to make the contract testable; they are required by this contract and are additions, not substitutes:

| Selector | Purpose | Requirement |
|---|---|---|
| `#cust-name`, `#cust-balance`, `#entries`, `[data-entry-id]`, `[data-amount]` | Customer view and entry rows | R4, B2 |
| `a[href="?customer=<phone>"]` | Deterministic navigation to the customer view | R4 (D3) |
| `#overdue`, `[data-overdue="<phone>"]`, `[data-days]` | Overdue list hook | B1 |
| `#search` | Search hook | B4 |
| `#export-csv` | CSV export hook | B3 |
| `a[href^="upi://pay?pa="]` | UPI pay hook | B5 |
| `#lang-switch` | Language switch | B6 |
| `#import-msg` | Readable import status and warnings | R8 |
| `#new-name`, `#new-phone`, `#add-customer` | Add-customer form | R1 |
| `#entry-form`, `#entry-type`, `#entry-amount`, `#entry-date`, `#entry-note`, `#entry-save` | Add-entry form | R2 |
| `button[data-edit-entry]`, `button[data-delete-entry]` | Edit/delete controls | B2 |
| `#store-workspace`, `#store-profile-editor`, `#owner-name`, `#owner-address`, `#shop-upi`, `#logo-input`, `#profile-msg`, `#upi-msg` | Unified active-store workspace with existing autosaving profile controls | R12 |
| `#import-add-store`, `#import-add-file`, `#import-store-name`, `#import-store-confirm`, `#import-store-cancel`, `#import-store-msg` | Explicit safe add-store import flow | R12 |

## 9. P8 multiple local stores

### 9.1 Always-visible store manager

- `#store-manager` is a visible section at first paint on `/` and on `?customer=`, outside a modal, tab, `<details>`, hidden attribute, or `display:none` ancestor.
- The following exact controls are always in the DOM and visible: `#store-select` (a native `<select>`), `#store-name` (a text input), `#store-create`, `#store-rename`, `#store-delete`, and `#store-msg`.
- `#active-store-name` is visible text containing the active store's exact trimmed display name.
- `#store-confirm-delete` and `#store-cancel-delete` are exact inline controls that appear when `#store-delete` is pressed. `#store-cancel-delete` leaves the portfolio unchanged; deletion is impossible until `#store-confirm-delete` is pressed.
- The manager never hides or duplicates `#total-outstanding`, `#import-box`, `#import-go`, `#shop-upi`, `#shop-logo`, `#customers`, `[data-customer]`, `[data-balance]`, or `#shot-input`.

### 9.2 Store names and selection

- `#store-name` is the create/rename name input. Its effective value is NFC-normalised, trim, and internal whitespace collapsed.
- A valid name is 1–60 characters after normalization. Blank, whitespace-only, over-60-character, or case-insensitively duplicate names are rejected with no state change. `#store-msg` contains `Could not create`, `Could not rename`, `blank`, `60`, or `duplicate` as appropriate.
- `#store-select` has one option per store. Option values are opaque stable store ids and option text is the exact store name. The selected option equals the persisted active store id.
- `#store-create` creates an empty ledger and empty profile/logo/UPI/brand state, makes the new store active, and rerenders all existing machine nodes. `#store-rename` changes only the named active store.
- Active-store selection survives reload under `hisaab.activeStore.v1`; switching stores never changes the portfolio of another store.

### 9.3 Deletion and last-store protection

- `#store-delete` does not delete immediately.
- Pressing `#store-delete` exposes the exact inline confirmation row containing `#store-confirm-delete` and `#store-cancel-delete` and identifies the active store name in text.
- `#store-confirm-delete` deletes only the confirmed active store and only after a confirmation action.
- If one store remains, delete is refused regardless of confirmation, no store is removed, and `#store-msg` contains `last store`.
- After deleting a non-last active store, select the next deterministic store in portfolio order, remove `?customer=` if present, and rerender it. Reload shows the remaining portfolio and active selection.

### 9.4 Per-store isolation

- State is partitioned by store id. A store owns exactly one ledger (`shop`, `customers`, `entries`), exactly one profile (`ownerName`, `address`, `upi`, `logo`, `brand`), and exactly one active UPI/pay-link setting.
- Switching stores changes `#total-outstanding`, every `[data-customer]`/`[data-balance]`, `#cust-name`, `#cust-balance`, `#entries`, `#shop-upi`, `#shop-logo`, `#owner-display-name`, `#owner-display-address`, `#owner-display-upi`, and `#brand-theme` without mutating another store.
- Two stores may contain the same phone: `[data-customer="<phone>"]` means one row per customer within the active store only. There is no cross-store row union.
- Profile, logo, brand colour, and UPI are not shared across stores. The demo `hisaab@upi` fallback applies per store only when that store has no UPI configured.

### 9.5 Import isolation

- `#import-box`/`#import-go` import into the currently active store only.
- A successful or warned replacement updates only `stores[active].ledger`; it does not create, remove, rename, merge, or reorder store portfolio entries and does not change the active id.
- D4/D8/D9/D10/D11/D13 remain unchanged within the active store. The imported `shop` string may be the active ledger's shop display value but never silently renames the store in `#store-select`/`#active-store-name`.
- If the import fails, the active store's previous ledger and every other store remain unchanged.

### 9.6 Legacy migration

- On the first P8 load when no P8 portfolio exists, legacy `hisaab.v1`, `hisaab.profile.v1`, and `hisaab.upi.v1` are migrated into exactly one store.
- The legacy store name is the legacy `shop` string when non-empty; otherwise it is `My Store`. The legacy ledger and profile/logo/brand populate that one store; `hisaab.upi.v1` supplies UPI only when the legacy profile UPI is empty.
- Migration creates the active id, survives reload, and is idempotent. Re-loading after migration must not create a second store or a duplicate ledger.

### 9.7 Customer view and switching

- Switching stores removes `?customer=` from the URL and renders the active store home view. `?today=` is preserved.
- A direct `?customer=<phone>` load resolves that phone in the restored active store; if absent, `#cust-name` is `Customer not found`, `#cust-balance` text/attribute are `0`, and `#entries` is empty.
- Switching never retains the previous store's customer name, balance, entries, profile, logo, UPI, or machine rows.

### 9.8 P8 storage failure
- If portfolio or active-id storage throws or is unavailable, store management continues in memory for the current tab and `#store-msg` is visible and non-empty.
- Reload after a storage failure is not required to retain unsaved store state, but no save, switch, rename, create, or delete may crash or blank the page.

## 10. P9 store workspace and add-as-new-store import

### 10.1 Unified active-store workspace
- `#store-workspace` is a visible section combining the P8 `#store-manager` controls and the P9 shop-profile wrapper. It remains outside a modal, tab, accordion, or `<details>`.
- `#store-profile-editor` is visible inside `#store-workspace` and wraps only the existing editable controls `#owner-name`, `#owner-address`, `#shop-upi`, `#logo-input`, `#profile-msg`, and `#upi-msg`. These exact IDs, their input types, visibility, and autosave-on-input behavior are preserved.
- P9 is an explicitly approved exception only for placement of those existing editable fields: they may move inside `#store-workspace`, but the header read-only nodes `#owner-display-name`, `#owner-display-address`, `#owner-display-upi`, `#shop-logo`, and `#brand-theme` and all other P0–P8 nodes remain in place and are not hidden or replaced.
- No #profile-save, #profile-brand-input, or duplicate brand editor is required or added. Editing `#owner-name`, `#owner-address`, `#shop-upi`, or `#logo-input` autosaves the active store profile on input. No separate save click is part of the contract.
- Saving profile fields changes only the active store's `profile` and the existing display nodes `#owner-display-name`, `#owner-display-address`, `#owner-display-upi`, `#shop-logo`, `#brand-theme`, and `#shop-upi`; no ledger, customer, entry, balance, or other store is changed.
- The profile blank default is `{ownerName:"", address:"", upi:"", logo:"", brand:null}` for a new manual store and for omitted JSON/CSV profile fields.

### 10.1.1 P9 profile subfield validation
- `profile.brand` is valid only as `null` or an array of exactly three integers, each in the inclusive range `0..255`; floating-point channels, strings, extra/fewer channels, and any other value are invalid. `normalizeBrand`/equivalent validation converts invalid brand to `null`.
- `profile.logo` is valid only if it is a `data:image/...` string and its string length is at or below `LOGO_STORE_MAX_CHARS`; external `http://`, `https://`, relative, blob, or other URLs, plus over-limit data strings, are invalid. Invalid/missing logo becomes `""`; no image/network request is made for invalid or external logo text.
- Invalid profile subfields in add-import JSON are blanked independently to the defaults, and `#import-store-msg` or `#import-msg` visibly warns; valid subfields in the same import remain. Replacement import through `#import-go`/file replacement never applies profile subfields.

### 10.2 Explicit add-as-new-store action
- `#import-add-store` is a visible button distinct from `#import-go`. It is never substituted for or automatically triggered by `#import-go`, `#import-file`, or `#import-choose`.
- `#import-add-file` is a dedicated hidden file input for the P9 add-store path; it is distinct from the existing P7 `#import-file`.
- If `#import-box` contains pasted content, pressing `#import-add-store` reads that value from the DOM and prepares a new portfolio store from the ledger plus optional top-level `profile`.
- If `#import-box` is empty, pressing `#import-add-store` opens `#import-add-file`. Selecting JSON or CSV immediately parses that selected file using the P7 RFC-4180/D4/D9/D10/D11 rules and enters the P9 add-store validation/name-confirm flow; no second add-store click is required. JSON `shop` and CSV `shop` supply the proposed store name.
- The existing P7 `#import-file`/`#import-choose` flow remains immediate active-store ledger replacement on file selection, including when `#import-go` with an empty box opens that picker (E2E-P7-01/02). It is never staged for a later click. Nonempty `#import-box` content submitted through `#import-go` also replaces only the active ledger.
- `#import-go` and P7 file replacement never create a store, rename `#store-select`/`#active-store-name`, merge ledgers, or apply an imported profile.
- CSV import claims no profile field: owner name, address, UPI, logo, and brand are blank on a CSV-created store.

### 10.3 Safe name resolution
- `#import-store-name` is the editable proposed-name input. `#import-store-msg` reports missing/collision/cancel/failed-import status. `#import-store-confirm` and `#import-store-cancel` are exact controls for resolution.
- Before mutation, the proposed name is NFC-normalised, trim-applied, and internal whitespace collapsed. Valid names are 1–60 characters and unique case-insensitively among portfolio stores.
- Missing `shop` or a normalized collision opens the resolution controls and makes no ledger/profile/portfolio mutation. No automatic suffix, overwrite, merge, or silent rename is allowed.
- `#import-store-confirm` performs mutation only after a valid name is present. `#import-store-cancel` cancels the pending add and leaves every store and URL state unchanged.

### 10.4 First-import bootstrap and isolation
- First import may populate the sole existing store only if all of the following are true: portfolio size is exactly one, ledger has zero customers and zero entries, and the store profile equals the P9 blank profile.
- When those tests pass, successful add may replace that sole store's placeholder ledger/profile/name with the imported store data; it must leave no empty placeholder store.
- If the sole store has any ledger or profile user data, first add creates a separate store. Manual `#store-create` always creates an empty ledger and blank profile.
- Successful add or bootstrap population activates the result, removes `?customer=` while preserving `?today=` exactly, persists the active id, and never changes another store.

### 10.5 P9 storage failure
- If P9 portfolio/profile/import writes fail, existing state is retained as possible and the operation continues in memory for the current tab with `#import-store-msg` or `#store-msg` visibly non-empty.
- Storage failure must not create a blank page, silent data loss, cross-store merge, or false successful activation.

### 10.6 P10 Shop terminology, localization, and placement

- The existing manager remains `#store-manager` within `#store-workspace`; all existing IDs, attributes, control types, visibility rules, and state semantics in §§9–10 are preserved. P10 does not add, remove, rename, or duplicate an ID.
- With `#lang-switch` set to `en`, visible copy is exactly: heading `Shop Manager`; active label `Active shop`; the label for `#store-select` `Select Shop`; the label for `#store-name` `Shop name`; action labels `Create Shop`, `Rename Shop`, `Delete Shop`; confirmation prompt `Delete this shop?`; confirmation/cancel actions `Confirm delete` and `Cancel`.
- The existing manager heading, active label, selector/name labels, action labels, confirmation prompt/actions, and manager success, validation, delete-protection, and storage-status messages are fully localized for `hi` and `te` when selected. The approved translations for the common strings are:

| English (`en`) | Hindi (`hi`) | Telugu (`te`) |
|---|---|---|
| Shop Manager | दुकान प्रबंधन | దుకాణం నిర్వహణ |
| Active shop | सक्रिय दुकान | ప్రస్తుత దుకాణం |
| Select Shop | दुकान चुनें | దుకాణాన్ని ఎంచుకోండి |
| Shop name | दुकान का नाम | దుకాణం పేరు |
| Create Shop | दुकान बनाएँ | దుకాణాన్ని సృష్టించండి |
| Rename Shop | दुकान का नाम बदलें | దుకాణం పేరు మార్చండి |
| Delete Shop | दुकान हटाएँ | దుకాణాన్ని తొలగించండి |
| Delete this shop? | क्या इस दुकान को हटाएँ? | ఈ దుకాణాన్ని తొలగించాలా? |
| Confirm delete | हटाने की पुष्टि करें | తొలగింపును నిర్ధారించండి |
| Cancel | रद्द करें | రద్దు చేయండి |
| Shop created. | दुकान बनाई गई। | దుకాణం సృష్టించబడింది. |
| Shop renamed. | दुकान का नाम बदला गया। | దుకాణం పేరు మార్చబడింది. |
| Shop deleted. | दुकान हटाई गई। | దుకాణం తొలగించబడింది. |
| Enter a shop name. | दुकान का नाम दर्ज करें। | దుకాణం పేరు నమోదు చేయండి. |
| Shop name must be 60 characters or fewer. | दुकान का नाम 60 अक्षरों से अधिक नहीं होना चाहिए। | దుకాణం పేరు 60 అక్షరాలకు మించకూడదు. |
| A shop with this name already exists. | इस नाम की दुकान पहले से मौजूद है। | ఈ పేరుతో దుకాణం ఇప్పటికే ఉంది. |
| The last shop cannot be deleted. | आख़िरी दुकान नहीं हटाई जा सकती। | చివరి దుకాణాన్ని తొలగించలేరు. |
| Could not save shop changes. | दुकान के बदलाव सहेजे नहीं जा सके। | దుకాణం మార్పులను సేవ్ చేయలేకపోయాము. |

- For the visible message wording in §§9.2–9.3, this P10 copy rule supersedes the English substring examples `Could not create`, `Could not rename`, `blank`, `duplicate`, and `last store`. The same validation reason, refusal, delete protection, and success/failure states remain observable in `#store-msg`; only their localized text changes.
- No P10-authored visible manager/workspace label or message uses the obsolete user-facing term `Store`; IDs such as `#store-manager` are unchanged machine selectors and are not user-facing copy. User-entered shop names are data and are displayed unchanged. Other P0–P9 translations and their byte-identical machine values remain unchanged.
- In the workspace layout, the shop selector and its label stay at the top. The existing `#store-name` field and `#store-create`, `#store-rename`, `#store-delete` actions form the bottom action group in the Shop profile workspace. No other node may be moved or hidden to achieve this layout.
- The read-only owner name, address, and UPI display and related shop identity remain at the top-left; they continue to update from the active shop only. `#active-store-name` text remains exactly the active shop name, without a translated prefix.
- Manual `#store-create` still creates and activates an empty ledger and `{ownerName:"", address:"", upi:"", logo:"", brand:null}` profile. Editing the existing profile inputs after creation continues to autosave to that active shop, with no change to other shops. Import replacement/add-shop flows, ledger calculations, scoring, storage keys/schema, and profile defaults are unchanged.
