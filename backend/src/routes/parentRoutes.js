/**
 * @file parentRoutes.js
 * @description Routes for parent operations: dashboard, child CRUD, reports, and settings.
 * All routes are protected and restricted to authenticated parents.
 */

const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  getDashboard,
  createChild,
  getChildren,
  getChild,
  updateChild,
  deactivateChild,
  getSettings,
  updateSettings,
  getChildReport,
} = require("../controllers/parentController");

const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

// All parent routes require authentication
router.use(protect);
router.use(restrictTo("PARENT", "ADMIN"));

// ─── Validation Rules ──────────────────────────────────────────────────────────

const createChildValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Child name is required.")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters."),
  body("age")
    .isInt({ min: 1, max: 18 })
    .withMessage("Age must be a number between 1 and 18."),
  body("ageGroup")
    .isIn(["3-5", "6-8", "9-12"])
    .withMessage("Age group must be one of: 3-5, 6-8, 9-12."),
];

const updateChildValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty.")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters."),
  body("age")
    .optional()
    .isInt({ min: 1, max: 18 })
    .withMessage("Age must be a number between 1 and 18."),
  body("ageGroup")
    .optional()
    .isIn(["3-5", "6-8", "9-12"])
    .withMessage("Age group must be one of: 3-5, 6-8, 9-12."),
];

// ─── Routes ────────────────────────────────────────────────────────────────────

/** GET /api/parents/dashboard — Parent dashboard stats */
router.get("/dashboard", getDashboard);

/** POST /api/parents/children — Create a child profile */
router.post("/children", createChildValidation, validateRequest, createChild);

/** GET /api/parents/children — List all children */
router.get("/children", getChildren);

/** GET /api/parents/children/:childId — Get single child */
router.get("/children/:childId", getChild);

/** PUT /api/parents/children/:childId — Update child profile */
router.put(
  "/children/:childId",
  updateChildValidation,
  validateRequest,
  updateChild,
);

/** DELETE /api/parents/children/:childId — Deactivate (soft-delete) child */
router.delete("/children/:childId", deactivateChild);

/** GET /api/parents/reports/:childId — Full child report */
router.get("/reports/:childId", getChildReport);

/** GET /api/parents/settings/:childId — Get parental control settings for a child */
router.get("/settings/:childId", getSettings);

/** PUT /api/parents/settings/:childId — Update parental control settings */
router.put("/settings/:childId", updateSettings);

module.exports = router;
