# Hisaab — UI/UX Direction

Written 2026-11-17. Companion to [`WIN-ANALYSIS.md`](WIN-ANALYSIS.md) and [`WIN-PLAN.md`](WIN-PLAN.md).

## 1. The honest verdict

We have enough information to build a genuinely good UI/UX. Nothing visual is missing from the brief; the brief simply does not prescribe it, because **design is not scored**:

- "Design, layout, extras and feel are yours to decide."
- "A script or a screenshot check decides, not taste."
- The only UX-adjacent marks are 10: no sideways scroll at 375 px (5) and readable light/dark (5).

So UI here is **reliability engineering plus restraint**. A beautiful interface that hides `#import-box`, virtualises the list, or paints the total after data loads loses 60 marks. A calm, plain interface that renders every selector at load, survives a phone, and reads well in both themes collects full marks — and can still look good.

Time allocation: **~20% of build time on visual polish, 0% before the harness is green.**

## 2. What "awesome" means here

The shop owner should feel *calm and in control in one screen*, one-handed, between customers. Zero learning curve. That is achievable without risky interaction models.

Non-negotiable constraints:

| Do not | Because |
|---|---|
| Render critical nodes only after data loads or route transitions | Tester reads at first paint |
| Put `#import-box` or `#shot-input` behind modals, tabs, or `<details>` | Playwright `fill`/`setInputFiles` needs a visible element |
| Virtualise or paginate the customer list | Rows missing from the DOM → count checks fail |
| Use custom date pickers/dropdowns for machine fields | Programmatic input breaks |
| Animate layout >200 ms on load, or gate content on animation end | Tester timeout |
| Format money inside machine nodes | See `WIN-PLAN.md` §12 |
| Use a table for the customer list at 375 px | Sideways scroll |
| Block first paint on a web font or CDN script | Cold start / flaky network |
| Hide the import result or error in a toast only | It must be readable text |

Everything else — typography, spacing, colour, hierarchy, iconography, microcopy, empty/error states — is free and worth doing well.

## 3. Design system

**Type & rhythm**
- System stack: `-apple-system, "Segoe UI", Roboto, "Noto Sans Telugu", "Noto Sans Devanagari", sans-serif`. No blocking web fonts.
- Sizes 12 / 14 / 16 / 20 / 28 / 40; line height 1.4–1.5.
- **Tabular numerals** (`font-variant-numeric: tabular-nums`) on every amount.
- Spacing 4 / 8 / 12 / 16 / 24 / 32; radius 10–14; one subtle shadow.
- Tap targets ≥44 px; 8 px minimum gap before destructive actions.

**Accessibility (also protects the 10 marks)**
- Contrast ≥4.5:1 body, ≥3:1 large text and UI borders.
- Visible 2 px focus ring; never `outline: none` without a replacement.
- Labels for every input, even if visually hidden.
- `aria-live="polite"` for import status and save confirmations.
- `color-scheme: light dark` plus a real `@media (prefers-color-scheme: dark)` block; test inputs, placeholders, disabled states, and photo thumbnails in both.

**Palette — "paper ledger"**
- Light: bg `#FBF8F3`, surface `#FFFFFF`, ink `#161310`, muted `#6B6259`, accent saffron `#B45309`, positive `#15803D`, negative `#B91C1C`.
- Dark: bg `#0F0D0B`, surface `#1A1714`, ink `#F5F0E8`, muted `#A99E90`, accent `#F59E0B`.
- Use green/red only for balance state, never decoratively.
- Hairline borders (`1px solid`) rather than heavy shadows, to keep the ledger feel.

**Components (build once)**
- Button primary/secondary/ghost/danger; icon button; segmented control.
- Input, textarea, date, file; inline label + error text.
- Card/row; balance chip; status pill (credit/payment); toast; empty state; skeleton.
- Sticky bottom action bar with safe-area padding.

## 4. Screens and UX

### 4.1 Home (customer list)
- Header: shop name (from imported data) + language switch.
- **Hero: total outstanding.** Big tabular digits; `#total-outstanding` bare, with a small `Rs` label above and a muted "pretty" line beside or below.
- Secondary line: "8 customers · 6 overdue".
- Overdue strip (30+ days): compact, tappable, sorted by days since last payment.
- `#search` directly under the hero.
- Rows: name (bold), phone (muted), balance right-aligned (muted green at 0, red when owed), last activity in words ("paid 21 days ago"), WhatsApp icon-button (`a[data-remind]`).
- Sticky bottom bar: **Add entry** primary, **Add customer** secondary.
- Data section at the bottom, always visible in the DOM: `#import-box`, `#import-go`, import message, CSV export, language.

### 4.2 Customer page
- Sticky header: name, phone, balance as hero.
- Actions: **WhatsApp reminder** primary, **UPI pay** secondary, edit/delete in an overflow menu.
- Entries timeline, newest first: type chip (Credit/Payment), signed amount, note, date, screenshot thumbnail (tap to enlarge), edit/delete inline.
- Empty state: "No entries yet — add the first one."

### 4.3 Add entry sheet
- Segmented Credit | Payment, default Credit.
- Amount first, large, `inputmode="numeric"`.
- Date defaults to today, or to `?today=` when present.
- Note optional with three quick suggestions ("groceries", "paid on UPI").
- Payment: `#shot-input` always visible, thumbnail preview, OCR prefill that never overwrites manual typing.
- Save returns to the customer with a toast and **Undo**.

### 4.4 Microcopy and states
- Empty list: "No customers yet. Add one, or import a shop file."
- Import success: "Loaded Lakshmi Provision Store — 8 customers, total Rs 11,820." (Uses the imported shop's numbers, which also proves replacement.)
- Import error: plain-language line; previous data untouched.
- Quota: "That photo is large; we saved the entry without it. Try a smaller photo."
- Delete: confirms with the customer/entry name, never a generic "Are you sure?".

## 5. Visual risks specific to Hisaab

- Long unicode names plus large amounts on one row → `min-width:0`, `overflow-wrap:anywhere`, balance on its own line under 400 px.
- Screenshot thumbnails fixed 64×64, `object-fit: cover`, hairline border for white photos, tap for full view.
- Dark mode: the paper metaphor must not become grey-on-grey; check amounts, chips, and muted text specifically.
- Big amounts (₹250,000) must not be abbreviated anywhere; machine nodes stay digits.
- The sticky bottom bar must not cover the last row or the import section (pad the scroll container).
- Loading a large imported shop (200 customers) must still render all rows, no pagination.

## 6. Decisions to document

| Question | Decision |
|---|---|
| Overdue threshold | 30+ days since last payment, stated in the section label |
| Total with overpayment | Signed net sum; negative shown as an advance |
| Currency display | `Rs` label separate from the machine digits |
| Language default | English; Hindi/Telugu switch |
| Import location | Visible section at the bottom of the list page, never a modal |
| Screenshot limit | 800 px, JPEG q0.7 |

## 7. Build sequence

1. **Contract skeleton + harness green** (see `WIN-PLAN.md` §9).
2. **Tokens and primitives** in one CSS file.
3. **Layout and hierarchy:** hero numbers, list density, sticky action, one-handed reach.
4. **States:** empty, loading ≤150 ms, error, success, quota, offline, long input, unicode.
5. **Polish:** inline SVG icons, microcopy, motion 120–160 ms on transform/opacity only, contrast audit, dark audit, 375 px audit with device emulation.
6. **Re-run the harness after every visual change.** Non-negotiable.

## 8. Bottom line

Design freedom is real, but the winning combination is specific: **an unglamorous, fast, phone-first ledger where every machine node is a first-class visible element, dressed with a small, consistent design system.** Spend the saved time on the hidden-data fuzzer; the script will never see a hero animation, and one broken selector erases more than any flourish earns.
