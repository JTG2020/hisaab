# TRACEABILITY — Hisaab

Version: 0.1-draft
Updated: 2026-11-17
Owner: Planner
Supersedes: none

Rules: every requirement ID from `PRD.md` appears exactly once. Every row has a phase before G0. Test IDs come from `docs/TEST-CASES.md` (Tester-owned); `TBD` is allowed only until that row's phase gate, and no `TBD` may remain at the final gate. Selectors must exist verbatim in `CONTRACT.md`.

| ID | Requirement (short) | Phase | Selector(s) | Test case(s) | Status |
|---|---|---|---|---|---|
| R1 | Add customer | P1 | `[data-customer]`, `[data-balance]` | TBD | planned |
| R2 | Add entry (credit/payment) | P1 | `[data-customer]`, `[data-balance]` | TBD | planned |
| R3 | Balances + total | P1, P2 | `#total-outstanding`, `[data-balance]` | TBD | planned |
| R4 | Customer page, newest first | P1 | `?customer=`, `[data-entry-id]` | TBD | planned |
| R5 | Payment screenshot | P3 | `#shot-input`, `img[data-shot]` | TBD | planned |
| R6 | WhatsApp reminder | P3 | `a[data-remind]` | TBD | planned |
| R7 | Persistence after reload | P1 | all rendered state | TBD | planned |
| R8 | Import JSON, replace | P2 | `#import-box`, `#import-go` | TBD | planned |
| R9 | 375 px layout | P5 | n/a (measurements) | TBD | planned |
| R10 | No AI / no network dependency | P0–P6 | n/a | TBD | planned |
| B1 | Overdue list | P4 | Overdue section | TBD | planned |
| B2 | Edit/delete with recalculation | P4 | `[data-entry-id]`, `#total-outstanding` | TBD | planned |
| B3 | CSV export | P4 | `#export-csv` | TBD | planned |
| B4 | Search | P4 | `#search` | TBD | planned |
| B5 | UPI link | P4 | `a[href^="upi://pay"]` | TBD | planned |
| B6 | Hindi/Telugu labels | P4 | language switch | TBD | planned |
| B7 | OCR amount | P4 | `#shot-input`, amount input | TBD | planned |
| N1 | Contract at first paint | P0 | all §1–§5 | TBD | planned |
| N2 | No sideways scroll | P5 | n/a | TBD | planned |
| N3 | Light/dark readable | P5 | n/a | TBD | planned |
| N4 | Integer money | P1–P2 | `#total-outstanding`, `[data-balance]` | TBD | planned |
| N5 | Storage failure degrades | P1 | all | TBD | planned |
| N6 | No console errors | P0–P6 | n/a | TBD | planned |

## Notes

- `?today` (CONTRACT §1.6) is cross-cutting: tested under R4/N-series and B1.
- Bonus IDs are capped at 6 countable; all 7 are implemented and traced anyway.
