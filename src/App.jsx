
import { useEffect, useState } from "react";
import "./App.css";

const categories = [
  "Food",
  "Transportation",
  "School Supplies",
  "Personal Needs",
  "Entertainment",
  "Others",
];

const colors = [
  "#3B82F6",
  "#F59E0B",
  "#10B981",
  "#A78BFA",
  "#F472B6",
  "#94A3B8",
];

function App() {
  // LOGIN INFORMATION
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("spendwiseLoggedIn") === "true"
  );

  const [loginName, setLoginName] = useState(
    () => localStorage.getItem("spendwiseName") || ""
  );

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // BUDGET
  const [budget, setBudget] = useState(() =>
    Number(localStorage.getItem("budget")) || 1000
  );

  // EXPENSES
  const [expenses, setExpenses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("expenses")) || [];
    } catch {
      return [];
    }
  });

  // FORM INFORMATION
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [editingId, setEditingId] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // SAVE DATA
  useEffect(() => {
    localStorage.setItem("budget", budget);
  }, [budget]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // SIGN IN
  const handleLogin = (e) => {
    e.preventDefault();

    if (
      !loginName.trim() ||
      !loginEmail.trim() ||
      !loginPassword.trim()
    ) {
      alert("Please complete all fields.");
      return;
    }

    localStorage.setItem("spendwiseLoggedIn", "true");
    localStorage.setItem("spendwiseName", loginName.trim());

    setLoginName(loginName.trim());
    setIsLoggedIn(true);
  };

  // LOG OUT
  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to log out?"
    );

    if (confirmLogout) {
      localStorage.removeItem("spendwiseLoggedIn");
      localStorage.removeItem("spendwiseName");

      setIsLoggedIn(false);
      setLoginName("");
      setLoginEmail("");
      setLoginPassword("");
      clearForm();
    }
  };

  // SIGN IN PAGE
  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-icon">💰</div>

          <h1>Welcome to SpendWise</h1>
          <p>Student Expense Tracker</p>

          <form onSubmit={handleLogin}>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />

            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>

          <span className="login-footer">
            Manage your money. Build better habits.
          </span>
        </div>
      </div>
    );
  }

  // MONEY FORMAT
  const money = (value) =>
    "₱" +
    value.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // TOTAL EXPENSES
  const totalExpenses = expenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const remaining = budget - totalExpenses;

  // MONTHLY SUMMARY
  const monthlyExpenses = expenses.filter(
    (item) => item.date.slice(0, 7) === selectedMonth
  );

  const monthlyTotal = monthlyExpenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  // PROGRESS
  const progress =
    budget > 0
      ? Math.min((totalExpenses / budget) * 100, 100)
      : 0;

  // CATEGORY SUMMARY
  const categoryTotals = categories.map((cat, index) => ({
    name: cat,
    total: expenses
      .filter((item) => item.category === cat)
      .reduce((sum, item) => sum + item.amount, 0),
    color: colors[index],
  }));

  const maxCategory = Math.max(
    ...categoryTotals.map((item) => item.total),
    1
  );

  const totalForChart = categoryTotals.reduce(
    (sum, item) => sum + item.total,
    0
  );

  // DONUT CHART
  const chartSegments = [];
  let currentAngle = 0;

  categoryTotals.forEach((item) => {
    if (item.total > 0) {
      const nextAngle =
        currentAngle + (item.total / totalForChart) * 360;

      chartSegments.push(
        `${item.color} ${currentAngle}deg ${nextAngle}deg`
      );

      currentAngle = nextAngle;
    }
  });

  const donutStyle = {
    background: chartSegments.length
      ? `conic-gradient(${chartSegments.join(", ")})`
      : "#E2E8F0",
  };

  // ADD OR UPDATE EXPENSE
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !amount || Number(amount) <= 0) {
      alert("Please enter a valid expense.");
      return;
    }

    const expenseData = {
      id: editingId || Date.now(),
      name: name.trim(),
      amount: Number(amount),
      category,
      date,
    };

    if (editingId) {
      setExpenses((old) =>
        old.map((item) =>
          item.id === editingId ? expenseData : item
        )
      );

      alert("Expense updated successfully!");
    } else {
      setExpenses((old) => [...old, expenseData]);
      alert("Expense added successfully!");
    }

    clearForm();
  };

  // CLEAR FORM
  const clearForm = () => {
    setName("");
    setAmount("");
    setCategory("Food");
    setDate(new Date().toISOString().split("T")[0]);
    setEditingId(null);
  };

  // EDIT EXPENSE
  const editExpense = (item) => {
    setName(item.name);
    setAmount(String(item.amount));
    setCategory(item.category);
    setDate(item.date);
    setEditingId(item.id);

    document.getElementById("expense-form")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // DELETE EXPENSE
  const deleteExpense = (id) => {
    if (
      window.confirm("Are you sure you want to delete this expense?")
    ) {
      setExpenses((old) => old.filter((item) => item.id !== id));

      if (editingId === id) {
        clearForm();
      }
    }
  };

  // FORMAT DATE
  const formatDate = (value) =>
    new Date(value + "T00:00:00").toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">💰</div>
          <div>
            <h2>SpendWise</h2>
            <span>STUDENT EDITION</span>
          </div>
        </div>

        <p className="menu-label">MAIN MENU</p>

        <a href="#dashboard" className="nav-link active">
          <span>▦</span> Dashboard
        </a>

        <a href="#expense-form" className="nav-link">
          <span>＋</span> Add Expense
        </a>

        <a href="#history" className="nav-link">
          <span>▤</span> Transactions
        </a>

        <a href="#reports" className="nav-link">
          <span>▥</span> Reports
        </a>

        {/* PROFILE AND LOGOUT */}
        <div className="sidebar-bottom">

          <div className="profile">
            <div className="avatar">
              {loginName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{loginName}</strong>
              <span>Student Account</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            ↪ Log Out
          </button>

          <p>Student Expense Tracker © 2026</p>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* HEADER */}
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {loginName}! Here's your financial overview.</p>
          </div>

          <div className="today">
            <span>📅</span>
            {new Date().toLocaleDateString("en-PH", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </header>

        {/* DASHBOARD */}
        <section id="dashboard">

          <div className="section-heading">
            <div>
              <h2>Financial Overview</h2>
              <p>Monitor your allowance and spending.</p>
            </div>
          </div>

          {/* BUDGET */}
          <div className="budget-box">
            <div>
              <span className="small-label">
                YOUR TOTAL BUDGET
              </span>
              <h2>Set your weekly or monthly allowance</h2>
            </div>

            <div className="budget-control">
              <span>₱</span>
              <input
                type="number"
                min="0"
                value={budget}
                onChange={(e) =>
                  setBudget(Math.max(0, Number(e.target.value)))
                }
              />
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="stats-grid">

            <div className="stat-card blue">
              <div className="stat-top">
                <span>Total Budget</span>
                <div className="stat-icon">💵</div>
              </div>
              <h2>{money(budget)}</h2>
              <p>Your available allowance</p>
            </div>

            <div className="stat-card red">
              <div className="stat-top">
                <span>Total Expenses</span>
                <div className="stat-icon">🛒</div>
              </div>
              <h2>{money(totalExpenses)}</h2>
              <p>All recorded expenses</p>
            </div>

            <div className="stat-card green">
              <div className="stat-top">
                <span>Remaining Balance</span>
                <div className="stat-icon">🐷</div>
              </div>
              <h2>{money(remaining)}</h2>
              <p>Money left in your budget</p>
            </div>

            <div className="stat-card orange">
              <div className="stat-top">
                <span>Transactions</span>
                <div className="stat-icon">🧾</div>
              </div>
              <h2>{expenses.length}</h2>
              <p>Total recorded expenses</p>
            </div>

          </div>

          {/* PROGRESS AND MONTHLY SUMMARY */}
          <div className="overview-grid">

            <div className="panel">
              <h3>Expense Overview</h3>
              <p className="panel-subtitle">
                How much of your budget have you used?
              </p>

              <div className="progress-info">
                <strong>{progress.toFixed(1)}%</strong>
                <span>{money(totalExpenses)} spent</span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="progress-footer">
                <span>Budget: {money(budget)}</span>
                <span>
                  {remaining < 0
                    ? "Over budget"
                    : money(Math.max(0, remaining)) + " left"}
                </span>
              </div>
            </div>

            <div className="panel monthly-panel">
              <h3>Monthly Summary</h3>
              <p className="panel-subtitle">
                Your spending for the selected month.
              </p>

              <input
                className="month-picker"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />

              <h2>{money(monthlyTotal)}</h2>
              <span className="monthly-note">
                {monthlyExpenses.length} expense record(s) this month
              </span>
            </div>

          </div>

          {/* CATEGORY CHART */}
          <div className="panel chart-panel" id="reports">
            <div className="panel-heading">
              <div>
                <h3>Expense by Category</h3>
                <p className="panel-subtitle">
                  See where your money goes.
                </p>
              </div>
              <span className="chart-total">
                {money(totalForChart)}
              </span>
            </div>

            <div className="chart-layout">
              <div className="donut-chart" style={donutStyle}>
                <div className="donut-center">
                  <strong>{expenses.length}</strong>
                  <span>Expenses</span>
                </div>
              </div>

              <div className="category-list">
                {categoryTotals.map((item) => (
                  <div className="category-item" key={item.name}>
                    <div className="category-info">
                      <span
                        className="legend-dot"
                        style={{ background: item.color }}
                      ></span>
                      <span>{item.name}</span>
                      <strong>{money(item.total)}</strong>
                    </div>

                    <div className="category-track">
                      <div
                        className="category-fill"
                        style={{
                          width: `${(item.total / maxCategory) * 100}%`,
                          background: item.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* ADD EXPENSE */}
        <section className="panel form-panel" id="expense-form">

          <div className="panel-heading">
            <div>
              <h3>{editingId ? "Edit Expense" : "Add New Expense"}</h3>
              <p className="panel-subtitle">
                {editingId
                  ? "Update your expense information."
                  : "Record your daily spending here."}
              </p>
            </div>
            <div className="form-icon">✏️</div>
          </div>

          <form onSubmit={handleSubmit} className="expense-form">

            <div className="form-group">
              <label>Expense Name</label>
              <input
                type="text"
                placeholder="Example: Lunch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Amount (₱)</label>
              <input
                type="number"
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button className="primary-button" type="submit">
                {editingId ? "✓ Update Expense" : "+ Add Expense"}
              </button>

              {editingId && (
                <button
                  className="cancel-button"
                  type="button"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>

          </form>
        </section>

        {/* TRANSACTION HISTORY */}
        <section className="panel history-panel" id="history">

          <div className="panel-heading">
            <div>
              <h3>Recent Transactions</h3>
              <p className="panel-subtitle">
                View, edit, and manage your expenses.
              </p>
            </div>
            <span className="record-count">
              {expenses.length} Records
            </span>
          </div>

          {expenses.length === 0 ? (
            <div className="empty">
              <div>🧾</div>
              <h3>No expenses yet</h3>
              <p>Add your first expense to see your records here.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Expense Name</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {[...expenses]
                    .sort((a, b) => b.id - a.id)
                    .map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                        <td>
                          <span className="table-category">
                            {item.category}
                          </span>
                        </td>
                        <td>{formatDate(item.date)}</td>
                        <td className="table-amount">
                          {money(item.amount)}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() => editExpense(item)}
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() => deleteExpense(item.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

        </section>

        {/* FOOTER */}
        <footer className="footer">
          <p>SpendWise – Student Expense Tracker © 2026</p>
          <span>Manage your money. Build better habits.</span>
        </footer>

      </main>
    </div>
  );
}

export default App;
                                    