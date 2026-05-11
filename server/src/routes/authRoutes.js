/**
 * @file authRoutes.js
 * @description Routes for user authentication: register, login, profile, logout.
 */

const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const { register, login, googleLogin, getMe, logout } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

// ─── Validation Rules ──────────────────────────────────────────────────────────

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required."),
];

// ─── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Register a new parent account.
 */
router.post("/register", registerValidation, validateRequest, register);

/**
 * POST /api/auth/login
 * Authenticate and receive a JWT token.
 */
router.post("/login", loginValidation, validateRequest, login);

/**
 * POST /api/auth/google
 * Authenticate/register via Google Identity Services ID token.
 */
router.post("/google", body("credential").notEmpty().withMessage("Google credential is required."), validateRequest, googleLogin);

/**
 * GET /api/auth/me
 * Get the currently authenticated user's profile.
 */
router.get("/me", protect, getMe);

/**
 * POST /api/auth/logout
 * Acknowledge logout (JWT is stateless; client removes token).
 */
router.post("/logout", protect, logout);

module.exports = router;
