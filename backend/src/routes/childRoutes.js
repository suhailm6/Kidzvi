/**
 * @file childRoutes.js
 * @description Routes for child-facing dashboard data.
 * Accessible by authenticated parents viewing their child's dashboard.
 */

const express = require("express");
const router = express.Router();

const { getChildDashboard } = require("../controllers/childController");
const { protect } = require("../middleware/authMiddleware");

// All child routes require authentication
router.use(protect);

/** GET /api/children/:childId/dashboard — Child's full dashboard */
router.get("/:childId/dashboard", getChildDashboard);

module.exports = router;
