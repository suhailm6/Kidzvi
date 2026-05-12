/**
 * @file app.js
 * @description Express application setup.
 * Configures all middleware (security, logging, CORS, rate limiting)
 * and mounts all API route handlers.
 */

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

// Route imports
const authRoutes = require("./routes/authRoutes");
const parentRoutes = require("./routes/parentRoutes");
const childRoutes = require("./routes/childRoutes");
const activityRoutes = require("./routes/activityRoutes");
const approvalRoutes = require("./routes/approvalRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Error middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// ─── App Instance ──────────────────────────────────────────────────────────────

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────

/**
 * Helmet: Sets various HTTP security headers.
 * Protects against well-known web vulnerabilities.
 */
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

/**
 * CORS: Allow requests from the configured client URL.
 * Supports credentials (Authorization headers) from the frontend.
 */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────

/**
 * Global rate limiter: 100 requests per 15 minutes per IP.
 * Protects against brute-force and DDoS attacks.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

/**
 * Auth-specific stricter rate limiter: 10 requests per 15 minutes.
 * Prevents brute-force login attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

app.use("/api", globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ─── Body Parsing ──────────────────────────────────────────────────────────────

/** Parse incoming JSON payloads (max 10mb for activity instructions) */
app.use(express.json({ limit: "10mb" }));

/** Parse URL-encoded form bodies */
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Request Logging ───────────────────────────────────────────────────────────

/**
 * Morgan: HTTP request logger.
 * Uses "dev" format in development, "combined" in production.
 */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev", { skip: (req) => req.path === "/performance" }));
} else {
  app.use(morgan("combined", { skip: (req) => req.path === "/performance" }));
}

// ─── Health Check ──────────────────────────────────────────────────────────────

/**
 * GET /health
 * Simple health check endpoint for monitoring and load balancers.
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    platform: "Kidzvi API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/performance", (req, res) => {
  res.status(204).end();
});

app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();

  return res.status(503).json({
    success: false,
    message: "Database unavailable. Check MongoDB connection settings and Atlas IP allowlist.",
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/children", childRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

// ─── API Root ──────────────────────────────────────────────────────────────────

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Kidzvi API 🎉",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      parents: "/api/parents",
      children: "/api/children",
      activities: "/api/activities",
      approvals: "/api/approvals",
      rewards: "/api/rewards",
      reports: "/api/reports",
      admin: "/api/admin",
    },
  });
});

// ─── Error Handlers ────────────────────────────────────────────────────────────

/** 404 handler — must be after all routes */
app.use(notFound);

/** Global error handler — must be last with 4 params */
app.use(errorHandler);

module.exports = app;
