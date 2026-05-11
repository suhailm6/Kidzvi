/**
 * @file authController.js
 * @description Handles user authentication: registration, login, and profile retrieval.
 * All passwords are hashed via the User model's pre-save hook.
 */

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new parent account
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // Only allow PARENT registration via public route (ADMIN created separately)
    const assignedRole = role === "ADMIN" ? "PARENT" : (role || "PARENT");

    // Create user — password hashed automatically via pre-save hook
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Account created successfully. Welcome to Kidzvi!",
      token,
      user, // password excluded via toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return a JWT token
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id, user.role);

    // Exclude password from response
    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: "Login successful. Welcome back!",
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get the currently authenticated user's profile
 * @access  Private (requires valid JWT)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by authMiddleware.protect
    res.status(200).json({
      success: true,
      user: req.user, // password excluded via toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (client-side token removal; server acknowledges)
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    // JWT is stateless — the client removes the token.
    // Future enhancement: maintain a token blacklist or use refresh tokens.
    res.status(200).json({
      success: true,
      message: "Logged out successfully. See you soon!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, logout };
