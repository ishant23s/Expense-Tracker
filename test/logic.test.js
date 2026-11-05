/**
 * Unit tests for logic.js — no framework needed.
 * Run:  node test/logic.test.js
 */
"use strict";
const assert = require("assert");
const L = require("../logic.js");

const txs = [
  { id: "1", type: "income", amount: 8000, category: "Pocket Money", date: "2026-11-02", note: "Pocket money", payment: "Bank Transfer" },
  { id: "2", type: "expense", amount: 450, category: "Food", date: "2026-11-03", note: "Groceries", payment: "UPI" },
  { id: "3", type: "expense", amount: 120.5, category: "Transport", date: "2026-11-04", note: "Bus", payment: "Cash" },
  { id: "4", type: "expense", amount: 300, category: "Food", date: "2026-10-30", note: "Snacks (last month)", payment: "UPI" },
  { id: "5", type: "expense", amount: -50, category: "Food", date: "2026-11-05", note: "INVALID amount", payment: "UPI" }
];

// Validation: the negative-amount row must be rejected everywhere.
assert.strictEqual(L.isValidTransaction(txs[0]), true);
assert.strictEqual(L.isValidTransaction(txs[4]), false);
assert.strictEqual(L.isValidTransaction(null), false);
assert.strictEqual(L.isValidTransaction({ type: "expense", amount: 10, category: "Food", date: "03-11-2026" }), false);

// Totals: invalid rows are ignored.
assert.deepStrictEqual(L.totals(txs), { income: 8000, expense: 870.5, balance: 7129.5 });
assert.deepStrictEqual(L.totals([]), { income: 0, expense: 0, balance: 0 });

// Month filter
const nov = L.filterByMonth(txs, "2026-11");
assert.strictEqual(nov.length, 3);
assert.deepStrictEqual(L.totals(nov), { income: 8000, expense: 570.5, balance: 7429.5 });

// Category breakdown: expenses only, largest first, invalid rows ignored.
assert.deepStrictEqual(L.categoryBreakdown(txs), [
  { category: "Food", amount: 750 },
  { category: "Transport", amount: 120.5 }
]);

// Budget status thresholds
assert.strictEqual(L.budgetStatus(100, 0).status, "no-budget");
assert.strictEqual(L.budgetStatus(500, 1000).status, "ok");
assert.strictEqual(L.budgetStatus(850, 1000).status, "warning");
assert.strictEqual(L.budgetStatus(1200, 1000).status, "over");
assert.strictEqual(L.budgetStatus(1200, 1000).remaining, -200);

// Savings rate
assert.strictEqual(L.savingsRate(nov), 93); // 7429.5 / 8000 = 92.87% → 93
assert.strictEqual(L.savingsRate([]), 0);

// CSV: header + valid rows only, commas in notes are quoted.
const csv = L.toCSV([
  { id: "9", type: "expense", amount: 200, category: "Food", date: "2026-11-01", note: "Tea, coffee", payment: "Cash" }
]);
assert.ok(csv.startsWith("date,type,category,amount,payment,note\n"));
assert.ok(csv.includes('"Tea, coffee"'));

console.log("All logic tests passed.");
