/**
 * @file authMiddleware.js
 * @description JWT authentication middleware.
 * Verifies the Bearer token from the Authorization header,
 * decodes it, and attaches the user to req.user.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware: Protect routes by requiring a valid JWT.
 * Extracts token from "Authorization: Bearer <token>" header.
 * Attaches decoded user object to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided.",
      });
    }

    // Verify and decode the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the full user document (excluding password via toJSON)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The user associated with this token no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired. Please log in again.",
      });
    }

    next(error);
  }
};

module.exports = { protect };
