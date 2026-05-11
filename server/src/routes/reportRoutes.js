/**
 * @file reportRoutes.js
 * @description Routes for child progress reports and analytics.
 * All endpoints enforce parent ownership of the requested child.
 */

const express = require("express");
const router = express.Router();

const {
  getSummary,
  getWeeklyReport,
  getCategoryDistribution,
  getRewardHistory,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

// All report routes require authentication
router.use(protect);
router.use(restrictTo("PARENT", "ADMIN"));

/** GET /api/reports/child/:childId/summary — Overall stats summary */
router.get("/child/:childId/summary", getSummary);

/** GET /api/reports/child/:childId/weekly — Last 7 days activity breakdown */
router.get("/child/:childId/weekly", getWeeklyReport);

/** GET /api/reports/child/:childId/category-distribution — Category usage breakdown */
router.get("/child/:childId/category-distribution", getCategoryDistribution);

/** GET /api/reports/child/:childId/rewards — Reward claim history */
router.get("/child/:childId/rewards", getRewardHistory);

module.exports = router;
