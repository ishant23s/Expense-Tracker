# Expense-Tracker

A simple and user-friendly expense tracker to record income and expenses, categorize spending, monitor budgets, and understand monthly financial habits through clear summaries and insights.

Built for students and anyone whose income is **irregular** — pocket money, freelance payments, part-time work — rather than a fixed salary on a fixed date.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![No dependencies](https://img.shields.io/badge/dependencies-none-blue.svg)

## Features

- **Add, edit and delete transactions** — income or expense, with amount, category, date, payment mode (Cash / UPI / Card / Bank Transfer) and a note
- **Monthly view** — pick any month and see its income, expenses, balance and savings rate
- **Monthly budget** — set a budget per month, with a progress bar that warns at 80% and flags overspending
- **Spending by category** — Food, Transport, Rent, Shopping, Entertainment, Education, Health, Bills and more, ranked largest first
- **Search** transactions by note or category
- **Export to CSV** for use in a spreadsheet
- **Sample data** — one click loads demo transactions so you can see how everything works
- **Private by design** — no account, no server, no tracking. All data is stored only in your own browser (localStorage)

## Run it

No build step and no dependencies. Any of these works:

```bash
# Option 1: just open the file
open index.html            # macOS
xdg-open index.html        # Linux

# Option 2: serve the folder (recommended)
python3 -m http.server 8000
# then visit http://localhost:8000
```

You can also publish it free with GitHub Pages: Settings → Pages → deploy from the `main` branch.

## Run the tests

The calculation logic lives in `logic.js`, separate from the UI, and is unit-tested with plain Node (no test framework to install):

```bash
node test/logic.test.js
```

## Project structure

```
index.html        Page markup
styles.css        Styling (light + dark mode)
logic.js          Pure calculations: totals, month filter, category
                  breakdown, budget status, savings rate, CSV export.
                  Works in the browser and in Node for tests.
app.js            Browser UI: forms, rendering, localStorage
test/logic.test.js  Unit tests for logic.js
```

## Why this project?

Most budgeting apps assume a fixed monthly salary. Students and freelancers don't live like that — money arrives in irregular amounts, and the useful question is "what did I spend this month, on what, and am I inside the budget I set?" This tracker is deliberately small, free and open so anyone can use it, fork it and adapt it.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Good first areas: import from CSV, recurring transactions, and charts.

## License

[MIT](LICENSE) © Ishant Singh
