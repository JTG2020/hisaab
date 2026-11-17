# Hisaab — Win Plan

Companion to [`WIN-ANALYSIS.md`](WIN-ANALYSIS.md). Deadline **Sun 22 Nov 2026, 10:00 am IST**.

This is a **spec-compliance exercise**. Design is not scored ("not taste"). Every mark lives in the table below.

---

## 1. Score map — exactly what the tester does

| Marks | Check | What the script most likely does | Our obligation |
|---|---|---|---|
| 60 | Hidden-data test | Imports a different shop JSON via the UI, then reads `#total-outstanding` and each `[data-customer]`/`[data-balance]` and compares numbers | Correct math on arbitrary valid data, contract always present |
| 5 × 6 (30) | Bonus menu | Script/screenshot heuristics per item | All 7 items built, obviously labelled |
| 5 | 375 px | Viewport 375 wide, check `document.scrollWidth <= 375` (or horizontal scroll attempt) | True responsive, no fixed widths |
| 5 | Light + dark | Emulate `prefers-color-scheme: dark` (or toggle) and check readability | `@media (prefers-color-scheme: dark)` with real contrast |

**Order of work is dictated by this table:** contract → math → bonuses → viewport/theme. Never the reverse.

---

## 2. The contract skeleton (build this first, verbatim)

Critical rules: **present at first paint, static ids, bare digits inside machine nodes, one row per customer, nothing conditionally rendered, nothing hidden inside a modal.**

```html
<!-- Shop header -->
<header>
  <div class="label">Total outstanding (Rs)</div>
  <div id="total-outstanding" data-value="11820">11820</div>
  <!-- optional human nicety, OUTSIDE the machine node -->
  <span class="human">Rs 11,820</span>
</header>

<!-- Import (always in the DOM, never a modal) -->
<textarea id="import-box" placeholder="Paste shop JSON"></textarea>
<button id="import-go" type="button">Import</button>
<span id="import-msg" role="status"></span>

<!-- Customer list: exactly one row per customer, keyed by phone -->
<div id="customers">
  <div class="row" data-customer="9000000101">
    <span class="name">Ravi Kumar</span>
    <span class="phone">9000000101</span>
    <span data-balance="670">670</span>
    <a data-remind="9000000101"
       href="https://wa.me/919000000101?text=Namaste%20Ravi%20Kumar%2C%20your%20balance%20is%20Rs%20670.">
      WhatsApp reminder
    </a>
    <a href="./c/9000000101">Open</a>
  </div>
</div>

<!-- Customer page -->
<section id="customer-page">
  <h2 id="cust-name">Ravi Kumar</h2>
  <div id="cust-balance" data-balance="670">670</div>
  <ul id="entries"><!-- newest first -->
    <li data-entry-id="e7">
      <span class="type">payment</span>
      <span class="amount">1500</span>
      <span class="date">2026-10-25</span>
      <span class="note">paid on UPI</span>
      <img data-shot src="data:image/jpeg;base64,..." alt="Payment screenshot">
    </li>
  </ul>
</section>

<!-- Payment form (shot input ALWAYS rendered) -->
<form id="entry-form">
  <select id="entry-type"><option value="credit">Credit</option><option value="payment">Payment</option></select>
  <input id="entry-amount" inputmode="numeric">
  <input id="entry-date" type="date">
  <input id="entry-note">
  <input id="shot-input" type="file" accept="image/*">
  <button id="entry-save" type="submit">Save</button>
</form>
```

**Non-negotiables**

- `id="total-outstanding"` text is exactly the number (no `Rs`, no commas) — the spec *allows* `Rs 11,820`, but bare digits make every possible regex succeed. Format for humans in a sibling.
- `[data-balance]` inside each `[data-customer]` row; put the value both in the attribute and as bare text.
- `a[data-remind="<phone>"]` href is exactly `https://wa.me/91<phone>?text=<encoded>`; message contains name + balance.
- `#shot-input` is a real `input[type=file]` present in the DOM at load — not created on click.
- Exactly one `[data-customer]` per phone (dedupe).
- Every required node exists before any data is loaded (empty state renders the containers).

---

## 3. Data model and algorithms

Store one object under one key, e.g. `hisaab.v1`:

```js
{ shop: "...", customers: [{ name, phone }], entries: [{ id, phone, type, amount, date, note, shot? }] }
```

- **Balance(phone)** = Σ credit − Σ payment, signed integer. Never store derived values.
- **Total outstanding** = Σ balance over all customers (the literal formula; matches sample: 11820). Note the ambiguity: if hidden data contains an overpayment (negative balance), "outstanding" could mean "sum of positives only". The literal instruction ("all credit minus all payments" … "the shop's total outstanding") supports the net sum, and the sample expected file gives `balances` as signed numbers. **Decision: net sum. Document it in the judges' note.** (Second-order: this only matters if they inject an overpay; state the choice instead of guessing silently.)
- **Ordering:** entries sorted by `date` desc, tie-break by insertion index desc. `newest first` is checked.
- **Date:** ISO `YYYY-MM-DD` throughout, so string sort works. `?today=YYYY-MM-DD` overrides "today" everywhere; otherwise local date.
- **Import = full replace**, atomically: parse → validate → write state → re-render everything (including wiping previous rows and recalculating totals). **Never merge.** The tester may import twice in the same tab.
- **Normalisation on import** (this is where 60 marks are won or lost):
  - `amount`: accept number or string; strip `Rs`, spaces, commas; parse float; reject NaN → treat 0 but do not crash.
  - `type`: case-insensitive; `credit*`/`debit*`/`gave`/`udhaar` → credit; `payment*`/`paid*`/`received` → payment.
  - `date`: keep ISO; if missing, use `?today` or today; if unparseable, keep as-is.
  - customers: dedupe by phone (last name wins); coerce phone to string; strip spaces/dashes/`+91`.
  - entries for an unknown phone: auto-create `{name: "Customer <phone>", phone}` rather than dropping (never lose money rows).
  - customers with no entries: still render a row with balance `0`.
  - extra/unknown fields: ignored.
  - `entries`/`customers` missing or not arrays → empty; show `#import-msg` error, keep app alive.

---

## 4. Hidden-data edge-case matrix (assume they *will* try these)

| Case | Required behaviour | Why it matters |
|---|---|---|
| Customer with zero entries | row exists, `[data-balance]` = `0` | "one row per customer" |
| Overpayment → negative balance | render `-250`; include in net total | literal formula |
| Two customers, same name | two rows, distinct phones | keyed by phone |
| Duplicate phone in `customers` | one row | "one row per customer" |
| Entry for unknown phone | auto-created customer | no data loss |
| `amount` as `"1,500"` / `"Rs 1500"` | parses to 1500 | coercion |
| `type` as `CREDIT` / `Credit` | credit | case-insensitive |
| Same-date entries | stable order, no drops | sort tie-break |
| Future-dated entry | still counts in balance; date-dependent features use `?today` | determinism |
| Empty `note` | renders blank, no "undefined" | robustness |
| Large numbers (`250000`) | exact digits, no abbreviation, no `1.2k` | machine reading |
| Unicode names (Telugu/Hindi) | render fine | realistic data |
| `entries: []` | total `0`, rows with 0 | empty-state correctness |
| Malformed JSON | error message, previous state intact | no white screen |
| Import twice | second dataset fully replaces first | the classic killer |
| Reload after import | same totals | persistence |
| `?today=2026-11-15` | overdue/days-since use that date | bonus correctness |
| 3 MB screenshot | downscaled, saved, `img[data-shot]` appears | quota |

**Second/third-order:** the tester may import, reload, re-import, then check `#total-outstanding` — so totals must be recomputed from state on every render, never cached. It may also check `document.querySelectorAll('[data-customer]').length === customers.length`; conditional rendering (e.g. only customers with balance) would fail that.

---

## 5. Bonus menu — build all 7 (only 6 count, so one may fail harmlessly)

| Item | Implementation | Likely check | Trap |
|---|---|---|---|
| Overdue list sorted by days since last payment | Section labelled **Overdue**, rows show customer + `N days`, sorted desc, `balance > 0`, last **payment** date (not last entry) | Text order / day numbers | Threshold undefined — use 30+ days and say so in the label ("Overdue (30+ days)") |
| Edit & delete entry, balances recalculated | Inline edit + delete on each `li`; recompute total and row | Click, change amount, read totals | Must persist; must not break `data-entry-id` |
| CSV export matching data | Button downloads `customers.csv` and `entries.csv` via Blob | Download event / file content | Export the *current imported* shop, not the sample |
| Search by name or phone | `input#search`, filters rows live (substring, case-insensitive) | Type, count rows | Must not delete rows from state; filter render only |
| UPI pay link in reminder | Visible `a[href^="upi://pay?pa="]` with `am=<balance>` | href regex | Add `cu=INR`, encode name |
| Hindi or Telugu labels | Language switch EN / हिंदी / తెలుగు, i18n map, **ids unchanged** | Switch, check labels | Never translate machine values |
| OCR amount from payment screenshot | Tesseract.js on upload → prefill amount; graceful fallback + manual entry | Upload screenshot with a number, check amount field | CDN failure must not break saving |

**Third-order on OCR:** if the tester uploads an unreadable image, OCR returns garbage. Never block save on OCR; always allow manual correction. Show the detected value in the field, not as the only source.

---

## 6. Phone + theme (10 marks, don't donate them)

- `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- No fixed pixel widths; `max-width:100%`, flex/grid wrap, `min-width:0` on flex children, `overflow-wrap:anywhere` on names/notes.
- Test `document.documentElement.scrollWidth <= 375` at 375×812 with the sample loaded **and** with a long unicode name/note.
- Tap targets ≥ 40 px; amounts/tables readable without zoom.
- Dark mode via `@media (prefers-color-scheme: dark)`; test contrast for text, borders, inputs, and the balance highlight. Also set `color-scheme: light dark`.
- No `overflow-x:hidden` as a substitute for real layout (masks the bug, fails `scrollWidth` checks anyway if content overflows).

---

## 7. Architecture

- **Stack:** plain HTML + CSS + vanilla JS, no build step, deployed static (Netlify/Vercel/GitHub Pages). Reason: no hydration delay, no synthetic-event quirks, no cold start, trivially inspectable.
- **Routing:** multi-page for the customer page (`/c/<phone>`) or hash routing — either is fine, but the list page must always render the contract. If using history routing, add host rewrites so `/c/...` works on direct load.
- **State:** single in-memory object mirrored to `localStorage` (+ `sessionStorage` fallback, + in-memory fallback if storage throws). Re-render from state on every mutation.
- **Images:** compress client-side to ≤800 px JPEG q0.7 before storing; catch `QuotaExceededError`, retry at q0.5, then show a warning while still saving the entry without the image.
- **No service worker** (or version it aggressively) so the tester never gets a stale build.
- **No auth, no cookie banner, no analytics blocking first paint.**

---

## 8. Replica tester (build before features)

A local script (Playwright or `puppeteer`) that does, in order:

1. Open the live/preview URL at 375×812 in a fresh context. Assert all contract selectors resolve within 1 s **before any interaction**.
2. Set `#total-outstanding` empty-state → `0`.
3. Fill `#import-box` with the **sample** JSON, click `#import-go`. Assert `#total-outstanding` text parses to `11820`, 8 `[data-customer]` rows, each `[data-balance]` matches expected, `top_defaulter` math.
4. Assert each `a[data-remind]` href matches `^https://wa\.me/91\d{10}\?text=` and decodes to contain the name and the balance.
5. Generate 200 random shops; for each: import via UI, compute expected independently in the test, compare total and per-phone balances. Include all rows of the matrix in §4.
6. Import twice in a row with different shops → only second shop's numbers remain.
7. Reload → numbers persist.
8. Upload a 3 MB PNG to `#shot-input`, save, assert `img[data-shot]` exists on the entry.
9. `?today=2026-11-15` → overdue days match expected.
10. Toggle dark mode, check computed colours/contrast; check `scrollWidth`.
11. Exercise each bonus item and record pass/fail.

If the harness passes, the real tester almost certainly passes. If it does not exist, we are guessing.

---

## 9. Build order (fits ~2 working days)

| Slot | Work | Exit test |
|---|---|---|
| 0 (2–3 h) | Static skeleton + all selectors + empty state; deploy | Harness step 1 passes on the live URL |
| 1 (4 h) | State, customers/entries CRUD, balances, total, customer page, persistence | Harness steps 2, 7 |
| 2 (3 h) | Import (replace + normalisation) | Harness steps 3, 5, 6 — the 60 marks |
| 3 (2 h) | WhatsApp reminders, screenshot upload/compression | Harness steps 4, 8 |
| 4 (4 h) | Bonus items (7) | Harness step 11 |
| 5 (2 h) | Responsive + dark mode polish, long-string tests | Harness steps 9, 10 |
| 6 (2 h) | 200-dataset fuzz, fix, re-run; write judges' note; submit | Full harness green |

**Submit as soon as step 5 is green; keep editing.**

---

## 10. Judges' note (paste into "Details for the judges")

```
Live link: <url>
Routes: / (list), /c/<phone> (customer page)
Import: paste any JSON in the sample shape into #import-box, press #import-go. Import replaces the shop.
Today override: add ?today=YYYY-MM-DD (e.g. /?today=2026-11-15) for date-dependent views.
Total outstanding is the signed sum of all customer balances; a negative balance is shown as an advance.
Overdue list uses 30+ days since the customer's last payment.
No login required. Tested at 375px and in dark mode.
```

---

## 11. If we lose, it will be because of one of these

1. Import merging instead of replacing on the second run.
2. `#total-outstanding` containing punctuation the tester's parser mishandles.
3. Dropping customers with zero entries or entries with unknown phones.
4. Contract nodes rendered by JS after a delay / only on the list page.
5. Money math in floats producing `670.0000000001`.
6. A screenshot upload that silently fails on quota.
7. Sideways scroll at 375 px from a table or an unbreakable name.
8. No harness → we never see any of the above before the grader does.

Money must be integer rupees: parse to integer, sum integers, render integers. No `toFixed`, no `Intl.NumberFormat` in machine nodes.

---

## 12. Plain-English glossary of the failure terms

### Import merging vs replacing
"Merge" means `state.customers = state.customers.concat(incoming.customers)`. Run the tester's flow: import the sample shop (11820), then import the hidden shop (say 9000). A merge leaves both shops in the app: 11820 + 9000 = 20820, twelve rows instead of eight, and the hidden run fails. "Replace" means the imported JSON becomes the whole state, so the second import shows exactly 9000 and exactly the hidden shop's rows. **Every import must wipe the previous shop first.**

### Commas / ₹ "inside machine nodes"
This is about the HTML you *render*, never about the JSON. JSON `"amount": 1500` is fine. The problem is what ends up inside `#total-outstanding` / `[data-balance]` after formatting for humans:

```html
<!-- tester's parser breaks on all three -->
<div id="total-outstanding">Rs 11,820</div>      → parseInt(...) = NaN
<div id="total-outstanding">1,26,000</div>       → /\d+/ first match = "1"
<div data-balance>₹1,26,000</div>                → same
<!-- safe -->
<div id="total-outstanding">126000</div>
<span data-balance="126000">126000</span>
```

The spec tolerates `Rs 11,820`, but we do not know which parser they use, so we remove the ambiguity: machine node = bare digits; a sibling element holds the pretty `Rs 1,26,000`. Note the "Indian grouping" trap even more: `1,26,000` is not `126,000`, so naive comma-stripping regexes also fail.

### Dropping zero-balance / unknown-phone rows
- **Zero balance:** the requirement is "one row per customer". If the code renders only customers with `balance > 0`, a customer whose credits equal payments disappears, and `[data-customer]` count no longer equals the customer count. Render every customer with `data-balance="0"`.
- **Unknown phone:** an entry can reference a phone that is not in `customers` (hidden data may include it). If the code drops those entries, the total is understated; if it drops the row, money vanishes. Auto-create a customer row instead. (The sample data has no such case — this is about the *hidden* data, which is explicitly "a different set of data".)

### Float money
If amounts are integers, plain JS numbers are exact up to 2^53, so the sample is safe. The risk is (a) decimal amounts (`12.50`), (b) dividing or applying percentages, (c) `parseFloat` + `toFixed` pipelines:

```js
0.1 + 0.2            // 0.30000000000000004
(1250.5 + 300.25)    // 1550.75 fine, but sums can drift
(670).toFixed(2)     // "670.00" → machine node no longer bare digits
```

Rule: parse to integer rupees (or paise) once, sum integers, render integers. No `toFixed`, no `Intl.NumberFormat`, no `%` in the machine path.

### Quota failure
`localStorage` allows roughly 5 MB per origin. A screenshot is stored as a base64 string, which is ~4/3 the file size (and browsers count storage in UTF-16 units), so a single 3 MB phone photo can consume most or all of the budget and `setItem` throws `QuotaExceededError`. If that throw is uncaught, the entry never saves and `img[data-shot]` never appears — the screenshot mark and possibly the entry are lost. Mitigation: downscale to ≤800 px JPEG q0.7 before storing (~60–120 KB), catch the error, retry at lower quality, and still save the entry if the image cannot be stored.

### Sideways scroll
At a 375 px viewport, any element wider than the screen makes the page scroll horizontally. The tester can detect it via `document.documentElement.scrollWidth > 375` (or by attempting a horizontal scroll), which fails the "works well on a phone" mark. Usual causes: a wide `<table>`, fixed `width: 400px`, a long unbroken note or name, an image without `max-width:100%`, and `width:100%` plus horizontal padding without `box-sizing:border-box`. Mitigation: `max-width:100%`, flex/grid with `min-width:0`, `overflow-wrap:anywhere`, and test with long unicode names.
