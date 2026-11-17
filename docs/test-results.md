# TEST RESULTS — Hisaab

Version: 0.1
Updated: 2026-11-17
Owner: Tester
Supersedes: none

Append-only. One entry per run. Never edit a past run; add a new one. Cite run IDs in `scorecards.md`.

## Entry template

```
### RUN-<n> | <YYYY-MM-DD HH:MM> | phase <Pn> | gate <Gn>
Command: <exact command(s)>
Environment: local http://localhost:4173, chromium <version>, viewport 1280×800 (unless stated)
Cases: <passed>/<total> | Failing: <ids>
Bugs filed: <BUG-n ...> | Bugs closed: <...>
Evidence: <short command output excerpt or screenshot path>
Verdict: PASS | FAIL
Notes: <regressions, flakiness, unmet R-IDs, deviations>
```

## Rules

- A run is valid only if the app was served from `app/` at the current working tree.
- Include the failing assertion text, not just the case ID.
- For fuzz runs, record the seed and the number of datasets.
- A gate verdict is FAIL if any P0/P1 is open or any phase gate case fails.

## Runs

_No runs yet. The Tester adds RUN-1 at gate G0._
