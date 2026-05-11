/**
 * @file errorMiddleware.js
 * @description Global error handling middleware for Express.
 * Catches all errors passed via next(error) and returns
 * structured JSON error responses with appropriate HTTP status codes.
 */

/**
 * Not Found Middleware (404 handler).
 * Called when no route matches the request.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global Error Handler Middleware.
 * Must have exactly 4 parameters for Express to recognize it as error middleware.
 *
 * Handles:
 * - Mongoose CastError (invalid ObjectId)
 * - Mongoose duplicate key errors
 * - Mongoose validation errors
 * - JWT errors
 * - Generic application errors
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = [];

  // Log error details in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.error("🔴 Error:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value} is not a valid ID.`;
  }

  // Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `Duplicate value: "${value}" already exists for field "${field}".`;
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = "Validation failed. Please check the provided data.";
    errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
  }

  // JWT errors are handled in authMiddleware, but catch here as fallback
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please log in again.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    // Only include stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
