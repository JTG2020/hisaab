# TEST-CASES — Hisaab

Version: 0.1-draft
Updated: 2026-11-17
Owner: Tester
Supersedes: none

Oracle rules: expected values come from `PRD.md`, `CONTRACT.md`, `sample-expected.json`, or an independent computation in the test. Never from `app/**`.

Conventions: `C-` contract, `U-` unit, `I-` integration, `E2E-Pn-` gate, `F-` fuzz, `N-` non-functional. Every case names its R-ID and the exact selector it reads.

## Seeded cases (Tester extends; keep IDs stable)

| ID | Layer | Req | Preconditions | Steps | Expected (exact) | Auto |
|---|---|---|---|---|---|---|
| C-01 | contract | N1 | empty storage | load `/` | `#total-outstanding` exists, text `0` | yes |
| C-02 | contract | N1 | empty storage | load `/` | `#import-box` and `#import-go` visible | yes |
| C-03 | contract | N1 | empty storage | load `/` | `#shot-input` exists in the payment form | yes |
| C-04 | contract | R3 | sample imported | read total | text matches `/^\d+$/`, value `11820` | yes |
| C-05 | contract | R3 | sample imported | count rows | exactly 8 `[data-customer]` | yes |
| C-06 | contract | R3 | sample imported | read each row | each `[data-balance]` text and attribute are bare integers matching `sample-expected.json` | yes |
| C-07 | contract | R6 | sample imported | read each reminder | href matches `^https://wa\.me/91<phone>\?text=`; decoded text contains name and balance digits | yes |
| C-08 | contract | R8 | sample imported | fill `#import-box`, click `#import-go` | rows and total reflect the pasted shop only | yes |
| U-01 | unit | R3 | — | sum `[{credit:250,payment:180}]` | balance `70`, integer | yes |
| U-02 | unit | R8 | — | parse `"Rs 1,500"`, `"1,500"`, `1500` | `1500` each | yes |
| U-03 | unit | R8 | — | parse type `CREDIT`, `Credit`, `credit` | all credit | yes |
| U-04 | unit | R4 | — | sort same-date entries | insertion order desc as tie-break | yes |
| I-01 | integration | R8 | sample imported | import a second different shop | no first-shop rows remain; total equals second shop | yes |
| I-02 | integration | R7 | entries exist | reload page | same rows, balances, total | yes |
| I-03 | integration | R5 | payment with image | save, reload | `img[data-shot]` exists on the entry | yes |
| E2E-P0-01 | e2e | N1 | empty storage | full page scan | every selector in `CONTRACT.md` §1–§5 resolves before interaction | yes |
| F-01 | fuzz | R3/R8 | generated shop | import and compare | total and all balances equal independent computation; row count equals customer count | yes |
| N-01 | non-functional | R9 | sample + long unicode | 375×812 | `document.documentElement.scrollWidth <= 375` | yes |
| N-02 | non-functional | N3 | dark scheme | load, read contrast | body text contrast ≥4.5:1; balance and chips readable | yes |
| N-03 | non-functional | R5 | 3 MB image | upload, save | entry saved; `img[data-shot]` present; entry retained on quota failure | yes |

## Case families to complete

1. **Contract** — every selector and every forbidden variation (formatted numbers, filtered rows, duplicate rows).
2. **Unit** — money parse/sum, type coercion, dedupe, sort, totals, `?today` parsing.
3. **Integration** — import replace, persistence, reminder href, screenshot lifecycle, quota degrade.
4. **E2E per phase** — the journeys in `IMPLEMENTATION-PLAN.md` §2.
5. **Fuzz** — 50 shops at P2, 200 at P6; hostile mixes: overpayment, zero balance, no entries, unknown phone, duplicate phone, string amounts, same dates, unicode, large values, empty arrays, malformed JSON.
6. **Non-functional** — 375 px, dark, long strings, quota, storage disabled, no network.

## Bug-derived regression cases

Add one per closed bug, named `REG-<bug id>`, derived from `PRD.md`/`CONTRACT.md`, never from the patch.
