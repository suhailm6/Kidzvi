/**
 * @file validateRequest.js
 * @description Middleware to collect and return express-validator errors
 * in a consistent JSON format. Should be placed after validation rule chains.
 */

const { validationResult } = require("express-validator");

/**
 * Middleware: Check for express-validator errors and return 422 if any exist.
 * Place this after your validation rule arrays in route definitions.
 *
 * @example
 * router.post(
 *   "/register",
 *   [body("email").isEmail(), body("password").isLength({ min: 6 })],
 *   validateRequest,
 *   authController.register
 * );
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed. Please check the provided data.",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

module.exports = validateRequest;
