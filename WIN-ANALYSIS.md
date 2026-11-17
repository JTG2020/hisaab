# Hisaab — Win Analysis

Written 2026-11-17. Deadline **Sun 22 Nov 2026, 10:00 am IST** (≈4.5 days).
Related: [`PROJECT.md`](PROJECT.md) (requirements) · [`WIN-PLAN.md`](WIN-PLAN.md) (execution) · [`DESIGN.md`](DESIGN.md) (UI/UX).

---

## 1. What this contest actually rewards

The page says it twice:

- "After the deadline, our **AI tester opens your live link and reads these exactly**. Copy them as they are."
- "A script or a screenshot check decides, **not taste**."

This is **not a design contest**. It is a **spec-compliance and edge-case contest** graded by an automated browser. Every mark is attached to a literal selector or a deterministic check.

Three consequences:

1. **The 60-mark hidden-data test is gated by selectors.** If `#total-outstanding`, `[data-customer]`, `[data-balance]`, `#import-box`/`#import-go`, `#shot-input`/`img[data-shot]`, or `a[data-remind]` are missing, misnamed, conditional, or rendered late, the tester reads nothing. That block is worth more than every bonus combined.
2. **Hidden data punishes memorisation.** Building the sample shop scores zero. A general ledger that survives hostile input scores 60.
3. **Bonus marks are mechanical and capped.** 5 each, max 6 of 7. Build all 7 and label them.

## 2. Score map

| Marks | Source | How awarded | Controllability |
|---|---|---|---|
| 60 | Hidden-data test | Script imports a different shop, reads the contract, compares numbers | High — pure engineering |
| 30 | Bonus menu | 5 per item, 6 count, script/screenshot | High — just build them |
| 10 | 375 px (5) + light/dark (5) | Scripted viewport/theme checks | High — free with discipline |
| Tie-break | Earlier submission | Timestamp | **Free — submit early, edit later** |

Target: **95+.** Below ~85 means a contract or hidden-data bug, not a visual shortfall.

## 3. Brutal truths

1. **The hidden-data test is the whole game.** 60 of 100 marks, and the selector contract is the door to them. Every hour spent on styling before the harness is green is an hour of risk.
2. **The field will cluster at the top.** Script grading means the leading submissions are near-identical on marks; the tie-break is the earlier timestamp. **A contract-complete submission at 20 Nov beats a perfect one at 22 Nov 09:55.**
3. **Cleverness loses to determinism.** `Intl.NumberFormat`, "smart" abbreviations (`1.2k`), merge-on-import, incremental totals — every convenience is a possible mismatch.
4. **The tester is a browser doing browser things.** It sets input values, uploads a file, clicks, reloads, maybe imports twice. Each is a failure mode to design around (see `WIN-PLAN.md` §4 and §12).
5. **No feedback loop.** "Nothing is graded now." Our only defence is a local replica of the grader plus fuzzing.
6. **The judges' note is a free channel.** Most people leave it blank. Use it for URLs, the `?today=` override, the overdue threshold, and the net-total choice.
7. **Free hosting is part of the submission.** A cold start, auth wall, cookie banner, or stale service worker is a zero.

## 4. Why we may not win

| # | Failure mode | Cost |
|---|---|---|
| 1 | Selector missing / renamed / conditional | 60 |
| 2 | Tester reads before first paint (SPA hydration) | 60 |
| 3 | Tester sets `#import-box.value` without events; app reads state | 60 |
| 4 | Import **merges** instead of **replaces** on the second run | 60 |
| 5 | Punctuation/commas/₹ inside `#total-outstanding` or `[data-balance]` | 60 |
| 6 | Zero-balance customers dropped; unknown-phone entries dropped | 60 partial |
| 7 | Float money (`670.0000000001`, `toFixed`) | 60 partial |
| 8 | Screenshot too large → `QuotaExceededError` → save lost | 5 + data loss |
| 9 | `?today=` ignored → overdue days wrong | 5 |
| 10 | Sideways scroll at 375 px / unreadable dark mode | 10 |
| 11 | `[data-customer]` count ≠ customer count (filtered rows) | 60 partial |
| 12 | Virtualised / paginated list: rows not in the DOM | 60 partial |
| 13 | No harness → none of the above seen before the grader | everything |

None of these requires insight. They require a checklist and a harness.

## 5. Strategy

**Principle: machine-first UI.** Critical nodes exist at first paint, contain bare values, never move, never hide behind modals.

Workstreams, in priority order:

1. **Contract skeleton (today).** Static page with every required selector wired to fake data. Verify with a script before any styling.
2. **Replica tester (today).** A Playwright script that imports JSON, reads the contract, reloads, re-imports, uploads a 3 MB image, checks 375 px and both themes.
3. **Core logic (Day 1–2).** Customers, entries, balances, integer money, persistence, import-with-replace and tolerant normalisation.
4. **Reminders + screenshots (Day 2).** Exact `wa.me/91<phone>?text=` format; client-side downscale before storing.
5. **All 7 bonus items (Day 2–3).** Visible and labelled.
6. **Fuzz (Day 3–4).** 200 randomised shops, zero mismatches.
7. **Submit early, iterate.** Publish and submit as soon as the harness is green.
8. **Buffer.** Nothing new after 21 Nov evening except bug fixes.

Fixed decisions:

- **Static, vanilla HTML/CSS/JS, no build step, no framework, no service worker.** No hydration delay, no synthetic-event quirks, no cold start.
- **Read values from the DOM at click time**, not component state.
- **Bare digits in machine nodes**; pretty formatting in a sibling element.
- **Integer rupees** end to end. No `toFixed`, no `toLocaleString` in the machine path.
- **Zero dependency on prior state**: empty state renders the full contract; import replaces.
- **Deploy on day 1** to shake out hosting and routing.

## 6. Definition of "ready to submit"

- Replica harness passes 100%, including 375 px and both colour schemes.
- 200 random datasets, zero mismatches; every row of the edge-case matrix exercised.
- Import twice in one tab replaces correctly; reload persists.
- 3 MB image uploads, saves, and renders `img[data-shot]` after downscale.
- `?today=2026-11-15` produces the expected overdue ordering.
- All bonus items reachable in ≤2 clicks.
- Fresh incognito: no auth, no banner, no console errors.
- Judges' note written; submission made and timestamp noted.

## 7. Judges' note

```
Live link: <url>
Routes: / (list), /c/<phone> (customer page)
Import: paste any JSON in the sample shape into #import-box, press #import-go. Import replaces the shop.
Today override: add ?today=YYYY-MM-DD (e.g. /?today=2026-11-15) for date-dependent views.
Total outstanding is the signed sum of all customer balances; a negative balance is shown as an advance.
Overdue list uses 30+ days since the customer's last payment.
No login required. Tested at 375px and in dark mode.
```
