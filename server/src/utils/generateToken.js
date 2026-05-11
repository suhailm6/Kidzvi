/**
 * @file generateToken.js
 * @description Utility to generate signed JWT tokens for authenticated users.
 */

const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT token.
 * @param {string} userId - The MongoDB ObjectId of the user.
 * @param {string} role - The role of the user (PARENT | ADMIN).
 * @returns {string} Signed JWT token.
 */
const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  return jwt.sign(
    {
      id: userId,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

module.exports = generateToken;
