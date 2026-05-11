/**
 * @file activityRoutes.js
 * @description Routes for managing activities: library CRUD, assignment, and submission.
 *
 * IMPORTANT: Specific routes (assign, child/:childId) MUST be defined BEFORE
 * the generic /:id route to avoid route parameter conflicts in Express.
 */

const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();

const {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  assignActivity,
  getAssignedActivities,
  submitActivity,
} = require("../controllers/activityController");

const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

// All activity routes require authentication
router.use(protect);

// ─── Validation Rules ──────────────────────────────────────────────────────────

const createActivityValidation = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("category")
    .isIn([
      "LANGUAGE", "MATH_LOGIC", "CREATIVITY", "MEMORY",
      "EMOTIONAL_INTELLIGENCE", "PHYSICAL_ACTIVITY", "RESPONSIBILITY",
      "FAMILY_BONDING", "GENERAL_LEARNING",
    ])
    .withMessage("Invalid category."),
  body("ageGroup")
    .isIn(["3-5", "6-8", "9-12"])
    .withMessage("Age group must be one of: 3-5, 6-8, 9-12."),
  body("durationMinutes")
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 minute."),
  body("points")
    .isInt({ min: 0 })
    .withMessage("Points must be a non-negative number."),
  body("instructions").trim().notEmpty().withMessage("Instructions are required."),
  body("developmentGoal").trim().notEmpty().withMessage("Development goal is required."),
];

const assignActivityValidation = [
  body("childId").notEmpty().withMessage("Child ID is required."),
  body("activityId").notEmpty().withMessage("Activity ID is required."),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO 8601 date."),
];

// ─── Specific Routes (must come BEFORE /:id) ───────────────────────────────────

/** POST /api/activities/assign — Assign an activity to a child */
router.post(
  "/assign",
  restrictTo("PARENT", "ADMIN"),
  assignActivityValidation,
  validateRequest,
  assignActivity
);

/** GET /api/activities/child/:childId — Get assigned activities for a child */
router.get("/child/:childId", restrictTo("PARENT", "ADMIN"), getAssignedActivities);

/** POST /api/activities/:assignedActivityId/submit — Submit activity completion */
router.post("/:assignedActivityId/submit", restrictTo("PARENT", "ADMIN"), submitActivity);

// ─── Library CRUD ──────────────────────────────────────────────────────────────

/** GET /api/activities — List activities with filters */
router.get("/", getActivities);

/** GET /api/activities/:id — Get single activity */
router.get("/:id", getActivity);

/** POST /api/activities — Create a new activity */
router.post(
  "/",
  restrictTo("PARENT", "ADMIN"),
  createActivityValidation,
  validateRequest,
  createActivity
);

/** PUT /api/activities/:id — Update an activity */
router.put("/:id", restrictTo("PARENT", "ADMIN"), updateActivity);

/** DELETE /api/activities/:id — Deactivate an activity */
router.delete("/:id", restrictTo("PARENT", "ADMIN"), deleteActivity);

module.exports = router;
