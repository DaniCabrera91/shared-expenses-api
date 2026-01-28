const express = require("express");
const app = express();

app.use(express.json());

// routes
app.use("/auth", require("./auth/auth.routes"));

module.exports = app;
