const express = require("express");
const authRoutes = require("./auth/auth.routes");
const usersRoutes = require("./users/users.routes");
const groupsRoutes = require("./groups/groups.routes");
const expensesRoutes = require("./expenses/expenses.routes");

const errorHandler = require("./middlewares/error.middleware");

const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/users", usersRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/expenses", expensesRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handler (DEBE ser último)
app.use(errorHandler);

module.exports = app;
