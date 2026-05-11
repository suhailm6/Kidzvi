/**
 * @file approvalRoutes.js
 * @description Routes for parent approval of child activity submissions.
 */

const express = require("express");
const router = express.Router();

const {
  getPendingApprovals,
  approveActivity,
  rejectActivity,
} = require("../controllers/approvalController");

const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

// All approval routes require authentication and PARENT/ADMIN role
router.use(protect);
router.use(restrictTo("PARENT", "ADMIN"));

/**
 * GET /api/approvals/pending
 * Get all pending activity submissions for the parent's children.
 */
router.get("/pending", getPendingApprovals);

/**
 * PUT /api/approvals/activity/:completedActivityId/approve
 * Approve a submitted activity: award points and trigger badge engine.
 */
router.put("/activity/:completedActivityId/approve", approveActivity);

/**
 * PUT /api/approvals/activity/:completedActivityId/reject
 * Reject a submitted activity with optional feedback.
 */
router.put("/activity/:completedActivityId/reject", rejectActivity);

module.exports = router;
