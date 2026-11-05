# Changelog

## v1.0.0 — 2026-11-05

First working release. The repository previously contained only a README
describing the idea; this release ships the actual app.

- Working expense tracker in plain HTML/CSS/JavaScript (no dependencies)
- Add, edit, delete and search transactions (income and expenses)
- Per-month budgets with progress bar and overspend warnings
- Monthly summaries: income, expenses, balance, savings rate
- Spending breakdown by category
- CSV export and one-click sample data
- Data stored locally in the browser only (localStorage)
- Calculation logic (`logic.js`) separated from the UI and covered by
  unit tests (`node test/logic.test.js`)
- MIT License and contribution guide added
