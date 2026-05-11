/**
 * @file adminRoutes.js
 * @description Routes for admin-only operations: user management,
 * activity administration, platform statistics, and data seeding.
 */

const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getPlatformReports,
  seedActivities,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

// All admin routes require authentication AND ADMIN role
router.use(protect);
router.use(restrictTo("ADMIN"));

// ─── User Management ───────────────────────────────────────────────────────────

/** GET /api/admin/users — List all platform users with pagination */
router.get("/users", getAllUsers);

// ─── Activity Administration ───────────────────────────────────────────────────

/** GET /api/admin/activities — List all activities (including inactive) */
router.get("/activities", getAllActivities);

/** POST /api/admin/activities — Create a new platform activity */
router.post("/activities", createActivity);

/** PUT /api/admin/activities/:id — Update any activity */
router.put("/activities/:id", updateActivity);

/** DELETE /api/admin/activities/:id — Delete or deactivate an activity */
router.delete("/activities/:id", deleteActivity);

// ─── Platform Reports ──────────────────────────────────────────────────────────

/** GET /api/admin/reports — Platform-wide statistics */
router.get("/reports", getPlatformReports);

// ─── Database Seeding ──────────────────────────────────────────────────────────

/**
 * POST /api/admin/seed/activities
 * Seeds the database with the 4 sample activities from the spec.
 * Safe to call multiple times — skips already existing activities.
 */
router.post("/seed/activities", seedActivities);

module.exports = router;
