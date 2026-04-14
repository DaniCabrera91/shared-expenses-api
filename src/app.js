const express = require("express");
const cors = require("cors");

const authRoutes = require("./auth/auth.routes");
const usersRoutes = require("./users/users.routes");
const groupsRoutes = require("./groups/groups.routes");
const expensesRoutes = require("./expenses/expenses.routes");

const errorHandler = require("./middlewares/error.middleware");

const app = express();

// 🔥 CORS (IMPORTANTE: antes de las rutas)
app.use(
  cors({
    origin: "http://localhost:5173", // frontend (Vite)
    credentials: true, // necesario para cookies (refresh token)
  }),
);

app.use(express.json());

// 🚀 Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/expenses", expensesRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ❌ Error handler (siempre al final)
app.use(errorHandler);

module.exports = app;
