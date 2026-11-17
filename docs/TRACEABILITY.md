# TRACEABILITY — Hisaab

Version: 1.2
Updated: 2026-11-17
Owner: Planner
Supersedes: TRACEABILITY.md v1.1

Rules: every requirement ID from `PRD.md` appears exactly once. Every row has a phase before G0. Selector strings appear verbatim in `CONTRACT.md`. Test case IDs come from `docs/TEST-CASES.md` v0.4 (Tester-owned); each cited case is executed at the phase gate named by that row and case, and the Status column stays `planned` until that gate runs. Every contract selector has at least one case in `TEST-CASES.md`; every test-case cell is filled.

Notation: `N6` is a **requirement ID, never a case ID**. The P0 console-clean oracle is `C-39`; the P6 full-journey oracle is `N-06`.

| ID | Requirement (short) | Phase | Selector(s) | Test case(s) | Status |
|---|---|---|---|---|---|
| R1 | Add customer | P1 | `[data-customer="<phone>"]`, `[data-balance]`, `#new-name`, `#new-phone`, `#add-customer` | C-24, C-31 | planned |
| R2 | Add entry (credit/payment) | P1 | `[data-customer="<phone>"]`, `[data-balance]`, `#entries`, `[data-entry-id]`, `[data-amount]`, `#entry-form`, `#entry-type`, `#entry-amount`, `#entry-date`, `#entry-note`, `#entry-save` | C-09, C-12, C-18, C-19, C-25, C-32, U-12 | planned |
| R3 | Balances and total | P1, P2 | `#total-outstanding`, `[data-balance]`, `#cust-balance` | C-04, C-05, C-06, C-10, C-24, U-01, U-05, U-08, F-01, F-02 | planned |
| R4 | Customer page, newest first | P1 | `#cust-name`, `#cust-balance`, `#entries`, `[data-entry-id]`, `[data-amount]`, `img[data-shot]`, `a[href="?customer=<phone>"]` | C-17, C-25, C-26, C-27, C-37, U-04, U-14, E2E-P0-02 | planned |
| R5 | Payment screenshot | P3 | `#shot-input`, `img[data-shot]`, `[data-entry-id]` | C-03, C-11, C-16, I-03, I-08, N-03 | planned |
| R6 | WhatsApp reminder | P3 | `a[data-remind="<phone>"]`, `[data-balance]` | C-07 | planned |
| R7 | Persistence after reload | P1 | `#total-outstanding`, `[data-customer="<phone>"]`, `[data-balance]`, `#entries` | I-02, I-09 | planned |
| R8 | Import JSON, replace | P2 | `#import-box`, `#import-go`, `#import-msg`, `#total-outstanding`, `[data-customer="<phone>"]`, `[data-balance]` | C-08, C-11, C-33, C-34, U-02, U-03, U-13, U-14, I-01, I-04, I-05, I-06, I-07, I-10, F-01, F-02 | planned |
| R9 | 375 px layout | P5 | `#total-outstanding`, `[data-customer="<phone>"]`, `[data-balance]`, `#import-box`, `#import-go`, `#shot-input` | C-20, N-01, N-04, E2E-P0-03 | planned |
| R10 | No AI, no network dependency | P0–P6 | all of `CONTRACT.md` §1–§5 | C-22, C-23, N-05, E2E-P0-03 | planned |
| B1 | Overdue list | P4 | `#overdue`, `[data-overdue="<phone>"]`, `[data-days]` | C-14, C-28 | planned |
| B2 | Edit/delete with recalculation | P4 | `[data-entry-id]`, `button[data-edit-entry]`, `button[data-delete-entry]`, `[data-amount]`, `#total-outstanding`, `[data-balance]` | C-36 | planned |
| B3 | CSV export | P4 | `#export-csv` | C-29 | planned |
| B4 | Search | P4 | `#search`, `[data-customer="<phone>"]` | C-30 | planned |
| B5 | UPI pay link | P4 | `a[href^="upi://pay?pa="]`, `[data-balance]` | C-35 | planned |
| B6 | Hindi/Telugu labels | P4 | `#lang-switch`, `#total-outstanding`, `[data-balance]` | C-13, N-06 | planned |
| B7 | OCR amount | P4 | `#shot-input`, `#entry-amount`, `#entry-save` | C-38 | planned |
| N1 | Contract at first paint | P0 | `#customers`, `[data-customer]`, all of `CONTRACT.md` §1–§5 | C-01, C-02, C-03, C-09, C-10, C-11, C-12, C-15, C-16, C-17, E2E-P0-01, E2E-P0-02 | planned |
| N2 | No sideways scroll | P5 | `#total-outstanding`, `[data-customer="<phone>"]`, `#import-box` | C-20, N-01, N-04, E2E-P0-03 | planned |
| N3 | Light/dark readable | P5 | `#total-outstanding`, `[data-balance]`, `#import-box` | C-21, N-02, E2E-P0-03 | planned |
| N4 | Exact money | P1–P2 | `#total-outstanding`, `[data-balance]`, `#cust-balance`, `[data-amount]` | C-10, U-05, U-06, U-07, U-08, U-09, U-10, U-11, F-02 | planned |
| N5 | Storage failure degrades | P1 | `#import-msg`, `#entries`, `#total-outstanding` | I-08, I-09 | planned |
| N6 | No console errors | P0–P6 | all of `CONTRACT.md` §1–§5 | C-39, C-17, C-18, C-19, E2E-P0-02, N-06 | planned |

## Notes

- `?today=` (`CONTRACT.md` §1.6) is cross-cutting: exercised by R2 (default entry date, C-18/C-19/U-12), R4 (customer view, E2E-P0-02), B1 (overdue days, C-28), and the N-series timing.
- `?customer=` (`CONTRACT.md` §1.7) is exercised by R4 (C-17, C-37, E2E-P0-02) and the P0 gate suite.
- Every contract selector is claimed above: form ids by R1/R2, import status by R8, customer-view and entry nodes by R4/B2, bonus hooks by B1–B7, machine nodes by R3/N4.
- P0 cases C-01–C-03 and C-09–C-23, plus C-39 and E2E-P0-01–03, run at G0. Cases C-24–C-38, U-05–U-14, I-04–I-10, F-01/F-02, N-01–N-04 and N-06 are planned oracles and run at their named phase gates; no P1/P2/P4/P5/P6 case is claimed as executed here.
