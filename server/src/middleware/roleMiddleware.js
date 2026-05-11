/**
 * @file roleMiddleware.js
 * @description Role-based access control (RBAC) middleware.
 * Must be used AFTER authMiddleware.protect since it depends on req.user.
 */

/**
 * Middleware factory: Restrict access to users with specific roles.
 * @param {...string} roles - Allowed roles (e.g., "ADMIN", "PARENT").
 * @returns {Function} Express middleware function.
 *
 * @example
 * // Allow only admins
 * router.get("/admin-only", protect, restrictTo("ADMIN"), handler);
 *
 * @example
 * // Allow both parents and admins
 * router.get("/shared", protect, restrictTo("PARENT", "ADMIN"), handler);
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route requires one of the following roles: ${roles.join(", ")}.`,
      });
    }

    next();
  };
};

module.exports = { restrictTo };
