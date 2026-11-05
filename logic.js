/**
 * Expense-Tracker — pure calculation logic.
 *
 * This file contains every calculation the app performs, kept separate
 * from the DOM and from localStorage so it can be unit-tested in Node
 * (see test/logic.test.js) and reused by other front-ends.
 *
 * A transaction is a plain object:
 *   { id, type: "income" | "expense", amount: number (> 0),
 *     category: string, date: "YYYY-MM-DD", note: string, payment: string }
 */
(function (global) {
  "use strict";

  var EXPENSE_CATEGORIES = [
    "Food", "Transport", "Rent", "Shopping", "Entertainment",
    "Education", "Health", "Bills", "Other"
  ];
  var INCOME_CATEGORIES = [
    "Pocket Money", "Salary", "Freelance", "Gift", "Other"
  ];
  var PAYMENT_MODES = ["Cash", "UPI", "Card", "Bank Transfer", "Other"];

  function isValidTransaction(t) {
    if (!t || typeof t !== "object") return false;
    if (t.type !== "income" && t.type !== "expense") return false;
    if (typeof t.amount !== "number" || !isFinite(t.amount) || t.amount <= 0) return false;
    if (typeof t.category !== "string" || t.category.trim() === "") return false;
    if (typeof t.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) return false;
    return true;
  }

  /** Sum income, expenses and the resulting balance for a list. */
  function totals(transactions) {
    var income = 0, expense = 0;
    (transactions || []).forEach(function (t) {
      if (!isValidTransaction(t)) return;
      if (t.type === "income") income += t.amount; else expense += t.amount;
    });
    return { income: round2(income), expense: round2(expense), balance: round2(income - expense) };
  }

  /** Keep only transactions whose date falls in "YYYY-MM". */
  function filterByMonth(transactions, month) {
    if (!month) return (transactions || []).slice();
    return (transactions || []).filter(function (t) {
      return isValidTransaction(t) && t.date.slice(0, 7) === month;
    });
  }

  /** Expense totals grouped by category, largest first. */
  function categoryBreakdown(transactions) {
    var byCategory = {};
    (transactions || []).forEach(function (t) {
      if (!isValidTransaction(t) || t.type !== "expense") return;
      byCategory[t.category] = round2((byCategory[t.category] || 0) + t.amount);
    });
    return Object.keys(byCategory)
      .map(function (category) { return { category: category, amount: byCategory[category] }; })
      .sort(function (a, b) { return b.amount - a.amount; });
  }

  /**
   * Compare a month's spending with its budget.
   * Returns percent used and a status: "ok" (<80%), "warning" (80-100%),
   * "over" (>100%) or "no-budget" when no positive budget is set.
   */
  function budgetStatus(spent, budget) {
    if (typeof budget !== "number" || !(budget > 0)) {
      return { percent: 0, status: "no-budget", remaining: 0 };
    }
    var percent = Math.round((spent / budget) * 100);
    var status = percent > 100 ? "over" : percent >= 80 ? "warning" : "ok";
    return { percent: percent, status: status, remaining: round2(budget - spent) };
  }

  /** Savings rate as a percent of income: 0 when there is no income. */
  function savingsRate(transactions) {
    var t = totals(transactions);
    if (t.income <= 0) return 0;
    return Math.round((t.balance / t.income) * 100);
  }

  /** Convert transactions to CSV text (header + one row per transaction). */
  function toCSV(transactions) {
    var lines = ["date,type,category,amount,payment,note"];
    (transactions || []).forEach(function (t) {
      if (!isValidTransaction(t)) return;
      lines.push([t.date, t.type, csvCell(t.category), t.amount.toFixed(2),
        csvCell(t.payment || ""), csvCell(t.note || "")].join(","));
    });
    return lines.join("\n") + "\n";
  }

  function csvCell(value) {
    var s = String(value);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  var api = {
    EXPENSE_CATEGORIES: EXPENSE_CATEGORIES,
    INCOME_CATEGORIES: INCOME_CATEGORIES,
    PAYMENT_MODES: PAYMENT_MODES,
    isValidTransaction: isValidTransaction,
    totals: totals,
    filterByMonth: filterByMonth,
    categoryBreakdown: categoryBreakdown,
    budgetStatus: budgetStatus,
    savingsRate: savingsRate,
    toCSV: toCSV
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.ExpenseLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
