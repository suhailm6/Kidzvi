/**
 * @file server.js
 * @description Entry point for the Kidzvi backend server.
 * Loads environment variables, connects to MongoDB, then starts the Express server.
 * Handles graceful shutdown on SIGTERM and SIGINT signals.
 */

// Load environment variables FIRST before any other imports
require("dotenv").config();

const connectDB = require("./src/config/db");
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

/**
 * Bootstrap the server:
 * 1. Connect to MongoDB
 * 2. Start listening on the configured port
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start the HTTP server
    const server = app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════╗
║           🚀 Kidzvi API Server Started               ║
╠══════════════════════════════════════════════════════╣
║  Environment : ${(process.env.NODE_ENV || "development").padEnd(37)}║
║  Port        : ${String(PORT).padEnd(37)}║
║  API Base    : http://localhost:${PORT}/api${" ".repeat(20)}║
║  Health      : http://localhost:${PORT}/health${" ".repeat(16)}║
╚══════════════════════════════════════════════════════╝
      `);
    });

    // ─── Graceful Shutdown ──────────────────────────────────────────────────────

    /**
     * Gracefully shuts down the server on SIGTERM (e.g., from Docker/Kubernetes).
     */
    process.on("SIGTERM", () => {
      console.log("⚠️  SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("✅ HTTP server closed.");
        process.exit(0);
      });
    });

    /**
     * Gracefully shuts down the server on SIGINT (Ctrl+C in terminal).
     */
    process.on("SIGINT", () => {
      console.log("\n⚠️  SIGINT received. Shutting down gracefully...");
      server.close(() => {
        console.log("✅ HTTP server closed.");
        process.exit(0);
      });
    });

    /**
     * Handle unhandled promise rejections.
     * Logs the error and exits to prevent running in a degraded state.
     */
    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      server.close(() => {
        process.exit(1);
      });
    });

    /**
     * Handle uncaught synchronous exceptions.
     */
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error.message);
      console.error(error.stack);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
