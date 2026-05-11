/**
 * @file Child.js
 * @description Mongoose model for child profiles linked to a parent user.
 * Tracks points, age group, and activation status.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const childSchema = new Schema(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Parent ID is required."],
    },
    name: {
      type: String,
      required: [true, "Child name is required."],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Child age is required."],
      min: [1, "Age must be at least 1."],
      max: [18, "Age must be 18 or below."],
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    points: {
      type: Number,
      default: 0,
      min: [0, "Points cannot be negative."],
    },
    ageGroup: {
      type: String,
      enum: {
        values: ["3-5", "6-8", "9-12"],
        message: "Age group must be one of: 3-5, 6-8, 9-12.",
      },
      required: [true, "Age group is required."],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient parent-based queries
childSchema.index({ parentId: 1, active: 1 });

const Child = mongoose.model("Child", childSchema);

module.exports = Child;
