require("dotenv").config();
const express = require("express");
const userRoutes = require("./users/users.routes");

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
