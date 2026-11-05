/**
 * Expense-Tracker — browser UI.
 * All calculations live in logic.js (window.ExpenseLogic).
 * All data lives in localStorage under two keys; nothing leaves the browser.
 */
(function () {
  "use strict";
  var L = window.ExpenseLogic;
  var TX_KEY = "expense-tracker.transactions.v1";
  var BUDGET_KEY = "expense-tracker.budgets.v1";

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    income: $("sum-income"), expense: $("sum-expense"), balance: $("sum-balance"),
    savings: $("sum-savings"), month: $("month-picker"),
    budgetInput: $("budget-input"), budgetSave: $("budget-save"),
    budgetBar: $("budget-bar"), budgetBarWrap: $("budget-bar-wrap"), budgetText: $("budget-text"),
    form: $("tx-form"), formTitle: $("form-title"), type: $("tx-type"),
    amount: $("tx-amount"), category: $("tx-category"), date: $("tx-date"),
    payment: $("tx-payment"), note: $("tx-note"), submit: $("tx-submit"),
    cancel: $("tx-cancel"), formError: $("form-error"),
    breakdown: $("breakdown"), breakdownEmpty: $("breakdown-empty"),
    search: $("tx-search"), body: $("tx-body"), empty: $("tx-empty"),
    exportBtn: $("export-csv"), sampleBtn: $("load-sample"), clearBtn: $("clear-all")
  };

  var state = { transactions: load(TX_KEY, []), budgets: load(BUDGET_KEY, {}), editingId: null };

  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function save() {
    localStorage.setItem(TX_KEY, JSON.stringify(state.transactions));
    localStorage.setItem(BUDGET_KEY, JSON.stringify(state.budgets));
  }
  function fmt(n) {
    return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }
  function currentMonth() { return els.month.value; }
  function today() { return new Date().toISOString().slice(0, 10); }

  function fillCategories() {
    var cats = els.type.value === "income" ? L.INCOME_CATEGORIES : L.EXPENSE_CATEGORIES;
    var previous = els.category.value;
    els.category.innerHTML = cats.map(function (c) {
      return '<option value="' + c + '">' + c + "</option>";
    }).join("");
    if (cats.indexOf(previous) >= 0) els.category.value = previous;
  }
  function fillPayments() {
    els.payment.innerHTML = L.PAYMENT_MODES.map(function (p) {
      return '<option value="' + p + '">' + p + "</option>";
    }).join("");
  }

  function render() {
    var monthTxs = L.filterByMonth(state.transactions, currentMonth());
    var t = L.totals(monthTxs);
    els.income.textContent = fmt(t.income);
    els.expense.textContent = fmt(t.expense);
    els.balance.textContent = fmt(t.balance);
    els.savings.textContent = L.savingsRate(monthTxs) + "%";

    // Budget
    var budget = state.budgets[currentMonth()] || 0;
    els.budgetInput.value = budget || "";
    var bs = L.budgetStatus(t.expense, budget);
    els.budgetBar.style.width = Math.min(bs.percent, 100) + "%";
    els.budgetBar.className = "progress-fill" + (bs.status === "warning" ? " warning" : bs.status === "over" ? " over" : "");
    els.budgetBarWrap.setAttribute("aria-valuenow", String(Math.min(bs.percent, 100)));
    els.budgetText.textContent = bs.status === "no-budget"
      ? "No budget set for this month yet."
      : "Spent " + fmt(t.expense) + " of " + fmt(budget) + " (" + bs.percent + "%). " +
        (bs.remaining >= 0 ? fmt(bs.remaining) + " left." : fmt(-bs.remaining) + " over budget.");

    // Breakdown
    var breakdown = L.categoryBreakdown(monthTxs);
    els.breakdownEmpty.style.display = breakdown.length ? "none" : "";
    els.breakdown.innerHTML = breakdown.map(function (row) {
      var pct = t.expense > 0 ? Math.round((row.amount / t.expense) * 100) : 0;
      return '<div class="breakdown-row"><div class="breakdown-head"><span>' + escapeHtml(row.category) +
        "</span><span>" + fmt(row.amount) + " · " + pct + '%</span></div>' +
        '<div class="breakdown-bar"><div class="breakdown-fill" style="width:' + pct + '%"></div></div></div>';
    }).join("");

    // Table (with search filter)
    var q = els.search.value.trim().toLowerCase();
    var rows = monthTxs.filter(function (tx) {
      return !q || (tx.note || "").toLowerCase().indexOf(q) >= 0 || tx.category.toLowerCase().indexOf(q) >= 0;
    }).sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    els.empty.style.display = rows.length ? "none" : "";
    els.body.innerHTML = rows.map(function (tx) {
      var sign = tx.type === "income" ? "+" : "−";
      return "<tr><td>" + tx.date + "</td><td>" + escapeHtml(tx.note || "—") + "</td><td>" +
        escapeHtml(tx.category) + "</td><td>" + escapeHtml(tx.payment || "") + '</td>' +
        '<td class="num amount-' + tx.type + '">' + sign + " " + fmt(tx.amount) + "</td>" +
        '<td class="row-actions"><button type="button" class="secondary" data-edit="' + tx.id + '">Edit</button>' +
        '<button type="button" class="secondary" data-delete="' + tx.id + '">Delete</button></td></tr>';
    }).join("");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function resetForm() {
    state.editingId = null;
    els.form.reset();
    els.date.value = today();
    fillCategories();
    els.formTitle.textContent = "Add a transaction";
    els.submit.textContent = "Add transaction";
    els.cancel.hidden = true;
    els.formError.hidden = true;
  }

  els.type.addEventListener("change", fillCategories);
  els.month.addEventListener("change", render);
  els.search.addEventListener("input", render);

  els.budgetSave.addEventListener("click", function () {
    var v = parseFloat(els.budgetInput.value);
    if (isFinite(v) && v > 0) state.budgets[currentMonth()] = v;
    else delete state.budgets[currentMonth()];
    save(); render();
  });

  els.form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var tx = {
      id: state.editingId || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
      type: els.type.value,
      amount: parseFloat(els.amount.value),
      category: els.category.value,
      date: els.date.value,
      payment: els.payment.value,
      note: els.note.value.trim()
    };
    if (!L.isValidTransaction(tx)) {
      els.formError.textContent = "Please check the amount, category and date.";
      els.formError.hidden = false;
      return;
    }
    if (state.editingId) {
      state.transactions = state.transactions.map(function (t) { return t.id === tx.id ? tx : t; });
    } else {
      state.transactions.push(tx);
    }
    save(); resetForm(); render();
  });

  els.cancel.addEventListener("click", resetForm);

  els.body.addEventListener("click", function (ev) {
    var editId = ev.target.getAttribute && ev.target.getAttribute("data-edit");
    var deleteId = ev.target.getAttribute && ev.target.getAttribute("data-delete");
    if (editId) {
      var tx = state.transactions.filter(function (t) { return t.id === editId; })[0];
      if (!tx) return;
      state.editingId = tx.id;
      els.type.value = tx.type; fillCategories();
      els.amount.value = tx.amount; els.category.value = tx.category;
      els.date.value = tx.date; els.payment.value = tx.payment || "Cash";
      els.note.value = tx.note || "";
      els.formTitle.textContent = "Edit transaction";
      els.submit.textContent = "Save changes";
      els.cancel.hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (deleteId) {
      state.transactions = state.transactions.filter(function (t) { return t.id !== deleteId; });
      if (state.editingId === deleteId) resetForm();
      save(); render();
    }
  });

  els.exportBtn.addEventListener("click", function () {
    var blob = new Blob([L.toCSV(state.transactions)], { type: "text/csv" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "expense-tracker-export.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  els.sampleBtn.addEventListener("click", function () {
    var m = currentMonth();
    var sample = [
      { type: "income", amount: 8000, category: "Pocket Money", note: "Monthly pocket money", payment: "Bank Transfer" },
      { type: "expense", amount: 450, category: "Food", note: "Groceries", payment: "UPI" },
      { type: "expense", amount: 120, category: "Transport", note: "Bus pass top-up", payment: "Cash" },
      { type: "expense", amount: 999, category: "Shopping", note: "Headphones", payment: "Card" },
      { type: "expense", amount: 300, category: "Entertainment", note: "Movie", payment: "UPI" }
    ].map(function (s, i) {
      s.id = "sample-" + Date.now().toString(36) + "-" + i;
      s.date = m + "-" + String(3 + i * 3).padStart(2, "0");
      return s;
    });
    state.transactions = state.transactions.concat(sample);
    if (!state.budgets[m]) state.budgets[m] = 6000;
    save(); render();
  });

  els.clearBtn.addEventListener("click", function () {
    if (!window.confirm("Delete ALL transactions and budgets stored in this browser? This cannot be undone.")) return;
    state.transactions = []; state.budgets = {};
    save(); resetForm(); render();
  });

  // Init
  els.month.value = today().slice(0, 7);
  els.date.value = today();
  fillPayments();
  fillCategories();
  render();
})();
