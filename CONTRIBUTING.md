# Contributing to Expense-Tracker

Thanks for your interest in improving Expense-Tracker! Contributions of all sizes are welcome — bug reports, documentation, and code.

## Getting started

1. Fork the repository and clone your fork.
2. There is no build step: open `index.html` in a browser, or run `python3 -m http.server 8000` and visit http://localhost:8000.
3. Run the tests before and after your change: `node test/logic.test.js`

## Ground rules

- **Keep it dependency-free.** The project intentionally uses plain HTML, CSS and JavaScript so anyone can run it anywhere. Please don't add frameworks or build tooling without discussing it in an issue first.
- **Calculations go in `logic.js`**, UI and storage go in `app.js`. New calculations should come with tests in `test/logic.test.js`.
- **Privacy first.** User data must never leave the browser. No analytics, no external requests.
- Keep changes small and focused, and describe what you changed and why in the pull request.

## Reporting bugs

Open an issue with: what you did, what you expected, what happened instead, and your browser. A screenshot helps.

## Ideas for contributions

- Import transactions from CSV
- Recurring transactions (rent, subscriptions)
- A simple monthly chart
- More currencies (the app is INR-first today)
- Accessibility improvements

By contributing, you agree your work is released under the project's MIT License.
