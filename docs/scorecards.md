# SCORECARDS — Hisaab

Version: 0.1
Updated: 2026-11-17
Owner: Critic
Supersedes: none

Append-only, one entry per gate. Evidence only; no encouragement.

## Rubric reminder

| Block | Marks |
|---|---|
| Hidden-data model | 60 |
| Bonus (5 each, 6 count) | 30 |
| 375 px (5) + light/dark (5) | 10 |

Gate thresholds: G0 contract 100% + docs in sync + smoke green; phase gates 100% acceptance and regression, no P0/P1, score not lower than previous; final ≥95, zero P0/P1.

## Entry template

```
### GATE <Gn> | <YYYY-MM-DD> | phase <Pn>
Build: <timestamp/zip>
Runs cited: RUN-<n>, CRITIC-RUN-<n>
Hidden-data: <x>/60 | Bonus: <x>/30 (B1 5, B2 0, ...) | Phone/theme: <x>/10
MODEL SCORE: <x>/100
Deductions:
- D1 <what> — <marks> — <evidence>
Contract audit: <n>/<total>
Doc sync: PASS/FAIL — <output>
Vercel readiness: PASS/FAIL — <notes>
Score risks: <WIN-ANALYSIS §4 item: PASS/RISK/FAIL>
Verdict: PASS | FAIL
Required before re-gate: <ordered list>
Confidence / unknown about the real tester: <lines>
```

## Scorecards

_None yet. The Critic adds G0 after the first full gate._
