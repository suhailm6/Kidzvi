/**
 * @file User.js
 * @description Mongoose model for platform users (Parents and Admins).
 * Includes password hashing on save and comparison method.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters."],
    },
    role: {
      type: String,
      enum: {
        values: ["PARENT", "ADMIN"],
        message: "Role must be either PARENT or ADMIN.",
      },
      default: "PARENT",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: Hash password before saving if it has been modified.
 * Uses bcryptjs with 12 salt rounds for strong security.
 */
userSchema.pre("save", async function (next) {
  // Only hash if the password field was modified
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method: Compare a candidate password against the stored hash.
 * @param {string} candidatePassword - Plain-text password to verify.
 * @returns {Promise<boolean>} True if passwords match.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Override toJSON to exclude the password field from API responses.
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
