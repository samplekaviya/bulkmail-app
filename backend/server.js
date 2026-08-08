require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const mailRoutes = require("./routes/mailRoutes");

const app = express();

// ---- Middleware ----
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ---- Routes ----
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/mail", mailRoutes);

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// ---- Global error handler ----
app.use((err, req, res, next) => {
  console.error("[Unhandled Error]", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error.",
  });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
};

start();
