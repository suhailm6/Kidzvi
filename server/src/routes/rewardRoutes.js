/**
 * @file rewardRoutes.js
 * @description Routes for reward management and claim lifecycle.
 *
 * IMPORTANT: Static sub-paths like /claims/pending MUST be defined BEFORE
 * dynamic routes like /:rewardId to prevent routing conflicts.
 */

const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  createReward,
  getParentRewards,
  getRewards,
  updateReward,
  deleteReward,
  claimReward,
  getPendingClaims,
  approveClaim,
  rejectClaim,
  completeClaim,
} = require("../controllers/rewardController");

const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

// All reward routes require authentication
router.use(protect);
router.use(restrictTo("PARENT", "ADMIN"));

// ─── Validation ────────────────────────────────────────────────────────────────

const createRewardValidation = [
  body("title").trim().notEmpty().withMessage("Reward title is required."),
  body("pointsRequired")
    .isInt({ min: 1 })
    .withMessage("Points required must be at least 1."),
  body("rewardType")
    .optional()
    .isIn(["FAMILY", "PHYSICAL", "CREATIVE", "TOY", "DIGITAL", "OTHER"])
    .withMessage("Invalid reward type."),
];

// ─── Static Routes (BEFORE dynamic /:rewardId) ────────────────────────────────

/** POST /api/rewards — Create a new reward */
router.post("/", createRewardValidation, validateRequest, createReward);

/** GET /api/rewards — Get all rewards owned by parent */
router.get("/", getParentRewards);

/**
 * GET /api/rewards/claims/pending — Get all pending reward claims.
 * Must be defined before /:rewardId to avoid conflict.
 */
router.get("/claims/pending", getPendingClaims);

/** PUT /api/rewards/claims/:claimId/approve — Approve a reward claim */
router.put("/claims/:claimId/approve", approveClaim);

/** PUT /api/rewards/claims/:claimId/reject — Reject a reward claim */
router.put("/claims/:claimId/reject", rejectClaim);

/** PUT /api/rewards/claims/:claimId/complete — Mark claim as fulfilled */
router.put("/claims/:claimId/complete", completeClaim);

// ─── Dynamic Routes ────────────────────────────────────────────────────────────

/** GET /api/rewards/:childId — Get rewards available for a child */
router.get("/:childId", getRewards);

/** PUT /api/rewards/:rewardId — Update a reward */
router.put("/:rewardId", updateReward);

/** DELETE /api/rewards/:rewardId — Deactivate a reward */
router.delete("/:rewardId", deleteReward);

/** POST /api/rewards/:rewardId/claim — Child claims a reward */
router.post("/:rewardId/claim", claimReward);

module.exports = router;
